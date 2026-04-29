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
    DivisiController,
    MarketingOrderController
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () { return view('welcome'); });

// Route Global untuk Invoice & Report
Route::get('/download-invoice-pdf/{id}', [InvoiceController::class, 'downloadPDF'])->name('invoice.download');
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

    // Dashboard Utama
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Integrasi Global Keuangan
    Route::get('/finance/bayar/{id}', [FinanceController::class, 'konfirmasiBayarInvoice'])->name('finance.bayar_global');

    /* |--- KHUSUS DIREKTORAT (Divisi 1) --- */
    Route::middleware(['checkRole:1'])->group(function () {
        Route::get('/divisi/init', [DivisiController::class, 'initialize'])->name('divisi.init');

        Route::prefix('admin')->group(function () {
            Route::post('/add-user', [AuthController::class, 'storeUser'])->name('admin.storeUser');
            Route::post('/user/update/{id}', [DashboardController::class, 'updateAnggota'])->name('anggota.update');
            Route::delete('/user/hapus/{id}', [DashboardController::class, 'hapusAnggota'])->name('anggota.hapus');
            Route::post('/user/hapus-semua', [DashboardController::class, 'hapusSemuaOrang'])->name('anggota.hapus_semua');
        });

        Route::prefix('anggota')->group(function () {
            Route::get('/', [IdentitasController::class, 'index'])->name('identitas.index');
            Route::post('/', [IdentitasController::class, 'store'])->name('identitas.store');
            Route::delete('/bulk-delete', [IdentitasController::class, 'bulkDelete'])->name('identitas.bulkDelete');
            Route::get('/export-pdf', [IdentitasController::class, 'exportPDF'])->name('identitas.export-pdf');
            Route::get('/tambah', [IdentitasController::class, 'create']);
            Route::get('/{id}', [IdentitasController::class, 'show'])->name('identitas.show');
            Route::get('/{id}/edit', [IdentitasController::class, 'edit'])->name('identitas.edit');
            Route::put('/{id}', [IdentitasController::class, 'update'])->name('identitas.update');
            Route::delete('/{id}', [IdentitasController::class, 'destroy'])->name('identitas.destroy');
        });

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

    /* |--- KHUSUS BENDAHARA / FINANCE (Divisi 2) --- */
    Route::middleware(['checkRole:2'])->group(function () {
        Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');

        // Route untuk download REKAP (Filter Bulan/Tahun)
        Route::get('/finance/download-report', [FinanceController::class, 'downloadReport'])->name('finance.download_report');

        // Route untuk download PER TRANSAKSI (Jika dibutuhkan)
        Route::get('/finance/download-pdf/{id}', [FinanceController::class, 'downloadPdf'])->name('finance.download_pdf');

        Route::prefix('bendahara')->group(function () {
            // ... route lainnya tetap sama ...
            Route::post('/simpan', [FinanceController::class, 'store_transaction'])->name('finance.store_transaction');
            Route::put('/update/{id}', [FinanceController::class, 'update'])->name('finance.update');
            Route::delete('/hapus/{id}', [FinanceController::class, 'destroy'])->name('finance.destroy');
            Route::post('/confirm-invoice/{id}', [FinanceController::class, 'konfirmasiInvoice'])->name('finance.confirm_invoice');
            Route::post('/konfirmasi-bayar/{id}', [FinanceController::class, 'konfirmasiBayarInvoice'])->name('finance.konfirmasi_pembayaran');
            Route::post('/akun/simpan', [FinanceController::class, 'simpanAkun'])->name('finance.simpanAkun');
        });
    });

    /* |--- KHUSUS PENERBITAN (Divisi 3) --- */
    Route::middleware(['checkRole:3'])->group(function () {
        Route::prefix('penerbitan')->group(function () {
            Route::get('/', [PenerbitanController::class, 'index'])->name('penerbitan');
            Route::post('/tambah-buku', [PenerbitanController::class, 'tambahBuku'])->name('pnb.tambah-buku');
            Route::post('/update-buku/{id}', [PenerbitanController::class, 'updateBuku'])->name('pnb.update-buku');
            Route::delete('/hapus-buku/{id}', [PenerbitanController::class, 'hapusBuku'])->name('pnb.hapus-buku');
            Route::delete('/penerbitan/bulk-delete', [PenerbitanController::class, 'bulkDelete'])->name('pnb.bulkDelete');
            Route::post('/penerbitan/update-harga/{id}', [PenerbitanController::class, 'updateHarga'])->name('penerbitan.updateHarga');
        });
    });

    /* |--- KHUSUS MARKETING (Divisi 4) --- */
    Route::middleware(['checkRole:4'])->group(function () {
        Route::prefix('marketing')->group(function () {
            Route::get('/', [MarketingOrderController::class, 'create'])->name('marketing');
            Route::post('/order/store', [MarketingOrderController::class, 'store'])->name('marketing.order.store');

            Route::post('/tambah-agen', [MarketingController::class, 'tambahAgen'])->name('mad.tambah-agen');
            Route::post('/update-agen/{id}', [MarketingController::class, 'updateAgen'])->name('mad.update-agen');
            Route::delete('/hapus-agen/{id}', [MarketingController::class, 'hapusAgen'])->name('mad.hapus-agen');
            Route::post('/kirim-buku', [MarketingController::class, 'kirimBuku'])->name('mad.kirim-buku');
            Route::get('/clear-notif', [MarketingController::class, 'clearNotif'])->name('mad.clear-notif');

            Route::prefix('invoice')->group(function () {
                Route::get('/bayar/{id}', [MarketingController::class, 'bayarInvoice'])->name('mad.bayar-invoice');
                Route::get('/cetak/{id}', [MarketingController::class, 'cetakInvoice'])->name('mad.cetak-invoice');
                Route::post('/update/{id}', [MarketingController::class, 'updateInvoice'])->name('mad.update-invoice');
                Route::post('/lunas/{id}', [MarketingOrderController::class, 'tandaiLunas'])->name('mad.tandai-lunas');
                Route::delete('/hapus/{id}', [MarketingOrderController::class, 'hapusInvoice'])->name('mad.hapus-invoice');
            });

            Route::get('/marketing-order', [MarketingOrderController::class, 'create'])->name('mad.create');
        });
    });

    /* |--- KHUSUS PRODUKSI (Divisi 5) --- */
    Route::middleware(['checkRole:5'])->group(function () {
        Route::get('/produksi', [ProduksiController::class, 'index'])->name('produksi');
        Route::post('/produksi/simpan', [ProduksiController::class, 'simpan'])->name('produksi.simpan');
    });

    /* |--- KHUSUS LOGISTIK (Divisi 6) --- */
    Route::middleware(['checkRole:6'])->group(function () {
        Route::prefix('logistik')->group(function () {
            Route::get('/', [LogistikController::class, 'index'])->name('logistik');
            Route::post('/kirim-dari-marketing/{id}', [LogistikController::class, 'kirimDariMarketing'])->name('logistik.kirim-dari-marketing');
            Route::get('/cetak-surat-jalan/{id}', [LogistikController::class, 'cetakSuratJalan'])->name('logistik.cetak');
            Route::post('/logistik/simpan-keluar', [LogistikController::class, 'simpanKeluar'])->name('logistik.simpan-keluar');
        });
    });

});
