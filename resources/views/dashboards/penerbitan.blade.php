@extends('layouts.app')

@section('content')
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<div class="container py-4 text-start">
    {{-- Alert Notifikasi Sukses --}}
    @if(session('success'))
        <div class="alert alert-modern-success alert-dismissible fade show border-0 shadow-smooth mb-4 rounded-4" role="alert">
            <div class="d-flex align-items-center p-1">
                <div class="alert-icon-circle bg-success-soft text-success me-3">
                    <i class="bi bi-check-lg fw-bold"></i>
                </div>
                <div class="fw-semibold text-dark">{{ session('success') }}</div>
            </div>
            <button type="button" class="btn-close shadow-none top-50 translate-middle-y me-2" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    {{-- Alert Notifikasi Gagal/Error --}}
    @if(session('error'))
        <div class="alert alert-modern-danger alert-dismissible fade show border-0 shadow-smooth mb-4 rounded-4" role="alert">
            <div class="d-flex align-items-center p-1">
                <div class="alert-icon-circle bg-danger-soft text-danger me-3">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>
                <div class="fw-semibold text-dark">{{ session('error') }}</div>
            </div>
            <button type="button" class="btn-close shadow-none top-50 translate-middle-y me-2" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    {{-- Header Section --}}
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 pb-3 border-bottom border-light-dark">
        <div>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1 align-items-center">
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-primary-premium fw-bold fs-7">Divisi PNB</li>
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-muted fw-semibold fs-7">S-SALUR Inventory</li>
                </ol>
            </nav>
            <h2 class="fw-black text-dark tracking-tight mb-1">Manajemen Katalog & Stok</h2>
            <p class="text-muted small mb-0">Pengelolaan item operasional ekosistem <span class="badge bg-primary-soft text-primary-premium border border-primary-soft rounded-pill px-2.5 py-1 fw-bold">S-SALUR</span></p>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
            <a href="{{ route('pnb.exportPdf') }}" target="_blank" class="btn btn-action-pdf rounded-3 fw-bold shadow-smooth px-3 py-2">
                <i class="bi bi-file-earmark-pdf me-1.5"></i> Ekspor PDF
            </a>

            <button class="btn btn-action-secondary rounded-3 fw-bold shadow-smooth px-3 py-2" data-bs-toggle="modal" data-bs-target="#modalCetak">
                <i class="bi bi-printer me-1.5"></i> Ajukan Cetak
            </button>

            <button class="btn btn-modern-primary rounded-3 fw-bold shadow-smooth px-3.5 py-2" data-bs-toggle="modal" data-bs-target="#tambahBuku">
                <i class="bi bi-plus-lg me-1.5 fw-bold"></i> Tambah Judul
            </button>
        </div>
    </div>

    {{-- Statistik Widgets --}}
    <div class="row g-3 mb-4">
        <div class="col-6 col-lg-3">
            <div class="card card-stat border-0 shadow-smooth rounded-4 p-3.5 h-100">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-box bg-primary-soft p-3 rounded-3 text-primary-premium me-3">
                        <i class="bi bi-journal-bookmark fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-semibold text-uppercase tracking-wider fs-7">Katalog Aktif</div>
                        <div class="fw-black fs-4 text-dark mt-0.5">{{ $books->total() }} <span class="fs-6 fw-semibold text-muted">Judul</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card card-stat border-0 shadow-smooth rounded-4 p-3.5 h-100">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-box bg-warning-soft p-3 rounded-3 text-warning-premium me-3">
                        <i class="bi bi-box-seam fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-semibold text-uppercase tracking-wider fs-7">Stok Ready</div>
                        <div class="fw-black fs-4 text-dark mt-0.5">{{ number_format($books->sum('stok_gudang'), 0, ',', '.') }} <span class="fs-6 fw-semibold text-muted">Eks</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card card-stat border-0 shadow-smooth rounded-4 p-3.5 h-100">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-box bg-danger-soft p-3 rounded-3 text-danger me-3 position-relative">
                        <i class="bi bi-exclamation-circle fs-4"></i>
                        @if($books->where('stok_gudang', '<=', 10)->count() > 0)
                            <span class="pulse-dot-danger"></span>
                        @endif
                    </div>
                    <div>
                        <div class="text-muted small fw-semibold text-uppercase tracking-wider fs-7">Kritis / Tipis</div>
                        <div class="fw-black fs-4 text-danger mt-0.5">{{ $books->where('stok_gudang', '<=', 10)->count() }} <span class="fs-6 fw-semibold text-danger opacity-75">Item</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-6 col-lg-3">
            <div class="card card-stat border-0 shadow-smooth rounded-4 p-3.5 h-100">
                <div class="d-flex align-items-center">
                    <div class="stat-icon-box bg-success-soft p-3 rounded-3 text-success me-3">
                        <i class="bi bi-wallet2 fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-semibold text-uppercase tracking-wider fs-7">Valuasi Aset</div>
                        <div class="fw-black fs-5 text-dark mt-1">Rp {{ number_format($books->sum(fn($b) => $b->stok_gudang * $b->harga_jual), 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Filter & Search Bar --}}
    <div class="card border-0 bg-white shadow-smooth rounded-4 mb-4">
        <div class="card-body p-3">
            <form action="{{ route('penerbitan') }}" method="GET" class="row g-2 align-items-center">
                <div class="col-md-8 col-lg-9">
                    <div class="input-group modern-input-group px-2.5 py-0.5">
                        <span class="input-group-text bg-transparent border-0 pe-2"><i class="bi bi-search text-muted"></i></span>
                        <input type="text" name="search" class="form-control bg-transparent border-0 shadow-none text-dark small" placeholder="Cari judul buku, nama penulis, atau kode SKU..." value="{{ request('search') }}">
                    </div>
                </div>
                <div class="col-md-4 col-lg-3 text-md-end d-flex justify-content-md-end gap-2">
                    <button type="button" id="btnBulkDelete" class="btn btn-modern-danger btn-sm rounded-3 fw-bold d-none px-3 w-100" onclick="confirmBulkDelete()">
                        <i class="bi bi-trash3 me-1.5"></i> Hapus Massal (<span id="selectedCount">0</span>)
                    </button>
                    <button type="submit" class="btn btn-modern-primary btn-sm px-4 py-2.5 rounded-3 fw-bold shadow-smooth w-100">Cari Katalog</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Main Table Section --}}
    <div class="card border-0 shadow-smooth rounded-4 overflow-hidden bg-white">
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
                        <tr class="modern-row">
                            <td class="ps-4">
                                <div class="form-check d-flex align-items-center justify-content-center">
                                    <input type="checkbox" name="ids[]" value="{{ $b->id }}" class="form-check-input checkbox-custom book-checkbox">
                                </div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center py-1">
                                    <div class="book-icon-wrapper rounded-3 p-2.5 me-3 border border-light-dark">
                                        <i class="bi bi-book text-primary-premium fs-5"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold text-dark fs-6 mb-0.5">{{ $b->judul }}</div>
                                        <div class="font-monospace text-primary-premium fw-semibold tracking-wider" style="font-size: 0.72rem;">PNB-SALUR-{{ str_pad($b->id, 4, '0', STR_PAD_LEFT) }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-secondary small fw-medium">{{ $b->penulis ?? '-' }}</td>
                            <td>
                                @php $isLow = $b->stok_gudang <= 10; @endphp
                                <span class="badge {{ $isLow ? 'bg-danger-soft text-danger border-danger-soft' : 'bg-success-soft text-success border-success-soft' }} border rounded-pill px-3 py-1.5 fw-bold d-inline-flex align-items-center shadow-none small">
                                    <span class="indicator-dot {{ $isLow ? 'bg-danger' : 'bg-success' }} me-1.5"></span>
                                    {{ $b->stok_gudang }} Eks
                                </span>
                            </td>
                            <td><div class="fw-bold text-dark-slate">Rp {{ number_format($b->harga_jual, 0, ',', '.') }}</div></td>
                            <td class="text-end pe-4">
                                <div class="d-inline-flex gap-2">
                                    <button type="button" class="btn btn-action-edit rounded-3 shadow-none" data-bs-toggle="modal" data-bs-target="#editHarga{{ $b->id }}" title="Ubah Informasi Buku">
                                        <i class="bi bi-pencil"></i>
                                    </button>

                                    <form action="{{ route('pnb.hapus-buku', $b->id) }}" method="POST" class="m-0" onsubmit="return confirm('Apakah Anda yakin ingin menghapus buku &ldquo;{{ $b->judul }}&rdquo; dari katalog?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-action-delete rounded-3 shadow-none" title="Hapus Buku">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="text-center py-5 bg-white">
                                <div class="py-4">
                                    <div class="alert-icon-circle bg-secondary-soft text-muted mx-auto mb-3" style="width: 70px; height: 70px; font-size: 1.8rem;">
                                        <i class="bi bi-journal-x opacity-50"></i>
                                    </div>
                                    <h5 class="fw-bold text-dark mb-1">Belum Ada Katalog</h5>
                                    <p class="text-muted small max-w-md mx-auto">Tidak ada item operasional S-SALUR yang terdaftar saat ini di dalam server database.</p>
                                </div>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </form>

        <div class="px-4 py-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center bg-light-subtle gap-3">
            <div class="small text-muted fw-semibold fs-7">Menampilkan master data PNB — SAPA ALL MIS</div>
            <div class="pagination-modern-wrapper">
                {{ $books->links('pagination::bootstrap-5') }}
            </div>
        </div>
    </div>
</div>

{{-- MODAL TAMBAH JUDUL --}}
<div class="modal fade" id="tambahBuku" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <form action="{{ route('pnb.tambahBuku') }}" method="POST">
                @csrf
                <div class="modal-header border-0 px-4 pt-4 pb-2 bg-white">
                    <h5 class="fw-black text-dark mb-0 d-flex align-items-center"><i class="bi bi-journal-plus me-2 text-success fs-4"></i>Registrasi Katalog Baru</h5>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body px-4 pb-4 pt-2">
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Judul Lengkap Buku</label>
                        <input type="text" name="judul" class="form-control modern-input" placeholder="Contoh: Pemrograman Laravel Modern" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Nama Penulis / Author</label>
                        <input type="text" name="penulis" class="form-control modern-input" placeholder="Contoh: Willsens Kiren Alexander" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Harga Jual Pasar</label>
                        <div class="input-group border-0 rounded-3 bg-light-premium p-0.5">
                            <span class="input-group-text bg-transparent border-0 text-muted small fw-bold pe-2 ps-3">Rp</span>
                            <input type="number" name="harga_jual" class="form-control bg-transparent border-0 shadow-none text-dark fw-semibold" placeholder="Contoh: 85000" required>
                        </div>
                    </div>
                    <div class="row g-2 mt-3">
                        <div class="col-6"><button type="button" class="btn btn-modern-secondary w-100 rounded-3 fw-semibold py-2.5" data-bs-dismiss="modal">Batal</button></div>
                        <div class="col-6"><button type="submit" class="btn btn-modern-success w-100 rounded-3 fw-bold py-2.5 text-white shadow-smooth">Simpan Data</button></div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- Modal Pengajuan Cetak --}}
