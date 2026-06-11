<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title') - SAPA-ALL MIS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
    <style>
        /* Bersihkan styling body di sini agar menggunakan logic mesh gradient dari login/register */
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }

        /* Styling khusus logo gambar agar proporsional dan estetik */
        .auth-brand-logo {
            height: 75px; /* Tinggi disesuaikan agar proporsional di atas teks */
            width: auto;
            object-fit: contain;
            filter: drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3)); /* Efek glow tipis biru */
            transition: transform 0.3s ease;
        }

        .auth-brand-logo:hover {
            transform: scale(1.05); /* Efek membesar tipis saat di-hover */
        }

        /* Teks Sub-Logo Baru: Menjamin Kontras Tinggi & Enak Dibaca */
        .brand-sub-title {
            color: #94a3b8 !important; /* Warna abu-abu terang / Slate 400 */
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 1px;
            text-transform: uppercase; /* Dibuat uppercase sedikit agar terlihat profesional */
            margin-top: 5px;
            opacity: 0.9;
        }

        /* Utility pemanis logo utama */
        .brand-main-title {
            letter-spacing: -0.5px;
        }
    </style>
</head>
<body>
    <div class="container d-flex flex-column justify-content-center align-items-center min-vh-100">
        <div class="row justify-content-center w-100">
            <div class="col-md-5 d-flex flex-column align-items-center">

                <div class="text-center mb-4 position-relative" style="z-index: 10;">

                    <div class="mb-3 d-flex justify-content-center">
                        <img src="{{ asset('img/Logo Lamrimnesia.png') }}" alt="Logo Lamrimnesia" class="auth-brand-logo">
                    </div>

                    <h2 class="text-white fw-bold brand-main-title mb-0">
                        SAPA-ALL <span style="color: #3b82f6;">MIS</span>
                    </h2>
                    <p class="brand-sub-title mb-0">Management Information System</p>
                </div>

                <div class="w-100 d-flex justify-content-center">
                    @yield('content')
                </div>

            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
