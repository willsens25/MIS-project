<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book; // Pastikan ini sesuai nama model kamu (Book atau Buku)
use App\Models\Invoice;
use App\Models\LogisticLog;
use App\Models\Mutasi;
use App\Models\Penyaluran;
use App\Models\Identitas;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MarketingController extends Controller
{
    public function index()
    {
        $books = Book::where('harga_jual', '>', 0)->get();
        $invoices = Invoice::with('book')->latest()->get();

        $stats = [
            'total_penjualan' => Invoice::where('status', 'Lunas')->sum('total_tagihan'),
            'piutang_pending' => Invoice::where('status', 'Pending')->sum('total_tagihan'),
            'jumlah_pending'  => Invoice::where('status', 'Pending')->count(),
            'buku_terlaris'   => Invoice::select('buku_id', DB::raw('SUM(jumlah) as total_qty'))
                                        ->groupBy('buku_id')
                                        ->orderBy('total_qty', 'desc')
                                        ->first()
        ];

        $identitas = Identitas::all();

        $jarkomStats = Identitas::select('jenis_umat', DB::raw('count(*) as total'))
                    ->groupBy('jenis_umat')
                    ->get();

        $securityStats = Identitas::select('status_keamanan', DB::raw('count(*) as total'))
                    ->groupBy('status_keamanan')
                    ->get();

        return view('dashboards.marketing', compact(
            'books', 'invoices', 'stats', 'identitas',
            'jarkomStats', 'securityStats'
        ));
    }

    public function kirimBuku(Request $request)
    {
        $request->validate([
            'buku_id' => 'required|exists:bukus,id',
            'jumlah' => 'required|integer|min:1',
            'nama_agen' => 'required'
        ]);

        $buku = Book::findOrFail($request->buku_id);

        if (!$buku->harga_jual || $buku->harga_jual <= 0) {
            return back()->with('error', 'Gagal! Harga jual belum disetting.');
        }

        if ($buku->stok_gudang < $request->jumlah) {
            return back()->with('error', 'Gagal! Stok gudang tidak mencukupi.');
        }

        $total = $buku->harga_jual * $request->jumlah;
        $noInv = 'INV-' . strtoupper(substr(uniqid(), 7));

        DB::transaction(function () use ($request, $buku, $total, $noInv) {
            // 1. Buat Invoice
            Invoice::create([
                'no_invoice' => $noInv,
                'buku_id' => $request->buku_id,
                'nama_agen' => $request->nama_agen,
                'jumlah' => $request->jumlah,
                'harga_satuan' => $buku->harga_jual,
                'total_tagihan' => $total,
                'status' => 'Pending',
                'status_pengiriman' => 'Packing'
            ]);

            // 2. Buat data penyaluran untuk Logistik
            Penyaluran::create([
                'no_invoice' => $noInv,
                'buku_id'    => $request->buku_id,
                'qty'        => $request->jumlah,
                'nama_agen'  => $request->nama_agen,
                'tujuan'     => $request->nama_agen,
                'tanggal'    => now()->toDateString(),
                'status'     => 'proses packing',
                'status_job' => 'S-SALUR',
            ]);

            // 3. Potong stok otomatis
            $buku->decrement('stok_gudang', $request->jumlah);
        });

        return redirect()->route('mad.create')->with('success', 'Pesanan berhasil disimpan!');
    }

    public function tandaiLunas($id)
    {
        $inv = Invoice::findOrFail($id);

        if ($inv->status == 'Lunas') {
            return back()->with('error', 'Invoice ini sudah lunas.');
        }

        try {
            DB::transaction(function () use ($inv) {
                // 1. Update status invoice
                $inv->update([
                    'status' => 'Lunas',
                    'tercatat_finance' => 1
                ]);

                // 2. OTOMATIS: Buat Mutasi Masuk untuk Bendahara
                Mutasi::create([
                    'account_id' => 1, // Default Kas Utama
                    'user_id'    => Auth::id(),
                    'tipe'       => 'Masuk',
                    'nominal'    => $inv->total_tagihan,
                    'keterangan' => 'Pelunasan Otomatis: ' . $inv->no_invoice . ' (' . $inv->nama_agen . ')',
                    'tanggal'    => now(),
                    'jenis'      => 'INVOICE',
                ]);
            });

            return back()->with('success', 'Pembayaran Lunas & Saldo Bendahara otomatis bertambah!');
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal memproses pelunasan: ' . $e->getMessage());
        }
    }

    public function hapusInvoice($id)
    {
        $inv = Invoice::findOrFail($id);

        DB::transaction(function () use ($inv) {
            $buku = Book::find($inv->buku_id);

            // Hapus penyaluran & Kembalikan stok
            Penyaluran::where('no_invoice', $inv->no_invoice)->delete();
            if ($buku) {
                $buku->increment('stok_gudang', $inv->jumlah);
            }

            // Hapus log logistik terkait
            LogisticLog::where('buku_id', $inv->buku_id)
                ->where('tujuan', $inv->nama_agen)
                ->delete();

            // Jika statusnya lunas, kita tidak menghapus mutasi (opsional, tergantung kebijakanmu)
            // Tapi invoice tetap dihapus
            $inv->delete();
        });

        return back()->with('success', 'Pesanan dibatalkan & stok dikembalikan.');
    }

    public function updateInvoice(Request $request, $id)
    {
        $inv = Invoice::findOrFail($id);
        $request->validate(['jumlah' => 'required|integer|min:1']);

        if ($inv->status == 'Lunas') {
            return back()->with('error', 'Invoice yang sudah lunas tidak bisa diedit jumlahnya.');
        }

        DB::transaction(function () use ($inv, $request) {
            $buku = Book::findOrFail($inv->buku_id);

            $selisih = $request->jumlah - $inv->jumlah;
            if ($buku->stok_gudang < $selisih) {
                throw new \Exception('Stok tidak mencukupi untuk update jumlah.');
            }

            $buku->decrement('stok_gudang', $selisih);

            $inv->update([
                'jumlah' => $request->jumlah,
                'total_tagihan' => $inv->harga_satuan * $request->jumlah
            ]);

            Penyaluran::where('no_invoice', $inv->no_invoice)->update([
                'qty' => $request->jumlah
            ]);
        });

        return back()->with('success', 'Jumlah pesanan & stok diperbarui!');
    }
}
