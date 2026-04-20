@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css" />

<div class="container py-4 text-start">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-800 text-dark mb-1">Divisi Marketing</h2>
            <p class="text-muted mb-0">Kelola pesanan agen dan pantau statistik penjualan S-SALUR.</p>
        </div>
    </div>

    <div class="row g-4">
        {{-- Form Buat Pesanan --}}
        <div class="col-md-4">
            <div class="card border-0 shadow-sm rounded-4 p-4 sticky-md-top" style="top: 5.5rem; z-index: 10;">
                <h5 class="fw-bold mb-4 text-primary"><i class="bi bi-plus-circle-dotted me-2"></i>Buat Pesanan</h5>
                <form action="{{ route('mad.kirim-buku') }}" method="POST" id="formPesanan">
                    @csrf
                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Pilih Buku</label>
                        <select name="buku_id" class="form-select select2-standard" required>
                            <option value="">-- Pilih Buku --</option>
                            @foreach($books as $b)
                                <option value="{{ $b->id }}">{{ $b->judul }} (Stok: {{ $b->stok_gudang }})</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Nama Agen</label>
                        <select name="nama_agen" id="main-select-agen" class="form-select select2-identitas" required>
                            <option value="">Cari nama agen...</option>
                            @foreach($identitas as $idnt)
                                <option value="{{ $idnt->nama_lengkap }}">{{ $idnt->nama_lengkap }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="small fw-bold text-muted mb-1">Jumlah</label>
                        <input type="number" name="jumlah" class="form-control" placeholder="0" required min="1">
                    </div>
                    <button type="submit" class="btn btn-primary w-100 fw-bold py-2 shadow-sm">Terbitkan Invoice</button>
                </form>
            </div>
        </div>

        {{-- Daftar Invoice --}}
        <div class="col-md-8">
            <div class="card border-0 shadow-sm rounded-4 p-4">
                <h5 class="fw-bold mb-4 text-dark">Daftar Invoice Terkini</h5>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0" style="min-width: 600px;">
                        <thead class="table-light">
                            <tr>
                                <th>Invoice</th>
                                <th>Agen</th>
                                <th>Tagihan</th>
                                <th>Logistik</th>
                                <th class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($invoices as $inv)
                            <tr>
                                <td>
                                    <span class="fw-bold d-block text-dark">{{ $inv->no_invoice }}</span>
                                    <small class="text-muted" style="font-size: 10px;">{{ $inv->created_at->format('d/m/y H:i') }}</small>
                                </td>
                                <td>
                                    <div class="fw-semibold text-secondary text-truncate" style="max-width: 150px;">{{ $inv->nama_agen }}</div>
                                    <small class="text-muted">{{ $inv->jumlah }} Eks</small>
                                </td>
                                <td><span class="fw-bold text-primary">Rp{{ number_format($inv->total_tagihan, 0, ',', '.') }}</span></td>
                                <td>
                                    @php
                                        $rawStatus = strtolower($inv->status_pengiriman ?? 'packing');
                                        $statusColor = match($rawStatus) {
                                            'dikirim' => 'success',
                                            'siap', 'packing' => 'warning',
                                            default => 'info'
                                        };
                                    @endphp
                                    <span class="badge bg-{{ $statusColor }} bg-opacity-10 text-{{ $statusColor }} border border-{{ $statusColor }} px-3 rounded-pill">
                                        <i class="bi bi-box-seam me-1"></i> {{ strtoupper($rawStatus) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex justify-content-center gap-1">
                                        @if($inv->status == 'Pending')
                                            <button class="btn btn-sm btn-outline-primary"
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#editModal{{ $inv->id }}"
                                                    title="Edit Pesanan">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            <form action="{{ route('mad.tandai-lunas', $inv->id) }}" method="POST" class="m-0">
                                                @csrf
                                                <button type="submit" class="btn btn-sm btn-success fw-bold px-2">LUNAS</button>
                                            </form>
                                        @else
                                            <span class="badge bg-success-subtle text-success border border-success px-2 py-1">TERBAYAR</span>
                                        @endif

                                        <form action="{{ route('mad.hapus-invoice', $inv->id) }}" method="POST" class="m-0">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-outline-danger"
                                                    onclick="return confirm('Hapus pesanan ini? Stok akan dikembalikan otomatis.')">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr><td colspan="5" class="text-center py-5 text-muted">Belum ada data invoice hari ini.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- MODAL EDIT --}}
@foreach($invoices as $inv)
<div class="modal fade" id="editModal{{ $inv->id }}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
            <form action="{{ route('mad.update-invoice', $inv->id) }}" method="POST">
                @csrf
                <div class="modal-header border-0 pb-0">
                    <h6 class="modal-title fw-bold">Update Pesanan {{ $inv->no_invoice }}</h6>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3 text-start">
                        <label class="small fw-bold text-muted mb-1">Jumlah Eksemplar</label>
                        <input type="number" name="jumlah" class="form-control rounded-3" value="{{ $inv->jumlah }}" min="1" required>
                        <div class="alert alert-info mt-3 mb-0 py-2 border-0 small">
                            <i class="bi bi-info-circle me-1"></i> Perubahan jumlah akan otomatis memperbarui data di Meja Packing Logistik.
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-light btn-sm px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary btn-sm px-4 shadow-sm">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endforeach

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script>
$(document).ready(function() {
    // Inisialisasi Select2 dengan tema Bootstrap 5
    $('.select2-standard, .select2-identitas').select2({
        theme: "bootstrap-5",
        width: '100%',
        dropdownParent: $('#formPesanan').parent()
    });

    // Fix CSS Select2 untuk Dark Mode (Menyesuaikan dengan layout app)
    function fixSelect2Dark() {
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        $('.select2-container--bootstrap-5').each(function() {
            if (isDark) {
                $(this).find('.select2-selection').css({
                    'background-color': '#2b2b2b',
                    'border-color': '#444',
                    'color': '#fff'
                });
                $(this).find('.select2-selection__rendered').css('color', '#fff');
            } else {
                $(this).find('.select2-selection').css({
                    'background-color': '#fff',
                    'border-color': '#dee2e6',
                    'color': '#212529'
                });
                $(this).find('.select2-selection__rendered').css('color', '#212529');
            }
        });
    }

    // Jalankan saat load & saat tema diganti
    fixSelect2Dark();
    $('#themeToggler').on('click', function() {
        setTimeout(fixSelect2Dark, 100);
    });
});
</script>

<style>
    .fw-800 { font-weight: 800; }
    .table thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 15px 10px; border-bottom: none; }
    .badge { letter-spacing: 0.3px; font-weight: 700; font-size: 10px; }
    .btn-sm { font-size: 0.75rem; }

    /* Sticky Top Adjustment agar tidak tertutup navbar */
    @media (min-width: 768px) {
        .sticky-md-top { top: 5rem !important; }
    }
</style>
@endsection
