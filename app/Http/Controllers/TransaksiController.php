<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use App\Models\Identitas;
use Illuminate\Http\Request;

class TransaksiController extends Controller
{
    // Menampilkan Form Input
    public function create(Request $request)
    {
        $selected_id = $request->query('identitas_id');
        
        $semua_identitas = Identitas::orderBy('nama_lengkap', 'asc')->get();

        return view('transaksi.create', compact('selected_id', 'semua_identitas'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'identitas_id' => 'required|exists:identitas,id',
            'jenis' => 'required|in:DONASI,SALUR',
            'nominal' => 'required|numeric|min:1',
            'tanggal_transaksi' => 'required|date|before_or_equal:today',
            'keterangan' => 'nullable|string|max:255',
        ], [
            'identitas_id.required' => 'Nama identitas harus dipilih.',
            'nominal.min' => 'Nominal transaksi minimal Rp 1.',
            'tanggal_transaksi.before_or_equal' => 'Tanggal tidak boleh melebihi hari ini.',
        ]);

        Transaksi::create($request->all());

        return redirect()->route('identitas.show', $request->identitas_id)
                        ->with('success', 'Transaksi berhasil ditambahkan!');
    }
}