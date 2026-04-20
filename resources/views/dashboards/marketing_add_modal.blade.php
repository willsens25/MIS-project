<div class="modal fade" id="modalTambahAgen" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('mad.tambah-agen') }}" method="POST">
                @csrf
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold"><i class="bi bi-person-plus-fill me-2 text-primary"></i>Registrasi Agen Baru</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">NAMA LENGKAP AGEN</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-0"><i class="bi bi-person"></i></span>
                            <input type="text" name="nama_agen" class="form-control border-0 bg-light" placeholder="Masukkan nama lengkap..." required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">WILAYAH DISTRIBUSI</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-0"><i class="bi bi-geo-alt"></i></span>
                            <input type="text" name="wilayah" class="form-control border-0 bg-light" placeholder="Contoh: Jakarta Timur" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label small fw-bold text-muted">NOMOR WHATSAPP (AKTIF)</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-0"><i class="bi bi-whatsapp"></i></span>
                            <input type="text" name="no_telp" class="form-control border-0 bg-light" placeholder="0812xxxx">
                        </div>
                        <small class="text-muted" style="font-size: 0.7rem;">Gunakan format angka saja untuk integrasi pesan otomatis ke depannya.</small>
                    </div>
                </div>
                <div class="modal-footer border-0 p-4 pt-0">
                    <button type="submit" class="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow">
                        <i class="bi bi-save me-2"></i>DAFTARKAN AGEN SEKARANG
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>