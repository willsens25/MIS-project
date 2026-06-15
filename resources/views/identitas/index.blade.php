@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">

<style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; color: #1e293b; }

    /* Stats Card Card */
    .card-stats { border: none; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); transition: all 0.3s; }
    .card-stats:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }

    /* Modern Datatable Card */
    .table-container { background: #ffffff; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: none; overflow: hidden; }

    .table-modern thead { background-color: #f1f5f9; }
    .table-modern th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; font-weight: 700; padding: 16px 20px; border: none; }
    .table-modern td { padding: 16px 20px; vertical-align: middle; color: #334155; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
    .table-modern tbody tr:hover { background-color: #f8fafc; cursor: pointer; }

    /* Search Bar Custom */
    .search-custom { border: none; background-color: #f1f5f9; border-radius: 14px; padding: 12px 20px 12px 45px; font-weight: 600; transition: all 0.2s; }
    .search-custom:focus { background-color: #ffffff; box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1); border: 1px solid #007BFF; outline: none; }
    .search-icon-wrapper { position: relative; }
    .search-icon-wrapper i { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 16px; }

    /* Avatar Inisial Bulat */
    .avatar-circle { width: 42px; height: 42px; background: linear-gradient(135deg, #e0f2fe, #bae6fd); color: #0369a1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; }

    /* Badge Status Soft Color */
    .badge-soft { padding: 6px 12px; border-radius: 10px; font-weight: 700; font-size: 11px; letter-spacing: 0.3px; display: inline-flex; align-items: center; gap: 4px; }
    .badge-soft-normal { background-color: #dcfce7; color: #15803d; }
    .badge-soft-vip { background-color: #fef9c3; color: #a16207; border: 1px solid #fde047; }
    .badge-soft-pengawasan { background-color: #ffedd5; color: #9a3412; }
    .badge-soft-blacklist { background-color: #fee2e2; color: #991b1b; }

    .btn-add { background-color: #007BFF; border: none; border-radius: 14px; padding: 12px 24px; font-weight: 700; transition: 0.3s; }
    .btn-add:hover { background-color: #0056b3; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0, 123, 255, 0.2); }

    .btn-action-view { background-color: #f1f5f9; border: none; color: #475569; padding: 8px 12px; border-radius: 10px; font-weight: 600; transition: 0.2s; text-decoration: none; }
    .btn-action-view:hover { background-color: #e2e8f0; color: #0f172a; }

    .btn-action-delete { background-color: #fee2e2; border: none; color: #991b1b; padding: 8px 12px; border-radius: 10px; font-weight: 600; transition: 0.2s; }
    .btn-action-delete:hover { background-color: #fca5a5; color: #7f1d1d; }

    /* Custom Checkbox */
    .form-check-input { width: 18px; height: 18px; cursor: pointer; }
    .btn-bulk-delete { border-radius: 12px; font-weight: 700; padding: 10px 20px; display: none; transition: all 0.2s; }
</style>

<div class="container-fluid py-4 px-4">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
            <h3 class="fw-800 mb-1">Database Anggota MIS</h3>
            <p class="text-muted small mb-0">Kelola informasi profil, kategori umat, dan pengawasan internal.</p>
        </div>
        <div class="d-flex gap-2">
            {{-- Tombol Bulk Delete --}}
            <button type="button" id="btnBulkDelete" class="btn btn-danger btn-bulk-delete shadow-sm" onclick="submitBulkDelete()">
                <i class="bi bi-trash3-fill me-2"></i> Hapus Terpilih (<span id="checkCount">0</span>)
            </button>

            <button type="button" class="btn btn-add text-white shadow-sm" data-bs-toggle="modal" data-bs-target="#modalTambahIdentitas">
                <i class="bi bi-plus-lg me-2"></i> Registrasi Anggota Baru
            </button>
        </div>
    </div>

    {{-- Ringkasan Stats --}}
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card card-stats bg-white p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-muted small fw-700 text-uppercase mb-1" style="font-size: 10px; letter-spacing: 0.5px;">Total Anggota Terdaftar</p>
                        <h3 class="fw-800 mb-0 text-dark">{{ $countAnggota ?? 0 }} <span class="fs-6 fw-normal text-muted">Orang</span></h3>
                    </div>
                    <div class="p-3 bg-primary-subtle text-primary rounded-4 fs-3" style="background-color: #eff6ff;">
                        <i class="bi bi-people-fill text-primary"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card card-stats bg-white p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-muted small fw-700 text-uppercase mb-1" style="font-size: 10px; letter-spacing: 0.5px;">Saldo Kas Global</p>
                        <h3 class="fw-800 mb-0 text-success">Rp {{ number_format($saldoKasGlobal ?? 0, 0, ',', '.') }}</h3>
                    </div>
                    <div class="p-3 rounded-4 fs-3" style="background-color: #f0fdf4;">
                        <i class="bi bi-wallet2 text-success"></i>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card card-stats bg-white p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="text-muted small fw-700 text-uppercase mb-1" style="font-size: 10px; letter-spacing: 0.5px;">Struktur Divisi</p>
                        <h3 class="fw-800 mb-0 text-info">{{ $countDivisi ?? 0 }} <span class="fs-6 fw-normal text-muted">Divisi</span></h3>
                    </div>
                    <div class="p-3 rounded-4 fs-3" style="background-color: #ecfeff;">
                        <i class="bi bi-building-gear text-info"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card table-container">
        <div class="p-4 bg-white border-bottom border-light">
            <form action="{{ route('identitas.index') }}" method="GET">
                <div class="search-icon-wrapper" style="max-width: 400px;">
                    <i class="bi bi-search"></i>
                    <input type="text" name="search" class="form-control search-custom" placeholder="Cari nama, panggilan, nomor KTP..." value="{{ request('search') }}">
                </div>
            </form>
        </div>

        {{-- FORM UTAMA UNTUK BULK DELETE (Disinkronkan dengan web.php) --}}
        <form id="formBulkDelete" action="{{ route('identitas.bulkDelete') }}" method="POST">
            @csrf
            @method('DELETE')

            <div class="table-responsive">
                <table class="table table-modern align-middle mb-0">
                    <thead>
                        <tr>
                            <th width="40" class="text-center" onclick="event.stopPropagation();">
                                <input type="checkbox" class="form-check-input" id="checkAll">
                            </th>
                            <th width="80">ID MIS</th>
                            <th>Profil Anggota</th>
                            <th>Kategori</th>
                            <th>Kontak Utama</th>
                            <th>Divisi</th>
                            <th width="150" class="text-center">Keamanan</th>
                            <th width="160" class="text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($identitas as $item)
                            <tr onclick="window.location='{{ route('identitas.show', $item->id) }}'">
                                <td class="text-center" onclick="event.stopPropagation();">
                                    <input type="checkbox" name="ids[]" value="{{ $item->id }}" class="form-check-input row-checkbox">
                                </td>
                                <td class="fw-bold text-muted">MIS-{{ str_pad($item->id, 5, '0', STR_PAD_LEFT) }}</td>
                                <td>
                                    <div class="d-flex align-items-center gap-3">
                                        <div class="avatar-circle">
                                            {{ strtoupper(substr($item->nama_lengkap, 0, 1)) }}
                                        </div>
                                        <div>
                                            <h6 class="fw-bold mb-0 text-dark">{{ $item->nama_lengkap }}</h6>
                                            <small class="text-muted">Panggilan: <span class="fw-semibold text-secondary">{{ $item->panggilan ?? '-' }}</span></small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark border px-2 py-1.5 rounded-3 fw-semibold small">
                                        {{ $item->jenis_umat ?? 'Simpatisan' }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex flex-column">
                                        <span class="fw-semibold text-dark"><i class="bi bi-whatsapp text-success small me-1"></i>{{ $item->nomor_hp_primary ?? '-' }}</span>
                                        <small class="text-muted small" style="font-size: 11px;">{{ $item->email ?? '-' }}</small>
                                    </div>
                                </td>
                                <td>
                                    @if($item->divisi)
                                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1.5 rounded-3 fw-bold" style="background-color: #eff6ff;">
                                            {{ $item->divisi->nama_divisi }}
                                        </span>
                                    @else
                                        <span class="text-muted small italic">Belum Set</span>
                                    @endif
                                </td>
                                <td class="text-center">
                                    @php
                                        $statusLower = strtolower($item->status_keamanan ?? 'normal');
                                    @endphp
                                    <span class="badge-soft badge-soft-{{ $statusLower }}">
                                        <span class="spinner-grow spinner-grow-sm" style="width: 6px; height: 6px;" role="status"></span>
                                        {{ strtoupper($item->status_keamanan ?? 'NORMAL') }}
                                    </span>
                                </td>
                                <td class="text-center" onclick="event.stopPropagation();">
                                    <div class="d-flex justify-content-center gap-1">
                                        <a href="{{ route('identitas.show', $item->id) }}" class="btn btn-action-view small">
                                            <i class="bi bi-eye-fill"></i>
                                        </a>
                                        <button type="button" class="btn btn-action-delete small" title="Hapus Anggota" onclick="confirmSingleDelete({{ $item->id }}, '{{ $item->nama_lengkap }}')">
                                            <i class="bi bi-trash3-fill"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="8" class="text-center py-5 text-muted">
                                    <i class="bi bi-folder-x fs-1 d-block mb-2 opacity-40"></i>
                                    <span class="fw-bold">Tidak ada data anggota ditemukan.</span>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </form>

        {{-- Form bantuan terpisah untuk hapus satuan --}}
        <form id="formSingleDelete" method="POST" style="display:none;">
            @csrf
            @method('DELETE')
        </form>

        @if($identitas->hasPages())
            <div class="p-4 bg-white border-top border-light d-flex justify-content-center">
                {{ $identitas->links() }}
            </div>
        @endif
    </div>
</div>

{{-- Modal Registrasi --}}
<div class="modal fade" id="modalTambahIdentitas" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" style="border: none; border-radius: 24px;">
            <div class="modal-header px-4 pt-4 border-0">
                <h5 class="fw-800 mb-0"><i class="bi bi-person-plus-fill me-2 text-primary"></i>Registrasi Anggota Baru</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <form action="{{ route('identitas.store') }}" method="POST">
                @csrf
                <div class="modal-body p-4">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase">Nomor KTP / Identitas <span class="text-danger">*</span></label>
                            <input type="text" name="nomor_identitas" class="form-control bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;" required placeholder="Masukkan No. KTP">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase">Jenis Identitas</label>
                            <select name="jenis_identitas" class="form-select bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;">
                                <option value="KTP">KTP</option>
                                <option value="PASPOR">Paspor</option>
                            </select>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label small fw-bold text-muted text-uppercase">Nama Lengkap <span class="text-danger">*</span></label>
                            <input type="text" name="nama_lengkap" class="form-control bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;" required placeholder="Nama Sesuai Sistem">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label small fw-bold text-muted text-uppercase">Nama Panggilan</label>
                            <input type="text" name="panggilan" class="form-control bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;" placeholder="Panggilan">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase">Nomor WhatsApp / HP</label>
                            <input type="text" name="nomor_hp_primary" class="form-control bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;" placeholder="0812xxxx">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase">Kategori Anggota</label>
                            <select name="jenis_umat" id="jenis_umat_select" class="form-select bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;">
                                <option value="Umat - Simpatisan">Umat - Simpatisan</option>
                                <option value="Umat - Anggota">Umat - Anggota</option>
                                <option value="Umat - Pengurus">Umat - Pengurus</option>
                                <option value="Sangha">Sangha (Bhante/Attasilani)</option>
                            </select>
                        </div>

                        <div class="col-md-12">
                            <label class="form-label small fw-bold text-muted text-uppercase">Alamat Domisili</label>
                            <textarea name="alamat" rows="2" class="form-control bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;" placeholder="Alamat Lengkap Rumah"></textarea>
                        </div>

                        <div class="col-md-6" id="divisi_kerja_wrapper">
                            <label class="form-label small fw-bold text-muted text-uppercase">Divisi Kerja <span class="text-danger text-required-divisi">*</span></label>
                            <select name="divisi_id" id="divisi_id_select" class="form-select bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;">
                                <option value="">-- Pilih Divisi --</option>
                                @foreach($divisi as $div)
                                    <option value="{{ $div->id }}">{{ $div->nama_divisi }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted text-uppercase">Jenis Kelamin</label>
                            <select name="jenis_kelamin" class="form-select bg-light border-0 py-2.5 px-3 rounded-3" style="font-weight: 600;">
                                <option value="pria">Laki-laki</option>
                                <option value="wanita">Perempuan</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer px-4 pb-4 border-0 d-flex gap-2">
                    <button type="button" class="btn btn-light rounded-3 fw-bold py-2.5 px-4" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary rounded-3 fw-bold py-2.5 px-4 shadow-sm">Simpan Anggota</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const jenisUmatSelect = document.getElementById('jenis_umat_select');
    const divisiWrapper = document.getElementById('divisi_kerja_wrapper');
    const divisiSelect = document.getElementById('divisi_id_select');

    function toggleDivisiField() {
        if (jenisUmatSelect && divisiSelect) {
            if (jenisUmatSelect.value === 'Sangha') {
                divisiSelect.value = "";
                divisiSelect.required = false;
                divisiWrapper.style.display = 'none';
            } else {
                divisiWrapper.style.display = 'block';
                divisiSelect.required = true;
            }
        }
    }
    if (jenisUmatSelect && divisiSelect) {
        jenisUmatSelect.addEventListener('change', toggleDivisiField);
        toggleDivisiField();
    }

    const checkAll = document.getElementById('checkAll');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const btnBulkDelete = document.getElementById('btnBulkDelete');
    const checkCount = document.getElementById('checkCount');

    function updateBulkButtonStatus() {
        const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
        checkCount.textContent = checkedCount;

        if (checkedCount > 0) {
            btnBulkDelete.style.display = 'inline-block';
        } else {
            btnBulkDelete.style.display = 'none';
        }
    }

    if(checkAll) {
        checkAll.addEventListener('change', function() {
            rowCheckboxes.forEach(cb => {
                cb.checked = checkAll.checked;
            });
            updateBulkButtonStatus();
        });
    }

    rowCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const allChecked = (document.querySelectorAll('.row-checkbox:checked').length === rowCheckboxes.length);
            checkAll.checked = allChecked;
            updateBulkButtonStatus();
        });
    });
});

function submitBulkDelete() {
    if (confirm('Apakah Anda yakin ingin menghapus semua anggota terpilih secara massal? Tindakan ini tidak bisa dibatalkan!')) {
        document.getElementById('formBulkDelete').submit();
    }
}

function confirmSingleDelete(id, name) {
    if (confirm('Apakah Anda yakin ingin menghapus ' + name + ' dari sistem?')) {
        const form = document.getElementById('formSingleDelete');
        form.action = '/anggota/' + id; // Diubah menyesuaikan prefix 'anggota' di web.php kamu
        form.submit();
    }
}
</script>
@endsection
