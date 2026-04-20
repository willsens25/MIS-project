@foreach($agens as $agen)
{{-- MODAL EDIT DATA AGEN --}}
<div class="modal fade" id="modalEditAgen{{ $agen->id }}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('mad.update-agen', $agen->id) }}" method="POST">
                @csrf
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold"><i class="bi bi-pencil-square me-2 text-primary"></i>Edit Data Agen</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="mb-3">
                        <label class="form-label fw-bold small">NAMA AGEN</label>
                        <input type="text" name="nama_agen" class="form-control shadow-sm border-2" value="{{ $agen->nama_agen }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold small">WILAYAH</label>
                        <input type="text" name="wilayah" class="form-control shadow-sm border-2" value="{{ $agen->wilayah }}" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold small">NO. WHATSAPP</label>
                        <input type="text" name="no_telp" class="form-control shadow-sm border-2" value="{{ $agen->no_telp }}">
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm">UPDATE DATA</button>
                </div>
            </form>
        </div>
    </div>
</div>

{{-- MODAL KIRIM BUKU (INVOICE) --}}
<div class="modal fade" id="modalKirimBuku{{ $agen->id }}" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('mad.kirim-buku') }}" method="POST">
                @csrf
                <input type="hidden" name="agen_id" value="{{ $agen->id }}">
                <div class="modal-header border-0 bg-success text-white py-3">
                    <h5 class="modal-title fw-bold"><i class="bi bi-box-seam me-2"></i>Kirim Buku ke: {{ $agen->nama_agen }}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <div id="container-buku-{{ $agen->id }}">
                        <div class="item-buku border rounded-3 p-3 mb-3 bg-light position-relative shadow-sm">
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <label class="form-label fw-bold small text-muted">PILIH JUDUL BUKU (STOK REAL-TIME)</label>
                                    <select name="buku_id[]" class="form-select border-0 shadow-sm fw-bold select-buku" required onchange="updateMaxQty(this)">
                                        <option value="" disabled selected>Pilih judul dari database...</option>
                                        @foreach($books as $b)
                                            @php
                                                $isLow = $b->stok_gudang > 0 && $b->stok_gudang < 50;
                                                $isEmpty = $b->stok_gudang <= 0;
                                            @endphp
                                            <option value="{{ $b->id }}" 
                                                    data-stok="{{ $b->stok_gudang }}"
                                                    class="{{ $isEmpty ? 'text-danger' : ($isLow ? 'text-warning' : '') }}"
                                                    {{ $isEmpty ? 'disabled' : '' }}>
                                                {{ $b->judul }} 
                                                — (Stok: {{ $b->stok_gudang }} Eks) 
                                                {{ $isEmpty ? '[HABIS]' : ($isLow ? '[STOK TIPIS]' : '') }}
                                            </option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold small text-muted">JUMLAH (QTY)</label>
                                    <input type="number" name="qty[]" class="form-control border-0 shadow-sm input-qty" min="1" placeholder="0" required>
                                    <small class="msg-stok fw-bold text-primary" style="font-size: 0.7rem;"></small>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold small text-muted">HARGA SATUAN (RP)</label>
                                    <input type="number" name="harga_satuan[]" class="form-control border-0 shadow-sm" placeholder="Opsional (Pakai harga master)">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-sm btn-outline-success fw-bold mb-4 rounded-pill px-3" onclick="tambahBarisBuku({{ $agen->id }})">
                        <i class="bi bi-plus-circle me-1"></i> Tambah Judul Lain
                    </button>

                    <div class="p-3 rounded-4 bg-white border border-dashed text-center shadow-sm">
                        <label class="fw-bold small d-block mb-2 text-muted text-uppercase">Jenis Distribusi</label>
                        <div class="d-flex justify-content-center gap-4">
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="tipe" id="tipeSalur{{ $agen->id }}" value="S-SALUR" checked>
                                <label class="form-check-label fw-bold" for="tipeSalur{{ $agen->id }}">S-SALUR (Dijual)</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="tipe" id="tipeDonasi{{ $agen->id }}" value="D-DONASI">
                                <label class="form-check-label fw-bold text-info" for="tipeDonasi{{ $agen->id }}">D-DONASI (Gratis)</label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-0 p-4">
                    <button type="submit" class="btn btn-success w-100 py-3 fw-bold rounded-3 shadow">
                        <i class="bi bi-send-fill me-2"></i>TERBITKAN INVOICE & POTONG STOK
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endforeach

<script>

function updateMaxQty(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const stok = selectedOption.getAttribute('data-stok');
    
    const itemContainer = selectElement.closest('.item-buku');
    const inputQty = itemContainer.querySelector('.input-qty');
    const msgStok = itemContainer.querySelector('.msg-stok');

    if (stok !== null) {
        inputQty.setAttribute('max', stok);
        msgStok.innerHTML = `<i class="bi bi-info-circle me-1"></i>Maksimal kirim: ${stok} eks`;
        
        if (parseInt(inputQty.value) > parseInt(stok)) {
            inputQty.value = stok;
        }
    } else {
        msgStok.innerHTML = "";
    }
}

function tambahBarisBuku(agenId) {
    const container = document.getElementById(`container-buku-${agenId}`);
    const firstItem = container.querySelector('.item-buku').cloneNode(true);
    
    // Reset nilai input di baris baru
    firstItem.querySelector('select').selectedIndex = 0;
    firstItem.querySelector('.input-qty').value = '';
    firstItem.querySelector('.msg-stok').innerHTML = '';
    
    container.appendChild(firstItem);
}

</script>