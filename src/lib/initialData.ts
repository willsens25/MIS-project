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
  Expedition,
  BazaarEvent,
  BazaarAllocationItem,
  PreOrderCampaign,
  BookBundle,
  MembershipTierConfig
} from '../types';

export const INITIAL_DIVISI: Divisi[] = [
  { id: 1, nama_divisi: 'Direktorat & HRD', kode: 'DIR', deskripsi: 'Pusat Manajemen, Keanggotaan & Regulasi Organisasi' },
  { id: 2, nama_divisi: 'Bendahara / Finance', kode: 'KEU', deskripsi: 'Kas Keuangan, Jurnal Mutasi & Verifikasi Invoice' },
  { id: 3, nama_divisi: 'Penerbitan', kode: 'PNB', deskripsi: 'Katalog Buku, ISBN, HPP & Pengajuan Cetak' },
  { id: 4, nama_divisi: 'Marketing & Distribution', kode: 'MAD', deskripsi: 'POS Pesanan, Invoice, Promo & Agen Penjualan' },
  { id: 5, nama_divisi: 'Produksi', kode: 'PRD', deskripsi: 'Pencatatan Cetak Fisik & Log Pabrikasi' },
  { id: 6, nama_divisi: 'Logistik & Gudang', kode: 'LOG', deskripsi: 'Stok Riil, Antrean Packing & Surat Jalan' },
];

// Pre-hashed with bcrypt (salt rounds 10) for 'password123'
const DEFAULT_BCRYPT_PASSWORD_HASH = '$2b$10$S7ml9yWVoI1Kg0HGHponxOO053AboWyPCZCEINT6h9qA/Z9x2T0tm';

// Production Clean Slate: Only 1 Admin account initially
export const INITIAL_USERS: User[] = [
  { id: 1, name: 'Direktur Utama (Admin)', email: 'admin@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 1, role: 'Direktur', phone: '081234567890' },
];

// Production Clean Slate: Standard financial accounts starting at Rp 0
export const INITIAL_ACCOUNTS: Account[] = [
  { id: 1, nama_akun: 'Kas Operasional (Tunai)', kode_akun: 'ACC-CASH-01', saldo_awal: 0 },
  { id: 2, nama_akun: 'Bank BCA - Yayasan Lamrimnesia', kode_akun: 'ACC-BCA-789', saldo_awal: 0 },
  { id: 3, nama_akun: 'Bank Mandiri Penerbitan', kode_akun: 'ACC-MDR-442', saldo_awal: 0 },
  { id: 4, nama_akun: 'QRIS & Gateway Penjualan', kode_akun: 'ACC-QRIS-99', saldo_awal: 0 },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, nama_kategori: 'Penjualan Buku / POS', jenis: 'Masuk' },
  { id: 2, nama_kategori: 'Dana Donasi & Sponsorship', jenis: 'Masuk' },
  { id: 3, nama_kategori: 'Pendapatan Lain-lain', jenis: 'Masuk' },
  { id: 4, nama_kategori: 'Biaya Cetak & Produksi Buku', jenis: 'Keluar' },
  { id: 5, nama_kategori: 'Operasional Kantor & Utilitas', jenis: 'Keluar' },
  { id: 6, nama_kategori: 'Logistik & Pengiriman Paket', jenis: 'Keluar' },
  { id: 7, nama_kategori: 'Honorarium & Gaji Staf', jenis: 'Keluar' },
  { id: 8, nama_kategori: 'Kegiatan Puja & Event Dharma', jenis: 'Keluar' },
];

// Production Clean Slate: 0 books, 0 promos, 0 members, 0 orders, 0 mutasi, 0 logs
export const INITIAL_BOOKS: Book[] = [];
export const INITIAL_PROMOS: Promo[] = [];
export const INITIAL_IDENTITAS: Identitas[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_MUTASI: Mutasi[] = [];
export const INITIAL_PENGAJUAN: PengajuanCetak[] = [];
export const INITIAL_PENJUALAN: Penjualan[] = [];
export const INITIAL_PENYALURAN: Penyaluran[] = [];
export const INITIAL_LOGISTIC_LOGS: LogisticLog[] = [];
export const INITIAL_PRODUCTION_LOGS: ProductionLog[] = [];
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];
export const INITIAL_BAZAAR_EVENTS: BazaarEvent[] = [];

