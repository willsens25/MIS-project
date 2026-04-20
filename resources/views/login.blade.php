@extends('layouts.auth')

@section('title', 'Login')

@section('content')
<div class="card auth-card p-4 shadow-sm border-0 rounded-4">
    <div class="card-body">
        <h4 class="fw-bold mb-3 text-center">Selamat Datang</h4>
        <p class="text-muted text-center small mb-4">Silakan masuk dengan akun Anda</p>

        {{-- Menampilkan Pesan Sukses (Registrasi) --}}
        @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show small border-0 shadow-sm" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        {{-- Menampilkan Pesan Error Umum (Jika ada) --}}
        @if(session('error'))
            <div class="alert alert-danger small border-0 shadow-sm" role="alert">
                {{ session('error') }}
            </div>
        @endif

        <form action="/login" method="POST">
            @csrf
            <div class="mb-3">
                <label class="form-label small fw-bold">Email Address</label>
                <input type="email" name="email" 
                       class="form-control @error('email') is-invalid @enderror" 
                       placeholder="name@company.com" 
                       value="{{ old('email') }}" required autofocus>
                @error('email')
                    <div class="invalid-feedback small">
                        {{ $message }}
                    </div>
                @enderror
            </div>

            <div class="mb-3">
                <label class="form-label small fw-bold">Password</label>
                <input type="password" name="password" 
                       class="form-control @error('password') is-invalid @enderror" 
                       placeholder="••••••••" required>
                @error('password')
                    <div class="invalid-feedback small">
                        {{ $message }}
                    </div>
                @enderror
            </div>

            <button type="submit" class="btn btn-primary w-100 py-2 mt-2 fw-bold shadow-sm">MASUK</button>
        </form>
        
        <div class="text-center mt-4">
            <p class="small text-muted">Belum punya akun? <a href="/register" class="text-info text-decoration-none fw-bold">Daftar Sekarang</a></p>
        </div>
    </div>
</div>
@endsection