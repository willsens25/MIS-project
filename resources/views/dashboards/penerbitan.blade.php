@extends('layouts.app')

@section('content')
<div class="container py-4 text-start">
    {{-- Header Section --}}
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-primary fw-bold">Divisi PNB</li>
                    <li class="breadcrumb-item small text-uppercase tracking-wider active">S-SALUR Inventory</li>
                </ol>
            </nav>
            <h2 class="fw-bold mb-0">Manajemen Katalog & Stok</h2>
            <p class="text-muted small mb-0">Pengelolaan item operasional <span class="badge bg-primary-subtle text-primary border border-primary-subtle">S-SALUR</span></p>
        </div>
        <div class="d-flex align-items-center gap-2">
            <button class="btn btn-outline-secondary rounded-3 fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#modalCetak">
                <i class="bi bi-printer me-1"></i> Ajukan Cetak
            </button>
            <button class="btn btn-success rounded-3 fw-bold shadow-sm px-4" data-bs-toggle="modal" data-bs-target="#tambahBuku">
                <i class="bi bi-plus-lg me-1"></i> Tambah Judul
            </button>
        </div>
    </div>

    {{-- Statistik Widgets --}}
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
                <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded-3 me-3 text-primary">
                        <i class="bi bi-journal-bookmark-fill fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-bold">Katalog Aktif</div>
                        <div class="fw-bold fs-5">{{ $books->total() }} Judul</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
                <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded-3 me-3 text-warning">
                        <i class="bi bi-box-seam fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-bold">Total Stok Ready</div>
                        <div class="fw-bold fs-5">{{ number_format($books->sum('stok_gudang'), 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
                <div class="d-flex align-items-center">
                    <div class="bg-danger bg-opacity-10 p-3 rounded-3 me-3 text-danger">
                        <i class="bi bi-exclamation-triangle fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-bold">Perlu Cetak Ulang</div>
                        <div class="fw-bold fs-5 text-danger">{{ $books->where('stok_gudang', '<=', 10)->count() }} <span class="small fw-normal">Item</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100">
                <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded-3 me-3 text-success">
                        <i class="bi bi-cash-stack fs-4"></i>
                    </div>
                    <div>
                        <div class="text-muted small fw-bold">Valuasi Aset</div>
                        <div class="fw-bold fs-6">Rp {{ number_format($books->sum(fn($b) => $b->stok_gudang * $b->harga_jual), 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- Filter & Search Bar --}}
    <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body p-3">
            <form action="{{ route('penerbitan') }}" method="GET" class="row g-2 align-items-center">
                <div class="col-md-7">
                    <div class="input-group border rounded-3 px-2 py-1 bg-body-tertiary">
                        <span class="input-group-text bg-transparent border-0"><i class="bi bi-search text-muted"></i></span>
                        <input type="text" name="search" class="form-control bg-transparent border-0 shadow-none" placeholder="Cari judul, penulis, atau kode..." value="{{ request('search') }}">
                    </div>
                </div>
                <div class="col-md-5 text-end">
                    <button type="button" id="btnBulkDelete" class="btn btn-outline-danger btn-sm rounded-3 fw-bold d-none me-2 px-3" onclick="confirmBulkDelete()">
                        <i class="bi bi-trash me-1"></i> Hapus (<span id="selectedCount">0</span>)
                    </button>
                    <button type="submit" class="btn btn-primary btn-sm px-4 py-2 rounded-3 fw-bold">Cari Data</button>
                </div>
            </form>
        </div>
    </div>

    {{-- Main Table Section --}}
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <form action="{{ route('pnb.bulkDelete') }}" method="POST" id="formBulkDelete">
            @csrf
            @method('DELETE')
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light border-bottom text-muted small">
                        <tr>
                            <th class="ps-4" style="width: 40px;">
                                <input type="checkbox" class="form-check-input" id="selectAll">
                            </th>
                            <th class="py-3">IDENTITAS BUKU</th>
                            <th class="py-3">PENULIS</th>
                            <th class="py-3">STOK GUDANG</th>
                            <th class="py-3">HARGA JUAL</th>
                            <th class="text-end pe-4">AKSI</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($books as $b)
                        <tr>
                            <td class="ps-4">
                                <input type="checkbox" name="ids[]" value="{{ $b->id }}" class="form-check-input book-checkbox">
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="bg-body-secondary rounded-3 p-2 me-3 border">
                                        <i class="bi bi-book-half text-secondary fs-5"></i>
                                    </div>
                                    <div>
                                        <div class="fw-bold fs-6">{{ $b->judul }}</div>
                                        <div class="text-primary fw-bold" style="font-size: 0.7rem; letter-spacing: 0.5px;">PNB-SALUR-{{ str_pad($b->id, 4, '0', STR_PAD_LEFT) }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="small text-muted">{{ $b->penulis ?? '-' }}</td>
                            <td>
                                @php $isLow = $b->stok_gudang <= 10; @endphp
                                <span class="badge {{ $isLow ? 'bg-danger' : 'bg-success' }} bg-opacity-10 text-{{ $isLow ? 'danger' : 'success' }} border border-{{ $isLow ? 'danger' : 'success' }}-subtle rounded-pill px-3">
                                    @if($isLow)<i class="bi bi-arrow-down-circle me-1"></i>@endif {{ $b->stok_gudang }} Eks
                                </span>
                            </td>
                            <td><div class="fw-bold">Rp {{ number_format($b->harga_jual, 0, ',', '.') }}</div></td>
                            <td class="text-end pe-4">
                                <button type="button" class="btn btn-sm btn-outline-primary border-0 rounded-3 p-2" data-bs-toggle="modal" data-bs-target="#editHarga{{ $b->id }}">
                                    <i class="bi bi-pencil-square fs-5"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="text-center py-5">
                                <i class="bi bi-journal-x fs-1 text-muted opacity-25"></i>
                                <p class="text-muted mt-2">Belum ada katalog S-SALUR yang terdaftar.</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </form>

        <div class="px-4 py-3 border-top d-flex justify-content-between align-items-center bg-body-tertiary">
            <div class="small text-muted">Data PNB - SAPA ALL MIS</div>
            {{ $books->links('pagination::bootstrap-5') }}
        </div>
    </div>
</div>

{{-- Modal Pengajuan Cetak --}}
<div class="modal fade" id="modalCetak" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header border-0 p-4 pb-0">
                <h5 class="fw-bold mb-0"><i class="bi bi-printer-fill me-2 text-primary"></i>Pengajuan Cetak Ulang</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <p class="text-muted small">Data akan dikirim ke <strong>Bendahara (KEU)</strong> untuk persetujuan anggaran.</p>
                <div class="mb-3">
                    <label class="small fw-bold mb-1 text-muted">Pilih Item S-SALUR</label>
                    <select class="form-select border-0 bg-body-secondary">
                        @foreach($books as $b)
                            <option value="{{ $b->id }}">{{ $b->judul }} (Sisa: {{ $b->stok_gudang }})</option>
                        @endforeach
                    </select>
                </div>
                <div class="mb-3">
                    <label class="small fw-bold mb-1 text-muted">Target Jumlah (Eks)</label>
                    <input type="number" class="form-control border-0 bg-body-secondary" placeholder="Contoh: 1000">
                </div>
                <div class="d-grid mt-4">
                    <button type="button" class="btn btn-primary py-2 fw-bold rounded-3">Kirim ke Bendahara</button>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Modal Edit Harga --}}
@foreach($books as $b)
<div class="modal fade" id="editHarga{{ $b->id }}" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow">
            <form action="{{ route('penerbitan.updateHarga', $b->id) }}" method="POST">
                @csrf
                <div class="modal-body p-4 text-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3 text-primary">
                        <i class="bi bi-tag-fill fs-4"></i>
                    </div>
                    <h6 class="fw-bold mb-1">Update Harga Jual</h6>
                    <p class="text-muted small mb-4">{{ $b->judul }}</p>
                    <div class="input-group mb-4 shadow-sm">
                        <span class="input-group-text bg-body border-end-0 text-muted small fw-bold">Rp</span>
                        <input type="number" name="harga_jual" class="form-control border-start-0 ps-0 fw-bold" value="{{ $b->harga_jual }}" required>
                    </div>
                    <div class="row g-2">
                        <div class="col-6"><button type="button" class="btn btn-light w-100 rounded-3 btn-sm" data-bs-dismiss="modal">Batal</button></div>
                        <div class="col-6"><button type="submit" class="btn btn-primary w-100 rounded-3 btn-sm fw-bold">Update</button></div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
@endforeach

{{-- Script Bulk Delete --}}
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
        if (confirm('Hapus item S-SALUR yang dipilih?')) {
            document.getElementById('formBulkDelete').submit();
        }
    }
</script>

<style>
    .table thead th { letter-spacing: 0.5px; font-weight: 700; border-bottom: none; }
    .breadcrumb-item + .breadcrumb-item::before { content: "•"; color: var(--bs-secondary); }
    .badge { font-weight: 700; font-size: 11px; }
</style>
@endsection
