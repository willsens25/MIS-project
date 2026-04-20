@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<div class="container-fluid py-4 px-4 main-profile-container" style="font-family: 'Inter', sans-serif;">
    {{-- Header & Navigasi --}}
    <div class="d-flex align-items-center mb-4 d-print-none">
        <a href="{{ route('identitas.index') }}" class="btn btn-white shadow-sm rounded-circle me-3 text-dark">
            <i class="bi bi-arrow-left"></i>
        </a>
        <div>
            <h4 class="fw-bold mb-0">Detail Profil Identitas</h4>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0 small text-muted">
                    <li class="breadcrumb-item"><a href="{{ route('identitas.index') }}" class="text-decoration-none text-primary">Database</a></li>
                    <li class="breadcrumb-item active">{{ $identitas->nama_lengkap }}</li>
                </ol>
            </nav>
        </div>
    </div>

    {{-- Alert Success --}}
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show d-print-none border-0 shadow-sm" role="alert">
            <div class="d-flex align-items-center">
                <i class="bi bi-check-circle-fill me-2"></i>
                <div>{{ session('success') }}</div>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    <div class="row g-4 print-row">
        {{-- KARTU PROFIL UTAMA (SISI KIRI) --}}
        <div class="col-lg-4 print-col-4">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                <div class="bg-primary py-5 text-center position-relative">
                    <div class="position-absolute top-0 end-0 p-3">
                        @php
                            $statusColor = ['Normal' => 'success', 'Pengawasan' => 'warning', 'Blacklist' => 'danger'][$identitas->status_keamanan] ?? 'secondary';
                        @endphp
                        <span class="badge rounded-pill bg-{{ $statusColor }} border border-white shadow-sm px-3 py-2">
                            {{ strtoupper($identitas->status_keamanan) }}
                        </span>
                    </div>
                </div>
                <div class="card-body text-center position-relative" style="margin-top: -50px;">
                    <div class="bg-white rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center border border-4 border-white mb-3" style="width: 100px; height: 100px;">
                        <i class="bi bi-person-circle text-secondary" style="font-size: 60px;"></i>
                    </div>
                    <h5 class="fw-bold mb-1 text-dark">{{ strtoupper($identitas->nama_lengkap) }}</h5>
                    <p class="text-muted small mb-3">ID: MIS-{{ str_pad($identitas->id, 5, '0', STR_PAD_LEFT) }}</p>
                    
                    <div class="d-flex justify-content-center gap-2 mb-4">
                        <span class="badge bg-dark px-3 py-2">{{ $identitas->divisi->kode ?? '???' }}</span>
                        <span class="badge bg-light text-dark border px-3 py-2 fw-medium">{{ $identitas->divisi->nama_divisi ?? 'N/A' }}</span>
                    </div>

                    <div class="border-top pt-3 mt-2 text-start px-3">
                        <label class="small text-muted fw-bold mb-1 d-block text-uppercase">Logistik & Keuangan (M-MON)</label>
                        <div class="row text-center mt-2 g-2">
                            <div class="col-6">
                                <div class="p-2 bg-light rounded-3 border text-truncate">
                                    <div class="small text-muted" style="font-size: 10px;">DONASI (IN)</div>
                                    <div class="fw-bold text-primary small">
                                        Rp {{ number_format($identitas->transaksi->where('jenis', 'DONASI')->sum('nominal'), 0, ',', '.') }}
                                    </div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="p-2 bg-light rounded-3 border text-truncate">
                                    <div class="small text-muted" style="font-size: 10px;">SALUR (OUT)</div>
                                    <div class="fw-bold text-danger small">
                                        Rp {{ number_format($identitas->transaksi->where('jenis', 'SALUR')->sum('nominal'), 0, ',', '.') }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="mt-3 d-print-none">
                            <a href="{{ route('transaksi.create', ['identitas_id' => $identitas->id]) }}"
                            class="btn btn-primary w-100 rounded-pill shadow-sm fw-bold small py-2 mb-2">
                                <i class="bi bi-plus-circle me-2"></i>TAMBAH TRANSAKSI
                            </a>
                            <div class="row g-2 mt-1">
                                <div class="col-6">
                                    <a href="{{ route('identitas.edit', $identitas->id) }}" class="btn btn-outline-secondary w-100 rounded-pill small py-2">
                                        <i class="bi bi-pencil-square me-1"></i> Edit
                                    </a>
                                </div>
                                <div class="col-6">
                                    <button class="btn btn-outline-dark w-100 rounded-pill small py-2" onclick="window.print()">
                                        <i class="bi bi-printer me-1"></i> Cetak
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- TAB KONTEN (SISI KANAN) --}}
        <div class="col-lg-8 print-col-8">
            <div class="card border-0 shadow-sm rounded-4 h-100">
                <div class="card-header bg-white border-0 p-4 pb-0 d-print-none">
                    <ul class="nav nav-tabs border-0" id="profileTab" role="tablist">
                        <li class="nav-item">
                            <button class="nav-link active fw-bold px-4 border-0" id="history-tab" data-bs-toggle="tab" data-bs-target="#history" type="button">Riwayat M-MON</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link text-muted px-4 border-0" id="job-tab" data-bs-toggle="tab" data-bs-target="#job" type="button">Dharma Patriot (Kerja)</button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link text-muted px-4 border-0" id="activity-tab" data-bs-toggle="tab" data-bs-target="#activity" type="button">Kegiatan SAPA</button>
                        </li>
                    </ul>
                </div>
                <div class="card-body p-4">
                    <div class="tab-content">
                        
                        {{-- TAB 1: RIWAYAT TRANSAKSI --}}
                        <div class="tab-pane fade show active" id="history">
                            <h6 class="fw-bold mb-3 d-flex align-items-center">
                                <i class="bi bi-wallet2 me-2 text-primary"></i> Riwayat Transaksi Finansial
                            </h6>
                            @if($identitas->transaksi->count() > 0)
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="bg-light">
                                            <tr class="small fw-bold text-muted">
                                                <th class="py-3">TANGGAL</th>
                                                <th class="py-3">MODUL</th>
                                                <th class="py-3 text-end">NOMINAL</th>
                                                <th class="py-3">KETERANGAN</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($identitas->transaksi->sortByDesc('tanggal_transaksi') as $trx)
                                            <tr>
                                                <td class="small">{{ \Carbon\Carbon::parse($trx->tanggal_transaksi)->format('d/m/Y') }}</td>
                                                <td>
                                                    <span class="badge {{ $trx->jenis == 'DONASI' ? 'bg-primary' : 'bg-success' }}" style="font-size: 10px;">
                                                        {{ $trx->jenis == 'DONASI' ? 'D-DONASI' : 'S-SALUR' }}
                                                    </span>
                                                </td>
                                                <td class="fw-bold text-end small {{ $trx->jenis == 'DONASI' ? 'text-primary' : 'text-success' }}">
                                                    Rp {{ number_format($trx->nominal, 0, ',', '.') }}
                                                </td>
                                                <td class="text-muted small">{{ $trx->keterangan ?? '-' }}</td>
                                            </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @else
                                <div class="text-center py-5">
                                    <i class="bi bi-clock-history text-muted opacity-25" style="font-size: 50px;"></i>
                                    <p class="mt-3 text-muted">Belum ada riwayat transaksi finansial.</p>
                                </div>
                            @endif
                        </div>

                        {{-- TAB 2: DHARMA PATRIOT (KERJA) --}}
                        <div class="tab-pane fade" id="job">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0 d-flex align-items-center">
                                    <i class="bi bi-briefcase me-2 text-primary"></i> Daftar Penugasan Kerja
                                </h6>
                                <button class="btn btn-sm btn-primary rounded-pill d-print-none px-3" data-bs-toggle="modal" data-bs-target="#modalTambahJob">
                                    <i class="bi bi-plus-circle me-1"></i> Tambah Job
                                </button>
                            </div>

                            @if($identitas->jobs->count() > 0)
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle">
                                        <thead>
                                            <tr class="small text-muted fw-bold bg-light">
                                                <th>NAMA JOB</th>
                                                <th>ADVANCE</th>
                                                <th>STATUS</th>
                                                <th>DEADLINE</th>
                                                <th class="text-center d-print-none">AKSI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($identitas->jobs as $job)
                                            <tr>
                                                <td class="small fw-bold text-dark">{{ $job->nama_job }}</td>
                                                <td><span class="badge bg-light text-dark border small fw-normal">{{ $job->job_advance }}</span></td>
                                                <td>
                                                    @php
                                                        $badgeStatus = ['Progres' => 'primary', 'Selesai' => 'success', 'Pending' => 'warning', 'Batal' => 'danger'][$job->status_job] ?? 'secondary';
                                                    @endphp
                                                    <span class="badge bg-{{ $badgeStatus }}">{{ $job->status_job }}</span>
                                                </td>
                                                <td class="small text-muted">
                                                    {{ $job->tanggal_deadline ? \Carbon\Carbon::parse($job->tanggal_deadline)->format('d/m/Y') : '-' }}
                                                </td>
                                                <td class="text-center d-print-none">
                                                    <div class="d-flex justify-content-center align-items-center gap-2">
                                                        <span class="badge bg-secondary mb-0" style="font-size: 9px; cursor: help;" title="Input oleh: {{ $job->user->name ?? 'System' }}">
                                                            {{ strtoupper(substr($job->user->name ?? 'SYS', 0, 3)) }}
                                                        </span>

                                                        <button class="btn btn-sm btn-outline-primary p-1 border-0" data-bs-toggle="modal" data-bs-target="#modalEditJob{{ $job->id }}">
                                                            <i class="bi bi-pencil-square"></i>
                                                        </button>

                                                        <form action="{{ route('jobs.destroy', $job->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Hapus penugasan ini?')">
                                                            @csrf @method('DELETE')
                                                            <button type="submit" class="btn btn-sm btn-outline-danger p-1 border-0">
                                                                <i class="bi bi-trash"></i>
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>

                                            {{-- MODAL EDIT JOB --}}
                                            <div class="modal fade d-print-none" id="modalEditJob{{ $job->id }}" tabindex="-1" aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered">
                                                    <div class="modal-content border-0 shadow rounded-4">
                                                        <form action="{{ route('jobs.update', $job->id) }}" method="POST">
                                                            @csrf @method('PUT')
                                                            <div class="modal-header border-0 pb-0">
                                                                <h5 class="modal-title fw-bold">Update Penugasan</h5>
                                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                            </div>
                                                            <div class="modal-body p-4 text-start">
                                                                <div class="mb-3">
                                                                    <label class="small fw-bold mb-1">Nama Pekerjaan</label>
                                                                    <input type="text" name="nama_job" class="form-control form-control-sm border-2 rounded-3" value="{{ $job->nama_job }}" required>
                                                                </div>
                                                                <div class="row g-2 mb-3">
                                                                    <div class="col-6">
                                                                        <label class="small fw-bold mb-1">Job Advance</label>
                                                                        <select name="job_advance" class="form-select form-select-sm border-2 rounded-3">
                                                                            @foreach(['Beginner', 'Intermediate', 'Advanced'] as $adv)
                                                                                <option value="{{ $adv }}" {{ $job->job_advance == $adv ? 'selected' : '' }}>{{ $adv }}</option>
                                                                            @endforeach
                                                                        </select>
                                                                    </div>
                                                                    <div class="col-6">
                                                                        <label class="small fw-bold mb-1">Status</label>
                                                                        <select name="status_job" class="form-select form-select-sm border-2 rounded-3">
                                                                            @foreach(['Progres', 'Selesai', 'Pending', 'Batal'] as $status)
                                                                                <option value="{{ $status }}" {{ $job->status_job == $status ? 'selected' : '' }}>{{ $status }}</option>
                                                                            @endforeach
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div class="row g-2 mb-3">
                                                                    <div class="col-6">
                                                                        <label class="small fw-bold mb-1">Tgl Mulai</label>
                                                                        <input type="date" name="tanggal_mulai" class="form-control form-control-sm border-2 rounded-3" value="{{ $job->tanggal_mulai }}">
                                                                    </div>
                                                                    <div class="col-6">
                                                                        <label class="small fw-bold mb-1">Deadline</label>
                                                                        <input type="date" name="tanggal_deadline" class="form-control form-control-sm border-2 rounded-3" value="{{ $job->tanggal_deadline }}">
                                                                    </div>
                                                                </div>
                                                                <div class="mb-0">
                                                                    <label class="small fw-bold mb-1">Keterangan</label>
                                                                    <textarea name="keterangan" rows="3" class="form-control form-control-sm border-2 rounded-3">{{ $job->keterangan }}</textarea>
                                                                </div>
                                                            </div>
                                                            <div class="modal-footer border-0 p-4 pt-0">
                                                                <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
                                                                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">Simpan</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @else
                                <div class="text-center py-5 text-muted small">
                                    <i class="bi bi-clipboard-x opacity-25" style="font-size: 50px;"></i>
                                    <p class="mt-2">Belum ada catatan penugasan kerja.</p>
                                </div>
                            @endif
                        </div>

                        {{-- TAB 3: KEGIATAN SAPA (UPDATE) --}}
                        <div class="tab-pane fade" id="activity">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0 d-flex align-items-center">
                                    <i class="bi bi-calendar-check me-2 text-primary"></i> Partisipasi Kegiatan SAPA
                                </h6>
                                <button class="btn btn-sm btn-primary rounded-pill d-print-none px-3" data-bs-toggle="modal" data-bs-target="#modalTambahKegiatan">
                                    <i class="bi bi-plus-circle me-1"></i> Tambah Kegiatan
                                </button>
                            </div>

                            @if($identitas->kegiatans->count() > 0)
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle">
                                        <thead>
                                            <tr class="small text-muted fw-bold bg-light">
                                                <th>KEGIATAN</th>
                                                <th>TANGGAL</th>
                                                <th>PERAN</th>
                                                <th class="text-center d-print-none">AKSI</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($identitas->kegiatans as $kgt)
                                            <tr>
                                                <td class="small fw-bold text-dark">{{ $kgt->nama_kegiatan }}</td>
                                                <td class="small text-muted">{{ \Carbon\Carbon::parse($kgt->tanggal_kegiatan)->format('d/m/Y') }}</td>
                                                <td><span class="badge bg-info text-dark border-0 small fw-medium">{{ $kgt->peran }}</span></td>
                                                <td class="text-center d-print-none">
                                                    <div class="d-flex justify-content-center align-items-center gap-2">
                                                        <span class="badge bg-secondary mb-0" style="font-size: 9px; cursor: help;" title="Input oleh: {{ $kgt->user->name ?? 'System' }}">
                                                            {{ strtoupper(substr($kgt->user->name ?? 'SYS', 0, 3)) }}
                                                        </span>

                                                        <button class="btn btn-sm btn-outline-primary p-1 border-0" data-bs-toggle="modal" data-bs-target="#modalEditKegiatan{{ $kgt->id }}">
                                                            <i class="bi bi-pencil-square"></i>
                                                        </button>

                                                        <form action="{{ route('kegiatans.destroy', $kgt->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Hapus kegiatan ini?')">
                                                            @csrf @method('DELETE')
                                                            <button type="submit" class="btn btn-sm btn-outline-danger p-1 border-0">
                                                                <i class="bi bi-trash"></i>
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>

                                            {{-- MODAL EDIT KEGIATAN --}}
                                            <div class="modal fade d-print-none" id="modalEditKegiatan{{ $kgt->id }}" tabindex="-1" aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered">
                                                    <div class="modal-content border-0 shadow rounded-4">
                                                        <form action="{{ route('kegiatans.update', $kgt->id) }}" method="POST">
                                                            @csrf @method('PUT')
                                                            <div class="modal-header border-0 pb-0">
                                                                <h5 class="modal-title fw-bold">Update Kegiatan</h5>
                                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                                            </div>
                                                            <div class="modal-body p-4">
                                                                <div class="mb-3 text-start">
                                                                    <label class="small fw-bold mb-1">Nama Kegiatan</label>
                                                                    <input type="text" name="nama_kegiatan" class="form-control form-control-sm border-2 rounded-3" value="{{ $kgt->nama_kegiatan }}" required>
                                                                </div>
                                                                <div class="row g-2 mb-3 text-start">
                                                                    <div class="col-6">
                                                                        <label class="small fw-bold mb-1">Tanggal</label>
                                                                        <input type="date" name="tanggal_kegiatan" class="form-control form-control-sm border-2 rounded-3" value="{{ $kgt->tanggal_kegiatan }}" required>
                                                                    </div>
                                                                    <div class="col-6">
                                                                        <label class="small fw-bold mb-1">Peran</label>
                                                                        <input type="text" name="peran" class="form-control form-control-sm border-2 rounded-3" value="{{ $kgt->peran }}" required>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="modal-footer border-0 p-4 pt-0">
                                                                <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
                                                                <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">Simpan</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            @else
                                <div class="text-center py-5 text-muted small">
                                    <i class="bi bi-calendar-check opacity-25" style="font-size: 50px;"></i>
                                    <p class="mt-2">Belum ada catatan partisipasi SAPA-ALL.</p>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- MODAL TAMBAH JOB --}}
