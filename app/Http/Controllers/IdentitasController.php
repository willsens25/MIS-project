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

        // Statistik Global menggunakan Query Builder
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
            'nomor_hp_primary' => 'required',
        ]);

        try {
            DB::beginTransaction();

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
                'tempat_lahir'      => $request->tempat_lahir,
                'tanggal_lahir'     => $request->tanggal_lahir,
                'is_agen_purna'     => $request->has('is_agen_purna') ? 1 : 0,
                'is_dharma_patriot' => $request->has('is_dharma_patriot') ? 1 : 0,
                'status_keamanan'   => 'Normal',
                'kewarganegaraan'   => 'WNI',
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Data anggota baru berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollback();
            $message = $e->getMessage();
            if ($e->getCode() == 23000 || str_contains($message, 'Duplicate entry')) {
                $message = 'Nomor Identitas (' . $request->nomor_identitas . ') sudah terdaftar!';
            }
            return redirect()->back()->with('error', 'Gagal Simpan: ' . $message)->withInput();
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

    // 1. Validasi Lengkap
    $request->validate([
        'nomor_identitas' => 'required|unique:identitas,nomor_identitas,'.$id,
        'nama_lengkap'    => 'required',
        'nomor_hp_primary'=> 'required',
        'email'           => 'nullable|email',
    ]);

    try {
        DB::beginTransaction();

        $valId = $request->input('nomor_identitas');

        // 2. Update Semua Kolom (Sesuai Struktur DB)
        $identitas->update([
            // Identitas Dasar
            'nama_lengkap'      => strtoupper($request->nama_lengkap),
            'nama_panggilan'    => $request->nama_panggilan,
            'panggilan'         => $request->nama_panggilan,
            'gelar_panggilan'   => $request->gelar_panggilan,
            'no_ktp'            => $valId,
            'nomor_identitas'   => $valId,
            'nama_ktp'          => strtoupper($request->nama_ktp ?? $request->nama_lengkap),
            'divisi_id'         => $request->divisi_id,

            // Kontak & Alamat (Komponen yang tadi kurang)
            'email'             => $request->email,
            'nomor_hp_primary'  => $request->nomor_hp_primary,
            'alamat'            => $request->alamat,
            'kota'              => $request->kota,
            'kode_pos'          => $request->kode_pos,

            // Biodata & Latar Belakang
            'jenis_kelamin'     => $request->jenis_kelamin,
            'tempat_lahir'      => $request->tempat_lahir,
            'tanggal_lahir'     => $request->tanggal_lahir,
            'agama'             => $request->agama,
            'pekerjaan'         => $request->pekerjaan,
            'kewarganegaraan'   => $request->kewarganegaraan ?? 'WNI',
            'jenis_umat'        => $request->jenis_umat,

            // Status Keanggotaan & Kategori (Sesuai Gambar DB)
            'status_keamanan'   => $request->status_keamanan ?? 'Normal',
            'is_agen_purna'     => $request->has('is_agen_purna') ? 1 : 0,
            'is_dharma_patriot' => $request->has('is_dharma_patriot') ? 1 : 0,
            'triyana'           => $request->triyana,
            'bhante_lay'        => $request->bhante_lay,
            'kategori_jarkom'   => $request->kategori_jarkom,
        ]);

        DB::commit();
        return redirect()->route('identitas.show', $identitas->id)->with('success', 'Data Profil Berhasil Diperbarui!');

    } catch (\Exception $e) {
        DB::rollback();
        return redirect()->back()
            ->with('error', 'Gagal Update: ' . $e->getMessage())
            ->withInput();
    }
}
    public function destroy($id)
    {
        $identitas = Identitas::findOrFail($id);
        $identitas->delete();
        return redirect()->route('identitas.index')->with('success', 'Data berhasil dihapus.');
    }
}
