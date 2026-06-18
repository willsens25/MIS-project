@extends('layouts.app')

@section('content')
<div class="container py-4 text-start">
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

    {{-- Alert Notifikasi Gagal/Error --}}
    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show border-0 shadow-sm mb-4 rounded-4" role="alert">
            <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill me-3 fs-4 text-danger"></i>
                <div class="fw-medium text-danger-tight">{{ session('error') }}</div>
            </div>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    {{-- Header Section --}}
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 pb-3 border-bottom border-light">
        <div>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-primary fw-bold">Divisi PNB</li>
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-muted fw-semibold">S-SALUR Inventory</li>
                </ol>
            </nav>
            <h2 class="fw-extrabold text-dark tracking-tight mb-1">Manajemen Katalog & Stok</h2>
            <p class="text-muted small mb-0">Pengelolaan item operasional ekosistem <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1">S-SALUR</span></p>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
            <a href="{{ route('pnb.exportPdf') }}" target="_blank" class="btn btn-action-pdf rounded-3 fw-bold shadow-sm px-3 py-2">
                <i class="bi bi-file-earmark-pdf-fill me-1.5"></i> Ekspor PDF
            </a>

            <button class="btn btn-action-secondary rounded-3 fw-bold shadow-sm px-3 py-2" data-bs-toggle="modal" data-bs-target="#modalCetak">
                <i class="bi bi-printer-fill me-1.5"></i> Ajukan Cetak
            </button>

            <button class="btn btn-primary rounded-3 fw-bold shadow-sm px-3.5 py-2" data-bs-toggle="modal" data-bs-target="#tambahBuku">
                <i class="bi bi-plus-circle-fill me-1.5"></i> Tambah Judul
            </button>
        </div>
    </div>

    {{-- Statistik Widgets --}}
    <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
            <div class="card card-stat border-0 shadow-sm rounded-4 p-3.5 h-100">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-box bg-primary-subtle p-3 rounded-3 text-primary me-3">
                        <i class="bi bi-journal-bookmark-fill fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-semibold text-uppercase tracking-wider">Katalog Aktif</div>
                        <div class="fw-extrabold fs-4 text-dark mt-0.5">{{ $books->total() }} <span class="fs-6 fw-semibold text-muted">Judul</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card card-stat border-0 shadow-sm rounded-4 p-3.5 h-100">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-box bg-warning-subtle p-3 rounded-3 text-warning me-3">
                        <i class="bi bi-box-seam-fill fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-semibold text-uppercase tracking-wider">Stok Ready</div>
                        <div class="fw-extrabold fs-4 text-dark mt-0.5">{{ number_format($books->sum('stok_gudang'), 0, ',', '.') }} <span class="fs-6 fw-semibold text-muted">Eks</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card card-stat border-0 shadow-sm rounded-4 p-3.5 h-100">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-box bg-danger-subtle p-3 rounded-3 text-danger me-3">
                        <i class="bi bi-exclamation-triangle-fill fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-semibold text-uppercase tracking-wider">Kritis / Tipis</div>
                        <div class="fw-extrabold fs-4 text-danger mt-0.5">{{ $books->where('stok_gudang', '<=', 10)->count() }} <span class="fs-6 fw-semibold text-danger opacity-75">Item</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card card-stat border-0 shadow-sm rounded-4 p-3.5 h-100">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-box bg-success-subtle p-3 rounded-3 text-success me-3">
                        <i class="bi bi-cash-stack fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-semibold text-uppercase tracking-wider">Valuasi Aset</div>
                        <div class="fw-extrabold fs-5 text-dark mt-1">Rp {{ number_format($books->sum(fn($b) => $b->stok_gudang * $b->harga_jual), 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Filter & Search Bar --}}
    <div class="card border-0 bg-white shadow-sm rounded-4 mb-4">
        <div class="card-body p-3">
            <form action="{{ route('penerbitan') }}" method="GET" class="row g-2 align-items-center">
                <div class="col-md-8 col-lg-9">
                    <div class="input-group border-light-dark rounded-3 bg-light px-2.5 py-0.5">
                        <span class="input-group-text bg-transparent border-0 pe-2"><i class="bi bi-search text-muted"></i></span>
                        <input type="text" name="search" class="form-control bg-transparent border-0 shadow-none text-dark small" placeholder="Cari judul buku, nama penulis, atau kode SKU..." value="{{ request('search') }}">
                    </div>
                </div>
                <div class="col-md-4 col-lg-3 text-md-end d-flex justify-content-md-end gap-2">
                    <button type="button" id="btnBulkDelete" class="btn btn-danger btn-sm rounded-3 fw-bold d-none px-3 w-100" onclick="confirmBulkDelete()">
                        <i class="bi bi-trash3-fill me-1.5"></i> Hapus Massal (<span id="selectedCount">0</span>)
                    </button>
                    <button type="submit" class="btn btn-primary btn-sm px-4 py-2.5 rounded-3 fw-bold shadow-sm w-100">Cari Katalog</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Main Table Section --}}
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        <form action="{{ route('pnb.bulkDelete') }}" method="POST" id="formBulkDelete">
            @csrf
            @method('DELETE')
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-thead-modern border-bottom text-uppercase tracking-wider small">
                        <tr>
                            <th class="ps-4" style="width: 45px;">
                                <div class="form-check d-flex align-items-center justify-content-center">
                                    <input type="checkbox" class="form-check-input checkbox-custom" id="selectAll">
                                </div>
                            </th>
                            <th class="py-3.5">Identitas & Informasi Buku</th>
                            <th class="py-3.5">Penulis</th>
                            <th class="py-3.5">Status Stok</th>
                            <th class="py-3.5">Harga Satuan</th>
                            <th class="text-end pe-4 py-3.5">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="border-0">
                        @forelse($books as $b)
                        <tr class="table-row-modern">
                            <td class="ps-4">
                                <div class="form-check d-flex align-items-center justify-content-center">
                                    <input type="checkbox" name="ids[]" value="{{ $b->id }}" class="form-check-input checkbox-custom book-checkbox">
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center py-1">
                                    <div class="book-icon-wrapper rounded-3 p-2.5 me-3 text-primary border">
                                        <i class="bi bi-book fs-5"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold text-dark fs-6 mb-0.5">{{ $b->judul }}</div>
                                        <div class="font-monospace text-primary fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">PNB-SALUR-{{ str_pad($b->id, 4, '0', STR_PAD_LEFT) }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-secondary small fw-medium">{{ $b->penulis ?? '-' }}</td>
                            <td>
                                @php $isLow = $b->stok_gudang <= 10; @endphp
                                <span class="badge {{ $isLow ? 'bg-danger-subtle text-danger border-danger-subtle' : 'bg-success-subtle text-success border-success-subtle' }} border rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center">
                                    <i class="bi {{ $isLow ? 'bi-exclamation-circle-fill me-1.5' : 'bi-check-circle-fill me-1.5' }}"></i>
                                    {{ $b->stok_gudang }} Eks
                                </span>
                            </td>
                            <td><div class="fw-bold text-dark">Rp {{ number_format($b->harga_jual, 0, ',', '.') }}</div></td>
                            <td class="text-end pe-4">
                                <div class="d-inline-flex gap-1.5">
                                    {{-- Tombol Ubah Data --}}
                                    <button type="button" class="btn btn-icon-edit rounded-3 p-2 border shadow-none" data-bs-toggle="modal" data-bs-target="#editHarga{{ $b->id }}" title="Ubah Informasi Buku">
                                        <i class="bi bi-pencil-square fs-5"></i>
                                    </button>

                                    {{-- Tombol Hapus Buku Satuan --}}
                                    <form action="{{ route('pnb.hapus-buku', $b->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus buku &ldquo;{{ $b->judul }}&rdquo; dari katalog?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-icon-delete rounded-3 p-2 border shadow-none" title="Hapus Buku">
                                            <i class="bi bi-trash fs-5"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="text-center py-5 bg-light-subtle">
                                <div class="py-4">
                                    <i class="bi bi-journal-x text-muted opacity-25" style="font-size: 3.5rem;"></i>
                                    <h5 class="fw-bold text-dark mt-3 mb-1">Belum Ada Katalog</h5>
                                    <p class="text-muted small">Tidak ada item operasional S-SALUR yang terdaftar saat ini.</p>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </form>

        <div class="px-4 py-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center bg-light-subtle gap-3">
            <div class="small text-muted fw-medium">Menampilkan master data PNB — SAPA ALL MIS</div>
            <div class="pagination-modern-wrapper">
                {{ $books->links('pagination::bootstrap-5') }}
            </div>
        </div>
    </div>
</div>

{{-- MODAL TAMBAH JUDUL --}}
<div class="modal fade" id="tambahBuku" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('pnb.tambahBuku') }}" method="POST">
                @csrf
                <div class="modal-header border-0 px-4 pt-4 pb-0">
                    <h5 class="fw-bold text-dark mb-0"><i class="bi bi-journal-plus me-2 text-success"></i>Registrasi Katalog Baru</h5>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body px-4 py-3.5">
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Judul Lengkap Buku</label>
                        <input type="text" name="judul" class="form-control border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" placeholder="Contoh: Pemrograman Laravel Modern" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Nama Penulis / Author</label>
                        <input type="text" name="penulis" class="form-control border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" placeholder="Contoh: Willsens Kiren Alexander" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Harga Jual Pasar</label>
                        <div class="input-group border-light-dark rounded-3 bg-light px-2 py-0.5">
                            <span class="input-group-text bg-transparent border-0 text-muted small fw-bold pe-2">Rp</span>
                            <input type="number" name="harga_jual" class="form-control bg-transparent border-0 shadow-none text-dark" placeholder="Contoh: 85000" required>
                        </div>
                    </div>
                    <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-success py-2.5 fw-bold rounded-3 shadow-sm">Simpan Data Katalog</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- Modal Pengajuan Cetak --}}