<div class="modal fade d-print-none" id="modalTambahJob" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
            <form action="{{ route('jobs.store') }}" method="POST">
                @csrf
                <input type="hidden" name="identitas_id" value="{{ $identitas->id }}">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold">Input Penugasan Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4 text-start">
                    <div class="mb-3">
                        <label class="small fw-bold mb-1">Nama Pekerjaan</label>
                        <input type="text" name="nama_job" class="form-control form-control-sm border-2 rounded-3" placeholder="Contoh: Pemeliharaan Server" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="small fw-bold mb-1">Job Advance</label>
                            <select name="job_advance" class="form-select form-select-sm border-2 rounded-3">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="small fw-bold mb-1">Status</label>
                            <select name="status_job" class="form-select form-select-sm border-2 rounded-3">
                                <option value="Progres">Progres</option>
                                <option value="Selesai">Selesai</option>
                                <option value="Pending">Pending</option>
                                <option value="Batal">Batal</option>
                            </select>
                        </div>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="small fw-bold mb-1">Tanggal Mulai</label>
                            <input type="date" name="tanggal_mulai" class="form-control form-control-sm border-2 rounded-3">
                        </div>
                        <div class="col-6">
                            <label class="small fw-bold mb-1">Deadline</label>
                            <input type="date" name="tanggal_deadline" class="form-control form-control-sm border-2 rounded-3">
                        </div>
                    </div>
                    <div class="mb-0">
                        <label class="small fw-bold mb-1">Keterangan</label>
                        <textarea name="keterangan" rows="3" class="form-control form-control-sm border-2 rounded-3" placeholder="Opsional..."></textarea>
                    </div>
                </div>
                <div class="modal-footer border-0 p-4 pt-0">
                    <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">Simpan Tugas</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- MODAL TAMBAH KEGIATAN SAPA --}}
