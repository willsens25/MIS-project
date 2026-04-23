<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MIS SAPA-ALL - Identitas</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background-color: #f8f9fa; }
        .card { border: none; border-radius: 15px; box-shadow: 0 4px 6px rgba(170, 92, 92, 0.1); }
        .btn-primary { border-radius: 10px; padding: 10px 20px; }
    </style>
</head>
<body>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-10">

            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold text-primary">Form Identitas <span class="text-dark">SAPA-ALL</span></h2>
                <span class="badge bg-primary text-uppercase p-2">Sistem MIS v1.0</span>
            </div>

            @if(session('status'))
                <div class="alert alert-success border-0 shadow-sm alert-dismissible fade show">
                    {{ session('status') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif

            <div class="card mb-5">
                <div class="card-body p-4">
                    <form action="/simpan-orang" method="POST">
                        @csrf
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-semibold">Divisi</label>
                                <select name="divisi_id" class="form-select" required>
                                    <option value="">-- Pilih Divisi --</option>
                                    @foreach($divisi as $d)
                                        <option value="{{ $d->id }}">{{ $d->kode }} - {{ $d->nama_divisi }}</option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-semibold">Nama Lengkap</label>
                                <input type="text" name="nama_lengkap" class="form-control" placeholder="Contoh: Budi Santoso" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-semibold">Email</label>
                                <input type="email" name="email" class="form-control" placeholder="budi@mail.com" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-semibold">Nomor WhatsApp/HP</label>
                                <input type="text" name="no_hp" class="form-control" placeholder="0812xxxx">
                            </div>
                            <div class="col-12 mb-3">
                                <label class="form-label fw-semibold">Alamat Lengkap</label>
                                <textarea name="alamat" class="form-control" rows="2" placeholder="Alamat sesuai KTP..."></textarea>
                            </div>
                        </div>
                        <div class="text-end">
                            <button type="submit" class="btn btn-primary px-5">Simpan ke Database</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card">
                <div class="card-header bg-white py-3">
                    <h5 class="mb-0 fw-bold">Daftar Anggota Terdaftar</h5>
                </div>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Nama</th>
                                <th>Divisi</th>
                                <th>Kontak</th>
                                <th class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($semua_orang as $orang)
                            <tr>
                                <td>
                                    <div class="fw-bold">{{ $orang->nama_lengkap }}</div>
                                    <small class="text-muted">{{ $orang->email }}</small>
                                </td>
                                <td><span class="badge bg-info text-dark">{{ $orang->kode }}</span></td>
                                <td>{{ $orang->no_hp }}</td>
                                <td class="text-center">
                                    <a href="/edit-orang/{{ $orang->id }}" class="btn btn-sm btn-outline-warning mx-1">Edit</a>
                                    <a href="/hapus-orang/{{ $orang->id }}" onclick="return confirm('Hapus data ini?')" class="btn btn-sm btn-outline-danger mx-1">Hapus</a>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
