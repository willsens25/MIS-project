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
  biaya_pokok?: number;
  stok_gudang: number;
  isbn?: string;
  kategori?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PreOrderCampaign {
  id: number;
  judul_campaign: string;
  kode_campaign: string;
  buku_id: number;
  buku_ids?: number[];
  target_kuota: number;
  tercapai_kuota: number;
  harga_normal: number;
  harga_po: number;
  minimal_dp: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  estimasi_pengiriman: string;
  status: 'Draft' | 'Aktif' | 'Tercapai' | 'Ditutup' | 'Selesai';
  bonus_item: string;
  deskripsi: string;
  total_dana_terkumpul: number;
  created_at: string;
}

export interface BookBundleItem {
  buku_id: number;
  jumlah: number;
}

export interface BookBundle {
  id: number;
  nama_bundle: string;
  kode_bundle: string;
  deskripsi: string;
  items: BookBundleItem[];
  harga_bundle: number;
  badge?: string;
  is_active: boolean;
  created_at: string;
}

export type MembershipTierLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface MembershipTierConfig {
  level: MembershipTierLevel;
  nama_tier: string;
  min_akumulasi: number;
  diskon_persen: number;
  warna_badge: string;
  border_badge: string;
  bg_gradient: string;
  keuntungan: string[];
}

export interface DonasiProyekCetak {
  id: number;
  kode_proyek: string;
  judul_proyek: string;
  buku_id?: number;
  nama_buku: string;
  penulis?: string;
  target_eksemplar: number;
  target_dana: number;
  dana_terkumpul: number;
  jumlah_donatur: number;
  tanggal_mulai: string;
  target_selesai: string;
  status: 'Penggalangan' | 'Target Tercapai' | 'Proses Cetak' | 'Selesai & Didistribusikan';
  deskripsi: string;
  tujuan_distribusi: string;
  halaman_dedikasi_catatan?: string;
  created_at: string;
}

export interface DonasiSponsorRecord {
  id: number;
  proyek_id: number;
  identitas_id?: number;
  nama_donatur: string;
  no_wa?: string;
  nominal: number;
  paket?: string;
  jumlah_eksemplar_didukung: number;
  nama_dedikasi: string;
  doa_dedikasi: string;
  tanggal: string;
  account_id: number;
  status_verifikasi: 'Terverifikasi' | 'Menunggu Konfirmasi';
  nomor_tanda_terima?: string;
  sertifikat_dikirim?: boolean;
  created_at: string;
}

export interface RoyaltiPenulis {
  id: number;
  buku_id: number;
  nama_penerima: string;
  peran: 'Penulis' | 'Penerjemah' | 'Editor' | 'Illustrator';
  no_kontak?: string;
  email?: string;
  rekening_bank?: string;
  tipe_royalti: 'persentase' | 'nominal_per_buku';
  nilai_royalti: number;
  lisensi_nama?: string;
  lisensi_asal?: string;
  lisensi_kedaluwarsa?: string;
  maksimal_cetak_lisensi?: number;
  eksemplar_tercetak?: number;
  status_lisensi: 'Aktif' | 'Mendekati Kedaluwarsa' | 'Perlu Perpanjangan';
}

