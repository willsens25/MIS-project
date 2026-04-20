@extends('layouts.app')

@section('content')
<div class="container-fluid py-4">
    <div class="row mb-4">
        <div class="col-12">
            <div class="card border-0 shadow-sm bg-primary text-white">
                <div class="card-body d-flex justify-content-between align-items-center p-4">
                    <div>
                        <h6 class="text-uppercase mb-1" style="letter-spacing: 1px;">Total Saldo Global</h6>
                        <h2 class="display-6 fw-bold mb-0">Rp {{ number_format($saldo_mutasi, 0, ',', '.') }}</h2>
                    </div>
                    <div class="text-end">
                        <i class="bi bi-wallet2" style="font-size: 3rem; opacity: 0.5;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-0 fw-bold text-dark"><i class="bi bi-arrow-left-right me-2 text-primary"></i>Database Mutasi Keuangan</h5>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm"><i class="bi bi-funnel me-1"></i> Filter</button>
                <button class="btn btn-success btn-sm"><i class="bi bi-file-earmark-excel me-1"></i> Export</button>
            </div>
        </div>

        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4" style="width: 120px;">Tanggal</th>
                            <th style="width: 180px;">Kode / Ref</th>
                            <th>Keterangan & Divisi</th>
                            <th>Akun Kas</th>
                            <th class="text-end" style="width: 180px;">Masuk (Debet)</th>
                            <th class="text-end" style="width: 180px;">Keluar (Kredit)</th>
                            <th class="text-center" style="width: 80px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($mutasis as $m)
                        <tr>
                            <td class="ps-4">
                                <span class="d-block fw-bold text-dark">{{ \Carbon\Carbon::parse($m->tanggal)->format('d M Y') }}</span>
                                <small class="text-muted">{{ \Carbon\Carbon::parse($m->tanggal)->format('H:i') }}</small>
                            </td>
                            <td>
                                <code class="text-primary fw-bold">{{ $m->kode_transaksi ?? 'TRX-INTERNAL' }}</code>
                            </td>
                            <td>
                                <span class="badge bg-soft-info text-info mb-1">{{ $m->jenis }}</span>
                                <div class="text-dark small">{{ $m->keterangan }}</div>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <div class="avatar-xs bg-light rounded-circle me-2 d-flex align-items-center justify-content-center" style="width: 30px; height: 30px;">
                                        <i class="bi bi-bank text-secondary"></i>
                                    </div>
                                    <span class="small fw-medium">{{ $m->account->nama_akun ?? 'Kas Umum' }}</span>
                                </div>
                            </td>
                            <td class="text-end">
                                @if($m->tipe == 'Masuk')
                                    <span class="text-success fw-bold">+ Rp {{ number_format($m->nominal, 0, ',', '.') }}</span>
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td class="text-end">
                                @if($m->tipe == 'Keluar')
                                    <span class="text-danger fw-bold">- Rp {{ number_format($m->nominal, 0, ',', '.') }}</span>
                                @else
                                    <span class="text-muted">-</span>
                                @endif
                            </td>
                            <td class="text-center">
                                <button class="btn btn-light btn-sm rounded-circle" title="Detail">
                                    <i class="bi bi-info-circle"></i>
                                </button>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="text-center py-5">
                                <img src="https://illustrations.popsy.co/amber/no-data.svg" style="width: 150px;" class="mb-3">
                                <p class="text-muted">Belum ada data mutasi yang tercatat.</p>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <div class="card-footer bg-white border-top py-3">
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">Menampilkan {{ $mutasis->firstItem() }} sampai {{ $mutasis->lastItem() }} dari {{ $mutasis->total() }} data</small>
                <div>
                    {{ $mutasis->links('pagination::bootstrap-5') }}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .bg-soft-info { background-color: #e0f7fa; }
    .text-info { color: #00acc1 !important; }
    .table thead th {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 700;
        color: #6c757d;
    }
    .avatar-xs { font-size: 0.8rem; }
</style>
@endsection
