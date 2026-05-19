<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Penjualan;
use App\Models\Mutasi;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class PenjualanController extends Controller
{
    public function create()
    {
        // Mengambil data untuk opsi dropdown di form
        $accounts = Account::all();
        $categories = Category::all();

        return view('pages.penjualan_form', compact('accounts', 'categories'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_pelanggan'    => 'required|string|max:255',
            'total_item'        => 'required|numeric|min:1',
            'total_bayar'       => 'required|numeric|min:0',
            'account_id'        => 'required|exists:accounts,id',
            'category_id'       => 'required|exists:categories,id',
            'tanggal_penjualan' => 'required|date',
        ]);

        try {
            // Memulai DB Transaction untuk memastikan kedua data tersimpan atau gagal bersamaan
            DB::transaction(function () use ($request) {

                // 1. Generate Nomor Invoice Otomatis
                $invoice = 'INV-' . date('Ymd') . '-' . strtoupper(substr(md5(microtime()), 0, 5));

                // 2. Simpan Rekap Penjualan & Orangnya
                Penjualan::create([
                    'no_invoice'        => $invoice,
                    'nama_pelanggan'    => $request->nama_pelanggan,
                    'total_item'        => $request->total_item,
                    'total_bayar'       => $request->total_bayar,
                    'tanggal_penjualan' => $request->tanggal_penjualan,
                ]);

                // 3. Suntik Otomatis ke Mutasi Finansial
                Mutasi::create([
                    'user_id'     => auth()->id(),
                    'account_id'  => $request->account_id,
                    'category_id' => $request->category_id,
                    'tanggal'     => $request->tanggal_penjualan,
                    'tipe'        => 'Masuk',
                    'nominal'     => $request->total_bayar,
                    'keterangan'  => "Penjualan Otomatis (" . $invoice . ") a.n " . $request->nama_pelanggan,
                    'jenis'       => 'Pemasukan',
                ]);
            });

            return redirect()->route('finance.index')
                ->with('success', 'Rekap penjualan berhasil disimpan dan otomatis masuk ke laporan mutasi keuangan!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }
}
