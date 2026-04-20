<div class="row mb-4 align-items-center">
    <div class="col-md-6">
        <h3 class="fw-bold text-dark mb-0">
            <i class="bi bi-speedometer2 me-2 text-primary"></i>Ringkasan Direktorat
        </h3>
        <p class="text-muted small">
            Selamat datang, <strong>{{ auth()->user()->name }}</strong>. Berikut adalah pantauan data hari ini.
        </p>
    </div>
    <div class="col-md-6 text-md-end">
        <div class="d-inline-block p-3 shadow-sm bg-white border rounded-3">
            <div class="d-flex align-items-center">
                <div class="me-3 text-end">
                    <h4 class="mb-0 fw-bold text-primary" id="live-clock">00:00:00</h4>
                    <small class="text-muted fw-bold" id="live-date">Memuat tanggal...</small>
                </div>
                <div class="fs-2 text-primary opacity-75">
                    <i class="bi bi-clock-fill"></i>
                </div>
            </div>
        </div>
    </div>
</div>