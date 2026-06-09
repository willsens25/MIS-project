@extends('layouts.app')

@section('content')
<div class="container-fluid px-4 py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h1 class="h3 mb-0 text-gray-800" style="font-weight: 700; color: #1A365D;">Audit System Log</h1>
            <p class="text-muted mb-0">Rekam jejak aktivitas pengguna pada sistem MIS-Rapi.</p>
        </div>
        <div class="badge bg-primary px-3 py-2 fs-6">
            Total Log: {{ $logs->total() }}
        </div>
    </div>

    <div class="card shadow-sm border-0 rounded-3">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0" style="font-size: 14px;">
                    <thead style="background-color: #F8FAFC; border-bottom: 2px solid #E2E8F0;">
                        <tr>
                            <th class="px-4 py-3 text-secondary text-uppercase font-weight-bold" style="font-size: 11px; width: 15%;">Waktu</th>
                            <th class="py-3 text-secondary text-uppercase font-weight-bold" style="font-size: 11px; width: 15%;">Pengguna</th>
                            <th class="py-3 text-secondary text-uppercase font-weight-bold" style="font-size: 11px; width: 15%;">Aksi</th>
                            <th class="py-3 text-secondary text-uppercase font-weight-bold" style="font-size: 11px; width: 40%;">Keterangan</th>
                            <th class="py-3 text-secondary text-uppercase font-weight-bold text-end px-4" style="font-size: 11px; width: 15%;">IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($logs as $log)
                            <tr style="border-bottom: 1px solid #F1F5F9;">
                                <td class="px-4 text-muted">
                                    {{ \Carbon\Carbon::parse($log->created_at)->translatedFormat('d M Y, H:i') }} WIB
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="avatar-sm bg-light text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px; font-weight: bold; background-color: #EBF8FF !important;">
                                            {{ strtoupper(substr($log->user->name ?? 'U', 0, 1)) }}
                                        </div>
                                        <div>
                                            <span class="font-weight-bold text-dark d-block" style="font-weight: 600;">{{ $log->user->name ?? 'System' }}</span>
                                            <small class="text-muted" style="font-size: 11px;">{{ $log->user->divisi->nama_divisi ?? 'Tanpa Divisi' }}</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    @php
                                        // Berikan warna badge dinamis berdasarkan jenis aksi
                                        $badgeColor = 'bg-secondary';
                                        if(str_contains(strtolower($log->aksi), 'hapus')) $badgeColor = 'bg-danger';
                                        elseif(str_contains(strtolower($log->aksi), 'tambah') || str_contains(strtolower($log->aksi), 'simpan')) $badgeColor = 'bg-success';
                                        elseif(str_contains(strtolower($log->aksi), 'update') || str_contains(strtolower($log->aksi), 'ubah')) $badgeColor = 'bg-warning text-dark';
                                    @endphp
                                    <span class="badge {{ $badgeColor }} px-2.5 py-1.5 rounded-pill" style="font-size: 11px; font-weight: 500;">
                                        {{ $log->aksi }}
                                    </span>
                                </td>
                                <td class="text-secondary" style="color: #4A5568;">
                                    {{ $log->keterangan }}
                                </td>
                                <td class="text-end px-4 text-muted font-monospace" style="font-size: 12px;">
                                    <code>{{ $log->ip_address }}</code>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="text-center py-5 text-muted">
                                    <i class="bi bi-folder-x display-4 d-block mb-2"></i>
                                    Belum ada log aktivitas yang tercatat.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="text-muted" style="font-size: 13px;">
            Menampilkan {{ $logs->firstItem() ?? 0 }} sampai {{ $logs->lastItem() ?? 0 }} dari {{ $logs->total() }} log.
        </div>
        <div>
            {{ $logs->links('pagination::bootstrap-5') }}
        </div>
    </div>
</div>
@endsection