<div class="modal fade" id="modalCetak" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('pnb.ajukanCetak') }}" method="POST">
                @csrf
                <div class="modal-header border-0 px-4 pt-4 pb-0">
                    <h5 class="fw-bold text-dark mb-0"><i class="bi bi-printer-fill me-2 text-primary"></i>Form Pengajuan Cetak Ulang</h5>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body px-4 py-3.5">
                    <div class="alert alert-info border-0 rounded-3 small mb-3 text-info-tight d-flex">
                        <i class="bi bi-info-circle-fill me-2 fs-5 mt-0.5"></i>
                        <div>Dokumen cetak ini akan diteruskan ke <strong>Divisi Keuangan / Finance (KEU)</strong> secara real-time untuk peninjauan anggaran produksi.</div>
                    </div>

                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Pilih Item Buku S-SALUR</label>
                        <select name="book_id" class="form-select border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" required>
                            <option value="" selected disabled>Pilih salah satu item...</option>
                            @foreach($books as $b)
                                <option value="{{ $b->id }}">{{ $b->judul }} (Sisa Stok: {{ $b->stok_gudang }})</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Target Eksemplar Cetak</label>
                        <input type="number" name="jumlah" class="form-control border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" placeholder="Contoh: 1500" required>
                    </div>

                    <div class="d-grid mt-4">
                        <button type="submit" class="btn btn-primary py-2.5 fw-bold rounded-3 shadow-sm">Kirim ke Bendahara</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- MODAL EDIT FULL CRUD (Judul, Penulis, Harga) --}}
