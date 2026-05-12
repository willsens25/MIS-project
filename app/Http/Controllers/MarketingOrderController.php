<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderDetail;
use App\Models\Book;
use App\Models\Identitas;
use App\Models\Mutasi;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MarketingOrderController extends Controller
{
    /**
     * Menampilkan Form Input Pesanan & Daftar Invoice Belum Lunas
     */
    public function create()
    {
        $identitas = Identitas::orderBy('nama_lengkap', 'asc')->get();
        $books = Book::orderBy('judul', 'asc')->get();

        $invoices = Order::where(function($q) {
                $q->where('status', '!=', 'Lunas')
                  ->where('status', '!=', 'lunas')
                  ->orWhereNull('status');
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        return view('marketing.create_order', compact('identitas', 'books', 'invoices'));
    }

    /**
     * Menyimpan Data Pesanan Baru & Potong Stok Otomatis
     */
    public function store(Request $request)
    {
        // 1. Validasi Input Super Ketat
        $request->validate([
            'tanggal_pesan' => 'required|date',
            'nama_agen'     => 'required|string|exists:identitas,nama_lengkap',
            'via'           => 'required|string',
            'ekspedisi'     => 'required|string',
            'ongkir'        => 'required|numeric|min:0',
            'buku_id'       => 'required|array|min:1',
            'buku_id.*' => [
                'required',
                \Illuminate\Validation\Rule::exists(\App\Models\Book::class, 'id'),
            ],
            'qty'           => 'required|array|min:1',
            'qty.*'         => 'required|integer|min:1',
        ], [
            'nama_agen.exists'      => 'Nama agen/pembeli tidak ditemukan di sistem.',
            'via.required'          => 'Pilih sumber pesanan (WA/Shopee/dll).',
            'qty.*.min'             => 'Jumlah pesanan (QTY) minimal harus 1.',
            'buku_id.required'      => 'Minimal pilih satu buku.',
            'ongkir.numeric'        => 'Ongkir harus berupa angka.',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                // 2. Generate Nomor Invoice
                $tanggal = date('Ymd');
                $count = Order::whereDate('created_at', today())->count();
                $noInvoice = "INV-{$tanggal}-" . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

                // 3. Logika Penentuan Alamat
                $isSama = $request->has('sama_penerima');
                $namaPenerima = $isSama ? $request->nama_agen : ($request->nama_penerima ?? $request->nama_agen);

                $alamatFinal = $request->alamat_penerima;
                if ($isSama) {
                    $pembeli = Identitas::where('nama_lengkap', $request->nama_agen)->first();
                    $alamatFinal = $pembeli ? $pembeli->alamat : 'Alamat sesuai identitas';
                }

                // 4. Simpan Header Order
                $order = Order::create([
                    'no_invoice'        => $noInvoice,
                    'tanggal_pesan'     => $request->tanggal_pesan,
                    'via'               => $request->via,
                    'nama_pembeli'      => $request->nama_agen,
                    'nama_penerima'     => $namaPenerima,
                    'alamat_penerima'   => $alamatFinal,
                    'ekspedisi'         => $request->ekspedisi,
                    'ongkir'            => $request->ongkir ?? 0,
                    'status'            => 'Pending',
                    'total_tagihan'     => 0,
                ]);

                $totalSemuaBuku = 0;

                // 5. Simpan Detail Item & Potong Stok
                foreach ($request->buku_id as $key => $idBuku) {
                    if (!$idBuku) continue;

                    $book = Book::find($idBuku);
                    if (!$book) continue;

                    $jumlahPesanan = $request->qty[$key] ?? 1;

                    // --- LOGIKA CEK & POTONG STOK ---
                    if ($book->stok_gudang < $jumlahPesanan) {
                        throw new \Exception("Stok buku '{$book->judul}' tidak mencukupi. Sisa stok: {$book->stok_gudang}");
                    }
                    $book->decrement('stok_gudang', $jumlahPesanan);
                    // --------------------------------

                    $hargaSatuan = $book->harga_jual ?? 0;
                    $subtotal = $hargaSatuan * $jumlahPesanan;

                    OrderDetail::create([
                        'order_id'     => $order->id,
                        'buku_id'      => $idBuku,
                        'jumlah'       => $jumlahPesanan,
                        'harga_satuan' => $hargaSatuan,
                        'subtotal'     => $subtotal,
                    ]);

                    $totalSemuaBuku += $subtotal;
                }

                // 6. Update Total Akhir
                $order->update([
                    'total_tagihan' => $totalSemuaBuku + ($request->ongkir ?? 0)
                ]);

                return redirect()->back()->with('success', "Invoice #{$noInvoice} berhasil disimpan & stok dipotong!");
            });
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Gagal Simpan: ' . $e->getMessage());
        }
    }

    /**
     * Menandai Invoice Lunas & Otomatis Catat ke Finance
     */
    public function tandaiLunas($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $order = Order::findOrFail($id);

                $order->update([
                    'status' => 'Lunas',
                    'tercatat_finance' => 1
                ]);

                $category = Category::where('nama_kategori', 'like', '%Penjualan%')
                            ->orWhere('nama_kategori', 'like', '%Invoice%')
                            ->first();

                $account = Account::where('nama_akun', 'like', '%Kas%')->first() ?? Account::first();

                if (!$account) {
                    throw new \Exception("Akun Kas/Bank belum diatur di sistem Finance.");
                }

                Mutasi::create([
                    'account_id'  => $account->id,
                    'category_id' => $category->id ?? null,
                    'user_id'     => Auth::id(),
                    'tipe'        => 'Masuk',
                    'nominal'     => $order->total_tagihan,
                    'keterangan'  => 'Otomatis: Pelunasan #' . $order->no_invoice . ' (' . $order->nama_pembeli . ')',
                    'tanggal'     => now(),
                    'jenis'       => 'INVOICE',
                ]);

                return redirect()->back()->with('success', 'Invoice dilunasi & saldo kas bertambah!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses pelunasan: ' . $e->getMessage());
        }
    }

    public function hapusInvoice($id)
    {
    try {
        return DB::transaction(function () use ($id) {
            // 1. Cari data order beserta detailnya
            $order = Order::with('details')->findOrFail($id);

            // 2. Cegah penghapusan jika sudah Lunas (Opsional, demi keamanan keuangan)
            if ($order->status == 'Lunas') {
                throw new \Exception("Invoice yang sudah Lunas tidak boleh dihapus. Batalkan status lunas terlebih dahulu.");
            }

            // 3. Kembalikan Stok Buku
            foreach ($order->details as $detail) {
                // Cari buku terkait
                $book = Book::find($detail->buku_id);
                if ($book) {
                    // Tambahkan kembali stok yang tadinya dipotong
                    $book->increment('stok_gudang', $detail->jumlah);
                }
            }

            // 4. Hapus Detail dan Header (Gunakan cascade delete jika sudah disetting di migrasi,
            // jika belum, hapus manual detailnya dulu)
            $order->details()->delete();
            $order->delete();

            return redirect()->back()->with('success', 'Invoice dibatalkan & stok buku telah dikembalikan ke gudang!');
        });
    } catch (\Exception $e) {
        return redirect()->back()->with('error', 'Gagal menghapus: ' . $e->getMessage());
    }
    }

    public function printInvoice($id)
    {
        $order = Order::with(['details.book'])->findOrFail($id);

        return view('marketing.print_invoice', compact('order'));
    }
}
