<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Book;
use App\Models\Identitas;
use Illuminate\Support\Facades\DB;

class MarketingOrderController extends Controller
{
    /**
     * Menampilkan Form Input Pesanan & Daftar Invoice
     */
    public function create()
{
    $identitas = Identitas::all();
    $books = Book::all();

    // Ambil yang statusnya BUKAN Lunas
    $invoices = Order::where(function($q) {
            $q->where('status', '!=', 'Lunas')
              ->where('status', '!=', 'lunas') // Jaga-jaga kalau di db huruf kecil
            ->orWhereNull('status');
        })
        ->orderBy('updated_at', 'desc')
        ->get();

    return view('marketing.create_order', compact('identitas', 'books', 'invoices'));
}
    /**
     * Menyimpan Data Pesanan ke Database
     */
    public function store(Request $request)
{
    // 1. Validasi Data
    $request->validate([
        'tanggal_pesan' => 'required|date',
        'nama_agen'     => 'required|string',
        'buku_id'       => 'required|array',
        'qty'           => 'required|array',
        'ekspedisi'     => 'required',
        'ongkir'        => 'required|numeric',
        'via'           => 'required',
    ]);

    try {
        return DB::transaction(function () use ($request) {
            // 2. Buat Nomor Invoice Otomatis
            $tanggal = date('Ymd');
            $count = Order::whereDate('created_at', today())->count();
            $noInvoice = "INV-{$tanggal}-" . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

            // 3. Simpan Header Order
            // Kita pakai nama input 'sama_penerima' sesuai hasil dd() kamu tadi
            $order = Order::create([
                'no_invoice'        => $noInvoice,
                'tanggal_pesan'     => $request->tanggal_pesan,
                'via'               => $request->via,
                'nama_pembeli'      => $request->nama_agen,
                'nama_penerima'     => $request->has('sama_penerima') ? $request->nama_agen : ($request->nama_penerima ?? $request->nama_agen),
                'alamat_penerima'   => $request->has('sama_penerima') ? 'Alamat Sesuai Identitas' : ($request->alamat_penerima ?? 'Alamat Sesuai Identitas'),
                'ekspedisi'         => $request->ekspedisi,
                'ongkir'            => $request->ongkir ?? 0,
                'status'            => 'Pending',
                'total_tagihan'     => 0,
            ]);

            $totalSemuaBuku = 0;

            // 4. Simpan Detail Item
            foreach ($request->buku_id as $key => $idBuku) {
                if (!$idBuku) continue;

                $book = Book::find($idBuku);
                if (!$book) continue;

                $jumlahPesanan = $request->qty[$key] ?? 1;
                $hargaSatuan = $book->harga_jual ?? 0;
                $subtotal = $hargaSatuan * $jumlahPesanan;

                OrderDetail::create([
                    'order_id'     => $order->id,
                    'buku_id'      => $idBuku,
                    'jumlah'       => $jumlahPesanan,
                    'harga_satuan' => $hargaSatuan,
                    'subtotal'     => $subtotal,
                ]);

                // Update stok buku (opsional, hapus comment jika ingin stok berkurang)
                // $book->decrement('stok_gudang', $jumlahPesanan);

                $totalSemuaBuku += $subtotal;
            }

            // 5. Update Total Akhir
            $order->update([
                'total_tagihan' => $totalSemuaBuku + ($request->ongkir ?? 0)
            ]);

            return redirect()->route('marketing')->with('success', "Invoice #{$noInvoice} Berhasil Diterbitkan!");
        });
    } catch (\Exception $e) {
        // Jika error, kita kembalikan ke halaman sebelumnya dengan pesan error asli
        return redirect()->back()->withInput()->with('error', 'Gagal Simpan: ' . $e->getMessage());
    }
}

    /**
     * Fungsi Tombol Hijau (Lunas)
     */
    public function tandaiLunas($id)
{
    try {
        return DB::transaction(function () use ($id) {
            $order = Order::findOrFail($id);

            // 1. Update status di tabel Order
            $order->status = 'Lunas';
            $order->tercatat_finance = 1; // Langsung tandai sudah tercatat
            $order->save();

            // 2. Cari Kategori Pemasukan (Penjualan/Invoice)
            // Sesuaikan nama kategori dengan yang ada di tabel categories kamu
            $category = \App\Models\Category::where('nama_kategori', 'like', '%Penjualan%')
                        ->orWhere('nama_kategori', 'like', '%Invoice%')
                        ->first();

            // 3. Ambil Akun Kas Utama (Default)
            // Misalnya akun pertama atau akun dengan nama 'Kas'
            $account = \App\Models\Account::first();

            // 4. Buat Mutasi Otomatis ke Finance
            \App\Models\Mutasi::create([
                'account_id'  => $account->id ?? 1, // Pastikan ID akun tersedia
                'category_id' => $category->id ?? null,
                'user_id'     => auth()->id(),
                'tipe'        => 'Masuk',
                'nominal'     => $order->total_tagihan,
                'keterangan'  => 'Otomatis: Pembayaran #' . $order->no_invoice . ' (' . $order->nama_pembeli . ')',
                'tanggal'     => now(),
                'jenis'       => 'INVOICE',
            ]);

            return redirect()->back()->with('success', 'Invoice Lunas & Saldo Finance Bertambah!');
        });
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Gagal memproses: ' . $e->getMessage());
    }
}
    /**
     * Menghapus Invoice
     */
    public function hapusInvoice($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();

        return redirect()->back()->with('success', 'Pesanan berhasil dihapus!');
    }
}
