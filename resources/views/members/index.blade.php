@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

<div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h2 class="fw-bold text-dark mb-0">Manajemen Identitas</h2>
            <p class="text-muted small">Daftar seluruh identitas dan status keamanan</p>
        </div>
        <button class="btn btn-primary rounded-pill px-4 shadow-sm" data-bs-toggle="modal" data-bs-target="#addModal">
            <i class="bi bi-plus-lg me-2"></i> Tambah Baru
        </button>
    </div>

    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                    <tr>
                        <th class="ps-4 py-3">NAMA & DIVISI</th>
                        <th class="py-3 text-center">KATEGORI</th>
                        <th class="py-3 text-center">STATUS</th>
                        <th class="pe-4 py-3 text-end">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($identitas as $idnt)
                    <tr>
                        <td class="ps-4">
                            <div class="fw-bold">{{ $idnt->nama_lengkap }}</div>
                            <div class="text-muted small">{{ $idnt->divisi->nama_divisi ?? 'Tanpa Divisi' }}</div>
                        </td>
                        <td class="text-center">
                            <span class="text-secondary small">{{ $idnt->kategori_jarkom }}</span>
                        </td>
                        <td class="text-center">
                            <span class="badge rounded-pill bg-{{ $idnt->status_keamanan == 'Blacklist' ? 'danger' : 'success' }} px-3">
                                {{ $idnt->status_keamanan }}
                            </span>
                        </td>
                        <td class="pe-4 text-end">
                            <div class="d-flex justify-content-end gap-2">
                                <button type="button" class="btn btn-warning btn-sm fw-bold px-3 shadow-sm" data-bs-toggle="modal" data-bs-target="#editModal{{ $idnt->id }}">
                                    <i class="bi bi-pencil-square me-1"></i> EDIT TEST
                                </button>

                                <form action="{{ route('identitas.destroy', $idnt->id) }}" method="POST" class="d-inline">
                                    @csrf @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm shadow-sm" onclick="return confirm('Hapus data ini?')">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>

                    <div class="modal fade" id="editModal{{ $idnt->id }}" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content border-0 shadow-lg rounded-4">
                                <form action="{{ route('identitas.update', $idnt->id) }}" method="POST">
                                    @csrf @method('PUT')
                                    <div class="modal-header border-0 pb-0">
                                        <h5 class="modal-title fw-bold text-primary">Edit Data</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                    <div class="modal-body text-start">
                                        <div class="mb-3">
                                            <label class="form-label small fw-bold">Nama Lengkap</label>
                                            <input type="text" name="nama_lengkap" class="form-control rounded-3" value="{{ $idnt->nama_lengkap }}" required>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label small fw-bold">Kategori</label>
                                                <input type="text" name="kategori_jarkom" class="form-control rounded-3" value="{{ $idnt->kategori_jarkom }}">
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label small fw-bold">Status Keamanan</label>
                                                <select name="status_keamanan" class="form-select rounded-3">
                                                    <option value="Normal" {{ $idnt->status_keamanan == 'Normal' ? 'selected' : '' }}>Normal</option>
                                                    <option value="Blacklist" {{ $idnt->status_keamanan == 'Blacklist' ? 'selected' : '' }}>Blacklist</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="modal-footer border-0 pt-0">
                                        <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Batal</button>
                                        <button type="submit" class="btn btn-primary rounded-pill px-4 shadow">Simpan Perubahan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    @empty
                    <tr>
                        <td colspan="4" class="text-center py-5 text-muted">Belum ada data identitas.</td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>

<div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <form action="{{ route('identitas.store') }}" method="POST">
                @csrf
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold text-success">Tambah Identitas</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label small fw-bold">Nama Lengkap</label>
                        <input type="text" name="nama_lengkap" class="form-control rounded-3" placeholder="Masukkan nama..." required>
                    </div>
                </div>
                <div class="modal-footer border-0">
                    <button type="submit" class="btn btn-success rounded-pill px-4">Simpan Data</button>
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    body { background-color: #f4f7f6; }
    .table thead th { font-size: 11px; letter-spacing: 1px; color: #6c757d; border: none; }
    .btn-warning { background-color: #ffc107; border: none; color: #000; }
    .btn-warning:hover { background-color: #e5b800; }
</style>
@endsection