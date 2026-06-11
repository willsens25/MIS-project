@extends('layouts.app')

@section('title', 'Finance | SAPA-ALL')

@section('content')
@php
$namaBulanIndo = [
    1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni',
    7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
];
$countPengajuan = isset($pengajuans) ? $pengajuans->count() : 0;
@endphp

<div class="container pb-5">

    <div class="alert shadow-sm border-0 d-flex justify-content-between align-items-center mb-4" style="background: var(--bg-card); border-left: 5px solid {{ $countPengajuan > 0 ? '#EF4444' : '#4F46E5' }} !important;">
        <div class="d-flex align-items-center">
            <div class="rounded-circle {{ $countPengajuan > 0 ? 'bg-danger' : 'bg-primary' }} bg-opacity-10 p-3 me-3">
                <i class="fas fa-print {{ $countPengajuan > 0 ? 'text-danger' : 'text-primary' }}"></i>
            </div>
            <div>
                <h6 class="mb-0 fw-bold">Persetujuan Produksi Buku</h6>
                @if($countPengajuan > 0)
                    <small class="fw-bold text-danger">Ada {{ $countPengajuan }} permintaan baru yang perlu divalidasi!</small>
                @else
                    <small class="text-muted small">Semua pengajuan sudah diproses (Antrean Bersih).</small>
                @endif
            </div>
        </div>
        <a href="{{ route('finance.persetujuan') }}" class="btn {{ $countPengajuan > 0 ? 'btn-danger' : 'btn-outline-primary' }} btn-sm rounded-pill px-4 fw-bold shadow-sm">
            {{ $countPengajuan > 0 ? 'Buka Antrean' : 'Riwayat & Antrean' }} <i class="fas fa-arrow-right ms-2"></i>
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm mb-4">
            {{ session('success') }}
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger border-0 shadow-sm mb-4">
            {{ session('error') }}
        </div>
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
            <div class="col-lg-6">
                <span class="text-uppercase small fw-bold opacity-75">Saldo Saat Ini ({{ $bulan ? $namaBulanIndo[(int)$bulan] : 'Tahunan' }})</span>
                <h1 class="display-4 fw-bold mt-1 mb-4 text-white">Rp {{ number_format($total_saldo, 0, ',', '.') }}</h1>
                <div class="row g-3">
                    <div class="col-6 col-md-auto pe-md-4">
                        <div class="small opacity-75 text-uppercase">Pemasukan</div>
                        <div class="h4 fw-bold mb-0 text-white">Rp {{ number_format($totalMasuk, 0, ',', '.') }}</div>
                    </div>
                    <div class="col-6 col-md-auto border-start border-white border-opacity-25 ps-md-4">
                        <div class="small opacity-75 text-uppercase">Pengeluaran</div>
                        <div class="h4 fw-bold mb-0 text-white">Rp {{ number_format($totalKeluar, 0, ',', '.') }}</div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 text-lg-end mt-4 mt-lg-0 d-flex flex-wrap justify-content-lg-end gap-2">
                <a href="{{ route('finance.download_report', ['tahun' => $tahun ?? date('Y'), 'bulan' => $bulan]) }}" class="btn btn-light rounded-pill px-4 fw-bold shadow-sm" target="_blank">
                    <i class="fas fa-file-pdf me-2 text-danger"></i> PDF Laporan
                </a>

                <a href="{{ route('penjualan.create') }}" class="btn btn-warning text-dark rounded-pill px-4 fw-bold shadow-sm">
                    <i class="fas fa-cash-register me-2"></i> Catat Penjualan
                </a>

                <button class="btn btn-white bg-white text-primary rounded-pill px-4 fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#modalTr">
                    <i class="fas fa-plus-circle me-2"></i> Transaksi
                </button>
            </div>
        </div>
    </div>

    {{-- TAMBAHAN BARU: DAFTAR KELOLA AKUN KEUANGAN (Daftar Kas/Bank) --}}
    <div class="table-container mb-4 p-4 shadow-sm" style="background: var(--bg-card); border-radius: 16px;">
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold text-muted text-uppercase small mb-0"><i class="fas fa-wallet me-2 text-info"></i>Daftar Akun Keuangan</h6>
            <button class="btn btn-sm btn-outline-success fw-bold rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#modalTambahAkunOnly">
                <i class="fas fa-plus me-1"></i> Akun Baru
            </button>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead>
                    <tr class="text-muted small">
                        <th>KODE AKUN</th>
                        <th>NAMA AKUN / KAS / BANK</th>
                        <th class="text-end">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($accounts as $acc)
                    <tr>
                        <td><span class="badge bg-secondary bg-opacity-10 text-secondary fw-bold px-2 py-1">{{ $acc->kode_akun }}</span></td>
                        <td><div class="fw-bold text-main">{{ $acc->nama_akun }}</div></td>
                        <td class="text-end">
                            <button type="button" class="btn btn-sm btn-light border text-primary me-1" data-bs-toggle="modal" data-bs-target="#modalEditAkun{{ $acc->id }}">
                                <i class="fas fa-edit"></i> Ubah
                            </button>
                            <form action="{{ route('finance.hapusAkun', $acc->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin ingin menghapus akun keuangan ini? Akun tidak bisa dihapus jika sudah digunakan transaksi.')">
                                @csrf @method('DELETE')
                                <button type="submit" class="btn btn-sm btn-light border text-danger">
                                    <i class="fas fa-trash-alt"></i> Hapus
                                </button>
                            </form>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="3" class="text-center py-3 text-muted small">Belum ada daftar akun keuangan terdaftar.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <div class="table-container mb-4 p-4 shadow-sm" style="background: var(--bg-card); border-radius: 16px;">
        <h6 class="fw-bold mb-4 text-muted text-uppercase small"><i class="fas fa-chart-area me-2 text-primary"></i>Visualisasi Arus Kas</h6>
        <div style="height: 300px; position: relative;">
            <canvas id="cashflowChart"></canvas>
        </div>
    </div>

    {{-- TABEL REKAP PENJUALAN OPERASIONAL --}}
    <div class="table-container mb-4 p-4 shadow-sm" style="background: var(--bg-card); border-radius: 16px;">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h6 class="fw-bold text-muted text-uppercase small mb-0"><i class="fas fa-boxes me-2 text-warning"></i>Tabel Data Rekap Penjualan & Pelanggan</h6>
            <span class="badge bg-warning text-dark fw-bold px-2 py-1 rounded small" style="font-size: 0.75rem;">Data Operasional</span>
        </div>
        <div class="table-responsive">
            <table class="table table-hover align-middle">
                <thead>
                    <tr class="text-muted small">
                        <th>NO. INVOICE</th>
                        <th>NAMA PELANGGAN / ORANG</th>
                        <th>TANGGAL TRANSAKSI</th>
                        <th class="text-center">TOTAL ITEM</th>
                        <th class="text-end">TOTAL BAYAR</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($penjualans ?? [] as $p)
                    <tr>
                        <td>
                            <span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded">
                                {{ $p->no_invoice }}
                            </span>
                        </td>
                        <td>
                            <div class="fw-bold text-main">{{ $p->nama_pelanggan }}</div>
                            <small class="text-muted">Status: <span class="text-success fw-semibold">Lunas & Terbaca Finance</span></small>
                        </td>
                        <td>
                            <div class="fw-semibold text-muted">
                                {{ date('d M Y', strtotime($p->tanggal_penjualan)) }}
                            </div>
                        </td>
                        <td class="text-center">
                            <span class="fw-bold text-main">{{ $p->total_item }}</span> <small class="text-muted">Buku</small>
                        </td>
                        <td class="text-end fw-bold text-success">
                            Rp {{ number_format($p->total_bayar, 0, ',', '.') }}
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="text-center py-4 text-muted small">Belum ada rekap data operasional penjualan yang tercatat.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{-- TABEL RIWAYAT MUTASI MANUAL --}}
    <div class="table-container p-4 shadow-sm" style="background: var(--bg-card); border-radius: 16px;">
        <h6 class="fw-bold mb-4 text-muted text-uppercase small"><i class="fas fa-list me-2 text-primary"></i>Riwayat Transaksi Harian</h6>
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
                            <div class="fw-semibold text-main">{{ $m->keterangan }}</div>
                            <small class="text-muted">Via: {{ $m->account->nama_akun ?? 'Kas' }}</small>
                        </td>
                        <td class="text-end fw-bold {{ $m->tipe == 'Masuk' ? 'text-success' : 'text-danger' }}">
                            {{ $m->tipe == 'Masuk' ? '+' : '-' }} {{ number_format($m->nominal, 0, ',', '.') }}
                        </td>
                        <td class="text-end">
                            <div class="dropdown">
                                <button class="btn btn-sm" data-bs-toggle="dropdown"><i class="fas fa-ellipsis-h text-muted"></i></button>
                                <ul class="dropdown-menu dropdown-menu-end border-0 shadow">
                                    <li><button class="dropdown-item py-2 small" data-bs-toggle="modal" data-bs-target="#modalEdit{{ $m->id }}"><i class="fas fa-edit me-2 text-primary"></i> Edit</button></li>
                                    <li><a class="dropdown-item py-2 small" href="{{ route('finance.download_pdf', $m->id) }}" target="_blank"><i class="fas fa-file-pdf me-2 text-danger"></i> PDF Bukti</a></li>
                                    <li><hr class="dropdown-divider"></li>
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
                    @empty
                    <tr>
                        <td colspan="4" class="text-center py-5 text-muted">Tidak ada data transaksi harian ditemukan.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

