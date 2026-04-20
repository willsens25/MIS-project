@extends('layouts.app')

@section('content')
<div class="container py-4 text-start">
    {{-- Atas: Welcome & Jam --}}
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 class="fw-800 mb-0">Ringkasan Direktorat</h3>
            <p class="text-muted small">Halo, <span class="text-primary fw-bold">{{ auth()->user()->name }}</span>. Pantau data MIS hari ini.</p>
        </div>
        <div class="card border-0 shadow-sm px-4 py-2 bg-white text-center" style="border-radius: 15px;">
            <h4 class="fw-800 mb-0 text-primary" id="clock">{{ now()->format('H.i.s') }}</h4>
            <div class="text-muted" style="font-size: 10px;">{{ now()->translatedFormat('l, d F Y') }}</div>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm mb-4" style="border-radius: 12px;">
            {{ session('success') }}
        </div>
    @endif

    {{-- Stats Utama --}}
    <div class="row g-3 mb-4">
        <div class="col-md-6">
            <div class="card border-0 shadow-sm p-4 bg-white h-100" style="border-radius: 20px; border-left: 5px solid #198754 !important;">
                <small class="text-muted fw-bold text-uppercase" style="letter-spacing: 1px;">Total Saldo Kas</small>
                <h2 class="fw-800 mb-0 mt-2">Rp {{ number_format($saldo_direktorat ?? 0, 0, ',', '.') }}</h2>
                <div class="mt-2 text-success small fw-bold"><i class="bi bi-wallet2"></i> Saldo Gabungan Akun</div>
            </div>
        </div>
        <div class="col-md-6">
            <a href="{{ route('identitas.index') }}" class="text-decoration-none text-inherit">
                <div class="card border-0 shadow-sm p-4 bg-white h-100 clickable-card" style="border-radius: 20px; border-left: 5px solid #0d6efd !important; transition: 0.3s;">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <small class="text-muted fw-bold text-uppercase" style="letter-spacing: 1px;">Database Identitas</small>
                            <h2 class="fw-800 mb-0 mt-2">{{ $total_orang ?? 0 }} <small class="text-muted fw-normal fs-6">Entri</small></h2>
                        </div>
                        <i class="bi bi-arrow-right-circle text-primary fs-3"></i>
                    </div>
                    <div class="mt-2 text-primary small fw-bold">Kelola Anggota <i class="bi bi-chevron-right"></i></div>
                </div>
            </a>
        </div>
    </div>

    {{-- Chart Section --}}
    <div class="card border-0 shadow-sm p-4 bg-white mb-4" style="border-radius: 20px;">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h6 class="fw-800 m-0">Arus Kas Bulanan ({{ now()->format('F Y') }})</h6>
            <div class="d-flex gap-3">
                <small class="text-muted"><span class="badge bg-success-subtle p-1"> </span> Masuk</small>
                <small class="text-muted"><span class="badge bg-danger-subtle p-1"> </span> Keluar</small>
            </div>
        </div>
        <div style="height: 300px; width: 100%;">
            <canvas id="ChartKeuangan"></canvas>
        </div>
    </div>

    {{-- Section Bawah --}}
    <div class="row g-4">
        <div class="col-md-4">
            <div class="card border-0 shadow-sm p-4 bg-white h-100" style="border-radius: 20px;">
                <h6 class="fw-800 mb-3">Manajemen Akses</h6>
                <div class="d-grid gap-2">
                    <button class="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-3 fw-bold" style="border-radius: 12px;" data-bs-toggle="modal" data-bs-target="#modalDetailAnggota">
                        <i class="bi bi-people-fill"></i> User Sistem
                    </button>
                    <button class="btn btn-success d-flex align-items-center justify-content-center gap-2 py-3 fw-bold" style="border-radius: 12px;" data-bs-toggle="modal" data-bs-target="#modalTambahUser">
                        <i class="bi bi-person-plus-fill"></i> + Tambah Anggota
                    </button>
                </div>
            </div>
        </div>
        <div class="col-md-8">
            <div class="card border-0 shadow-sm p-4 bg-white h-100" style="border-radius: 20px; border-left: 5px solid #ffc107 !important;">
                <h6 class="fw-800 mb-1">Status Penagihan</h6>
                <p class="text-muted small mb-4">Ringkasan invoice lunas bulan ini.</p>

                <div class="row align-items-center">
                    <div class="col-sm-6">
                        <div class="d-flex align-items-baseline gap-2">
                            <h1 class="fw-800 text-warning m-0" style="font-size: 3.5rem;">{{ $totalLunas ?? 0 }}</h1>
                            <span class="text-muted fw-bold">Invoice Lunas</span>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="p-3 bg-light rounded-3">
                            <div class="d-flex justify-content-between mb-2 small">
                                <span>Admin Aktif:</span>
                                <span class="fw-bold">{{ count($anggota_list ?? []) }} User</span>
                            </div>
                            <div class="d-flex justify-content-between small">
                                <span>Status Server:</span>
                                <span class="text-success fw-bold">Online <i class="bi bi-check-circle-fill"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Log Aktivitas Sistem --}}
    <div class="row mt-4">
        <div class="col-12">
            <div class="card border-0 shadow-sm p-4 bg-white" style="border-radius: 20px;">
                <h6 class="fw-800 mb-3"><i class="bi bi-clock-history me-2 text-primary"></i> Log Aktivitas Terbaru</h6>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr style="font-size: 11px; letter-spacing: 0.5px;">
                                <th class="text-uppercase text-muted px-3">Waktu</th>
                                <th class="text-uppercase text-muted">User</th>
                                <th class="text-uppercase text-muted">Aksi</th>
                                <th class="text-uppercase text-muted">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse(\App\Models\ActivityLog::with('user')->latest()->take(5)->get() as $log)
                            <tr>
                                <td class="px-3">
                                    <small class="text-muted">{{ $log->created_at->diffForHumans() }}</small>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 24px; height: 24px; font-size: 10px;">
                                            <i class="bi bi-person"></i>
                                        </div>
                                        <span class="small fw-bold">{{ $log->user->name ?? 'System' }}</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-info-subtle text-info rounded-pill px-3" style="font-size: 10px;">{{ $log->aksi }}</span>
                                </td>
                                <td>
                                    <span class="small text-muted">{{ $log->keterangan }}</span>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center py-4 text-muted small">Belum ada aktivitas terekam.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- MODAL TAMBAH ANGGOTA BARU --}}
