@extends('layouts.app')

@section('content')
<div class="container py-4 text-start">
    {{-- Atas: Welcome & Jam --}}
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 pb-3 border-bottom border-light-subtle">
        <div>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-primary fw-bold">Direktorat Utama</li>
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-muted fw-semibold">Dashboard Ringkasan</li>
                </ol>
            </nav>
            <h2 class="fw-extrabold text-dark tracking-tight mb-1">Ringkasan Direktorat</h2>
            <p class="text-muted small mb-0">Halo, <span class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fw-bold">{{ auth()->user()->name }}</span>. Pantau data ekosistem MIS hari ini.</p>
        </div>
        <div class="card border-0 shadow-sm bg-white rounded-4 overflow-hidden position-relative d-inline-flex align-items-center flex-row px-4 py-2.5" style="min-width: 240px;">
            <div class="bg-primary-subtle text-primary p-2.5 rounded-3 me-3">
                <i class="bi bi-clock-fill fs-4"></i>
            </div>
            <div>
                <h4 class="fw-extrabold mb-0 text-dark tracking-tight" id="clock">{{ now()->format('H.i.s') }}</h4>
                <div class="text-muted fw-medium text-uppercase tracking-wider" style="font-size: 10px;">{{ now()->translatedFormat('l, d F Y') }}</div>
            </div>
        </div>
    </div>

    {{-- Alert Notifikasi Sukses --}}
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show border-0 shadow-sm mb-4 rounded-4" role="alert">
            <div class="d-flex align-items-center">
                <i class="bi bi-check-circle-fill me-3 fs-4 text-success"></i>
                <div class="fw-medium text-success-tight">{{ session('success') }}</div>
            </div>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    {{-- Stats Utama --}}
    <div class="row g-3 mb-4">
        <div class="col-md-6">
            <div class="card card-stat border-0 shadow-sm bg-white h-100 rounded-4 position-relative overflow-hidden p-4">
                {{-- Decorative Background Icon (Watermark Terkunci Belakang) --}}
                <div class="position-absolute text-success" style="right: -15px; bottom: -25px; font-size: 8rem; opacity: 0.08; pointer-events: none; line-height: 1; z-index: 0;">
                    <i class="bi bi-cash-stack"></i>
                </div>

                {{-- Content (Dilapisi z-index agar di depan) --}}
                <div class="position-relative" style="z-index: 1;">
                    <div class="d-flex align-items-center mb-3">
                        <div class="bg-success-subtle text-success rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px; min-width: 40px;">
                            <i class="bi bi-wallet2 fs-5"></i>
                        </div>
                        <div>
                            <div class="text-uppercase tracking-wider text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">Total Saldo Kas</div>
                        </div>
                    </div>

                    <h1 class="fw-extrabold mb-1 text-dark tracking-tight mt-2">Rp {{ number_format($saldo_direktorat ?? 0, 0, ',', '.') }}</h1>
                    <div class="text-success small fw-semibold mt-2 d-flex align-items-center gap-1">
                        <i class="bi bi-layers-half"></i> Saldo Gabungan Seluruh Akun
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <a href="{{ route('identitas.index') }}" class="text-decoration-none text-inherit">
                <div class="card card-stat border-0 shadow-sm bg-white h-100 rounded-4 position-relative overflow-hidden p-4 clickable-card">
                    {{-- Decorative Background Icon (Watermark Terkunci Belakang) --}}
                    <div class="position-absolute text-primary" style="right: -15px; bottom: -25px; font-size: 8rem; opacity: 0.08; pointer-events: none; line-height: 1; z-index: 0;">
                        <i class="bi bi-person-lines-fill"></i>
                    </div>

                    {{-- Content (Dilapisi z-index agar di depan) --}}
                    <div class="position-relative" style="z-index: 1;">
                        <div class="d-flex align-items-center justify-content-between mb-3">
                            <div class="d-flex align-items-center">
                                <div class="bg-primary-subtle text-primary rounded-3 d-flex align-items-center justify-content-center me-3" style="width: 40px; height: 40px; min-width: 40px;">
                                    <i class="bi bi-database-fill-check fs-5"></i>
                                </div>
                                <div>
                                    <div class="text-uppercase tracking-wider text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.5px;">Database Identitas</div>
                                </div>
                            </div>
                            <i class="bi bi-arrow-right-circle-fill text-primary fs-4 transition-transform shadow-icon"></i>
                        </div>

                        <h1 class="fw-extrabold mb-1 text-dark tracking-tight mt-2">{{ $total_orang ?? 0 }} <span class="fs-5 fw-semibold text-muted">Entri</span></h1>
                        <div class="text-primary small fw-semibold mt-2 d-flex align-items-center gap-1">
                            Kelola Anggota Terdaftar <i class="bi bi-chevron-right small"></i>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </div>

    {{-- Chart Section --}}
    <div class="card border-0 shadow-sm p-4 bg-white mb-4 rounded-4">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-2">
            <div>
                <h5 class="fw-extrabold m-0 text-dark tracking-tight">Arus Kas Bulanan</h5>
                <p class="text-muted small mb-0">Visualisasi dinamika transaksi periode {{ now()->format('F Y') }}</p>
            </div>
            <div class="d-flex gap-3 bg-light px-3 py-1.5 rounded-pill border">
                <small class="text-secondary fw-semibold d-flex align-items-center"><span class="badge bg-success p-1 me-1.5 rounded-circle"> </span> Masuk</small>
                <small class="text-secondary fw-semibold d-flex align-items-center"><span class="badge bg-danger p-1 me-1.5 rounded-circle"> </span> Keluar</small>
            </div>
        </div>
        <div style="height: 320px; width: 100%;">
            <canvas id="ChartKeuangan"></canvas>
        </div>
    </div>

    {{-- Section Bawah --}}
    <div class="row g-4 mb-4">
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm p-4 bg-white h-100 rounded-4">
                <div class="mb-3">
                    <h5 class="fw-extrabold mb-1 text-dark tracking-tight">Manajemen Akses</h5>
                    <p class="text-muted small">Kendali hak akses entitas pengguna.</p>
                </div>
                <div class="d-grid gap-2.5 my-auto">
                    <button class="btn btn-action-secondary d-flex align-items-center justify-content-between px-3.5 py-3 fw-bold rounded-3 shadow-none border" data-bs-toggle="modal" data-bs-target="#modalDetailAnggota">
                        <span class="d-flex align-items-center gap-2"><i class="bi bi-people-fill text-primary fs-5"></i> User Sistem Aktif</span>
                        <span class="badge bg-primary rounded-pill px-2 py-1 small">{{ count($anggota_list ?? []) }}</span>
                    </button>
                    <button class="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-3 fw-bold rounded-3 shadow-sm" data-bs-toggle="modal" data-bs-target="#modalTambahUser">
                        <i class="bi bi-person-plus-fill"></i> Daftarkan Anggota Baru
                    </button>
                </div>
            </div>
        </div>
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm p-4 bg-white h-100 rounded-4">
                <div class="mb-2">
                    <h5 class="fw-extrabold mb-1 text-dark tracking-tight">Status Penagihan & Infrastruktur</h5>
                    <p class="text-muted small">Informasi kesehatan server dan siklus dokumen keuangan.</p>
                </div>

                <div class="row align-items-center g-3 mt-1">
                    <div class="col-sm-6">
                        <div class="bg-light p-3.5 rounded-4 border border-light-dark d-flex align-items-center">
                            <div class="bg-warning-subtle text-warning p-3 rounded-3 me-3">
                                <i class="bi bi-file-earmark-check-fill fs-3"></i>
                            </div>
                            <div>
                                <h1 class="fw-extrabold text-dark m-0 lh-1">{{ $totalLunas ?? 0 }}</h1>
                                <span class="text-muted small fw-bold text-uppercase tracking-wider">Invoice Lunas</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="p-3 bg-light rounded-4 border border-light-dark h-100 d-flex flex-column justify-content-center">
                            <div class="d-flex justify-content-between mb-2.5 small align-items-center">
                                <span class="text-secondary fw-semibold">Administrator Aktif:</span>
                                <span class="badge bg-white text-dark border fw-bold px-2.5 py-1 rounded-3">{{ count($anggota_list ?? []) }} User</span>
                            </div>
                            <div class="d-flex justify-content-between small align-items-center">
                                <span class="text-secondary fw-semibold">Status Server Core:</span>
                                <span class="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill fw-bold d-inline-flex align-items-center">
                                    <span class="pulse-indicator me-1.5"></span> Online
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Log Aktivitas Sistem --}}
    <div class="row">
        <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div class="p-4 bg-white border-bottom border-light">
                    <h5 class="fw-extrabold mb-0 text-dark tracking-tight"><i class="bi bi-clock-history me-2 text-primary"></i> Log Aktivitas Terbaru</h5>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-thead-modern border-bottom text-uppercase tracking-wider small">
                            <tr>
                                <th class="ps-4 py-3">Waktu</th>
                                <th class="py-3">User</th>
                                <th class="py-3">Aksi</th>
                                <th class="pe-4 py-3">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody class="border-0">
                            @forelse(\App\Models\ActivityLog::with('user')->latest()->take(5)->get() as $log)
                            <tr class="table-row-modern">
                                <td class="ps-4">
                                    <div class="d-flex align-items-center gap-1.5 text-secondary small fw-medium">
                                        <i class="bi bi-calendar3 opacity-50"></i>
                                        {{ $log->created_at->diffForHumans() }}
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center py-1">
                                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2.5 fw-bold" style="width: 28px; height: 28px; font-size: 11px;">
                                            {{ strtoupper(substr($log->user->name ?? 'S', 0, 1)) }}
                                        </div>
                                        <span class="small fw-bold text-dark">{{ $log->user->name ?? 'System' }}</span>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3 py-1 fw-bold" style="font-size: 10px;">{{ $log->aksi }}</span>
                                </td>
                                <td class="pe-4">
                                    <span class="small text-secondary fw-medium">{{ $log->keterangan }}</span>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center py-5 text-muted small">
                                    <i class="bi bi-inbox opacity-25 d-block fs-1 mb-2"></i>
                                    Belum ada aktivitas terekam pada sistem.
                                </td>
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
        <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-extrabold mb-0 text-success tracking-tight"><i class="bi bi-person-plus-fill me-2"></i>Daftarkan Anggota Baru</h5>
                <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('admin.storeUser') }}" method="POST">
                @csrf
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="small fw-bold text-secondary mb-1.5">Nama Lengkap</label>
                        <input type="text" name="name" class="form-control border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" placeholder="Input nama anggota..." required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold text-secondary mb-1.5">Email Login</label>
                        <input type="email" name="email" class="form-control border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" placeholder="nama@email.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold text-secondary mb-1.5">Password Sementara</label>
                        <input type="password" name="password" class="form-control border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" placeholder="Min. 3 karakter" required>
                    </div>
                    <div class="mb-0">
                        <label class="small fw-bold text-secondary mb-1.5">Penempatan Divisi</label>
                        <select name="divisi_id" class="form-select border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" required>
                            <option value="" selected disabled>-- Pilih Divisi --</option>
                            @foreach($divisi_list ?? [] as $div)
                                <option value="{{ $div->id }}">{{ $div->nama_divisi }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div class="modal-footer border-0 p-4 pt-0">
                    <button type="submit" class="btn btn-success w-100 py-2.5 fw-bold rounded-3 shadow-sm">Simpan & Beri Akses</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- MODAL USER DENGAN FITUR HAPUS --}}
