@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<div class="container py-4 text-start">
    {{-- Notifikasi --}}
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show border-0 shadow-sm rounded-4 mb-4" role="alert">
            <i class="bi bi-check-circle-fill me-2"></i> {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif
    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show border-0 shadow-sm rounded-4 mb-4" role="alert">
            <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold m-0 text-dark">📦 Divisi Logistik</h2>
            <p class="text-muted mb-0 small">Manajemen stok keluar dan antrean packing marketing.</p>
        </div>
        <div class="text-end">
            <span class="badge bg-dark px-3 py-2 rounded-pill">Total Keluar: {{ $stats['total_keluar'] ?? 0 }} Buku</span>
        </div>
    </div>

    <div class="row g-4">
        {{-- Kiri: Input Manual --}}
        <div class="col-md-4">
            <div class="card shadow-sm border-0 rounded-4 p-4 mb-4">
                <div class="d-flex align-items-center mb-4">
                    <div class="bg-light-danger p-2 rounded-3 me-3">
                        <i class="bi bi-pencil-square text-danger fs-4"></i>
                    </div>
                    <h5 class="fw-bold m-0">Input Manual</h5>
                </div>
                
                <form action="{{ route('logistik.simpan-keluar') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Pilih Buku</label>
                        <select name="buku_id" class="form-select border-0 bg-light rounded-3" required>
                            <option value="">-- Pilih Buku --</option>
                            @foreach($books as $b)
                                <option value="{{ $b->id }}">{{ $b->judul ?? $b->judul_buku }} (Stok: {{ $b->stok_gudang }})</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Jumlah Keluar</label>
                        <input type="number" name="jumlah" class="form-control border-0 bg-light rounded-3" placeholder="0" required min="1">
                    </div>
                    <div class="mb-4">
                        <label class="small fw-bold text-muted mb-1">Tujuan / Nama Penerima</label>
                        <input type="text" name="tujuan" class="form-control border-0 bg-light rounded-3" placeholder="Contoh: Toko ABC / Agen X" required>
                    </div>
                    <button type="submit" class="btn btn-danger w-100 fw-bold py-2 shadow-sm rounded-3">
                        <i class="bi bi-box-arrow-right me-1"></i> SIMPAN KELUAR
                    </button>
                </form>
            </div>
        </div>

        {{-- Kanan: Meja Packing & Riwayat --}}
        <div class="col-md-8">
            {{-- Meja Packing --}}
            <div class="card shadow-sm border-0 rounded-4 p-4 mb-4 border-start border-warning border-5">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h5 class="fw-bold text-dark m-0">
                        <i class="bi bi-hourglass-split text-warning me-2"></i>Meja Packing
                    </h5>
                    <span class="badge bg-soft-warning text-warning px-3 rounded-pill">
                        {{ $pendingShipments->count() }} Antrean
                    </span>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle custom-table">
                        <thead>
                            <tr class="text-muted small text-uppercase">
                                <th style="width: 25%">Invoice</th>
                                <th style="width: 40%">Buku</th>
                                <th style="width: 15%" class="text-center">Qty</th>
                                <th style="width: 20%" class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($pendingShipments as $ps)
                            <tr>
                                <td class="fw-bold text-dark">{{ $ps->no_invoice }}</td>
                                <td>
                                    <div class="fw-semibold">{{ $ps->book->judul ?? $ps->book->judul_buku ?? 'Produk Tidak Diketahui' }}</div>
                                    <small class="text-muted" style="font-size: 10px;">{{ $ps->nama_agen ?? 'Tujuan: Marketing' }}</small>
                                </td>
                                <td class="text-center">
                                    <span class="badge bg-info">
                                    {{ $ps->jumlah > 0 ? $ps->jumlah : ($ps->qty > 0 ? $ps->qty : 0) }} Eks
                                    </span>
                                </td>
                                <td class="text-center">
                                    <form action="{{ route('logistik.kirim-dari-marketing', $ps->id) }}" method="POST" onsubmit="return confirm('Konfirmasi kirim barang?')">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-success fw-bold px-3 rounded-pill shadow-sm">
                                            <i class="bi bi-truck me-1"></i> KIRIM
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center py-5">
                                    <div class="text-muted">
                                        <i class="bi bi-clipboard2-check display-6 mb-3 d-block opacity-50"></i>
                                        <p class="mb-0 fw-semibold">Tidak ada antrean packing saat ini.</p>
                                    </div>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- Riwayat Pengiriman --}}
            <div class="card shadow-sm border-0 rounded-4 p-4">
                <div class="d-flex align-items-center mb-4">
                    <div class="bg-light-primary p-2 rounded-3 me-3">
                        <i class="bi bi-clock-history text-primary fs-5"></i>
                    </div>
                    <h5 class="fw-bold m-0 text-dark">Riwayat Hari Ini</h5>
                </div>

                <div class="table-responsive">
                    <table class="table table-sm table-hover align-middle small">
                        <thead>
                            <tr class="text-muted">
                                <th>Jam</th>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Tujuan</th>
                                <th class="text-center">Cetak</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($logs as $log)
                            <tr>
                                <td class="text-muted">{{ $log->created_at->format('H:i') }}</td>
                                <td class="fw-semibold">{{ $log->book->judul ?? $log->book->judul_buku ?? 'N/A' }}</td>
                                <td class="text-danger fw-bold">-{{ $log->qty_keluar }}</td>
                                <td><span class="text-truncate d-inline-block" style="max-width: 150px;">{{ $log->tujuan }}</span></td>
                                <td class="text-center">
                                    {{-- TOMBOL DIUBAH JADI IKON PRINTER --}}
                                    <a href="{{ route('logistik.cetak', $log->id) }}" 
                                       target="_blank" 
                                       class="btn btn-outline-primary btn-sm rounded-circle shadow-sm" 
                                       title="Cetak Surat Jalan"
                                       style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;">
                                        <i class="bi bi-printer-fill"></i>
                                    </a>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="5" class="text-center text-muted py-4">Belum ada pengiriman hari ini.</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .bg-light-danger { background-color: #fff5f5; }
    .bg-light-primary { background-color: #f0f7ff; }
    .bg-soft-warning { background-color: #fff9e6; }
    .custom-table thead th { border-bottom: none; padding-bottom: 15px; }
    .btn-xs { padding: 0.1rem 0.4rem; font-size: 0.75rem; }
</style>
@endsection