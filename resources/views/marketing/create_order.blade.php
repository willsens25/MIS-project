@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<style>
    .marketing-page {
        padding: 1.5rem;
    }

    .card-header.bg-white {
        background-color: #ffffff !important;
        color: #4e73df !important;
        border-bottom: 1px solid #e3e6f0 !important;
    }

    .bg-gradient-primary {
        background: linear-gradient(180deg, #4e73df 10%, #224abe 100%) !important;
    }

    .rounded-lg { border-radius: 0.75rem !important; }
    .borderless td, .borderless th { border: none !important; }

    .btn-xs {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        line-height: 1;
        border-radius: 0.35rem;
    }

    .text-truncate-custom {
        max-width: 140px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
    }

    .custom-date-box {
        display: inline-block;
        background-color: #ffffff !important;
        color: #4e73df !important;
        border: 1px solid #e3e6f0 !important;
        font-size: 0.85rem;
        font-weight: 600;
    }

    /* Styling khusus Box Rincian Pembayaran */
    .summary-box {
        background-color: #f8f9fc;
        border: 1px solid #e3e6f0;
        border-left: 4px solid #4e73df;
    }

    [data-bs-theme="dark"] .card-header.bg-white {
        background-color: #2c2c2c !important;
        color: #f8f9fa !important;
        border-bottom: 1px solid #444 !important;
    }
    [data-bs-theme="dark"] .custom-date-box {
        background-color: #2c2c2c !important;
        color: #ffffff !important;
        border: 1px solid #444444 !important;
    }
    [data-bs-theme="dark"] .text-dark { color: #ffffff !important; }
    [data-bs-theme="dark"] .bg-light { background-color: #2a2b3d !important; color: #ffffff !important; }
    [data-bs-theme="dark"] .summary-box { background-color: #2a2b3d; border-color: #444; }
</style>

<div class="container-fluid marketing-page" x-data="orderSystem()">

    {{-- ALERT BANNER --}}
    @if ($errors->any())
        <div class="alert alert-danger border-0 shadow-sm mb-4 alert-dismissible fade show">
            <h6 class="font-weight-bold mb-2"><i class="fas fa-exclamation-triangle mr-2"></i> Gagal Menyimpan! Periksa Input Berikut:</h6>
            <ul class="mb-0 small ps-3">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger border-0 shadow-sm mb-4 alert-dismissible fade show">
            <i class="fas fa-times-circle mr-2"></i> {{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm mb-4 alert-dismissible fade show">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    {{-- HEADER HALAMAN --}}
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap">
        <div class="mb-2">
            <h1 class="h3 mb-0 text-gray-800 font-weight-bold">SAPA-ALL Marketing</h1>
            <p class="text-muted small mb-0">Input pesanan dan kelola invoice pelanggan</p>
        </div>
        <div class="d-flex align-items-center gap-2">
            <a href="{{ route('marketing.promo.index') }}" class="btn btn-primary rounded-pill px-4 font-weight-bold shadow-sm me-2">
                <i class="fas fa-ticket-alt mr-2"></i> Kelola Kode Promo
            </a>
            <div class="custom-date-box shadow-sm p-2 px-3 rounded-pill d-none d-sm-block">
                <i class="far fa-calendar-alt mr-1"></i> {{ date('d F Y') }}
            </div>
        </div>
    </div>

    <div class="row">
        {{-- FORM BUAT PESANAN (KIRI) --}}
        <div class="col-lg-8">
            <form action="{{ route('marketing.order.store') }}" method="POST">
                @csrf
                <div class="card shadow-sm border-0 rounded-lg mb-4">
                    <div class="card-header bg-white py-3">
                        <h6 class="m-0 font-weight-bold">
                            <i class="fas fa-shopping-basket mr-2"></i>Informasi Pesanan Baru
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-4 mb-2">
                                <label class="small font-weight-bold text-dark">Tanggal Pesan</label>
                                <input type="date" name="tanggal_pesan" class="form-control rounded-pill" value="{{ date('Y-m-d') }}" required>
                            </div>
                            <div class="col-md-4 mb-2">
                                <label class="small font-weight-bold text-dark">Via (Channel)</label>
                                <input type="text" name="via" class="form-control rounded-pill" list="viaList" placeholder="Tokopedia/Shopee...">
                                <datalist id="viaList">
                                    <option value="Tokopedia"><option value="Shopee"><option value="WhatsApp"><option value="Event">
                                </datalist>
                            </div>
                            <div class="col-md-4 mb-2">
                                <label class="small font-weight-bold text-danger">Kode Promo</label>
                                <div class="input-group">
                                    <input type="text" name="promo_code" class="form-control" placeholder="Contoh: DISKON10" x-model="promoCode" @keyup.enter.prevent="applyPromo()">
                                    <button class="btn btn-outline-danger" type="button" @click="applyPromo()">Cek</button>
                                </div>
                                <small x-show="promoMessage" :class="promoStatus === 'success' ? 'text-success' : 'text-danger'" class="font-weight-bold d-block mt-1" x-text="promoMessage"></small>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="small font-weight-bold text-dark">Nama Pembeli (Agen/Member)</label>
                            <select name="nama_agen" id="select_pembeli" class="form-control" required>
                                <option value="">-- Cari Nama --</option>
                                @foreach($identitas as $idnt)
                                    <option value="{{ $idnt->nama_lengkap }}">{{ $idnt->nama_lengkap }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="bg-light p-3 rounded-lg mb-4 border shadow-sm">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="samaPenerima" name="sama_penerima" value="1" x-model="samaPenerima">
                                <label class="form-check-label font-weight-bold text-dark" for="samaPenerima">Penerima sama dengan pembeli</label>
                            </div>
                            <div x-show="!samaPenerima" x-transition class="mt-3">
                                <input type="text" name="nama_penerima" class="form-control mb-2 rounded-pill" placeholder="Nama Lengkap Penerima">
                                <textarea name="alamat_penerima" class="form-control rounded" rows="2" placeholder="Alamat Lengkap Pengiriman..."></textarea>
                            </div>
                        </div>

                        <h6 class="font-weight-bold text-dark mb-3"><i class="fas fa-book mr-2"></i>Daftar Buku</h6>
                        <div class="table-responsive">
                            <table class="table table-sm borderless align-middle">
                                <tbody>
                                    <template x-for="(item, index) in items" :key="index">
                                        <tr>
                                            <td>
                                                <select name="buku_id[]" class="form-select shadow-sm select-buku-alpine" required style="border-radius: 20px;" @change="updateHarga(index, $event)">
                                                    <option value="" data-harga="0">-- Pilih Buku --</option>
                                                    @foreach($books as $b)
                                                        <option value="{{ $b->id }}" data-harga="{{ $b->harga_jual ?? $b->harga ?? 0 }}">{{ $b->judul }}</option>
                                                    @endforeach
                                                </select>
                                            </td>
                                            <td width="130">
                                                <input type="number" name="qty[]" class="form-control text-center shadow-sm" min="1" x-model.number="item.qty" style="border-radius: 20px;" placeholder="QTY">
                                            </td>
                                            <td width="140" class="text-end px-2 text-muted small font-weight-bold">
                                                Sub: Rp<span x-text="formatRupiah(item.qty * item.harga)">0</span>
                                            </td>
                                            <td width="40" class="text-center">
                                                <button type="button" @click="removeItem(index)" class="btn btn-link text-danger p-0 shadow-none" x-show="items.length > 1">
                                                    <i class="fas fa-minus-circle fa-lg"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        <button type="button" @click="addItem()" class="btn btn-sm btn-outline-primary rounded-pill px-3 mt-2">
                            <i class="fas fa-plus mr-1"></i> Tambah Item Buku
                        </button>

                        <hr class="my-4">
                        <div class="row mb-4">
                            <div class="col-md-6 mb-3">
                                <label class="small font-weight-bold text-dark">Ekspedisi</label>
                                <input type="text" name="ekspedisi" class="form-control rounded-pill" list="expList" placeholder="JNE/J&T/SiCepat...">
                                <datalist id="expList"><option value="JNE"><option value="J&T"><option value="SiCepat"></datalist>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="small font-weight-bold text-dark">Ongkir (Rp)</label>
                                <input type="number" name="ongkir" class="form-control rounded-pill" x-model.number="ongkir">
                            </div>
                        </div>

                        {{-- SEKSI: BOX RINCIAN PEMBAYARAN KREATIF + LOGIKA PROMO --}}
                        <div class="summary-box p-3 rounded-lg mb-4 shadow-sm">
                            <h6 class="font-weight-bold text-primary mb-3"><i class="fas fa-calculator mr-2"></i>Rincian Pembayaran</h6>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted small">Total Harga Buku:</span>
                                <span class="font-weight-bold text-dark">Rp<span x-text="formatRupiah(calculateTotalBuku())">0</span></span>
                            </div>
                            <div class="d-flex justify-content-between mb-2" x-show="discountAmount > 0">
                                <span class="text-danger small">Potongan Promo (<span x-text="promoCodeApplied"></span>):</span>
                                <span class="font-weight-bold text-danger">- Rp<span x-text="formatRupiah(discountAmount)">0</span></span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span class="text-muted small">Biaya Ongkos Kirim:</span>
                                <span class="font-weight-bold text-dark">Rp<span x-text="formatRupiah(ongkir)">0</span></span>
                            </div>
                            <hr class="my-2 border-top">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="font-weight-bold text-dark">Grand Total Tagihan:</span>
                                <span class="h5 font-weight-bold text-success mb-0">Rp<span x-text="formatRupiah(calculateGrandTotal())">0</span></span>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 btn-lg shadow rounded-pill font-weight-bold">
                            SIMPAN INVOICE PESANAN
                        </button>
                    </div>
                </div>
            </form>
        </div>

        {{-- DAFTAR INVOICE TERBARU (KANAN) --}}
        <div class="col-lg-4">
            <div class="card shadow-sm border-0 rounded-lg overflow-hidden">
                <div class="card-header bg-gradient-primary py-3">
                    <h6 class="m-0 font-weight-bold text-white"><i class="fas fa-history mr-2"></i>Invoice Terbaru</h6>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead class="bg-light small">
                                <tr>
                                    <th class="px-3 border-0 text-dark">Customer</th>
                                    <th class="text-end px-3 border-0 text-dark">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($invoices as $inv)
                                    <tr>
                                        <td class="px-3 py-2">
                                            <span class="font-weight-bold text-dark text-truncate-custom" title="{{ $inv->nama_pembeli }}">{{ $inv->nama_pembeli }}</span>
                                            <div class="mt-1"><small class="text-muted">#{{ $inv->no_invoice }}</small></div>
                                            <div class="mt-1">
                                                @if($inv->status == 'Lunas')
                                                    <span class="badge bg-success" style="font-size: 9px; padding: 3px 6px;">LUNAS</span>
                                                @else
                                                    <span class="badge bg-warning text-dark" style="font-size: 9px; padding: 3px 6px;">PENDING</span>
                                                @endif
                                            </div>
                                        </td>
                                        <td class="text-end px-3">
                                            <div class="font-weight-bold text-primary mb-2" style="font-size: 0.95rem;">
                                                Rp{{ number_format($inv->total_tagihan, 0, ',', '.') }}
                                            </div>
                                            <div class="d-flex justify-content-end gap-1">
                                                @if($inv->status != 'Lunas' && $inv->status != 'Cancelled')
                                                <form action="{{ route('marketing.invoice.lunas', $inv->id) }}" method="POST">
                                                    @csrf
                                                    <button type="submit" class="btn btn-xs btn-success text-white shadow-sm" title="Tandai Lunas" onclick="return confirm('Apakah pesanan ini sudah dibayar lunas?')">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                </form>
                                                @endif

                                                @if($inv->status != 'Cancelled')
                                                <form action="{{ route('marketing.invoice.hapus', $inv->id) }}" method="POST">
                                                    @csrf @method('DELETE')
                                                    <button type="submit" class="btn btn-xs btn-outline-danger shadow-sm" title="Batalkan/Hapus" onclick="return confirm('Apakah Anda yakin ingin membatalkan invoice ini?')">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                                @endif
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="2" class="text-center py-5 text-muted small">
                                            <i class="fas fa-inbox fa-2x mb-2 d-block text-gray-300"></i>
                                            Belum ada invoice pending hari ini
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
            items: [{ buku_id: '', qty: 1, harga: 0 }],

            // State Promo Tambahan
            promoCode: '',
            promoCodeApplied: '',
            promoStatus: '',
            promoMessage: '',
            discountType: 'nominal',
            discountValue: 0,
            discountAmount: 0,

            addItem() {
                this.items.push({ buku_id: '', qty: 1, harga: 0 });
            },

            removeItem(index) {
                if(this.items.length > 1) this.items.splice(index, 1);
                this.recalculateDiscount();
            },

            updateHarga(index, event) {
                const selectedOption = event.target.options[event.target.selectedIndex];
                const harga = parseFloat(selectedOption.getAttribute('data-harga')) || 0;
                this.items[index].harga = harga;
                this.items[index].buku_id = event.target.value;
                this.recalculateDiscount();
            },

            async applyPromo() {
                if (!this.promoCode.trim()) {
                    this.promoStatus = 'error';
                    this.promoMessage = 'Masukkan kode promo terlebih dahulu.';
                    return;
                }

                try {
                    // Panggilan AJAX Fetch API mengarah ke named route baru yang sudah diletakkan di dalam prefix marketing
                    let response = await fetch(`/marketing/check-promo/${this.promoCode.toUpperCase()}`);
                    let data = await response.json();

                    if (data.status === 'success') {
                        this.promoStatus = 'success';
                        this.promoMessage = `Berhasil! Diskon ${data.type === 'percentage' ? data.value + '%' : 'Rp' + this.formatRupiah(data.value)} diterapkan.`;
                        this.discountType = data.type;
                        this.discountValue = data.value;
                        this.promoCodeApplied = this.promoCode.toUpperCase();
                        this.recalculateDiscount();
                    } else {
                        this.promoStatus = 'error';
                        this.promoMessage = data.message;
                        this.resetPromo();
                    }
                } catch (error) {
                    this.promoStatus = 'error';
                    this.promoMessage = 'Gagal memeriksa kode promo.';
                    this.resetPromo();
                }
            },

            recalculateDiscount() {
                let totalBuku = this.calculateTotalBuku();
                if (this.discountType === 'percentage') {
                    this.discountAmount = (totalBuku * this.discountValue) / 100;
                } else {
                    this.discountAmount = Math.min(this.discountValue, totalBuku);
                }
            },

            resetPromo() {
                this.discountType = 'nominal';
                this.discountValue = 0;
                this.discountAmount = 0;
                this.promoCodeApplied = '';
            },

            calculateTotalBuku() {
                return this.items.reduce((sum, item) => sum + (item.qty * item.harga), 0);
            },

            calculateGrandTotal() {
                this.recalculateDiscount();
                let total = this.calculateTotalBuku() - this.discountAmount + (Number(this.ongkir) || 0);
                return Math.max(0, total);
            },

            formatRupiah(angka) {
                return new Intl.NumberFormat('id-ID').format(angka);
            }
        }));
    });

    $(document).ready(function() {
        $('#select_pembeli').select2({
            theme: 'bootstrap4',
            width: '100%',
            placeholder: '-- Cari Nama --'
        });
    });
</script>
@endsection
