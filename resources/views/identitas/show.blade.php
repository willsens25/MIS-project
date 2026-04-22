@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">

<style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
    .card-custom { border: none; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .avatar-large { width: 120px; height: 120px; background: white; border-radius: 35px; display: flex; align-items: center; justify-content: center; font-size: 48px; color: #007BFF; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
    .info-value { font-weight: 600; color: #1e293b; margin-bottom: 0; }
    .badge-status { padding: 8px 16px; border-radius: 12px; font-weight: 700; font-size: 12px; }
    .status-normal { background-color: #dcfce7; color: #15803d; }
    .status-vip { background-color: #fef9c3; color: #a16207; border: 1px solid #fde047; }
    .status-pengawasan { background-color: #ffedd5; color: #9a3412; }
    .status-blacklist { background-color: #fee2e2; color: #991b1b; }
    .contact-item { padding: 8px 12px; background: #f1f5f9; border-radius: 12px; margin-bottom: 8px; font-size: 14px; }
</style>

<div class="container py-4">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center">
            <a href="{{ route('identitas.index') }}" class="btn btn-white bg-white shadow-sm rounded-3 me-3 p-2">
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
            <a href="{{ route('identitas.edit', $identitas->id) }}" class="btn btn-primary rounded-4 px-4 fw-bold">
                <i class="bi bi-pencil-square me-2"></i> Edit Profil
            </a>
        </div>
    </div>

    <div class="row g-4">
        {{-- SISI KIRI: PROFIL RINGKAS --}}
        <div class="col-lg-4">
            <div class="card card-custom p-4 mb-4">
                <div class="text-center">
                    <div class="avatar-large mx-auto mb-3">
                        {{ substr($identitas->nama_lengkap, 0, 1) }}
                    </div>
                    <h5 class="fw-800 mb-1">
                        <span class="text-muted fw-normal">{{ $identitas->gelar_panggilan }}</span> {{ $identitas->nama_lengkap }}
                    </h5>
                    <p class="text-muted mb-3">
                        <span class="badge bg-light text-primary border px-3 py-2 rounded-pill fw-bold">
                            {{ $identitas->divisi->nama_divisi ?? 'Tanpa Divisi' }}
                        </span>
                    </p>

                    @php $statusClass = 'status-' . strtolower($identitas->status_keamanan ?? 'normal'); @endphp
                    <div class="badge-status {{ $statusClass }} d-inline-block">
                        <i class="bi bi-shield-check me-1"></i> STATUS: {{ strtoupper($identitas->status_keamanan ?? 'NORMAL') }}
                    </div>

                    <div class="mt-3 d-flex justify-content-center gap-2">
                        @if($identitas->is_agen_purna) <span class="badge bg-info text-white">AGEN</span> @endif
                        @if($identitas->is_dharma_patriot) <span class="badge bg-primary">PATRIOT</span> @endif
                    </div>
                </div>

                <hr class="my-4 opacity-50">

                <div class="row g-3">
                    <div class="col-6 text-center border-end">
                        <p class="info-label">Total Donasi</p>
                        <h6 class="fw-800 text-success">Rp {{ number_format($identitas->total_donasi ?? 0, 0, ',', '.') }}</h6>
                    </div>
                    <div class="col-6 text-center">
                        <p class="info-label">Total Salur</p>
                        <h6 class="fw-800 text-danger">Rp {{ number_format($totalSalur ?? 0, 0, ',', '.') }}</h6>
                    </div>
                </div>
            </div>

            {{-- KONTAK --}}
            <div class="card card-custom p-4 mb-4">
                <h6 class="fw-800 mb-3 small text-uppercase"><i class="bi bi-person-lines-fill me-2"></i>Kontak & Jarkom</h6>

                <p class="info-label">Nomor WhatsApp / HP</p>
                <div class="contact-item d-flex justify-content-between align-items-center">
                    <span class="fw-bold text-dark">{{ $identitas->nomor_hp_primary ?? '-' }}</span>
                    <span class="badge bg-primary" style="font-size: 10px">Utama</span>
                </div>

                <p class="info-label mt-3">Email</p>
                <div class="contact-item d-flex justify-content-between align-items-center">
                    <span class="fw-bold text-dark">{{ $identitas->email ?? '-' }}</span>
                </div>
            </div>
        </div>

        {{-- SISI KANAN: BIODATA LENGKAP --}}
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
                        <p class="info-value"><span class="badge bg-dark">{{ $identitas->kewarganegaraan ?? 'WNI' }}</span></p>
                    </div>
                    <div class="col-md-6">
                        <p class="info-label">Tempat, Tanggal Lahir</p>
                        <p class="info-value">
                            {{ $identitas->tempat_lahir ?? '-' }},
                            {{ $identitas->tanggal_lahir ? $identitas->tanggal_lahir->format('d M Y') : '-' }}
                        </p>
                    </div>
                    <div class="col-md-6">
                    <p class="info-label">Jenis Kelamin</p>
                    <p class="info-value">
                        @if($identitas->jenis_kelamin == 'pria')
                        Laki-laki
                        @elseif($identitas->jenis_kelamin == 'wanita')
                        Perempuan
                        @else
                        {{ ucfirst($identitas->jenis_kelamin) ?? '-' }}
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

            {{-- ALAMAT --}}
            <div class="card card-custom p-4">
                <h5 class="fw-800 mb-4"><i class="bi bi-geo-alt-fill me-2 text-danger"></i>Alamat Tinggal</h5>
                @if($identitas->alamat)
                    <div class="p-3 rounded-4 bg-light mb-3 border-start border-4 border-primary">
                        <p class="text-dark small mb-1 fw-semibold">{{ $identitas->alamat }}</p>
                        <p class="text-muted small mb-0">{{ $identitas->kota ?? '' }}</p>
                    </div>
                @else
                    <div class="text-center py-4 text-muted">
                        <i class="bi bi-geo fs-2 d-block mb-2"></i>
                        <small>Belum ada data alamat.</small>
                    </div>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
