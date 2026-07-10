@extends('layouts.app')

@section('content')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer></script>

<style>
    .marketing-page { padding: 1.5rem; }
    .card-header.bg-white { background-color: #ffffff !important; color: #4e73df !important; border-bottom: 1px solid #e3e6f0 !important; }
    .bg-gradient-primary { background: linear-gradient(180deg, #4e73df 10%, #224abe 100%) !important; }
    .rounded-lg { border-radius: 0.75rem !important; }
    .borderless td, .borderless th { border: none !important; }
    .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.75rem; line-height: 1; border-radius: 0.35rem; }
    .text-truncate-custom { max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
    .blink-warning { animation: blink 1s infinite; }
    [x-cloak] { display: none !important; }
</style>

<div class="container-fluid marketing-page" x-data="orderForm()">
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show shadow-sm border-left-success rounded-lg" role="alert">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show shadow-sm border-left-danger rounded-lg" role="alert">
            <i class="fas fa-exclamation-triangle mr-2"></i> {{ session('error') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
    @endif

    @if ($errors->any())
        <div class="alert alert-danger alert-dismissible fade show shadow-sm border-left-danger rounded-lg" role="alert">
            <h5 class="alert-heading font-weight-bold"><i class="fas fa-ban mr-2"></i> Mohon Periksa Inputan Anda:</h5>
            <ul class="mb-0 pl-4">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        </div>
    @endif

    <div class="row">
        <div class="col-lg-8 mb-4">
            <div class="card shadow border-0 rounded-lg">
                <div class="card-header bg-white py-3 d-flex align-items-center justify-content-between">
                    <h5 class="m-0 font-weight-bold text-primary"><i class="fas fa-shopping-cart mr-2"></i>Input Pesanan Baru</h5>
                    <a href="{{ route('marketing.promo.index') }}" class="btn btn-sm btn-outline-primary font-weight-bold rounded-pill shadow-sm">
                        <i class="fas fa-ticket-alt mr-1"></i> Lihat / Kelola Promo
                    </a>
                </div>
                <div class="card-body">
                    <form action="{{ route('marketing.order.store') }}" method="POST" id="mainOrderForm">
                        @csrf

                        <div class="row mb-3">
                            <div class="col-md-6 mb-2">
                                <label class="small font-weight-bold text-dark">Nama Agen / Pembeli <span class="text-danger">*</span></label>

                            <select name="nama_agen" id="select_pembeli" class="form-control select2" required>
                            <option value="">-- Pilih Agen / Pembeli --</option>
                            @foreach($identitas as $idnt)
                                <option value="{{ $idnt->nama_lengkap }}" {{ old('nama_agen') == $idnt->nama_lengkap ? 'selected' : '' }}>
                                    {{ $idnt->nama_lengkap }}
                                </option>
                            @endforeach
                            </select>
                        </div>
                            <div class="col-md-6 mb-2">
                                <label class="small font-weight-bold text-dark">Tanggal Pesan <span class="text-danger">*</span></label>
                                <input type="date" name="tanggal_pesan" class="form-control" value="{{ old('tanggal_pesan', date('Y-m-d')) }}" required>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-4 mb-2">
                                <label class="small font-weight-bold text-dark">Via / Platform</label>
                                <select name="via" class="form-control">
                                    <option value="WhatsApp" {{ old('via') == 'WhatsApp' ? 'selected' : '' }}>WhatsApp</option>
                                    <option value="Tokopedia" {{ old('via') == 'Tokopedia' ? 'selected' : '' }}>Tokopedia</option>
                                    <option value="Shopee" {{ old('via') == 'Shopee' ? 'selected' : '' }}>Shopee</option>
                                    <option value="TikTok Shop" {{ old('via') == 'TikTok Shop' ? 'selected' : '' }}>TikTok Shop</option>
                                    <option value="Offline" {{ old('via') == 'Offline' ? 'selected' : '' }}>Offline / Datang Langsung</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-2">
                                <label class="small font-weight-bold text-dark">Ekspedisi / Kurir</label>
                                <input type="text" name="ekspedisi" class="form-control" placeholder="J&T, JNE, SiCepat, dll." value="{{ old('ekspedisi') }}">
                            </div>
                            <div class="col-md-4 mb-2">
                                <label class="small font-weight-bold text-dark">Ongkos Kirim (Rp)</label>
                                <input type="number" name="ongkir" class="form-control" x-model.number="ongkir" placeholder="0">
                            </div>
                        </div>

                        <div class="card bg-light border-0 p-3 mb-4 rounded-lg">
                            <div class="custom-control custom-checkbox mb-2">
                                <input type="checkbox" class="custom-control-input" id="sama_penerima" name="sama_penerima" value="1" x-model="samaPenerima" @change="toggleAlamatSama()">
                                <label class="custom-control-label small font-weight-bold text-primary" for="sama_penerima">Penerima & Alamat sama dengan Data Agen/Pembeli</label>
                            </div>

                            <div class="row" x-show="!samaPenerima" x-transition x-cloak>
                                <div class="col-md-12 mb-2">
                                    <label class="small font-weight-bold text-dark">Nama Penerima</label>
                                    <input type="text" name="nama_penerima" class="form-control" placeholder="Nama lengkap penerima barang" value="{{ old('nama_penerima') }}">
                                </div>
                                <div class="col-md-12">
                                    <label class="small font-weight-bold text-dark">Alamat Pengiriman</label>
                                    <textarea name="alamat_penerima" id="alamat_penerima_manual" class="form-control" rows="2" placeholder="Alamat lengkap tujuan pengiriman..." x-model="alamatManual"></textarea>
                                </div>
                            </div>

                            <div class="p-2 border rounded bg-white" x-show="samaPenerima" x-transition>
                                <span class="small text-muted d-block font-weight-bold text-uppercase">Alamat Agen Terbaca Otomatis:</span>
                                <span class="small font-weight-bold text-dark" x-text="alamatAgenAuto ? alamatAgenAuto : 'Memilih agen akan otomatis memuat alamat di sini...'"></span>
                                <input type="hidden" name="alamat_penerima" id="alamat_penerima_auto" x-bind:value="alamatAgenAuto" :disabled="!samaPenerima">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="small font-weight-bold text-dark"><i class="fas fa-sticky-note mr-1"></i> Keterangan Order</label>
                            <textarea name="keterangan_order" class="form-control" rows="2" placeholder="Tambahkan catatan khusus mengenai pesanan/transaksi ini..."></textarea>
                        </div>

                        <div class="border rounded-lg overflow-hidden bg-white shadow-sm mb-4">
                            <table class="table mb-0">
                                <thead class="bg-gradient-primary text-white text-center small font-weight-bold">
                                    <tr>
                                        <th style="width: 32%;">Pilih Judul Buku</th>
                                        <th style="width: 20%;">Jumlah (QTY)</th>
                                        <th style="width: 26%;">Kode Promo Per Buku</th>
                                        <th style="width: 17%;">Subtotal</th>
                                        <th style="width: 5%;"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="(item, index) in items" :key="index">
                                        <tr class="align-middle">
                                            <td class="p-2">
                                                <select :name="'buku_id['+index+']'" class="form-control form-control-sm" x-model="item.buku_id" @change="updateBookData(item)" :disabled="item.isLocked" required>
                                                    <option value="">-- Pilih Buku --</option>
                                                    @foreach($books as $bk)
                                                        <option value="{{ $bk->id }}" data-harga="{{ $bk->stok_gudang <= 0 ? 0 : ($bk->harga_jual ?? $bk->harga ?? 0) }}" data-stok="{{ $bk->stok_gudang ?? 0 }}">
                                                            {{ $bk->judul }}
                                                        </option>
                                                    @endforeach
                                                </select>
                                                <input type="hidden" :name="'buku_id['+index+']'" x-model="item.buku_id" x-show="item.isLocked">
                                            </td>

                                            <td class="p-2">
                                                <div class="d-flex align-items-center mb-1">
                                                    <input type="number" :name="'qty['+index+']'" class="form-control form-control-sm text-center" min="1" style="min-width: 65px;" x-model.number="item.qty" @input="calculateItemSubtotal(item)" :readonly="item.isLocked" required>
                                                    <span class="ml-2 small font-weight-bold text-muted">Pcs</span>
                                                </div>
                                                <div x-show="item.buku_id" x-transition x-cloak>
                                                    <span class="badge" :class="item.stok <= 5 ? 'badge-danger blink-warning' : 'badge-success'">
                                                        <i class="fas" :class="item.stok <= 5 ? 'fa-exclamation-circle' : 'fa-check'"></i> Stok: <span x-text="item.stok"></span> pcs
                                                    </span>
                                                </div>
                                            </td>

                                            <td class="p-2">
                                                <div class="input-group input-group-sm mb-1">
                                                    <input type="text" :name="'item_promo_code['+index+']'" class="form-control text-uppercase" placeholder="KUPON" x-model="item.promoCode" :readonly="item.isLocked">
                                                    <div class="input-group-append">
                                                        <button class="btn btn-primary" type="button" @click="checkItemPromo(item)" x-show="!item.isLocked"><i class="fas fa-ticket-alt"></i></button>
                                                        <button class="btn btn-danger" type="button" @click="resetItemPromo(item)" x-show="item.isLocked" x-cloak><i class="fas fa-times"></i></button>
                                                    </div>
                                                </div>
                                                <input type="hidden" :name="'item_discount['+index+']'" x-model="item.discountAmount">
                                                <span class="d-block text-xs font-weight-bold" :class="item.promoStatus === 'success' ? 'text-success' : 'text-danger'" x-text="item.promoMessage" x-show="item.promoMessage" x-cloak></span>
                                            </td>

                                            <td class="p-2 text-right font-weight-bold text-dark font-mono bg-light">
                                                Rp <span x-text="formatRupiah(item.subtotal)">0</span>
                                            </td>

                                            <td class="p-2 text-center">
                                                <button type="button" class="btn btn-outline-danger btn-xs" @click="removeItem(index)" :disabled="items.length === 1">
                                                    <i class="fas fa-trash-alt"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    </template>
                                </tbody>
                            </table>

                            <div class="p-2 bg-light border-top d-flex justify-content-between">
                                <button type="button" class="btn btn-primary btn-sm rounded-pill font-weight-bold px-3" @click="addItem()">
                                    <i class="fas fa-plus mr-1"></i> Tambah Item Buku
                                </button>
                            </div>
                        </div>

                        <div class="row justify-content-end">
                            <div class="col-md-6">
                                <div class="card border-left-primary shadow-sm bg-light mb-4">
                                    <div class="card-body p-3">
                                        <table class="table table-sm borderless mb-0 text-dark font-weight-bold small">
                                            <tr>
                                                <td>Subtotal Kotor Buku:</td>
                                                <td class="text-right font-mono">Rp <span x-text="formatRupiah(calculateTotalBukuKotor())">0</span></td>
                                            </tr>
                                            <tr class="text-success">
                                                <td>Total Hemat (Diskon):</td>
                                                <td class="text-right font-mono">- Rp <span x-text="formatRupiah(calculateTotalSemuaDiskon())">0</span></td>
                                            </tr>
                                            <tr>
                                                <td>Ongkos Kirim:</td>
                                                <td class="text-right font-mono">Rp <span x-text="formatRupiah(ongkir || 0)">0</span></td>
                                            </tr>
                                            <tr class="border-top text-primary h5 font-weight-bold">
                                                <td class="pt-2">GRAND TOTAL:</td>
                                                <td class="text-right pt-2 font-mono">Rp <span x-text="formatRupiah(calculateGrandTotal())">0</span></td>
                                            </tr>
                                        </table>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-success btn-block btn-lg font-weight-bold shadow rounded-pill">
                                    <i class="fas fa-save mr-2"></i>Simpan & Potong Stok
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <div class="col-lg-4 mb-4" x-data="{
            selectedInvoice: null,
            isLoading: false,
            openQuickView(id) {
                this.isLoading = true;
                this.selectedInvoice = null;

                const modalEl = document.getElementById('modalQuickView');
                if (window.bootstrap && window.bootstrap.Modal) {
                    const modalInst = new bootstrap.Modal(modalEl);
                    modalInst.show();
                } else {
                    modalEl.classList.add('show');
                    modalEl.style.display = 'block';
                    document.body.classList.add('modal-open');

                    let backdrop = document.getElementById('modal-backdrop-qv');
                    if(!backdrop){
                        backdrop = document.createElement('div');
                        backdrop.className = 'modal-backdrop fade show';
                        backdrop.id = 'modal-backdrop-qv';
                        document.body.appendChild(backdrop);
                    }
                }

                fetch('{{ url('/marketing/invoice') }}/' + id + '/detail')
                    .then(res => {
                        if (!res.ok) throw res;
                        return res.json();
                    })
                    .then(res => {
                        if(res.status === 'success') {
                            this.selectedInvoice = res.data;
                        } else {
                            alert('Gagal memuat detail invoice: ' + res.message);
                            this.closeModalVanilla();
                        }
                        this.isLoading = false;
                    })
                    .catch(async (err) => {
                        let errMsg = 'Gagal menyambung ke server.';
                        try {
                            const jsonErr = await err.json();
                            if(jsonErr.message) errMsg = jsonErr.message;
                        } catch(e){}
                        alert('Gagal memuat detail invoice: ' + errMsg);
                        this.isLoading = false;
                        this.closeModalVanilla();
                    });
            },
            closeModalVanilla() {
                const modalEl = document.getElementById('modalQuickView');
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrop = document.getElementById('modal-backdrop-qv');
                if(backdrop) backdrop.remove();
            },
            formatRupiah(angka) {
                return new Intl.NumberFormat('id-ID').format(angka);
            }
        }">
            <div class="card shadow border-0 rounded-lg">
                <div class="card-header bg-white py-3">
                    <h5 class="m-0 font-weight-bold text-primary"><i class="fas fa-clock mr-2"></i>Invoice Belum Pelunasan</h5>
                </div>
                <div class="card-body p-0" style="max-height: 680px; overflow-y: auto;">
                    @if($invoices->isEmpty())
                        <div class="text-center py-5">
                            <img src="https://illustrations.popsy.co/blue/shaking-hands.svg" style="width: 120px;" class="mb-3">
                            <p class="text-muted small font-weight-bold px-3">Semua nota terhitung rapi dan bersih. Tidak ada tagihan pending!</p>
                        </div>
                    @else
                        <div class="list-group list-group-flush">
                            @foreach($invoices as $inv)
                                <div class="list-group-item list-group-item-action p-3 border-bottom">
                                    <div class="d-flex w-100 justify-content-between align-items-center mb-2">
                                        <span class="badge badge-warning font-weight-bold text-uppercase px-2 py-1"><i class="fas fa-exclamation-circle mr-1"></i>{{ $inv->status ?? 'Pending' }}</span>
                                        <small class="font-weight-bold text-muted font-mono">{{ \Carbon\Carbon::parse($inv->tanggal_pesan)->format('d M Y') }}</small>
                                    </div>

                                    <h6 class="font-weight-bold mb-1 font-mono text-primary" style="cursor: pointer; text-decoration: underline;" @click="openQuickView({{ $inv->id }})">
                                        {{ $inv->no_invoice }}
                                    </h6>

                                    <p class="mb-1 text-xs font-weight-bold text-dark">
                                        <i class="fas fa-user-tie text-muted mr-1"></i> {{ $inv->nama_pembeli }}
                                        @if($inv->nama_penerima && $inv->nama_penerima != $inv->nama_pembeli)
                                            <span class="text-muted">➔ Ke:</span> {{ $inv->nama_penerima }}
                                        @endif
                                    </p>
                                    <p class="mb-2 text-xs text-muted text-truncate-custom"><i class="fas fa-map-marker-alt mr-1"></i> {{ $inv->alamat_penerima }}</p>
                                    <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                                        <span class="text-xs font-weight-bold text-secondary">Tagihan:</span>
                                        <span class="font-weight-bold text-dark font-mono">Rp {{ number_format($inv->total_tagihan, 0, ',', '.') }}</span>
                                    </div>

                                    <div class="mt-3 d-flex gap-1 justify-content-end">
                                        <form action="{{ route('marketing.invoice.lunas', $inv->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Apakah Anda yakin invoice ini sudah lunas?')">
                                            @csrf
                                            <button type="submit" class="btn btn-success btn-xs font-weight-bold mr-1"><i class="fas fa-check mr-1"></i>Set Lunas</button>
                                        </form>
                                        <form action="{{ route('marketing.invoice.hapus', $inv->id) }}" method="POST" class="d-inline" onsubmit="return confirm('Membatalkan invoice akan mengembalikan stok buku. Lanjutkan?')">
                                            @csrf
                                            <button type="submit" class="btn btn-outline-danger btn-xs font-weight-bold"><i class="fas fa-ban mr-1"></i>Cancel</button>
                                        </form>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            </div>

            <div class="modal fade" id="modalQuickView" tabindex="-1" role="dialog" aria-hidden="true" style="background: rgba(0,0,0,0.4);">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content rounded-lg border-0 shadow">
                        <div class="modal-header bg-gradient-primary text-white">
                            <h5 class="modal-title font-weight-bold"><i class="fas fa-file-invoice mr-2"></i>Rincian Nota Cepat</h5>
                            <button type="button" class="close text-white" @click="closeModalVanilla()" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body p-4 text-dark">
                            <div class="text-center py-4" x-show="isLoading">
                                <div class="spinner-border text-primary" role="status"></div>
                                <p class="text-muted small font-weight-bold mt-2">Menjemput data...</p>
                            </div>

                            <div x-show="!isLoading && selectedInvoice" x-transition x-cloak>
                                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                    <div>
                                        <span class="small text-muted d-block font-weight-bold">NOMOR NOTA</span>
                                        <span class="h5 font-weight-bold text-primary font-mono" x-text="selectedInvoice?.no_invoice"></span>
                                    </div>
                                    <span class="badge badge-warning p-2 font-weight-bold text-uppercase" x-text="selectedInvoice?.status"></span>
                                </div>

                                <table class="table table-sm borderless small font-weight-bold mb-3 text-dark">
                                    <tr>
                                        <td style="width: 35%;" class="text-muted">Agen / Pembeli:</td>
                                        <td x-text="selectedInvoice?.nama_pembeli"></td>
                                    </tr>
                                    <tr>
                                        <td class="text-muted">Nama Penerima:</td>
                                        <td x-text="selectedInvoice?.nama_penerima"></td>
                                    </tr>
                                    <tr>
                                        <td class="text-muted">Alamat Kirim:</td>
                                        <td class="text-muted font-weight-normal" x-text="selectedInvoice?.alamat"></td>
                                    </tr>
                                    <tr>
                                        <td class="text-muted">Platform & Kurir:</td>
                                        <td><span x-text="selectedInvoice?.via"></span> Kurir (<span x-text="selectedInvoice?.ekspedisi"></span>)</td>
                                    </tr>
                                </table>

                                <div class="border rounded bg-light p-3 mb-3">
                                    <span class="d-block small font-weight-bold text-muted border-bottom pb-1 mb-2 text-uppercase"><i class="fas fa-book mr-1"></i> Item Buku Terpesan</span>
                                    <div class="d-flex justify-content-between align-items-center mb-1">
                                        <span class="font-weight-bold text-dark pr-3" x-text="selectedInvoice?.buku"></span>
                                        <span class="font-mono text-nowrap"><span x-text="selectedInvoice?.qty"></span> Pcs</span>
                                    </div>
                                    <div class="d-flex justify-content-between text-xs text-muted">
                                        <span>Harga Satuan:</span>
                                        <span class="font-mono">Rp <span x-text="formatRupiah(selectedInvoice?.harga_satuan)"></span></span>
                                    </div>
                                </div>

                                <div class="border-top pt-2">
                                    <div class="d-flex justify-content-between small font-weight-bold mb-1">
                                        <span class="text-muted">Ongkos Kirim:</span>
                                        <span class="font-mono text-dark">Rp <span x-text="formatRupiah(selectedInvoice?.ongkir)"></span></span>
                                    </div>
                                    <div class="d-flex justify-content-between h6 font-weight-bold text-primary mt-2">
                                        <span>TOTAL TAGIHAN:</span>
                                        <span class="font-mono">Rp <span x-text="formatRupiah(selectedInvoice?.total_tagihan)"></span></span>
                                    </div>
                                </div>

                                <div class="mt-3 bg-light p-2 rounded text-xs" x-show="selectedInvoice?.keterangan && selectedInvoice?.keterangan !== '-'">
                                    <span class="font-weight-bold text-muted d-block">Catatan Internal / Keterangan:</span>
                                    <span class="font-weight-normal text-secondary" x-text="selectedInvoice?.keterangan"></span>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer bg-light py-2">
                            <button type="button" class="btn btn-secondary btn-sm font-weight-bold rounded-pill" @click="closeModalVanilla()">Tutup</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('orderForm', () => ({
            items: [
                { buku_id: '', qty: 1, harga: 0, stok: 0, subtotal: 0, promoCode: '', promoApplied: false, isLocked: false, discountType: 'nominal', discountValue: 0, discountAmount: 0, promoStatus: '', promoMessage: '' }
            ],
            ongkir: '',
            samaPenerima: false,
            alamatAgenAuto: '',
            alamatManual: '',

            addItem() {
                this.items.push({
                    buku_id: '', qty: 1, harga: 0, stok: 0, subtotal: 0, promoCode: '', promoApplied: false, isLocked: false, discountType: 'nominal', discountValue: 0, discountAmount: 0, promoStatus: '', promoMessage: ''
                });
            },

            removeItem(index) {
                if (this.items.length > 1) {
                    this.items.splice(index, 1);
                }
            },

            updateBookData(item) {
                const selectEl = event.target;
                const selectedOption = selectEl.options[selectEl.selectedIndex];

                if (selectedOption && selectEl.value !== '') {
                    item.harga = Number(selectedOption.dataset.harga) || 0;
                    item.stok = Number(selectedOption.dataset.stok) || 0;
                } else {
                    item.harga = 0;
                    item.stok = 0;
                }

                this.calculateItemSubtotal(item);
            },

            calculateItemSubtotal(item) {
                let kotor = item.qty * item.harga;
                if (item.qty > item.stok) {
                    alert(`⚠️ Sisa stok buku ini: ${item.stok} pcs.`);
                    item.qty = item.stok > 0 ? item.stok : 1;
                    kotor = item.qty * item.harga;
                }

                if (item.promoApplied) {
                    if (item.discountType === 'percentage') {
                        item.discountAmount = (kotor * item.discountValue) / 100;
                    } else {
                        item.discountAmount = Math.min(item.discountValue, kotor);
                    }
                } else {
                    item.discountAmount = 0;
                }

                item.subtotal = Math.max(0, kotor - item.discountAmount);
            },

            checkItemPromo(item) {
                if (!item.promoCode || !item.buku_id) {
                    item.promoStatus = 'error';
                    item.promoMessage = 'Pilih buku dan isi kupon!';
                    return;
                }

                item.isLocked = true;
                fetch("{{ route('marketing.order.check-promo') }}", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({ code: item.promoCode, buku_id: item.buku_id })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        item.promoApplied = true;
                        item.discountType = data.type;
                        item.discountValue = Number(data.value);
                        item.promoStatus = 'success';
                        item.promoMessage = `Berhasil! -${data.type === 'percentage' ? data.value + '%' : 'Rp' + this.formatRupiah(data.value)}`;
                    } else {
                        item.promoApplied = false;
                        item.promoStatus = 'error';
                        item.promoMessage = data.message;
                        item.isLocked = false;
                    }
                    this.calculateItemSubtotal(item);
                })
                .catch(() => {
                    item.isLocked = false;
                });
            },

            resetItemPromo(item) {
                item.promoCode = '';
                item.promoApplied = false;
                item.isLocked = false;
                item.discountValue = 0;
                item.discountAmount = 0;
                item.promoStatus = '';
                item.promoMessage = '';
                this.calculateItemSubtotal(item);
            },

            calculateTotalBukuKotor() {
                return this.items.reduce((sum, item) => sum + (item.qty * item.harga), 0);
            },

            calculateTotalSemuaDiskon() {
                return this.items.reduce((sum, item) => sum + (Number(item.discountAmount) || 0), 0);
            },

            calculateGrandTotal() {
                return Math.max(0, this.calculateTotalBukuKotor() - this.calculateTotalSemuaDiskon() + (Number(this.ongkir) || 0));
            },

            fetchAlamat(namaAgen) {
                if (!namaAgen) return;
                fetch("{{ route('marketing.order.alamat', ':nama') }}".replace(':nama', encodeURIComponent(namaAgen)))
                    .then(res => res.json())
                    .then(data => {
                        this.alamatAgenAuto = data.status === 'success' ? data.alamat : '';
                    });
            },

            toggleAlamatSama() {
                if (this.samaPenerima) this.alamatManual = '';
            },

            formatRupiah(angka) {
                return new Intl.NumberFormat('id-ID').format(angka);
            }
        }));
    });

    var checkSelect2Ready = setInterval(function() {
        if (window.jQuery && $.fn.select2) {
            clearInterval(checkSelect2Ready);

            $('#select_pembeli').select2({
                theme: 'bootstrap4',
                width: '100%'
            }).on('select2:select', function (e) {
                var selectedVal = e.params.data.id;

                // Kabari Alpine.js secara paksa untuk fetch alamat otomatis
                var alpineEl = document.querySelector('[x-data="orderForm()"]');
                if (alpineEl) {
                    Alpine.$data(alpineEl).fetchAlamat(selectedVal);
                }
            });
        }
    }, 100);
</script>
@endsection
