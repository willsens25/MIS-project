@extends('layouts.app')

@section('content')
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<div class="container-fluid py-4" x-data="orderSystem()">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800 font-weight-bold">SAPA-ALL Marketing</h1>
        <span class="badge badge-primary shadow-sm p-2 px-3 rounded-pill">{{ date('d F Y') }}</span>
    </div>

    {{-- Notifikasi --}}
    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm alert-dismissible fade show">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
            <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger border-0 shadow-sm alert-dismissible fade show">
            <i class="fas fa-exclamation-triangle mr-2"></i> {{ session('error') }}
            <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
        </div>
    @endif

    <div class="row">
        {{-- KIRI: FORM INPUT PESANAN BARU --}}
        <div class="col-lg-8">
            <form action="{{ route('marketing.order.store') }}" method="POST" id="mainOrderForm">
                @csrf
                <div class="card shadow-sm border-0 rounded-lg mb-4">
                    <div class="card-header bg-white py-3">
                        <h6 class="m-0 font-weight-bold text-primary">
                            <i class="fas fa-shopping-basket mr-2"></i>Informasi Pesanan Baru
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="small font-weight-bold">Tanggal Pesan</label>
                                <input type="date" name="tanggal_pesan" class="form-control rounded-pill shadow-sm" value="{{ date('Y-m-d') }}" required>
                            </div>
                            <div class="col-md-4">
                                <label class="small font-weight-bold">Via (Channel) <span class="text-danger">*</span></label>
                                <input type="text" name="via" class="form-control rounded-pill shadow-sm" list="viaList" placeholder="Tokopedia/WA..." required>
                                <datalist id="viaList">
                                    <option value="Tokopedia"><option value="Shopee"><option value="WhatsApp"><option value="Offline">
                                </datalist>
                            </div>
                            <div class="col-md-4">
                                <label class="small font-weight-bold text-danger">Kode Promo</label>
                                <input type="text" name="promo_code" class="form-control rounded-pill shadow-sm" placeholder="DISKON10">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="small font-weight-bold text-primary">Nama Pembeli (Agen/Member)</label>
                            <select name="nama_agen" id="select_pembeli" class="form-control shadow-sm" required>
                                <option value="">-- Cari Nama --</option>
                                @foreach($identitas as $idnt)
                                    <option value="{{ $idnt->nama_lengkap }}">{{ $idnt->nama_lengkap }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="bg-light p-3 rounded-lg mb-4 border shadow-sm">
                            <div class="custom-control custom-switch">
                                <input type="checkbox" name="sama_penerima" class="custom-control-input" id="samaPenerima" x-model="samaPenerima">
                                <label class="custom-control-label font-weight-bold" for="samaPenerima">Penerima sama dengan pembeli</label>
                            </div>

                            <div x-show="!samaPenerima" x-transition class="mt-3">
                                <label class="small font-weight-bold">Nama Penerima Berbeda</label>
                                <input type="text" name="nama_penerima" class="form-control mb-2 rounded-pill" placeholder="Nama Penerima">
                                <label class="small font-weight-bold">Alamat Pengiriman</label>
                                <textarea name="alamat_penerima" class="form-control rounded" rows="2" placeholder="Alamat Pengiriman Lengkap"></textarea>
                            </div>
                        </div>

                        <h6 class="font-weight-bold text-dark mb-3"><i class="fas fa-book mr-2"></i>Daftar Buku</h6>
                        <div class="table-responsive">
                            <table class="table table-sm borderless">
                                <tbody>
                                    <template x-for="(item, index) in items" :key="item.id">
                                        <tr class="mb-2">
                                            <td style="min-width: 250px;">
                                                <select :name="'buku_id['+index+']'"
                                                        class="form-control shadow-sm border-0 bg-light"
                                                        x-model="item.buku_id" required>
                                                    <option value="">-- Pilih Buku --</option>
                                                    @foreach($books as $b)
                                                        <option value="{{ $b->id }}">{{ $b->judul }}</option>
                                                    @endforeach
                                                </select>
                                            </td>
                                            <td width="120">
                                                <div class="input-group shadow-sm">
                                                    <input type="number" :name="'qty['+index+']'" class="form-control text-center border-0" min="1" x-model.number="item.qty">
                                                    <div class="input-group-append">
                                                        <span class="input-group-text bg-white border-0 small">Pcs</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td width="50" class="align-middle">
                                                <button type="button" @click="removeItem(index)" class="btn btn-link text-danger p-0" x-show="items.length > 1">
                                                    <i class="fas fa-minus-circle fa-lg"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        <button type="button" @click="addItem()" class="btn btn-sm btn-outline-primary rounded-pill px-3 mb-4">
                            <i class="fas fa-plus mr-1"></i> Tambah Baris Buku
                        </button>

                        <hr class="my-4">
                        <div class="row mb-4">
                            <div class="col-md-6 mb-3">
                                <label class="small font-weight-bold">Ekspedisi <span class="text-danger">*</span></label>
                                <input type="text" name="ekspedisi" class="form-control rounded-pill shadow-sm" list="expList" placeholder="JNE/J&T/Sicepat..." required>
                                <datalist id="expList">
                                    <option value="JNE"> <option value="J&T"> <option value="SiCepat"> <option value="Gojek">
                                </datalist>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="small font-weight-bold">Ongkos Kirim (Rp)</label>
                                <input type="number" name="ongkir" class="form-control rounded-pill shadow-sm" x-model.number="ongkir" required>
                            </div>
                        </div>

                        {{-- BOX RINGKASAN ORDER --}}
                        <div class="card border-primary mb-4 bg-light shadow-sm">
                            <div class="card-body py-3">
                                <h6 class="font-weight-bold text-primary mb-3"><i class="fas fa-calculator mr-2"></i>Ringkasan Orderan</h6>

                                <template x-for="item in items" :key="item.id">
                                    <div class="d-flex justify-content-between mb-1 small" x-show="item.buku_id">
                                        <span class="text-muted">
                                            <span x-text="titles[item.buku_id]"></span>
                                            (<span x-text="item.qty"></span> pcs)
                                        </span>
                                        <span class="text-dark font-weight-bold">
                                            Rp <span x-text="getItemSubtotal(item).toLocaleString('id-ID')"></span>
                                        </span>
                                    </div>
                                </template>

                                <hr class="my-2" x-show="calculateTotalQty() > 0">

                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-muted">Total Buku (<span x-text="calculateTotalQty()"></span> Pcs):</span>
                                    <span class="font-weight-bold text-dark">
                                        Rp <span x-text="calculateTotalBuku().toLocaleString('id-ID')"></span>
                                    </span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="text-muted">Ongkos Kirim:</span>
                                    <span class="font-weight-bold text-dark">
                                        Rp <span x-text="ongkir.toLocaleString('id-ID')"></span>
                                    </span>
                                </div>
                                <div class="border-top mt-2 pt-2 d-flex justify-content-between align-items-center">
                                    <span class="h6 mb-0 font-weight-bold">Total Pembayaran:</span>
                                    <span class="h5 mb-0 font-weight-bold text-success">
                                        Rp <span x-text="(calculateTotalBuku() + (parseInt(ongkir) || 0)).toLocaleString('id-ID')"></span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-block btn-lg shadow rounded-pill font-weight-bold">
                            <i class="fas fa-save mr-2"></i>SIMPAN INVOICE
                        </button>
                    </div>
                </div>
            </form>
        </div>

        {{-- KANAN: DAFTAR INVOICE BELUM LUNAS --}}
        <div class="col-lg-4">
            <div class="card shadow-sm border-0 rounded-lg overflow-hidden">
                <div class="card-header bg-gradient-primary py-3">
                    <h6 class="m-0 font-weight-bold text-white"><i class="fas fa-history mr-2"></i>Invoice Belum Lunas</h6>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="bg-light small">
                                <tr>
                                    <th class="px-3 py-3 border-0">Customer</th>
                                    <th class="text-right px-3 py-3 border-0">Total & Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($invoices as $inv)
                                    @if(trim(strtolower($inv->status)) == 'lunas')
                                        @continue
                                    @endif

                                    <tr>
                                        <td class="px-3 py-3 border-0">
                                            <div class="font-weight-bold text-dark text-truncate" style="max-width: 130px;">
                                                {{ $inv->nama_pembeli ?? $inv->nama_agen ?? 'Pembeli' }}
                                            </div>
                                            <small class="text-muted">#{{ $inv->no_invoice }}</small>
                                            <div class="small text-danger">Status: {{ $inv->status ?? 'NULL' }}</div>
                                        </td>
                                        <td class="text-right px-3 py-3 border-0 align-middle">
                                            <div class="font-weight-bold text-primary mb-2">
                                                Rp{{ number_format($inv->total_tagihan, 0, ',', '.') }}
                                            </div>
                                            <div class="d-flex justify-content-end">
                                                <form action="{{ route('mad.tandai-lunas', $inv->id) }}" method="POST" class="mr-1">
                                                    @csrf
                                                    <button type="submit" class="btn btn-success btn-action" title="Tandai Lunas">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                </form>
                                                <form action="{{ route('mad.hapus-invoice', $inv->id) }}" method="POST" onsubmit="return confirm('Hapus invoice ini?')">
                                                    @csrf @method('DELETE')
                                                    <button type="submit" class="btn btn-outline-danger btn-action" title="Hapus">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="2" class="text-center py-5">
                                            <p class="text-muted small">Semua invoice sudah lunas!</p>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('orderSystem', () => ({
            samaPenerima: true,
            ongkir: 0,
            // Mapping data dari PHP ke JS
            prices: {
                @foreach($books as $b)
                    "{{ $b->id }}": {{ $b->harga_jual ?? 0 }},
                @endforeach
            },
            titles: {
                @foreach($books as $b)
                    "{{ $b->id }}": "{{ $b->judul }}",
                @endforeach
            },
            items: [{ id: Date.now(), buku_id: '', qty: 1 }],

            addItem() {
                this.items.push({ id: Date.now(), buku_id: '', qty: 1 });
            },
            removeItem(index) {
                if(this.items.length > 1) this.items.splice(index, 1);
            },
            getItemSubtotal(item) {
                return (this.prices[item.buku_id] || 0) * (item.qty || 0);
            },
            calculateTotalBuku() {
                return this.items.reduce((total, item) => total + this.getItemSubtotal(item), 0);
            },
            calculateTotalQty() {
                return this.items.reduce((total, item) => total + (parseInt(item.qty) || 0), 0);
            }
        }));
    });

    $(document).ready(function() {
        $('#select_pembeli').select2({
            theme: 'bootstrap4',
            placeholder: '-- Cari Nama --',
            allowClear: true
        });
    });
</script>

<style>
    .bg-gradient-primary { background: linear-gradient(180deg, #4e73df 10%, #224abe 100%); }
    .borderless td, .borderless th { border: none !important; }
    .btn-action {
        width: 32px;
        height: 32px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s;
    }
    .btn-action:hover { transform: translateY(-2px); }
    .table-hover tbody tr:hover { background-color: rgba(78, 115, 223, 0.05); }
</style>
@endsection
