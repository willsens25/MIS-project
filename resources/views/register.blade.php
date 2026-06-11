@extends('layouts.auth')

@section('title', 'Daftar Akun')

@section('content')
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<style>
    /* 1. BACKGROUND KONSISTEN: Modern Mesh Gradient */
    body {
        font-family: 'Plus Jakarta Sans', sans-serif;
        background-color: #090d16;
        background-image:
            radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.2) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(29, 78, 216, 0.15) 0px, transparent 50%),
            radial-gradient(at 50% 50%, rgba(15, 23, 42, 0.95) 0px, transparent 100%);
        background-attachment: fixed;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-x: hidden;
        padding: 40px 0;
    }

    /* Pendaran Cahaya Biru Lembut */
    .bg-glow-orb {
        position: absolute;
        width: 450px;
        height: 450px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 0;
        pointer-events: none;
    }

    /* 2. CARD GLASSMORPHISM: Lebar disesuaikan agar pas dengan layout grid */
    .glass-auth-card {
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        width: 100%;
        max-width: 520px;
        position: relative;
        z-index: 1;
    }

    /* 3. KONTRAST TEKS */
    .text-title-clean {
        color: #ffffff;
        font-weight: 800;
        letter-spacing: -0.5px;
    }

    .text-subtitle-clean {
        color: #94a3b8;
        font-size: 13.5px;
    }

    .label-high-contrast {
        color: #f1f5f9 !important;
        font-weight: 600;
        font-size: 12.5px;
        letter-spacing: 0.3px;
        display: inline-block;
    }

    /* 4. DESIGN ELEMEN INPUT & DROPDOWN */
    .form-group-modern {
        position: relative;
        margin-bottom: 20px;
    }

    .form-control-modern, .form-select-modern {
        background-color: rgba(8, 13, 24, 0.7) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #ffffff !important;
        border-radius: 12px !important;
        padding: 13px 16px 13px 44px !important;
        font-weight: 500;
        font-size: 14.5px;
        transition: all 0.25s ease;
    }

    /* Khusus Dropdown Select agar opsi di dalamnya tidak transparan/rusak warna kodenya */
    .form-select-modern {
        padding-left: 44px !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e") !important;
    }

    .form-select-modern option {
        background-color: #0f172a !important;
        color: #ffffff;
    }

    .form-control-modern:focus, .form-select-modern:focus {
        background-color: #090d16 !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
    }

    .form-control-modern::placeholder {
        color: #475569;
    }

    /* Ikon Pendukung Input */
    .input-leading-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
        font-size: 16px;
        z-index: 4;
        pointer-events: none;
    }

    .password-toggle-icon {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b;
        cursor: pointer;
        z-index: 4;
        font-size: 16px;
    }

    .password-toggle-icon:hover {
        color: #3b82f6;
    }

    /* Tombol Registrasi */
    .btn-modern-submit {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        border: none;
        color: #ffffff;
        border-radius: 12px;
        padding: 13px;
        font-weight: 700;
        font-size: 14px;
        letter-spacing: 0.5px;
        transition: all 0.2s ease;
    }

    .btn-modern-submit:hover {
        transform: translateY(-1px);
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
        background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    .link-modern-primary {
        color: #60a5fa;
        font-weight: 700;
        text-decoration: none;
    }
    .link-modern-primary:hover {
        color: #93c5fd;
        text-decoration: underline;
    }
</style>

<div class="bg-glow-orb"></div>

<div class="card glass-auth-card p-3 border-0">
    <div class="card-body">

        <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center rounded-4 mb-3"
                style="width: 52px; height: 52px; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.25);">
                <i class="bi bi-person-plus fs-4" style="color: #34d399;"></i>
            </div>
            <h4 class="text-title-clean mb-1">Buat Akun Baru</h4>
            <p class="text-subtitle-clean mb-0">Lengkapi kredensial untuk mendaftarkan akses sistem MIS</p>
        </div>

        <form action="/register" method="POST">
            @csrf

            <div class="form-group-modern">
                <label class="form-label label-high-contrast mb-2">Nama Lengkap</label>
                <div class="position-relative">
                    <i class="bi bi-person input-leading-icon"></i>
                    <input type="text" name="name"
                        class="form-control form-control-modern @error('name') is-invalid @enderror"
                        placeholder="Nama lengkap Anda" value="{{ old('name') }}" required autocomplete="off">
                </div>
                @error('name')
                    <div class="invalid-feedback small mt-1.5 fw-semibold" style="color: #f87171;">
                        <i class="bi bi-info-circle me-1"></i> {{ $message }}
                    </div>
                @enderror
            </div>

            <div class="form-group-modern">
                <label class="form-label label-high-contrast mb-2">Email Address</label>
                <div class="position-relative">
                    <i class="bi bi-envelope input-leading-icon"></i>
                    <input type="email" name="email"
                        class="form-control form-control-modern @error('email') is-invalid @enderror"
                        placeholder="nama@perusahaan.com" value="{{ old('email') }}" required>
                </div>
                @error('email')
                    <div class="invalid-feedback small mt-1.5 fw-semibold" style="color: #f87171;">
                        <i class="bi bi-info-circle me-1"></i> {{ $message }}
                    </div>
                @enderror
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="form-group-modern">
                        <label class="form-label label-high-contrast mb-2">Password</label>
                        <div class="position-relative">
                            <i class="bi bi-key input-leading-icon"></i>
                            <input type="password" name="password" id="passwordField"
                                class="form-control form-control-modern @error('password') is-invalid @enderror"
                                placeholder="••••••••" required>
                            <i class="bi bi-eye-slash password-toggle-icon" id="togglePassword"></i>
                        </div>
                        @error('password')
                            <div class="invalid-feedback small mt-1.5 fw-semibold" style="color: #f87171;">
                                <i class="bi bi-info-circle me-1"></i> {{ $message }}
                            </div>
                        @enderror
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="form-group-modern">
                        <label class="form-label label-high-contrast mb-2">Divisi Kerja</label>
                        <div class="position-relative">
                            <i class="bi bi-briefcase input-leading-icon"></i>
                            <select name="divisi_id" class="form-select form-select-modern @error('divisi_id') is-invalid @enderror" required>
                                <option value="" style="color: #475569;">-- Pilih Divisi --</option>
                                @foreach($divisi as $item)
                                    <option value="{{ $item->id }}" {{ old('divisi_id') == $item->id ? 'selected' : '' }}>
                                        {{ $item->nama_divisi }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        @error('divisi_id')
                            <div class="invalid-feedback small mt-1.5 fw-semibold" style="color: #f87171;">
                                <i class="bi bi-info-circle me-1"></i> {{ $message }}
                            </div>
                        @enderror
                    </div>
                </div>
            </div>

            <button type="submit" class="btn btn-modern-submit w-100 mt-2 text-uppercase">
                Daftar Sekarang <i class="bi bi-check2-circle ms-1"></i>
            </button>
        </form>

        <div class="text-center mt-4">
            <p class="small mb-0" style="color: #94a3b8;">
                Sudah punya akun?
                <a href="/login" class="link-modern-primary ms-1">
                    Masuk Sekarang
                </a>
            </p>
        </div>

    </div>
</div>

<script>
    const togglePassword = document.querySelector('#togglePassword');
    const passwordField = document.querySelector('#passwordField');

    togglePassword.addEventListener('click', function () {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);

        this.classList.toggle('bi-eye');
        this.classList.toggle('bi-eye-slash');
    });
</script>
@endsection
