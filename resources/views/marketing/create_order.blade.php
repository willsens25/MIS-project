@extends('layouts.app')

@section('content')
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<div class="container-fluid py-4" x-data="orderSystem()" id="orderSystemRoot">
    {{-- HEADER HALAMAN --}}
    <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center">
            <h1 class="h3 mb-0 text-gray-800 font-weight-bold mr-3">SAPA-ALL Marketing</h1>
            <a href="{{ route('marketing.order.list') }}" class="btn btn-sm btn-outline-secondary shadow-sm rounded-pill px-3">
                <i class="fas fa-history mr-1"></i> Lihat Riwayat Invoice
            </a>
        </div>
        <span class="badge badge-primary shadow-sm p-2 px-3 rounded-pill">{{ date('d F Y') }}</span>
    </div>

    {{-- Notifikasi --}}
    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm alert-dismissible fade show custom-alert" role="alert">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close" style="outline: none;">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger border-0 shadow-sm alert-dismissible fade show custom-alert" role="alert">
            <i class="fas fa-exclamation-triangle mr-2"></i> {{ session('error') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close" style="outline: none;">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    <div class="row">
        {{-- KIRI: FORM INPUT PESANAN BARU --}}
        <div class="col-lg-8">
            <form action="{{ route('marketing.order.store') }}" method="POST" id="mainOrderForm" @submit="handleSubmit($event)">
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
                                <label class="small font-weight-bold text-primary">Keterangan / Catatan</label>
                                <input type="text" name="keterangan" class="form-control rounded-pill shadow-sm" placeholder="Contoh: Packing kardus, dll.">
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
                                <input type="text" name="nama_penerima" class="form-control mb-2 rounded-pill" placeholder="Nama Penerima" :required="!samaPenerima">
                                <label class="small font-weight-bold">Alamat Pengiriman</label>
                                <textarea name="alamat_penerima" id="alamat_penerima" class="form-control rounded" rows="2" placeholder="Alamat Pengiriman Lengkap" x-model="alamatPenerima" :required="!samaPenerima"></textarea>
                            </div>
                        </div>

                        <h6 class="font-weight-bold text-dark mb-3"><i class="fas fa-book mr-2"></i>Daftar Buku</h6>
                        <div class="table-responsive">
                            <table class="table align-middle" style="min-width: 650px;">
                                <thead>
                                    <tr class="text-muted small font-weight-bold bg-light">
                                        <th class="border-0 pl-3 py-2">Detail Item & Potongan</th>
                                        <th class="border-0 py-2 text-center" style="width: 140px;">Jumlah (Qty)</th>
                                        <th class="border-0 py-2 text-right pr-3" style="width: 160px;">Subtotal</th>
                                        <th class="border-0 py-2 text-center" style="width: 60px;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="(item, index) in items" :key="item.id">
                                        <tr class="border-bottom">
                                            {{-- Kolom 1: Buku & Potongan Harga --}}
                                            <td class="pl-3 py-3 border-0">
                                                <div class="mb-2">
                                                    <select :name="'buku_id['+index+']'"
                                                            class="form-control shadow-sm border-0 bg-light rounded-pill"
                                                            x-model="item.buku_id" required>
                                                        <option value="">-- Pilih Buku --</option>
                                                        @foreach($books as $b)
                                                            <option value="{{ $b->id }}">{{ $b->judul }} (Stok: {{ $b->stok_gudang }})</option>
                                                        @endforeach
                                                    </select>
                                                </div>

                                                <div x-show="item.buku_id" style="max-width: 200px;" x-transition>
                                                    <div class="input-group input-group-sm shadow-sm border rounded">
                                                        <div class="input-group-prepend">
                                                            <span class="input-group-text bg-light border-0 small font-weight-bold text-danger">Potongan Rp</span>
                                                        </div>
                                                        <input type="number" :name="'promo_item['+index+']'"
                                                               class="form-control border-0 text-right text-danger font-weight-bold"
                                                               placeholder="0" min="0" x-model.number="item.promo_item">
                                                    </div>
                                                </div>
                                            </td>

                                            {{-- Kolom 2: Jumlah / Qty --}}
                                            <td class="py-3 border-0 text-center align-middle">
                                                <div class="input-group shadow-sm">
                                                    <input type="number" :name="'qty['+index+']'"
                                                           class="form-control text-center border-0"
                                                           :class="isOverStock(item) ? 'is-invalid text-danger font-weight-bold' : ''"
                                                           min="1" :disabled="!item.buku_id" x-model.number="item.qty">
                                                    <div class="input-group-append">
                                                        <span class="input-group-text bg-white border-0 small font-weight-bold text-muted">Pcs</span>
                                                    </div>
                                                </div>
                                                <template x-if="isOverStock(item)">
                                                    <small class="text-danger font-weight-bold mt-1 d-block text-left" style="font-size: 11px;">
                                                        ⚠️ Maks: <span x-text="stocks[item.buku_id]"></span> pcs!
                                                    </small>
                                                </template>
                                            </td>

                                            {{-- Kolom 3: Real-time Subtotal --}}
                                            <td class="py-3 border-0 text-right pr-3 font-weight-bold text-dark align-middle">
                                                <span class="small text-muted font-weight-normal mr-1" x-show="item.buku_id">Rp</span>
                                                <span x-text="item.buku_id ? getItemSubtotal(item).toLocaleString('id-ID') : '-'"></span>
                                            </td>

                                            {{-- Kolom 4: Tombol Hapus Baris --}}
                                            <td class="py-3 border-0 text-center align-middle">
                                                <button type="button" @click="removeItem(index)" class="btn btn-link text-danger p-0" x-show="items.length > 1">
                                                    <i class="fas fa-trash-alt fa-lg"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>

                        <button type="button" @click="addItem()" class="btn btn-sm btn-outline-primary rounded-pill px-3 mt-3 mb-4">
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
                                            <template x-if="item.promo_item > 0">
                                                <small class="text-danger d-block">Potongan: Rp <span x-text="(item.promo_item * item.qty).toLocaleString('id-ID')"></span> / item</small>
                                            </template>
                                        </span>
                                        <span class="text-dark font-weight-bold align-self-center">
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

                        <button type="submit"
                                class="btn btn-lg btn-block shadow rounded-pill font-weight-bold"
                                :class="hasAnyError() ? 'btn-danger' : 'btn-primary'"
                                :disabled="hasAnyError()">
                            <span x-show="!hasAnyError()"><i class="fas fa-save mr-2"></i>SIMPAN INVOICE</span>
                            <span x-show="hasAnyError()"><i class="fas fa-exclamation-circle mr-2"></i>STOK TIDAK CUKUP</span>
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
                    <div class="table-responsive" style="max-height: 650px; overflow-y: auto;">
                        <table class="table table-hover mb-0">
                            <thead class="bg-light small">
                                <tr>
                                    <th class="px-3 py-3 border-0">Detail Pesanan</th>
                                    <th class="text-right px-3 py-3 border-0">Total & Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($invoices as $inv)
                                    <tr>
                                        <td class="px-3 py-3 border-0">
                                            <div class="mb-1 d-flex align-items-center">
                                                <small class="text-muted mr-2" style="font-size: 11px;">
                                                    <i class="far fa-calendar-alt mr-1"></i>{{ date('d/m/y', strtotime($inv->tanggal_pesan)) }}
                                                </small>
                                                <span class="badge badge-light border text-primary" style="font-size: 9px; font-weight: 600;">
                                                    {{ $inv->via }}
                                                </span>
                                            </div>
                                            <div class="font-weight-bold text-dark text-truncate mb-1" style="max-width: 150px;" title="{{ $inv->nama_pembeli }}">
                                                {{ $inv->nama_pembeli }}
                                            </div>
                                            <span class="badge badge-warning text-dark shadow-sm" style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px;">
                                                {{ strtoupper($inv->status ?? 'PENDING') }}
                                            </span>
                                        </td>
                                        <td class="text-right px-3 py-3 border-0 align-middle">
                                            <div class="font-weight-bold text-primary mb-2">
                                                Rp{{ number_format($inv->total_tagihan, 0, ',', '.') }}
                                            </div>
                                            <div class="d-flex justify-content-end">
                                                <a href="{{ route('marketing.order.print', $inv->id) }}" target="_blank" class="btn btn-info btn-action mr-1" title="Cetak Invoice">
                                                    <i class="fas fa-print"></i>
                                                </a>
                                                {{-- FIX: Mengubah route mad.tandai-lunas --}}
                                                <form action="{{ route('marketing.invoice.lunas', $inv->id) }}" method="POST" class="mr-1">
                                                    @csrf
                                                    <button type="submit" class="btn btn-success btn-action" title="Tandai Lunas">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                </form>
                                                {{-- FIX: Mengubah route mad.hapus-invoice --}}
                                                <form action="{{ route('marketing.invoice.hapus', $inv->id) }}" method="POST" onsubmit="return confirm('Hapus invoice ini? Stok akan dikembalikan ke gudang.')">
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
                                            <div class="text-muted">
                                                <i class="fas fa-check-circle text-success mb-2" style="font-size: 2rem;"></i>
                                                <p class="small mb-0">Semua invoice sudah lunas!</p>
                                            </div>
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
            alamatPenerima: '',
            ongkir: 0,
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
            stocks: {
                @foreach($books as $b)
                    "{{ $b->id }}": {{ $b->stok_gudang ?? 0 }},
                @endforeach
            },

            items: [{ id: Date.now(), buku_id: '', qty: 1, promo_item: 0 }],

            addItem() {
                this.items.push({ id: Date.now(), buku_id: '', qty: 1, promo_item: 0 });
            },
            removeItem(index) {
                if(this.items.length > 1) this.items.splice(index, 1);
            },

            getItemSubtotal(item) {
                const normalPrice = this.prices[item.buku_id] || 0;
                const discount = parseInt(item.promo_item) || 0;
                const finalPrice = normalPrice - discount;
                return (finalPrice > 0 ? finalPrice : 0) * (item.qty || 0);
            },

            calculateTotalBuku() {
                return this.items.reduce((total, item) => total + this.getItemSubtotal(item), 0);
            },
            calculateTotalQty() {
                return this.items.reduce((total, item) => total + (parseInt(item.qty) || 0), 0);
            },

            isOverStock(item) {
                if (!item.buku_id) return false;
                const availableStock = this.stocks[item.buku_id] || 0;
                return item.qty > availableStock;
            },

            hasAnyError() {
                return this.items.some(item => this.isOverStock(item));
            },

            handleSubmit(event) {
                if (this.samaPenerima) {
                    this.alamatPenerima = '';
                }

                if (this.hasAnyError()) {
                    event.preventDefault();
                    alert('Gagal Menyimpan! Terdapat jumlah pesanan yang melebihi batas stok gudang.');
                }
            }
        }));
    });

    $(document).ready(function() {
        const selectPembeli = $('#select_pembeli');

        selectPembeli.select2({
            theme: 'bootstrap4',
            placeholder: '-- Cari Nama --',
            allowClear: true
        });

        // Menghubungkan perubahan Select2 ke state Alpine.js dengan aman
        selectPembeli.on('change', function () {
            const namaTerpilih = this.value;
            const alpineComponent = Alpine.$data(document.getElementById('orderSystemRoot'));

            if (!namaTerpilih) {
                alpineComponent.alamatPenerima = '';
                return;
            }

            fetch(`/marketing/get-alamat-agen/${encodeURIComponent(namaTerpilih)}`)
                .then(response => {
                    if (!response.ok) throw new Error('Alamat tidak ditemukan');
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success' && data.alamat) {
                        alpineComponent.alamatPenerima = data.alamat;
                    } else {
                        alpineComponent.alamatPenerima = '';
                    }
                })
                .catch(error => {
                    console.error('Gagal mengambil alamat:', error);
                    alpineComponent.alamatPenerima = '';
                });
        });

        setTimeout(function() {
            $(".custom-alert").fadeTo(500, 0).slideUp(500, function(){
                $(this).remove();
            });
        }, 5000);
    });
