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

        $identitas = Identitas::with(['divisi', 'addresses', 'contacts'])
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

        // Statistik Global
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
    try {
        DB::beginTransaction();

        $valId = $request->input('nomor_identitas');

        $identitas = Identitas::create([
            'no_ktp'            => $valId,
            'nomor_identitas'   => $valId,
            'nama_ktp'          => $request->nama_ktp ?? $request->nama_lengkap,
            'nama_lengkap'      => strtoupper($request->nama_lengkap),
            'panggilan'         => $request->panggilan,
            'nama_panggilan'    => $request->panggilan,
            'gelar_panggilan'   => $request->gelar_panggilan ?? '',

            // Perhatikan bagian ini, pastikan name di form sama:
            'jenis_kelamin'     => $request->jenis_kelamin ?? '-',
            'tempat_lahir'      => $request->tempat_lahir ?? '-',
            'tanggal_lahir'     => $request->tanggal_lahir, // Jika date, biarkan null jika kosong
            'pekerjaan'         => $request->pekerjaan ?? '-',

            'agama'             => $request->agama ?? 'Buddha',
            'triyana'           => $request->triyana ?? '-',
            'kewarganegaraan'   => $request->kewarganegaraan ?? 'WNI',
            'divisi_id'         => $request->divisi_id,
            'status_keamanan'   => $request->status_keamanan ?? 'Normal',
            'is_agen_purna'     => $request->has('is_agen_purna') ? 1 : 0,
            'is_dharma_patriot' => $request->has('is_dharma_patriot') ? 1 : 0,
            'nomor_hp_primary'  => $request->nomor_hp_primary ?? '-',
            'email'             => $request->email ?? '-',
            'alamat'            => $request->alamat ?? '-',
            'kota'              => $request->kota ?? '-',
            'kategori_jarkom'   => 'Lainnya',
            'jenis_umat'        => $request->jenis_umat ?? 'Umat',
            'bhante_lay'        => 'Lay',
            'created_by'        => auth()->id() ?? 1,
        ]);

        DB::commit();
        return redirect()->route('identitas.index')->with('success', 'Berhasil!');
    } catch (\Exception $e) {
        DB::rollback();
        return redirect()->back()->with('error', $e->getMessage())->withInput();
    }
}

    public function show($id)
    {
        $identitas = Identitas::with(['divisi', 'addresses', 'contacts'])->findOrFail($id);

        $totalDonasi = Transaksi::where('identitas_id', $id)->where('jenis', 'DONASI')->sum('nominal');
        $totalSalur = Transaksi::where('identitas_id', $id)->where('jenis', 'SALUR')->sum('nominal');

        return view('identitas.show', compact('identitas', 'totalDonasi', 'totalSalur'));
    }

    public function edit($id)
    {
        $identitas = Identitas::with('contacts')->findOrFail($id);
        $divisi = Divisi::all();
        return view('identitas.edit', compact('identitas', 'divisi'));
    }

    public function update(Request $request, $id)
{
    $identitas = Identitas::findOrFail($id);

    try {
        DB::beginTransaction();

        // Ambil nilai identitas dari input 'nomor_identitas'
        $valId = $request->input('nomor_identitas');

        $identitas->update([
            'nama_lengkap'      => strtoupper($request->nama_lengkap),
            'nama_panggilan'    => $request->nama_panggilan,
            'panggilan'         => $request->nama_panggilan,
            'no_ktp'            => $valId, // Gunakan variabel $valId
            'nomor_identitas'   => $valId, // Gunakan variabel $valId
            'nama_ktp'          => $request->nama_ktp,
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
        // Debug jika masih gagal
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
