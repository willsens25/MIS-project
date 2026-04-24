@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/select2-bootstrap-5-theme@1.3.0/dist/select2-bootstrap-5-theme.min.css" />

<div class="container py-4 text-start" x-data="orderForm()">
    <div class="row mb-4 align-items-center">
        <div class="col-md-8">
            <h2 class="fw-800 text-dark mb-1">Divisi Marketing</h2>
            <p class="text-muted mb-0">Kelola pesanan agen, donasi, dan pengiriman S-SALUR.</p>
        </div>
    </div>

    <div class="row g-4">
        {{-- FORM BUAT PESANAN --}}
        <div class="col-md-5">
            <div class="card border-0 shadow-sm rounded-4 p-4 sticky-md-top" style="top: 5.5rem; z-index: 10;">
                <h5 class="fw-bold mb-4 text-primary"><i class="bi bi-cart-plus me-2"></i>Detail Transaksi</h5>

                <form action="{{ route('marketing.order.store') }}" method="POST" id="formOrder">
                    @csrf

                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="small fw-bold text-muted mb-1">Tanggal Pesen</label>
                            <input type="date" name="tanggal_pesan" class="form-control form-control-sm rounded-3" value="{{ date('Y-m-d') }}" required>
                        </div>
                        <div class="col-6">
                            <label class="small fw-bold text-muted mb-1">Via</label>
                            <select name="via" class="form-select form-select-sm rounded-3" required>
                                <option value="Tokopedia">Tokopedia</option>
                                <option value="Shopee">Shopee</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Event">Event</option>
                                <option value="Call Center">Call Center</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="small fw-bold text-muted mb-1">Nama Pembeli (Invoice)</label>
                        <select name="nama_pembeli" id="select-pembeli" class="form-select select2-identitas" required>
                            <option value="">Cari nama agen/pembeli...</option>
                            @foreach($identitas as $idnt)
                                <option value="{{ $idnt->nama_lengkap }}">{{ $idnt->nama_lengkap }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="form-check form-switch mb-3">
                        <input class="form-check-input" type="checkbox" id="samaPenerima" x-model="samaPenerima">
                        <label class="form-check-label small fw-bold" for="samaPenerima">Kirim ke diri sendiri?</label>
                    </div>

                    {{-- Form Alamat Penerima (Muncul jika checkbox mati) --}}
                    <div x-show="!samaPenerima" x-transition class="bg-light p-3 rounded-4 mb-3 border border-dashed">
                        <div class="mb-2">
                            <label class="small fw-bold text-muted mb-1">Nama Penerima</label>
                            <input type="text" name="nama_penerima" class="form-control form-control-sm" placeholder="Nama orang di lokasi...">
                        </div>
                        <div>
                            <label class="small fw-bold text-muted mb-1">Alamat Lengkap Penerima</label>
                            <textarea name="alamat_penerima" class="form-control form-control-sm" rows="2" placeholder="Jl. Nama jalan, No Rumah, Kelurahan..."></textarea>
                        </div>
                    </div>

                    {{-- MULTI BUKU --}}
                    <label class="small fw-bold text-muted mb-1">Daftar Buku</label>
                    <div class="border rounded-4 p-2 mb-3 bg-white">
                        <template x-for="(item, index) in items" :key="index">
                            <div class="row g-1 mb-2 align-items-center">
                                <div class="col-7">
                                    <select :name="'buku_id['+index+']'" class="form-select form-select-sm" required>
                                        <option value="">-- Pilih Buku --</option>
                                        @foreach($books as $b)
                                            <option value="{{ $b->id }}">{{ $b->judul }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-3">
                                    <input type="number" :name="'qty['+index+']'" class="form-control form-control-sm text-center" placeholder="Qty" x-model="item.qty" min="1">
                                </div>
                                <div class="col-2 text-end">
                                    <button type="button" class="btn btn-sm text-danger" @click="removeItem(index)" x-show="items.length > 1">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </template>
                        <button type="button" class="btn btn-sm btn-light w-100 mt-1 fw-bold text-primary rounded-3" @click="addItem()">
                            <i class="bi bi-plus-circle me-1"></i> Tambah Item
                        </button>
                    </div>

                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="small fw-bold text-muted mb-1">Ekspedisi</label>
                            <select name="ekspedisi" class="form-select form-select-sm">
                                <option value="JNE">JNE</option>
                                <option value="J&T">J&T</option>
                                <option value="SiCepat">SiCepat</option>
                                <option value="Grab/Gojek">Grab/Gojek</option>
                                <option value="Ambil Sendiri">Ambil Sendiri</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="small fw-bold text-muted mb-1">Ongkir (Rp)</label>
                            <input type="number" name="ongkir" class="form-control form-control-sm" value="0">
                        </div>
                    </div>

                    <div class="row g-2 mb-3">
                        <div class="col-5">
                            <label class="small fw-bold text-muted mb-1">Donasi</label>
                            <input type="number" name="nominal_donasi" class="form-control form-control-sm" placeholder="Rp">
                        </div>
                        <div class="col-7">
                            <label class="small fw-bold text-muted mb-1">Keterangan Donasi</label>
                            <input type="text" name="keterangan_donasi" class="form-control form-control-sm" placeholder="A.N Hamba Allah">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="small fw-bold text-muted mb-1">Keterangan Tambahan</label>
                        <textarea name="catatan_khusus" class="form-control form-control-sm" rows="2" placeholder="Kartu ucapan, packing kayu..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 fw-bold py-2 shadow-sm rounded-3">
                        <i class="bi bi-send-check me-2"></i>Simpan & Terbitkan
                    </button>
                </form>
            </div>
        </div>

        {{-- DAFTAR INVOICE --}}
        <div class="col-md-7">
            <div class="card border-0 shadow-sm rounded-4 p-4">
                <h5 class="fw-bold mb-4 text-dark">Daftar Invoice Terkini</h5>
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Invoice</th>
                                <th>Pembeli</th>
                                <th>Ekspedisi</th>
                                <th>Total</th>
                                <th class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($invoices as $inv)
                            <tr>
                                <td>
                                    <span class="fw-bold d-block text-dark">#{{ $inv->no_invoice ?? $inv->id }}</span>
                                    <small class="text-muted" style="font-size: 10px;">{{ $inv->created_at->format('d/m/y H:i') }}</small>
                                </td>
                                <td>
                                    <div class="fw-semibold text-secondary text-truncate" style="max-width: 130px;">{{ $inv->nama_pembeli ?? $inv->nama_agen }}</div>
                                    <small class="text-muted">{{ $inv->via }}</small>
                                </td>
                                <td>
                                    <span class="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-2">
                                        {{ $inv->ekspedisi }}
                                    </span>
                                </td>
                                <td><span class="fw-bold text-primary">Rp{{ number_format($inv->total_tagihan ?? 0, 0, ',', '.') }}</span></td>
                                <td>
                                    <div class="d-flex justify-content-center gap-1">
                                        <button class="btn btn-sm btn-outline-primary border-0"><i class="bi bi-pencil-square"></i></button>
                                        <button class="btn btn-sm btn-outline-danger border-0"><i class="bi bi-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr><td colspan="5" class="text-center py-5 text-muted">Belum ada pesanan masuk.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<script>
    function orderForm() {
        return {
            samaPenerima: true,
            items: [{ buku_id: '', qty: 1 }],
            addItem() {
                this.items.push({ buku_id: '', qty: 1 });
            },
            removeItem(index) {
                this.items.splice(index, 1);
            }
        }
    }

    $(document).ready(function() {
        $('.select2-identitas').select2({
            theme: "bootstrap-5",
            width: '100%',
            dropdownParent: $('#formOrder')
        });
    });
</script>

<style>
    .fw-800 { font-weight: 800; }
    .table thead th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 15px 10px; border-bottom: none; }
    .badge { letter-spacing: 0.3px; font-weight: 700; font-size: 10px; }
    .sticky-md-top { top: 5.5rem !important; }
    .border-dashed { border-style: dashed !important; }
    .form-control-sm, .form-select-sm { font-size: 0.8rem; }
</style>
@endsection
