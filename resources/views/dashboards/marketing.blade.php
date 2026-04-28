@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<div class="container-fluid py-4" x-data="orderSystem()">
    <div class="d-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800 font-weight-bold">SAPA-ALL Marketing</h1>
        <span class="badge badge-primary shadow-sm p-2 px-3 rounded-pill">{{ date('d F Y') }}</span>
    </div>

    @if(session('success'))
        <div class="alert alert-success border-0 shadow-sm alert-dismissible fade show">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
            <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
        </div>
    @endif

    <div class="row">
        {{-- FORM BUAT PESANAN --}}
        <div class="col-lg-8">
            <form action="{{ route('mad.kirim-buku') }}" method="POST">
                @csrf
                <div class="card shadow-sm border-0 rounded-lg mb-4">
                    <div class="card-header bg-white py-3">
                        <h6 class="m-0 font-weight-bold text-primary"><i class="fas fa-shopping-basket mr-2"></i>Informasi Pesanan</h6>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label class="small font-weight-bold">Tanggal Pesan</label>
                                <input type="date" name="tanggal_pesan" class="form-control rounded-pill" value="{{ date('Y-m-d') }}" required>
                            </div>
                            <div class="col-md-4">
                                <label class="small font-weight-bold">Via (Channel)</label>
                                <input type="text" name="via" class="form-control rounded-pill" list="viaList" placeholder="Tokopedia/Shopee/WA...">
                                <datalist id="viaList">
                                    <option value="Tokopedia"><option value="Shopee"><option value="WhatsApp"><option value="Event">
                                </datalist>
                            </div>
                            <div class="col-md-4">
                                <label class="small font-weight-bold text-danger">Kode Promo</label>
                                <input type="text" name="promo_code" class="form-control rounded-pill" placeholder="DISKON10">
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
                            <div class="custom-control custom-switch">
                                <input type="checkbox" class="custom-control-input" id="samaPenerima" name="samaPenerima" x-model="samaPenerima">
                                <label class="custom-control-label font-weight-bold" for="samaPenerima">Penerima sama dengan pembeli</label>
                            </div>
                            <div x-show="!samaPenerima" x-transition class="mt-3">
                                <input type="text" name="nama_penerima" class="form-control mb-2 rounded-pill" placeholder="Nama Penerima">
                                <textarea name="alamat_penerima" class="form-control rounded" rows="2" placeholder="Alamat Pengiriman"></textarea>
                            </div>
                        </div>

                        <h6 class="font-weight-bold text-dark mb-3"><i class="fas fa-book mr-2"></i>Daftar Buku</h6>
                        <table class="table table-sm borderless">
                            <tbody>
                                <template x-for="(item, index) in items" :key="index">
                                    <tr>
                                        <td>
                                            <select :name="'buku_id['+index+']'" class="form-control border-0 shadow-sm" required>
                                                <option value="">-- Pilih Buku --</option>
                                                @foreach($books as $b)
                                                    <option value="{{ $b->id }}">{{ $b->judul }}</option>
                                                @endforeach
                                            </select>
                                        </td>
                                        <td width="100">
                                            <input type="number" :name="'qty['+index+']'" class="form-control text-center shadow-sm" min="1" x-model="item.qty">
                                        </td>
                                        <td width="50">
                                            <button type="button" @click="removeItem(index)" class="btn btn-sm text-danger"><i class="fas fa-minus-circle"></i></button>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                        <button type="button" @click="addItem()" class="btn btn-sm btn-outline-primary rounded-pill px-3">+ Tambah Buku</button>

                        <hr class="my-4">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="small font-weight-bold">Ekspedisi</label>
                                <input type="text" name="ekspedisi" class="form-control rounded-pill" list="expList">
                                <datalist id="expList"><option value="JNE"><option value="J&T"><option value="SiCepat"></datalist>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="small font-weight-bold">Ongkir</label>
                                <input type="number" name="ongkir" class="form-control rounded-pill" value="0">
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary btn-block btn-lg shadow rounded-pill mt-3 font-weight-bold">SIMPAN INVOICE</button>
                    </div>
                </div>
            </form>
        </div>

        {{-- DAFTAR INVOICE (DI SINI TOMBOLNYA AKAN MUNCUL) --}}
        <div class="col-lg-4">
            <div class="card shadow-sm border-0 rounded-lg overflow-hidden">
                <div class="card-header bg-gradient-primary py-3">
                    <h6 class="m-0 font-weight-bold text-white"><i class="fas fa-history mr-2"></i>Invoice Terakhir</h6>
                </div>
                <div class="card-body p-0">
                    <table class="table table-hover mb-0">
                        <thead class="bg-light small">
                            <tr>
                                <th class="px-3">Customer</th>
                                <th class="text-right px-3">Total & Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($invoices as $inv)
                                <tr>
                                    <td class="px-3">
                                        <div class="font-weight-bold text-dark text-truncate" style="max-width: 140px;">{{ $inv->nama_agen }}</div>
                                        <small class="text-muted">#{{ $inv->no_invoice }}</small>
                                        @if($inv->status == 'Lunas')
                                            <span class="badge badge-success" style="font-size: 9px;">Lunas</span>
                                        @else
                                            <span class="badge badge-warning" style="font-size: 9px;">Pending</span>
                                        @endif
                                    </td>
                                    <td class="text-right px-3 align-middle">
                                        <div class="font-weight-bold text-primary mb-1">Rp{{ number_format($inv->total_tagihan, 0, ',', '.') }}</div>

                                        <div class="d-flex justify-content-end">
                                            {{-- TOMBOL LUNAS --}}
                                            @if($inv->status != 'Lunas')
                                            <form action="{{ route('mad.tandai-lunas', $inv->id) }}" method="POST" class="mr-1">
                                                @csrf
                                                <button type="submit" class="btn btn-xs btn-success p-1 px-2 rounded-pill shadow-sm" title="Tandai Lunas" onclick="return confirm('Sudah bayar?')">
                                                    <i class="fas fa-check-circle" style="font-size: 11px;"></i>
                                                </button>
                                            </form>
                                            @endif

                                            {{-- TOMBOL HAPUS --}}
                                            <form action="{{ route('mad.hapus-invoice', $inv->id) }}" method="POST">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="btn btn-xs btn-danger p-1 px-2 rounded-pill shadow-sm" title="Hapus" onclick="return confirm('Hapus invoice?')">
                                                    <i class="fas fa-trash" style="font-size: 11px;"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr><td colspan="2" class="text-center py-4 text-muted">Belum ada data</td></tr>
                            @endforelse
                        </tbody>
                    </table>
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
        $('#select_pembeli').select2({ theme: 'bootstrap4' });
    });
</script>

<style>
    .bg-gradient-primary { background: linear-gradient(180deg, #4e73df 10%, #224abe 100%); }
    .rounded-lg { border-radius: 1rem !important; }
    .borderless td, .borderless th { border: none; }
    .btn-xs { padding: 0.1rem 0.3rem; font-size: 0.7rem; line-height: 1.5; border-radius: 0.2rem; }
</style>
@endsection
