@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<style>
    /* Memberikan ruang agar konten tidak menabrak navbar */
    .marketing-page {
        padding-top: 1rem;
        padding-left: 1.5rem;  /* Menyelaraskan dengan container-fluid navbar */
        padding-right: 1.5rem;
    }

    .bg-gradient-primary {
        background: linear-gradient(180deg, #4e73df 10%, #224abe 100%);
    }

    .rounded-lg { border-radius: 1rem !important; }

    .borderless td, .borderless th { border: none; }

    .btn-xs {
        padding: 0.1rem 0.4rem;
        font-size: 0.75rem;
        line-height: 1.5;
        border-radius: 50px;
    }

    /* Memastikan card terlihat bagus di dark mode */
    [data-bs-theme="dark"] .card-header {
        background-color: #2b2b2b !important;
        border-bottom: 1px solid #444;
    }

    .text-truncate-custom {
        max-width: 120px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
    }

    /* Style adaptif khusus untuk Box Tanggal tanpa menabrak CSS global */
    .custom-date-box {
        display: inline-block;
        background-color: #f8f9fa !important;
        color: #212529 !important; /* Dipaksa hitam pekat di light mode */
        border: 1px solid #ced4da !important;
        font-size: 0.75rem;
    }

    /* Otomatis berubah saat mendeteksi sistem Dark Mode */
    [data-bs-theme="dark"] .custom-date-box {
        background-color: #2b2b2b !important;
        color: #ffffff !important;
        border: 1px solid #444444 !important;
    }
</style>

<div class="container-fluid marketing-page" x-data="orderSystem()">
    {{-- HEADER HALAMAN --}}
    <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap">
        <div class="mb-2">
            <h1 class="h3 mb-0 text-gray-800 font-weight-bold">SAPA-ALL Marketing</h1>
            <p class="text-muted small mb-0">Input pesanan dan kelola invoice pelanggan</p>
        </div>
        <div class="text-right d-none d-sm-block">
            <div class="custom-date-box shadow-sm p-2 px-3 rounded-pill font-weight-bold">
                <i class="far fa-calendar-alt mr-1 text-primary"></i> {{ date('d F Y') }}
            </div>
        </div>
    </div>

    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm alert-dismissible fade show">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="row">
        {{-- FORM BUAT PESANAN --}}
        <div class="col-lg-8">
            <form action="{{ route('marketing.order.store') }}" method="POST">
                @csrf
                <div class="card shadow-sm border-0 rounded-lg mb-4">
                    <div class="card-header bg-white py-3">
                        <h6 class="m-0 font-weight-bold text-primary">
                            <i class="fas fa-shopping-basket mr-2"></i>Informasi Pesanan
                        </h6>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="small font-weight-bold">Tanggal Pesan</label>
                                <input type="date" name="tanggal_pesan" class="form-control rounded-pill" value="{{ date('Y-m-d') }}" required>
                            </div>
                            <div class="col-md-4">
                                <label class="small font-weight-bold">Via (Channel)</label>
                                <input type="text" name="via" class="form-control rounded-pill" list="viaList" placeholder="Tokopedia/Shopee...">
                                <datalist id="viaList">
                                    <option value="Tokopedia"><option value="Shopee"><option value="WhatsApp"><option value="Event">
                                </datalist>
                            </div>
                            <div class="col-md-4">
                                <label class="small font-weight-bold text-danger">Kode Promo</label>
                                <input type="text" name="promo_code" class="form-control rounded-pill" placeholder="Opsional">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="small font-weight-bold text-primary">Nama Pembeli (Agen/Member)</label>
                            <select name="nama_agen" id="select_pembeli" class="form-control" required>
                                <option value="">-- Cari Nama --</option>
                                @foreach($identitas as $idnt)
                                    <option value="{{ $idnt->nama_lengkap }}">{{ $idnt->nama_lengkap }}</option>
                                @endforeach
                            </select>
                        </div>

                        <div class="bg-light p-3 rounded-lg mb-4 border shadow-sm">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" id="samaPenerima" x-model="samaPenerima">
                                <label class="form-check-label font-weight-bold" for="samaPenerima">Penerima sama dengan pembeli</label>
                            </div>
                            <div x-show="!samaPenerima" x-transition class="mt-3">
                                <input type="text" name="nama_penerima" class="form-control mb-2 rounded-pill" placeholder="Nama Lengkap Penerima">
                                <textarea name="alamat_penerima" class="form-control rounded" rows="2" placeholder="Alamat Lengkap Pengiriman..."></textarea>
                            </div>
                        </div>

                        <h6 class="font-weight-bold text-dark mb-3"><i class="fas fa-book mr-2"></i>Daftar Buku</h6>
                        <div class="table-responsive">
                            <table class="table table-sm borderless">
                                <tbody>
                                    <template x-for="(item, index) in items" :key="index">
                                        <tr>
                                            <td>
                                                <select :name="'buku_id['+index+']'" class="form-select border-0 shadow-sm" required style="background-color: #f8f9fa;">
                                                    <option value="">-- Pilih Buku --</option>
                                                    @foreach($books as $b)
                                                        <option value="{{ $b->id }}">{{ $b->judul }}</option>
                                                    @endforeach
                                                </select>
                                            </td>
                                            <td width="120">
                                                <input type="number" :name="'qty['+index+']'" class="form-control text-center shadow-sm" min="1" x-model="item.qty">
                                            </td>
                                            <td width="50" class="text-center align-middle">
                                                <button type="button" @click="removeItem(index)" class="btn btn-link text-danger p-0" x-show="items.length > 1">
                                                    <i class="fas fa-minus-circle fa-lg"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>
                        </div>
                        <button type="button" @click="addItem()" class="btn btn-sm btn-outline-primary rounded-pill px-3 mt-2">
                            <i class="fas fa-plus mr-1"></i> Tambah Item
                        </button>

                        <hr class="my-4">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="small font-weight-bold">Ekspedisi</label>
                                <input type="text" name="ekspedisi" class="form-control rounded-pill" list="expList" placeholder="JNE/J&T...">
                                <datalist id="expList"><option value="JNE"><option value="J&T"><option value="SiCepat"></datalist>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="small font-weight-bold">Ongkir (Rp)</label>
                                <input type="number" name="ongkir" class="form-control rounded-pill" value="0">
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 btn-lg shadow rounded-pill mt-3 font-weight-bold">
                            SIMPAN INVOICE
                        </button>
                    </div>
                </div>
            </form>
        </div>

        {{-- SEKSI KANAN: DAFTAR INVOICE --}}
        <div class="col-lg-4">
            <div class="card shadow-sm border-0 rounded-lg overflow-hidden">
                <div class="card-header bg-gradient-primary py-3">
                    <h6 class="m-0 font-weight-bold text-white"><i class="fas fa-history mr-2"></i>Invoice Terbaru</h6>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="bg-light small">
                                <tr>
                                    <th class="px-3 border-0">Customer</th>
                                    <th class="text-end px-3 border-0">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($invoices as $inv)
                                    <tr>
                                        <td class="px-3">
                                            <div class="font-weight-bold text-dark text-truncate-custom">{{ $inv->nama_agen }}</div><br>
                                            <small class="text-muted">#{{ $inv->no_invoice }}</small>
                                            @if($inv->status == 'Lunas')
                                                <span class="badge bg-success p-1" style="font-size: 8px;">LUNAS</span>
                                            @else
                                                <span class="badge bg-warning p-1 text-dark" style="font-size: 8px;">PENDING</span>
                                            @endif
                                        </td>
                                        <td class="text-end px-3 align-middle">
                                            <div class="font-weight-bold text-primary mb-2">Rp{{ number_format($inv->total_tagihan, 0, ',', '.') }}</div>
                                            <div class="d-flex justify-content-end gap-1">
                                                @if($inv->status != 'Lunas')
                                                <form action="{{ route('marketing.invoice.lunas', $inv->id) }}" method="POST">
                                                    @csrf
                                                    <button type="submit" class="btn btn-xs btn-success shadow-sm" onclick="return confirm('Sudah lunas?')">
                                                        <i class="fas fa-check"></i>
                                                    </button>
                                                </form>
                                                @endif

                                                <form action="{{ route('marketing.invoice.hapus', $inv->id) }}" method="POST">
                                                    @csrf @method('DELETE')
                                                    <button type="submit" class="btn btn-xs btn-outline-danger shadow-sm" onclick="return confirm('Hapus?')">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr><td colspan="2" class="text-center py-5 text-muted">Belum ada invoice</td></tr>
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
            items: [{ buku_id: '', qty: 1 }],
            addItem() { this.items.push({ buku_id: '', qty: 1 }); },
            removeItem(index) { if(this.items.length > 1) this.items.splice(index, 1); }
        }));
    });

    $(document).ready(function() {
        $('#select_pembeli').select2({
            theme: 'bootstrap4',
            width: '100%'
        });
    });
</script>
@endsection