@foreach($books as $b)
<div class="modal fade" id="editHarga{{ $b->id }}" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('penerbitan.updateHarga', $b->id) }}" method="POST">
                @csrf
                <div class="modal-header border-0 px-4 pt-4 pb-0">
                    <h5 class="fw-bold text-dark mb-0"><i class="bi bi-pencil-square me-2 text-primary"></i>Ubah Informasi Katalog</h5>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body px-4 py-3.5">
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Judul Buku</label>
                        <input type="text" name="judul" class="form-control border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" value="{{ $b->judul }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Nama Penulis</label>
                        <input type="text" name="penulis" class="form-control border-light-dark bg-light text-dark shadow-none rounded-3 px-3 py-2" value="{{ $b->penulis }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Harga Jual Pasar</label>
                        <div class="input-group border-light-dark rounded-3 bg-light px-2 py-0.5">
                            <span class="input-group-text bg-transparent border-0 text-muted small fw-bold pe-2">Rp</span>
                            <input type="number" name="harga_jual" class="form-control bg-transparent border-0 shadow-none text-dark fw-bold" value="{{ $b->harga_jual }}" required>
                        </div>
                    </div>

                    <div class="row g-2 mt-3">
                        <div class="col-6"><button type="button" class="btn btn-light w-100 rounded-3 text-secondary fw-semibold border-0 py-2.5" data-bs-dismiss="modal">Batal</button></div>
                        <div class="col-6"><button type="submit" class="btn btn-primary w-100 rounded-3 text-white fw-bold py-2.5 shadow-sm">Simpan Perubahan</button></div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endforeach

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const selectAll = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.book-checkbox');
        const btnBulkDelete = document.getElementById('btnBulkDelete');
        const selectedCountLabel = document.getElementById('selectedCount');

        function updateBulkButton() {
            const checkedCount = document.querySelectorAll('.book-checkbox:checked').length;
            btnBulkDelete.classList.toggle('d-none', checkedCount === 0);
            selectedCountLabel.textContent = checkedCount;
        }

        if(selectAll) {
            selectAll.addEventListener('click', function() {
                checkboxes.forEach(cb => cb.checked = selectAll.checked);
                updateBulkButton();
            });
        }

        checkboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                if (!this.checked) selectAll.checked = false;
                if (document.querySelectorAll('.book-checkbox:checked').length === checkboxes.length) selectAll.checked = true;
                updateBulkButton();
            });
        });
    });

    function confirmBulkDelete() {
        if (confirm('Apakah Anda yakin ingin menghapus seluruh item S-SALUR yang dipilih beserta riwayat terkait?')) {
            document.getElementById('formBulkDelete').submit();
        }
    }
