@extends('layouts.app')

@section('content')
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">

<style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f0f2f5; }
    .card-custom { border: none; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
    .btn-custom { border-radius: 12px; font-weight: 700; padding: 12px 25px; transition: 0.3s; border: none; }
    .form-control, .form-select { border-radius: 12px; padding: 12px; border: 1px solid #eef0f2; background-color: #f8f9fa; }
</style>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card card-custom bg-white">
                <div class="card-header bg-transparent border-0 pt-4 px-4 text-center">
                    <h4 class="fw-800 text-dark m-0">Edit Anggota</h4>
                    <p class="text-muted small">Update informasi akun divisi</p>
                </div>
                
                <div class="card-body p-4 pt-2">
                    {{-- PERHATIKAN ACTION DI BAWAH: Wajib pakai /anggota/update/ --}}
                    <form action="{{ url('/anggota/update/' . $user->id) }}" method="POST">
                        @csrf
                        
                        <div class="mb-3 text-start">
                            <label class="form-label small fw-bold text-muted">Nama Lengkap</label>
                            <input type="text" name="name" class="form-control" value="{{ $user->name }}" required>
                        </div>

                        <div class="mb-3 text-start">
                            <label class="form-label small fw-bold text-muted">Email Perusahaan</label>
                            <input type="email" name="email" class="form-control" value="{{ $user->email }}" required>
                        </div>

                        <div class="mb-3 text-start">
                            <label class="form-label small fw-bold text-muted">Divisi</label>
                            <select name="divisi_id" class="form-select" required>
                                <option value="1" {{ $user->divisi_id == 1 ? 'selected' : '' }}>Direktorat</option>
                                <option value="2" {{ $user->divisi_id == 2 ? 'selected' : '' }}>Bendahara</option>
                                <option value="3" {{ $user->divisi_id == 3 ? 'selected' : '' }}>Penerbitan</option>
                                <option value="4" {{ $user->divisi_id == 4 ? 'selected' : '' }}>Marketing</option>
                                <option value="5" {{ $user->divisi_id == 5 ? 'selected' : '' }}>Produksi</option>
                                <option value="6" {{ $user->divisi_id == 6 ? 'selected' : '' }}>Logistik</option>
                            </select>
                        </div>

                        <div class="mb-4 text-start">
                            <label class="form-label small fw-bold text-muted">Password Baru (Kosongkan jika tidak diganti)</label>
                            <input type="password" name="password" class="form-control">
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary btn-custom shadow" style="background: #4361ee;">
                                Simpan Perubahan
                            </button>
                            <a href="{{ url('/anggota/tambah') }}" class="btn btn-light btn-custom text-muted">
                                Batal
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection