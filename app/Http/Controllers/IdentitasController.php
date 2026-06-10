<?php

namespace App\Http\Controllers;

use App\Models\Identitas;
use App\Models\Divisi;
use App\Models\Transaksi;
use App\Models\ActivityLog;
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
            'jenis_identitas' => 'required_with:jenis_identitas,jenis_id',
        ]);

        try {
            DB::beginTransaction();

            // 1. OTOMATISASI NAMA LENGKAP: Diubah ke Huruf Kapital Semua (Sesuai Logika MIS Kamu)
            $namaUpper = strtoupper($request->nama_lengkap);

            // 2. OTOMATISASI NAMA PANGGILAN: Otomatis Title Case (Contoh: "willsen" -> "Willsen")
            $panggilanInput = $request->panggilan ?? $request->nama_panggilan;
            $panggilanClean = $panggilanInput ? ucwords(strtolower($panggilanInput)) : null;

            // 3. PEMBERSIHAN NOMOR HP / WHATSAPP (Standardisasi ke Format Angka Bersih)
            $noHpInput = $request->nomor_hp_primary ?? $request->nomor_whatsapp;
            $noHpClean = null;
            if ($noHpInput) {
                // Hapus spasi, strip, tanda plus, dll
                $noHpClean = preg_replace('/[^0-9]/', '', $noHpInput);
                // Jika user mengetik pakai kode negara (628xx), konversi otomatis ke format lokal (08xx) demi keseragaman
                if (str_starts_with($noHpClean, '62')) {
                    $noHpClean = '0' . substr($noHpClean, 2);
                }
            }

            Identitas::create([
                'nama_lengkap'      => $namaUpper,
                'panggilan'         => $panggilanClean,
                'jenis_identitas'   => $request->jenis_identitas ?? $request->jenis_id,
                'nomor_identitas'   => $request->nomor_identitas,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'kewarganegaraan'   => $request->kewarganegaraan ?? 'WNI',
                'nomor_hp_primary'  => $noHpClean, // Menggunakan nomor yang sudah dibersihkan
                'email'             => $request->email,
                'pekerjaan'         => $request->pekerjaan,
                'alamat'            => $request->alamat ?? $request->alamat_domisili,
                'kota'              => $request->kota,
                'kode_pos'          => $request->kode_pos,
                'agama'             => $request->agama ?? $request->agama_aliran,
                'status_keamanan'   => 'Normal',
                'jenis_umat'        => $request->jenis_umat ?? $request->kategori_anggota,
                'is_agen_purna'     => $request->has('is_agen_purna') && $request->is_agen_purna == 1 ? 1 : 0,
                'is_dharma_patriot' => $request->has('is_dharma_patriot') && $request->is_dharma_patriot == 1 ? 1 : 0,
                'divisi_id'         => $request->divisi_id ?: null,
                'created_by'        => auth()->id(), // 4. JALUR AMAN: Otomatis rekam user yang sedang login
            ]);

            ActivityLog::record(
                'Tambah Identitas',
                'Identitas',
                'Mendaftarkan anggota baru bernama "' . $namaUpper . '"'
            );

            DB::commit();
            return redirect()->back()->with('success', 'Data anggota baru berhasil disimpan!');

        } catch (\Exception $e) {
            DB::rollback();
            $message = $e->getMessage();

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
            'jenis_umat'      => 'required',
        ]);

        try {
            DB::beginTransaction();

            // 1. OTOMATISASI NAMA LENGKAP: Diubah ke Huruf Kapital Semua saat Update
            $namaUpper = strtoupper($request->nama_lengkap);

            // 2. OTOMATISASI NAMA PANGGILAN: Otomatis Title Case saat Update
            $panggilanInput = $request->panggilan ?? $request->nama_panggilan;
            $panggilanClean = $panggilanInput ? ucwords(strtolower($panggilanInput)) : null;

            // 3. PEMBERSIHAN NOMOR HP / WHATSAPP SAAT UPDATE
            $noHpInput = $request->nomor_hp_primary ?? $request->nomor_whatsapp;
            $noHpClean = null;
            if ($noHpInput) {
                $noHpClean = preg_replace('/[^0-9]/', '', $noHpInput);
                if (str_starts_with($noHpClean, '62')) {
                    $noHpClean = '0' . substr($noHpClean, 2);
                }
            }

            $identitas->update([
                'nama_lengkap'      => $namaUpper,
                'panggilan'         => $panggilanClean,
                'jenis_identitas'   => $request->jenis_identitas ?? $identitas->jenis_identitas,
                'nomor_identitas'   => $request->nomor_identitas,
                'jenis_kelamin'     => $request->jenis_kelamin,
                'nomor_hp_primary'  => $noHpClean, // Menggunakan nomor yang sudah dibersihkan
                'email'             => $request->email,
                'pekerjaan'         => $request->pekerjaan,
                'alamat'            => $request->alamat ?? $request->alamat_domisili,
                'kota'              => $request->kota,
                'kode_pos'          => $request->kode_pos,
                'agama'             => $request->agama ?? $request->agama_aliran,
                'triyana'           => $request->triyana,
                'status_keamanan'   => $request->status_keamanan ?? 'Normal',
                'jenis_umat'        => $request->jenis_umat ?? $request->kategori_anggota,
                'bhante_lay'        => $request->bhante_lay,
                'kategori_jarkom'   => $request->kategori_jarkom,
                'is_agen_purna'     => $request->is_agen_purna == '1' ? 1 : 0,
                'is_dharma_patriot' => $request->is_dharma_patriot == '1' ? 1 : 0,
                'divisi_id'         => $request->divisi_id,
            ]);

            ActivityLog::record(
                'Update Identitas',
                'Identitas',
                'Memperbarui data profil identitas ID: ' . $id . ' menjadi bernama "' . $namaUpper . '"'
            );

            DB::commit();
            return redirect()->route('identitas.show', $identitas->id)->with('success', 'Data Profil Berhasil Diperbarui!');

        } catch (\Exception $e) {
            DB::rollback();
            $message = $e->getMessage();

            if (str_contains($message, 'Duplicate entry')) {
                $finalMessage = "Gagal Update: Nomor Identitas sudah terdaftar di sistem!";
            } elseif (str_contains($message, 'cannot be null') || $e->getCode() == 23000) {
                $finalMessage = "Gagal Update: Ada kolom wajib di database yang belum terisi. Detail: " . $message;
            } else {
                $finalMessage = "Gagal Update: " . $message;
            }

            return redirect()->back()->with('error', $finalMessage)->withInput();
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
        $namaLama = $identitas->nama_lengkap;

        $identitas->delete();

        ActivityLog::record(
            'Hapus Identitas',
            'Identitas',
            'Menghapus data anggota bernama "' . $namaLama . '" (ID: ' . $id . ') dari sistem.'
        );

        return redirect()->route('identitas.index')->with('success', 'Data berhasil dihapus.');
    }
}