</script>

<style>
    .bg-gradient-primary { background: linear-gradient(180deg, #4e73df 10%, #224abe 100%); }
    .btn-action {
        width: 32px; height: 32px; padding: 0;
        display: inline-flex; align-items: center; justify-content: center;
        border-radius: 8px; transition: all 0.2s;
        border: none;
    }
    .btn-action:hover { transform: translateY(-2px); filter: brightness(90%); }
    .table-hover tbody tr:hover { background-color: rgba(78, 115, 223, 0.05); }

    .custom-alert { position: relative; z-index: 1050; }
    .custom-alert .close { padding: 0.75rem 1.25rem; opacity: 0.8; }
    .custom-alert .close:hover { opacity: 1; }

    .table-responsive::-webkit-scrollbar { width: 5px; }
    .table-responsive::-webkit-scrollbar-track { background: #f1f1f1; }
    .table-responsive::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }

    .table td, .table th { vertical-align: middle !important; }
    .input-group-sm .input-group-text {
        font-size: 11px;
        padding: 0.25rem 0.5rem;
        background-color: #f8f9fc !important;
    }

    .select2-container--bootstrap4 .select2-selection--single {
        border-radius: 50px !important;
        height: calc(1.5em + 0.75rem + 2px) !important;
        padding: 0.375rem 1rem !important;
        background-color: #fff !important;
        border: 1px solid #d1d3e2 !important;
        box-shadow: 0 .125rem .25rem rgba(0,0,0,.075) !important;
        transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out !important;
    }
    .select2-container--bootstrap4 .select2-selection--single .select2-selection__rendered {
        padding-left: 0 !important; padding-right: 20px !important; color: #6e707e !important;
    }
    .select2-container--bootstrap4 .select2-selection--single .select2-selection__arrow {
        right: 15px !important; height: 100% !important;
    }
    .select2-container--bootstrap4.select2-container--focus .select2-selection--single {
        border-color: #bac8f3 !important; box-shadow: 0 0 0 0.2rem rgba(78,115,223,.25) !important;
    }
    .select2-dropdown {
        border-radius: 15px !important; overflow: hidden !important;
        border: 1px solid #d1d3e2 !important; box-shadow: 0 .5rem 1rem rgba(0,0,0,.15) !important;
    }
    .select2-search--dropdown .select2-search__field { border-radius: 8px !important; }
</style>
@endsection
