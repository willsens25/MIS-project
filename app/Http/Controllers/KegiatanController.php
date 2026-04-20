<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kegiatan;

class KegiatanController extends Controller
{
    public function store(Request $request)
{
    $request->validate([
        'nama_kegiatan' => 'required|string|max:255',
        'tanggal_kegiatan' => 'required|date',
        'peran' => 'required|string',
    ]);

    Kegiatan::create([
        'identitas_id' => $request->identitas_id,
        'nama_kegiatan' => $request->nama_kegiatan,
        'tanggal_kegiatan' => $request->tanggal_kegiatan,
        'peran' => $request->peran,
        'lokasi' => $request->lokasi,
        'keterangan' => $request->keterangan,
        'user_id' => auth()->id(),
    ]);

    return back()->with('success', 'Kegiatan SAPA berhasil ditambahkan!');
}

public function update(Request $request, Kegiatan $kegiatan)
{
    $request->validate([
        'nama_kegiatan' => 'required',
        'tanggal_kegiatan' => 'required|date',
        'peran' => 'required',
    ]);

    $kegiatan->update($request->all());

    return back()->with('success', 'Kegiatan berhasil diperbarui!');
}

public function destroy(Kegiatan $kegiatan)
{
    $kegiatan->delete();
    return back()->with('success', 'Kegiatan berhasil dihapus!');
}

}