<div class="modal fade" id="modalDetailAnggota" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-extrabold mb-0 text-dark tracking-tight"><i class="bi bi-shield-lock-fill me-2 text-primary"></i>User Sistem Aktif</h5>
                <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                @foreach($anggota_list ?? [] as $u)
                <div class="p-3 bg-light border rounded-3 mb-2.5 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center overflow-hidden me-2">
                        <div class="bg-white border rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 text-primary fw-bold" style="width: 36px; height: 36px;">
                            {{ strtoupper(substr($u->name, 0, 1)) }}
                        </div>
                        <div class="overflow-hidden">
                            <div class="fw-bold text-dark text-truncate" style="font-size: 14px;">{{ $u->name }}</div>
                            <div class="text-muted text-truncate mb-1" style="font-size: 11px;">{{ $u->email }}</div>
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 rounded-pill" style="font-size: 9px;">Divisi {{ $u->divisi_id }}</span>
                        </div>
                    </div>

                    @if($u->id !== auth()->id())
                    <form action="{{ route('anggota.hapus', $u->id) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus akses user ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-icon-delete rounded-3 p-2 border shadow-none">
                            <i class="bi bi-trash3-fill fs-6"></i>
                        </button>
                    </form>
                    @else
                    <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-3 small flex-shrink-0" style="font-size: 10px; font-style: italic;">Anda</span>
                    @endif
                </div>
                @endforeach
            </div>
        </div>
    </div>
