@extends('layouts.auth')

@section('title', 'Login')

@section('content')
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<style>
    /* 1. BACKGROUND ESTETIK: Modern Mesh Gradient */
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
    }

    /* Dekorasi Lingkaran Glow di Belakang Card (Bikin Efek Estetik Tambahan) */
    .bg-glow-orb {
        position: absolute;
        width: 350px;
        height: 350px;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 0;
        pointer-events: none;
    }

    /* 2. GLASSMORPHISM CARD: Dibuat sedikit lebih gelap agar kontras teks naik */
    .glass-auth-card {
        background: rgba(15, 23, 42, 0.65); /* Dipergelap sedikit agar teks di atasnya pop-out */
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.12); /* Border lebih tegas */
        border-radius: 24px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        width: 100%;
        max-width: 410px;
        position: relative;
        z-index: 1;
    }

    /* 3. TYPOGRAPHY & TEXT READABILITY (DIJAMIN TERBACA JELAS) */
    .text-title-clean {
        color: #ffffff;
        font-weight: 800;
        letter-spacing: -0.5px;
    }

    .text-subtitle-clean {
        color: #94a3b8; /* Abu-abu terang, pas untuk sub-judul */
        font-size: 13.5px;
    }

    /* Label Input: Diubah ke Putih Terang Tinggi Kontras */
    .label-high-contrast {
        color: #f1f5f9 !important; /* Off-white terang, sangat mudah dibaca */
        font-weight: 600;
        font-size: 12.5px;
        letter-spacing: 0.3px;
        display: inline-block;
    }

    /* 4. FORM INPUT CONTROL MODERN */
    .form-group-modern {
        position: relative;
        margin-bottom: 22px;
    }

    .form-control-modern {
        background-color: rgba(8, 13, 24, 0.7) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        color: #ffffff !important; /* Teks ketikan user berwarna putih bersih */
        border-radius: 12px !important;
        padding: 13px 16px 13px 44px !important;
        font-weight: 500;
        font-size: 14.5px;
        transition: all 0.25s ease;
    }

    .form-control-modern:focus {
        background-color: #090d16 !important;
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
    }

    .form-control-modern::placeholder {
        color: #475569; /* Warna placeholder redup agar tidak membingungkan */
    }

    /* Ikon Pembantu Input */
    .input-leading-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #64748b; /* Mengikuti warna fokus */
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

    /* Tombol Submit Modern */
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

    /* Custom Link */
    .link-modern-primary {
        color: #60a5fa;
        font-weight: 700;
        text-decoration: none;
    }
    .link-modern-primary:hover {
        color: #93c5fd;
        text-decoration: underline;
    }

    /* Custom Alerts */
    .alert-custom-error {
        border-radius: 12px;
        background-color: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #fca5a5;
        font-size: 13px;
    }

    .alert-custom-success {
        border-radius: 12px;
        background-color: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #a7f3d0;
        font-size: 13px;
    }
</style>

<div class="bg-glow-orb"></div>

<div class="card glass-auth-card p-3 border-0">
    <div class="card-body">

        <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center rounded-4 mb-3"
                 style="width: 52px; height: 52px; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.25);">
                <i class="bi bi-shield-lock fs-4 text-blue" style="color: #60a5fa;"></i>
            </div>
            <h4 class="text-title-clean mb-1">Selamat Datang</h4>
            <p class="text-subtitle-clean mb-0">Silakan masuk ke Management Information System</p>
        </div>

        {{-- Menampilkan Pesan Sukses (Registrasi) --}}
        @if(session('success'))
            <div class="alert alert-custom-success alert-dismissible fade show mb-3" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i> {{ session('success') }}
                <button type="button" class="btn-close btn-close-white small" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        {{-- Menampilkan Pesan Error --}}
        @if(session('error'))
            <div class="alert alert-custom-error d-flex align-items-center mb-3" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2 fs-6"></i>
                <div>{{ session('error') }}</div>
            </div>
        @endif

        <form action="/login" method="POST">
            @csrf

            <div class="form-group-modern">
                <label class="form-label label-high-contrast mb-2">Email Address</label>
                <div class="position-relative">
                    <i class="bi bi-envelope input-leading-icon"></i>
                    <input type="email" name="email"
                           class="form-control form-control-modern @error('email') is-invalid @enderror"
                           placeholder="nama@perusahaan.com"
                           value="{{ old('email') }}" required autofocus>
                </div>
                @error('email')
                    <div class="invalid-feedback small mt-1.5 fw-semibold" style="color: #f87171;">
                        <i class="bi bi-info-circle me-1"></i> {{ $message }}
                    </div>
                @enderror
            </div>

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

            <button type="submit" class="btn btn-modern-submit w-100 mt-2 text-uppercase">
                Masuk Sistem <i class="bi bi-arrow-right short ms-1"></i>
            </button>
        </form>

        <div class="text-center mt-4">
            <p class="small mb-0" style="color: #94a3b8;">
                Belum punya akun?
                <a href="/register" class="link-modern-primary ms-1">
                    Daftar Sekarang
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
