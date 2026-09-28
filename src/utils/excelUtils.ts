import * as XLSX from 'xlsx';
import { Book, Identitas, Order, Mutasi } from '../types';
import { computeMemberLoyaltyProfile } from './membershipUtils';

export type ExportFormat = 'xlsx' | 'csv';

/**
 * Trigger file download in browser with proper MIME type
 */
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format timestamp for filename
 */
function getTimestampString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${min}`;
}

// ========================================================
// 1. EXPORT FUNCTIONS
// ========================================================

/**
 * Export Books catalog to Excel / CSV
 */
export function exportBooksToExcel(books: Book[], format: ExportFormat = 'xlsx') {
  const data = books.map((b, index) => ({
    'No': index + 1,
    'ID Sistem': b.id,
    'Judul Buku': b.judul,
    'Penulis / Editor': b.penulis,
    'Kategori': b.kategori || 'Umum',
    'ISBN': b.isbn || '-',
    'Harga Jual (Rp)': b.harga_jual,
    'HPP Biaya Pokok (Rp)': b.biaya_pokok || 0,
    'Margin Keuntungan (Rp)': Math.max(0, b.harga_jual - (b.biaya_pokok || 0)),
    'Stok Gudang (Eks)': b.stok_gudang,
    'Status Stok': b.stok_gudang <= 0 ? 'Habis' : b.stok_gudang < 10 ? 'Menipis' : 'Aman'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // ID
    { wch: 40 }, // Judul
    { wch: 28 }, // Penulis
    { wch: 18 }, // Kategori
    { wch: 18 }, // ISBN
    { wch: 16 }, // Harga Jual
    { wch: 16 }, // HPP
    { wch: 18 }, // Margin
    { wch: 16 }, // Stok
    { wch: 12 }  // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Katalog Buku');

  const filename = `Katalog_Buku_Lamrimnesia_${getTimestampString()}.${format}`;
  if (format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  } else {
    XLSX.writeFile(workbook, filename);
  }
}

/**
 * Export Members / Identitas to Excel / CSV
 */
export function exportMembersToExcel(
  identitasList: Identitas[],
  orders: Order[] = [],
  format: ExportFormat = 'xlsx'
) {
  const data = identitasList.map((m, index) => {
    const profile = orders.length > 0 ? computeMemberLoyaltyProfile(m, orders) : null;
    return {
      'No': index + 1,
      'ID Sistem': m.id,
      'No. Sahabat': profile?.memberCode || `SLM-${String(m.id).padStart(4, '0')}`,
      'Nama Lengkap': m.nama_lengkap,
      'Panggilan': m.panggilan || '',
      'Status Umat': m.bhante_lay === 'Bhante' ? 'Bhante (Sangha)' : m.bhante_lay === 'Ayya' ? 'Ayya (Sangha)' : m.jenis_umat || 'Umat',
      'No. HP / WhatsApp': m.nomor_hp_primary || '',
      'Email': m.email || '',
      'Jenis Identitas': m.jenis_identitas,
      'Nomor Identitas (NIK)': m.nomor_identitas || '',
      'Kota': m.kota || '',
      'Alamat Lengkap': m.alamat || '',
      'Pekerjaan': m.pekerjaan || '',
      'Tier Sahabat': profile?.tier.nama_tier || 'Sahabat Perunggu',
      'Hak Diskon (%)': profile?.tier.diskon_persen || 5,
      'Total Akumulasi (Rp)': profile?.totalAkumulasi || 0,
      'Jumlah Pesanan': profile?.orderCount || 0
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 10 }, // ID
    { wch: 14 }, // No Sahabat
    { wch: 30 }, // Nama Lengkap
    { wch: 15 }, // Panggilan
    { wch: 16 }, // Status
    { wch: 18 }, // No HP
    { wch: 25 }, // Email
    { wch: 14 }, // Jenis ID
    { wch: 20 }, // NIK
    { wch: 16 }, // Kota
    { wch: 40 }, // Alamat
    { wch: 20 }, // Pekerjaan
    { wch: 18 }, // Tier
    { wch: 14 }, // Diskon
    { wch: 18 }, // Akumulasi
    { wch: 14 }  // Pesanan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Database Anggota');

  const filename = `Database_Anggota_Sahabat_${getTimestampString()}.${format}`;
  if (format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  } else {
    XLSX.writeFile(workbook, filename);
  }
}

/**
 * Export Sales & Invoices to Excel / CSV
 */
export function exportOrdersToExcel(orders: Order[], format: ExportFormat = 'xlsx') {
  const data = orders.map((o, index) => {
    const itemsSummary = o.items.map(it => `${it.book?.judul || `Buku #${it.buku_id}`} (${it.jumlah}x)`).join('; ');
    return {
      'No': index + 1,
      'No. Invoice': o.no_invoice,
      'Tanggal Pesan': o.tanggal_pesan,
      'Nama Pembeli': o.nama_pembeli,
      'Kontak Pembeli': o.kontak_pembeli || '-',
      'Nama Penerima': o.nama_penerima || o.nama_pembeli,
      'Alamat Pengiriman': o.alamat_penerima || '-',
      'Saluran Penjualan': o.via,
      'Ekspedisi': o.ekspedisi,
      'Ongkir (Rp)': o.ongkir,
      'Donasi (Rp)': o.donasi || 0,
      'Total Tagihan (Rp)': o.total_tagihan,
      'Status Pembayaran': o.status,
      'Rincian Buku': itemsSummary,
      'Catatan': o.keterangan || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 20 }, // Invoice
    { wch: 14 }, // Tanggal
    { wch: 25 }, // Pembeli
    { wch: 16 }, // Kontak
    { wch: 25 }, // Penerima
    { wch: 35 }, // Alamat
    { wch: 18 }, // Saluran
    { wch: 18 }, // Ekspedisi
    { wch: 14 }, // Ongkir
    { wch: 14 }, // Donasi
    { wch: 18 }, // Total
    { wch: 14 }, // Status
    { wch: 45 }, // Rincian
    { wch: 30 }  // Catatan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');

  const filename = `Laporan_Penjualan_Invoice_${getTimestampString()}.${format}`;
  if (format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  } else {
    XLSX.writeFile(workbook, filename);
  }
}

/**
 * Export Financial Journal / Mutasi to Excel / CSV
 */
export function exportMutasisToExcel(mutasis: Mutasi[], format: ExportFormat = 'xlsx') {
  const data = mutasis.map((m, index) => ({
    'No': index + 1,
    'ID Mutasi': m.id,
    'Tanggal': m.tanggal,
    'Akun Rekening': m.account?.nama_akun || `Akun #${m.account_id}`,
    'Kategori': m.category?.nama_kategori || '-',
    'Tipe': m.tipe,
    'Nominal (Rp)': m.nominal,
    'Keterangan': m.keterangan || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // ID
    { wch: 14 }, // Tanggal
    { wch: 25 }, // Akun
    { wch: 20 }, // Kategori
    { wch: 12 }, // Tipe
    { wch: 18 }, // Nominal
    { wch: 40 }  // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jurnal Mutasi');

  const filename = `Jurnal_Mutasi_Keuangan_${getTimestampString()}.${format}`;
  if (format === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
  } else {
    XLSX.writeFile(workbook, filename);
  }
}

