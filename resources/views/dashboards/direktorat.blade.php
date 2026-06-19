@extends('layouts.app')

@section('content')
<div class="container py-5 text-start">
    {{-- Atas: Welcome & Jam --}}
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-4">
        <div>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-2 custom-breadcrumb">
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-primary-gradient fw-bold">Direktorat Utama</li>
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-muted opacity-75 fw-semibold">Dashboard Ringkasan</li>
                </ol>
            </nav>
            <h1 class="fw-black text-dark tracking-tight mb-2 display-6">Ringkasan Direktorat</h1>
            <p class="text-secondary small mb-0">Selamat datang kembali, <span class="badge bg-primary-soft text-primary px-3 py-1.5 rounded-pill fw-bold">{{ auth()->user()->name }}</span>. Berikut adalah ekosistem data MIS hari ini.</p>
        </div>

        {{-- Premium Glassmorphism Clock Card --}}
        <div class="card border-0 glass-card premium-clock rounded-4 d-inline-flex align-items-center flex-row px-4 py-3 shadow-smooth" style="min-width: 280px;">
            <div class="clock-icon-container p-3 rounded-3 me-3 d-flex align-items-center justify-content-center position-relative">
                <i class="bi bi-clock-fill fs-4 text-primary z-1"></i>
                <span class="clock-radar-pulse"></span>
            </div>
            <div class="d-flex flex-column">
                <div class="d-flex align-items-baseline mb-1">
                    <h2 class="fw-black mb-0 tracking-tight text-dark tabular-nums" id="clock-hours" style="font-size: 1.85rem;">{{ now()->format('H') }}</h2>
                    <span class="clock-separator mx-1.5 fw-bold text-primary">:</span>
                    <h2 class="fw-black mb-0 tracking-tight text-dark tabular-nums" id="clock-minutes" style="font-size: 1.85rem;">{{ now()->format('i') }}</h2>
                    <span class="clock-separator mx-1.5 fw-bold text-primary">:</span>
                    <span class="fw-bold text-muted tabular-nums fs-6" id="clock-seconds" style="min-width: 22px;">{{ now()->format('s') }}</span>
                </div>
                <div class="text-muted fw-bold text-uppercase tracking-wider font-monospace" style="font-size: 10px; letter-spacing: 1px;">
                    {{ now()->translatedFormat('l, d F Y') }}
                </div>
            </div>
        </div>
    </div>

    {{-- Alert Notifikasi Sukses --}}
    @if(session('success'))
        <div class="alert alert-modern-success alert-dismissible fade show border-0 shadow-smooth mb-5 rounded-4 p-4" role="alert">
            <div class="d-flex align-items-center">
                <div class="alert-icon-circle bg-success text-white me-3">
                    <i class="bi bi-check-lg fs-5"></i>
                </div>
                <div class="fw-semibold text-dark">{{ session('success') }}</div>
            </div>
            <button type="button" class="btn-close shadow-none top-50 translate-middle-y me-2" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    {{-- Stats Utama --}}
    <div class="row g-4 mb-5">
        <div class="col-md-6">
            <div class="card card-premium-stat border-0 shadow-smooth h-100 rounded-4 position-relative overflow-hidden p-4 bg-gradient-light">
                <div class="position-absolute text-success opacity-05" style="right: -20px; bottom: -30px; font-size: 10rem; pointer-events: none; line-height: 1; z-index: 0;">
                    <i class="bi bi-cash-stack"></i>
                </div>

                <div class="position-relative z-1">
                    <div class="d-flex align-items-center mb-4">
                        <div class="stat-icon-box bg-success-soft text-success rounded-3 me-3">
                            <i class="bi bi-wallet2 fs-5"></i>
                        </div>
                        <span class="text-uppercase tracking-wider text-muted fw-extrabold" style="font-size: 11px; letter-spacing: 1px;">Total Saldo Kas</span>
                    </div>

                    <h1 class="fw-black mb-2 text-dark tracking-tight">Rp {{ number_format($saldo_direktorat ?? 0, 0, ',', '.') }}</h1>
                    <div class="text-success small fw-bold d-inline-flex align-items-center gap-1.5 bg-success-soft px-2.5 py-1 rounded-pill" style="font-size: 11px;">
                        <i class="bi bi-layers-half"></i> Saldo Gabungan Seluruh Akun
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-6">
            <a href="{{ route('identitas.index') }}" class="text-decoration-none text-inherit">
                <div class="card card-premium-stat border-0 shadow-smooth h-100 rounded-4 position-relative overflow-hidden p-4 bg-gradient-light clickable-card">
                    <div class="position-absolute text-primary opacity-05" style="right: -20px; bottom: -30px; font-size: 10rem; pointer-events: none; line-height: 1; z-index: 0;">
                        <i class="bi bi-person-lines-fill"></i>
                    </div>

                    <div class="position-relative z-1">
                        <div class="d-flex align-items-center justify-content-between mb-4">
                            <div class="d-flex align-items-center">
                                <div class="stat-icon-box bg-primary-soft text-primary rounded-3 me-3">
                                    <i class="bi bi-database-fill-check fs-5"></i>
                                </div>
                                <span class="text-uppercase tracking-wider text-muted fw-extrabold" style="font-size: 11px; letter-spacing: 1px;">Database Identitas</span>
                            </div>
                            <div class="arrow-circle bg-white border shadow-sm text-primary transition-all">
                                <i class="bi bi-arrow-right-short fs-4"></i>
                            </div>
                        </div>

                        <h1 class="fw-black mb-2 text-dark tracking-tight">{{ $total_orang ?? 0 }} <span class="fs-4 fw-bold text-muted opacity-70">Entri</span></h1>
                        <div class="text-primary small fw-bold d-inline-flex align-items-center gap-1" style="font-size: 11px;">
                            Kelola Anggota Terdaftar <i class="bi bi-chevron-right style-chevron"></i>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </div>

    {{-- Chart Section --}}
    <div class="card border-0 shadow-smooth p-4 bg-white mb-5 rounded-4">
        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
            <div>
                <h4 class="fw-black m-0 text-dark tracking-tight">Arus Kas Bulanan</h4>
                <p class="text-muted small mb-0">Visualisasi dinamika transaksi periode {{ now()->format('F Y') }}</p>
            </div>
            <div class="d-flex gap-4 bg-light px-4 py-2 rounded-pill border border-light-subtle">
                <small class="text-secondary fw-bold d-flex align-items-center"><span class="indicator-dot bg-success me-2"></span> Masuk</small>
                <small class="text-secondary fw-bold d-flex align-items-center"><span class="indicator-dot bg-danger me-2"></span> Keluar</small>
            </div>
        </div>
        <div style="height: 340px; width: 100%;">
            <canvas id="ChartKeuangan"></canvas>
        </div>
    </div>

    {{-- Section Bawah --}}
    <div class="row g-4 mb-5">
        <div class="col-lg-4">
            <div class="card border-0 shadow-smooth p-4 bg-white h-100 rounded-4 d-flex flex-column justify-content-between">
                <div class="mb-4">
                    <h4 class="fw-black mb-1 text-dark tracking-tight">Manajemen Akses</h4>
                    <p class="text-muted small mb-0">Kendali hak akses entitas pengguna.</p>
                </div>
                <div class="d-grid gap-3 w-100">
                    <button class="btn btn-modern-action-secondary d-flex align-items-center justify-content-between px-4 py-3 fw-bold rounded-3 border" data-bs-toggle="modal" data-bs-target="#modalDetailAnggota">
                        <span class="d-flex align-items-center gap-2.5"><i class="bi bi-people-fill text-primary fs-5"></i> User Sistem Aktif</span>
                        <span class="badge bg-primary rounded-pill px-3 py-1.5 small font-monospace">{{ count($anggota_list ?? []) }}</span>
                    </button>
                    <button class="btn btn-modern-primary d-flex align-items-center justify-content-center gap-2 py-3 fw-bold rounded-3 shadow-sm" data-bs-toggle="modal" data-bs-target="#modalTambahUser">
                        <i class="bi bi-person-plus-fill"></i> Daftarkan Anggota Baru
                    </button>
                </div>
            </div>
        </div>
        <div class="col-lg-8">
            <div class="card border-0 shadow-smooth p-4 bg-white h-100 rounded-4 d-flex flex-column justify-content-between">
                <div class="mb-3">
                    <h4 class="fw-black mb-1 text-dark tracking-tight">Status Penagihan & Infrastruktur</h4>
                    <p class="text-muted small mb-0">Informasi kesehatan server dan siklus dokumen keuangan.</p>
                </div>

                <div class="row align-items-center g-3 mt-1">
                    <div class="col-sm-6">
                        <div class="p-4 rounded-4 bg-gradient-light border border-light-subtle d-flex align-items-center h-100">
                            <div class="stat-icon-box big-box bg-warning-soft text-warning rounded-3 me-3">
                                <i class="bi bi-file-earmark-check-fill fs-3"></i>
                            </div>
                            <div>
                                <h1 class="fw-black text-dark m-0 lh-1 mb-1">{{ $totalLunas ?? 0 }}</h1>
                                <span class="text-muted small fw-extrabold text-uppercase tracking-wider" style="font-size: 10px;">Invoice Lunas</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="p-4 bg-gradient-light rounded-4 border border-light-subtle h-100 d-flex flex-column justify-content-center gap-3">
                            <div class="d-flex justify-content-between small align-items-center">
                                <span class="text-secondary fw-semibold">Administrator Aktif:</span>
                                <span class="badge bg-white text-dark border border-light-subtle fw-bold px-3 py-1.5 rounded-3 font-monospace shadow-xs">{{ count($anggota_list ?? []) }} User</span>
                            </div>
                            <div class="d-flex justify-content-between small align-items-center">
                                <span class="text-secondary fw-semibold">Status Server Core:</span>
                                <span class="badge bg-success-soft text-success border border-success-subtle px-3 py-1.5 rounded-pill fw-bold d-inline-flex align-items-center">
                                    <span class="pulse-indicator-live me-2"></span> Online
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
            <div class="card border-0 shadow-smooth rounded-4 overflow-hidden bg-white">
                <div class="p-4 bg-white border-bottom border-light">
                    <h4 class="fw-black mb-0 text-dark tracking-tight"><i class="bi bi-clock-history me-2 text-primary-gradient"></i> Log Aktivitas Terbaru</h4>
                </div>
                <div class="table-responsive px-4 pt-3 pb-2">
                    <table class="table table-borderless align-middle mb-0">
                        <thead>
                            <tr class="text-uppercase tracking-wider small text-muted opacity-75 border-bottom border-light" style="font-size: 11px; font-weight: 700;">
                                <th class="pb-3 ps-2">Waktu</th>
                                <th class="pb-3">User</th>
                                <th class="pb-3">Aksi</th>
                                <th class="pb-3 pe-2">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse(\App\Models\ActivityLog::with('user')->latest()->take(5)->get() as $log)
                            <tr class="modern-table-row border-bottom border-light">
                                <td class="py-3 ps-2">
                                    <div class="d-flex align-items-center gap-2 text-secondary small fw-medium">
                                        <i class="bi bi-calendar3 opacity-50"></i>
                                        {{ $log->created_at->diffForHumans() }}
                                    </div>
                                </td>
                                <td class="py-3">
                                    <div class="d-flex align-items-center">
                                        <div class="user-avatar-circle bg-primary-soft text-primary me-2.5 fw-bold">
                                            {{ strtoupper(substr($log->user->name ?? 'S', 0, 1)) }}
                                        </div>
                                        <span class="small fw-bold text-dark">{{ $log->user->name ?? 'System' }}</span>
                                    </div>
                                </td>
                                <td class="py-3">
                                    <span class="badge bg-info-soft text-info border border-info-subtle rounded-pill px-3 py-1 fw-bold" style="font-size: 10px;">{{ $log->aksi }}</span>
                                </td>
                                <td class="py-3 pe-2">
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
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header border-0 p-4 pb-0 bg-white">
                <h5 class="fw-black mb-0 text-dark tracking-tight"><i class="bi bi-person-plus-fill me-2 text-success"></i>Daftarkan Anggota Baru</h5>
                <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
            </div>
            <form action="{{ route('admin.storeUser') }}" method="POST">
                @csrf
                <div class="modal-body p-4 bg-white">
                    <div class="mb-3">
                        <label class="small fw-bold text-secondary mb-2">Nama Lengkap</label>
                        <input type="text" name="name" class="form-control modern-input px-3 py-2.5" placeholder="Masukkan nama lengkap..." required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold text-secondary mb-2">Email Login</label>
                        <input type="email" name="email" class="form-control modern-input px-3 py-2.5" placeholder="nama@email.com" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold text-secondary mb-2">Password Sementara</label>
                        <input type="password" name="password" class="form-control modern-input px-3 py-2.5" placeholder="Minimal 3 karakter" required>
                    </div>
                    <div class="mb-0">
                        <label class="small fw-bold text-secondary mb-2">Penempatan Divisi</label>
                        <select name="divisi_id" class="form-select modern-input px-3 py-2.5" required>
                            <option value="" selected disabled>-- Pilih Divisi --</option>
                            @foreach($divisi_list ?? [] as $div)
                                <option value="{{ $div->id }}">{{ $div->nama_divisi }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
                <div class="modal-footer border-0 p-4 pt-0 bg-white">
                    <button type="submit" class="btn btn-modern-success w-100 py-3 fw-bold rounded-3 shadow-sm">Simpan & Beri Akses</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- MODAL USER DENGAN FITUR HAPUS --}}
