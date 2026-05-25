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
use App\Models\Penjualan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class MarketingOrderController extends Controller
{
    public function index(Request $request)
{
    // Ambil keyword pencarian atau filter status jika ada
    $search = $request->get('search');
    $status = $request->get('status');

    $orders = Order::query()
        ->when($search, function($query) use ($search) {
            $query->where('no_invoice', 'like', "%{$search}%")
                ->orWhere('nama_pembeli', 'like', "%{$search}%")
                ->orWhere('nama_penerima', 'like', "%{$search}%");
        })
        ->when($status, function($query) use ($status) {
            $query->where('status', $status);
        })
        ->orderBy('created_at', 'desc')
        ->paginate(15); // Menampilkan 15 data per halaman

    // --- LOGIKA UTAMA AJAX LIVE SEARCH ---
    // Jika request datang dari AJAX (JavaScript Fetch), kirimkan hanya isi baris tabelnya saja
    if ($request->ajax()) {
        return view('marketing.partials.order_table', compact('orders'))->render();
    }

    return view('marketing.index_order', compact('orders'));
}

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

                // --- LANGKAH PERLINDUNGAN AWAL: Cek ketersediaan seluruh stok terlebih dahulu ---
                foreach ($request->buku_id as $key => $idBuku) {
                    if (!$idBuku) continue;

                    // lockForUpdate() mencegah perubahan data stok dari kasir/marketing lain di detik yang sama
                    $book = Book::lockForUpdate()->find($idBuku);
                    $jumlahPesanan = $request->qty[$key] ?? 1;

                    if (!$book) {
                        throw new \Exception("Buku dengan ID tersebut tidak ditemukan.");
                    }

                    if ($book->stok_gudang < $jumlahPesanan) {
                        throw new \Exception("Stok buku '{$book->judul}' tidak mencukupi di database. Sisa stok riil: {$book->stok_gudang} pcs. Mohon sesuaikan kembali.");
                    }
                }

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

                // 5. Simpan Detail Item & Eksekusi Potong Stok
                foreach ($request->buku_id as $key => $idBuku) {
                    if (!$idBuku) continue;

                    $book = Book::find($idBuku);
                    $jumlahPesanan = $request->qty[$key] ?? 1;

                    // Eksekusi pemotongan karena validasi di atas sudah lolos sepenuhnya
                    $book->decrement('stok_gudang', $jumlahPesanan);

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
     * Menandai Invoice Lunas & Otomatis Sinkronisasi Penuh ke Dashboard Finance
     */
    public function tandaiLunas($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                // Ambil data order asli dari database
                $orderRaw = Order::findOrFail($id);

                if ($orderRaw->status == 'Lunas') {
                    throw new \Exception("Invoice ini sudah berstatus lunas sebelumnya.");
                }

                // 1. Update status internal invoice di Marketing
                $orderRaw->update([
                    'status' => 'Lunas',
                    'tercatat_finance' => 1
                ]);

                // FIX UTAMA: Tarik ulang data segar dari database untuk memastikan properti seperti no_invoice terisi penuh
                $order = $orderRaw->fresh();

                // Deteksi nomor invoice menggunakan fallback nama kolom database
                $nomorInvoiceFix = $order->no_invoice ?? $order->nomor_invoice ?? $order->invoice_no ?? $order->invoice;

                // Fallback darurat jika Eloquent tetap gagal me-refresh string properti objek
                if (empty($nomorInvoiceFix)) {
                    $nomorInvoiceFix = 'INV-' . date('Ymd') . '-' . str_pad($order->id, 4, '0', STR_PAD_LEFT);
                }

                // 2. Proteksi Kategori Finance
                $category = Category::where('nama_kategori', 'like', '%Penjualan%')
                                    ->orWhere('nama_kategori', 'like', '%Invoice%')
                                    ->first();

                if (!$category) {
                    $category = Category::create([
                        'nama_kategori' => 'Penjualan & Invoice'
                    ]);
                }

                // 3. Proteksi Akun Kas/Bank Keuangan
                $account = Account::where('nama_akun', 'like', '%Kas%')->first() ?? Account::first();

                if (!$account) {
                    throw new \Exception("Akun Kas/Bank belum diatur di sistem Finance.");
                }

                // 4. Suntik ke tabel Mutasi Finance
                Mutasi::create([
                    'account_id'  => $account->id,
                    'category_id' => $category->id,
                    'user_id'     => Auth::id() ?? 1,
                    'tipe'        => 'Masuk',
                    'nominal'     => $order->total_tagihan,
                    'keterangan'  => 'Otomatis: Pelunasan #' . $nomorInvoiceFix . ' (' . $order->nama_pembeli . ')',
                    'tanggal'     => now(),
                    'jenis'       => 'INVOICE',
                ]);

                // 5. Kirim ke tabel rekap Penjualan
                $totalItem = OrderDetail::where('order_id', $order->id)->sum('jumlah');

                Penjualan::create([
                    'no_invoice'        => $nomorInvoiceFix,
                    'nama_pelanggan'    => $order->nama_pembeli ?? 'Pelanggan #' . $nomorInvoiceFix,
                    'total_item'        => $totalItem > 0 ? $totalItem : 1,
                    'total_bayar'       => $order->total_tagihan,
                    'tanggal_penjualan' => now(),
                ]);

                return redirect()->back()->with('success', 'Invoice berhasil dilunasi, rekap penjualan terisi, dan kas finance otomatis bertambah!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses pelunasan: ' . $e->getMessage());
        }
    }

    /**
     * Membatalkan Invoice & Mengembalikan Stok Barang ke Gudang
     */
    public function hapusInvoice($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $order = Order::findOrFail($id);

                // 1. Cegah penghapusan jika sudah Lunas
                if (strtolower($order->status) == 'lunas') {
                    throw new \Exception("Invoice yang sudah Lunas tidak boleh dihapus langsung. Batalkan status lunas terlebih dahulu.");
                }

                // 2. Ambil detail order secara manual menggunakan query builder untuk menghindari crash relasi Eloquent
                $orderDetails = OrderDetail::where('order_id', $order->id)->get();

                // 3. Kembalikan Stok Buku ke Gudang
                foreach ($orderDetails as $detail) {
                    $book = Book::find($detail->buku_id);
                    if ($book) {
                        $book->increment('stok_gudang', $detail->jumlah);
                    }
                }

                // 4. Hapus Detail baru kemudian Hapus Header Order
                OrderDetail::where('order_id', $order->id)->delete();
                $order->delete();

                return redirect()->back()->with('success', 'Invoice dibatalkan & stok buku telah dikembalikan ke gudang!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus: ' . $e->getMessage());
        }
    }

    /**
     * Menampilkan Halaman Cetak Nota/Invoice
     */
    public function printInvoice($id)
    {
        $order = Order::findOrFail($id);
        return view('marketing.print_invoice', compact('order'));
    }
}
