@extends('layouts.app')

@section('title', 'Input Penjualan Baru | SAPA-ALL')

@section('content')
<div class="container pb-5">
    <div class="row justify-content-center">
        <div class="col-lg-8">

            <div class="d-flex align-items-center mb-4">
                <a href="{{ route('finance.index') }}" class="btn btn-sm btn-outline-secondary rounded-circle me-3">
                    <i class="fas fa-arrow-left"></i>
                </a>
                <h4 class="mb-0 fw-bold">Input Penjualan & Sinkronisasi Mutasi</h4>
            </div>

            @if(session('error'))
                <div class="alert alert-danger border-0 shadow-sm mb-4">
                    {{ session('error') }}
                </div>
            @endif

            <div class="card p-4 border-0 shadow-sm">
                <form action="{{ route('penjualan.store') }}" method="POST">
                    @csrf

                    <h5 class="fw-bold mb-4 text-primary"><i class="fas fa-user-tag me-2"></i>Data Operasional & Pelanggan</h5>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="small fw-bold text-muted mb-1">Nama Pelanggan / Orang</label>
                            <input type="text" name="nama_pelanggan" class="form-control" placeholder="Contoh: Willsens Kiren" value="{{ old('nama_pelanggan') }}" required>
                        </div>
                        <div class="col-md-6">
                            <label class="small fw-bold text-muted mb-1">Tanggal Transaksi</label>
                            <input type="date" name="tanggal_penjualan" class="form-control" value="{{ old('tanggal_penjualan', date('Y-m-d')) }}" required>
                        </div>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <label class="small fw-bold text-muted mb-1">Jumlah Kuantitas Barang (Item)</label>
                            <input type="number" name="total_item" class="form-control" placeholder="0" value="{{ old('total_item') }}" min="1" required>
                        </div>
                        <div class="col-md-6">
                            <label class="small fw-bold text-muted mb-1">Total Pembayaran</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light fw-bold text-muted">Rp</span>
                                <input type="number" name="total_bayar" class="form-control" placeholder="0" value="{{ old('total_bayar') }}" min="0" required>
                            </div>
                        </div>
                    </div>

                    <hr class="opacity-25 mb-4">

                    <h5 class="fw-bold mb-4 text-purple"><i class="fas fa-wallet me-2"></i>Tujuan Alokasi Kas Finansial (Akuntansi)</h5>

                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <label class="small fw-bold text-muted mb-1">Masuk ke Akun/Bank</label>
                            <select name="account_id" class="form-select" required>
                                <option value="" disabled selected>-- Pilih Akun Finansial --</option>
                                @foreach($accounts as $acc)
                                    <option value="{{ $acc->id }}" {{ old('account_id') == $acc->id ? 'selected' : '' }}>{{ $acc->nama_akun }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="small fw-bold text-muted mb-1">Kategori Akuntansi</label>
                            <select name="category_id" class="form-select" required>
                                <option value="" disabled selected>-- Pilih Kategori Penjualan --</option>
                                @foreach($categories as $cat)
                                    <option value="{{ $cat->id }}" {{ old('category_id') == $cat->id ? 'selected' : '' }}>{{ $cat->nama_kategori }}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm">
                        <i class="fas fa-check-double me-2"></i> Simpan & Integrasikan ke Laporan
                    </button>
                </form>
            </div>

        </div>
    </div>
</div>
@endsection