<div class="modal fade" id="modalCetak" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <form action="{{ route('pnb.ajukanCetak') }}" method="POST">
                @csrf
                <div class="modal-header border-0 px-4 pt-4 pb-2 bg-white">
                    <h5 class="fw-black text-dark mb-0 d-flex align-items-center"><i class="bi bi-printer me-2 text-primary-premium fs-4"></i>Pengajuan Cetak Ulang</h5>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body px-4 pb-4 pt-2">
                    <div class="alert alert-modern-info border-0 rounded-3 small mb-3 d-flex p-3">
                        <i class="bi bi-info-circle text-primary-premium me-2.5 fs-5"></i>
                        <div class="text-dark-slate fw-medium">Dokumen cetak ini akan diteruskan ke <strong class="text-primary-premium">Divisi Keuangan (KEU)</strong> secara real-time untuk peninjauan anggaran produksi.</div>
                    </div>

                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Pilih Item Buku S-SALUR</label>
                        <select name="book_id" class="form-select modern-input" required>
                            <option value="" selected disabled>Pilih salah satu item...</option>
                            @foreach($books as $b)
                                <option value="{{ $b->id }}">{{ $b->judul }} (Sisa Stok: {{ $b->stok_gudang }})</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Target Eksemplar Cetak</label>
                        <input type="number" name="jumlah" class="form-control modern-input" placeholder="Contoh: 1500" required>
                    </div>

                    <div class="row g-2 mt-3">
                        <div class="col-6"><button type="button" class="btn btn-modern-secondary w-100 rounded-3 fw-semibold py-2.5" data-bs-dismiss="modal">Batal</button></div>
                        <div class="col-6"><button type="submit" class="btn btn-modern-primary w-100 rounded-3 fw-bold py-2.5 text-white shadow-smooth">Kirim ke Finance</button></div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- MODAL EDIT FULL CRUD --}}