</div>

{{-- MODAL TRANSAKSI BARU --}}
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
                            @foreach($accounts as $acc)
                                <option value="{{ $acc->id }}">{{ $acc->nama_akun }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Kategori</label>
                        <input type="text" name="nama_kategori" list="categories_list" class="form-control" placeholder="Ketik kategori baru atau pilih yang ada..." required autocomplete="off">
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

{{-- MODAL TAMBAH AKUN (Terintegrasi saat isi Transaksi Baru) --}}
<div class="modal fade" id="modalTambahAkun" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content shadow-lg border-0">
            <form action="{{ route('finance.simpanAkun') }}" method="POST">
                @csrf
                <div class="modal-header border-0 pb-0">
                    <h5 class="fw-bold">Akun Baru</h5>
                    <button type="button" class="btn-close" data-bs-toggle="modal" data-bs-target="#modalTr"></button>
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

{{-- MODAL TAMBAH AKUN ONLY (Dipanggil via Tombol Atas Tabel Daftar Akun) --}}
<div class="modal fade" id="modalTambahAkunOnly" tabindex="-1">
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
                        <input type="text" name="nama_akun" class="form-control" placeholder="Contoh: Bank Mandiri, Kas Utama" required>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="submit" class="btn btn-success w-100 py-2 fw-bold shadow-sm">Simpan Akun</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- TAMBAHAN BARU: MODAL EDIT/UPDATE AKUN LOOP --}}
