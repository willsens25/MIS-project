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

        // Ambil invoice yang statusnya BUKAN Lunas
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
     * Menyimpan Data Pesanan Baru
     */
    public function store(Request $request)
    {
        // 1. Validasi Input
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
                // 2. Generate Nomor Invoice (Format: INV-YYYYMMDD-XXXX)
                $tanggal = date('Ymd');
                $count = Order::whereDate('created_at', today())->count();
                $noInvoice = "INV-{$tanggal}-" . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

                // 3. Logika Penentuan Alamat & Penerima
                $isSama = $request->has('sama_penerima');
                $namaPenerima = $isSama ? $request->nama_agen : ($request->nama_penerima ?? $request->nama_agen);

                // Jika sama dengan pembeli, tarik alamat asli dari tabel Identitas
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

                // 5. Simpan Detail Item (Looping array buku)
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

                    // Opsional: Jika ingin stok langsung berkurang saat order dibuat
                    // $book->decrement('stok_gudang', $jumlahPesanan);

                    $totalSemuaBuku += $subtotal;
                }

                // 6. Update Total Akhir (Total Buku + Ongkir)
                $order->update([
                    'total_tagihan' => $totalSemuaBuku + ($request->ongkir ?? 0)
                ]);

                return redirect()->back()->with('success', "Invoice #{$noInvoice} berhasil disimpan!");
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

                // 1. Update Status Order
                $order->update([
                    'status' => 'Lunas',
                    'tercatat_finance' => 1
                ]);

                // 2. Cari Kategori Pemasukan
                $category = Category::where('nama_kategori', 'like', '%Penjualan%')
                            ->orWhere('nama_kategori', 'like', '%Invoice%')
                            ->first();

                // 3. Ambil Akun Kas (Cari yang namanya ada 'Kas', jika tidak ada ambil yang pertama)
                $account = Account::where('nama_akun', 'like', '%Kas%')->first() ?? Account::first();

                if (!$account) {
                    throw new \Exception("Akun Kas/Bank belum diatur di sistem Finance.");
                }

                // 4. Buat Mutasi Masuk ke Tabel Finance
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

    /**
     * Menghapus Invoice
     */
    public function hapusInvoice($id)
    {
        try {
            $order = Order::findOrFail($id);
            // Detail order biasanya otomatis terhapus jika kamu pakai 'onDelete cascade' di database
            // Jika tidak, hapus manual: $order->details()->delete();
            $order->delete();

            return redirect()->back()->with('success', 'Invoice berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus: ' . $e->getMessage());
        }
    }
}