@foreach($books as $b)
<div class="modal fade" id="editHarga{{ $b->id }}" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
            <form action="{{ route('penerbitan.updateHarga', $b->id) }}" method="POST">
                @csrf
                <div class="modal-header border-0 px-4 pt-4 pb-2 bg-white">
                    <h5 class="fw-black text-dark mb-0 d-flex align-items-center"><i class="bi bi-pencil-square me-2 text-primary-premium fs-4"></i>Ubah Informasi Katalog</h5>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body px-4 pb-4 pt-2">
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Judul Buku</label>
                        <input type="text" name="judul" class="form-control modern-input" value="{{ $b->judul }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Nama Penulis</label>
                        <input type="text" name="penulis" class="form-control modern-input" value="{{ $b->penulis }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold mb-1.5 text-secondary">Harga Jual Pasar</label>
                        <div class="input-group border-0 rounded-3 bg-light-premium p-0.5">
                            <span class="input-group-text bg-transparent border-0 text-muted small fw-bold pe-2 ps-3">Rp</span>
                            <input type="number" name="harga_jual" class="form-control bg-transparent border-0 shadow-none text-dark fw-bold" value="{{ $b->harga_jual }}" required>
                        </div>
                    </div>

                    <div class="row g-2 mt-3">
                        <div class="col-6"><button type="button" class="btn btn-modern-secondary w-100 rounded-3 fw-semibold py-2.5" data-bs-dismiss="modal">Batal</button></div>
                        <div class="col-6"><button type="submit" class="btn btn-modern-primary w-100 rounded-3 text-white fw-bold py-2.5 shadow-smooth">Simpan Perubahan</button></div>
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
            if(btnBulkDelete) {
                btnBulkDelete.classList.toggle('d-none', checkedCount === 0);
                selectedCountLabel.textContent = checkedCount;
            }
        }

        if(selectAll) {
            selectAll.addEventListener('click', function() {
                checkboxes.forEach(cb => cb.checked = selectAll.checked);
                updateBulkButton();
            });
        }

        checkboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                if (!this.checked && selectAll) selectAll.checked = false;
                if (selectAll && document.querySelectorAll('.book-checkbox:checked').length === checkboxes.length) selectAll.checked = true;
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
    /* @import Google Fonts DIHAPUS dari sini karena sudah dipindah ke atas memakai <link> */
    .fw-black { font-weight: 800 !important; }
    .tracking-tight { letter-spacing: -0.025em; }
    .tracking-wider { letter-spacing: 0.05em; }
    .fs-7 { font-size: 0.75rem !important; }
    .shadow-smooth { box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01) !important; }

    .text-primary-premium { color: #4f46e5 !important; }
    .text-warning-premium { color: #d97706 !important; }
    .text-dark-slate { color: #334155 !important; }
    .border-light-dark { border-color: #f1f5f9 !important; }
    .bg-light-premium { background-color: #f8fafc !important; }

    .bg-primary-soft { background-color: rgba(79, 70, 229, 0.06) !important; }
    .bg-danger-soft { background-color: rgba(239, 68, 68, 0.07) !important; }
    .bg-success-soft { background-color: rgba(16, 185, 129, 0.08) !important; }
    .bg-warning-soft { background-color: rgba(245, 158, 11, 0.07) !important; }
    .bg-secondary-soft { background-color: rgba(148, 163, 184, 0.12) !important; }

    .breadcrumb-item + .breadcrumb-item::before { content: "•" !important; color: #cbd5e1 !important; font-weight: bold; }

    .modern-input-group {
        background-color: #f8fafc !important;
        border: 1.5px solid #e2e8f0 !important;
        border-radius: 10px !important;
        transition: all 0.2s ease;
    }
    .modern-input-group:focus-within {
        border-color: #4f46e5 !important;
        background-color: #ffffff !important;
        box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
    }

    .modern-input {
        background-color: #f8fafc !important;
        border: 1.5px solid #e2e8f0 !important;
        color: #1e293b !important;
        border-radius: 10px !important;
        padding: 0.6rem 1rem !important;
        transition: all 0.2s ease !important;
    }
    .modern-input:focus {
        background-color: #ffffff !important;
        border-color: #4f46e5 !important;
        box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1) !important;
    }

    .btn-modern-primary { background: linear-gradient(135deg, #4f46e5 0%, #3d35b8 100%) !important; color: white !important; border: none !important; transition: all 0.2s ease; }
    .btn-modern-primary:hover { background: linear-gradient(135deg, #4338ca 0%, #2e2692 100%) !important; box-shadow: 0 8px 16px rgba(79, 70, 229, 0.15) !important; transform: translateY(-0.5px); }
    .btn-modern-success { background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; color: white !important; border: none !important; transition: all 0.2s ease; }
    .btn-modern-success:hover { background: linear-gradient(135deg, #059669 0%, #047857 100%) !important; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.15) !important; }
    .btn-modern-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important; color: white !important; border: none !important; transition: all 0.2s; }
    .btn-modern-danger:hover { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important; }
    .btn-modern-secondary { background: #ffffff !important; color: #475569 !important; border: 1px solid #e2e8f0 !important; transition: all 0.2s; }
    .btn-modern-secondary:hover { background: #f8fafc !important; color: #1e293b !important; }

    .btn-action-pdf { background: #ffffff; color: #ef4444; border: 1.5px solid #fee2e2; transition: all 0.2s; }
    .btn-action-pdf:hover { background: #fef2f2; border-color: #fca5a5; color: #b91c1c; }
    .btn-action-secondary { background: #ffffff; color: #475569; border: 1.5px solid #e2e8f0; transition: all 0.2s; }
    .btn-action-secondary:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }

    .alert-modern-success { background-color: #f0fdf4 !important; border: 1px solid #bbf7d0 !important; }
    .alert-modern-danger { background-color: #fef2f2 !important; border: 1px solid #fecaca !important; }
    .alert-modern-info { background-color: rgba(79, 70, 229, 0.04) !important; border: 1px solid rgba(79, 70, 229, 0.12) !important; }
    .alert-icon-circle { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }

    .card-stat { border-radius: 16px; transition: all 0.25s ease; background: #ffffff; }
    .card-stat:hover { transform: translateY(-2px); box-shadow: 0 16px 36px -12px rgba(0,0,0,0.06) !important; }
    .stat-icon-box { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; }

    .pulse-dot-danger { position: absolute; top: 12px; right: 12px; width: 7px; height: 7px; background-color: #ef4444; border-radius: 50%; animation: pulse-danger-live 2s infinite; }
    @keyframes pulse-danger-live { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
    .indicator-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }

    .checkbox-custom { width: 16px; height: 16px; border: 2px solid #cbd5e1; border-radius: 4px; cursor: pointer; transition: all 0.15s ease; }
    .checkbox-custom:checked { background-color: #4f46e5 !important; border-color: #4f46e5 !important; box-shadow: 0 2px 4px rgba(79,70,229,0.2); }
    .checkbox-custom:focus { box-shadow: none !important; border-color: #4f46e5; }

    .table-thead-modern th { background: #f8fafc !important; color: #64748b !important; font-weight: 700; font-size: 0.72rem; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0 !important; }
    .modern-row { transition: background-color 0.2s ease; }
    .modern-row:hover { background-color: #f8fafc !important; }
    .book-icon-wrapper { background: #f8fafc; color: #4f46e5; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; }

    .btn-action-edit { background: #ffffff; color: #64748b; border: 1px solid #e2e8f0; width: 34px; height: 34px; padding: 0; font-size: 14px; transition: all 0.2s ease; }
    .btn-action-edit:hover { background: #4f46e5; color: #ffffff; border-color: #4f46e5; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
    .btn-action-delete { background: #ffffff; color: #ef4444; border: 1px solid #fee2e2; width: 34px; height: 34px; padding: 0; font-size: 14px; transition: all 0.2s ease; }
    .btn-action-delete:hover { background: #ef4444; color: #ffffff; border-color: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
</style>
@endsection
