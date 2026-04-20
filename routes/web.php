<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use App\Models\User;

// Import Controllers
use App\Http\Controllers\{
    IdentitasController,
    DashboardController,
    AuthController,
    FinanceController,
    PenerbitanController,
    MarketingController,
    ProduksiController,
    LogistikController,
    InvoiceController,
    TransaksiController,
    JobController,
    KegiatanController,
    DivisiController
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () { return view('welcome'); });

Route::get('/download-invoice-pdf/{id}', [InvoiceController::class, 'downloadPDF']);
Route::get('/finance/report/{month}/{year}', [InvoiceController::class, 'generateReport']);

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister']);
    Route::post('/register', [AuthController::class, 'register']);
});

Route::match(['get', 'post'], '/logout', [AuthController::class, 'logout'])->name('logout');

/*
|--------------------------------------------------------------------------
| Private Routes (Wajib Login)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    // Dashboard Utama (Traffic Controller)
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Integrasi Global Keuangan
    Route::get('/finance/bayar/{id}', [FinanceController::class, 'konfirmasiBayarInvoice'])->name('finance.bayar_global');

    /* |--- KHUSUS DIREKTORAT (Divisi 1) ---
    */
    Route::middleware(['checkRole:1'])->group(function () {
        Route::get('/divisi/init', [DivisiController::class, 'initialize'])->name('divisi.init');

        // Manajemen User & Anggota
        Route::prefix('admin')->group(function () {
            Route::post('/add-user', [AuthController::class, 'storeUser'])->name('admin.storeUser');
            Route::post('/user/update/{id}', [DashboardController::class, 'updateAnggota'])->name('anggota.update');
            Route::delete('/user/hapus/{id}', [DashboardController::class, 'hapusAnggota'])->name('anggota.hapus');
            Route::post('/user/hapus-semua', [DashboardController::class, 'hapusSemuaOrang'])->name('anggota.hapus_semua');
        });

        // Manajemen Data Identitas (MIS)
        Route::prefix('anggota')->group(function () {
            Route::get('/', [IdentitasController::class, 'index'])->name('identitas.index');
            Route::post('/', [IdentitasController::class, 'store'])->name('identitas.store');
            Route::delete('/bulk-delete', [IdentitasController::class, 'bulkDelete'])->name('identitas.bulkDelete');
            Route::get('/export-pdf', [IdentitasController::class, 'exportPDF'])->name('identitas.export-pdf');

            // CRUD dengan ID (Diletakkan di bawah agar tidak bentrok dengan static routes)
            Route::get('/tambah', [IdentitasController::class, 'create']);
            Route::get('/{id}', [IdentitasController::class, 'show'])->name('identitas.show');
            Route::get('/{id}/edit', [IdentitasController::class, 'edit'])->name('identitas.edit');
            Route::put('/{id}', [IdentitasController::class, 'update'])->name('identitas.update');
            Route::delete('/{id}', [IdentitasController::class, 'destroy'])->name('identitas.destroy');
        });

        // Transaksi & Jobs
        Route::prefix('direktorat-transaksi')->group(function () {
            Route::get('/create', [TransaksiController::class, 'create'])->name('transaksi.create');
            Route::post('/store', [TransaksiController::class, 'store'])->name('transaksi.store');
            Route::post('/store-mis', [IdentitasController::class, 'storeTransaksi'])->name('transaksi.store_mis');
        });

        Route::prefix('jobs')->group(function () {
            Route::post('/store', [JobController::class, 'store'])->name('jobs.store');
            Route::put('/update/{id}', [JobController::class, 'update'])->name('jobs.update');
            Route::delete('/destroy/{id}', [JobController::class, 'destroy'])->name('jobs.destroy');
        });

        Route::resource('kegiatans', KegiatanController::class);
    });

    /* |--- KHUSUS BENDAHARA / FINANCE (Divisi 2) ---
    */
    Route::middleware(['checkRole:2'])->group(function () {
        Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
        Route::get('/bendahara', [FinanceController::class, 'index'])->name('bendahara');

        Route::prefix('bendahara')->group(function () {
            Route::post('/simpan', [FinanceController::class, 'store_transaction'])->name('finance.store_transaction');
            Route::put('/update/{id}', [FinanceController::class, 'update'])->name('finance.update');
            Route::delete('/hapus/{id}', [FinanceController::class, 'destroy'])->name('finance.destroy');
            Route::delete('/hapus-massal', [FinanceController::class, 'hapusMassal'])->name('finance.bulk_delete');

            // Konfirmasi & Invoice
            Route::post('/confirm-invoice/{id}', [FinanceController::class, 'konfirmasiInvoice'])->name('finance.confirm_invoice');
            Route::post('/konfirmasi-bayar/{id}', [FinanceController::class, 'konfirmasiBayarInvoice'])->name('finance.konfirmasi_pembayaran');

            // Manajemen Akun
            Route::post('/akun/simpan', [FinanceController::class, 'simpanAkun'])->name('finance.simpanAkun');
            Route::put('/akun/update/{id}', [FinanceController::class, 'updateAccount'])->name('finance.update_account');
            Route::delete('/akun/hapus/{id}', [FinanceController::class, 'deleteAccount'])->name('finance.delete_account');
        });

        Route::get('/finance/report', [FinanceController::class, 'report'])->name('finance.report');
        Route::get('/finance/download-pdf', [FinanceController::class, 'downloadPdf'])->name('finance.download_pdf');
    });

    /* |--- KHUSUS PENERBITAN (Divisi 3) ---
    */
    Route::middleware(['checkRole:3'])->group(function () {
        Route::prefix('penerbitan')->group(function () {
            Route::get('/', [PenerbitanController::class, 'index'])->name('penerbitan');
            Route::post('/tambah-buku', [PenerbitanController::class, 'tambahBuku'])->name('pnb.tambah-buku');
            Route::post('/update-buku/{id}', [PenerbitanController::class, 'updateBuku'])->name('pnb.update-buku');
            Route::post('/update-harga/{id}', [PenerbitanController::class, 'updateHarga'])->name('penerbitan.updateHarga');
            Route::delete('/hapus-buku/{id}', [PenerbitanController::class, 'hapusBuku'])->name('pnb.hapus-buku');
            Route::post('/simpan-salur', [PenerbitanController::class, 'simpanSalur'])->name('pnb.simpan-salur');
            Route::delete('/hapus-salur/{id}', [PenerbitanController::class, 'hapusSalur'])->name('pnb.hapus-salur');
            Route::delete('/bulk-delete', [PenerbitanController::class, 'bulkDelete'])->name('pnb.bulkDelete');
        });
    });

    /* |--- KHUSUS MARKETING (Divisi 4) ---
    */
    Route::middleware(['checkRole:4'])->group(function () {
        Route::prefix('marketing')->group(function () {
            Route::get('/', [MarketingController::class, 'index'])->name('marketing');
            Route::post('/tambah-agen', [MarketingController::class, 'tambahAgen'])->name('mad.tambah-agen');
            Route::post('/update-agen/{id}', [MarketingController::class, 'updateAgen'])->name('mad.update-agen');
            Route::delete('/hapus-agen/{id}', [MarketingController::class, 'hapusAgen'])->name('mad.hapus-agen');
            Route::post('/kirim-buku', [MarketingController::class, 'kirimBuku'])->name('mad.kirim-buku');
            Route::post('/kirim-ke-logistik/{id}', [MarketingController::class, 'kirimKeLogistik'])->name('marketing.kirim-logistik');
            Route::get('/clear-notif', [MarketingController::class, 'clearNotif'])->name('mad.clear-notif');

            // Invoice Marketing
            Route::prefix('invoice')->group(function () {
                Route::get('/bayar/{id}', [MarketingController::class, 'bayarInvoice'])->name('mad.bayar-invoice');
                Route::get('/cetak/{id}', [MarketingController::class, 'cetakInvoice'])->name('mad.cetak-invoice');
                Route::post('/update/{id}', [MarketingController::class, 'updateInvoice'])->name('mad.update-invoice');
                Route::post('/lunas/{id}', [MarketingController::class, 'tandaiLunas'])->name('mad.tandai-lunas');
                Route::delete('/hapus/{id}', [MarketingController::class, 'hapusInvoice'])->name('mad.hapus-invoice');
            });
        });
    });

    /* |--- KHUSUS PRODUKSI (Divisi 5) ---
    */
    Route::middleware(['checkRole:5'])->group(function () {
        Route::get('/produksi', [ProduksiController::class, 'index'])->name('produksi');
        Route::post('/produksi/simpan', [ProduksiController::class, 'simpan'])->name('produksi.simpan');
    });

    /* |--- KHUSUS LOGISTIK (Divisi 6) ---
    */
    Route::middleware(['checkRole:6'])->group(function () {
        Route::prefix('logistik')->group(function () {
            Route::get('/', [LogistikController::class, 'index'])->name('logistik');
            Route::post('/kirim-marketing/{id}', [LogistikController::class, 'kirimMarketing'])->name('logistik.siapPacking');
            Route::post('/simpan-manual', [LogistikController::class, 'simpanKeluar'])->name('logistik.simpan-keluar');
            Route::post('/kirim-dari-marketing/{id}', [LogistikController::class, 'kirimDariMarketing'])->name('logistik.kirim-dari-marketing');
            Route::get('/cetak-surat-jalan/{id}', [LogistikController::class, 'cetakSuratJalan'])->name('logistik.cetak');
            Route::delete('/riwayat/{id}', [LogistikController::class, 'destroyLog'])->name('logistik.delete-log');
        });
    });

    /* |--- API ROUTES (Internal) ---
    */
    Route::prefix('api')->group(function () {
        Route::get('/list-anggota-lengkap', function () {
            $divisiNames = ["1"=>"Direktorat", "2"=>"Bendahara", "3"=>"Penerbitan", "4"=>"Marketing", "5"=>"Produksi", "6"=>"Logistik"];
            return response()->json(User::all()->map(function($user) use ($divisiNames) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'nama_divisi' => $divisiNames[$user->divisi_id] ?? 'Umum',
                ];
            }));
        });
        Route::get('/stats-keuangan-global', [FinanceController::class, 'getStatsGlobal']);
    });
    
});