// ==========================================
// DEMO / SAMPLE DATA (Available on request)
// ==========================================
export const DEMO_USERS: User[] = [
  { id: 1, name: 'Direktur Utama (Admin)', email: 'admin@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 1, role: 'Direktur', phone: '081234567890' },
  { id: 2, name: 'Siti Rahmawati (Bendahara)', email: 'finance@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 2, role: 'Bendahara', phone: '081234567891' },
  { id: 3, name: 'Budi Santoso (Penerbitan)', email: 'penerbitan@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 3, role: 'Editor Kepala', phone: '081234567892' },
  { id: 4, name: 'Diana Wijaya (Marketing)', email: 'marketing@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 4, role: 'Marketing Officer', phone: '081234567893' },
  { id: 5, name: 'Agus Priyono (Produksi)', email: 'produksi@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 5, role: 'Kepala Percetakan', phone: '081234567894' },
  { id: 6, name: 'Hendra Gunawan (Logistik)', email: 'logistik@lamrimnesia.org', password: DEFAULT_BCRYPT_PASSWORD_HASH, divisi_id: 6, role: 'Staff Gudang', phone: '081234567895' },
];

export const DEMO_ACCOUNTS: Account[] = [
  { id: 1, nama_akun: 'Kas Operasional (Tunai)', kode_akun: 'ACC-CASH-01', saldo_awal: 12500000 },
  { id: 2, nama_akun: 'Bank BCA - Yayasan Lamrimnesia', kode_akun: 'ACC-BCA-789', saldo_awal: 85400000 },
  { id: 3, nama_akun: 'Bank Mandiri Penerbitan', kode_akun: 'ACC-MDR-442', saldo_awal: 34200000 },
  { id: 4, nama_akun: 'QRIS & Gateway Penjualan', kode_akun: 'ACC-QRIS-99', saldo_awal: 8750000 },
];

export const DEMO_BOOKS: Book[] = [
  { id: 1, judul: 'Pembebasan di Tangan Kita (Lamrim)', penulis: 'Pabongka Rinpoche', harga_jual: 145000, biaya_pokok: 52000, stok_gudang: 48, isbn: '978-602-1234-01-1', kategori: 'Filosofi' },
  { id: 2, judul: 'Untaian Permata Ajaran Buddha', penulis: 'Dagpo Rinpoche', harga_jual: 95000, biaya_pokok: 36000, stok_gudang: 32, isbn: '978-602-1234-02-8', kategori: 'Meditasi' },
  { id: 3, judul: 'Bodhicaryavatara (Panduan Hidup Bodhisattva)', penulis: 'Shantideva', harga_jual: 120000, biaya_pokok: 45000, stok_gudang: 24, isbn: '978-602-1234-03-5', kategori: 'Sutra' },
  { id: 4, judul: 'Meditasi & Jalan Menuju Ketenangan Batin', penulis: 'Geshe Yeshe Tobden', harga_jual: 80000, biaya_pokok: 29000, stok_gudang: 65, isbn: '978-602-1234-04-2', kategori: 'Praktik' },
  { id: 5, judul: 'Sutra Inti Hati Kebijaksanaan (Prajnaparamita)', penulis: 'Penerjemah Nusantara', harga_jual: 65000, biaya_pokok: 22000, stok_gudang: 15, isbn: '978-602-1234-05-9', kategori: 'Sutra' },
  { id: 6, judul: 'Transformasi Pikiran Delapan Bait (Lojong)', penulis: 'Langri Tangpa', harga_jual: 55000, biaya_pokok: 19000, stok_gudang: 80, isbn: '978-602-1234-06-6', kategori: 'Mindset' },
  { id: 7, judul: 'Dharmapada Bergambar Edisi Nusantara', penulis: 'Tim Kreatif Lamrim', harga_jual: 175000, biaya_pokok: 68000, stok_gudang: 18, isbn: '978-602-1234-07-3', kategori: 'Koleksi' },
  { id: 8, judul: 'Seni Welas Asih Sehari-hari', penulis: 'Lama Zopa Rinpoche', harga_jual: 90000, biaya_pokok: 32000, stok_gudang: 40, isbn: '978-602-1234-08-0', kategori: 'Praktik' },
  { id: 9, judul: 'Pohon Perlindungan Tiga Permata', penulis: 'Atisha Dipamkara', harga_jual: 110000, biaya_pokok: 41000, stok_gudang: 12, isbn: '978-602-1234-09-7', kategori: 'Klasik' },
  { id: 10, judul: 'Jalan Cahaya Pencerahan Batin', penulis: 'Geshe Lhundub Sopa', harga_jual: 130000, biaya_pokok: 48000, stok_gudang: 27, isbn: '978-602-1234-10-3', kategori: 'Filosofi' },
];

export const DEMO_PROMOS: Promo[] = [
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

export const DEMO_IDENTITAS: Identitas[] = [
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

export const DEMO_ORDERS: Order[] = [
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
  },
  {
    id: 3,
    no_invoice: 'INV-20260915-0003',
    tanggal_pesan: '2026-09-15',
    via: 'Shopee',
    nama_pembeli: 'SURYA DHARMA PUTRA',
    kontak_pembeli: '081234567890',
    email_pembeli: 'surya.dharma@gmail.com',
    nama_penerima: 'Surya Dharma Putra',
    kontak_penerima: '081234567890',
    alamat_penerima: 'Jl. Diponegoro No. 88, Menteng, Jakarta Pusat',
    ekspedisi: 'JNE Reguler',
    ongkir: 18000,
    donasi: 50000,
    keterangan_donasi: 'Donasi Program Pelestarian Naskah',
    status: 'Lunas',
    total_tagihan: 388000,
    user_id: 4,
    tercatat_finance: 1,
    created_at: '2026-09-15 14:20:00',
    items: [
      { buku_id: 1, jumlah: 2, harga_satuan: 145000, subtotal: 290000, kode_promo_terpakai: null, potongan_diskon: 0 }
    ]
  },
  {
    id: 4,
    no_invoice: 'INV-20260718-0004',
    tanggal_pesan: '2026-07-18',
    via: 'Tokopedia',
    nama_pembeli: 'CITRA DEWI LESTARI',
    kontak_pembeli: '08176543210',
    email_pembeli: 'citra.lestari@gmail.com',
    nama_penerima: 'Citra Dewi Lestari',
    kontak_penerima: '08176543210',
    alamat_penerima: 'Jl. Riau No. 12, Bandung, Jawa Barat',
    ekspedisi: 'SiCepat Reguler',
    ongkir: 20000,
    donasi: 30000,
    status: 'Lunas',
    total_tagihan: 310000,
    user_id: 4,
    tercatat_finance: 1,
    created_at: '2026-07-18 11:10:00',
    items: [
      { buku_id: 3, jumlah: 2, harga_satuan: 120000, subtotal: 240000, kode_promo_terpakai: null, potongan_diskon: 0 }
    ]
  },
  {
    id: 5,
    no_invoice: 'INV-20260622-0005',
    tanggal_pesan: '2026-06-22',
    via: 'Bazar / Event Vihara',
    nama_pembeli: 'HENDRA WIJAYA',
    kontak_pembeli: '081900112233',
    nama_penerima: 'Hendra Wijaya',
    alamat_penerima: 'Stand Bazar Vihara Pluit Dharma, Jakarta Utara',
    status: 'Lunas',
    total_tagihan: 620000,
    ekspedisi: 'Ambil Sendiri di Gudang',
    ongkir: 0,
    donasi: 50000,
    user_id: 4,
    tercatat_finance: 1,
    created_at: '2026-06-22 16:00:00',
    items: [
      { buku_id: 2, jumlah: 6, harga_satuan: 95000, subtotal: 570000 }
    ]
  },
  {
    id: 6,
    no_invoice: 'INV-20260510-0006',
    tanggal_pesan: '2026-05-10',
    via: 'WhatsApp Marketing',
    nama_pembeli: 'KARTIKA SARI',
    kontak_pembeli: '081822334455',
    nama_penerima: 'Kartika Sari',
    alamat_penerima: 'Jl. Malioboro No. 45, Danurejan, Kota Yogyakarta',
    status: 'Lunas',
    total_tagihan: 285000,
    ekspedisi: 'JNE Reguler',
    ongkir: 15000,
    donasi: 0,
    user_id: 4,
    tercatat_finance: 1,
    created_at: '2026-05-10 09:30:00',
    items: [
      { buku_id: 4, jumlah: 3, harga_satuan: 80000, subtotal: 240000 }
    ]
  },
  {
    id: 7,
    no_invoice: 'INV-20260425-0007',
    tanggal_pesan: '2026-04-25',
    via: 'Tokopedia',
    nama_pembeli: 'BENNY PRASETYO',
    kontak_pembeli: '081377889900',
    nama_penerima: 'Benny Prasetyo',
    alamat_penerima: 'Perumahan Graha Candi Blok B-4, Candisari, Semarang',
    status: 'Lunas',
    total_tagihan: 455000,
    ekspedisi: 'J&T Express (EZ)',
    ongkir: 20000,
    donasi: 0,
    user_id: 4,
    tercatat_finance: 1,
    created_at: '2026-04-25 15:45:00',
    items: [
      { buku_id: 1, jumlah: 3, harga_satuan: 145000, subtotal: 435000 }
    ]
  }
];

export const DEMO_MUTASI: Mutasi[] = [
  { id: 1, account_id: 2, category_id: 1, user_id: 2, tipe: 'Masuk', nominal: 395000, keterangan: 'Pelunasan Invoice #INV-20260830-0001 (ANAND KRISHNA WIJAYA)', tanggal: '2026-08-30', jenis: 'INVOICE' },
  { id: 2, account_id: 2, category_id: 2, user_id: 2, tipe: 'Masuk', nominal: 5000000, keterangan: 'Donasi Dana Cetak Sutra dari Bapak Surya Dharma', tanggal: '2026-08-28', jenis: 'MANUAL' },
  { id: 3, account_id: 1, category_id: 5, user_id: 2, tipe: 'Keluar', nominal: 1450000, keterangan: 'Biaya langganan internet, listrik, dan ATK kantor', tanggal: '2026-08-29', jenis: 'MANUAL' },
  { id: 4, account_id: 3, category_id: 6, user_id: 2, tipe: 'Keluar', nominal: 4000000, keterangan: 'Biaya Cetak Ulang: Pembebasan di Tangan Kita (200 Eks)', tanggal: '2026-08-25', jenis: 'MANUAL' },
  { id: 5, account_id: 2, category_id: 1, user_id: 2, tipe: 'Masuk', nominal: 1850000, keterangan: 'Penjualan Bazar Buku Dharma Vihara Pluit', tanggal: '2026-08-27', jenis: 'MANUAL' },
  { id: 6, account_id: 2, category_id: 1, user_id: 2, tipe: 'Masuk', nominal: 4200000, keterangan: 'Penerimaan Penjualan Buku Marketplace Bulan September', tanggal: '2026-09-18', jenis: 'MANUAL' },
  { id: 7, account_id: 1, category_id: 5, user_id: 2, tipe: 'Keluar', nominal: 1850000, keterangan: 'Operasional & logistik kantor sekretariat', tanggal: '2026-09-12', jenis: 'MANUAL' },
  { id: 8, account_id: 2, category_id: 2, user_id: 2, tipe: 'Masuk', nominal: 6500000, keterangan: 'Donasi Dana Cetak Lamrim Bulan Juli', tanggal: '2026-07-20', jenis: 'MANUAL' },
  { id: 9, account_id: 3, category_id: 6, user_id: 2, tipe: 'Keluar', nominal: 3200000, keterangan: 'Pembayaran Uang Muka Percetakan Naskah', tanggal: '2026-07-15', jenis: 'MANUAL' },
  { id: 10, account_id: 2, category_id: 1, user_id: 2, tipe: 'Masuk', nominal: 5800000, keterangan: 'Hasil Bazar & Distribusi Buku Dharma Bulan Juni', tanggal: '2026-06-25', jenis: 'MANUAL' },
  { id: 11, account_id: 1, category_id: 5, user_id: 2, tipe: 'Keluar', nominal: 2100000, keterangan: 'Biaya ekspedisi pengiriman logistik nusantara', tanggal: '2026-06-18', jenis: 'MANUAL' },
  { id: 12, account_id: 2, category_id: 2, user_id: 2, tipe: 'Masuk', nominal: 7200000, keterangan: 'Donasi Berkah Waisak Cetak Kitab Suci Bulan Mei', tanggal: '2026-05-15', jenis: 'MANUAL' },
  { id: 13, account_id: 3, category_id: 6, user_id: 2, tipe: 'Keluar', nominal: 4800000, keterangan: 'Pelunasan Cetak Bodhicaryavatara Batch 2', tanggal: '2026-05-10', jenis: 'MANUAL' },
  { id: 14, account_id: 2, category_id: 1, user_id: 2, tipe: 'Masuk', nominal: 4100000, keterangan: 'Penjualan Buku Penerbitan Bulan April', tanggal: '2026-04-28', jenis: 'MANUAL' },
  { id: 15, account_id: 1, category_id: 5, user_id: 2, tipe: 'Keluar', nominal: 1750000, keterangan: 'Pengeluaran ATK dan utilitas bulanan April', tanggal: '2026-04-20', jenis: 'MANUAL' },
];

export const DEMO_PENGAJUAN: PengajuanCetak[] = [
  { id: 1, buku_id: 5, jumlah_pengajuan: 150, status: 'pending', created_at: '2026-08-30 11:00:00' },
  { id: 2, buku_id: 3, jumlah_pengajuan: 200, status: 'approved', catatan_bendahara: 'Disetujui. Dana cair dari Mandiri Penerbitan.', created_at: '2026-08-24 14:00:00' },
];

export const DEMO_PENJUALAN: Penjualan[] = [
  { id: 1, no_invoice: 'INV-20260830-0001', nama_pelanggan: 'ANAND KRISHNA WIJAYA', total_item: 3, total_bayar: 395000, tanggal_penjualan: '2026-08-30 10:35:00' },
  { id: 2, no_invoice: 'INV-20260827-0099', nama_pelanggan: 'Bazar Buku Dharma Pluit', total_item: 18, total_bayar: 1850000, tanggal_penjualan: '2026-08-27 16:40:00' },
];

export const DEMO_PENYALURAN: Penyaluran[] = [
  { id: 1, no_invoice: 'INV-20260830-0001', buku_id: 1, qty: 2, nama_agen: 'Anand Krishna Wijaya', status: 'proses packing', created_at: '2026-08-30 10:31:00' },
  { id: 2, no_invoice: 'INV-20260830-0001', buku_id: 3, qty: 1, nama_agen: 'Anand Krishna Wijaya', status: 'proses packing', created_at: '2026-08-30 10:31:00' },
];

export const DEMO_LOGISTIC_LOGS: LogisticLog[] = [
  { id: 1, buku_id: 1, qty_keluar: 2, tujuan: 'Anand Krishna Wijaya (Jakarta)', keterangan: 'Invoice #INV-20260830-0001', created_at: '2026-08-30 15:00:00' },
  { id: 2, buku_id: 4, qty_keluar: 10, tujuan: 'Distribusi Donasi Vihara Semarang', keterangan: 'Penyaluran Buku Dharma', created_at: '2026-08-28 09:30:00' },
];

export const DEMO_PRODUCTION_LOGS: ProductionLog[] = [
  { id: 1, buku_id: 1, qty_produksi: 100, tanggal_produksi: '2026-08-26 14:00:00' },
  { id: 2, buku_id: 6, qty_produksi: 150, tanggal_produksi: '2026-08-22 10:00:00' },
];

export const DEMO_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 1, user_id: 4, user_name: 'Diana Wijaya', divisi_id: 4, divisi_name: 'Marketing & Distribution', aksi: 'Konfirmasi Lunas', model: 'Order', keterangan: 'Mengubah status invoice INV-20260830-0001 menjadi LUNAS. Data disinkronkan ke Finance & antrean packing Logistik.', created_at: '2026-08-30 10:35:00' },
  { id: 5, user_id: 4, user_name: 'Diana Wijaya', divisi_id: 4, divisi_name: 'Marketing & Distribution', aksi: 'Tambah Pesanan', model: 'Order', keterangan: 'Membuat invoice baru INV-20260831-0002 untuk Meiliana Susanto (Surabaya) senilai Rp 725.000.', created_at: '2026-08-31 09:15:00' },
  { id: 6, user_id: 4, user_name: 'Diana Wijaya', divisi_id: 4, divisi_name: 'Marketing & Distribution', aksi: 'Tambah Promo', model: 'Promo', keterangan: 'Menerbitkan kode promo baru DHARMA10 (Diskon 10% untuk buku filosofi).', created_at: '2026-08-25 14:00:00' },
  { id: 2, user_id: 1, user_name: 'Direktur Utama', divisi_id: 1, divisi_name: 'Direktorat & HRD', aksi: 'Tambah Identitas', model: 'Identitas', keterangan: 'Mendaftarkan anggota kehormatan baru: "VENERABLE BHIKKHU DHAMMAVIRA" status VIP.', created_at: '2026-08-20 10:15:00' },
  { id: 3, user_id: 2, user_name: 'Siti Rahmawati', divisi_id: 2, divisi_name: 'Bendahara / Finance', aksi: 'Setujui Cetak Buku', model: 'PengajuanCetak', keterangan: 'Menyetujui cetak ulang buku "Bodhicaryavatara" sejumlah 200 Eks (Biaya: Rp 4.000.000 cair dari Bank Mandiri).', created_at: '2026-08-24 14:30:00' },
  { id: 4, user_id: 3, user_name: 'Budi Santoso', divisi_id: 3, divisi_name: 'Penerbitan', aksi: 'Tambah Buku', model: 'Book', keterangan: 'Mendaftarkan buku baru ke katalog: "Jalan Cahaya Pencerahan Batin" karya Geshe Lhundub Sopa.', created_at: '2026-08-18 11:20:00' },
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

export const DEMO_BAZAAR_EVENTS: BazaarEvent[] = [
  {
    id: 1,
    nama_event: 'Bazar Waisak Nasional Jakarta 2026',
    lokasi: 'JIExpo Kemayoran Hall B, Jakarta Pusat',
    tanggal_mulai: '2026-09-25',
    tanggal_selesai: '2026-09-28',
    penanggung_jawab: 'Diana Wijaya (Marketing)',
    kontak_pic: '0812-3456-7893',
    status: 'Sedang Berlangsung',
    items: [
      { buku_id: 1, judul_buku: 'Pembebasan di Tangan Kita (Lamrim)', qty_dibawa: 25, qty_terjual: 14, qty_kembali: 11, qty_rusak_hilang: 0, harga_satuan: 145000, catatan: 'Best seller di stan utama' },
      { buku_id: 2, judul_buku: 'Untaian Permata Ajaran Buddha', qty_dibawa: 20, qty_terjual: 12, qty_kembali: 8, qty_rusak_hilang: 0, harga_satuan: 95000 },
      { buku_id: 3, judul_buku: 'Bodhicaryavatara (Panduan Hidup Bodhisattva)', qty_dibawa: 15, qty_terjual: 9, qty_kembali: 6, qty_rusak_hilang: 0, harga_satuan: 120000 },
      { buku_id: 6, judul_buku: 'Transformasi Pikiran Delapan Bait (Lojong)', qty_dibawa: 30, qty_terjual: 22, qty_kembali: 8, qty_rusak_hilang: 0, harga_satuan: 55000, catatan: 'Buku saku favorit pengunjung' }
    ],
    catatan: 'Stand B-12 berdekatan dengan panggung utama puja akbar. Tersedia pembayaran QRIS & Tunai.',
    total_buku_dibawa: 90,
    total_buku_terjual: 57,
    total_buku_kembali: 33,
    total_omzet: 5460000,
    stok_gudang_dipotong: true,
    created_at: '2026-09-20 09:00:00'
  },
  {
    id: 2,
    nama_event: 'Retreat Meditasi Lamrim Nusantara',
    lokasi: 'Vihara Mendut & Padepokan Magelang, Jawa Tengah',
    tanggal_mulai: '2026-10-10',
    tanggal_selesai: '2026-10-14',
    penanggung_jawab: 'Hendra Gunawan (Logistik)',
    kontak_pic: '0812-3456-7895',
    status: 'Buku Dialokasikan',
    items: [
      { buku_id: 1, judul_buku: 'Pembebasan di Tangan Kita (Lamrim)', qty_dibawa: 15, qty_terjual: 0, qty_kembali: 15, qty_rusak_hilang: 0, harga_satuan: 145000 },
      { buku_id: 4, judul_buku: 'Meditasi & Jalan Menuju Ketenangan Batin', qty_dibawa: 25, qty_terjual: 0, qty_kembali: 25, qty_rusak_hilang: 0, harga_satuan: 80000 },
      { buku_id: 8, judul_buku: 'Seni Welas Asih Sehari-hari', qty_dibawa: 20, qty_terjual: 0, qty_kembali: 20, qty_rusak_hilang: 0, harga_satuan: 90000 }
    ],
    catatan: 'Buku telah dipacking dalam 2 kardus tersegel rapi untuk dibawa tim kendaraan darat.',
    total_buku_dibawa: 60,
    total_buku_terjual: 0,
    total_buku_kembali: 60,
    total_omzet: 0,
    stok_gudang_dipotong: true,
    created_at: '2026-09-18 14:30:00'
  },
  {
    id: 3,
    nama_event: 'Pameran Buku Buddhis Surabaya',
    lokasi: 'Grand City Mall Convention, Surabaya',
    tanggal_mulai: '2026-08-20',
    tanggal_selesai: '2026-08-23',
    penanggung_jawab: 'Diana Wijaya (Marketing)',
    kontak_pic: '0812-3456-7893',
    status: 'Selesai Rekonsiliasi',
    items: [
      { buku_id: 3, judul_buku: 'Bodhicaryavatara (Panduan Hidup Bodhisattva)', qty_dibawa: 20, qty_terjual: 16, qty_kembali: 3, qty_rusak_hilang: 1, harga_satuan: 120000, catatan: '1 eks cacat cover saat dipajang' },
      { buku_id: 7, judul_buku: 'Dharmapada Bergambar Edisi Nusantara', qty_dibawa: 12, qty_terjual: 10, qty_kembali: 2, qty_rusak_hilang: 0, harga_satuan: 175000 },
      { buku_id: 10, judul_buku: 'Jalan Cahaya Pencerahan Batin', qty_dibawa: 15, qty_terjual: 12, qty_kembali: 3, qty_rusak_hilang: 0, harga_satuan: 130000 }
    ],
    catatan: 'Acara sukses besar, rekonsiliasi selesai, 8 buku sisa telah kembali ke gudang pusat.',
    total_buku_dibawa: 47,
    total_buku_terjual: 38,
    total_buku_kembali: 8,
    total_omzet: 5230000,
    stok_gudang_dipotong: true,
    created_at: '2026-08-15 10:00:00'
  }
];

export const MEMBERSHIP_TIERS: MembershipTierConfig[] = [
  {
    level: 'Bronze',
    nama_tier: 'Sahabat Perunggu',
    min_akumulasi: 0,
    diskon_persen: 5,
    warna_badge: 'text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300',
    border_badge: 'border-amber-300 dark:border-amber-800',
    bg_gradient: 'from-amber-700 via-amber-800 to-amber-950',
    keuntungan: [
      'Diskon 5% untuk semua pembelian buku terbitan Lamrimnesia',
      'Buletin digital & info bedah buku bulanan',
      'Akses ke sesi tanya jawab Dharma online'
    ]
  },
  {
    level: 'Silver',
    nama_tier: 'Sahabat Perak',
    min_akumulasi: 500000,
    diskon_persen: 10,
    warna_badge: 'text-slate-800 bg-slate-200 dark:bg-slate-800 dark:text-slate-200',
    border_badge: 'border-slate-300 dark:border-slate-600',
    bg_gradient: 'from-slate-500 via-slate-700 to-slate-900',
    keuntungan: [
      'Diskon 10% untuk buku reguler & merchandise Dharma',
      'Gratis ongkir reguler untuk pemesanan event tertentu',
      'Hak pesan khusus Pre-Order gelombang pertama (Early Bird)',
      'Semua keuntungan Sahabat Perunggu'
    ]
  },
  {
    level: 'Gold',
    nama_tier: 'Sahabat Emas',
    min_akumulasi: 2500000,
    diskon_persen: 15,
    warna_badge: 'text-yellow-900 bg-yellow-200 dark:bg-yellow-900/60 dark:text-yellow-300',
    border_badge: 'border-yellow-400 dark:border-yellow-700',
    bg_gradient: 'from-amber-500 via-yellow-600 to-amber-800',
    keuntungan: [
      'Diskon 15% untuk seluruh pesanan buku & bundling',
      'Buku bertanda tangan penulis/penerjemah saat peluncuran',
      'Undangan VIP Temu Penulis & Bedah Naskah Eksklusif',
      'Prioritas alokasi cetakan pertama edisi terbatas',
      'Semua keuntungan Sahabat Perak'
    ]
  },
  {
    level: 'Platinum',
    nama_tier: 'Patron Mahadana',
    min_akumulasi: 10000000,
    diskon_persen: 20,
    warna_badge: 'text-purple-900 bg-purple-200 dark:bg-purple-900/60 dark:text-purple-200',
    border_badge: 'border-purple-400 dark:border-purple-700',
    bg_gradient: 'from-purple-800 via-indigo-900 to-slate-950',
    keuntungan: [
      'Diskon maksimal 20% tanpa batas minimum pembelanjaan',
      'Pencantuman nama dedikasi pada halaman Donatur Cetak Abadi',
      'Kartu Fisik Logam Sahabat Lamrimnesia edisi kehormatan',
      'Konsultasi rekomendasi kurikulum bacaan Dharma pribadi',
      'Semua keuntungan Sahabat Emas'
    ]
  }
];

export const INITIAL_PRE_ORDERS: PreOrderCampaign[] = [];

export const DEMO_PRE_ORDERS: PreOrderCampaign[] = [
  {
    id: 1,
    judul_campaign: 'PO Eksklusif: Lamrim Chenmo Edisi Anotasi Lengkap (Jilid 4 & 5)',
    kode_campaign: 'PO-LRM-2026-01',
    buku_id: 1,
    buku_ids: [1, 2],
    target_kuota: 300,
    tercapai_kuota: 218,
    harga_normal: 290000,
    harga_po: 235000,
    minimal_dp: 100000,
    tanggal_mulai: '2026-09-01',
    tanggal_selesai: '2026-10-31',
    estimasi_pengiriman: '15 November 2026',
    status: 'Aktif',
    bonus_item: 'Hardcover Slipcase Kolektor + Pembatas Buku Logam Kuningan Berukir Simbol Auspicious',
    deskripsi: 'Peluncuran terjemahan naskah agung Je Tsongkhapa dengan catatan kaki para guru silsilah Nusantara.',
    total_dana_terkumpul: 51230000,
    created_at: '2026-09-01 08:00:00'
  },
  {
    id: 2,
    judul_campaign: 'PO Khusus: Riwayat Hidup Guru-Guru Silsilah Lamrim Nusantara',
    kode_campaign: 'PO-SILSILAH-02',
    buku_id: 3,
    target_kuota: 150,
    tercapai_kuota: 150,
    harga_normal: 180000,
    harga_po: 145000,
    minimal_dp: 50000,
    tanggal_mulai: '2026-08-15',
    tanggal_selesai: '2026-09-25',
    estimasi_pengiriman: '10 Oktober 2026',
    status: 'Tercapai',
    bonus_item: 'Art Print Poster Silsilah Guru Dharma Ukuran A3 Full Color Berbingkai',
    deskripsi: 'Naskah biografi inspiratif para mahaguru dari Biara Suvarnadvipa (Sriwijaya) hingga Tibet.',
    total_dana_terkumpul: 21750000,
    created_at: '2026-08-15 09:30:00'
  },
  {
    id: 3,
    judul_campaign: 'PO Buku Anak: Kisah Jataka Teladan Welas Asih Bergambar',
    kode_campaign: 'PO-JATAKA-03',
    buku_id: 7,
    target_kuota: 250,
    tercapai_kuota: 94,
    harga_normal: 150000,
    harga_po: 120000,
    minimal_dp: 50000,
    tanggal_mulai: '2026-09-10',
    tanggal_selesai: '2026-11-10',
    estimasi_pengiriman: '25 November 2026',
    status: 'Aktif',
    bonus_item: 'Sticker Pack Tokoh Bodhisattva Anak + Lembar Mewarnai Edukatif',
    deskripsi: 'Seri cerita bergambar penuh warna untuk menanamkan budi pekerti luhur bagi generasi muda Buddhis.',
    total_dana_terkumpul: 11280000,
    created_at: '2026-09-10 10:00:00'
  }
];

export const INITIAL_BOOK_BUNDLES: BookBundle[] = [];

export const DEMO_BOOK_BUNDLES: BookBundle[] = [
  {
    id: 1,
    nama_bundle: 'Paket Trilogi Lamrim Pemula',
    kode_bundle: 'BNDL-LRM-TRI',
    deskripsi: 'Paket pondasi lengkap pengenalan tahapan jalan pencerahan untuk praktisi pemula.',
    items: [
      { buku_id: 1, jumlah: 1 },
      { buku_id: 2, jumlah: 1 },
      { buku_id: 4, jumlah: 1 }
    ],
    harga_bundle: 265000,
    badge: 'Paling Laris',
    is_active: true,
    created_at: '2026-08-01 10:00:00'
  },
  {
    id: 2,
    nama_bundle: 'Paket Meditasi & Ketenangan Jiwa',
    kode_bundle: 'BNDL-MEDITASI',
    deskripsi: 'Kombinasi buku panduan meditasi harian, samatha vipassana, dan refleksi welas asih.',
    items: [
      { buku_id: 4, jumlah: 1 },
      { buku_id: 8, jumlah: 1 }
    ],
    harga_bundle: 140000,
    badge: 'Diskon 18%',
    is_active: true,
    created_at: '2026-08-10 11:30:00'
  },
  {
    id: 3,
    nama_bundle: 'Boxset Lengkap Pembebasan Abadi (Koleksi Perpustakaan)',
    kode_bundle: 'BNDL-BOXSET-VIP',
    deskripsi: 'Koleksi 5 judul utama Dharma Nusantara bersampul eksklusif untuk koleksi pribadi atau vihara.',
    items: [
      { buku_id: 1, jumlah: 1 },
      { buku_id: 2, jumlah: 1 },
      { buku_id: 3, jumlah: 1 },
      { buku_id: 7, jumlah: 1 },
      { buku_id: 10, jumlah: 1 }
    ],
    harga_bundle: 550000,
    badge: 'Edisi Terbatas',
    is_active: true,
    created_at: '2026-08-20 14:00:00'
  }
];