<div class="modal fade" id="modalDetailAnggota" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="modal-header border-0 p-4 pb-0 bg-white">
                <h5 class="fw-black mb-0 text-dark tracking-tight"><i class="bi bi-shield-lock-fill me-2 text-primary"></i>User Sistem Aktif</h5>
                <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4 bg-white">
                @foreach($anggota_list ?? [] as $u)
                <div class="p-3 border border-light-subtle rounded-4 mb-3 d-flex justify-content-between align-items-center bg-gradient-light">
                    <div class="d-flex align-items-center overflow-hidden me-2">
                        <div class="user-avatar-circle bg-white border border-light-subtle rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0 text-primary fw-bold shadow-xs" style="width: 42px; height: 42px;">
                            {{ strtoupper(substr($u->name, 0, 1)) }}
                        </div>
                        <div class="overflow-hidden">
                            <div class="fw-bold text-dark text-truncate mb-0.5" style="font-size: 14px;">{{ $u->name }}</div>
                            <div class="text-muted text-truncate mb-1.5" style="font-size: 11px;">{{ $u->email }}</div>
                            <span class="badge bg-primary-soft text-primary px-2.5 py-1 rounded-pill" style="font-size: 9px; font-weight: 700;">Divisi {{ $u->divisi_id }}</span>
                        </div>
                    </div>

                    @if($u->id !== auth()->id())
                    <form action="{{ route('anggota.hapus', $u->id) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus akses user ini?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn btn-modern-delete rounded-3 p-2.5 border shadow-none">
                            <i class="bi bi-trash3-fill"></i>
                        </button>
                    </form>
                    @else
                    <span class="badge bg-secondary-soft text-secondary px-2.5 py-1.5 rounded-3 small flex-shrink-0 font-monospace" style="font-size: 10px; font-weight: 700;">YOU</span>
                    @endif
                </div>
                @endforeach
            </div>
        </div>
    </div>
