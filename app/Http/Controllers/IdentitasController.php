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

        $identitas = Identitas::with(['divisi', 'primaryAddress'])
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
            'no_ktp'           => 'required|string|max:50|unique:identitas,no_ktp',
            'nama_lengkap'     => 'required|string|max:255',
            'nama_panggilan'   => 'nullable|string|max:100',
            'gelar_panggilan'  => 'nullable|string',
            'jenis_kelamin'    => 'required|in:pria,wanita',
            'divisi_id'        => 'required|exists:divisi,id',
            'jenis_anggota'    => 'required|in:Umat,Sangha',
            'nomor_hp_primary' => 'required|string',
            'alamat_primary'   => 'required|string',
        ], [
            'no_ktp.unique'    => 'Gagal! Nomor KTP ini sudah terdaftar.',
            'nama_lengkap.required' => 'Nama wajib diisi sesuai KTP.',
        ]);

        try {
            DB::beginTransaction();

            $identitas = Identitas::create([
                'no_ktp'           => $request->no_ktp,
                'nama_ktp'         => $request->nama_ktp ?? $request->nama_lengkap,
                'nama_lengkap'     => strtoupper($request->nama_lengkap),
                'nama_panggilan'   => $request->nama_panggilan,
                'gelar_panggilan'  => $request->gelar_panggilan,
                'jenis_kelamin'    => $request->jenis_kelamin,
                'tempat_lahir'     => $request->tempat_lahir,
                'tanggal_lahir'    => $request->tanggal_lahir,
                'pekerjaan'        => $request->pekerjaan,
                'agama'            => $request->agama,
                'triyana'          => $request->triyana,
                'kewarganegaraan'  => $request->kewarganegaraan ?? 'WNI',
                'divisi_id'        => $request->divisi_id,
                'jenis_anggota'    => $request->jenis_anggota,
                'created_by'       => Auth::id(),
                'status_keamanan'  => $request->status_keamanan ?? 'Normal',
                'email'            => $request->email,
            ]);

            $identitas->addresses()->create([
                'nama_penerima'  => $request->nama_penerima ?? $request->nama_lengkap,
                'hp_penerima'    => $request->nomor_hp_primary,
                'alamat_lengkap' => $request->alamat_primary,
                'kelurahan'      => $request->kelurahan,
                'kecamatan'      => $request->kecamatan,
                'kota'           => $request->kota,
                'kode_pos'       => $request->kode_pos,
                'note'           => $request->note_pengiriman,
                'is_primary'     => true,
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Data ' . $request->gelar_panggilan . ' ' . $request->nama_panggilan . ' berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollback();
            return redirect()->back()->with('error', 'Gagal Simpan: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        $identitas = Identitas::with(['divisi', 'addresses', 'transaksi' => function($query) {
            $query->latest('tanggal_transaksi');
        }])->findOrFail($id);

        $totalDonasi = $identitas->transaksi->where('jenis', 'DONASI')->sum('nominal');
        $totalSalur = $identitas->transaksi->where('jenis', 'SALUR')->sum('nominal');

        return view('identitas.show', compact('identitas', 'totalDonasi', 'totalSalur'));
    }

    /**
     * Tampilkan halaman form edit (Method yang tadi hilang)
     */
    public function edit($id)
    {
        $identitas = Identitas::with('primaryAddress')->findOrFail($id);
        $divisi = Divisi::all();

        return view('identitas.edit', compact('identitas', 'divisi'));
    }

    public function update(Request $request, $id)
{
    $identitas = Identitas::findOrFail($id);

    // Sesuaikan validasi dengan nama input di view edit
    $request->validate([
        'nama_lengkap'      => 'required|string|max:255',
        'nomor_identitas'   => 'required|string|max:50|unique:identitas,no_ktp,'.$id, // Mapping ke kolom no_ktp
        'divisi_id'         => 'required|exists:divisi,id',
        'jenis_identitas'   => 'required',
    ]);

    try {
        DB::beginTransaction();

        // Update data identitas (Mapping input form ke kolom database)
        $identitas->update([
            'no_ktp'            => $request->nomor_identitas,
            'nama_lengkap'      => strtoupper($request->nama_lengkap),
            'nama_panggilan'    => $request->panggilan,
            'jenis_identitas'   => $request->jenis_identitas,
            'divisi_id'         => $request->divisi_id,
            'status_keamanan'   => $request->status_keamanan,
            'is_agen_purna'     => $request->is_agen_purna,
            'is_dharma_patriot' => $request->is_dharma_patriot,
        ]);

        // Jika ada perubahan nama atau info dasar, update juga data di alamat utama (opsional)
        if ($identitas->primaryAddress) {
            $identitas->primaryAddress()->update([
                'nama_penerima' => strtoupper($request->nama_lengkap),
            ]);
        }

        DB::commit();
        return redirect()->route('identitas.index')->with('success', 'Profil ' . $request->nama_lengkap . ' berhasil diperbarui!');

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

    public function exportPDF(Request $request)
    {
        $search = $request->input('search');
        $identitas = Identitas::with('transaksi', 'divisi', 'primaryAddress')
            ->when($search, function($query) use ($search) {
                $query->where('nama_lengkap', 'LIKE', "%{$search}%");
            })->get();

        $totals = Transaksi::selectRaw("
            SUM(CASE WHEN jenis = 'DONASI' THEN nominal ELSE 0 END) as total_donasi,
            SUM(CASE WHEN jenis = 'SALUR' THEN nominal ELSE 0 END) as total_salur
        ")->first();

        $pdf = Pdf::loadView('identitas.pdf', [
            'identitas' => $identitas,
            'totalDonasi' => $totals->total_donasi ?? 0,
            'totalSalur' => $totals->total_salur ?? 0
        ]);

        $pdf->setPaper('a4', 'portrait');
        return $pdf->stream('Laporan-Database-Identitas.pdf');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->ids;
        if (!$ids) {
            return response()->json(['success' => false, 'message' => 'Pilih data dulu!']);
        }

        Identitas::whereIn('id', explode(',', $ids))->delete();
        return response()->json(['success' => true, 'message' => 'Data terpilih berhasil dihapus!']);
    }
}