@foreach($accounts as $acc)
<div class="modal fade" id="modalEditAkun{{ $acc->id }}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content shadow-lg border-0">
            <form action="{{ route('finance.updateAkun', $acc->id) }}" method="POST">
                @csrf @method('PUT')
                <div class="modal-header border-0 pb-0">
                    <h5 class="fw-bold">Ubah Nama Akun</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Kode Akun</label>
                        <input type="text" class="form-control bg-light" value="{{ $acc->kode_akun }}" disabled>
                    </div>
                    <div class="mb-0">
                        <label class="small fw-bold text-muted mb-1">Nama Akun Baru</label>
                        <input type="text" name="nama_akun" class="form-control" value="{{ $acc->nama_akun }}" required>
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary fw-bold px-3">Simpan</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endforeach

{{-- MODAL EDIT TRANSAKSI LOOP --}}
@foreach($mutasis as $m)
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
                        <input type="text" name="nama_kategori" list="categories_list" class="form-control" placeholder="Ketik kategori..." value="{{ $m->category->nama_kategori ?? '' }}" required autocomplete="off">
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
                            <input type="text" class="form-control input-nominal-display" placeholder="Rp 0" value="{{ $m->nominal }}" required>
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
@endforeach

{{-- GLOBAL REKOMENDASI DATALIST --}}
<datalist id="categories_list">
    @foreach($categories as $cat)
        <option value="{{ $cat->nama_kategori }}">
    @endforeach
</datalist>

@endsection

<style>
    .hero-purple { background: var(--primary-gradient); border-radius: 20px; color: white; padding: 40px; position: relative; overflow: hidden; }
    .badge-category { background: rgba(79, 70, 229, 0.1); color: #4F46E5; font-size: 0.7rem; padding: 4px 10px; border-radius: 6px; font-weight: 600; }
    .filter-card { background: var(--bg-card); border-radius: 12px; padding: 6px 12px; border: 1px solid var(--border-color); }
</style>

<script>
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

            if (realInput && realInput.value) {
                cleave.setRawValue(realInput.value);
            } else if (el.value) {
                cleave.setRawValue(el.value);
            }

            el.addEventListener('input', () => {
                if(realInput) realInput.value = cleave.getRawValue();
            });
            el.dataset.cleaveInited = "true";
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        initCleave();

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
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxSize: 6, color: '#888' } } },
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(150,150,150,0.1)' } }, x: { grid: { display: false } } }
            }
        });
    });

    document.addEventListener('shown.bs.modal', function () {
        initCleave();
    });
</script>
