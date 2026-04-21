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

    .preview-card { position: sticky; top: 20px; }
    .avatar-preview { width: 80px; height: 80px; background: linear-gradient(135deg, #007BFF, #00d4ff); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; margin: 0 auto 15px; box-shadow: 0 10px 20px rgba(0, 123, 255, 0.2); }

    .form-switch .form-check-input { width: 2.5em; height: 1.25em; cursor: pointer; }
</style>

<div class="container py-4">
    <div class="d-flex align-items-center mb-4">
        <a href="{{ route('identitas.index') }}" class="btn btn-white bg-white shadow-sm rounded-3 me-3 p-2">
            <i class="bi bi-chevron-left text-primary"></i>
        </a>
        <div>
            <h4 class="fw-800 mb-0">Edit Profil Identitas</h4>
            <p class="text-muted small mb-0">Update informasi untuk MIS-{{ str_pad($identitas->id, 5, '0', STR_PAD_LEFT) }}</p>
        </div>
    </div>

    <form action="{{ route('identitas.update', $identitas->id) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="row g-4">
            <div class="col-lg-8">
                <div class="card card-custom p-4 bg-white mb-4">
                    <h5 class="fw-800 mb-4"><i class="bi bi-person-badge me-2 text-primary"></i>Informasi Utama</h5>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label-custom">Nomor KTP / Identitas</label>
                            <input type="text" name="nomor_identitas" class="form-control input-custom"
                                   value="{{ old('nomor_identitas', $identitas->no_ktp) }}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label-custom">Jenis Identitas</label>
                            <select name="jenis_identitas" class="form-select input-custom">
                                <option value="KTP" {{ $identitas->jenis_identitas == 'KTP' ? 'selected' : '' }}>KTP</option>
                                <option value="PASSPORT" {{ $identitas->jenis_identitas == 'PASSPORT' ? 'selected' : '' }}>Passport</option>
                            </select>
                        </div>
                        <div class="col-md-12 mb-3">
                            <label class="form-label-custom">Nama Lengkap (Sesuai Identitas)</label>
                            <input type="text" name="nama_lengkap" id="input-nama" class="form-control input-custom"
                                   value="{{ old('nama_lengkap', $identitas->nama_lengkap) }}" required>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label-custom">Nama Panggilan</label>
                            <input type="text" name="panggilan" class="form-control input-custom"
                                   value="{{ old('panggilan', $identitas->nama_panggilan) }}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label-custom">Divisi</label>
                            <select name="divisi_id" id="input-divisi" class="form-select input-custom" required>
                                @foreach($divisi as $div)
                                    <option value="{{ $div->id }}" data-nama="{{ $div->nama_divisi }}" {{ $identitas->divisi_id == $div->id ? 'selected' : '' }}>
                                        [{{ $div->kode }}] {{ $div->nama_divisi }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card card-custom p-4 bg-white mb-4">
                    <h5 class="fw-800 mb-4"><i class="bi bi-shield-lock me-2 text-warning"></i>Status & Keamanan</h5>
                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <label class="form-label-custom">Status Keamanan</label>
                            <select name="status_keamanan" id="input-status" class="form-select input-custom">
                                <option value="Normal" {{ $identitas->status_keamanan == 'Normal' ? 'selected' : '' }}>Normal</option>
                                <option value="VIP" {{ $identitas->status_keamanan == 'VIP' ? 'selected' : '' }}>VIP</option>
                                <option value="Pengawasan" {{ $identitas->status_keamanan == 'Pengawasan' ? 'selected' : '' }}>Pengawasan</option>
                                <option value="Blacklist" {{ $identitas->status_keamanan == 'Blacklist' ? 'selected' : '' }}>Blacklist</option>
                            </select>
                        </div>
                        <div class="col-md-12">
                            <div class="p-3 rounded-4 border border-dashed bg-light">
                                <div class="d-flex gap-4">
                                    <div class="form-check form-switch">
                                        <input type="hidden" name="is_agen_purna" value="0">
                                        <input class="form-check-input" type="checkbox" name="is_agen_purna" id="check-agen" value="1" {{ $identitas->is_agen_purna ? 'checked' : '' }}>
                                        <label class="form-check-label fw-bold small ms-2" for="check-agen">AGEN PURNA</label>
                                    </div>
                                    <div class="form-check form-switch">
                                        <input type="hidden" name="is_dharma_patriot" value="0">
                                        <input class="form-check-input" type="checkbox" name="is_dharma_patriot" id="check-patriot" value="1" {{ $identitas->is_dharma_patriot ? 'checked' : '' }}>
                                        <label class="form-check-label fw-bold small ms-2" for="check-patriot">DHARMA PATRIOT</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-5 d-flex gap-3">
                    <button type="submit" class="btn btn-save text-white px-5 shadow-sm">
                        <i class="bi bi-cloud-arrow-up me-2"></i> Update Data Anggota
                    </button>
                    <a href="{{ route('identitas.index') }}" class="btn btn-light rounded-4 px-4 fw-bold py-3">Batal</a>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card card-custom preview-card overflow-hidden">
                    <div class="bg-dark py-2 text-center">
                        <small class="text-white fw-bold" style="font-size: 10px; letter-spacing: 2px;">LIVE PREVIEW</small>
                    </div>
                    <div class="card-body text-center p-4">
                        <div class="avatar-preview" id="preview-avatar">
                            {{ substr($identitas->nama_lengkap, 0, 1) }}
                        </div>
                        <h5 class="fw-800 mb-1" id="preview-nama">{{ $identitas->nama_lengkap }}</h5>
                        <p class="text-muted small mb-3" id="preview-divisi-text">{{ $identitas->divisi->nama_divisi ?? '-' }}</p>

                        <div class="badge bg-light text-dark border px-3 py-2 rounded-pill fw-bold small mb-3" id="preview-status">
                            {{ $identitas->status_keamanan }}
                        </div>

                        <div class="d-flex justify-content-center gap-2 mt-2">
                            <span id="badge-agen" class="badge bg-info {{ $identitas->is_agen_purna ? '' : 'd-none' }}">AGEN</span>
                            <span id="badge-patriot" class="badge bg-primary {{ $identitas->is_dharma_patriot ? '' : 'd-none' }}">PATRIOT</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </form>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const inputNama = document.getElementById('input-nama');
        const previewNama = document.getElementById('preview-nama');
        const previewAvatar = document.getElementById('preview-avatar');

        const inputDivisi = document.getElementById('input-divisi');
        const previewDivisiText = document.getElementById('preview-divisi-text');

        const inputStatus = document.getElementById('input-status');
        const previewStatus = document.getElementById('preview-status');

        const checkAgen = document.getElementById('check-agen');
        const badgeAgen = document.getElementById('badge-agen');
        const checkPatriot = document.getElementById('check-patriot');
        const badgePatriot = document.getElementById('badge-patriot');

        // Live Update Nama & Avatar
        inputNama.addEventListener('input', function() {
            previewNama.innerText = this.value || 'Nama Lengkap';
            previewAvatar.innerText = this.value ? this.value.charAt(0).toUpperCase() : '?';
        });

        // Live Update Divisi
        inputDivisi.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            previewDivisiText.innerText = selectedOption.getAttribute('data-nama');
        });

        // Live Update Status
        inputStatus.addEventListener('change', function() {
            previewStatus.innerText = this.value;
        });

        // Toggle Badges
        checkAgen.addEventListener('change', function() {
            this.checked ? badgeAgen.classList.remove('d-none') : badgeAgen.classList.add('d-none');
        });
        checkPatriot.addEventListener('change', function() {
            this.checked ? badgePatriot.classList.remove('d-none') : badgePatriot.classList.add('d-none');
        });
    });
</script>
@endsection
