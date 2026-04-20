<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{User, Divisi, Identitas, Book, Invoice, Mutasi, ActivityLog, Penyaluran, LogisticLog};
use Illuminate\Support\Facades\{Auth, DB};

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Redirect menggunakan match (Lebih clean daripada switch-case)
        return match ((int)$user->divisi_id) {
            1 => $this->renderDirektorat(),
            2 => redirect()->route('finance.index'),
            4 => $this->renderMarketing(),
            5 => $this->indexProduksi(),
            6 => $this->indexLogistik(),
            default => $this->renderDirektorat(),
        };
    }

    private function renderDirektorat()
    {
        // 1. Hitung Saldo Global (Gunakan Cache jika data sudah sangat besar nantinya)
        $mutasiSums = Mutasi::selectRaw("SUM(CASE WHEN tipe = 'Masuk' THEN nominal ELSE 0 END) as masuk")
                            ->selectRaw("SUM(CASE WHEN tipe = 'Keluar' THEN nominal ELSE 0 END) as keluar")
                            ->first();

        $saldo_direktorat = $mutasiSums->masuk - $mutasiSums->keluar;

        // 2. Logic Grafik (Optimasi: Hanya 1 Query ke Database, bukan 14 query dalam loop)
        $labels = collect();
        $dataset_masuk = collect();
        $dataset_keluar = collect();

        $startDate = now()->subDays(6)->startOfDay();

        // Ambil semua data mutasi 7 hari terakhir sekaligus
        $dailyMutasi = Mutasi::where('tanggal', '>=', $startDate)
            ->selectRaw('DATE(tanggal) as date, tipe, SUM(nominal) as total')
            ->groupBy('date', 'tipe')
            ->get()
            ->groupBy('date');

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $labels->push(now()->subDays($i)->format('d M'));

            $dayData = $dailyMutasi->get($date) ?? collect();
            $dataset_masuk->push($dayData->where('tipe', 'Masuk')->first()->total ?? 0);
            $dataset_keluar->push($dayData->where('tipe', 'Keluar')->first()->total ?? 0);
        }

        // 3. Data Tambahan (Gunakan Eager Loading 'divisi' agar query lebih efisien)
        $total_orang = Identitas::count();
        $totalLunas = Invoice::where('status', 'Lunas')->count();
        $anggota_list = User::with('divisi')->get(); // <--- Pakai relasi yang baru dibuat!
        $divisi_list = Divisi::all();

        return view('dashboards.direktorat', compact(
            'saldo_direktorat', 'labels', 'dataset_masuk', 'dataset_keluar',
            'total_orang', 'totalLunas', 'anggota_list', 'divisi_list'
        ));
    }

    // ... renderMarketing, indexProduksi, indexLogistik tetap sama ...

    public function updateAnggota(Request $request, $id) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'divisi_id' => 'required|exists:divisi,id'
        ]);

        $user = User::findOrFail($id);
        $user->update($request->only('name', 'email', 'divisi_id'));

        $this->logActivity('Update Data', 'Mengubah data anggota: ' . $user->name, $request->ip());

        return back()->with('success', 'Data anggota berhasil diperbarui.');
    }

    public function hapusAnggota($id) {
        if ($id == Auth::id()) return back()->with('error', 'Anda tidak bisa menghapus akun sendiri!');

        $user = User::findOrFail($id);
        $this->logActivity('Hapus Anggota', 'Menghapus anggota bernama: ' . $user->name, request()->ip());

        $user->delete();
        return back()->with('success', 'Anggota berhasil dihapus.');
    }

    /**
     * Helper log agar kode tidak berulang-ulang
     */
    private function logActivity($aksi, $ket, $ip) {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'aksi' => $aksi,
            'model' => 'User',
            'keterangan' => $ket,
            'ip_address' => $ip
        ]);
    }
}
