<!DOCTYPE html>
<html lang="en" data-bs-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'MIS SAPA-ALL')</title>

    {{-- Favicon --}}
    <link rel="icon" type="image/png" href="{{ asset('img/Logo Lamrimnesia.png') }}">

    {{-- Styles --}}
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">

    <style>
        :root {
            --bg-body: #f8f9fa;
            --bg-card: #ffffff;
            --text-main: #212529;
            --border-color: #dee2e6;
        }

        [data-bs-theme="dark"] {
            --bg-body: #121212;
            --bg-card: #1e1e1e;
            --text-main: #e9ecef;
            --border-color: #333333;
        }

        body {
            background-color: var(--bg-body) !important;
            color: var(--text-main) !important;
            transition: background-color 0.3s ease, color 0.3s ease;
            min-height: 100vh;
        }

        .card {
            background-color: var(--bg-card) !important;
            color: var(--text-main) !important;
            border-color: var(--border-color) !important;
            border-radius: 12px;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
        }

        /* Dark Mode Form Fix */
        [data-bs-theme="dark"] .form-control,
        [data-bs-theme="dark"] .form-select {
            background-color: #2b2b2b !important;
            border-color: #444 !important;
            color: #fff !important;
        }

        .theme-toggle {
            cursor: pointer;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: 0.2s;
        }

        .theme-toggle:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .navbar-brand span { letter-spacing: 0.5px; }
    </style>
    @stack('styles')
</head>
<body>

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-2">
        <div class="container">
            {{-- Logo --}}
            <a class="navbar-brand d-flex align-items-center fw-bold" href="{{ url('/dashboard') }}">
                <img src="{{ asset('img/Logo Lamrimnesia.png') }}" alt="Logo" style="height: 32px; margin-right: 10px;">
                <span>SAPA-ALL <span class="text-info">MIS</span></span>
            </a>

            <button class="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                {{-- Spacer --}}
                <ul class="navbar-nav me-auto"></ul>

                {{-- Right Side --}}
                <div class="d-flex align-items-center gap-2">
                    {{-- Theme Toggle --}}
                    <div class="theme-toggle text-light" id="themeToggler" title="Toggle Theme">
                        <i class="bi bi-moon-stars-fill" id="themeIcon"></i>
                    </div>

                    @auth
                    <div class="dropdown">
                        <button class="btn btn-dark btn-sm dropdown-toggle border-secondary px-3" type="button" data-bs-toggle="dropdown">
                            <i class="bi bi-person-circle me-1"></i> {{ auth()->user()->name }}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <form action="/logout" method="GET" class="m-0">
                                    <button type="submit" class="dropdown-item text-danger">
                                        <i class="bi bi-box-arrow-right me-2"></i>Logout
                                    </button>
                                </form>
                            </li>
                        </ul>
                    </div>
                    @endauth
                </div>
            </div>
        </div>
    </nav>

    <main class="py-4">
        @yield('content')
    </main>

    {{-- Scripts --}}
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const html = document.documentElement;
        const themeToggler = document.getElementById('themeToggler');
        const themeIcon = document.getElementById('themeIcon');

        const applyTheme = (theme) => {
            html.setAttribute('data-bs-theme', theme);
            if (theme === 'dark') {
                themeIcon.classList.replace('bi-moon-stars-fill', 'bi-sun-fill');
                themeIcon.style.color = '#ffc107';
            } else {
                themeIcon.classList.replace('bi-sun-fill', 'bi-moon-stars-fill');
                themeIcon.style.color = '#ffffff';
            }
        };

        // Load saved theme
        const savedTheme = localStorage.getItem('mis_theme') || 'light';
        applyTheme(savedTheme);

        // Toggle Click
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
