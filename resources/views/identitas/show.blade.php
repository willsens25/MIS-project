@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">

<style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; color: #1e293b; }
    .card-custom { border: none; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); transition: transform 0.2s; }
    .avatar-large {
        width: 120px; height: 120px; background: #ffffff; border-radius: 35px;
        display: flex; align-items: center; justify-content: center;
        font-size: 48px; color: #007BFF; box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        border: 2px solid #f1f5f9;
    }
    .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700; margin-bottom: 4px; }
    .info-value { font-weight: 600; color: #1e293b; margin-bottom: 0; }

    /* Status Badges */
    .badge-status { padding: 10px 18px; border-radius: 14px; font-weight: 700; font-size: 11px; letter-spacing: 0.5px; }
    .status-normal { background-color: #dcfce7; color: #15803d; }
    .status-vip { background-color: #fef9c3; color: #a16207; border: 1px solid #fde047; }
    .status-pengawasan { background-color: #ffedd5; color: #9a3412; }
    .status-blacklist { background-color: #fee2e2; color: #991b1b; }

    .contact-item { padding: 12px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; margin-bottom: 10px; }
    .btn-action { transition: all 0.3s ease; border-radius: 12px; }
    .btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
</style>

<div class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center">
            <a href="{{ route('identitas.index') }}" class="btn btn-white bg-white shadow-sm rounded-3 me-3 p-2 btn-action">
                <i class="bi bi-chevron-left text-primary"></i>
            </a>
            <div>
                <h4 class="fw-800 mb-0">Detail Profil Anggota</h4>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb mb-0 small">
                        <li class="breadcrumb-item"><a href="{{ route('identitas.index') }}" class="text-decoration-none">Identitas</a></li>
                        <li class="breadcrumb-item active">MIS-{{ str_pad($identitas->id, 5, '0', STR_PAD_LEFT) }}</li>
                    </ol>
                </nav>
            </div>
        </div>
        <div class="d-flex gap-2">
            <a href="{{ route('identitas.edit', $identitas->id) }}" class="btn btn-primary btn-action px-4 fw-bold">
                <i class="bi bi-pencil-square me-2"></i> Edit Profil
            </a>
        </div>
    </div>

    <div class="row g-4">
        <div class="col-lg-4">
            <div class="card card-custom p-4 mb-4">
                <div class="text-center">
                    <div class="avatar-large mx-auto mb-3">
                        {{ strtoupper(substr($identitas->nama_lengkap, 0, 1)) }}
                    </div>
                    <h5 class="fw-800 mb-1">
                        @if($identitas->gelar_panggilan)
                            <span class="text-muted fw-normal">{{ $identitas->gelar_panggilan }}.</span>
                        @endif
                        {{ $identitas->nama_lengkap }}
                    </h5>
                    <p class="text-muted mb-3">
                        <span class="badge bg-light text-primary border px-3 py-2 rounded-pill fw-bold">
                            {{ $identitas->divisi->nama_divisi ?? 'Tanpa Divisi' }}
                        </span>
                    </p>

                    @php
                        $rawStatus = strtolower($identitas->status_keamanan ?? 'normal');
                        $statusClass = 'status-' . $rawStatus;
                    @endphp
                    <div class="badge-status {{ $statusClass }} d-inline-block">
                        <i class="bi bi-shield-check me-1"></i> STATUS: {{ strtoupper($rawStatus) }}
                    </div>

                    <div class="mt-3 d-flex justify-content-center gap-2">
                        @if($identitas->is_agen_purna) <span class="badge bg-info text-white rounded-pill px-3">AGEN</span> @endif
                        @if($identitas->is_dharma_patriot) <span class="badge bg-primary rounded-pill px-3">PATRIOT</span> @endif
                    </div>
                </div>

                <hr class="my-4 opacity-50">

                <div class="row g-3">
                    <div class="col-6 text-center border-end">
                        <p class="info-label">Total Donasi</p>
                        <h6 class="fw-800 text-success mb-0">Rp {{ number_format($identitas->total_donasi ?? 0, 0, ',', '.') }}</h6>
                    </div>
                    <div class="col-6 text-center">
                        <p class="info-label">Total Salur</p>
                        <h6 class="fw-800 text-danger mb-0">Rp {{ number_format($totalSalur ?? 0, 0, ',', '.') }}</h6>
                    </div>
                </div>
            </div>

            <div class="card card-custom p-4">
                <h6 class="fw-800 mb-3 small text-uppercase"><i class="bi bi-person-lines-fill me-2 text-primary"></i>Kontak & Jarkom</h6>

                <p class="info-label">Nomor WhatsApp / HP</p>
                <div class="contact-item d-flex justify-content-between align-items-center">
                    <span class="fw-bold">{{ $identitas->nomor_hp_primary ?? '-' }}</span>
                    @if($identitas->nomor_hp_primary)
                        <span class="badge bg-primary" style="font-size: 9px">UTAMA</span>
                    @endif
                </div>

                <p class="info-label mt-2">Email</p>
                <div class="contact-item">
                    <span class="fw-bold text-break">{{ $identitas->email ?? '-' }}</span>
                </div>
            </div>
        </div>

        <div class="col-lg-8">
            <div class="card card-custom p-4 mb-4">
                <h5 class="fw-800 mb-4"><i class="bi bi-card-text me-2 text-primary"></i>Informasi Biodata</h5>
                <div class="row g-4">
                    <div class="col-md-6">
                        <p class="info-label">Nomor KTP / Identitas</p>
                        <p class="info-value">{{ $identitas->no_ktp ?? '-' }}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="info-label">Nama di KTP</p>
                        <p class="info-value">{{ $identitas->nama_ktp ?? '-' }}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="info-label">Nama Panggilan</p>
                        <p class="info-value">{{ $identitas->nama_panggilan ?? '-' }}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="info-label">Kewarganegaraan</p>
                        <p class="info-value"><span class="badge bg-dark rounded-1">{{ $identitas->kewarganegaraan ?? 'WNI' }}</span></p>
                    </div>
                    <div class="col-md-6">
                        <p class="info-label">Tempat, Tanggal Lahir</p>
                        <p class="info-value">
                            {{ $identitas->tempat_lahir ?? '-' }},
                            @if($identitas->tanggal_lahir)
                                {{ is_string($identitas->tanggal_lahir) ? date('d M Y', strtotime($identitas->tanggal_lahir)) : $identitas->tanggal_lahir->format('d M Y') }}
                            @else
                                -
                            @endif
                        </p>
                    </div>
                    <div class="col-md-6">
                        <p class="info-label">Jenis Kelamin</p>
                        <p class="info-value">
                            @php
                                $jk = strtolower($identitas->jenis_kelamin);
                            @endphp
                            @if($jk == 'pria' || $jk == 'laki-laki')
                                <i class="bi bi-gender-male text-primary me-1"></i> Laki-laki
                            @elseif($jk == 'wanita' || $jk == 'perempuan')
                                <i class="bi bi-gender-female text-danger me-1"></i> Perempuan
                            @else
                                {{ ucfirst($jk) ?: '-' }}
                            @endif
                        </p>
                    </div>
                    <div class="col-md-6">
                        <p class="info-label">Pekerjaan</p>
                        <p class="info-value">{{ $identitas->pekerjaan ?? '-' }}</p>
                    </div>
                    <div class="col-md-6">
                        <p class="info-label">Agama / Aliran</p>
                        <p class="info-value">{{ $identitas->agama ?? '-' }} / {{ $identitas->triyana ?? '-' }}</p>
                    </div>
                </div>
            </div>

            <div class="card card-custom p-4">
                <h5 class="fw-800 mb-4"><i class="bi bi-geo-alt-fill me-2 text-danger"></i>Alamat Tinggal</h5>
                @if($identitas->alamat)
                    <div class="p-3 rounded-4 bg-light border-start border-4 border-primary">
                        <p class="text-dark fw-semibold mb-1">{{ $identitas->alamat }}</p>
                        <p class="text-muted small mb-0"><i class="bi bi-building me-1"></i>{{ $identitas->kota ?? 'Kota tidak dicantumkan' }}</p>
                    </div>
                @else
                    <div class="text-center py-4 text-muted border rounded-4 border-dashed">
                        <i class="bi bi-geo fs-2 d-block mb-2 opacity-50"></i>
                        <small class="fw-bold">Belum ada data alamat yang tersimpan.</small>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