</script>

<style>
    /* Global Overrides & Variables */
    :root {
        --bs-primary: #4361ee;
        --bs-success: #2ec4b6;
        --bs-danger: #e63946;
        --bs-warning: #ffb703;
    }

    .fw-extrabold { font-weight: 800; }
    .fw-semibold { font-weight: 600; }

    /* Breadcrumb & Navigation */
    .breadcrumb-item + .breadcrumb-item::before { content: "•"; color: #adb5bd; font-weight: bold; }

    /* Modern Action Buttons */
    .btn-action-pdf {
        background: #fff;
        color: var(--bs-danger);
        border: 1.5px solid #f8d7da;
        transition: all 0.25s ease;
    }
    .btn-action-pdf:hover {
        background: #f8d7da;
        color: #721c24;
    }
    .btn-action-secondary {
        background: #fff;
        color: #4a5568;
        border: 1.5px solid #e2e8f0;
        transition: all 0.25s ease;
    }
    .btn-action-secondary:hover {
        background: #f7fafc;
        border-color: #cbd5e0;
    }
    .btn-primary { background-color: var(--bs-primary); border-color: var(--bs-primary); }
    .btn-primary:hover { background-color: #3046c8; border-color: #3046c8; }
    .btn-success { background-color: var(--bs-success); border-color: var(--bs-success); }
    .btn-success:hover { background-color: #24a196; border-color: #24a196; }

    /* Stats Dashboard widget */
    .card-stat {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        background-color: #fff;
    }
    .card-stat:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.04) !important;
    }
    .stat-icon-box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
    }

    /* Input Controls */
    .border-light-dark { border: 1.5px solid #edf2f7; }
    .input-group:focus-within {
        border-color: var(--bs-primary) !important;
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
    }
    .form-control:focus, .form-select:focus {
        background-color: #fff !important;
        border-color: var(--bs-primary) !important;
        box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
    }

    /* Custom Checkbox Design */
    .checkbox-custom {
        width: 18px;
        height: 18px;
        border: 2px solid #cbd5e0;
        border-radius: 4px;
        cursor: pointer;
    }
    .checkbox-custom:checked {
        background-color: var(--bs-primary);
        border-color: var(--bs-primary);
    }

    /* Table Custom UI Component */
    .table-thead-modern th {
        background-color: #f8fafc;
        color: #64748b;
        font-weight: 700;
        font-size: 0.75rem;
        letter-spacing: 0.75px;
        border-top: none;
    }
    .table-row-modern {
        transition: background-color 0.2s ease;
    }
    .table-row-modern:hover {
        background-color: #f8fafc !important;
    }
    .book-icon-wrapper {
        background-color: #f1f5f9;
        border-color: #e2e8f0 !important;
    }
    .btn-icon-edit {
        background-color: #fff;
        color: #64748b;
        border-color: #e2e8f0;
        transition: all 0.2s ease;
    }
    .btn-icon-edit:hover {
        background-color: var(--bs-primary);
        color: #fff;
        border-color: var(--bs-primary);
    }
    .btn-icon-delete {
        background-color: #fff;
        color: var(--bs-danger);
        border-color: #f8d7da;
        transition: all 0.2s ease;
    }
    .btn-icon-delete:hover {
        background-color: var(--bs-danger);
        color: #fff;
        border-color: var(--bs-danger);
    }

    /* Subdued Alert Text colors */
    .text-success-tight { color: #155724; }
    .text-danger-tight { color: #721c24; }
    .text-info-tight { color: #0c5460; background-color: #d1ecf1; }
</style>
@endsection