export interface RoyaltiStatement {
  id: number;
  royalti_id: number;
  periode: string;
  total_terjual: number;
  total_omzet: number;
  total_hak_royalti: number;
  status_bayar: 'Belum Dibayar' | 'Sudah Ditransfer';
  tanggal_bayar?: string;
  nomor_referensi_bayar?: string;
  catatan?: string;
  created_at: string;
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
  jabatan?: string;
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

export interface BankStatementItem {
  id: string;
  account_id: number;
  tanggal: string;
  keterangan: string;
  tipe: 'Masuk' | 'Keluar'; // Masuk = Kredit (Uang Masuk ke Bank), Keluar = Debet (Uang Keluar dari Bank)
  nominal: number;
  referensi?: string;
  saldo_setelahnya?: number;
  status_rekonsiliasi: 'Cocok' | 'Belum Cocok' | 'Setoran Dalam Perjalanan' | 'Cek Beredar' | 'Penyesuaian Buku';
  matched_mutasi_id?: number;
  catatan?: string;
  created_at?: string;
}

export interface BankReconciliationRecord {
  id: string;
  account_id: number;
  periode_bulan: string; // Format 'YYYY-MM'
  tanggal_rekonsiliasi: string;
  saldo_buku: number;
  saldo_bank: number;
  total_setoran_dalam_perjalanan: number;
  total_cek_beredar: number;
  total_pendapatan_bank_belum_tercatat: number; // Bagi hasil / jasa giro
  total_beban_bank_belum_tercatat: number; // Biaya admin bank / pajak
  saldo_disesuaikan_buku: number;
  saldo_disesuaikan_bank: number;
  selisih: number;
  is_balanced: boolean;
  status: 'Draft' | 'Terekonsiliasi' | 'Ada Selisih';
  diverifikasi_oleh?: string;
  catatan_revisi?: string;
  created_at: string;
  updated_at?: string;
}

export interface PengajuanCetak {
  id: number;
  buku_id: number;
  buku?: Book;
  jumlah_pengajuan: number;
  status: 'pending' | 'approved' | 'rejected';
  account_id?: number;
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

export interface BazaarAllocationItem {
  buku_id: number;
  judul_buku?: string;
  qty_dibawa: number;
  qty_terjual: number;
  qty_kembali: number;
  qty_rusak?: number;
  qty_rusak_hilang?: number;
  harga_satuan?: number;
  catatan?: string;
}

export type BazaarEventStatus =
  | 'Direncanakan'
  | 'Buku Dialokasikan'
  | 'Sedang Berlangsung'
  | 'Selesai Rekonsiliasi'
  | 'Dibatalkan';

export interface BazaarEvent {
  id: number;
  nama_event: string;
  lokasi: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  penanggung_jawab: string;
  pic_nama?: string;
  kontak_pic?: string;
  pic_kontak?: string;
  target_omzet?: number;
  status: BazaarEventStatus;
  items: BazaarAllocationItem[];
  catatan?: string;
  total_buku_dibawa: number;
  total_buku_terjual: number;
  total_buku_kembali: number;
  total_omzet: number;
  stok_gudang_dipotong: boolean;
  created_at: string;
}

export type ColorPresetId =
  | 'corporate-blue'
  | 'deep-forest'
  | 'royal-indigo'
  | 'crimson-dharma'
  | 'ocean-teal'
  | 'sunset-amber';

export type ThemeMode = 'light' | 'dark' | 'system-synced';

export type NightShiftScheduleType = 'overtime-hours' | 'sunset-to-sunrise' | 'always-on-dark' | 'manual';

export type NightShiftPreset = 'balanced' | 'deep-night' | 'paper-reading' | 'minimal' | 'custom';

export interface NightShiftConfig {
  enabled: boolean;          // Is Night Shift mode toggled ON
  autoOvertime: boolean;     // Automatically engages during overtime / night hours
  scheduleType: NightShiftScheduleType;
  startTime: string;         // Overtime start time, e.g. "19:00"
  endTime: string;           // Overtime end time, e.g. "06:00"
  warmth: number;            // 0 - 100% (Amber temperature / blue-light reduction)
  contrast: number;          // 70 - 100% (Soft contrast / anti-glare easing)
  brightness: number;        // 70 - 100% (Backlight dimming for late night comfort)
  preset: NightShiftPreset;
}

export interface UserSettings {
  mascotSpeechBubbleEnabled: boolean; // Toggle mascot speech bubbles on/off globally
  mascotSoundEffectsEnabled: boolean; // Audio tactile feedback on interaction
  mascotParticleBurstEnabled: boolean; // Sparkle particle burst effect on hover
  mascotShortcutHintsEnabled: boolean; // Division contextual shortcuts in tooltip
  mascotIdleAnimationEnabled: boolean; // Toggle interactive idle animations (blinking, slight floating bob)
  themeMode?: ThemeMode; // 'light' | 'dark' | 'system-synced' (auto-switching based on local sunrise & sunset)
  autoThemeCoordinates?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  nightShift?: NightShiftConfig; // Night Shift Mode settings for overtime comfort
}

export interface BoardResolutionItem {
  id: string;
  category: 'Anggaran & Cetak' | 'Sosial & Dharma' | 'Legalitas & Hak Cipta' | 'Distribusi & Kemitraan' | 'Tata Kelola Yayasan';
  title: string;
  description: string;
  status: 'approved' | 'pending' | 'rejected';
  pic: string;
  targetDate?: string;
  notes?: string;
}

export interface PlenoMeetingRecord {
  meetingNumber: string;
  date: string;
  location: string;
  quarter: string;
  attendees: string[];
  notes: string;
  resolutions: BoardResolutionItem[];
  signedBy: {
    ketuaUmum: boolean;
    dewanPengawas: boolean;
    bendahara: boolean;
    sekretaris: boolean;
  };
}

export type ToastType = 'success' | 'warning' | 'error' | 'info' | 'urgent';
export type ToastCategory = 'order' | 'stock' | 'finance' | 'production' | 'logistic' | 'deadline' | 'system';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
  timestamp: string;
  actionLabel?: string;
  onAction?: () => void;
  category?: ToastCategory;
}

export interface BackupMetadata {
  app_version: string;
  app_name: string;
  exported_at: string;
  exported_by: {
    id?: number;
    name?: string;
    email?: string;
    role?: string;
  };
  item_counts: {
    books: number;
    orders: number;
    mutasis: number;
    accounts: number;
    identitas: number;
    pengajuans: number;
    productionLogs: number;
    logisticLogs: number;
    promos: number;
    salesChannels: number;
    expeditions: number;
    bazaarEvents: number;
    activityLogs: number;
    users: number;
  };
  system_note?: string;
}

export interface BackupData {
  version: string;
  metadata: BackupMetadata;
  data: {
    books: Book[];
    orders: Order[];
    mutasis: Mutasi[];
    accounts: Account[];
    identitasList: Identitas[];
    pengajuans: PengajuanCetak[];
    penjualans?: Penjualan[];
    penyalurans?: Penyaluran[];
    productionLogs: ProductionLog[];
    logisticLogs: LogisticLog[];
    promos: Promo[];
    salesChannels: SalesChannel[];
    expeditions: Expedition[];
    bazaarEvents: BazaarEvent[];
    activityLogs: ActivityLog[];
    usersList?: User[];
    categories?: Category[];
    userSettings?: UserSettings;
    colorPreset?: ColorPresetId;
    theme?: 'light' | 'dark';
  };
}

export interface RestoreSummary {
  booksRestored: number;
  ordersRestored: number;
  mutasisRestored: number;
  accountsRestored: number;
  identitasRestored: number;
  pengajuansRestored: number;
  productionLogsRestored: number;
  logisticLogsRestored: number;
  bazaarEventsRestored: number;
  promosRestored: number;
  timestamp: string;
}

export interface SeederSummary {
  booksAdded: number;
  identitasAdded: number;
  ordersAdded: number;
  mutasisAdded: number;
  pengajuansAdded: number;
  productionLogsAdded: number;
  logisticLogsAdded: number;
  timestamp: string;
}
