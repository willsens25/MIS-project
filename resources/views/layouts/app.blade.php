<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'MIS SAPA-ALL')</title>

    {{-- Favicon --}}
    <link rel="icon" type="image/png" href="{{ asset('img/Logo Lamrimnesia.png') }}">

    {{-- Styles --}}
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <style>
        :root {
            --bg-body: #F0F2F5;
            --bg-card: #ffffff;
            --text-main: #1a1d20;
            --text-muted: #6c757d;
            --border-color: #dee2e6;
            --shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            --primary-gradient: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
        }

        [data-bs-theme="dark"] {
            --bg-body: #121212;
            --bg-card: #1e1e1e;
            --text-main: #e0e0e0;
            --text-muted: #a0a0a0;
            --border-color: #333333;
            --shadow: 0 4px 12px rgba(0,0,0,0.5);
        }

        body {
            background-color: var(--bg-body) !important;
            color: var(--text-main) !important;
            font-family: 'Inter', sans-serif;
            transition: background-color 0.3s ease, color 0.3s ease;
            min-height: 100vh;
        }

        .card, .table-container {
            background-color: var(--bg-card) !important;
            color: var(--text-main) !important;
            border-color: var(--border-color) !important;
            border-radius: 12px;
            box-shadow: var(--shadow);
        }

        /* Dark Mode Form Fix */
        [data-bs-theme="dark"] .form-control,
        [data-bs-theme="dark"] .form-select {
            background-color: #2b2b2b !important;
            border-color: #444 !important;
            color: #fff !important;
        }

        .navbar-custom {
            background-color: #1a1d21;
            border-bottom: 1px solid #2d3238;
            padding: 12px 0;
        }

        .brand-wrapper { display: flex; align-items: center; gap: 12px; }
        .brand-logo-container {
            background-color: #008b8b;
            padding: 6px 10px;
            border-radius: 8px;
            display: flex;
            align-items: center;
        }
        .brand-text-main { color: #ffffff; font-weight: 700; font-size: 1.1rem; letter-spacing: 0.5px; }
        .brand-text-mis { color: #00d4ff; }

        .btn-profile {
            background: rgba(255,255,255,0.05);
            border: 1px solid #444;
            color: white;
            padding: 6px 14px;
            border-radius: 10px;
            font-size: 0.85rem;
        }
        .btn-profile:hover { background: rgba(255,255,255,0.1); border-color: #666; }

        .theme-toggle {
            cursor: pointer;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: transform 0.3s ease;
        }
        .theme-toggle:hover { transform: rotate(20deg); background: rgba(255, 255, 255, 0.15); }
    </style>
    @stack('styles')
</head>
<body>

    <nav class="navbar-custom mb-4 sticky-top">
        <div class="container d-flex justify-content-between align-items-center">
            <div class="brand-wrapper">
                <a href="{{ url('/dashboard') }}" class="text-decoration-none d-flex align-items-center gap-2">
                    <div class="brand-logo-container">
                        <img src="{{ asset('img/Logo Lamrimnesia.png') }}" alt="Logo" style="height: 20px;">
                    </div>
                    <div class="brand-text-main">SAPA-ALL <span class="brand-text-mis">MIS</span></div>
                </a>
            </div>

            <div class="d-flex align-items-center gap-3">
                {{-- Theme Toggle --}}
                <div class="theme-toggle text-light" id="themeToggler" title="Toggle Theme">
                    <i class="fas fa-sun text-warning fs-5" id="themeIcon"></i>
                </div>

                @auth
                <div class="dropdown">
                    <button class="btn btn-profile dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="far fa-user-circle me-2"></i> {{ auth()->user()->name }}
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                        <li>
                            <a class="dropdown-item py-2 small fw-bold" href="{{ route('finance.persetujuan') }}">
                                <i class="fas fa-check-circle me-2 text-primary"></i> Persetujuan Cetak
                            </a>
                        </li>

                        {{-- Menu Khusus Direktorat / Admin (Divisi 1) --}}
                        @if(auth()->user()->divisi_id == 1)
                        <li>
                            <a class="dropdown-item py-2 small fw-bold {{ Request::is('activity-logs*') ? 'bg-light text-primary' : '' }}" href="{{ url('/activity-logs') }}">
                                <i class="fas fa-shield-alt me-2 text-warning"></i> Audit System Log
                            </a>
                        </li>
                        @endif

                        <li><hr class="dropdown-divider"></li>
                        <li>
                            <form action="{{ route('logout') }}" method="POST" class="m-0">
                                @csrf
                                <button type="submit" class="dropdown-item text-danger small fw-bold">
                                    <i class="fas fa-sign-out-alt me-2"></i> Logout
                                </button>
                            </form>
                        </li>
                    </ul>
                </div>
                @endauth
            </div>
        </div>
    </nav>

    <main>
        @yield('content')
    </main>

    {{-- Scripts --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.6.0/cleave.min.js"></script>

    <script>
        const html = document.documentElement;
        const themeToggler = document.getElementById('themeToggler');
        const themeIcon = document.getElementById('themeIcon');

        const applyTheme = (theme) => {
            html.setAttribute('data-bs-theme', theme);
            if (theme === 'dark') {
                themeIcon.className = 'fas fa-moon text-info fs-5';
            } else {
                themeIcon.className = 'fas fa-sun text-warning fs-5';
            }
        };

        const savedTheme = localStorage.getItem('mis_theme') || 'light';
        applyTheme(savedTheme);

        themeToggler.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('mis_theme', newTheme);
            applyTheme(newTheme);
        });
    </script>
    @stack('scripts')
</body>
</html>
