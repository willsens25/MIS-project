@extends('layouts.app')

@section('content')
<div class="container-fluid px-4 py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center">
            <a href="{{ route('marketing') }}" class="btn btn-outline-secondary btn-sm rounded-circle mr-3" title="Kembali ke Form Input" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;">
                <i class="fas fa-arrow-left"></i>
            </a>
            <h1 class="h3 mb-0 text-gray-800 font-weight-bold">Riwayat Invoice Pesanan</h1>
        </div>

        <a href="{{ route('marketing') }}" class="btn btn-primary rounded-pill shadow-sm px-3">
            <i class="fas fa-plus mr-1"></i> Input Pesanan Baru
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm">{{ session('success') }}</div>
    @endif
    @if(session('error'))
        <div class="alert alert-danger border-0 shadow-sm">{{ session('error') }}</div>
    @endif

    <div class="card shadow border-0 rounded-lg mb-4">
        <div class="card-body">
            <form id="filter-form" action="{{ route('order.index') }}" method="GET" class="row g-3 align-items-center">
                <div class="col-md-4">
                    <input type="text" id="search-input" name="search" class="form-control rounded-pill" placeholder="Cari No. Invoice / Nama Agen..." value="{{ request('search') }}" autocomplete="off">
                </div>
                <div class="col-md-3">
                    <select id="status-select" name="status" class="form-control rounded-pill">
                        <option value="">-- Semua Status --</option>
                        <option value="Pending" {{ request('status') == 'Pending' ? 'selected' : '' }}>Pending</option>
                        <option value="Lunas" {{ request('status') == 'Lunas' ? 'selected' : '' }}>Lunas</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <button type="submit" class="btn btn-secondary w-100 rounded-pill">Filter</button>
                </div>
                <div class="col-md-3">
                    <a href="{{ route('marketing.ekspor', request()->all()) }}" id="btn-ekspor" class="btn btn-success w-100 rounded-pill shadow-sm">
                        <i class="fas fa-file-excel mr-1"></i> Ekspor Rekap (Excel)
                    </a>
                </div>
            </form>
        </div>
    </div>

    <div class="card shadow border-0 rounded-lg mb-4">
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-bordered table-hover" width="100%" cellspacing="0">
                    <thead class="table-light">
                        <tr>
                            <th>No. Invoice</th>
                            <th>Tanggal</th>
                            <th>Agen / Pembeli</th>
                            <th>Via</th>
                            <th>Total Tagihan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="order-table-body">
                        @include('marketing.partials.order_table')
                    </tbody>
                </table>
            </div>

            <div id="pagination-container" class="d-flex justify-content-end mt-3">
                {{ $orders->appends(request()->query())->links() }}
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const statusSelect = document.getElementById('status-select');
    const tableBody = document.getElementById('order-table-body');
    const paginationContainer = document.getElementById('pagination-container');
    const btnEkspor = document.getElementById('btn-ekspor');
    const form = document.getElementById('filter-form');

    let debounceTimer;

    // Fungsi utama mengambil data parsial HTML via AJAX & Sinkronisasi URL Ekspor
    function fetchOrders() {
        const formData = new FormData(form);
        const params = new URLSearchParams(formData).toString();
        const url = `${form.action}?${params}`;

        // UPDATE LINK EKSPOR SECARA DINAMIS: Agar ketika user mengetik/memilih filter via AJAX,
        // link download Excel ikut membaca filter terbaru tanpa harus klik tombol filter manual.
        if (btnEkspor) {
            btnEkspor.href = `{{ route('marketing.ekspor') }}?${params}`;
        }

        // Beri efek redup tipis sebagai indikator data sedang di-load
        tableBody.style.opacity = '0.5';

        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.text())
        .then(html => {
            tableBody.innerHTML = html;
            tableBody.style.opacity = '1';

            // Sinkronisasi link pagination baru dari baris tersembunyi partial
            const newPagination = document.getElementById('ajax-pagination-links');
            if (newPagination) {
                paginationContainer.innerHTML = newPagination.innerHTML;
            } else {
                paginationContainer.innerHTML = '';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            tableBody.style.opacity = '1';
        });
    }

    // Event 1: Ngetik di input pencarian (Debounce 300ms mencegah spam query database)
    searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(fetchOrders, 300);
    });

    // Event 2: Mengganti pilihan Status dropdown
    statusSelect.addEventListener('change', fetchOrders);

    // Event 3: Cegah reload total saat user menekan Enter / klik tombol filter manual
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        fetchOrders();
    });

    // Event 4: Menjaga link pagination agar tetap bekerja secara AJAX saat berpindah halaman
    document.addEventListener('click', function (e) {
        const paginationLink = e.target.closest('#pagination-container a');
        if (paginationLink) {
            e.preventDefault();
            const url = paginationLink.href;

            tableBody.style.opacity = '0.5';

            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.text())
            .then(html => {
                tableBody.innerHTML = html;
                tableBody.style.opacity = '1';

                const newPagination = document.getElementById('ajax-pagination-links');
                if (newPagination) {
                    paginationContainer.innerHTML = newPagination.innerHTML;
                }

                // Ambil query string dari halaman baru untuk mensinkronkan ulang link ekspor excel
                const currentQueryString = url.split('?')[1];
                if (currentQueryString && btnEkspor) {
                    btnEkspor.href = `{{ route('marketing.ekspor') }}?${currentQueryString}`;
                }
            });
        }
    });
});
</script>
@endsection
