<?php

namespace App\Http\Controllers;

use App\Models\Identitas;
use App\Models\Divisi;
use App\Models\Transaksi;
use App\Models\IdentitasAddress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class IdentitasController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $identitas = Identitas::with(['divisi', 'addresses'])
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

        // Statistik
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
    DB::transaction(function () use ($request) {
        $identitas = Identitas::create([
            'nomor_identitas' => $request->nomor_identitas,
            'nama_ktp' => $request->nama_ktp,
            'nama_lengkap' => $request->nama_lengkap,
            'panggilan' => $request->panggilan,
            'sapaan' => $request->sapaan,
            // ... field lainnya
        ]);

        // Simpan HP Primary
        if ($request->nomor_hp) {
            $identitas->contacts()->create([
                'type' => 'hp',
                'value' => $request->nomor_hp,
                'is_primary' => true
            ]);
        }

        // Simpan Email Primary
        if ($request->email) {
            $identitas->contacts()->create([
                'type' => 'email',
                'value' => $request->email,
                'is_primary' => true
            ]);
        }
    });
}

    public function show($id)
    {
    $identitas = Identitas::with('divisi', 'primaryAddress')->findOrFail($id);
    $totalDonasi = 0;
    $totalSalur = 0;
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
            'nama_lengkap'     => 'required|string|max:255',
            'nomor_identitas'  => 'required|string|max:50|unique:identitas,nomor_identitas,'.$id,
            'divisi_id'        => 'required|exists:divisi,id',
        ]);

        try {
            DB::beginTransaction();

            $identitas->update([
                'nama_lengkap'      => strtoupper($request->nama_lengkap),
                'panggilan'         => $request->panggilan,
                'nomor_identitas'   => $request->nomor_identitas,
                'jenis_identitas'   => $request->jenis_identitas,
                'divisi_id'         => $request->divisi_id,
                'status_keamanan'   => $request->status_keamanan,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'nomor_hp_primary'  => $request->nomor_hp_primary,
                'email'             => $request->email,
                'pekerjaan'         => $request->pekerjaan,
                'alamat'            => $request->alamat,
                'kota'              => $request->kota,
                'triyana'           => $request->triyana,
                'jenis_umat'        => $request->jenis_umat,
                'bhante_lay'        => $request->bhante_lay,
                'is_agen_purna'     => $request->has('is_agen_purna'),
                'is_dharma_patriot' => $request->has('is_dharma_patriot'),
            ]);

            DB::commit();
            return redirect()->route('identitas.show', $identitas->id)
                            ->with('success', 'Data berhasil diperbarui!');

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
