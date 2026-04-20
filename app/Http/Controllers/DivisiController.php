<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Divisi;

class DivisiController extends Controller
{
    public function index() {
        $divisi = Divisi::all();
        return view('divisi.index', compact('divisi'));
    }

    public function initialize()
    {
        $daftarDivisi = [
            ['id' => 1, 'nama_divisi' => 'Direktorat'],
            ['id' => 2, 'nama_divisi' => 'Bendahara'],
            ['id' => 3, 'nama_divisi' => 'Penerbitan'],
            ['id' => 4, 'nama_divisi' => 'Marketing'],
            ['id' => 5, 'nama_divisi' => 'Produksi'],
            ['id' => 6, 'nama_divisi' => 'Logistik'],
        ];

        foreach ($daftarDivisi as $data) {
            Divisi::updateOrCreate(['id' => $data['id']], ['nama_divisi' => $data['nama_divisi']]);
        }

        return back()->with('success', 'Daftar Divisi berhasil disinkronkan dengan Sistem Role!');
    }

    public function store(Request $request) {
        $request->validate(['nama_divisi' => 'required|unique:divisis,nama_divisi']);
        Divisi::create($request->all());
        return back()->with('success', 'Divisi berhasil ditambahkan');
    }

    public function destroy($id) {
        Divisi::findOrFail($id)->delete();
        return back()->with('success', 'Divisi berhasil dihapus');
    }
}