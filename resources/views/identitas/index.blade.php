@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f1f5f9; color: #334155; }
    .page-title { font-weight: 800; letter-spacing: -1px; color: #0f172a; }

    /* Button Styling */
    .btn-back {
        background: white; border: 1px solid #e2e8f0; width: 42px; height: 42px;
        display: flex; align-items: center; justify-content: center; color: #64748b;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-back:hover { background: #f8fafc; color: #0f172a; transform: translateX(-4px); box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }

    /* Search & Filter */
    .search-container { position: relative; width: 300px; }
    .search-input {
        border-radius: 12px !important; border: 1px solid #e2e8f0 !important;
        padding-left: 42px !important; font-size: 14px; height: 45px;
        transition: all 0.2s; background: white !important;
    }
    .search-input:focus { border-color: #10b981 !important; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important; }
    .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); z-index: 5; color: #94a3b8; font-size: 1.1rem; }

    /* Card Stats */
    .card-stat {
        border: none; border-radius: 20px; background: white;
        transition: all 0.3s ease; border: 1px solid rgba(226, 232, 240, 0.6);
    }
    .card-stat:hover { transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05); }
    .icon-box {
        width: 48px; height: 48px; border-radius: 14px;
        display: flex; align-items: center; justify-content: center; font-size: 1.25rem;
    }

    /* Table Styling */
    .table-container { border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; background: white; }
    .table thead th {
        background: #f8fafc; text-transform: uppercase; font-size: 11px;
        font-weight: 700; letter-spacing: 0.05em; color: #64748b; border-bottom: 1px solid #e2e8f0;
        padding: 16px 24px;
    }
    .table tbody td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; }
    .data-row:hover { background-color: #f8fafc; }

    /* Form Design */
    .form-box-wajib { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; }
    .form-box-opsional { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 16px; padding: 24px; }
    .form-label { font-weight: 600; font-size: 12px; color: #475569; margin-bottom: 6px; }
    .form-control-mis {
        border-radius: 10px; border: 1px solid #cbd5e1; padding: 11px 14px;
        font-size: 14px; background: white !important; transition: all 0.2s;
    }
    .form-control-mis:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }

    /* Action Buttons */
    .btn-action {
        width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e2e8f0;
        display: inline-flex; align-items: center; justify-content: center;
        background: white; color: #64748b; transition: all 0.2s;
    }
    .btn-action:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
    .btn-action.delete:hover { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }

    .badge-custom { font-weight: 700; padding: 6px 12px; border-radius: 8px; font-size: 11px; }
</style>

<div class="container-fluid py-4 px-4">
    {{-- Notifikasi Error & Success --}}
    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm rounded-4 mb-4 d-flex align-items-center p-3" role="alert">
            <i class="bi bi-check-circle-fill fs-4 me-3"></i>
            <div>
                <div class="fw-bold">Berhasil!</div>
                <div class="small">{{ session('success') }}</div>
            </div>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if ($errors->any())
        <div class="alert alert-danger border-0 shadow-sm rounded-4 mb-4 p-3" role="alert">
            <div class="fw-bold mb-1"><i class="bi bi-exclamation-triangle-fill me-2"></i> Ada Kesalahan:</div>
            <ul class="mb-0 small">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- Header --}}
    <div class="row align-items-center mb-5">
        <div class="col-auto">
            <a href="{{ url('/dashboard') }}" class="btn btn-back shadow-sm rounded-circle">
                <i class="bi bi-chevron-left"></i>
            </a>
        </div>
        <div class="col">
            <h2 class="page-title mb-0">Database Identitas</h2>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0 small">
                    <li class="breadcrumb-item"><a href="#" class="text-decoration-none text-muted">MIS Project</a></li>
                    <li class="breadcrumb-item active fw-bold text-success">Master Data</li>
                </ol>
            </nav>
        </div>
        <div class="col-auto d-flex gap-3">
            <div class="search-container">
                <i class="bi bi-search search-icon"></i>
                <input type="text" id="liveSearch" class="form-control search-input shadow-sm"
                       placeholder="Cari nama atau KTP..." value="{{ request('search') }}">
            </div>
            <button type="button" class="btn btn-success fw-bold rounded-3 px-4 shadow-sm d-flex align-items-center gap-2"
                    data-bs-toggle="modal" data-bs-target="#addModal" style="height: 45px;">
                <i class="bi bi-person-plus"></i> Add New Data
            </button>
        </div>
    </div>

    {{-- Stats Row --}}
    <div class="row g-4 mb-5">
        <div class="col-md-3">
            <div class="card card-stat shadow-sm p-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="icon-box bg-primary bg-opacity-10 text-primary">
                        <i class="bi bi-wallet2"></i>
                    </div>
                    <div>
                        <div class="small fw-bold text-muted text-uppercase mb-1" style="letter-spacing: 0.5px">Saldo Kas</div>
                        <div class="h4 fw-800 mb-0">Rp {{ number_format($saldoKasGlobal, 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card card-stat shadow-sm p-4">
                <div class="d-flex align-items-center gap-3">
                    <div class="icon-box bg-success bg-opacity-10 text-success">
                        <i class="bi bi-people-fill"></i>
                    </div>
                    <div>
                        <div class="small fw-bold text-muted text-uppercase mb-1" style="letter-spacing: 0.5px">Total Anggota</div>
                        <div class="h4 fw-800 mb-0">{{ $countAnggota }} <span class="small fw-normal text-muted">Orang</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Table Card --}}
    <div class="table-container shadow-sm">
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead>
                    <tr>
                        <th class="ps-4" width="60">No</th>
                        <th>Profil & Identitas</th>
                        <th>Kontak & Alamat</th>
                        <th class="text-center">Kategori</th>
                        <th class="text-center">Divisi</th>
                        <th class="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($identitas as $index => $idnt)
                    <tr class="data-row">
                        <td class="ps-4 small text-muted">{{ $identitas->firstItem() + $index }}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="rounded-circle bg-light d-flex align-items-center justify-content-center me-3 fw-bold text-primary shadow-sm" style="width: 40px; height: 40px; font-size: 14px;">
                                    {{ substr($idnt->nama_lengkap, 0, 1) }}
                                </div>
                                <div>
                                    <div class="fw-bold text-dark">{{ strtoupper($idnt->nama_lengkap) }}</div>
                                    <div class="text-muted small d-flex align-items-center gap-2">
                                        <span class="text-primary fw-600">{{ $idnt->panggilan }}</span>
                                        <span class="text-silver">|</span>
                                        <span>ID: {{ $idnt->nomor_identitas }}</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="small fw-500 text-dark">{{ $idnt->nomor_hp_primary }}</div>
                            <div class="text-muted text-truncate" style="font-size: 11px; max-width: 200px;">
                                <i class="bi bi-geo-alt me-1"></i>{{ $idnt->alamat ?? 'Alamat Belum Diisi' }}
                            </div>
                        </td>
                        <td class="text-center">
                            <span class="badge-custom {{ $idnt->jenis_umat == 'Sangha' ? 'bg-warning bg-opacity-10 text-warning' : 'bg-info bg-opacity-10 text-info' }}">
                                {{ $idnt->jenis_umat }}
                            </span>
                        </td>
                        <td class="text-center">
                            <div class="fw-600 small">{{ $idnt->divisi->nama_divisi ?? '-' }}</div>
                        </td>
                        <td class="text-center">
                            <div class="d-flex justify-content-center gap-2">
                                <a href="{{ route('identitas.show', $idnt->id) }}" class="btn-action" title="Detail"><i class="bi bi-eye"></i></a>
                                <form action="{{ route('identitas.destroy', $idnt->id) }}" method="POST" class="d-inline">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn-action delete" onclick="return confirm('Hapus data ini?')" title="Hapus"><i class="bi bi-trash"></i></button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="6" class="text-center py-5">
                            <i class="bi bi-database-exclamation fs-1 opacity-25 d-block mb-3"></i>
                            <p class="text-muted fw-500">Belum ada data identitas yang tersimpan.</p>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    <div class="mt-4">
        {{ $identitas->links() }}
    </div>
</div>

{{-- MODAL INPUT --}}
<div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <form action="{{ route('identitas.store') }}" method="POST">
                @csrf
                <div class="modal-header border-0 p-4 bg-success text-white">
                    <div class="d-flex align-items-center gap-3">
                        <i class="bi bi-person-plus-fill fs-3"></i>
                        <div>
                            <h5 class="modal-title fw-bold mb-0">Input Identitas Baru</h5>
                            <small class="opacity-75">Pastikan data sesuai dengan dokumen fisik</small>
                        </div>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body p-4 bg-light bg-opacity-50">
                    <div class="row g-4">
                        {{-- SEKSI WAJIB --}}
                        <div class="col-lg-6">
                            <div class="form-box-wajib h-100 shadow-sm">
                                <h6 class="text-success fw-bold mb-4 d-flex align-items-center gap-2">
                                    <i class="bi bi-shield-check"></i> DATA IDENTITAS (WAJIB)
                                </h6>
                                <div class="row g-3">
                                    <div class="col-md-7">
                                        <label class="form-label">Nomor Identitas (KTP/Lainnya)</label>
                                        <input type="text" name="nomor_identitas" class="form-control form-control-mis" placeholder="Contoh: 317XXXXXXXXXXXXX" required>
                                    </div>
                                    <div class="col-md-5">
                                        <label class="form-label">Jenis Identitas</label>
                                        <select name="jenis_identitas" class="form-select form-control-mis">
                                            <option value="KTP">KTP</option>
                                            <option value="Paspor">Paspor</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Nama Lengkap (Sesuai KTP)</label>
                                        <input type="text" name="nama_lengkap" class="form-control form-control-mis" placeholder="Nama Tanpa Gelar" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Jenis Kelamin</label>
                                        <div class="d-flex gap-3 mt-1">
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="jenis_kelamin" value="pria" id="pria" checked>
                                                <label class="form-check-label small" for="pria">Pria</label>
                                            </div>
                                            <div class="form-check">
                                                <input class="form-check-input" type="radio" name="jenis_kelamin" value="wanita" id="wanita">
                                                <label class="form-check-label small" for="wanita">Wanita</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Kategori Anggota</label>
                                        <select name="jenis_umat" class="form-select form-control-mis" required>
                                            <option value="Umat">Umat</option>
                                            <option value="Sangha">Sangha</option>
                                        </select>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Penempatan Divisi</label>
                                        <select name="divisi_id" class="form-select form-control-mis" required>
                                            <option value="">-- Pilih Divisi --</option>
                                            @foreach($divisi as $div)
                                                <option value="{{ $div->id }}">{{ $div->nama_divisi }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {{-- SEKSI OPSIONAL --}}
                        <div class="col-lg-6">
                            <div class="form-box-opsional h-100 shadow-sm">
                                <h6 class="text-warning fw-bold mb-4 d-flex align-items-center gap-2">
                                    <i class="bi bi-geo-alt-fill"></i> KONTAK & ALAMAT (OPSIONAL)
                                </h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Nama Panggilan</label>
                                        <input type="text" name="panggilan" class="form-control form-control-mis" placeholder="Nama Akrab">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">Nomor WhatsApp</label>
                                        <input type="text" name="nomor_hp_primary" class="form-control form-control-mis" placeholder="Contoh: 0812XXXX" required>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label">Alamat Domisili</label>
                                        <textarea name="alamat" class="form-control form-control-mis" rows="2" placeholder="Nama jalan, nomor rumah, RT/RW"></textarea>
                                    </div>
                                    <div class="col-md-7">
                                        <label class="form-label">Kota / Kabupaten</label>
                                        <input type="text" name="kota" class="form-control form-control-mis">
                                    </div>
                                    <div class="col-md-5">
                                        <label class="form-label">Triyana</label>
                                        <select name="triyana" class="form-select form-control-mis">
                                            <option value="">- Pilih -</option>
                                            <option value="Theravada">Theravada</option>
                                            <option value="Mahayana">Mahayana</option>
                                            <option value="Tantrayana">Tantrayana</option>
                                        </select>
                                    </div>
                                    <div class="col-12 mt-4">
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" name="is_agen_purna" id="agen_purna">
                                            <label class="form-check-label small fw-bold" for="agen_purna">Agen Purna</label>
                                        </div>
                                        <div class="form-check form-switch mt-2">
                                            <input class="form-check-input" type="checkbox" name="is_dharma_patriot" id="dharma_patriot">
                                            <label class="form-check-label small fw-bold" for="dharma_patriot">Dharma Patriot</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer bg-white p-4 border-0">
                    <button type="button" class="btn btn-light fw-bold rounded-3 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-success fw-bold rounded-3 px-5 shadow-sm">Simpan Data Member</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script>
    $(document).ready(function() {
        // Live Search
        $('#liveSearch').on('keypress', function(e) {
            if(e.which == 13) window.location.href = "{{ route('identitas.index') }}?search=" + $(this).val();
        });
    });
</script>
@endsection
