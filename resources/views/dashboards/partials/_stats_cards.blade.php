<div class="row mb-4">
    <div class="col-md-4">
        <div class="card card-stats shadow-sm mb-3" style="border-left: 5px solid #0d6efd;">
            <div class="card-body d-flex justify-content-between align-items-center p-4">
                <div>
                    <h6 class="text-muted mb-1 text-uppercase small fw-bold">Total Anggota</h6>
                    <a href="javascript:void(0)" onclick="bukaModalAnggota()" class="text-decoration-none">
                        <h3 class="mb-0 fw-bold text-primary" id="total-anggota-display">{{ $total_orang }}</h3>
                        <small class="text-primary mt-1 d-block"><i class="bi bi-search me-1"></i>Lihat Detail</small>
                    </a>
                </div>
                <i class="bi bi-people-fill fs-1 text-primary opacity-25"></i>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card card-stats shadow-sm mb-3" style="border-left: 5px solid #198754;">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="text-muted mb-1 text-uppercase small fw-bold">Transaksi Masuk</h6>
                    <h3 class="mb-0 fw-bold text-success">Rp 0</h3>
                </div>
                <i class="bi bi-wallet2 fs-1 text-success opacity-25"></i>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card card-stats shadow-sm mb-3" style="border-left: 5px solid #ffc107;">
            <div class="card-body p-4 d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="text-muted mb-1 text-uppercase small fw-bold">Divisi Aktif</h6>
                    <h3 class="mb-0 fw-bold text-warning">6</h3>
                </div>
                <i class="bi bi-grid-fill fs-1 text-warning opacity-25"></i>
            </div>
        </div>
    </div>
</div>