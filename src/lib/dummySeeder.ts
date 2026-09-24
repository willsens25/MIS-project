import {
  Book,
  Order,
  Mutasi,
  Identitas,
  PengajuanCetak,
  ProductionLog,
  LogisticLog,
  OrderItem
} from '../types';

export interface SeedOptions {
  bookCount: number;
  identitasCount: number;
  orderCount: number;
  mutasiCount: number;
  pengajuanCount: number;
  productionCount: number;
  logisticCount: number;
}

const DHARMA_TITLES = [
  'Permata Kebajikan Bodhisattva',
  'Jalan Bertahap Menuju Pencerahan (Lamrim)',
  'Kumpulan Sutra Kebijaksanaan Prajna',
  'Esensi Meditasi Ketenangan Samatha',
  'Panduan Moralitas & Sila Buddhis',
  'Bunga Teratai Kedamaian Hati',
  'Rangkuman Vinaya Praktis Sehari-hari',
  'Cahaya Terang Kebenaran Arya Satya',
  'Misteri Batin & Kesadaran Murni',
  'Petunjuk Ziarah Tanah Suci Dharma',
  'Pencerahan Nyata di Zaman Penuh Gejolak',
  'Kisah Jataka Nusantara Bergambar',
  'Pelajaran Welas Asih Karuna & Metta',
  'Kunci Memahami Ketergantungan Terbit (Pratityasamutpada)',
  'Nyanyian Spiritual Mahasiddha Agung'
];

const AUTHORS = [
  'Dagpo Rinpoche',
  'Lama Zopa Rinpoche',
  'Geshe Yeshe Tobden',
  'Pabongka Rinpoche',
  'Penerjemah Dewan Bahasa Nusantara',
  'Tim Editorial Lamrimnesia',
  'Atisha Dipamkara',
  'Shantideva',
  'Bhante Dhammavira Thera',
  'Ayya Santacitta'
];

const CATEGORIES = ['Filosofi', 'Meditasi', 'Sutra', 'Praktik', 'Mindset', 'Klasik', 'Koleksi'];

const CITIES = ['Jakarta Barat', 'Jakarta Utara', 'Bandung', 'Surabaya', 'Medan', 'Semarang', 'Tangerang', 'Denpasar', 'Yogyakarta', 'Palembang'];

const FIRST_NAMES = ['Budi', 'Chandra', 'David', 'Eka', 'Felix', 'Gita', 'Hendra', 'Iwan', 'Joko', 'Kevin', 'Lina', 'Maya', 'Nico', 'Olivia', 'Putra', 'Rian', 'Siti', 'Tina', 'Vina', 'Wawan'];
const LAST_NAMES = ['Wijaya', 'Susanto', 'Kusuma', 'Santoso', 'Pratama', 'Gunawan', 'Tanjung', 'Liem', 'Tan', 'Widjaja', 'Setiawan', 'Hartono', 'Halim', 'Saputra'];

const EXPEDITIONS = ['JNE REG (Reguler)', 'JNE YES (Yakin Esok Sampai)', 'SiCepat Cargo / Gokil', 'J&T Express', 'GrabExpress / GoSend', 'Anteraja Reguler'];
const CHANNELS = ['Tokopedia', 'Shopee', 'WhatsApp Marketing', 'Bazar / Event Vihara', 'Website Lamrimnesia'];

