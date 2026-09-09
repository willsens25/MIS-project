import {
  Divisi,
  User,
  Book,
  Promo,
  Identitas,
  Account,
  Category,
  Mutasi,
  PengajuanCetak,
  Penjualan,
  Penyaluran,
  LogisticLog,
  ProductionLog,
  ActivityLog,
  Order,
  SalesChannel,
  Expedition
} from '../types';

export const INITIAL_DIVISI: Divisi[] = [
  { id: 1, nama_divisi: 'Direktorat & HRD', kode: 'DIR', deskripsi: 'Pusat Manajemen, Keanggotaan, Regulasi & Audit' },
  { id: 2, nama_divisi: 'Bendahara / Finance', kode: 'KEU', deskripsi: 'Kas Keuangan, Jurnal Mutasi & Verifikasi Invoice' },
  { id: 3, nama_divisi: 'Penerbitan', kode: 'PNB', deskripsi: 'Katalog Buku, ISBN, HPP & Pengajuan Cetak' },
  { id: 4, nama_divisi: 'Marketing & Distribution', kode: 'MAD', deskripsi: 'POS Pesanan, Invoice, Promo & Agen Penjualan' },
  { id: 5, nama_divisi: 'Produksi', kode: 'PRD', deskripsi: 'Pencatatan Cetak Fisik & Log Pabrikasi' },
  { id: 6, nama_divisi: 'Logistik & Gudang', kode: 'LOG', deskripsi: 'Stok Riil, Antrean Packing & Surat Jalan' },
];

// Pre-hashed with bcrypt (salt rounds 10) for 'password123'
const DEFAULT_BCRYPT_PASSWORD_HASH = '$2b$10$S7ml9yWVoI1Kg0HGHponxOO053AboWyPCZCEINT6h9qA/Z9x2T0tm';

