<?php

namespace App\Http\Controllers;

use App\Models\Identitas;
use App\Models\Divisi;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IdentitasController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $identitas = Identitas::with(['divisi'])
            ->when($search, function($query) use ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('nama_lengkap', 'LIKE', "%{$search}%")
                    ->orWhere('nama_panggilan', 'LIKE', "%{$search}%")
                    ->orWhere('no_ktp', 'LIKE', "%{$search}%")
                    ->orWhereHas('divisi', function($sq) use ($search) {
                    $sq->where('nama_divisi', 'LIKE', "%{$search}%");
                    });
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $divisi = Divisi::all();

        // Statistik Global menggunakan Query Builder untuk efisiensi
        $stats = Transaksi::selectRaw("
            SUM(CASE WHEN jenis = 'DONASI' THEN nominal ELSE 0 END) as total_donasi,
            SUM(CASE WHEN jenis = 'SALUR' THEN nominal ELSE 0 END) as total_salur
        ")->first();

        $totalDonasiGlobal = $stats->total_donasi ?? 0;
        $totalSalurGlobal = $stats->total_salur ?? 0;
        $saldoKasGlobal = $totalDonasiGlobal - $totalSalurGlobal;

        $countAnggota = Identitas::count();
        $countDivisi = Divisi::count();

        return view('identitas.index', compact(
            'identitas', 'divisi', 'totalDonasiGlobal',
            'totalSalurGlobal', 'saldoKasGlobal', 'countAnggota', 'countDivisi'
        ));
    }

    public function store(Request $request)
{
    $request->validate([
        'nomor_identitas' => 'required|unique:identitas,nomor_identitas',
        'nama_lengkap'    => 'required',
    ]);

    try {
        Identitas::create([
            'nomor_identitas'   => $request->nomor_identitas,
            'no_ktp'            => $request->nomor_identitas,
            'nama_lengkap'      => strtoupper($request->nama_lengkap),
            'nama_ktp'          => strtoupper($request->nama_lengkap),
            'panggilan'         => $request->panggilan,
            'nama_panggilan'    => $request->panggilan,
            'jenis_identitas'   => $request->jenis_identitas,
            'jenis_kelamin'     => $request->jenis_kelamin,
            'agama'             => $request->agama,
            'email'             => $request->email,
            'nomor_hp_primary'  => $request->nomor_hp_primary,
            'jenis_umat'        => $request->jenis_umat,
            'alamat'            => $request->alamat,
            'divisi_id'         => $request->divisi_id,
            'status_keamanan'   => 'Normal',
            'kewarganegaraan'   => 'WNI',
        ]);

        return redirect()->back()->with('success', 'Data berhasil disimpan!');

    } catch (\Exception $e) {
        if ($e->getCode() == 23000) {
            return redirect()->back()->with('error', 'Nomor Identitas sudah terdaftar!')->withInput();
        }

        return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
    }
}

    public function show($id)
    {
        $identitas = Identitas::with(['divisi'])->findOrFail($id);

        // Hitung total donasi & salur spesifik anggota
        $totalDonasi = Transaksi::where('identitas_id', $id)->where('jenis', 'DONASI')->sum('nominal');
        $totalSalur = Transaksi::where('identitas_id', $id)->where('jenis', 'SALUR')->sum('nominal');

        return view('identitas.show', compact('identitas', 'totalDonasi', 'totalSalur'));
    }

    public function edit($id)
    {
        $identitas = Identitas::findOrFail($id);
        $divisi = Divisi::all();
        return view('identitas.edit', compact('identitas', 'divisi'));
    }

    public function update(Request $request, $id)
    {
        $identitas = Identitas::findOrFail($id);

        $request->validate([
            'nomor_identitas' => 'required|unique:identitas,nomor_identitas,'.$id,
            'nama_lengkap'    => 'required',
        ]);

        try {
            DB::beginTransaction();

            $valId = $request->input('nomor_identitas');

            $identitas->update([
                'nama_lengkap'      => strtoupper($request->nama_lengkap),
                'nama_panggilan'    => $request->nama_panggilan,
                'no_ktp'            => $valId,
                'nomor_identitas'   => $valId,
                'nama_ktp'          => $request->nama_ktp ?? $request->nama_lengkap,
                'divisi_id'         => $request->divisi_id,
                'status_keamanan'   => $request->status_keamanan,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'tempat_lahir'      => $request->tempat_lahir,
                'tanggal_lahir'     => $request->tanggal_lahir,
                'pekerjaan'         => $request->pekerjaan,
                'agama'             => $request->agama,
                'kewarganegaraan'   => $request->kewarganegaraan,
                'is_agen_purna'     => $request->has('is_agen_purna') ? 1 : 0,
                'is_dharma_patriot' => $request->has('is_dharma_patriot') ? 1 : 0,
            ]);

            DB::commit();
            return redirect()->route('identitas.show', $identitas->id)->with('success', 'Data berhasil diperbarui!');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Gagal Update: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy($id)
    {
        $identitas = Identitas::findOrFail($id);
        $identitas->delete();
        return redirect()->route('identitas.index')->with('success', 'Data berhasil dihapus.');
    }
}