const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateSeedData = (
  options: SeedOptions,
  currentMaxIds: {
    bookId: number;
    identitasId: number;
    orderId: number;
    mutasiId: number;
    pengajuanId: number;
    productionId: number;
    logisticId: number;
  },
  existingBooks: Book[] = [],
  existingIdentitas: Identitas[] = []
) => {
  const generatedBooks: Book[] = [];
  const generatedIdentitas: Identitas[] = [];
  const generatedOrders: Order[] = [];
  const generatedMutasis: Mutasi[] = [];
  const generatedPengajuans: PengajuanCetak[] = [];
  const generatedProductionLogs: ProductionLog[] = [];
  const generatedLogisticLogs: LogisticLog[] = [];

  const now = new Date();

  // 1. Generate Books
  let curBookId = currentMaxIds.bookId;
  for (let i = 0; i < options.bookCount; i++) {
    curBookId += 1;
    const baseTitle = randomItem(DHARMA_TITLES);
    const suffix = randomInt(1, 99);
    const hargaJual = randomInt(6, 25) * 10000;
    const biayaPokok = Math.round(hargaJual * (randomInt(30, 45) / 100));

    generatedBooks.push({
      id: curBookId,
      judul: `${baseTitle} #${suffix}`,
      penulis: randomItem(AUTHORS),
      harga_jual: hargaJual,
      biaya_pokok: biayaPokok,
      stok_gudang: randomInt(10, 150),
      isbn: `978-602-${randomInt(1000, 9999)}-${randomInt(10, 99)}-${randomInt(0, 9)}`,
      kategori: randomItem(CATEGORIES)
    });
  }

  const allAvailableBooks = [...existingBooks, ...generatedBooks];

  // 2. Generate Members (Identitas)
  let curIdentitasId = currentMaxIds.identitasId;
  for (let i = 0; i < options.identitasCount; i++) {
    curIdentitasId += 1;
    const fn = randomItem(FIRST_NAMES);
    const ln = randomItem(LAST_NAMES);
    const fullName = `${fn} ${ln}`.toUpperCase();
    const city = randomItem(CITIES);
    const phone = `08${randomInt(11, 19)}${randomInt(1000000, 9999999)}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randomInt(10, 99)}@gmail.com`;

    generatedIdentitas.push({
      id: curIdentitasId,
      nama_lengkap: fullName,
      panggilan: fn,
      jenis_identitas: 'KTP',
      nomor_identitas: `317${randomInt(1000000000000, 9999999999999)}`,
      tempat_lahir: city,
      tanggal_lahir: `19${randomInt(75, 99)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
      jenis_kelamin: randomItem(['Laki-laki', 'Perempuan']),
      kewarganegaraan: 'WNI',
      nomor_hp_primary: phone,
      email: email,
      pekerjaan: randomItem(['Wiraswasta', 'Karyawan Swasta', 'PNS / Guru', 'Profesional', 'Pelajar / Mahasiswa']),
      alamat: `Jl. Dharma Kencana No. ${randomInt(1, 150)}, ${city}`,
      kota: city,
      kode_pos: `${randomInt(10000, 99999)}`,
      agama: 'Buddha',
      status_keamanan: randomItem<'Normal' | 'VIP' | 'Pengawasan'>(['Normal', 'VIP', 'Pengawasan']),
      jenis_umat: randomItem<'Anggota' | 'Simpatisan' | 'Pengurus' | 'Sangha'>(['Anggota', 'Simpatisan', 'Pengurus', 'Sangha']),
      bhante_lay: 'Lay',
      is_agen_purna: randomInt(0, 1),
      is_dharma_patriot: randomInt(0, 1),
      divisi_id: randomItem([1, 2, 3, 4, null]),
      created_by: 1,
      created_at: new Date(now.getTime() - randomInt(1, 60) * 86400000).toISOString().slice(0, 19).replace('T', ' ')
    });
  }

  const allAvailableIdentitas = [...existingIdentitas, ...generatedIdentitas];

  // 3. Generate Orders
  let curOrderId = currentMaxIds.orderId;
  for (let i = 0; i < options.orderCount; i++) {
    curOrderId += 1;
    const bookTarget = allAvailableBooks.length > 0 ? randomItem(allAvailableBooks) : null;
    const buyerIdentitas = allAvailableIdentitas.length > 0 ? randomItem(allAvailableIdentitas) : null;

    const buyerName = buyerIdentitas ? buyerIdentitas.nama_lengkap : `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`.toUpperCase();
    const buyerPhone = buyerIdentitas ? buyerIdentitas.nomor_hp_primary : `0812${randomInt(10000000, 99999999)}`;
    const buyerEmail = buyerIdentitas ? buyerIdentitas.email : `pembeli${curOrderId}@gmail.com`;

    const qty = randomInt(1, 4);
    const price = bookTarget ? bookTarget.harga_jual : 85000;
    const subtotal = qty * price;
    const ongkir = randomItem([0, 15000, 22000, 35000]);
    const donasi = randomItem([0, 10000, 25000, 50000]);
    const totalTagihan = subtotal + ongkir + donasi;

    const orderItems: OrderItem[] = bookTarget
      ? [
          {
            buku_id: bookTarget.id,
            jumlah: qty,
            harga_satuan: price,
            subtotal: subtotal
          }
        ]
      : [];

    // Distribute orders across the last 6 months (0 - 170 days) so 6-month charts show rich historical trends
    const dateOffsetDays = randomInt(0, 170);
    const orderDate = new Date(now.getTime() - dateOffsetDays * 86400000).toISOString().slice(0, 10);
    const dateCode = orderDate.replace(/-/g, '');
    const isLunas = Math.random() > 0.15;

    generatedOrders.push({
      id: curOrderId,
      no_invoice: `INV-${dateCode}-${String(curOrderId).padStart(4, '0')}`,
      tanggal_pesan: orderDate,
      via: randomItem(CHANNELS),
      nama_pembeli: buyerName,
      kontak_pembeli: buyerPhone,
      email_pembeli: buyerEmail,
      pembeli_identitas_id: buyerIdentitas ? buyerIdentitas.id : undefined,
      nama_penerima: buyerName,
      kontak_penerima: buyerPhone,
      alamat_penerima: buyerIdentitas?.alamat || `Jl. Merpati Indah No. ${randomInt(1, 99)}, ${randomItem(CITIES)}`,
      ekspedisi: randomItem(EXPEDITIONS),
      ongkir: ongkir,
      donasi: donasi,
      keterangan_donasi: donasi > 0 ? 'Donasi Cetak Kitab Dharma Nusantara' : undefined,
      status: isLunas ? 'Lunas' : 'Pending',
      total_tagihan: totalTagihan,
      user_id: randomItem([1, 4]),
      keterangan: 'Pemesanan katalog buku Dharma via seeder generator.',
      tercatat_finance: isLunas ? 1 : 0,
      created_at: `${orderDate} ${String(randomInt(8, 17)).padStart(2, '0')}:${String(randomInt(10, 59)).padStart(2, '0')}:00`,
      items: orderItems
    });
  }

  // 4. Generate Mutasi (Finance)
  let curMutasiId = currentMaxIds.mutasiId;
  for (let i = 0; i < options.mutasiCount; i++) {
    curMutasiId += 1;
    const isMasuk = Math.random() > 0.45;
    const nominal = isMasuk
      ? randomItem([150000, 350000, 750000, 1200000, 2500000, 5000000])
      : randomItem([85000, 250000, 600000, 1500000, 3500000]);

    // Distribute mutasi across the last 6 months (0 - 170 days) for rich financial trend visualization
    const dateOffsetDays = randomInt(0, 170);
    const mutasiDate = new Date(now.getTime() - dateOffsetDays * 86400000).toISOString().slice(0, 10);

    generatedMutasis.push({
      id: curMutasiId,
      account_id: randomItem([1, 2, 3, 4]),
      category_id: isMasuk ? randomItem([1, 2, 3]) : randomItem([4, 5, 6, 7, 8]),
      user_id: 2,
      tipe: isMasuk ? 'Masuk' : 'Keluar',
      nominal: nominal,
      keterangan: isMasuk
        ? `Penerimaan dana ${randomItem(['donasi sponsorship', 'pelunasan pesanan buku', 'bazar vihara', 'penjualan marketplace'])}`
        : `Pengeluaran ${randomItem(['biaya operasional cetak', 'ongkos kirim logistik', 'utilitas kantor sekretariat', 'kertas naskah'])}`,
      tanggal: mutasiDate,
      jenis: 'MANUAL'
    });
  }

  // 5. Generate Pengajuan Cetak
  let curPengajuanId = currentMaxIds.pengajuanId;
  for (let i = 0; i < options.pengajuanCount; i++) {
    curPengajuanId += 1;
    const bId = allAvailableBooks.length > 0 ? randomItem(allAvailableBooks).id : 1;
    const status = randomItem<'pending' | 'approved' | 'rejected'>(['pending', 'approved', 'rejected']);

    generatedPengajuans.push({
      id: curPengajuanId,
      buku_id: bId,
      jumlah_pengajuan: randomItem([100, 200, 300, 500, 1000]),
      status: status,
      catatan_bendahara: status === 'approved' ? 'Disetujui untuk cetak fisik gelombang ini.' : undefined,
      created_at: new Date(now.getTime() - randomInt(1, 20) * 86400000).toISOString().slice(0, 19).replace('T', ' ')
    });
  }

  // 6. Generate Production Logs
  let curProductionId = currentMaxIds.productionId;
  for (let i = 0; i < options.productionCount; i++) {
    curProductionId += 1;
    const bId = allAvailableBooks.length > 0 ? randomItem(allAvailableBooks).id : 1;

    generatedProductionLogs.push({
      id: curProductionId,
      buku_id: bId,
      qty_produksi: randomItem([100, 150, 200, 300, 500]),
      tanggal_produksi: new Date(now.getTime() - randomInt(1, 25) * 86400000).toISOString().slice(0, 19).replace('T', ' ')
    });
  }

  // 7. Generate Logistic Logs
  let curLogisticId = currentMaxIds.logisticId;
  for (let i = 0; i < options.logisticCount; i++) {
    curLogisticId += 1;
    const bId = allAvailableBooks.length > 0 ? randomItem(allAvailableBooks).id : 1;
    const city = randomItem(CITIES);

    generatedLogisticLogs.push({
      id: curLogisticId,
      buku_id: bId,
      qty_keluar: randomInt(2, 20),
      tujuan: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)} (${city})`,
      keterangan: `Pengiriman paket ekspedisi batch #${curLogisticId}`,
      created_at: new Date(now.getTime() - randomInt(1, 25) * 86400000).toISOString().slice(0, 19).replace('T', ' ')
    });
  }

  return {
    books: generatedBooks,
    identitas: generatedIdentitas,
    orders: generatedOrders,
    mutasis: generatedMutasis,
    pengajuans: generatedPengajuans,
    productionLogs: generatedProductionLogs,
    logisticLogs: generatedLogisticLogs
  };
};
