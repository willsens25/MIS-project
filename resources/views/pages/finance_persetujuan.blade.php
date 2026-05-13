@extends('layouts.app')

@section('content')
<div class="container py-4 text-start">
    {{-- Header & Back Button --}}
    <div class="mb-4">
        <div class="d-flex justify-content-between align-items-start">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item small text-uppercase tracking-wider text-primary fw-bold">Finance</li>
                    <li class="breadcrumb-item small text-uppercase tracking-wider active">Persetujuan Produksi</li>
                </ol>
            </nav>
            <a href="{{ route('finance.index') }}" class="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold border-0 bg-light shadow-sm">
                <i class="bi bi-arrow-left me-1"></i> Dashboard
            </a>
        </div>
        <h2 class="fw-bold mb-0">Antrean Pengajuan Cetak</h2>
        <p class="text-muted small">Validasi anggaran untuk pencetakan ulang item S-SALUR</p>
    </div>

    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm rounded-3 mb-4">
            <i class="bi bi-check-circle-fill me-2"></i> {{ session('success') }}
        </div>
    @endif

    {{-- Main Table --}}
    <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light border-bottom text-muted small">
                    <tr>
                        <th class="ps-4 py-3">DETAIL ITEM</th>
                        <th>JUMLAH AJUAN</th>
                        <th>ESTIMASI BIAYA</th>
                        <th>PEMOHON</th>
                        <th class="text-end pe-4">AKSI</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($pengajuans as $p)
                    <tr>
                        <td class="ps-4">
                            <div class="d-flex align-items-center">
                                <div class="bg-primary bg-opacity-10 p-2 rounded-3 me-3 text-primary">
                                    <i class="bi bi-book fs-5"></i>
                                </div>
                                <div>
                                    <div class="fw-bold">{{ $p->buku->judul }}</div>
                                    <div class="text-muted" style="font-size: 0.75rem;">Sisa Stok: {{ $p->buku->stok_gudang }} Eks</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge bg-body-secondary text-dark border px-3 rounded-pill">
                                {{ number_format($p->jumlah_pengajuan, 0, ',', '.') }} Eks
                            </span>
                        </td>
                        <td>
                            <div class="fw-bold text-danger">
                                Rp {{ number_format($p->jumlah_pengajuan * 20000, 0, ',', '.') }}
                            </div>
                            <small class="text-muted" style="font-size: 0.7rem;">Est. Rp 20.000/eks</small>
                        </td>
                        <td>
                            <div class="small fw-bold">Divisi PNB</div>
                            <div class="text-muted small">{{ $p->created_at->format('d/m/Y H:i') }}</div>
                        </td>
                        <td class="text-end pe-4">
                            <button class="btn btn-success btn-sm rounded-3 fw-bold px-3 shadow-sm" data-bs-toggle="modal" data-bs-target="#modalSetuju{{ $p->id }}">
                                <i class="bi bi-check-lg"></i> Setujui
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-3 fw-bold px-3 ms-1" data-bs-toggle="modal" data-bs-target="#modalTolak{{ $p->id }}">
                                Tolak
                            </button>
                        </td>
                    </tr>

                    {{-- Modal Setujui --}}
                    <div class="modal fade" id="modalSetuju{{ $p->id }}" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered modal-sm">
                            <div class="modal-content border-0 shadow">
                                <form action="{{ route('finance.prosesCetak', $p->id) }}" method="POST">
                                    @csrf
                                    <input type="hidden" name="aksi" value="setujui">
                                    <div class="modal-body p-4 text-center">
                                        <div class="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3 text-success">
                                            <i class="bi bi-cash-stack fs-3"></i>
                                        </div>
                                        <h6 class="fw-bold">Konfirmasi Anggaran</h6>
                                        <p class="text-muted small">Pilih sumber dana untuk membiayai cetakan ini:</p>

                                        <select name="account_id" class="form-select border-0 bg-light mb-3" required>
                                            <option value="" disabled selected>Pilih Akun Kas...</option>
                                            @foreach($accounts as $acc)
                                                <option value="{{ $acc->id }}">{{ $acc->nama_akun }}</option>
                                            @endforeach
                                        </select>

                                        <div class="row g-2">
                                            <div class="col-6"><button type="button" class="btn btn-light w-100 rounded-3 btn-sm" data-bs-dismiss="modal">Batal</button></div>
                                            <div class="col-6"><button type="submit" class="btn btn-success w-100 rounded-3 btn-sm fw-bold">Proses</button></div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {{-- Modal Tolak --}}
                    <div class="modal fade" id="modalTolak{{ $p->id }}" tabindex="-1">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content border-0 shadow">
                                <form action="{{ route('finance.prosesCetak', $p->id) }}" method="POST">
                                    @csrf
                                    <input type="hidden" name="aksi" value="tolak">
                                    <div class="modal-header border-0">
                                        <h5 class="fw-bold mb-0">Alasan Penolakan</h5>
                                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                    </div>
                                    <div class="modal-body">
                                        <textarea name="catatan" class="form-control border-0 bg-light" rows="3" placeholder="Berikan alasan agar PNB bisa melakukan revisi..." required></textarea>
                                    </div>
                                    <div class="p-3 pt-0">
                                        <button type="submit" class="btn btn-danger w-100 rounded-3 fw-bold">Kirim Penolakan</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    @empty
                    <tr>
                        <td colspan="5" class="text-center py-5">
                            <i class="bi bi-clipboard-check fs-1 text-muted opacity-25"></i>
                            <p class="text-muted mt-2">Semua antrean pengajuan sudah diproses.</p>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
