@extends('layouts.app')

@section('content')
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

<style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f4f7fa; }
    .card-modern { border: none; border-radius: 20px; transition: 0.3s; }
    .stat-card { background: linear-gradient(135deg, #4361ee, #4cc9f0); color: white; border: none; border-radius: 20px; }
    .btn-modern { border-radius: 12px; padding: 12px; font-weight: 600; transition: 0.3s; }
    .btn-modern:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(67, 97, 238, 0.3); }
    .table thead th { background-color: #f8f9fa; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #6c757d; border: none; }
    .form-control, .form-select { border-radius: 12px; padding: 12px; border: 1px solid #e2e8f0; }
    .badge-soft-success { background-color: #d1fae5; color: #065f46; border-radius: 8px; padding: 5px 12px; }
</style>

<div class="container py-4">
    <div class="row mb-4">
        <div class="col-md-8 text-start">
            <h2 class="fw-800 text-dark mb-1">Kontrol Produksi</h2>
            <p class="text-muted">Pantau hasil cetak dan alokasi stok gudang secara real-time.</p>
        </div>
        <div class="col-md-4">
            <div class="card stat-card p-3 shadow-sm">
                <div class="d-flex align-items-center justify-content-between">
                    <div>
                        <small class="opacity-75">Produksi Hari Ini</small>
                        <h3 class="fw-bold mb-0">{{ number_format($stats['produksi_hari_ini']) }} <small class="fs-6">Eks</small></h3>
                    </div>
                    <i class="bi bi-box-seam fs-1 opacity-50"></i>
                </div>
            </div>
        </div>
    </div>

    @if(session('success'))
    <div class="alert alert-success border-0 shadow-sm rounded-4 mb-4">
        <i class="bi bi-check-circle-fill me-2"></i> {{ session('success') }}
    </div>
    @endif

    <div class="row g-4 text-start">
        <div class="col-lg-4">
            <div class="card card-modern shadow-sm p-4 bg-white">
                <div class="d-flex align-items-center mb-4">
                    <div class="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                        <i class="bi bi-printer-fill text-primary"></i>
                    </div>
                    <h5 class="fw-bold m-0">Input Hasil Cetak</h5>
                </div>
                
                <form action="{{ route('produksi.simpan') }}" method="POST">
                    @csrf
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Pilih Judul Buku</label>
                        <select name="buku_id" class="form-select shadow-none" required>
                            <option value="">Cari Buku...</option>
                            @foreach($books as $b)
                                <option value="{{ $b->id }}">{{ $b->judul }} (Stok: {{ $b->stok_gudang ?? 0 }})</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="form-label small fw-bold">Jumlah Eksemplar (Jadi)</label>
                        <div class="input-group">
                            <input type="number" name="jumlah" class="form-control shadow-none" placeholder="0" required min="1">
                            <span class="input-group-text bg-white border-start-0 text-muted">Eks</span>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-modern w-100 shadow-sm">
                        <i class="bi bi-plus-circle me-2"></i> Tambah ke Gudang
                    </button>
                </form>
            </div>
        </div>

        <div class="col-lg-8">
            <div class="card card-modern shadow-sm border-0 bg-white">
                <div class="card-header bg-white py-4 px-4 border-0">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 fw-800 text-dark">Riwayat Produksi Terakhir</h5>
                        <span class="badge bg-light text-dark rounded-pill px-3 fw-normal border">Total: {{ number_format($stats['total_produksi']) }} Eks</span>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th class="ps-4">Tanggal</th>
                                <th>Informasi Buku</th>
                                <th class="text-center">Jumlah</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($logs as $log)
                            <tr>
                                <td class="ps-4">
                                    <div class="d-flex flex-column">
                                        <span class="fw-bold text-dark">{{ \Carbon\Carbon::parse($log->tanggal_produksi)->format('d M Y') }}</span>
                                        <small class="text-muted" style="font-size: 10px;">{{ \Carbon\Carbon::parse($log->tanggal_produksi)->format('H:i') }} WIB</small>
                                    </div>
                                </td>
                                <td>
                                    <div class="fw-bold text-dark">{{ $log->book->judul ?? 'Buku Dihapus' }}</div>
                                    <div class="text-muted small" style="font-size: 11px;">Ref ID: #PRD-{{ $log->id }}</div>
                                </td>
                                <td class="text-center">
                                    <span class="badge-soft-success fw-bold">
                                        +{{ number_format($log->qty_produksi) }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <div class="spinner-grow spinner-grow-sm text-success me-2" role="status" style="width: 6px; height: 6px;"></div>
                                        <span class="small text-dark fw-600">Masuk Gudang</span>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center py-5 text-muted">
                                    <i class="bi bi-inbox fs-1 d-block mb-3 opacity-25"></i>
                                    Belum ada aktivitas produksi hari ini.
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
@endsection