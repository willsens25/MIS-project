import { DivisionId } from '../types';

export type DashboardCardCategory =
  | 'keuangan'
  | 'logistik'
  | 'marketing'
  | 'produksi'
  | 'penerbitan'
  | 'keanggotaan'
  | 'laporan';

export interface DashboardCardConfig {
  id: string;
  title: string;
  category: DashboardCardCategory;
  divisiId: DivisionId;
  divisiName: string;
  divisiCode: string;
  description: string;
  iconName: string;
  visible: boolean;
  order: number;
  badge?: string;
  colorTheme: 'emerald' | 'indigo' | 'cyan' | 'amber' | 'purple' | 'violet' | 'rose' | 'blue';
}

export type LayoutPresetKey = 'default' | 'keuangan' | 'logistik' | 'marketing' | 'produksi' | 'penerbitan';

export interface LayoutPreset {
  id: LayoutPresetKey;
  name: string;
  description: string;
  divisiId?: DivisionId;
  iconName: string;
  orderedCardIds: string[];
}

export interface DashboardLayoutSettings {
  columns: 2 | 3 | 4;
  cards: DashboardCardConfig[];
  activePreset?: LayoutPresetKey;
}

export const DEFAULT_DASHBOARD_CARDS: DashboardCardConfig[] = [
  {
    id: 'card-finance-saldo',
    title: 'Saldo Bersih Kas',
    category: 'keuangan',
    divisiId: 2,
    divisiName: 'Divisi Keuangan & Finansial',
    divisiCode: 'FIN',
    description: 'Ringkasan saldo kas aktif, arus penerimaan donasi dan pengeluaran operasional.',
    iconName: 'CreditCard',
    visible: true,
    order: 1,
    colorTheme: 'emerald'
  },
  {
    id: 'card-keanggotaan-umat',
    title: 'Basis Data Anggota Umat',
    category: 'keanggotaan',
    divisiId: 1,
    divisiName: 'Direktorat / Keanggotaan',
    divisiCode: 'DIR',
    description: 'Total umat terdaftar, donatur Dharma Patriot, anggota Sangha, dan relawan.',
    iconName: 'Users',
    visible: true,
    order: 2,
    colorTheme: 'indigo'
  },
  {
    id: 'card-marketing-invoices',
    title: 'Invoice & Omset Penjualan',
    category: 'marketing',
    divisiId: 4,
    divisiName: 'Divisi Pemasaran & Penjualan',
    divisiCode: 'MKT',
    description: 'Realisasi invoice lunas, omset penjualan buku dharma, dan tagihan pending.',
    iconName: 'ShoppingBag',
    visible: true,
    order: 3,
    colorTheme: 'cyan'
  },
  {
    id: 'card-logistik-stok',
    title: 'Total Stok Gudang Fisik',
    category: 'logistik',
    divisiId: 6,
    divisiName: 'Divisi Logistik & Distribusi',
    divisiCode: 'LOG',
    description: 'Total eksemplar buku dharma yang tersimpan dan siap didistribusikan.',
    iconName: 'Layers',
    visible: true,
    order: 4,
    colorTheme: 'amber'
  },
  {
    id: 'card-finance-persetujuan',
    title: 'Persetujuan Dana & Cetak',
    category: 'keuangan',
    divisiId: 2,
    divisiName: 'Divisi Keuangan & Finansial',
    divisiCode: 'FIN',
    description: 'Daftar pengajuan cetak buku yang memerlukan persetujuan realisasi dana.',
    iconName: 'CheckCircle2',
    visible: true,
    order: 5,
    colorTheme: 'rose'
  },
  {
    id: 'card-logistik-antrean',
    title: 'Antrean Packing & Kirim',
    category: 'logistik',
    divisiId: 6,
    divisiName: 'Divisi Logistik & Distribusi',
    divisiCode: 'LOG',
    description: 'Pesanan buku yang menunggu pengemasan dan pengambilan pihak kurir.',
    iconName: 'Truck',
    visible: true,
    order: 6,
    colorTheme: 'blue'
  },
  {
    id: 'card-marketing-agen',
    title: 'Jaringan Agen & Mitra',
    category: 'marketing',
    divisiId: 4,
    divisiName: 'Divisi Pemasaran & Penjualan',
    divisiCode: 'MKT',
    description: 'Distribusi agen buku purna aktif serta saluran penjualan offline/online.',
    iconName: 'Store',
    visible: true,
    order: 7,
    colorTheme: 'purple'
  },
  {
    id: 'card-produksi-status',
    title: 'Aktivitas Cetak Percetakan',
    category: 'produksi',
    divisiId: 5,
    divisiName: 'Divisi Produksi Percetakan',
    divisiCode: 'PROD',
    description: 'Kuantitas eksemplar hasil cetak masuk gudang dan log produksi terkini.',
    iconName: 'Factory',
    visible: true,
    order: 8,
    colorTheme: 'violet'
  },
  {
    id: 'card-penerbitan-katalog',
    title: 'Katalog Judul Buku Terbit',
    category: 'penerbitan',
    divisiId: 3,
    divisiName: 'Divisi Penerbitan Buku',
    divisiCode: 'PEN',
    description: 'Koleksi judul buku dharma terbit dan status naskah baru dalam pipeline.',
    iconName: 'BookOpen',
    visible: true,
    order: 9,
    colorTheme: 'indigo'
  },
  {
    id: 'card-annual-report',
    title: 'Akuntabilitas & Laporan Tahunan',
    category: 'laporan',
    divisiId: 1,
    divisiName: 'Direktorat Eksekutif',
    divisiCode: 'DIR',
    description: 'Konsolidasi laporan pertanggungjawaban tahunan resmi untuk Dewan Pembina.',
    iconName: 'Award',
    visible: true,
    order: 10,
    colorTheme: 'amber'
  }
];

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'default',
    name: 'Eksekutif Seimbang (Default)',
    description: 'Urutan standar seimbang merangkum seluruh divisi inti Yayasan Lamrimnesia.',
    iconName: 'LayoutGrid',
    orderedCardIds: [
      'card-finance-saldo',
      'card-keanggotaan-umat',
      'card-marketing-invoices',
      'card-logistik-stok',
      'card-finance-persetujuan',
      'card-logistik-antrean',
      'card-marketing-agen',
      'card-produksi-status',
      'card-penerbitan-katalog',
      'card-annual-report'
    ]
  },
  {
    id: 'keuangan',
    name: 'Prioritas Divisi Keuangan',
    description: 'Menempatkan arus kas, saldo bank, dan persetujuan pengeluaran di urutan teratas.',
    divisiId: 2,
    iconName: 'Wallet',
    orderedCardIds: [
      'card-finance-saldo',
      'card-finance-persetujuan',
      'card-marketing-invoices',
      'card-annual-report',
      'card-produksi-status',
      'card-logistik-stok',
      'card-keanggotaan-umat',
      'card-marketing-agen',
      'card-logistik-antrean',
      'card-penerbitan-katalog'
    ]
  },
  {
    id: 'logistik',
    name: 'Prioritas Divisi Logistik',
    description: 'Fokus pada ketersediaan stok fisik gudang, antrean packing, dan ekspedisi kirim.',
    divisiId: 6,
    iconName: 'Truck',
    orderedCardIds: [
      'card-logistik-stok',
      'card-logistik-antrean',
      'card-produksi-status',
      'card-marketing-invoices',
      'card-penerbitan-katalog',
      'card-marketing-agen',
      'card-finance-saldo',
      'card-keanggotaan-umat',
      'card-finance-persetujuan',
      'card-annual-report'
    ]
  },
  {
    id: 'marketing',
    name: 'Prioritas Pemasaran & Penjualan',
    description: 'Memprioritaskan omset invoice, pesanan baru, dan performa jaringan agen buku.',
    divisiId: 4,
    iconName: 'ShoppingBag',
    orderedCardIds: [
      'card-marketing-invoices',
      'card-marketing-agen',
      'card-logistik-antrean',
      'card-finance-saldo',
      'card-penerbitan-katalog',
      'card-logistik-stok',
      'card-keanggotaan-umat',
      'card-produksi-status',
      'card-finance-persetujuan',
      'card-annual-report'
    ]
  },
  {
    id: 'produksi',
    name: 'Prioritas Produksi Percetakan',
    description: 'Memantau kuantitas cetak eksemplar, stok gudang masuk, dan persetujuan cetak.',
    divisiId: 5,
    iconName: 'Factory',
    orderedCardIds: [
      'card-produksi-status',
      'card-finance-persetujuan',
      'card-penerbitan-katalog',
      'card-logistik-stok',
      'card-logistik-antrean',
      'card-marketing-invoices',
      'card-finance-saldo',
      'card-marketing-agen',
      'card-keanggotaan-umat',
      'card-annual-report'
    ]
  },
  {
    id: 'penerbitan',
    name: 'Prioritas Penerbitan Dharma',
    description: 'Mengedepankan katalog judul buku terbit, persetujuan cetak, dan data pembaca.',
    divisiId: 3,
    iconName: 'BookOpen',
    orderedCardIds: [
      'card-penerbitan-katalog',
      'card-produksi-status',
      'card-finance-persetujuan',
      'card-logistik-stok',
      'card-marketing-invoices',
      'card-keanggotaan-umat',
      'card-marketing-agen',
      'card-finance-saldo',
      'card-logistik-antrean',
      'card-annual-report'
    ]
  }
];
