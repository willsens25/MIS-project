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
                    ->orWhere('panggilan', 'LIKE', "%{$search}%")
                    ->orWhere('nomor_identitas', 'LIKE', "%{$search}%")
                    ->orWhereHas('divisi', function($sq) use ($search) {
                        $sq->where('nama_divisi', 'LIKE', "%{$search}%");
                    });
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $divisi = Divisi::all();

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
            'nomor_identitas' => 'required',
            'nama_lengkap'    => 'required',
            'nomor_hp_primary' => 'required',
        ]);

        try {
            DB::beginTransaction();

            Identitas::create([
                'nama_lengkap'      => strtoupper($request->nama_lengkap),
                'panggilan'         => $request->panggilan,
                'jenis_identitas'   => $request->jenis_identitas,
                'nomor_identitas'   => $request->nomor_identitas,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'kewarganegaraan'   => 'WNI',
                'nomor_hp_primary'  => $request->nomor_hp_primary,
                'email'             => $request->email,
                'pekerjaan'         => $request->pekerjaan,
                'alamat'            => $request->alamat,
                'kota'              => $request->kota,
                'kode_pos'          => $request->kode_pos,
                'agama'             => $request->agama,
                'status_keamanan'   => 'Normal',
                'jenis_umat'        => $request->jenis_umat,
                'is_agen_purna'     => $request->has('is_agen_purna') ? 1 : 0,
                'is_dharma_patriot' => $request->has('is_dharma_patriot') ? 1 : 0,
                'divisi_id'         => $request->divisi_id ?: null,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Data anggota baru berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollback();
            $message = $e->getMessage();

            // Deteksi apakah benar-benar duplikat atau ada kolom kosong yang wajib diisi (NOT NULL)
            if (str_contains($message, 'Duplicate entry')) {
                $finalMessage = "Nomor Identitas ({$request->nomor_identitas}) sudah terdaftar di sistem!";
            } elseif (str_contains($message, 'cannot be null') || $e->getCode() == 23000) {
                $finalMessage = "Gagal Simpan: Ada kolom wajib di database yang belum terisi. Detail: " . $message;
            } else {
                $finalMessage = "Gagal Simpan: " . $message;
            }

            return redirect()->back()->with('error', $finalMessage)->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        $identitas = Identitas::findOrFail($id);

        $request->validate([
            'nomor_identitas' => 'required|unique:identitas,nomor_identitas,'.$id,
            'nama_lengkap'    => 'required',
            'nomor_hp_primary'=> 'required',
            'email'           => 'nullable|email',
        ]);

        try {
            DB::beginTransaction();

            $identitas->update([
                'nama_lengkap'      => strtoupper($request->nama_lengkap),
                'panggilan'         => $request->panggilan,
                'jenis_identitas'   => $request->jenis_identitas,
                'nomor_identitas'   => $request->nomor_identitas,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'nomor_hp_primary'  => $request->nomor_hp_primary,
                'email'             => $request->email,
                'pekerjaan'         => $request->pekerjaan,
                'alamat'            => $request->alamat,
                'kota'              => $request->kota,
                'kode_pos'          => $request->kode_pos,
                'agama'             => $request->agama,
                'triyana'           => $request->triyana,
                'status_keamanan'   => $request->status_keamanan ?? 'Normal',
                'jenis_umat'        => $request->jenis_umat,
                'bhante_lay'        => $request->bhante_lay,
                'kategori_jarkom'   => $request->kategori_jarkom,
                'is_agen_purna'     => $request->has('is_agen_purna') ? 1 : 0,
                'is_dharma_patriot' => $request->has('is_dharma_patriot') ? 1 : 0,
                'divisi_id'         => $request->divisi_id,
            ]);

            DB::commit();
            return redirect()->route('identitas.show', $identitas->id)->with('success', 'Data Profil Berhasil Diperbarui!');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Gagal Update: ' . $e->getMessage())->withInput();
        }
    }

    public function show($id)
    {
        $identitas = Identitas::with(['divisi'])->findOrFail($id);
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

    public function destroy($id)
    {
        $identitas = Identitas::findOrFail($id);
        $identitas->delete();
        return redirect()->route('identitas.index')->with('success', 'Data berhasil dihapus.');
    }
}