</div>

<style>
    /* Premium Typography & Variable Overrides */
    .fw-extrabold { font-weight: 800; }
    .text-inherit { color: inherit; }

    /* Breadcrumb Utilities */
    .breadcrumb-item + .breadcrumb-item::before { content: "•"; color: #adb5bd; font-weight: bold; }

    /* Modern Action Secondary Card Button */
    .btn-action-secondary {
        background: #fff;
        color: #4a5568;
        border-color: #edf2f7;
        transition: all 0.25s ease;
    }
    .btn-action-secondary:hover {
        background: #f7fafc;
        border-color: #cbd5e0;
    }

    .btn-primary { background-color: #4361ee; border-color: #4361ee; }
    .btn-primary:hover { background-color: #3046c8; border-color: #3046c8; }
    .btn-success { background-color: #2ec4b6; border-color: #2ec4b6; }
    .btn-success:hover { background-color: #24a196; border-color: #24a196; }

    /* Hover States for Stat Widgets */
    .card-stat {
        transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .card-stat:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.06) !important;
    }
    .clickable-card:hover .shadow-icon {
        transform: translateX(4px);
    }
    .transition-transform { transition: transform 0.2s ease; }

    /* Table System UI Integration */
    .table-thead-modern th {
        background-color: #f8fafc;
        color: #64748b;
        font-weight: 700;
        font-size: 0.75rem;
        letter-spacing: 0.75px;
        border-top: none;
    }
    .table-row-modern { transition: background-color 0.2s ease; }
    .table-row-modern:hover { background-color: #f8fafc !important; }

    /* Utility Indicators & Form Borders */
    .border-light-dark { border: 1.5px solid #edf2f7; }
    .form-control:focus, .form-select:focus {
        background-color: #fff !important;
        border-color: #4361ee !important;
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
    }
    .text-success-tight { color: #155724; }

    /* Trash Action Inside Modal */
    .btn-icon-delete {
        background-color: #fff;
        color: #e63946;
        border-color: #f8d7da;
        transition: all 0.2s ease;
    }
    .btn-icon-delete:hover {
        background-color: #e63946;
        color: #fff;
        border-color: #e63946;
    }

    /* Live Green Pulse Server Indicator */
    .pulse-indicator {
        width: 8px;
        height: 8px;
        background-color: #2ec4b6;
        border-radius: 50%;
        display: inline-block;
        animation: pulse-animation 2s infinite;
    }
    @keyframes pulse-animation {
        0% { box-shadow: 0 0 0 0 rgba(46, 196, 182, 0.5); }
        70% { box-shadow: 0 0 0 6px rgba(46, 196, 182, 0); }
        100% { box-shadow: 0 0 0 0 rgba(46, 196, 182, 0); }
    }
</style>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Realtime Clock
    setInterval(() => {
        document.getElementById('clock').innerText = new Date().toLocaleTimeString('id-ID', {hour12: false}).replace(/:/g, '.');
    }, 1000);

    // Modernized Chart.js Configuration
    const ctx = document.getElementById('ChartKeuangan').getContext('2d');

    const gradMasuk = ctx.createLinearGradient(0, 0, 0, 300);
    gradMasuk.addColorStop(0, 'rgba(46, 196, 182, 0.2)');
    gradMasuk.addColorStop(1, 'rgba(46, 196, 182, 0.0)');

    const gradKeluar = ctx.createLinearGradient(0, 0, 0, 300);
    gradKeluar.addColorStop(0, 'rgba(230, 57, 70, 0.15)');
    gradKeluar.addColorStop(1, 'rgba(230, 57, 70, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: {!! json_encode($labels) !!},
            datasets: [
                {
                    label: 'Masuk',
                    data: {!! json_encode($dataset_masuk) !!},
                    borderColor: '#2ec4b6',
                    backgroundColor: gradMasuk,
                    borderWidth: 3.5,
                    fill: true,
                    tension: 0.38,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#2ec4b6'
                },
                {
                    label: 'Keluar',
                    data: {!! json_encode($dataset_keluar) !!},
                    borderColor: '#e63946',
                    backgroundColor: gradKeluar,
                    borderWidth: 3.5,
                    fill: true,
                    tension: 0.38,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#e63946'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    padding: 12,
                    cornerRadius: 10,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1e293b',
                    titleFont: { size: 13, weight: 'bold' },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            return ' ' + context.dataset.label + ': Rp ' + context.parsed.y.toLocaleString('id-ID');
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9', drawTicks: false },
                    border: { dash: [5, 5] },
                    ticks: {
                        color: '#64748b',
                        font: { size: 11, weight: '500' },
                        callback: (val) => 'Rp ' + val.toLocaleString('id-ID'),
                        padding: 10
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#64748b', font: { size: 11, weight: '500' }, padding: 8 }
                }
            }
        }
    });
</script>
@endpush
