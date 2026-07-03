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
    }

    [x-cloak] { display: none !important; }
</style>

<div class="container-fluid marketing-page" x-data="orderForm()">
    <!-- Flash Messages -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show shadow-sm border-left-success rounded-lg" role="alert">
            <i class="fas fa-check-circle mr-2"></i> {{ session('success') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show shadow-sm border-left-danger rounded-lg" role="alert">
            <i class="fas fa-exclamation-triangle mr-2"></i> {{ session('error') }}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    @if ($errors->any())
        <div class="alert alert-danger alert-dismissible fade show show shadow-sm border-left-danger rounded-lg" role="alert">
            <h5 class="alert-heading font-weight-bold"><i class="fas fa-ban mr-2"></i> Mohon Periksa Inputan Anda:</h5>
            <ul class="mb-0 pl-4">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    @endif

    <div class="row">
        <!-- LEFT PANEL: FORM INPUT PESANAN -->
        <div class="col-lg-8 mb-4">
            <div class="card shadow border-0 rounded-lg">
                <div class="card-header bg-white py-3 d-flex align-items-center justify-content-between">
                    <h5 class="m-0 font-weight-bold text-primary"><i class="fas fa-shopping-cart mr-2"></i>Input Pesanan Baru</h5>
                    <!-- Tombol Navigasi ke Halaman Utama Promo -->
                    <a href="{{ route('marketing.promo.index') }}" class="btn btn-sm btn-outline-primary font-weight-bold rounded-pill shadow-sm">
                        <i class="fas fa-ticket-alt mr-1"></i> Lihat / Kelola Promo
                    </a>
                </div>
                <div class="card-body">
                    <!-- FORM UTAMA ORDER -->
                    <form action="{{ route('marketing.order.store') }}" method="POST">
                        @csrf

                        <!-- Data Agen & Pengiriman -->
                        <div class="row mb-3">
                            <div class="col-md-6 mb-2">
                                <label class="small font-weight-bold text-dark">Nama Agen / Pembeli <span class="text-danger">*</span></label>
                                <select id="select_pembeli" name="nama_agen" class="form-control select2" required @change="fetchAlamat($event.target.value)">
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

                        <!-- Nama Penerima & Alamat -->
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
                                    <textarea name="alamat_penerima" class="form-control" rows="2" placeholder="Alamat lengkap tujuan pengiriman..." x-model="alamatManual"></textarea>
                                </div>
                            </div>

                            <div class="p-2 border rounded bg-white" x-show="samaPenerima" x-transition>
                                <span class="small text-muted d-block font-weight-bold text-uppercase">Alamat Agen Terbaca Otomatis:</span>
                                <span class="small font-weight-bold text-dark" x-text="alamatAgenAuto ? alamatAgenAuto : 'Memilih agen akan otomatis memuat alamat di sini...'"></span>
                            </div>
                        </div>
                    </form> <!-- Batas Form Atas -->

                    <!-- Kirim form order lanjutan -->
                    <form action="{{ route('marketing.order.store') }}" method="POST" id="realOrderForm">
                        @csrf
                        <!-- Copy data form atas otomatis via JS pas di-submit -->
                        <div id="hiddenFieldsContainer"></div>

                        <!-- Keterangan Order -->
                        <div class="mb-4">
                            <label class="small font-weight-bold text-dark"><i class="fas fa-sticky-note mr-1"></i> Keterangan Order</label>
                            <textarea name="keterangan_order" class="form-control" rows="2" placeholder="Tambahkan catatan khusus mengenai pesanan/transaksi ini..."></textarea>
                        </div>

                        <!-- TABEL UTAMA DAFTAR BUKU -->
                        <div class="border rounded-lg overflow-hidden bg-white shadow-sm mb-4">
                            <table class="table mb-0">
                                <thead class="bg-gradient-primary text-white text-center small font-weight-bold">
                                    <tr>
                                        <th style="width: 35%;">Pilih Judul Buku</th>
                                        <th style="width: 15%;">Jumlah (QTY)</th>
                                        <th style="width: 30%;">Kode Promo Per Buku</th>
                                        <th style="width: 15%;">Subtotal</th>
                                        <th style="width: 5%;"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <template x-for="(item, index) in items" :key="index">
                                        <tr class="align-middle">
                                            <!-- Pilihan Buku -->
                                            <td class="p-2">
                                                <select :name="'buku_id['+index+']'" class="form-control form-control-sm" x-model="item.buku_id" @change="updateBookData(item)" required>
                                                    <option value="">-- Pilih Buku --</option>
                                                    @foreach($books as $bk)
                                                        <option value="{{ $bk->id }}" data-harga="{{ $bk->stok_gudang <= 0 ? 0 : ($bk->harga_jual ?? $bk->harga ?? 0) }}" data-stok="{{ $bk->stok_gudang ?? 0 }}">
                                                            {{ $bk->judul }} (Stok: {{ $bk->stok_gudang ?? 0 }} pcs)
                                                        </option>
                                                    @endforeach
                                                </select>
                                            </td>

                                            <!-- Qty -->
                                            <td class="p-2">
                                                <div class="input-group input-group-sm">
                                                    <input type="number" :name="'qty['+index+']'" class="form-control text-center" min="1" x-model.number="item.qty" @input="calculateItemSubtotal(item)">
                                                    <div class="input-group-append">
                                                        <span class="input-group-text bg-light text-xs font-weight-bold">Pcs</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <!-- Input Kode Promo Per Baris Buku -->
                                            <td class="p-2">
                                                <div class="input-group input-group-sm mb-1">
                                                    <input type="text" :name="'item_promo_code['+index+']'" class="form-control text-uppercase" placeholder="KUPON" x-model="item.promoCode" :readonly="item.promoApplied">
                                                    <div class="input-group-append">
                                                        <button class="btn btn-primary" type="button" @click="checkItemPromo(item)" x-show="!item.promoApplied"><i class="fas fa-ticket-alt"></i></button>
                                                        <button class="btn btn-danger" type="button" @click="resetItemPromo(item)" x-show="item.promoApplied" x-cloak><i class="fas fa-times"></i></button>
                                                    </div>
                                                </div>
                                                <!-- Hasil diskon dikirim ke controller -->
                                                <input type="hidden" :name="'item_discount['+index+']'" x-model="item.discountAmount">

                                                <!-- Status Alert Promo Item -->
                                                <span class="d-block text-xs font-weight-bold" :class="item.promoStatus === 'success' ? 'text-success' : 'text-danger'" x-text="item.promoMessage" x-show="item.promoMessage" x-cloak></span>
                                            </td>

                                            <!-- Subtotal Item -->
                                            <td class="p-2 text-right font-weight-bold text-dark font-mono bg-light">
                                                Rp <span x-text="formatRupiah(item.subtotal)">0</span>
                                            </td>

                                            <!-- Tombol Hapus Baris -->
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
                                <span class="small font-weight-bold text-muted align-self-center">Pastikan kuantitas pesanan tidak melebihi kapasitas gudang.</span>
                            </div>
                        </div>

                        <!-- RINGKASAN TAGIHAN TOTAL AKHIR -->
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
                                <button type="submit" @click="handleOrderSubmit($event)" class="btn btn-success btn-block btn-lg font-weight-bold shadow rounded-pill"><i class="fas fa-save mr-2"></i>Simpan & Potong Stok</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- RIGHT PANEL: DAFTAR INVOICE PENDING -->
        <div class="col-lg-4 mb-4">
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
                                    <h6 class="font-weight-bold text-dark mb-1 font-mono text-primary">{{ $inv->no_invoice }}</h6>
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
        </div>
    </div>
</div>

<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('orderForm', () => ({
            items: [
                { buku_id: '', qty: 1, harga: 0, stok: 0, subtotal: 0, promoCode: '', promoApplied: false, discountType: 'nominal', discountValue: 0, discountAmount: 0, promoStatus: '', promoMessage: '' }
            ],
            ongkir: '',
            samaPenerima: false,
            alamatAgenAuto: '',
            alamatManual: '',

            addItem() {
                this.items.push({
                    buku_id: '', qty: 1, harga: 0, stok: 0, subtotal: 0, promoCode: '', promoApplied: false, discountType: 'nominal', discountValue: 0, discountAmount: 0, promoStatus: '', promoMessage: ''
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

                this.resetItemPromo(item);
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
                    }
                    this.calculateItemSubtotal(item);
                });
            },

            resetItemPromo(item) {
                item.promoCode = '';
                item.promoApplied = false;
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
                // Sudah disesuaikan ke nama route yang aktif di web.php milikmu
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
            },

            handleOrderSubmit(e) {
                e.preventDefault();
                const container = document.getElementById('hiddenFieldsContainer');
                container.innerHTML = '';

                const fields = [
                    { name: 'nama_agen', value: document.getElementById('select_pembeli').value },
                    { name: 'tanggal_pesan', value: document.querySelector('input[name="tanggal_pesan"]').value },
                    { name: 'via', value: document.querySelector('select[name="via"]').value },
                    { name: 'ekspedisi', value: document.querySelector('input[name="ekspedisi"]').value },
                    { name: 'ongkir', value: this.ongkir },
                    { name: 'sama_penerima', value: this.samaPenerima ? '1' : '0' },
                    { name: 'nama_penerima', value: document.querySelector('input[name="nama_penerima"]')?.value || '' },
                    { name: 'alamat_penerima', value: this.samaPenerima ? this.alamatAgenAuto : this.alamatManual }
                ];

                fields.forEach(f => {
                    let input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = f.name;
                    input.value = f.value;
                    container.appendChild(input);
                });

                document.getElementById('realOrderForm').submit();
            }
        }));
    });

    $(document).ready(function() {
        $('#select_pembeli').select2({
            theme: 'bootstrap4',
            width: '100%'
        }).on('select2:select', function () {
            document.getElementById('select_pembeli').dispatchEvent(new Event('change'));
        });
    });
</script>
@endsection