</div>

<style>
    /* Typography & Core Helpers */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

    :root {
        --font-sans: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }

    body {
        font-family: var(--font-sans);
        background-color: #f8fafc;
    }

    .fw-extrabold { font-weight: 800; }
    .fw-black { font-weight: 900; }
    .text-inherit { color: inherit; }
    .tabular-nums { font-variant-numeric: tabular-nums; }
    .opacity-05 { opacity: 0.04; }
    .shadow-xs { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

    /* Shadow Smooth Mechanics */
    .shadow-smooth {
        box-sizing: border-box;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02) !important;
    }

    /* Gradients & Soft Badges colors */
    .text-primary-gradient {
        background: linear-gradient(135deg, #4361ee 0%, #3a0ca3 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .bg-primary-soft { background-color: rgba(67, 97, 238, 0.08) !important; }
    .bg-success-soft { background-color: rgba(46, 196, 182, 0.08) !important; }
    .bg-warning-soft { background-color: rgba(255, 159, 28, 0.08) !important; }
    .bg-info-soft { background-color: rgba(72, 149, 239, 0.08) !important; }
    .bg-secondary-soft { background-color: rgba(100, 116, 139, 0.08) !important; }

    /* Glassmorphism Premium Clock UI */
    .glass-card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.6) !important;
    }
    .clock-icon-container { background-color: rgba(67, 97, 238, 0.06); }
    .clock-separator { animation: blink-effect 1s steps(2, start) infinite; display: inline-block; }
    @keyframes blink-effect { to { visibility: hidden; } }

    .clock-radar-pulse {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0; left: 0;
        background-color: rgba(67, 97, 238, 0.12);
        border-radius: 8px;
        animation: radar-wave 3.5s infinite ease-in-out;
        z-index: 0;
    }
    @keyframes radar-wave {
        0% { transform: scale(0.95); opacity: 0.4; }
        50% { transform: scale(1.1); opacity: 0.8; }
        100% { transform: scale(0.95); opacity: 0.4; }
    }

    /* Custom Breadcrumbs style */
    .custom-breadcrumb .breadcrumb-item + .breadcrumb-item::before {
        content: "→";
        color: #94a3b8;
        font-size: 10px;
    }

    /* Modernized Inputs */
    .modern-input {
        background-color: #f8fafc !important;
        border: 1.5px solid #e2e8f0 !important;
        color: #1e293b !important;
        border-radius: 10px !important;
        transition: all 0.2s ease-in-out !important;
    }
    .modern-input:focus {
        background-color: #ffffff !important;
        border-color: #4361ee !important;
        box-shadow: 0 0 0 4px rgba(67, 97, 238, 0.12) !important;
    }

    /* Modern Background Fill for Containers */
    .bg-gradient-light {
        background: linear-gradient(180deg, #ffffff 0%, #fdfdfe 100%);
        border: 1px solid #f1f5f9 !important;
    }

    /* Premium Stat Cards Interaction */
    .card-premium-stat {
        transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    }
    .card-premium-stat:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.06), 0 2px 5px rgba(0, 0, 0, 0.02) !important;
    }
    .stat-icon-box {
        width: 44px; height: 44px; min-width: 44px;
        display: flex; align-items: center; justify-content: center;
    }
    .stat-icon-box.big-box { width: 56px; height: 56px; min-width: 56px; }

    /* Custom Clickable Actions Indicator */
    .arrow-circle { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .clickable-card:hover .arrow-circle {
        background-color: #4361ee !important;
        color: white !important;
        border-color: #4361ee !important;
    }
    .clickable-card:hover .style-chevron { transform: translateX(3px); }
    .style-chevron { transition: transform 0.2s ease; }

    /* Premium Button Frameworks */
    .btn-modern-primary {
        background: linear-gradient(135deg, #4361ee 0%, #3046c8 100%);
        color: white; border: none; transition: all 0.2s ease;
    }
    .btn-modern-primary:hover {
        background: linear-gradient(135deg, #3855df 0%, #2539b3 100%);
        transform: translateY(-1px);
        box-shadow: 0 8px 16px rgba(67, 97, 238, 0.2);
    }
    .btn-modern-success {
        background: linear-gradient(135deg, #2ec4b6 0%, #20ac9f 100%);
        color: white; border: none; transition: all 0.2s ease;
    }
    .btn-modern-success:hover {
        background: linear-gradient(135deg, #24b5a7 0%, #19988c 100%);
        box-shadow: 0 8px 16px rgba(46, 196, 182, 0.2);
    }
    .btn-modern-action-secondary {
        background: #ffffff; color: #475569; border-color: #e2e8f0; transition: all 0.2s ease;
    }
    .btn-modern-action-secondary:hover {
        background: #f8fafc; color: #1e293b; border-color: #cbd5e1;
    }

    /* Separate Table System Formatting */
    .modern-table-row { transition: background-color 0.2s ease; }
    .modern-table-row:hover { background-color: #f8fafc !important; }
    .user-avatar-circle {
        width: 32px; height: 32px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 11px; font-weight: 700;
    }

    /* Soft Alert Box */
    .alert-modern-success {
        background-color: #ecfdf5;
        border: 1px solid #d1fae5 !important;
    }
    .alert-icon-circle {
        width: 36px; height: 36px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
    }

    /* Live Mini Pulse Indicator */
    .pulse-indicator-live {
        width: 8px; height: 8px; background-color: #2ec4b6; border-radius: 50%; display: inline-block;
        animation: soft-pulse 2s infinite;
    }
    @keyframes soft-pulse {
        0% { box-shadow: 0 0 0 0 rgba(46, 196, 182, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(46, 196, 182, 0); }
        100% { box-shadow: 0 0 0 0 rgba(46, 196, 182, 0); }
    }
    .indicator-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

    /* Trash Action Interface Component */
    .btn-modern-delete {
        background-color: #ffffff; color: #ef4444; border-color: #fee2e2; transition: all 0.2s ease;
    }
    .btn-modern-delete:hover {
        background-color: #ef4444; color: #ffffff; border-color: #ef4444;
    }
</style>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
    // Realtime Accurate Clock Logic
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock-hours').innerText = String(now.getHours()).padStart(2, '0');
        document.getElementById('clock-minutes').innerText = String(now.getMinutes()).padStart(2, '0');
        document.getElementById('clock-seconds').innerText = String(now.getSeconds()).padStart(2, '0');
    }, 1000);

    // Premium Area & Line Chart.js Configuration
    const ctx = document.getElementById('ChartKeuangan').getContext('2d');

    const gradientIn = ctx.createLinearGradient(0, 0, 0, 320);
    gradientIn.addColorStop(0, 'rgba(46, 196, 182, 0.18)');
    gradientIn.addColorStop(1, 'rgba(46, 196, 182, 0.0)');

    const gradientOut = ctx.createLinearGradient(0, 0, 0, 320);
    gradientOut.addColorStop(0, 'rgba(230, 57, 70, 0.14)');
    gradientOut.addColorStop(1, 'rgba(230, 57, 70, 0.0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: {!! json_encode($labels) !!},
            datasets: [
                {
                    label: 'Masuk',
                    data: {!! json_encode($dataset_masuk) !!},
                    borderColor: '#2ec4b6',
                    backgroundColor: gradientIn,
                    borderWidth: 3.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6,
                    pointHitRadius: 20,
                    pointBackgroundColor: '#2ec4b6',
                    pointHoverBackgroundColor: '#2ec4b6',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                },
                {
                    label: 'Keluar',
                    data: {!! json_encode($dataset_keluar) !!},
                    borderColor: '#e63946',
                    backgroundColor: gradientOut,
                    borderWidth: 3.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 6,
                    pointHitRadius: 20,
                    pointBackgroundColor: '#e63946',
                    pointHoverBackgroundColor: '#e63946',
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    padding: 14,
                    backgroundColor: '#1e293b',
                    titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: '700' },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 12, weight: '500' },
                    cornerRadius: 12,
                    mode: 'index',
                    intersect: false,
                    boxPadding: 6,
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
                    border: { dash: [6, 6], display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
                        callback: (val) => 'Rp ' + val.toLocaleString('id-ID'),
                        padding: 12
                    }
                },
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }, padding: 10 }
                }
            }
        }
    });
</script>
@endpush