<div class="modal fade d-print-none" id="modalTambahKegiatan" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
            <form action="{{ route('kegiatans.store') }}" method="POST">
                @csrf
                <input type="hidden" name="identitas_id" value="{{ $identitas->id }}">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold">Input Kegiatan Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 text-start">
                    <div class="mb-3">
                        <label class="small fw-bold mb-1">Nama Kegiatan</label>
                        <input type="text" name="nama_kegiatan" class="form-control form-control-sm border-2 rounded-3" placeholder="Contoh: SAPA Kebersihan Lingkungan" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="small fw-bold mb-1">Tanggal</label>
                            <input type="date" name="tanggal_kegiatan" class="form-control form-control-sm border-2 rounded-3" required>
                        </div>
                        <div class="col-6">
                            <label class="small fw-bold mb-1">Peran</label>
                            <input type="text" name="peran" class="form-control form-control-sm border-2 rounded-3" placeholder="Peserta/Panitia" required>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 p-4 pt-0">
                    <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">Simpan Kegiatan</button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    /* Styling Dasar & Nav Tabs */
    .nav-tabs { border-bottom: 2px solid #f0f0f0 !important; gap: 15px; }
    .nav-tabs .nav-link { background: none !important; border: none !important; color: #adb5bd; font-weight: 500; padding: 12px 10px; position: relative; transition: 0.3s; }
    .nav-tabs .nav-link.active { color: #0d6efd !important; font-weight: 700; }
    .nav-tabs .nav-link.active::after { content: ""; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background-color: #0d6efd; border-radius: 10px; }
    
    /* Tabel Hover Effect */
    .table-hover tbody tr:hover { background-color: #fcfdff; }
    .btn-outline-primary:hover, .btn-outline-danger:hover { background-color: transparent !important; opacity: 0.7; }

    /* Print Configuration */
    @media print {
        body { background-color: white !important; }
        .d-print-none { display: none !important; }
        .card { border: 1px solid #f0f0f0 !important; box-shadow: none !important; }
        .print-row { display: flex !important; flex-wrap: nowrap !important; }
        .print-col-4 { width: 35% !important; flex: 0 0 35% !important; }
        .print-col-8 { width: 65% !important; flex: 0 0 65% !important; }
        .tab-content > .tab-pane { display: block !important; opacity: 1 !important; visibility: visible !important; }
    }
</style>
@endsection