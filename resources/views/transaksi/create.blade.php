@extends('layouts.app')

@section('content')
<div class="container py-5" style="font-family: 'Inter', sans-serif;">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                {{-- Header Card --}}
                <div class="bg-primary p-4 text-white">
                    <h5 class="fw-bold mb-0">
                        <i class="bi bi-plus-circle-fill me-2"></i>Input Transaksi Baru
                    </h5>
                    <p class="small mb-0 opacity-75">Pastikan nominal dan tanggal sudah sesuai.</p>
                </div>

                <div class="card-body p-4">
                    <form action="{{ route('transaksi.store') }}" method="POST">
                        @csrf
                        
                        {{-- Dropdown Nama --}}
                        <div class="mb-3">
                            <label class="small fw-bold text-muted text-uppercase mb-1">Pilih Identitas</label>
                            <select name="identitas_id" class="form-select rounded-3 @error('identitas_id') is-invalid @enderror">
                                <option value="">-- Pilih Nama --</option>
                                @foreach($semua_identitas as $item)
                                    <option value="{{ $item->id }}" {{ (old('identitas_id') ?? $selected_id) == $item->id ? 'selected' : '' }}>
                                        {{ strtoupper($item->nama_lengkap) }}
                                    </option>
                                @endforeach
                            </select>
                            @error('identitas_id')
                                <div class="invalid-feedback text-xs">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="row">
                            {{-- Jenis Transaksi --}}
                            <div class="col-md-6 mb-3">
                                <label class="small fw-bold text-muted text-uppercase mb-1">Jenis</label>
                                <select name="jenis" class="form-select rounded-3 @error('jenis') is-invalid @enderror">
                                    <option value="DONASI" {{ old('jenis') == 'DONASI' ? 'selected' : '' }}>DONASI (IN)</option>
                                    <option value="SALUR" {{ old('jenis') == 'SALUR' ? 'selected' : '' }}>SALUR (OUT)</option>
                                </select>
                                @error('jenis')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                            
                            {{-- Tanggal --}}
                            <div class="col-md-6 mb-3">
                                <label class="small fw-bold text-muted text-uppercase mb-1">Tanggal</label>
                                <input type="date" name="tanggal_transaksi" 
                                       class="form-control rounded-3 @error('tanggal_transaksi') is-invalid @enderror" 
                                       value="{{ old('tanggal_transaksi') ?? date('Y-m-d') }}">
                                @error('tanggal_transaksi')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        {{-- Nominal --}}
                        <div class="mb-3">
                            <label class="small fw-bold text-muted text-uppercase mb-1">Nominal (Rp)</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0 rounded-start-3 fw-bold text-muted">Rp</span>
                                <input type="number" name="nominal" id="nominal"
                                       class="form-control rounded-end-3 border-start-0 @error('nominal') is-invalid @enderror" 
                                       placeholder="Contoh: 100000" 
                                       value="{{ old('nominal') }}">
                                @error('nominal')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>
                        </div>

                        {{-- Keterangan --}}
                        <div class="mb-4">
                            <label class="small fw-bold text-muted text-uppercase mb-1">Keterangan</label>
                            <textarea name="keterangan" class="form-control rounded-3 @error('keterangan') is-invalid @enderror" 
                                      rows="3" placeholder="Contoh: Donasi bulanan atau bantuan sembako">{{ old('keterangan') }}</textarea>
                            @error('keterangan')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary rounded-pill fw-bold py-2 shadow-sm">
                                <i class="bi bi-save me-2"></i>SIMPAN TRANSAKSI
                            </button>
                            <a href="javascript:history.back()" class="btn btn-link text-muted text-decoration-none small">
                                <i class="bi bi-arrow-left me-1"></i> Kembali tanpa menyimpan
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // Hanya izinkan angka di input nominal
    document.getElementById('nominal').addEventListener('keypress', function (e) {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });

    // Auto-focus ke nominal jika nama sudah terpilih otomatis
    window.onload = function() {
        const selectBox = document.querySelector('select[name="identitas_id"]');
        if (selectBox.value !== "") {
            document.getElementById('nominal').focus();
        }
    };
</script>
@endsection