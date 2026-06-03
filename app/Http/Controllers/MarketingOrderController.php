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
     * Menyimpan Data Pesanan Baru & Potong Stok Otomatis (VERSI AMAN ANTI-RACE CONDITION)
     */
    public function store(Request $request)
    {
        // 1. Validasi Input yang Disesuaikan dengan Kondisi Form
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

                    // Simpan objek yang terkunci agar tidak query ulang di looping potong stok
                    $lockedBooks[$key] = $book;
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

                // 3. Logika Penentuan Alamat & Penerima
                $isSama = $request->has('sama_penerima');
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
                    'total_semau_buku'  => 0,
                ]);

                $totalSemuaBuku = 0;

                // 5. Simpan Detail Item & Eksekusi Potong Stok Aman
                foreach ($request->buku_id as $key => $idBuku) {
                    if (!$idBuku) continue;

                    // Ambil kembali objek buku yang sudah ter-lock di langkah awal
                    $book = $lockedBooks[$key];
                    $jumlahPesanan = $request->qty[$key] ?? 1;

                    // Mengurangi stok pada record yang sedang dikunci
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
                                    ->orWhere('nama_kategori', 'like', '%Penjualan & Invoice%')
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
     * Membatalkan Invoice (Cancel Order), Mengembalikan Stok, dan Membersihkan Data Keuangan
     */
    public function hapusInvoice($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                // 1. Ambil data order beserta relasi detail itemnya
                $order = Order::with('details')->findOrFail($id);

                // Validasi: Jika status sudah Cancelled, batalkan eksekusi
                if ($order->status === 'Cancelled') {
                    throw new \Exception("Invoice ini sudah dibatalkan sebelumnya.");
                }

                // 2. KEMBALIKAN STOK BARANG KE GUDANG (RESTOCK)
                $orderDetails = $order->details ?? [];
                foreach ($orderDetails as $detail) {
                    $book = Book::find($detail->buku_id);
                    if ($book) {
                        // Tambahkan kembali stok gudang berdasarkan jumlah pesanan yang dibatalkan
                        $book->increment('stok_gudang', $detail->jumlah);
                    }
                }

                // 3. SINKRONISASI FINANCE (Hapus log finansial jika sebelumnya orderan ini sudah Lunas)
                if ($order->tercatat_finance == 1 || strtolower($order->status) == 'lunas') {

                    $nomorInvoiceFix = $order->no_invoice ?? $order->nomor_invoice ?? $order->invoice_no ?? $order->invoice;

                    if (!empty($nomorInvoiceFix)) {
                        // Hapus otomatis pencatatan mutasi kas masuk terkait invoice ini
                        Mutasi::where('keterangan', 'like', '%' . $nomorInvoiceFix . '%')->delete();

                        // Hapus rekap tabel penjualan di finance agar omset bulanan akurat
                        Penjualan::where('no_invoice', $nomorInvoiceFix)->delete();
                    }
                }

                // 4. SOFT UPDATE STATUS ORDER UTAMA (Data histori tetap ada di tabel orders)
                $order->update([
                    'status' => 'Cancelled',
                    'tercatat_finance' => 0 // Set kembali ke 0 karena uang batal masuk
                ]);

                return redirect()->back()->with('success', "Invoice #{$order->no_invoice} berhasil dibatalkan (Cancelled) & stok buku telah dikembalikan ke gudang!");
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal mematikan/membatalkan invoice: ' . $e->getMessage());
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

    /**
     * Mengunduh berkas rekap Excel menggunakan HTML Stream (Rupiah & Invoice Fixed)
     */
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

        $callback = function() use($orders) {
            $file = fopen('php://output', 'w');

            // Set up format HTML Table agar dimengerti Microsoft Excel dengan sempurna
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head>';
            echo '<body>';
            echo '<table border="1">';

            // Render Header Kolom dengan style warna background abu-abu tipis
            echo '<tr style="background-color: #f2f2f2; font-weight: bold; text-align: center;">';
            echo '<th>No Invoice</th>';
            echo '<th>Tanggal Pesan</th>';
            echo '<th>Via / Platform</th>';
            echo '<th>Nama Pembeli (Agen)</th>';
            echo '<th>Nama Penerima</th>';
            echo '<th>Alamat Pengiriman</th>';
            echo '<th>Ekspedisi</th>';
            echo '<th>Ongkir</th>';
            echo '<th>Total Tagihan</th>';
            echo '<th>Status Nota</th>';
            echo '<th>Rincian Buku (Judul x QTY)</th>';
            echo '</tr>';

            foreach ($orders as $order) {
                $rincianBuku = [];
                $orderDetails = $order->details ?? [];

                foreach ($orderDetails as $detail) {
                    $judul = $detail->book->judul ?? 'Buku ID: ' . $detail->buku_id;
                    $rincianBuku[] = $judul . " (" . $detail->jumlah . " pcs)";
                }

                // Gunakan tag <br> untuk memisahkan baris buku di dalam satu sel Excel
                $teksRincian = implode('<br>', $rincianBuku);

                // Fallback pencarian field invoice jika ada inkonsistensi nama kolom database
                $invoiceTerpilih = $order->no_invoice ?? $order->nomor_invoice ?? $order->invoice ?? 'N/A';

                echo '<tr>';
                // Menjaga No Invoice tetap bertipe teks agar digit / strip (-) tidak dirusak Excel
                echo '<td style="vnd.ms-excel.numberformat:@">' . e($invoiceTerpilih) . '</td>';
                echo '<td>' . e($order->tanggal_pesan) . '</td>';
                echo '<td>' . e($order->via) . '</td>';
                echo '<td>' . e($order->nama_pembeli) . '</td>';
                echo '<td>' . e($order->nama_penerima) . '</td>';
                echo '<td>' . e($order->alamat_penerima) . '</td>';
                echo '<td>' . e($order->ekspedisi) . '</td>';

                // Format Akuntansi Rupiah Resmi Excel asli (Tetap bisa dijumlahkan pakai rumus matematika)
                echo '<td style="vnd.ms-excel.numberformat:\'Rp \'#,##0; text-align: right;">' . (int)$order->ongkir . '</td>';
                echo '<td style="vnd.ms-excel.numberformat:\'Rp \'#,##0; text-align: right; font-weight: bold;">' . (int)$order->total_tagihan . '</td>';

                echo '<td style="text-align: center;">' . e($order->status ?? 'Pending') . '</td>';
                echo '<td>' . $teksRincian . '</td>';
                echo '</tr>';
            }

            echo '</table>';
            echo '<body>';
            echo '</html>';

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