export const INITIAL_USERS: User[] = [
  { id: 1, name: 'Direktur Utama (Admin)', email: 'admin@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 1, role: 'Direktur', phone: '081234567890' },
  { id: 2, name: 'Siti Rahmawati (Bendahara)', email: 'finance@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 2, role: 'Bendahara', phone: '081234567891' },
  { id: 3, name: 'Budi Santoso (Penerbitan)', email: 'penerbitan@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 3, role: 'Editor Kepala', phone: '081234567892' },
  { id: 4, name: 'Diana Wijaya (Marketing)', email: 'marketing@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 4, role: 'Marketing Officer', phone: '081234567893' },
  { id: 5, name: 'Agus Priyono (Produksi)', email: 'produksi@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 5, role: 'Kepala Percetakan', phone: '081234567894' },
  { id: 6, name: 'Hendra Gunawan (Logistik)', email: 'logistik@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 6, role: 'Staff Gudang', phone: '081234567895' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, nama_kategori: 'Penjualan Buku (S-SALUR)', jenis: 'Masuk' },
  { id: 2, nama_kategori: 'Donasi Umum', jenis: 'Masuk' },
  { id: 3, nama_kategori: 'Pemasukan Ajar Dharma', jenis: 'Masuk' },
  { id: 4, nama_kategori: 'Gaji & Honorarium', jenis: 'Keluar' },
  { id: 5, nama_kategori: 'Operasional Kantor', jenis: 'Keluar' },
  { id: 6, nama_kategori: 'Biaya Cetak Buku', jenis: 'Keluar' },
  { id: 7, nama_kategori: 'Transportasi & Logistik', jenis: 'Keluar' },
  { id: 8, nama_kategori: 'Konsumsi & Kegiatan', jenis: 'Keluar' },
];

export const INITIAL_ACCOUNTS: Account[] = [
  { id: 1, nama_akun: 'Kas Operasional (Tunai)', kode_akun: 'ACC-CASH-01', saldo_awal: 12500000 },
  { id: 2, nama_akun: 'Bank BCA - Yayasan Lamrimnesia', kode_akun: 'ACC-BCA-789', saldo_awal: 85400000 },
  { id: 3, nama_akun: 'Bank Mandiri Penerbitan', kode_akun: 'ACC-MDR-442', saldo_awal: 34200000 },
  { id: 4, nama_akun: 'QRIS & Gateway Penjualan', kode_akun: 'ACC-QRIS-99', saldo_awal: 8750000 },
];

export const INITIAL_BOOKS: Book[] = [
  { id: 1, judul: 'Pembebasan di Tangan Kita (Lamrim)', penulis: 'Pabongka Rinpoche', harga_jual: 145000, stok_gudang: 48, isbn: '978-602-1234-01-1', kategori: 'Filosofi' },
  { id: 2, judul: 'Untaian Permata Ajaran Buddha', penulis: 'Dagpo Rinpoche', harga_jual: 95000, stok_gudang: 32, isbn: '978-602-1234-02-8', kategori: 'Meditasi' },
  { id: 3, judul: 'Bodhicaryavatara (Panduan Hidup Bodhisattva)', penulis: 'Shantideva', harga_jual: 120000, stok_gudang: 24, isbn: '978-602-1234-03-5', kategori: 'Sutra' },
  { id: 4, judul: 'Meditasi & Jalan Menuju Ketenangan Batin', penulis: 'Geshe Yeshe Tobden', harga_jual: 80000, stok_gudang: 65, isbn: '978-602-1234-04-2', kategori: 'Praktik' },
  { id: 5, judul: 'Sutra Inti Hati Kebijaksanaan (Prajnaparamita)', penulis: 'Penerjemah Nusantara', harga_jual: 65000, stok_gudang: 15, isbn: '978-602-1234-05-9', kategori: 'Sutra' },
  { id: 6, judul: 'Transformasi Pikiran Delapan Bait (Lojong)', penulis: 'Langri Tangpa', harga_jual: 55000, stok_gudang: 80, isbn: '978-602-1234-06-6', kategori: 'Mindset' },
  { id: 7, judul: 'Dharmapada Bergambar Edisi Nusantara', penulis: 'Tim Kreatif Lamrim', harga_jual: 175000, stok_gudang: 18, isbn: '978-602-1234-07-3', kategori: 'Koleksi' },
  { id: 8, judul: 'Seni Welas Asih Sehari-hari', penulis: 'Lama Zopa Rinpoche', harga_jual: 90000, stok_gudang: 40, isbn: '978-602-1234-08-0', kategori: 'Praktik' },
  { id: 9, judul: 'Pohon Perlindungan Tiga Permata', penulis: 'Atisha Dipamkara', harga_jual: 110000, stok_gudang: 12, isbn: '978-602-1234-09-7', kategori: 'Klasik' },
  { id: 10, judul: 'Jalan Cahaya Pencerahan Batin', penulis: 'Geshe Lhundub Sopa', harga_jual: 130000, stok_gudang: 27, isbn: '978-602-1234-10-3', kategori: 'Filosofi' },
];

export const INITIAL_SALES_CHANNELS: SalesChannel[] = [
  { id: 1, nama_channel: 'Tokopedia', kategori: 'Marketplace', deskripsi: 'Official Store Tokopedia Yayasan Lamrimnesia', aktif: true },
  { id: 2, nama_channel: 'Shopee', kategori: 'Marketplace', deskripsi: 'Shopee Mall / Official Shop Lamrimnesia', aktif: true },
  { id: 3, nama_channel: 'TikTok Shop', kategori: 'Marketplace', deskripsi: 'Live shopping & etalase TikTok', aktif: true },
  { id: 4, nama_channel: 'WhatsApp Marketing', kategori: 'Direct / WhatsApp', deskripsi: 'Chat CS Hotline WhatsApp Yayasan', aktif: true },
  { id: 5, nama_channel: 'Bazar / Event Vihara', kategori: 'Offline / Event', deskripsi: 'Stand bazar acara keagamaan & pameran buku', aktif: true },
  { id: 6, nama_channel: 'Call Center / Hotline', kategori: 'Call Center', deskripsi: 'Pemesanan melalui telepon langsung', aktif: true },
  { id: 7, nama_channel: 'Direct Order Offline', kategori: 'Offline / Event', deskripsi: 'Kunjungan walk-in ke sekretariat kantor pusat', aktif: true },
  { id: 8, nama_channel: 'Website Lamrimnesia', kategori: 'Marketplace', deskripsi: 'Pemesanan otomatis portal web resmi', aktif: true },
  { id: 9, nama_channel: 'Blibli', kategori: 'Marketplace', deskripsi: 'Official Merchant Blibli', aktif: true }
];

export const INITIAL_EXPEDITIONS: Expedition[] = [
  { id: 1, nama_ekspedisi: 'JNE Reguler', kode: 'JNE-REG', kategori: 'Reguler', estimasi: '2-3 Hari', aktif: true },
  { id: 2, nama_ekspedisi: 'JNE YES (Yakin Esok Sampai)', kode: 'JNE-YES', kategori: 'Express / Kilat', estimasi: '1 Hari', aktif: true },
  { id: 3, nama_ekspedisi: 'JNE Trucking (JTR)', kode: 'JNE-JTR', kategori: 'Cargo / Berat', estimasi: '3-7 Hari', aktif: true },
  { id: 4, nama_ekspedisi: 'J&T Express (EZ)', kode: 'J&T-EZ', kategori: 'Reguler', estimasi: '2-3 Hari', aktif: true },
  { id: 5, nama_ekspedisi: 'SiCepat Reguler', kode: 'SICEPAT-REG', kategori: 'Reguler', estimasi: '1-2 Hari', aktif: true },
  { id: 6, nama_ekspedisi: 'SiCepat Cargo / Gokil', kode: 'SICEPAT-GKL', kategori: 'Cargo / Berat', estimasi: '3-5 Hari', aktif: true },
  { id: 7, nama_ekspedisi: 'Anteraja Reguler', kode: 'ANTERAJA', kategori: 'Reguler', estimasi: '2-3 Hari', aktif: true },
  { id: 8, nama_ekspedisi: 'Pos Indonesia Kilat Khusus', kode: 'POS-KILAT', kategori: 'Reguler', estimasi: '2-4 Hari', aktif: true },
  { id: 9, nama_ekspedisi: 'GoSend Instant', kode: 'GOSEND-INS', kategori: 'Instant / Sameday', estimasi: '1-3 Jam', aktif: true },
  { id: 10, nama_ekspedisi: 'GrabExpress Instant', kode: 'GRAB-INS', kategori: 'Instant / Sameday', estimasi: '1-3 Jam', aktif: true },
  { id: 11, nama_ekspedisi: 'Wahana Prestasi Logistik', kode: 'WAHANA', kategori: 'Reguler', estimasi: '3-5 Hari', aktif: true },
  { id: 12, nama_ekspedisi: 'Lion Parcel REGPACK', kode: 'LION-REG', kategori: 'Reguler', estimasi: '2-3 Hari', aktif: true },
  { id: 13, nama_ekspedisi: 'Indah Logistik Cargo', kode: 'INDAH-CRG', kategori: 'Cargo / Berat', estimasi: '4-7 Hari', aktif: true },
  { id: 14, nama_ekspedisi: 'Ambil Sendiri di Gudang', kode: 'PICKUP-OFFLINE', kategori: 'Internal / Ambil Sendiri', estimasi: 'Hari H', aktif: true },
  { id: 15, nama_ekspedisi: 'Kurir Internal Yayasan', kode: 'KURIR-INTERNAL', kategori: 'Internal / Ambil Sendiri', estimasi: '1-2 Hari', aktif: true }
];

export const INITIAL_PROMOS: Promo[] = [
  {
    id: 1,
    code: 'DHARMA10',
    nama_promo: 'Diskon Belajar Dharma 10%',
    type: 'percentage',
    reward_value: 10,
    max_uses: 100,
    used_count: 24,
    start_date: '2026-01-01',
    expiry_date: '2027-12-31',
    min_order: 50000,
    deskripsi: 'Potongan 10% untuk seluruh judul buku dharma nusantara'
  },
  {
    id: 2,
    code: 'WESAK25',
    nama_promo: 'Berkah Waisak 25%',
    type: 'percentage',
    reward_value: 25,
    max_uses: 50,
    used_count: 18,
    start_date: '2026-05-01',
    expiry_date: '2027-06-30',
    min_order: 100000,
    deskripsi: 'Spesial perayaan Trisuci Waisak diskon 25% semua katalog'
  },
  {
    id: 3,
    code: 'HEMAT20K',
    nama_promo: 'Voucher Potongan Rp 20.000',
    type: 'nominal',
    reward_value: 20000,
    max_uses: 200,
    used_count: 52,
    start_date: '2026-01-01',
    expiry_date: '2027-12-31',
    min_order: 150000,
    deskripsi: 'Potongan langsung Rp 20.000 dengan minimal belanja Rp 150.000'
  },
  {
    id: 4,
    code: 'PATRIOT50',
    nama_promo: 'Apresiasi Dharma Patriot 50%',
    type: 'percentage',
    reward_value: 50,
    max_uses: 30,
    used_count: 8,
    start_date: '2026-01-01',
    expiry_date: '2027-12-31',
    khusus_kategori_pembeli: 'Pengurus',
    deskripsi: 'Diskon khusus 50% bagi Pengurus & Dharma Patriot aktif'
  },
  {
    id: 5,
    code: 'SANGHA100',
    nama_promo: 'Dana Persembahan Sangha 100%',
    type: 'percentage',
    reward_value: 100,
    max_uses: 50,
    used_count: 5,
    start_date: '2026-01-01',
    expiry_date: '2027-12-31',
    khusus_kategori_pembeli: 'Sangha',
    deskripsi: 'Bebas biaya 100% persembahan dana buku untuk anggota Sangha (Bhante/Ayya)'
  },
  {
    id: 6,
    code: 'LAMRIM15',
    nama_promo: 'Spesial Lamrim Chenmo 15%',
    type: 'percentage',
    reward_value: 15,
    max_uses: 80,
    used_count: 12,
    start_date: '2026-01-01',
    expiry_date: '2027-12-31',
    buku_id_khusus: 1,
    deskripsi: 'Diskon 15% khusus pembelian buku Masterpiece Pembebasan di Tangan Kita'
  }
];

export const INITIAL_IDENTITAS: Identitas[] = [
  {
    id: 1,
    nama_lengkap: 'ANAND KRISHNA WIJAYA',
    panggilan: 'Anand',
    jenis_identitas: 'KTP',
    nomor_identitas: '3171012304890001',
    tempat_lahir: 'Jakarta',
    tanggal_lahir: '1989-04-23',
    jenis_kelamin: 'Laki-laki',
    kewarganegaraan: 'WNI',
    nomor_hp_primary: '081288991122',
    email: 'anand.wijaya@gmail.com',
    pekerjaan: 'Wiraswasta / Agen Buku',
    alamat: 'Jl. Surya Kencana No. 45, Kebon Jeruk',
    kota: 'Jakarta Barat',
    kode_pos: '11530',
    agama: 'Buddha',
    status_keamanan: 'VIP',
    jenis_umat: 'Anggota',
    bhante_lay: 'Lay',
    is_agen_purna: 1,
    is_dharma_patriot: 1,
    divisi_id: 4,
    created_by: 1,
    created_at: '2026-01-15 08:30:00'
  },
  {
    id: 2,
    nama_lengkap: 'VENERABLE BHIKKHU DHAMMAVIRA',
    panggilan: 'Bhante Dhammavira',
    jenis_identitas: 'KTP',
    nomor_identitas: '3273021105750003',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1975-05-11',
    jenis_kelamin: 'Laki-laki',
    kewarganegaraan: 'WNI',
    nomor_hp_primary: '081122334455',
    email: 'dhammavira.thura@vihara.org',
    pekerjaan: 'Rohaniwan',
    alamat: 'Vihara Bodhi Mandala, Jl. Lembang Km 12',
    kota: 'Bandung',
    kode_pos: '40391',
    agama: 'Buddha',
    status_keamanan: 'VIP',
    jenis_umat: 'Sangha',
    bhante_lay: 'Bhante',
    is_agen_purna: 0,
    is_dharma_patriot: 1,
    divisi_id: null,
    created_by: 1,
    created_at: '2026-01-20 10:15:00'
  },
  {
    id: 3,
    nama_lengkap: 'MEILIANA SUSANTO',
    panggilan: 'Mei',
    jenis_identitas: 'KTP',
    nomor_identitas: '3578016509920002',
    tempat_lahir: 'Surabaya',
    tanggal_lahir: '1992-09-25',
    jenis_kelamin: 'Perempuan',
    kewarganegaraan: 'WNI',
    nomor_hp_primary: '081399442211',
    email: 'meiliana.s@permatashop.com',
    pekerjaan: 'Toko Buku Dharma Surabaya',
    alamat: 'Komp. Ruko Darmo Park II Blok 4 No. 12',
    kota: 'Surabaya',
    kode_pos: '60241',
    agama: 'Buddha',
    status_keamanan: 'Normal',
    jenis_umat: 'Pengurus',
    bhante_lay: 'Lay',
    is_agen_purna: 1,
    is_dharma_patriot: 0,
    divisi_id: 4,
    created_by: 1,
    created_at: '2026-02-01 14:20:00'
  },
  {
    id: 4,
    nama_lengkap: 'TJHIN HENDRI SETIAWAN',
    panggilan: 'Hendri',
    jenis_identitas: 'KTP',
    nomor_identitas: '1271021402850005',
    tempat_lahir: 'Medan',
    tanggal_lahir: '1985-02-14',
    jenis_kelamin: 'Laki-laki',
    kewarganegaraan: 'WNI',
    nomor_hp_primary: '085277889900',
    email: 'hendri.tjhin@yahoo.co.id',
    pekerjaan: 'Pengusaha Distribusi Buku',
    alamat: 'Jl. Asia Raya No. 88, Sei Rengas',
    kota: 'Medan',
    kode_pos: '20214',
    agama: 'Buddha',
    status_keamanan: 'Normal',
    jenis_umat: 'Simpatisan',
    bhante_lay: 'Lay',
    is_agen_purna: 0,
    is_dharma_patriot: 1,
    divisi_id: 4,
    created_by: 1,
    created_at: '2026-02-10 09:00:00'
  },
  {
    id: 5,
    nama_lengkap: 'AYYA SANTACITTA',
    panggilan: 'Ayya Santacitta',
    jenis_identitas: 'KTP',
    nomor_identitas: '3374025508800004',
    tempat_lahir: 'Semarang',
    tanggal_lahir: '1980-08-15',
    jenis_kelamin: 'Perempuan',
    kewarganegaraan: 'WNI',
    nomor_hp_primary: '081299887766',
    email: 'santacitta.ayya@gmail.com',
    pekerjaan: 'Rohaniwati / Samaneri',
    alamat: 'Pusat Meditasi Sukhavati, Jl. Candi Golf No. 3',
    kota: 'Semarang',
    kode_pos: '50274',
    agama: 'Buddha',
    status_keamanan: 'VIP',
    jenis_umat: 'Sangha',
    bhante_lay: 'Ayya',
    is_agen_purna: 0,
    is_dharma_patriot: 1,
    divisi_id: null,
    created_by: 1,
    created_at: '2026-02-15 11:30:00'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    no_invoice: 'INV-20260830-0001',
    tanggal_pesan: '2026-08-30',
    via: 'WhatsApp Marketing',
    nama_pembeli: 'ANAND KRISHNA WIJAYA',
    kontak_pembeli: '081288991122',
    email_pembeli: 'anand.wijaya@gmail.com',
    pembeli_identitas_id: 1,
    nama_penerima: 'Anand Krishna Wijaya',
    kontak_penerima: '081288991122',
    alamat_penerima: 'Jl. Surya Kencana No. 45, Kebon Jeruk, Jakarta Barat, 11530',
    ekspedisi: 'JNE YES (Yakin Esok Sampai)',
    ongkir: 25000,
    donasi: 50000,
    keterangan_donasi: 'Donasi Cetak Kitab Suci Lamrim',
    status: 'Lunas',
    total_tagihan: 445000,
    user_id: 4,
    keterangan: 'Paket buku dharma untuk kegiatan retret. Mohon sertakan kartu ucapan berkah.',
    tercatat_finance: 1,
    created_at: '2026-08-30 10:30:00',
    items: [
      { buku_id: 1, jumlah: 2, harga_satuan: 145000, subtotal: 261000, kode_promo_terpakai: 'DHARMA10', potongan_diskon: 29000 },
      { buku_id: 3, jumlah: 1, harga_satuan: 120000, subtotal: 109000, kode_promo_terpakai: 'DHARMA10', potongan_diskon: 11000 }
    ]
  },
  {
    id: 2,
    no_invoice: 'INV-20260831-0002',
    tanggal_pesan: '2026-08-31',
    via: 'Tokopedia',
    nama_pembeli: 'MEILIANA SUSANTO',
    kontak_pembeli: '081399887766',
    email_pembeli: 'meiliana.s@yahoo.com',
    nama_penerima: 'Toko Buku Dharma Surabaya (u.p. Bpk Hendra)',
    kontak_penerima: '081987654321',
    alamat_penerima: 'Komp. Ruko Darmo Park II Blok 4 No. 12, Wonokromo, Kota Surabaya, Jawa Timur 60241',
    ekspedisi: 'SiCepat Cargo / Gokil',
    ongkir: 45000,
    donasi: 25000,
    keterangan_donasi: 'Dana Operasional Yayasan',
    status: 'Pending',
    total_tagihan: 750000,
    user_id: 4,
    keterangan: 'Pesanan untuk kirim ke cabang toko buku vihara teman. Resi dan faktur tolong WA ke pembeli (Meiliana).',
    tercatat_finance: 0,
    created_at: '2026-08-31 09:15:00',
    items: [
      { buku_id: 2, jumlah: 5, harga_satuan: 95000, subtotal: 475000, kode_promo_terpakai: null, potongan_diskon: 0 },
      { buku_id: 4, jumlah: 3, harga_satuan: 80000, subtotal: 220000, kode_promo_terpakai: 'HEMAT20K', potongan_diskon: 20000 }
    ]
  }
];

export const INITIAL_MUTASI: Mutasi[] = [
  { id: 1, account_id: 2, category_id: 1, user_id: 2, tipe: 'Masuk', nominal: 395000, keterangan: 'Pelunasan Invoice #INV-20260830-0001 (ANAND KRISHNA WIJAYA)', tanggal: '2026-08-30', jenis: 'INVOICE' },
  { id: 2, account_id: 2, category_id: 2, user_id: 2, tipe: 'Masuk', nominal: 5000000, keterangan: 'Donasi Dana Cetak Sutra dari Bapak Surya Dharma', tanggal: '2026-08-28', jenis: 'MANUAL' },
  { id: 3, account_id: 1, category_id: 5, user_id: 2, tipe: 'Keluar', nominal: 1450000, keterangan: 'Biaya langganan internet, listrik, dan ATK kantor', tanggal: '2026-08-29', jenis: 'MANUAL' },
  { id: 4, account_id: 3, category_id: 6, user_id: 2, tipe: 'Keluar', nominal: 4000000, keterangan: 'Biaya Cetak Ulang: Pembebasan di Tangan Kita (200 Eks)', tanggal: '2026-08-25', jenis: 'MANUAL' },
  { id: 5, account_id: 2, category_id: 1, user_id: 2, tipe: 'Masuk', nominal: 1850000, keterangan: 'Penjualan Bazar Buku Dharma Vihara Pluit', tanggal: '2026-08-27', jenis: 'MANUAL' },
];

export const INITIAL_PENGAJUAN: PengajuanCetak[] = [
  { id: 1, buku_id: 5, jumlah_pengajuan: 150, status: 'pending', created_at: '2026-08-30 11:00:00' },
  { id: 2, buku_id: 3, jumlah_pengajuan: 200, status: 'approved', catatan_bendahara: 'Disetujui. Dana cair dari Mandiri Penerbitan.', created_at: '2026-08-24 14:00:00' },
];

export const INITIAL_PENJUALAN: Penjualan[] = [
  { id: 1, no_invoice: 'INV-20260830-0001', nama_pelanggan: 'ANAND KRISHNA WIJAYA', total_item: 3, total_bayar: 395000, tanggal_penjualan: '2026-08-30 10:35:00' },
  { id: 2, no_invoice: 'INV-20260827-0099', nama_pelanggan: 'Bazar Buku Dharma Pluit', total_item: 18, total_bayar: 1850000, tanggal_penjualan: '2026-08-27 16:40:00' },
];

export const INITIAL_PENYALURAN: Penyaluran[] = [
  { id: 1, no_invoice: 'INV-20260830-0001', buku_id: 1, qty: 2, nama_agen: 'Anand Krishna Wijaya', status: 'proses packing', created_at: '2026-08-30 10:31:00' },
  { id: 2, no_invoice: 'INV-20260830-0001', buku_id: 3, qty: 1, nama_agen: 'Anand Krishna Wijaya', status: 'proses packing', created_at: '2026-08-30 10:31:00' },
];

export const INITIAL_LOGISTIC_LOGS: LogisticLog[] = [
  { id: 1, buku_id: 1, qty_keluar: 2, tujuan: 'Anand Krishna Wijaya (Jakarta)', keterangan: 'Invoice #INV-20260830-0001', created_at: '2026-08-30 15:00:00' },
  { id: 2, buku_id: 4, qty_keluar: 10, tujuan: 'Distribusi Donasi Vihara Semarang', keterangan: 'Penyaluran Buku Dharma', created_at: '2026-08-28 09:30:00' },
];

export const INITIAL_PRODUCTION_LOGS: ProductionLog[] = [
  { id: 1, buku_id: 1, qty_produksi: 100, tanggal_produksi: '2026-08-26 14:00:00' },
  { id: 2, buku_id: 6, qty_produksi: 150, tanggal_produksi: '2026-08-22 10:00:00' },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  // Divisi 4: Marketing & Distribution
  { id: 1, user_id: 4, user_name: 'Diana Wijaya', divisi_id: 4, divisi_name: 'Marketing & Distribution', aksi: 'Konfirmasi Lunas', model: 'Order', keterangan: 'Mengubah status invoice INV-20260830-0001 menjadi LUNAS. Data disinkronkan ke Finance & antrean packing Logistik.', created_at: '2026-08-30 10:35:00' },
  { id: 5, user_id: 4, user_name: 'Diana Wijaya', divisi_id: 4, divisi_name: 'Marketing & Distribution', aksi: 'Tambah Pesanan', model: 'Order', keterangan: 'Membuat invoice baru INV-20260831-0002 untuk Meiliana Susanto (Surabaya) senilai Rp 725.000.', created_at: '2026-08-31 09:15:00' },
  { id: 6, user_id: 4, user_name: 'Diana Wijaya', divisi_id: 4, divisi_name: 'Marketing & Distribution', aksi: 'Tambah Promo', model: 'Promo', keterangan: 'Menerbitkan kode promo baru DHARMA10 (Diskon 10% untuk buku filosofi).', created_at: '2026-08-25 14:00:00' },

  // Divisi 1: Direktorat & HRD
  { id: 2, user_id: 1, user_name: 'Direktur Utama', divisi_id: 1, divisi_name: 'Direktorat & HRD', aksi: 'Tambah Identitas', model: 'Identitas', keterangan: 'Mendaftarkan anggota kehormatan baru: "VENERABLE BHIKKHU DHAMMAVIRA" status VIP.', created_at: '2026-08-20 10:15:00' },
  { id: 7, user_id: 1, user_name: 'Direktur Utama', divisi_id: 1, divisi_name: 'Direktorat & HRD', aksi: 'Update User', model: 'User', keterangan: 'Memperbarui hak akses dan role Diana Wijaya sebagai Koordinator Marketing & Distribusi.', created_at: '2026-08-27 16:30:00' },
  { id: 8, user_id: 1, user_name: 'Direktur Utama', divisi_id: 1, divisi_name: 'Direktorat & HRD', aksi: 'Audit Sistem', model: 'Identitas', keterangan: 'Melakukan verifikasi berkala terhadap 6 basis data anggota Dharma Patriot.', created_at: '2026-08-29 11:20:00' },

  // Divisi 2: Bendahara / Finance
  { id: 3, user_id: 2, user_name: 'Siti Rahmawati', divisi_id: 2, divisi_name: 'Bendahara / Finance', aksi: 'Setujui Cetak Buku', model: 'PengajuanCetak', keterangan: 'Menyetujui cetak ulang buku "Bodhicaryavatara" sejumlah 200 Eks (Biaya: Rp 4.000.000 cair dari Bank Mandiri).', created_at: '2026-08-24 14:30:00' },
  { id: 9, user_id: 2, user_name: 'Siti Rahmawati', divisi_id: 2, divisi_name: 'Bendahara / Finance', aksi: 'Tambah Transaksi', model: 'Mutasi', keterangan: 'Mencatat donasi dana cetak sutra dari Bapak Surya Dharma sebesar Rp 5.000.000 ke rekening BCA Yayasan.', created_at: '2026-08-28 15:40:00' },
  { id: 10, user_id: 2, user_name: 'Siti Rahmawati', divisi_id: 2, divisi_name: 'Bendahara / Finance', aksi: 'Rekonsiliasi Kas', model: 'Mutasi', keterangan: 'Verifikasi mutasi kas operasional kantor dan ATK bulan Agustus sebesar Rp 1.450.000.', created_at: '2026-08-29 17:00:00' },

  // Divisi 3: Penerbitan
  { id: 4, user_id: 3, user_name: 'Budi Santoso', divisi_id: 3, divisi_name: 'Penerbitan', aksi: 'Tambah Buku', model: 'Book', keterangan: 'Mendaftarkan buku baru ke katalog: "Jalan Cahaya Pencerahan Batin" karya Geshe Lhundub Sopa.', created_at: '2026-08-18 11:20:00' },
  { id: 11, user_id: 3, user_name: 'Budi Santoso', divisi_id: 3, divisi_name: 'Penerbitan', aksi: 'Ajukan Cetak Buku', model: 'PengajuanCetak', keterangan: 'Mengajukan cetak ulang buku "Sutra Inti Hati Kebijaksanaan" sebanyak 150 Eks ke Finance.', created_at: '2026-08-30 11:00:00' },
  { id: 12, user_id: 3, user_name: 'Budi Santoso', divisi_id: 3, divisi_name: 'Penerbitan', aksi: 'Update Buku', model: 'Book', keterangan: 'Memperbarui penetapan HPP dan harga jual resmi buku "Untaian Permata Ajaran Buddha".', created_at: '2026-08-28 09:45:00' },

  // Divisi 5: Produksi
  { id: 13, user_id: 5, user_name: 'Agus Priyono', divisi_id: 5, divisi_name: 'Produksi', aksi: 'Tambah Hasil Produksi', model: 'ProductionLog', keterangan: 'Menyelesaikan pencetakan 100 Eks buku "Pembebasan di Tangan Kita" dan telah masuk gudang.', created_at: '2026-08-26 14:00:00' },
  { id: 14, user_id: 5, user_name: 'Agus Priyono', divisi_id: 5, divisi_name: 'Produksi', aksi: 'Tambah Hasil Produksi', model: 'ProductionLog', keterangan: 'Menyelesaikan batch cetak 150 Eks buku "Kidung Agung Pencerahan" bersama percetakan mitra.', created_at: '2026-08-22 10:00:00' },
  { id: 15, user_id: 5, user_name: 'Agus Priyono', divisi_id: 5, divisi_name: 'Produksi', aksi: 'Quality Check', model: 'ProductionLog', keterangan: 'Inspeksi kualitas cetak sampul embossed dan laminasi doff untuk seri buku Dharma Klasik.', created_at: '2026-08-29 13:15:00' },

  // Divisi 6: Logistik & Gudang
  { id: 16, user_id: 6, user_name: 'Hendra Gunawan', divisi_id: 6, divisi_name: 'Logistik & Gudang', aksi: 'Kirim Pesanan Logistik', model: 'LogisticLog', keterangan: 'Memproses pengiriman pesanan Invoice #INV-20260830-0001 (2 eks) via JNE YES ke Anand Krishna Wijaya.', created_at: '2026-08-30 15:00:00' },
  { id: 17, user_id: 6, user_name: 'Hendra Gunawan', divisi_id: 6, divisi_name: 'Logistik & Gudang', aksi: 'Pengeluaran Manual Gudang', model: 'LogisticLog', keterangan: 'Mengeluarkan stok 10 pcs buku untuk distribusi donasi Vihara Semarang.', created_at: '2026-08-28 09:30:00' },
  { id: 18, user_id: 6, user_name: 'Hendra Gunawan', divisi_id: 6, divisi_name: 'Logistik & Gudang', aksi: 'Stock Opname', model: 'LogisticLog', keterangan: 'Pemeriksaan fisik stok rak utama gudang: seluruh jumlah fisik cocok dengan angka sistem.', created_at: '2026-08-31 08:30:00' },
];
