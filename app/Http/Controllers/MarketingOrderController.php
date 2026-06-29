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
use App\Models\ActivityLog;
use App\Models\Promo;
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
     * Menyimpan Data Pesanan Baru, Validasi Kode Promo, & Potong Stok Otomatis
     */
    public function store(Request $request)
    {
        // 1. Validasi Input yang Disesuaikan dengan Kondisi Form
        $request->validate([
            'tanggal_pesan'   => 'required|date',
            'nama_agen'       => 'required|string|exists:identitas,nama_lengkap',
            'via'             => 'nullable|string',
            'ekspedisi'       => 'nullable|string',
            'ongkir'          => 'nullable|numeric|min:0',
            'nama_penerima'   => 'nullable|string',
            'alamat_penerima' => 'required_without:sama_penerima|nullable|string',
            'buku_id'         => 'required|array|min:1',
            'buku_id.*'       => ['required', \Illuminate\Validation\Rule::exists(\App\Models\Book::class, 'id')],
            'qty'             => 'required|array|min:1',
            'qty.*'           => 'required|integer|min:1',
            'promo_code'      => 'nullable|string|max:50',
        ], [
            'nama_agen.exists'                 => 'Nama agen/pembeli tidak ditemukan di sistem.',
            'qty.*.min'                        => 'Jumlah pesanan (QTY) minimal harus 1.',
            'buku_id.required'                 => 'Minimal pilih satu buku.',
            'buku_id.*.exists'                 => 'Buku yang dipilih tidak valid atau tidak terdaftar.',
            'ongkir.numeric'                   => 'Ongkir harus berupa angka.',
            'alamat_penerima.required_without' => 'Alamat pengiriman wajib diisi jika tidak dicentang sama dengan penerima.',
        ]);

        try {
            $noInvoice = '';
            DB::transaction(function () use ($request, &$noInvoice) {

                // Array penampung objek buku yang berhasil dikunci secara eksklusif
                $lockedBooks = [];

                // --- LANGKAH PERLINDUNGAN AWAL: Cek ketersediaan seluruh stok & Row Locking ---
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

                    $lockedBooks[$key] = $book;
                }

                // 2. Generate Nomor Invoice
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

                // 3. Logika Penentuan Alamat & Penerima
                $isSama = $request->has('sama_penerima') || $request->input('sama_penerima') == '1';
                $namaPenerima = $isSama ? $request->nama_agen : ($request->nama_penerima ?? $request->nama_agen);

                if ($isSama) {
                    $agen = Identitas::where('nama_lengkap', $request->nama_agen)->first();
                    if ($agen && !empty($agen->alamat)) {
                        $alamatFinal = $agen->alamat;
                    } else {
                        $alamatFinal = 'Alamat belum diatur pada master data agen';
                    }
                } else {
                    $alamatFinal = $request->alamat_penerima;
                }

                if (empty($alamatFinal)) {
                    $alamatFinal = 'Alamat tidak terisi / kosong';
                }

                // 4. Hitung Subtotal Buku untuk Memvalidasi Diskon di Backend
                $totalSemuaBuku = 0;
                $detailsData = [];

                foreach ($request->buku_id as $key => $idBuku) {
                    if (!$idBuku) continue;
                    $book = $lockedBooks[$key];
                    $jumlahPesanan = $request->qty[$key] ?? 1;

                    $hargaSatuan = $book->harga_jual ?? $book->harga ?? 0;
                    $subtotal = $hargaSatuan * $jumlahPesanan;

                    $totalSemuaBuku += $subtotal;
                    $detailsData[] = [
                        'book' => $book,
                        'buku_id' => $idBuku,
                        'jumlah' => $jumlahPesanan,
                        'harga_satuan' => $hargaSatuan,
                        'subtotal' => $subtotal
                    ];
                }

                // 5. Logika Verifikasi Kode Promo Sisi Backend (Proteksi Data)
                $potonganDiskon = 0;
                $promoIdApplied = null;

                if ($request->filled('promo_code')) {
                    $promo = Promo::where('code', strtoupper($request->promo_code))->first();

                    if ($promo) {
                        $isExpired = $promo->expiry_date && $promo->expiry_date < date('Y-m-d');
                        $isQuotaHabis = $promo->used_count >= $promo->max_uses;

                        if (!$isExpired && !$isQuotaHabis) {
                            if ($promo->type === 'percentage') {
                                $potonganDiskon = ($totalSemuaBuku * $promo->reward_value) / 100;
                            } else {
                                $potonganDiskon = $promo->reward_value;
                            }

                            // Batasi agar diskon tidak melebihi harga total buku
                            $potonganDiskon = min($potonganDiskon, $totalSemuaBuku);
                            $promoIdApplied = $promo->id;

                            // Naikkan jumlah pemakaian kupon
                            $promo->increment('used_count');
                        }
                    }
                }

                // Perhitungan Akhir Grand Total Tagihan
                $grandTotal = ($totalSemuaBuku - $potonganDiskon) + ($request->ongkir ?? 0);
                $grandTotal = max(0, $grandTotal);

                // 6. Simpan Header Order (Menambahkan data tracking promo jika fieldnya tersedia di tabel orders)
                $order = Order::create([
                    'no_invoice'        => $noInvoice,
                    'tanggal_pesan'     => $request->tanggal_pesan,
                    'via'               => $request->via ?? 'Offline',
                    'nama_pembeli'      => $request->nama_agen,
                    'nama_penerima'     => $namaPenerima,
                    'alamat_penerima'   => $alamatFinal,
                    'ekspedisi'         => $request->ekspedisi ?? '-',
                    'ongkir'            => $request->ongkir ?? 0,
                    'status'            => 'Pending',
                    'total_tagihan'     => $grandTotal,
                    'user_id'           => Auth::id()
                ]);

                // 7. Eksekusi Pengurangan Stok & Simpan Detail Item
                foreach ($detailsData as $data) {
                    $data['book']->decrement('stok_gudang', $data['jumlah']);

                    OrderDetail::create([
                        'order_id'     => $order->id,
                        'buku_id'      => $data['buku_id'],
                        'jumlah'       => $data['jumlah'],
                        'harga_satuan' => $data['harga_satuan'],
                        'subtotal'     => $data['subtotal'],
                    ]);
                }

                // 📝 AUDIT LOG
                ActivityLog::record('Tambah Pesanan', 'Order', 'Membuat pesanan baru ' . $order->no_invoice . ' untuk agen: ' . $order->nama_pembeli . ' via ' . $order->via . ' (Total: Rp ' . number_format($order->total_tagihan, 0, ',', '.') . ')');
            });

            return redirect()->back()->with('success', "Invoice #{$noInvoice} berhasil disimpan & stok dipotong!");
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', 'Gagal Simpan: ' . $e->getMessage());
        }
    }

    /**
     * Menandai Invoice Lunas & Otomatis Sinkronisasi Penuh ke Dashboard Finance & Logistik
     */
    public function tandaiLunas($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $orderRaw = Order::with('details')->findOrFail($id);

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

                // 🚚 INTEGRASI KE DIVISI LOGISTIK
                $orderDetails = $order->details ?? [];
                foreach ($orderDetails as $detail) {
                    \App\Models\Penyaluran::create([
                        'no_invoice' => $nomorInvoiceFix,
                        'buku_id'    => $detail->buku_id,
                        'qty'        => $detail->jumlah,
                        'nama_agen'  => $order->nama_penerima ?? $order->nama_pembeli,
                        'status'     => 'proses packing',
                    ]);
                }

                $category = Category::where('nama_kategori', 'like', '%Penjualan%')
                                    ->orWhere('nama_kategori', 'like', '%Invoice%')
                                    ->orWhere('nama_kategori', 'like', '%Penjualan & Invoice%')
                                    ->first();
                if (!$category) {
                    $category = Category::create(['nama_kategori' => 'Penjualan & Invoice']);
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

                ActivityLog::record('Konfirmasi Lunas', 'Order', 'Mengubah status invoice ' . $nomorInvoiceFix . ' menjadi LUNAS. Data otomatis disinkronkan ke Finance & Logistik.');
                return redirect()->back()->with('success', 'Invoice berhasil dilunasi, data diteruskan ke Logistik, rekap penjualan terisi, dan kas finance otomatis bertambah!');
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memproses pelunasan: ' . $e->getMessage());
        }
    }

    /**
     * Membatalkan Invoice (Cancel Order), Mengembangkan Stok, dan Membersihkan Data Keuangan
     */
    public function hapusInvoice($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $order = Order::with('details')->findOrFail($id);

                if ($order->status === 'Cancelled') {
                    throw new \Exception("Invoice ini sudah dibatalkan sebelumnya.");
                }

                $orderDetails = $order->details ?? [];
                foreach ($orderDetails as $detail) {
                    $book = Book::lockForUpdate()->find($detail->buku_id);
                    if ($book) {
                        $book->increment('stok_gudang', $detail->jumlah);
                    }
                }

                if ($order->tercatat_finance == 1 || strtolower($order->status) == 'lunas') {
                    $nomorInvoiceFix = $order->no_invoice ?? $order->nomor_invoice ?? $order->invoice_no ?? $order->invoice;

                    if (!empty($nomorInvoiceFix)) {
                        Mutasi::where('keterangan', 'like', '%' . $nomorInvoiceFix . '%')->delete();
                        Penjualan::where('no_invoice', $nomorInvoiceFix)->delete();
                    }
                }

                $order->update([
                    'status' => 'Cancelled',
                    'tercatat_finance' => 0
                ]);

                ActivityLog::record('Batalkan Invoice', 'Order', 'Membatalkan (Cancel) Invoice ' . $order->no_invoice . '. Stok seluruh buku pesanan otomatis dikembalikan ke gudang.');
                return redirect()->back()->with('success', "Invoice #{$order->no_invoice} berhasil dibatalkan (Cancelled) & stok buku telah dikembalikan ke gudang!");
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mematikan/membatalkan invoice: ' . $e->getMessage());
        }
    }

    public function printInvoice($id)
    {
        $order = Order::findOrFail($id);
        return view('marketing.print_invoice', compact('order'));
    }

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

    public function eksporExcel(Request $request)
    {
        $search = $request->get('search');
        $status = $request->get('status');

        $orders = Order::with(['details.book'])
            ->when($search, function($query) use ($search) {
                $query->where('no_invoice', 'like', "%{$search}%")
                    ->orWhere('nama_pembeli', 'like', "%{$search}%")
                    ->orWhere('nama_penerima', 'like', "%{$search}%");
            })
            ->when($status, function($query) use ($status) {
                $query->where('status', $status);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $fileName = 'Rekap_Penjualan_Lamrimnesia_' . date('Ymd_His') . '.xls';

        $headers = [
            "Content-Type"        => "application/vnd.ms-excel",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        ActivityLog::record('Ekspor Excel Marketing', 'Order', 'Mengekspor rekap data order penjualan ke berkas Excel.');

        $callback = function() use($orders) {
            $file = fopen('php://output', 'w');
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>';
            echo '<body>';
            echo '<table border="1">';
            echo '<tr style="background-color: #f2f2f2; font-weight: bold; text-align: center;">';
            echo '<th>No Invoice</th><th>Tanggal Pesan</th><th>Via / Platform</th><th>Nama Pembeli (Agen)</th><th>Nama Penerima</th><th>Alamat Pengiriman</th><th>Ekspedisi</th><th>Ongkir</th><th>Total Tagihan</th><th>Status Nota</th><th>Rincian Buku (Judul x QTY)</th>';
            echo '</tr>';

            foreach ($orders as $order) {
                $rincianBuku = [];
                $orderDetails = $order->details ?? [];

                foreach ($orderDetails as $detail) {
                    $judul = $detail->book->judul ?? 'Buku ID: ' . $detail->buku_id;
                    $rincianBuku[] = $judul . " (" . $detail->jumlah . " pcs)";
                }

                $teksRincian = implode('<br>', $rincianBuku);
                $invoiceTerpilih = $order->no_invoice ?? $order->nomor_invoice ?? $order->invoice_no ?? $order->invoice;

                echo '<tr>';
                echo '<td style="vnd.ms-excel.numberformat:@">' . e($invoiceTerpilih) . '</td>';
                echo '<td>' . e($order->tanggal_pesan) . '</td>';
                echo '<td>' . e($order->via) . '</td>';
                echo '<td>' . e($order->nama_pembeli) . '</td>';
                echo '<td>' . e($order->nama_penerima) . '</td>';
                echo '<td>' . e($order->alamat_penerima) . '</td>';
                echo '<td>' . e($order->ekspedisi) . '</td>';
                echo '<td style="vnd.ms-excel.numberformat:\'Rp \'#,##0; text-align: right;">' . (int)$order->ongkir . '</td>';
                echo '<td style="vnd.ms-excel.numberformat:\'Rp \'#,##0; text-align: right; font-weight: bold;">' . (int)$order->total_tagihan . '</td>';
                echo '<td style="text-align: center;">' . e($order->status ?? 'Pending') . '</td>';
                echo '<td>' . $teksRincian . '</td>';
                echo '</tr>';
            }

            echo '</table></body></html>';
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * AJAX Endpoint: Memvalidasi ketersediaan promo dari front-end
     */
    public function checkPromo($code)
    {
        $promo = \App\Models\Promo::where('code', $code)->first();
        if (!$promo) {
            return response()->json(['status' => 'error', 'message' => 'Kode promo tidak ditemukan.']);
        }

        if ($promo->expiry_date && $promo->expiry_date < date('Y-m-d')) {
            return response()->json(['status' => 'error', 'message' => 'Kode promo sudah kedaluwarsa.']);
        }

        if ($promo->used_count >= $promo->max_uses) {
            return response()->json(['status' => 'error', 'message' => 'Kuota kode promo sudah habis.']);
        }

        return response()->json([
            'status' => 'success',
            'type' => $promo->type,
            'value' => $promo->reward_value
        ]);
    }

    /**
     * --- HALAMAN MANAJEMEN PROMO BACKEND ---
     */
    public function indexPromo()
    {
        // Mengambil semua data promo dari database
        $promos = Promo::orderBy('created_at', 'desc')->get();
        return view('marketing.promo', compact('promos'));
    }

    public function storePromo(Request $request)
    {
        $request->validate([
            'code'         => 'required|unique:promos,code|string|max:50',
            'type'         => 'required|in:percentage,nominal',
            'reward_value' => 'required|numeric|min:1',
            'max_uses'     => 'required|integer|min:1',
            'expiry_date'  => 'nullable|date|after_or_equal:today',
        ]);

        Promo::create([
            'code'         => strtoupper($request->code), // Otomatis simpan Kapital
            'type'         => $request->type,
            'reward_value' => $request->reward_value,
            'max_uses'     => $request->max_uses,
            'used_count'   => 0,
            'expiry_date'  => $request->expiry_date,
        ]);

        return redirect()->back()->with('success', 'Kode Promo baru berhasil dibuat!');
    }

    public function hapusPromo($id)
    {
        $promo = Promo::findOrFail($id);
        $promo->delete();

        return redirect()->back()->with('success', 'Kode Promo berhasil dihapus!');
    }
}
