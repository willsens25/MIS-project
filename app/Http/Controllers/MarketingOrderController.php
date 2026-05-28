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
            ->paginate(15);

        // --- LOGIKA UTAMA AJAX LIVE SEARCH ---
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
        // 1. Validasi Input yang Disesuaikan dengan Kondisi Form (Alamat Opsional jika dicentang 'sama_penerima')
        $request->validate([
            'tanggal_pesan'   => 'required|date',
            'nama_agen'       => 'required|string|exists:identitas,nama_lengkap',
            'via'             => 'required|string',
            'ekspedisi'       => 'required|string',
            'ongkir'          => 'required|numeric|min:0',
            'nama_penerima'   => 'nullable|string',
            'alamat_penerima' => 'required_without:sama_penerima|nullable|string',
            'buku_id'         => 'required|array|min:1',
            'buku_id.*'       => ['required', \Illuminate\Validation\Rule::exists(\App\Models\Book::class, 'id')],
            'qty'             => 'required|array|min:1',
            'qty.*'           => 'required|integer|min:1',
        ], [
            'nama_agen.exists'                 => 'Nama agen/pembeli tidak ditemukan di sistem.',
            'via.required'                     => 'Pilih sumber pesanan (WA/Shopee/dll).',
            'qty.*.min'                        => 'Jumlah pesanan (QTY) minimal harus 1.',
            'buku_id.required'                 => 'Minimal pilih satu buku.',
            'ongkir.numeric'                   => 'Ongkir harus berupa angka.',
            'alamat_penerima.required_without' => 'Alamat pengiriman wajib diisi jika tidak dicentang sama dengan penerima.',
        ]);

        try {
            $noInvoice = '';

            DB::transaction(function () use ($request, &$noInvoice) {

                // --- LANGKAH PERLINDUNGAN AWAL: Cek ketersediaan seluruh stok ---
                foreach ($request->buku_id as $key => $idBuku) {
                    if (!$idBuku) continue;

                    $book = Book::lockForUpdate()->find($idBuku);
                    $jumlahPesanan = $request->qty[$key] ?? 1;

                    if (!$book) {
                        throw new \Exception("Buku dengan ID tersebut tidak ditemukan.");
                    }

                    if ($book->stok_gudang < $jumlahPesanan) {
                        throw new \Exception("Stok buku '{$book->judul}' tidak mencukupi di database. Sisa stok riil: {$book->stok_gudang} pcs. Mohon sesuaikan kembali.");
                    }
                }

                // 2. Generate Nomor Invoice (Menggunakan substr standar php aman)
                $tanggal = date('Ymd');
                $lastOrder = Order::whereDate('created_at', today())
                                  ->orderBy('id', 'desc')
                                  ->first();

                if ($lastOrder && !empty($lastOrder->no_invoice)) {
                    $stringInvoice = (string) $lastOrder->no_invoice;
                    $lastUrutan = (int) substr($stringInvoice, -4);
                    $urutanBaru = $lastUrutan + 1;
                } else {
                    $urutanBaru = 1;
                }

                $noInvoice = "INV-" . $tanggal . "-" . str_pad($urutanBaru, 4, '0', STR_PAD_LEFT);

                // 3. Logika Penentuan Alamat & Penerima (Sudah Diperbaiki Strukturnya)
                $isSama = $request->has('sama_penerima');
                $namaPenerima = $isSama ? $request->nama_agen : ($request->nama_penerima ?? $request->nama_agen);

                if ($isSama) {
                    $agen = Identitas::where('nama_lengkap', $request->nama_agen)->first();

                    // Menggunakan isset dan perbandingan string kosong yang lebih clean & aman dari ParseError
                    if ($agen && !empty($agen->alamat)) {
                        $alamatFinal = $agen->alamat;
                    } else {
                        $alamatFinal = 'Alamat belum diatur pada master data agen';
                    }
                } else {
                    $alamatFinal = $request->alamat_penerima;
                }

                // Pengaman ekstra jika variabel tetap kosong
                if (empty($alamatFinal)) {
                    $alamatFinal = 'Alamat tidak terisi / kosong';
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
            });

            return redirect()->back()->with('success', "Invoice #{$noInvoice} berhasil disimpan & stok dipotong!");

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
                $orderRaw = Order::findOrFail($id);

                if ($orderRaw->status == 'Lunas') {
                    throw new \Exception("Invoice ini sudah berstatus lunas sebelumnya.");
                }

                $orderRaw->update([
                    'status' => 'Lunas',
                    'tercatat_finance' => 1
                ]);

                $order = $orderRaw->fresh();
                $nomorInvoiceFix = $order->no_invoice ?? $order->nomor_invoice ?? $order->invoice_no ?? $order->invoice;

                if (empty($nomorInvoiceFix)) {
                    $nomorInvoiceFix = 'INV-' . date('Ymd') . '-' . str_pad($order->id, 4, '0', STR_PAD_LEFT);
                }

                $category = Category::where('nama_kategori', 'like', '%Penjualan%')
                                    ->orWhere('nama_kategori', 'like', '%Invoice%')
                                    ->first();

                if (!$category) {
                    $category = Category::create([
                        'nama_kategori' => 'Penjualan & Invoice'
                    ]);
                }

                $account = Account::where('nama_akun', 'like', '%Kas%')->first() ?? Account::first();

                if (!$account) {
                    throw new \Exception("Akun Kas/Bank belum diatur di sistem Finance.");
                }

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

                if (strtolower($order->status) == 'lunas') {
                    throw new \Exception("Invoice yang sudah Lunas tidak boleh dihapus langsung. Batalkan status lunas terlebih dahulu.");
                }

                $orderDetails = OrderDetail::where('order_id', $order->id)->get();

                foreach ($orderDetails as $detail) {
                    $book = Book::find($detail->buku_id);
                    if ($book) {
                        $book->increment('stok_gudang', $detail->jumlah);
                    }
                }

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

    /**
     * Mengambil alamat agen secara real-time untuk fitur Auto-Suggest via AJAX
     */
    public function getAlamatAgen($nama)
    {
        $pembeli = Identitas::where('nama_lengkap', $nama)->first();

        if ($pembeli) {
            return response()->json([
                'status' => 'success',
                'alamat' => $pembeli->alamat ?? ''
            ]);
        }

        return response()->json([
            'status' => 'error',
            'alamat' => ''
        ], 404);
    }
}
