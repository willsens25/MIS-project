<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Finance | SAPA-ALL</title>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

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
            background-color: var(--bg-body);
            font-family: 'Inter', sans-serif;
            color: var(--text-main);
            transition: background-color 0.3s ease;
        }

        /* Navbar Styling */
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

        /* Profile Dropdown */
        .btn-profile {
            background: rgba(255,255,255,0.05);
            border: 1px solid #444;
            color: white;
            padding: 6px 14px;
            border-radius: 10px;
            font-size: 0.85rem;
        }
        .btn-profile:hover { background: rgba(255,255,255,0.1); border-color: #666; }

        /* Dashboard Elements */
        .hero-purple {
            background: var(--primary-gradient);
            border-radius: 20px;
            color: white;
            padding: 40px;
            position: relative;
            overflow: hidden;
        }
        .table-container {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 24px;
            box-shadow: var(--shadow);
            border: 1px solid var(--border-color);
        }

        .badge-income { color: #10B981; }
        .badge-expense { color: #EF4444; }
        .badge-category {
            background: rgba(79, 70, 229, 0.1);
            color: #4F46E5;
            font-size: 0.7rem;
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 600;
        }

        .filter-card {
            background: var(--bg-card);
            border-radius: 12px;
            padding: 6px 12px;
            border: 1px solid var(--border-color);
        }

        /* Utils */
        .theme-toggle {
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        .theme-toggle:hover { transform: rotate(20deg); }
    </style>
</head>
<body data-bs-theme="light">

@php
    $namaBulanIndo = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
        7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
    ];
@endphp

<nav class="navbar-custom mb-4 sticky-top">
    <div class="container d-flex justify-content-between align-items-center">
        <div class="brand-wrapper">
            <div class="brand-logo-container">
                <img src="{{ asset('img/Logo Lamrimnesia.png') }}" alt="Logo" style="height: 20px;">
            </div>
            <div class="brand-text-main">SAPA-ALL <span class="brand-text-mis">MIS</span></div>
        </div>

        <div class="d-flex align-items-center gap-3">
            <button class="theme-toggle btn p-0 border-0" id="themeSwitcher">
                <i class="fas fa-sun text-warning fs-5" id="themeIcon"></i>
            </button>
            <div class="dropdown">
                <button class="btn btn-profile dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="far fa-user-circle me-2"></i> {{ auth()->user()->name }}
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                    <li>
                        <form action="{{ route('logout') }}" method="POST">
                            @csrf
                            <button type="submit" class="dropdown-item text-danger small fw-bold">
                                <i class="fas fa-sign-out-alt me-2"></i> Logout
                            </button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</nav>

<div class="container pb-5">
    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm mb-4">{{ session('success') }}</div>
    @endif

    <div class="d-flex justify-content-between align-items-center mb-4">
        <form action="{{ route('finance.index') }}" method="GET" class="filter-card d-flex align-items-center gap-2 shadow-sm">
            <i class="fas fa-filter text-muted small"></i>
            <select name="bulan" class="form-select form-select-sm border-0 bg-transparent fw-bold" onchange="this.form.submit()">
                <option value="">Semua Bulan</option>
                @foreach(range(1, 12) as $m)
                    <option value="{{ $m }}" {{ ($bulan ?? '') == $m ? 'selected' : '' }}>{{ $namaBulanIndo[$m] }}</option>
                @endforeach
            </select>
            <div class="vr opacity-25" style="height: 15px;"></div>
            <select name="tahun" class="form-select form-select-sm border-0 bg-transparent fw-bold" onchange="this.form.submit()">
                @for($i = date('Y'); $i >= 2024; $i--)
                    <option value="{{ $i }}" {{ ($tahun ?? date('Y')) == $i ? 'selected' : '' }}>{{ $i }}</option>
                @endfor
            </select>
        </form>
    </div>

    <div class="hero-purple mb-4 shadow-sm">
        <div class="row align-items-center">
            <div class="col-lg-7">
                <span class="text-uppercase small fw-bold opacity-75">Saldo Saat Ini ({{ $bulan ? $namaBulanIndo[(int)$bulan] : 'Tahunan' }})</span>
                <h1 class="display-4 fw-bold mt-1 mb-4">Rp {{ number_format($total_saldo, 0, ',', '.') }}</h1>
                <div class="row g-3">
                    <div class="col-6 col-md-auto pe-md-4">
                        <div class="small opacity-75 text-uppercase">Pemasukan</div>
                        <div class="h4 fw-bold mb-0">Rp {{ number_format($totalMasuk, 0, ',', '.') }}</div>
                    </div>
                    <div class="col-6 col-md-auto border-start border-white border-opacity-25 ps-md-4">
                        <div class="small opacity-75 text-uppercase">Pengeluaran</div>
                        <div class="h4 fw-bold mb-0">Rp {{ number_format($totalKeluar, 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>
            <div class="col-lg-5 text-lg-end mt-4 mt-lg-0">
                <a href="{{ route('finance.download_pdf', ['tahun' => $tahun, 'bulan' => $bulan]) }}" class="btn btn-light rounded-pill px-4 fw-bold me-2" target="_blank">
                    <i class="fas fa-file-pdf me-2 text-danger"></i> PDF
                </a>
                <button class="btn btn-white bg-white text-primary rounded-pill px-4 fw-bold" data-bs-toggle="modal" data-bs-target="#modalTr">
                    <i class="fas fa-plus-circle me-2"></i> Transaksi
                </button>
            </div>
        </div>
    </div>

    <div class="table-container mb-4">
        <h6 class="fw-bold mb-4 text-muted text-uppercase small"><i class="fas fa-chart-area me-2 text-primary"></i>Visualisasi Arus Kas</h6>
        <div style="height: 300px;"><canvas id="cashflowChart"></canvas></div>
    </div>

    <div class="table-container">
        <h6 class="fw-bold mb-4 text-muted text-uppercase small"><i class="fas fa-list me-2 text-primary"></i>Riwayat Transaksi</h6>
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr class="text-muted small">
                        <th>TANGGAL & KATEGORI</th>
                        <th>KETERANGAN</th>
                        <th class="text-end">NOMINAL</th>
                        <th class="text-end">OPSI</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($mutasis as $m)
                    <tr class="align-middle">
                        <td>
                            <div class="fw-bold text-main">{{ date('d M Y', strtotime($m->tanggal)) }}</div>
                            <span class="badge-category">{{ $m->category->nama_kategori ?? 'Umum' }}</span>
                        </td>
                        <td>
                            <div class="fw-semibold">{{ $m->keterangan }}</div>
                            <small class="text-muted">Via: {{ $m->account->nama_akun ?? 'Kas' }}</small>
                        </td>
                        <td class="text-end fw-bold {{ $m->tipe == 'Masuk' ? 'badge-income' : 'badge-expense' }}">
                            {{ $m->tipe == 'Masuk' ? '+' : '-' }} {{ number_format($m->nominal, 0, ',', '.') }}
                        </td>
                        <td class="text-end">
                            <div class="dropdown">
                                <button class="btn btn-sm" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-h text-muted"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                    <li><button class="dropdown-item py-2 small" data-bs-toggle="modal" data-bs-target="#modalEdit{{ $m->id }}"><i class="fas fa-edit me-2 text-primary"></i> Edit</button></li>
                                    <li>
                                        <form action="{{ route('finance.destroy', $m->id) }}" method="POST" onsubmit="return confirm('Hapus transaksi ini?')">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="dropdown-item py-2 small text-danger"><i class="fas fa-trash-alt me-2"></i> Hapus</button>
                                        </form>
                                    </li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <div class="modal fade" id="modalEdit{{ $m->id }}" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content shadow-lg border-0">
                                <form action="{{ route('finance.update', $m->id) }}" method="POST">
                                    @csrf @method('PUT')
                                    <div class="modal-header border-0 pb-0">
                                        <h5 class="fw-bold">Edit Transaksi</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                    <div class="modal-body p-4">
                                        <div class="mb-3">
                                            <label class="small fw-bold text-muted mb-1">Kategori</label>
                                            <select name="category_id" class="form-select" required>
                                                @foreach($categories as $cat)
                                                    <option value="{{ $cat->id }}" {{ $m->category_id == $cat->id ? 'selected' : '' }}>{{ $cat->nama_kategori }}</option>
                                                @endforeach
                                            </select>
                                        </div>
                                        <div class="row g-3 mb-3">
                                            <div class="col-6">
                                                <label class="small fw-bold text-muted mb-1">Tipe</label>
                                                <select name="tipe" class="form-select" required>
                                                    <option value="Masuk" {{ $m->tipe == 'Masuk' ? 'selected' : '' }}>Masuk</option>
                                                    <option value="Keluar" {{ $m->tipe == 'Keluar' ? 'selected' : '' }}>Keluar</option>
                                                </select>
                                            </div>
                                            <div class="col-6">
                                                <label class="small fw-bold text-muted mb-1">Nominal</label>
                                                <input type="text" class="form-control input-nominal-display" placeholder="Rp 0" required>
                                                <input type="hidden" name="nominal" class="input-nominal-real" value="{{ $m->nominal }}">
                                            </div>
                                        </div>
                                        <div class="mb-0">
                                            <label class="small fw-bold text-muted mb-1">Keterangan</label>
                                            <textarea name="keterangan" class="form-control" rows="2" required>{{ $m->keterangan }}</textarea>
                                        </div>
                                    </div>
                                    <div class="modal-footer border-0 pt-0">
                                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                                        <button type="submit" class="btn btn-primary px-4 fw-bold">Simpan Perubahan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    @empty
                    <tr><td colspan="4" class="text-center py-5 text-muted">Tidak ada data transaksi ditemukan.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal fade" id="modalTr" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0">
            <form action="{{ route('finance.store_transaction') }}" method="POST">
                @csrf
                <div class="modal-header border-0 pb-0">
                    <h5 class="fw-bold">Transaksi Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <label class="small fw-bold text-muted">Akun Keuangan</label>
                            <a href="javascript:void(0)" class="text-primary small fw-bold text-decoration-none" data-bs-toggle="modal" data-bs-target="#modalTambahAkun">
                                <i class="fas fa-plus-circle"></i> Tambah Akun
                            </a>
                        </div>
                        <select name="account_id" class="form-select" required>
                            @foreach($accounts as $acc) <option value="{{ $acc->id }}">{{ $acc->nama_akun }}</option> @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Kategori</label>
                        <select name="category_id" class="form-select" required>
                            @foreach($categories as $cat) <option value="{{ $cat->id }}">{{ $cat->nama_kategori }}</option> @endforeach
                        </select>
                    </div>
                    <div class="row g-3 mb-3">
                        <div class="col-6">
                            <label class="small fw-bold text-muted mb-1">Tipe</label>
                            <select name="tipe" class="form-select">
                                <option value="Masuk">Pemasukan</option>
                                <option value="Keluar">Pengeluaran</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="small fw-bold text-muted mb-1">Nominal</label>
                            <input type="text" class="form-control input-nominal-display" placeholder="Rp 0" required>
                            <input type="hidden" name="nominal" class="input-nominal-real">
                        </div>
                    </div>
                    <div class="mb-0">
                        <label class="small fw-bold text-muted mb-1">Keterangan</label>
                        <textarea name="keterangan" class="form-control" placeholder="Tulis catatan transaksi..." rows="2" required></textarea>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold shadow-sm">Simpan Transaksi</button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="modalTambahAkun" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content shadow-lg border-0">
            <form action="{{ route('finance.simpanAkun') }}" method="POST">
                @csrf
                <div class="modal-header border-0 pb-0">
                    <h5 class="fw-bold">Akun Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Nama Akun/Bank</label>
                        <input type="text" name="nama_akun" class="form-control" placeholder="Contoh: Bank BCA, Kas Kecil" required>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="submit" class="btn btn-success w-100 py-2 fw-bold shadow-sm">Simpan Akun</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/cleave.js/1.6.0/cleave.min.js"></script>

<script>
    // --- THEME ENGINE ---
    const themeSwitcher = document.getElementById('themeSwitcher');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    function setTheme(theme) {
        body.setAttribute('data-bs-theme', theme);
        themeIcon.className = theme === 'dark' ? 'fas fa-moon text-info fs-5' : 'fas fa-sun text-warning fs-5';
        localStorage.setItem('theme', theme);
    }

    setTheme(localStorage.getItem('theme') || 'light');
    themeSwitcher.addEventListener('click', () => {
        setTheme(body.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light');
    });

    // --- INPUT MASKING (CLEAVE.JS) ---
    function initCleave() {
        document.querySelectorAll('.input-nominal-display').forEach(function(el) {
            if (el.dataset.cleaveInited) return;

            const container = el.closest('div');
            const realInput = container.querySelector('.input-nominal-real');

            const cleave = new Cleave(el, {
                numeral: true,
                numeralThousandsGroupStyle: 'thousand',
                numeralDecimalScale: 0,
                prefix: 'Rp ',
                rawValueTrimPrefix: true
            });

            if (realInput.value) {
                cleave.setRawValue(realInput.value);
            }

            el.addEventListener('input', () => {
                realInput.value = cleave.getRawValue();
            });

            el.dataset.cleaveInited = "true";
        });
    }

    document.addEventListener('DOMContentLoaded', initCleave);
    document.addEventListener('shown.bs.modal', initCleave);

    // --- CHART ENGINE ---
    const ctx = document.getElementById('cashflowChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: {!! json_encode($days ?? []) !!},
            datasets: [
                {
                    label: 'Masuk',
                    data: {!! json_encode($masukHarian ?? []) !!},
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Keluar',
                    data: {!! json_encode($keluarHarian ?? []) !!},
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxSize: 6 } }
            },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
</script>
</body>
</html>
