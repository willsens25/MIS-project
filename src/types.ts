export type DivisionId = 1 | 2 | 3 | 4 | 5 | 6;

export interface Divisi {
  id: DivisionId;
  nama_divisi: string;
  kode: string;
  deskripsi?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  divisi_id: DivisionId;
  role?: string;
  phone?: string;
  identitas_id?: number;
  avatar?: string;
  created_at?: string;
}

export interface Book {
  id: number;
  judul: string;
  penulis: string;
  harga_jual: number;
  stok_gudang: number;
  isbn?: string;
  kategori?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Promo {
  id: number;
  code: string;
  nama_promo?: string;
  type: 'percentage' | 'nominal';
  reward_value: number;
  max_uses: number;
  used_count: number;
  start_date?: string;
  expiry_date?: string;
  buku_id_khusus?: number;
  khusus_kategori_pembeli?: string;
  khusus_identitas_id?: number;
  min_order?: number;
  deskripsi?: string;
  created_at?: string;
}

export interface SalesChannel {
  id: number;
  nama_channel: string;
  kategori?: 'Marketplace' | 'Direct / WhatsApp' | 'Direct / Offline' | 'Social Media' | 'Website' | 'Offline / Event' | 'Call Center' | 'Event' | 'Lainnya';
  deskripsi?: string;
  aktif: boolean;
  is_active?: boolean;
}

export interface Expedition {
  id: number;
  nama_ekspedisi: string;
  kode?: string;
  kategori?: 'Reguler' | 'Express / Kilat' | 'Cargo / Berat' | 'Kargo' | 'Instant / Sameday' | 'Same Day / Instant' | 'Internal / Ambil Sendiri' | 'Ambil Sendiri' | 'Lainnya';
  estimasi?: string;
  deskripsi?: string;
  aktif: boolean;
  is_active?: boolean;
}

export interface Identitas {
  id: number;
  nama_lengkap: string;
  panggilan?: string;
  jenis_identitas: 'KTP' | 'SIM' | 'Paspor';
  nomor_identitas: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'Laki-laki' | 'Perempuan' | 'pria' | 'wanita';
  kewarganegaraan?: string;
  nomor_hp_primary?: string;
  email?: string;
  pekerjaan?: string;
  alamat?: string;
  kota?: string;
  kode_pos?: string;
  agama?: string;
  status_keamanan: 'Normal' | 'VIP' | 'Pengawasan';
  kategori_identitas?: string;
  jenis_umat?: 'Anggota' | 'Simpatisan' | 'Pengurus' | 'Sangha';
  bhante_lay?: 'Bhante' | 'Ayya' | 'Lay' | null;
  is_agen_purna?: boolean | number;
  is_dharma_patriot?: boolean | number;
  divisi_id?: number | null;
  created_by?: number;
  created_at: string;
}

export interface OrderItem {
  buku_id: number;
  book?: Book;
  jumlah: number;
  harga_satuan: number;
  subtotal: number;
  kode_promo_terpakai?: string | null;
  potongan_diskon?: number;
}

export interface Order {
  id: number;
  no_invoice: string;
  tanggal_pesan: string;
  via: string;
  nama_pembeli: string;
  kontak_pembeli?: string;
  email_pembeli?: string;
  pembeli_identitas_id?: number;
  nama_penerima: string;
  kontak_penerima?: string;
  alamat_penerima: string;
  ekspedisi: string;
  ongkir: number;
  donasi?: number;
  keterangan_donasi?: string;
  status: 'Pending' | 'Lunas' | 'Dikirim' | 'Cancelled';
  total_tagihan: number;
  user_id?: number;
  keterangan?: string;
  tercatat_finance?: number | boolean;
  items: OrderItem[];
  created_at: string;
}

export interface Account {
  id: number;
  nama_akun: string;
  kode_akun: string;
  saldo_awal?: number;
}

export interface Category {
  id: number;
  nama_kategori: string;
  jenis?: 'Masuk' | 'Keluar';
}

export interface Mutasi {
  id: number;
  account_id: number;
  account?: Account;
  category_id?: number;
  category?: Category;
  user_id: number;
  tipe: 'Masuk' | 'Keluar';
  nominal: number;
  keterangan: string;
  tanggal: string;
  jenis: 'MANUAL' | 'INVOICE';
}

export interface PengajuanCetak {
  id: number;
  buku_id: number;
  buku?: Book;
  jumlah_pengajuan: number;
  status: 'pending' | 'approved' | 'rejected';
  catatan_bendahara?: string;
  created_at: string;
}

export interface Penjualan {
  id: number;
  no_invoice: string;
  nama_pelanggan: string;
  total_item: number;
  total_bayar: number;
  tanggal_penjualan: string;
}

export interface Penyaluran {
  id: number;
  no_invoice: string;
  buku_id: number;
  book?: Book;
  qty: number;
  nama_agen: string;
  status: 'proses packing' | 'dikirim';
  created_at: string;
}

export interface LogisticLog {
  id: number;
  buku_id: number;
  book?: Book;
  qty_keluar: number;
  tujuan: string;
  keterangan?: string;
  created_at: string;
}

export interface ProductionLog {
  id: number;
  buku_id: number;
  book?: Book;
  qty_produksi: number;
  tanggal_produksi: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  divisi_id?: DivisionId;
  divisi_name?: string;
  aksi: string;
  model: string;
  keterangan: string;
  ip_address?: string;
  created_at: string;
}
