@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">

<div class="container-fluid p-4">
    {{-- Notifikasi --}}
    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm mb-4 alert-dismissible fade show">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if ($errors->any())
        <div class="alert alert-danger border-0 shadow-sm mb-4">
            <ul class="mb-0 small">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- HEADER HALAMAN --}}
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap">
        <div>
            <h1 class="h3 mb-0 text-gray-800 font-weight-bold">Manajemen Kode Promo</h1>
            <p class="text-muted small mb-0">Kelola kupon diskon untuk meningkatkan penjualan marketing</p>
        </div>
        <div>
            <a href="{{ route('marketing.index') }}" class="btn btn-outline-primary rounded-pill px-4 font-weight-bold shadow-sm">
                <i class="fas fa-arrow-left mr-2"></i> Kembali ke Transaksi
            </a>
        </div>
    </div>

    <div class="row">
        {{-- FORM TAMBAH PROMO --}}
        <div class="col-lg-4 mb-4">
            <div class="card shadow-sm border-0" style="border-radius: 0.75rem;">
                <div class="card-header bg-white py-3 border-bottom">
                    <h6 class="m-0 font-weight-bold text-primary"><i class="fas fa-plus-circle mr-2"></i>Buat Promo Baru</h6>
                </div>
                <div class="card-body">
                    <form action="{{ route('marketing.promo.store') }}" method="POST">
                        @csrf
                        <div class="mb-3">
                            <label class="small font-weight-bold text-dark">Kode Kupon</label>
                            <input type="text" name="code" class="form-control text-uppercase" placeholder="Contoh: MERDEKA2026" required style="border-radius: 20px;">
                        </div>

                        <div class="mb-3">
                            <label class="small font-weight-bold text-dark">Tipe Potongan</label>
                            <select name="type" class="form-select" required style="border-radius: 20px;">
                                <option value="percentage">Persentase (%)</option>
                                <option value="nominal">Nominal Rupiah (Rp)</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="small font-weight-bold text-dark">Nilai Potongan</label>
                            <input type="number" name="reward_value" class="form-control" placeholder="Misal: 10 atau 50000" required style="border-radius: 20px;">
                        </div>

                        <div class="mb-3">
                            <label class="small font-weight-bold text-dark">Kuota Pemakaian</label>
                            <input type="number" name="max_uses" class="form-control" value="100" required style="border-radius: 20px;">
                        </div>

                        <div class="mb-4">
                            <label class="small font-weight-bold text-dark">Tanggal Kedaluwarsa</label>
                            <input type="date" name="expiry_date" class="form-control" style="border-radius: 20px;">
                            <small class="text-muted block mt-1">Kosongkan jika kupon berlaku selamanya</small>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 shadow rounded-pill font-weight-bold">
                            RILIS KODE PROMO
                        </button>
                    </form>
                </div>
            </div>
        </div>

        {{-- DAFTAR PROMO AKTIF --}}
        <div class="col-lg-8">
            <div class="card shadow-sm border-0" style="border-radius: 0.75rem; overflow: hidden;">
                <div class="card-header bg-gradient-primary py-3">
                    <h6 class="m-0 font-weight-bold text-white"><i class="fas fa-ticket-alt mr-2"></i>Daftar Promo Saat Ini</h6>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead class="bg-light small">
                                <tr>
                                    <th class="px-4 text-dark border-0">Kode</th>
                                    <th class="text-dark border-0">Potongan</th>
                                    <th class="text-dark border-0">Kuota Terpakai</th>
                                    <th class="text-dark border-0">Status / Berlaku</th>
                                    <th class="text-center text-dark border-0" width="100">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($promos as $promo)
                                    <tr>
                                        <td class="px-4">
                                            <span class="badge bg-primary px-3 py-2 font-weight-bold" style="font-size: 0.85rem; border-radius: 10px;">
                                                {{ $promo->code }}
                                            </span>
                                        </td>
                                        <td>
                                            @if($promo->type == 'percentage')
                                                <span class="font-weight-bold text-dark">{{ intval($promo->reward_value) }}%</span>
                                            @else
                                                <span class="font-weight-bold text-dark">Rp{{ number_format($promo->reward_value, 0, ',', '.') }}</span>
                                            @endif
                                        </td>
                                        <td>
                                            <span class="font-weight-bold text-gray-800">{{ $promo->used_count }}</span>
                                            <span class="text-muted small">/ {{ $promo->max_uses }}</span>
                                        </td>
                                        <td>
                                            @if($promo->expiry_date && $promo->expiry_date < date('Y-m-d'))
                                                <span class="badge bg-danger">Expired</span>
                                            @elseif($promo->used_count >= $promo->max_uses)
                                                <span class="badge bg-warning text-dark">Kuota Habis</span>
                                            @else
                                                <span class="badge bg-success">Aktif</span>
                                            @endif
                                            <div class="small text-muted mt-1">
                                                <i class="far fa-clock mr-1"></i> {{ $promo->expiry_date ? date('d M Y', strtotime($promo->expiry_date)) : 'Selamanya' }}
                                            </div>
                                        </td>
                                        <td class="text-center">
                                            <form action="{{ route('marketing.promo.hapus', $promo->id) }}" method="POST">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-outline-danger shadow-none" style="border-radius: 50%; width: 32px; height: 32px; padding: 0;" onclick="return confirm('Hapus kode promo {{ $promo->code }}?')">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="text-center py-5 text-muted small">
                                            <i class="fas fa-tags fa-3x mb-3 d-block text-gray-300"></i>
                                            Belum ada kode promo yang dibuat.
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
</div>
@endsection
