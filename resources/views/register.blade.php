@extends('layouts.auth')

@section('title', 'Daftar Akun')

@section('content')
<div class="card auth-card p-4 shadow-sm border-0 rounded-4">
    <div class="card-body">
        <h4 class="fw-bold mb-3 text-center">Buat Akun Baru</h4>
        <p class="text-muted text-center small mb-4">Lengkapi data untuk bergabung</p>

        <form action="/register" method="POST">
            @csrf
            <div class="mb-3">
                <label class="form-label small fw-bold">Nama Lengkap</label>
                <input type="text" name="name"
                    class="form-control @error('name') is-invalid @enderror" 
                    placeholder="Nama Anda" value="{{ old('name') }}" required>
                @error('name')
                    <div class="invalid-feedback small">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-3">
                <label class="form-label small fw-bold">Email Address</label>
                <input type="email" name="email"
                    class="form-control @error('email') is-invalid @enderror"
                    placeholder="email@contoh.com" value="{{ old('email') }}" required>
                @error('email')
                    <div class="invalid-feedback small">{{ $message }}</div>
                @enderror
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Password</label>
                    <input type="password" name="password"
                        class="form-control @error('password') is-invalid @enderror"
                        placeholder="••••••••" required>
                    @error('password')
                        <div class="invalid-feedback small" style="font-size: 11px;">{{ $message }}</div>
                    @enderror
                </div>
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Divisi</label>
                    <select name="divisi_id" class="form-select shadow-none @error('divisi_id') is-invalid @enderror" required>
                        <option value="">-- Pilih --</option>
                        @foreach($divisi as $item)
                            <option value="{{ $item->id }}" {{ old('divisi_id') == $item->id ? 'selected' : '' }}>
                                {{ $item->nama_divisi }}
                            </option>
                        @endforeach
                    </select>
                    @error('divisi_id')
                        <div class="invalid-feedback small">{{ $message }}</div>
                    @enderror
                </div>
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 mt-2 fw-bold shadow-sm">DAFTAR SEKARANG</button>
        </form>

        <div class="text-center mt-4">
            <p class="small text-muted">Sudah punya akun? <a href="/login" class="text-info text-decoration-none fw-bold">Login</a></p>
        </div>
    </div>
</div>
@endsection