// ========================================================
// 2. TEMPLATE GENERATORS
// ========================================================

/**
 * Download sample official Book Import template (.xlsx)
 */
export function downloadBookTemplateExcel() {
  const sampleData = [
    {
      'Judul Buku (Wajib)': 'Pembebasan di Tangan Kita (Lamrim)',
      'Penulis / Editor': 'Pabongka Rinpoche',
      'Kategori': 'Filsafat Lamrim',
      'ISBN': '978-602-1234-01-1',
      'Harga Jual (Rp)': 145000,
      'Biaya Pokok HPP (Rp)': 58000,
      'Stok Awal Gudang': 120
    },
    {
      'Judul Buku (Wajib)': 'Meditasi & Jalan Menuju Ketenangan Batin',
      'Penulis / Editor': 'Lama Zopa Rinpoche',
      'Kategori': 'Meditasi & Praktik',
      'ISBN': '978-602-1234-02-8',
      'Harga Jual (Rp)': 80000,
      'Biaya Pokok HPP (Rp)': 32000,
      'Stok Awal Gudang': 50
    },
    {
      'Judul Buku (Wajib)': 'Bodhicaryavatara (Panduan Hidup Bodhisattva)',
      'Penulis / Editor': 'Santideva',
      'Kategori': 'Teks Klasik',
      'ISBN': '978-602-1234-03-5',
      'Harga Jual (Rp)': 120000,
      'Biaya Pokok HPP (Rp)': 48000,
      'Stok Awal Gudang': 75
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 45 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 16 },
    { wch: 20 },
    { wch: 16 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Buku');
  XLSX.writeFile(workbook, 'Template_Import_Buku_Lamrimnesia.xlsx');
}

/**
 * Download sample official Member Import template (.xlsx)
 */
export function downloadMemberTemplateExcel() {
  const sampleData = [
    {
      'Nama Lengkap (Wajib)': 'SURYA DHARMA PUTRA',
      'Panggilan': 'Surya',
      'No. WhatsApp / HP': '081234567890',
      'Email': 'surya.dharma@gmail.com',
      'No. Identitas (KTP/SIM)': '3171021405880001',
      'Kota': 'Jakarta Pusat',
      'Alamat Lengkap': 'Jl. Diponegoro No. 88, Menteng',
      'Status / Peran': 'Anggota',
      'Pekerjaan': 'Wiraswasta'
    },
    {
      'Nama Lengkap (Wajib)': 'VEN. DHAMMAVIRA THURA',
      'Panggilan': 'Bhante Dhammavira',
      'No. WhatsApp / HP': '081122334455',
      'Email': 'dhammavira@vihara.org',
      'No. Identitas (KTP/SIM)': '3273021105750003',
      'Kota': 'Bandung',
      'Alamat Lengkap': 'Vihara Bodhi Mandala, Lembang',
      'Status / Peran': 'Sangha',
      'Pekerjaan': 'Rohaniwan'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 20 },
    { wch: 25 },
    { wch: 22 },
    { wch: 18 },
    { wch: 35 },
    { wch: 16 },
    { wch: 20 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template_Anggota');
  XLSX.writeFile(workbook, 'Template_Import_Anggota_Lamrimnesia.xlsx');
}

// ========================================================
// 3. SPREADSHEET PARSER
// ========================================================

export interface ParsedBookRow {
  judul: string;
  penulis: string;
  harga_jual: number;
  biaya_pokok: number;
  stok_gudang: number;
  kategori: string;
  isbn: string;
  isValid: boolean;
  errorReason?: string;
}

export interface ParsedMemberRow {
  nama_lengkap: string;
  panggilan: string;
  nomor_hp_primary: string;
  email: string;
  nomor_identitas: string;
  jenis_identitas: 'KTP' | 'SIM' | 'Paspor';
  kota: string;
  alamat: string;
  jenis_umat: 'Anggota' | 'Simpatisan' | 'Pengurus' | 'Sangha';
  bhante_lay: 'Bhante' | 'Ayya' | 'Lay' | null;
  pekerjaan: string;
  isValid: boolean;
  errorReason?: string;
}

/**
 * Clean and parse numbers from spreadsheet cells
 */
function cleanNumeric(val: any): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).replace(/[^0-9.-]/g, '');
  const n = parseFloat(str);
  return isNaN(n) ? 0 : Math.round(n);
}

/**
 * Normalize column key for flexible matching
 */
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parse uploaded spreadsheet file into Book rows
 */
export async function parseBookSpreadsheet(file: File): Promise<ParsedBookRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return rawRows.map(row => {
    // Look up keys dynamically
    let judul = '';
    let penulis = '';
    let kategori = '';
    let isbn = '';
    let harga_jual = 0;
    let biaya_pokok = 0;
    let stok_gudang = 0;

    for (const [key, val] of Object.entries(row)) {
      const norm = normalizeKey(key);
      const valStr = String(val).trim();

      if (norm.includes('judul') || norm.includes('title') || norm.includes('namabuku')) {
        judul = valStr;
      } else if (norm.includes('penulis') || norm.includes('author') || norm.includes('editor')) {
        penulis = valStr;
      } else if (norm.includes('kategori') || norm.includes('category') || norm.includes('genre')) {
        kategori = valStr;
      } else if (norm.includes('isbn')) {
        isbn = valStr;
      } else if (norm.includes('hargajual') || norm.includes('harga') || norm.includes('price')) {
        harga_jual = cleanNumeric(val);
      } else if (norm.includes('hpp') || norm.includes('biayapokok') || norm.includes('cost')) {
        biaya_pokok = cleanNumeric(val);
      } else if (norm.includes('stok') || norm.includes('qty') || norm.includes('stock')) {
        stok_gudang = cleanNumeric(val);
      }
    }

    const isValid = Boolean(judul && judul.trim().length > 0 && harga_jual >= 0);
    const errorReason = !judul ? 'Judul buku wajib diisi' : harga_jual < 0 ? 'Harga jual tidak boleh negatif' : undefined;

    return {
      judul: judul || 'Tanpa Judul',
      penulis: penulis || 'Tim Penerjemah',
      kategori: kategori || 'Umum',
      isbn: isbn || '',
      harga_jual,
      biaya_pokok: biaya_pokok > 0 ? biaya_pokok : Math.round(harga_jual * 0.4),
      stok_gudang,
      isValid,
      errorReason
    };
  });
}

/**
 * Parse uploaded spreadsheet file into Member rows
 */
export async function parseMemberSpreadsheet(file: File): Promise<ParsedMemberRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  return rawRows.map(row => {
    let nama_lengkap = '';
    let panggilan = '';
    let nomor_hp_primary = '';
    let email = '';
    let nomor_identitas = '';
    let jenis_identitas: 'KTP' | 'SIM' | 'Paspor' = 'KTP';
    let kota = '';
    let alamat = '';
    let status_umat_str = '';
    let pekerjaan = '';

    for (const [key, val] of Object.entries(row)) {
      const norm = normalizeKey(key);
      const valStr = String(val).trim();

      if (norm.includes('nama') && !norm.includes('panggilan')) {
        nama_lengkap = valStr;
      } else if (norm.includes('panggilan') || norm.includes('alias')) {
        panggilan = valStr;
      } else if (norm.includes('hp') || norm.includes('wa') || norm.includes('telepon') || norm.includes('phone') || norm.includes('kontak')) {
        nomor_hp_primary = valStr;
      } else if (norm.includes('email') || norm.includes('surel')) {
        email = valStr;
      } else if (norm.includes('nik') || norm.includes('ktp') || norm.includes('identitas')) {
        nomor_identitas = valStr;
      } else if (norm.includes('kota') || norm.includes('city')) {
        kota = valStr;
      } else if (norm.includes('alamat') || norm.includes('address')) {
        alamat = valStr;
      } else if (norm.includes('status') || norm.includes('umat') || norm.includes('peran') || norm.includes('role')) {
        status_umat_str = valStr.toLowerCase();
      } else if (norm.includes('pekerjaan') || norm.includes('job')) {
        pekerjaan = valStr;
      }
    }

    const isSangha = status_umat_str.includes('sangha') || status_umat_str.includes('bhante') || status_umat_str.includes('ayya') || nama_lengkap.toLowerCase().includes('bhante');
    const bhante_lay = isSangha ? (nama_lengkap.toLowerCase().includes('ayya') ? 'Ayya' : 'Bhante') : 'Lay';
    const jenis_umat: 'Anggota' | 'Simpatisan' | 'Pengurus' | 'Sangha' =
      isSangha ? 'Sangha' :
      status_umat_str.includes('pengurus') ? 'Pengurus' :
      status_umat_str.includes('simpatisan') ? 'Simpatisan' : 'Anggota';

    const isValid = Boolean(nama_lengkap && nama_lengkap.trim().length > 0);
    const errorReason = !nama_lengkap ? 'Nama lengkap wajib diisi' : undefined;

    return {
      nama_lengkap: nama_lengkap || 'Tanpa Nama',
      panggilan: panggilan || nama_lengkap.split(' ')[0] || '',
      nomor_hp_primary,
      email,
      nomor_identitas,
      jenis_identitas,
      kota,
      alamat,
      jenis_umat,
      bhante_lay,
      pekerjaan,
      isValid,
      errorReason
    };
  });
}
