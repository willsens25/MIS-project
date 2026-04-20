@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">

<style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; }
    .card-custom { border: none; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); }
    .form-label-custom { font-weight: 700; font-size: 11px; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; }
    .input-custom { border: none; background-color: #f1f5f9; border-radius: 12px; padding: 12px 16px; font-weight: 600; transition: all 0.2s; }
    .input-custom:focus { background-color: #ffffff; box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1); outline: none; border: 1px solid #007BFF; }
    .btn-save { background-color: #007BFF; border: none; border-radius: 14px; padding: 14px 30px; font-weight: 700; transition: 0.3s; }
    .btn-save:hover { background-color: #0056b3; transform: translateY(-2px); box-shadow: 0 8px 15px rgba(0, 123, 255, 0.2); }
    .badge-purple { background-color: #8b5cf6; color: white; }
    .preview-avatar { width: 80px; height: 80px; background: linear-gradient(135deg, #007BFF, #00d4ff); display: flex; align-items: center; justify-content: center; border-radius: 24px; margin: 0 auto 15px; box-shadow: 0 10px 20px rgba(0, 123, 255, 0.2); }
    .form-switch .form-check-input { width: 2.5em; height: 1.25em; cursor: pointer; }
    .form-switch .form-check-input:checked { background-color: #007BFF; border-color: #007BFF; }
    .border-dashed { border-style: dashed !important; border-width: 2px !important; }
</style>

<div class="container py-4">
    <div class="d-flex align-items-center mb-4">
        <a href="{{ route('identitas.index') }}" class="btn btn-white bg-white shadow-sm rounded-3 me-3 p-2">
            <i class="bi bi-chevron-left text-primary"></i>
        </a>
        <div>
            <h4 class="fw-800 mb-0">Edit Profil Identitas</h4>
            <p class="text-muted small mb-0">ID: MIS-{{ str_pad($identitas->id, 5, '0', STR_PAD_LEFT) }}</p>
        </div>
    </div>

    {{-- Error Handling Alert --}}
    @if ($errors->any())
        <div class="alert alert-danger rounded-4 mb-4 border-0 shadow-sm">
            <ul class="mb-0 fw-600">
                @foreach ($errors->all() as $error)
                    <li><i class="bi bi-exclamation-circle me-2"></i>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('identitas.update', $identitas->id) }}" method="POST">
        @csrf
        @method('PUT')
        
        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card card-custom p-4 bg-white">
                    <h5 class="fw-800 mb-4"><i class="bi bi-person-lines-fill me-2 text-primary"></i>Informasi Utama</h5>
                    
                    <div class="row">
                        {{-- Field Jenis & Nomor Identitas (Penting agar tidak error validasi) --}}
                        <div class="col-md-4 mb-4">
                            <label class="form-label-custom d-block mb-2">Jenis Identitas</label>
                            <select name="jenis_identitas" class="form-select input-custom" required>
                                <option value="KTP" {{ old('jenis_identitas', $identitas->jenis_identitas) == 'KTP' ? 'selected' : '' }}>KTP</option>
                                <option value="Passport" {{ old('jenis_identitas', $identitas->jenis_identitas) == 'PASSPORT' ? 'selected' : '' }}>Paspor</option>
                                <option value="Lainnya" {{ old('jenis_identitas', $identitas->jenis_identitas) == 'Lainnya' ? 'selected' : '' }}>Lainnya</option>
                            </select>
                        </div>

                        <div class="col-md-8 mb-4">
                            <label class="form-label-custom d-block mb-2">Nomor Identitas</label>
                            <input type="text" name="nomor_identitas" class="form-control input-custom w-100"
                                value="{{ old('nomor_identitas', $identitas->nomor_identitas) }}" required>
                        </div>

                        <div class="col-md-8 mb-4">
                            <label class="form-label-custom d-block mb-2">Nama Lengkap</label>
                            <input type="text" name="nama_lengkap" id="input-nama" class="form-control input-custom w-100"
                                value="{{ old('nama_lengkap', $identitas->nama_lengkap) }}" required>
                        </div>

                        <div class="col-md-4 mb-4">
                            <label class="form-label-custom d-block mb-2">Nama Panggilan</label>
                            <input type="text" name="panggilan" class="form-control input-custom w-100"
                                value="{{ old('panggilan', $identitas->panggilan) }}">
                        </div>

                        <div class="col-md-6 mb-4">
                            <label class="form-label-custom d-block mb-2">Divisi / Unit Kerja</label>
                            <select name="divisi_id" id="input-divisi" class="form-select input-custom" required>
                                @foreach($divisi as $div)
                                    <option value="{{ $div->id }}" data-nama="{{ $div->nama_divisi }}" {{ $identitas->divisi_id == $div->id ? 'selected' : '' }}>
                                        [{{ $div->kode }}] {{ $div->nama_divisi }}
                                    </option>
                                @endforeach
                            </select>
                        </div>

                        <div class="col-md-6 mb-4">
                            <label class="form-label-custom d-block mb-2">Status Keamanan</label>
                            <select name="status_keamanan" id="input-status" class="form-select input-custom">
                                <option value="Normal" {{ old('status_keamanan', $identitas->status_keamanan) == 'Normal' ? 'selected' : '' }}>🟢 Normal</option>
                                <option value="VIP" {{ old('status_keamanan', $identitas->status_keamanan) == 'VIP' ? 'selected' : '' }}>⭐ VIP</option>
                                <option value="Pengawasan" {{ old('status_keamanan', $identitas->status_keamanan) == 'Pengawasan' ? 'selected' : '' }}>🟡 Pengawasan</option>
                                <option value="Blacklist" {{ old('status_keamanan', $identitas->status_keamanan) == 'Blacklist' ? 'selected' : '' }}>🔴 Blacklist</option>
                            </select>
                        </div>

                        <div class="col-12 mt-2">
                            <div class="p-3 rounded-4 border border-2 border-dashed bg-light">
                                <label class="form-label-custom d-block mb-3">Atribut Khusus (Opsional)</label>
                                <div class="d-flex gap-4">
                                    <div class="form-check form-switch custom-switch">
                                        <input type="hidden" name="is_agen_purna" value="0">
                                        <input class="form-check-input" type="checkbox" name="is_agen_purna" id="agen" value="1" {{ old('is_agen_purna', $identitas->is_agen_purna) ? 'checked' : '' }}>
                                        <label class="form-check-label fw-bold small ms-2" for="agen">AGEN PURNA</label>
                                    </div>
                                    <div class="form-check form-switch custom-switch">
                                        <input type="hidden" name="is_dharma_patriot" value="0">
                                        <input class="form-check-input" type="checkbox" name="is_dharma_patriot" id="patriot" value="1" {{ old('is_dharma_patriot', $identitas->is_dharma_patriot) ? 'checked' : '' }}>
                                        <label class="form-check-label fw-bold small ms-2" for="patriot">DHARMA PATRIOT</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-5 d-flex gap-3">
                        <button type="submit" class="btn btn-save text-white px-5">
                            <i class="bi bi-check2-circle me-2"></i> Simpan Perubahan
                        </button>
                        <a href="{{ route('identitas.index') }}" class="btn btn-light rounded-4 px-4 fw-bold py-3 text-muted">Batal</a>
                    </div>
                </div>
            </div>

            {{-- PREVIEW CARD --}}
            <div class="col-lg-4">
                <div class="card card-custom overflow-hidden sticky-top" style="top: 20px;">
                    <div class="bg-dark py-2 text-center">
                        <small class="text-white fw-bold" style="font-size: 10px; letter-spacing: 2px;">LIVE PREVIEW</small>
                    </div>
                    <div class="card-body text-center p-4 bg-white">
                        <div class="preview-avatar">
                            <i class="bi bi-person-fill text-white fs-1"></i>
                        </div>
                        <h5 class="fw-800 mb-1" id="preview-nama">{{ strtoupper($identitas->nama_lengkap) }}</h5>
                        <p class="text-muted small mb-4" id="preview-div-text">Anggota {{ $identitas->divisi->nama_divisi ?? 'N/A' }}</p>
                        
                        <div class="text-start bg-light rounded-4 p-3">
                            <div class="d-flex justify-content-between mb-2">
                                <span class="small text-muted">Status</span>
                                <span id="preview-status" class="badge bg-white text-dark border px-2 py-1 small fw-bold">{{ $identitas->status_keamanan }}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="small text-muted">Divisi</span>
                                <span id="preview-divisi" class="small fw-bold text-primary">{{ $identitas->divisi->kode ?? 'N/A' }}</span>
                            </div>
                        </div>

                        <div class="mt-3 d-flex justify-content-center gap-2">
                            <span id="badge-agen" class="badge bg-info px-3 {{ $identitas->is_agen_purna ? '' : 'd-none' }}">AGEN</span>
                            <span id="badge-patriot" class="badge badge-purple px-3 {{ $identitas->is_dharma_patriot ? '' : 'd-none' }}">PATRIOT</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const agenSwitch = document.getElementById('agen');
    const patriotSwitch = document.getElementById('patriot');
    const badgeAgen = document.getElementById('badge-agen');
    const badgePatriot = document.getElementById('badge-patriot');
    const inputNama = document.getElementById('input-nama');
    const previewNama = document.getElementById('preview-nama');
    const inputDivisi = document.getElementById('input-divisi');
    const previewDivisi = document.getElementById('preview-divisi');
    const previewDivText = document.getElementById('preview-div-text');
    const inputStatus = document.getElementById('input-status');
    const previewStatus = document.getElementById('preview-status');

    // Toggle Badge
    agenSwitch.addEventListener('change', function() {
        this.checked ? badgeAgen.classList.remove('d-none') : badgeAgen.classList.add('d-none');
    });

    patriotSwitch.addEventListener('change', function() {
        this.checked ? badgePatriot.classList.remove('d-none') : badgePatriot.classList.add('d-none');
    });

    // Live Update Nama
    inputNama.addEventListener('input', function() {
        previewNama.innerText = this.value.toUpperCase();
    });

    // Live Update Divisi
    inputDivisi.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        // Mengambil kode dari string format "[KODE] NAMA"
        const match = selectedOption.text.match(/\[(.*?)\]/);
        const kode = match ? match[1] : 'N/A';
        const nama = selectedOption.getAttribute('data-nama');
        previewDivisi.innerText = kode;
        previewDivText.innerText = 'Anggota ' + nama;
    });

    // Live Update Status
    inputStatus.addEventListener('change', function() {
        previewStatus.innerText = this.value;
    });
});
</script>
@endsection