<div class="modal fade" id="modalTambahUser" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-800 mb-0 text-success">Daftarkan Anggota Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('admin.storeUser') }}" method="POST">
                @csrf
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="small fw-bold text-muted">Nama Lengkap</label>
                        <input type="text" name="name" class="form-control" placeholder="Input nama anggota..." required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold text-muted">Email Login</label>
                        <input type="email" name="email" class="form-control" placeholder="nama@email.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold text-muted">Password Sementara</label>
                        <input type="password" name="password" class="form-control" placeholder="Min. 3 karakter" required>
                    </div>
                    <div class="mb-0">
                        <label class="small fw-bold text-muted">Penempatan Divisi</label>
                        <select name="divisi_id" class="form-select" required>
                            <option value="">-- Pilih Divisi --</option>
                            @foreach($divisi_list ?? [] as $div)
                                <option value="{{ $div->id }}">{{ $div->nama_divisi }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div class="modal-footer border-0 p-4 pt-0">
                    <button type="submit" class="btn btn-success w-100 py-2 fw-bold">Simpan & Beri Akses</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- MODAL USER DENGAN FITUR HAPUS --}}
<div class="modal fade" id="modalDetailAnggota" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-800 mb-0">User Sistem Aktif</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                @foreach($anggota_list ?? [] as $u)
                <div class="p-3 bg-light rounded-3 mb-2 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <div class="fw-bold" style="font-size: 14px;">{{ $u->name }}</div>
                            <div class="small text-muted" style="font-size: 11px;">{{ $u->email }}</div>
                        </div>
                        <span class="badge bg-white text-primary border border-primary px-2 py-1 rounded-pill" style="font-size: 9px;">Divisi {{ $u->divisi_id }}</span>
                    </div>

                    @if($u->id !== auth()->id())
                    <form action="{{ route('anggota.hapus', $u->id) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus akses user ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-link text-danger p-0 shadow-none">
                            <i class="bi bi-trash3-fill fs-5"></i>
                        </button>
                    </form>
                    @else
                    <span class="text-muted small px-2" style="font-size: 10px; font-style: italic;">(Anda)</span>
                    @endif
                </div>
                @endforeach
            </div>
        </div>
    </div>
</div>

<style>
    .fw-800 { font-weight: 800; }
    .clickable-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; cursor: pointer; }
    .text-inherit { color: inherit; }
    .table thead th { border: none; }
</style>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Realtime Clock
    setInterval(() => {
        document.getElementById('clock').innerText = new Date().toLocaleTimeString('id-ID', {hour12: false}).replace(/:/g, '.');
    }, 1000);

    // Chart.js Configuration
    const ctx = document.getElementById('ChartKeuangan').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: {!! json_encode($labels) !!},
            datasets: [
                {
                    label: 'Masuk',
                    data: {!! json_encode($dataset_masuk) !!},
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#10B981'
                },
                {
                    label: 'Keluar',
                    data: {!! json_encode($dataset_keluar) !!},
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#EF4444'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { usePointStyle: true, font: { family: 'Inter', size: 12 } }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': Rp ' + context.parsed.y.toLocaleString('id-ID');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        font: { size: 11 },
                        callback: (val) => 'Rp ' + val.toLocaleString('id-ID')
                    }
                },
                x: { grid: { display: false }, ticks: { font: { size: 11 } } }
            }
        }
    });
</script>
@endpush
