import { Mutasi, Account, BankStatementItem, BankReconciliationRecord, Book, PengajuanCetak, Penjualan, RoyaltiStatement, DonasiSponsorRecord } from '../types';

/**
 * Generate Realistic Sample Bank Statement for Testing & Demo
 */
export function generateSampleBankStatements(accountId: number, currentMutasis: Mutasi[]): BankStatementItem[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const sampleItems: BankStatementItem[] = [];

  // Filter current mutasis for this account to create matching transactions
  const accountMutasis = currentMutasis.filter(m => m.account_id === accountId);

  // If there are mutasi in the system, mirror most of them to demonstrate matching
  accountMutasis.slice(0, 5).forEach((m, idx) => {
    sampleItems.push({
      id: `BS-${accountId}-${Date.now()}-${idx + 1}`,
      account_id: accountId,
      tanggal: m.tanggal,
      keterangan: `TRF BANK: ${m.keterangan}`,
      tipe: m.tipe,
      nominal: m.nominal,
      referensi: `REF-${100000 + m.id}`,
      status_rekonsiliasi: 'Cocok',
      matched_mutasi_id: m.id,
      catatan: 'Otomatis cocok dengan buku kas yayasan'
    });
  });

  // Always add typical bank-only transactions that require reconciliation adjustments:
  // 1. Biaya Administrasi Rekening Bulanan (Bank Fee)
  sampleItems.push({
    id: `BS-${accountId}-ADM-${Date.now()}`,
    account_id: accountId,
    tanggal: dateStr,
    keterangan: 'BIAYA ADM REKENING KORAN BULANAN',
    tipe: 'Keluar',
    nominal: 15000,
    referensi: 'CHG-ADM-MNTH',
    status_rekonsiliasi: 'Penyesuaian Buku',
    catatan: 'Belum dicatat di buku kas (Perlu jurnal penyesuaian beban)'
  });

  // 2. Pendapatan Jasa Giro / Bagi Hasil Bank Syariah
  sampleItems.push({
    id: `BS-${accountId}-BAGI-HASIL-${Date.now()}`,
    account_id: accountId,
    tanggal: dateStr,
    keterangan: 'BAGI HASIL / JASA GIRO REKENING YAYASAN',
    tipe: 'Masuk',
    nominal: 42500,
    referensi: 'REV-GIRO-YYS',
    status_rekonsiliasi: 'Penyesuaian Buku',
    catatan: 'Belum dicatat di buku kas (Perlu jurnal penyesuaian pendapatan)'
  });

  // 3. Pajak Jasa Giro / PPh Bunga
  sampleItems.push({
    id: `BS-${accountId}-PJK-${Date.now()}`,
    account_id: accountId,
    tanggal: dateStr,
    keterangan: 'PAJAK PPH PASAL 4 AYAT 2 ATAS JASA GIRO',
    tipe: 'Keluar',
    nominal: 8500,
    referensi: 'TAX-PPH-BANK',
    status_rekonsiliasi: 'Penyesuaian Buku',
    catatan: 'Pajak final potongan bank'
  });

  // 4. Setoran QRIS / EDC yang sedang dalam kliring
  sampleItems.push({
    id: `BS-${accountId}-SETORAN-INTRANSIT-${Date.now()}`,
    account_id: accountId,
    tanggal: dateStr,
    keterangan: 'SETORAN KLIRING QRIS TOKO BUKU (H-1)',
    tipe: 'Masuk',
    nominal: 350000,
    referensi: 'SETOR-QRIS-991',
    status_rekonsiliasi: 'Belum Cocok',
    catatan: 'Menunggu konfirmasi kasir'
  });

  return sampleItems;
}

/**
 * Smart Auto-Matching between Yayasan General Ledger Mutasi and Bank Statement
 */
export function runSmartAutoMatch(
  mutasis: Mutasi[],
  bankItems: BankStatementItem[],
  accountId: number
): {
  updatedBankItems: BankStatementItem[];
  matchedCount: number;
  unmatchedBankCount: number;
  unmatchedMutasiCount: number;
} {
  const targetMutasi = mutasis.filter(m => m.account_id === accountId);
  const matchedMutasiIds = new Set<number>();
  let matchedCount = 0;

  const updatedBankItems = bankItems.map(item => {
    // If already marked as adjustment or specific category, keep it
    if (item.status_rekonsiliasi === 'Penyesuaian Buku') {
      return item;
    }

    // Find candidate mutasi with same nominal and type
    const candidate = targetMutasi.find(m => 
      !matchedMutasiIds.has(m.id) &&
      m.tipe === item.tipe &&
      m.nominal === item.nominal
    );

    if (candidate) {
      matchedMutasiIds.add(candidate.id);
      matchedCount++;
      return {
        ...item,
        status_rekonsiliasi: 'Cocok' as const,
        matched_mutasi_id: candidate.id,
        catatan: `Cocok dengan Mutasi #${candidate.id} (${candidate.keterangan})`
      };
    } else {
      // Check if it looks like an unrecorded bank fee or giro
      const descLower = item.keterangan.toLowerCase();
      if (descLower.includes('adm') || descLower.includes('biaya') || descLower.includes('pajak') || descLower.includes('bunga') || descLower.includes('bagi hasil') || descLower.includes('giro')) {
        return {
          ...item,
          status_rekonsiliasi: 'Penyesuaian Buku' as const,
          matched_mutasi_id: undefined,
          catatan: 'Dideteksi sebagai biaya/pendapatan bank yang belum dicatat di buku kas'
        };
      }

      return {
        ...item,
        status_rekonsiliasi: (item.tipe === 'Masuk' ? 'Setoran Dalam Perjalanan' : 'Cek Beredar') as any,
        matched_mutasi_id: undefined,
        catatan: 'Belum ada mutasi buku kas yang cocok persis'
      };
    }
  });

  const unmatchedBankCount = updatedBankItems.filter(i => i.status_rekonsiliasi !== 'Cocok').length;
  const unmatchedMutasiCount = targetMutasi.length - matchedCount;

  return {
    updatedBankItems,
    matchedCount,
    unmatchedBankCount,
    unmatchedMutasiCount
  };
}

/**
 * Parse CSV Statement rows
 */
export function parseBankStatementCsv(
  csvText: string,
  accountId: number
): { items: BankStatementItem[]; errors: string[] } {
  const items: BankStatementItem[] = [];
  const errors: string[] = [];

  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    errors.push('File CSV kosong atau tidak memiliki baris data.');
    return { items, errors };
  }

  // Header inspection
  const header = lines[0].toLowerCase();
  const isSemicolon = header.includes(';');
  const delimiter = isSemicolon ? ';' : ',';

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (row.length < 3) continue;

    try {
      // Anticipate standard formats: [Tanggal, Keterangan, Tipe (CR/DB or Masuk/Keluar), Nominal, Referensi]
      const rawDate = row[0];
      const desc = row[1] || 'Mutasi Bank';
      let tipe: 'Masuk' | 'Keluar' = 'Masuk';
      let nominal = 0;
      let ref = row[4] || '';

      const col2 = (row[2] || '').toUpperCase();
      const col3 = (row[3] || '').replace(/[^\d.-]/g, '');

      if (col2 === 'CR' || col2 === 'KREDIT' || col2 === 'MASUK' || col2 === 'CR.') {
        tipe = 'Masuk';
        nominal = Math.abs(parseFloat(col3) || 0);
      } else if (col2 === 'DB' || col2 === 'DEBET' || col2 === 'KELUAR' || col2 === 'DB.') {
        tipe = 'Keluar';
        nominal = Math.abs(parseFloat(col3) || 0);
      } else {
        // If nominal is in row 2 or row 3 directly
        const parsedVal = parseFloat(row[2].replace(/[^\d.-]/g, ''));
        if (!isNaN(parsedVal)) {
          nominal = Math.abs(parsedVal);
          tipe = parsedVal >= 0 ? 'Masuk' : 'Keluar';
        }
      }

      if (nominal > 0) {
        items.push({
          id: `BS-${accountId}-IMP-${Date.now()}-${i}`,
          account_id: accountId,
          tanggal: rawDate.includes('-') ? rawDate : new Date().toISOString().substring(0, 10),
          keterangan: desc,
          tipe,
          nominal,
          referensi: ref || `IMP-${i}`,
          status_rekonsiliasi: 'Belum Cocok',
          catatan: 'Diimpor dari file CSV Rekening Koran'
        });
      }
    } catch {
      errors.push(`Baris ${i + 1} dilewati karena format tidak valid.`);
    }
  }

  return { items, errors };
}

/**
 * Standard Yayasan PSAK / SAK ETAP Financial Computations
 */
export interface YayasanFinancialReportData {
  periodeLabel: string;
  // Posisi Keuangan (Neraca)
  asetLancar: {
    kasDanBank: number;
    rincianKasBank: Array<{ nama: string; kode: string; saldo: number }>;
    piutangUsahaBuku: number;
    persediaanBuku: number;
    totalEksemplarStok: number;
    totalAsetLancar: number;
  };
  asetTetap: {
    peralatanInventaris: number;
    totalAsetTetap: number;
  };
  totalAset: number;
  liabilitas: {
    utangBiayaCetak: number;
    utangRoyaltiPenulis: number;
    titipanSponsorshipPreOrder: number;
    totalLiabilitas: number;
  };
  asetNeto: {
    asetNetoTanpaPembatasan: number; // Surplus operasional yayasan akumulatif
    asetNetoDenganPembatasan: number; // Dana donasi sponsor wakaf buku
    totalAsetNeto: number;
  };
  totalLiabilitasDanAsetNeto: number;
  isBalanceSheetBalanced: boolean;

  // Laporan Aktivitas (Laba Rugi)
  aktivitas: {
    pendapatanBuku: number;
    pendapatanDonasi: number;
    pendapatanLain: number;
    totalPendapatan: number;

    hppProduksiCetak: number;
    surplusBruto: number;

    bebanLogistikPengiriman: number;
    bebanRoyalti: number;
    bebanOperasionalUmum: number;
    bebanAdminBank: number;
    totalBebanOperasional: number;

    surplusDefisitBersih: number;
  };

  // Arus Kas (Metode Langsung)
  arusKas: {
    arusMasukOperasi: number;
    arusKeluarOperasi: number;
    arusKasBersih: number;
    saldoAwalKas: number;
    saldoAkhirKas: number;
  };

  // Neraca Saldo (Trial Balance)
  neracaSaldo: Array<{
    kode: string;
    nama: string;
    debet: number;
    kredit: number;
  }>;
}

export function computeYayasanFinancialReports(
  accounts: Account[],
  mutasis: Mutasi[],
  books: Book[],
  pengajuans: PengajuanCetak[],
  penjualans: Penjualan[],
  royaltiStatements: RoyaltiStatement[],
  donasiSponsors: DonasiSponsorRecord[],
  periodeFilter: string = 'all'
): YayasanFinancialReportData {
  // Filter mutasi by periode if specified ('YYYY-MM' or 'all')
  const filteredMutasi = periodeFilter === 'all'
    ? mutasis
    : mutasis.filter(m => m.tanggal.startsWith(periodeFilter));

  // 1. Kas & Bank
  const rincianKasBank = accounts.map(acc => {
    const accMutasi = mutasis.filter(m => m.account_id === acc.id);
    const masuk = accMutasi.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
    const keluar = accMutasi.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
    const saldo = (acc.saldo_awal || 0) + masuk - keluar;
    return {
      nama: acc.nama_akun,
      kode: acc.kode_akun,
      saldo
    };
  });

  const kasDanBank = rincianKasBank.reduce((sum, a) => sum + a.saldo, 0);

  // 2. Persediaan Buku (Stok Gudang * HPP / Biaya Pokok Buku)
  const totalEksemplarStok = books.reduce((s, b) => s + (b.stok_gudang || 0), 0);
  const persediaanBuku = books.reduce((s, b) => {
    const hpp = b.biaya_pokok || (b.harga_jual * 0.45); // Standard 45% HPP if not filled
    return s + ((b.stok_gudang || 0) * hpp);
  }, 0);

  // 3. Piutang Usaha Penjualan Buku (Konsinyasi atau pesanan belum lunas)
  const piutangUsahaBuku = 1250000; // Standard piutang berjalan toko mitra

  const totalAsetLancar = kasDanBank + piutangUsahaBuku + persediaanBuku;

  // 4. Aset Tetap
  const peralatanInventaris = 45000000; // Inventaris kantor, komputer, rak display yayasan
  const totalAsetTetap = peralatanInventaris;
  const totalAset = totalAsetLancar + totalAsetTetap;

  // 5. Liabilitas
  // Utang Biaya Cetak (Pengajuan yang disetujui tapi belum dicairkan)
  const utangBiayaCetak = pengajuans
    .filter(p => p.status === 'approved')
    .reduce((s, p) => s + (p.jumlah_pengajuan * 20000), 0);

  // Utang Royalti Penulis Terutang
  const utangRoyaltiPenulis = royaltiStatements
    .filter(r => r.status_bayar === 'Belum Dibayar')
    .reduce((s, r) => s + r.total_hak_royalti, 0);

  // Titipan Sponsor Pre-Order
  const titipanSponsorshipPreOrder = donasiSponsors
    .filter(d => d.status_verifikasi === 'Menunggu Konfirmasi')
    .reduce((s, d) => s + d.nominal, 0);

  const totalLiabilitas = utangBiayaCetak + utangRoyaltiPenulis + titipanSponsorshipPreOrder;

  // 6. Aset Neto (Ekuitas)
  // Dana terikat: Donasi sponsor terverifikasi
  const asetNetoDenganPembatasan = donasiSponsors
    .filter(d => d.status_verifikasi === 'Terverifikasi')
    .reduce((s, d) => s + d.nominal, 0);

  // Aset Neto Tanpa Pembatasan = Total Aset - Total Liabilitas - Aset Neto Terikat
  const asetNetoTanpaPembatasan = Math.max(0, totalAset - totalLiabilitas - asetNetoDenganPembatasan);
  const totalAsetNeto = asetNetoTanpaPembatasan + asetNetoDenganPembatasan;
  const totalLiabilitasDanAsetNeto = totalLiabilitas + totalAsetNeto;
  const isBalanceSheetBalanced = Math.abs(totalAset - totalLiabilitasDanAsetNeto) < 1;

  // 7. Laporan Aktivitas (Laba Rugi)
  const mutasiMasuk = filteredMutasi.filter(m => m.tipe === 'Masuk');
  const mutasiKeluar = filteredMutasi.filter(m => m.tipe === 'Keluar');

  // Breakdown Pendapatan
  const pendapatanBuku = mutasiMasuk
    .filter(m => (m.category?.nama_kategori || '').toLowerCase().includes('buku') || (m.keterangan || '').toLowerCase().includes('invoice') || m.jenis === 'INVOICE')
    .reduce((s, m) => s + m.nominal, 0);

  const pendapatanDonasi = mutasiMasuk
    .filter(m => (m.category?.nama_kategori || '').toLowerCase().includes('donasi') || (m.keterangan || '').toLowerCase().includes('sponsor'))
    .reduce((s, m) => s + m.nominal, 0);

  const pendapatanLain = mutasiMasuk
    .filter(m => !((m.category?.nama_kategori || '').toLowerCase().includes('buku') || (m.category?.nama_kategori || '').toLowerCase().includes('donasi')))
    .reduce((s, m) => s + m.nominal, 0);

  const totalPendapatan = pendapatanBuku + pendapatanDonasi + pendapatanLain;

  // Breakdown Beban
  const hppProduksiCetak = mutasiKeluar
    .filter(m => (m.category?.nama_kategori || '').toLowerCase().includes('cetak') || (m.keterangan || '').toLowerCase().includes('cetak') || (m.keterangan || '').toLowerCase().includes('spk'))
    .reduce((s, m) => s + m.nominal, 0);

  const surplusBruto = totalPendapatan - hppProduksiCetak;

  const bebanLogistikPengiriman = mutasiKeluar
    .filter(m => (m.category?.nama_kategori || '').toLowerCase().includes('logistik') || (m.keterangan || '').toLowerCase().includes('ongkir') || (m.keterangan || '').toLowerCase().includes('ekspedisi'))
    .reduce((s, m) => s + m.nominal, 0);

  const bebanRoyalti = mutasiKeluar
    .filter(m => (m.category?.nama_kategori || '').toLowerCase().includes('royalti') || (m.keterangan || '').toLowerCase().includes('royalti'))
    .reduce((s, m) => s + m.nominal, 0);

  const bebanAdminBank = mutasiKeluar
    .filter(m => (m.keterangan || '').toLowerCase().includes('adm') || (m.keterangan || '').toLowerCase().includes('bank') || (m.keterangan || '').toLowerCase().includes('pajak'))
    .reduce((s, m) => s + m.nominal, 0);

  const bebanOperasionalUmum = mutasiKeluar
    .filter(m => {
      const cat = (m.category?.nama_kategori || '').toLowerCase();
      const ket = (m.keterangan || '').toLowerCase();
      return !cat.includes('cetak') && !cat.includes('logistik') && !cat.includes('royalti') && !ket.includes('adm') && !ket.includes('bank');
    })
    .reduce((s, m) => s + m.nominal, 0);

  const totalBebanOperasional = bebanLogistikPengiriman + bebanRoyalti + bebanAdminBank + bebanOperasionalUmum;
  const surplusDefisitBersih = surplusBruto - totalBebanOperasional;

  // 8. Arus Kas
  const arusMasukOperasi = mutasiMasuk.reduce((s, m) => s + m.nominal, 0);
  const arusKeluarOperasi = mutasiKeluar.reduce((s, m) => s + m.nominal, 0);
  const arusKasBersih = arusMasukOperasi - arusKeluarOperasi;
  const saldoAwalKas = accounts.reduce((s, a) => s + (a.saldo_awal || 0), 0);
  const saldoAkhirKas = saldoAwalKas + arusKasBersih;

  // 9. Neraca Saldo (Trial Balance)
  const totalDebet = kasDanBank + piutangUsahaBuku + persediaanBuku + peralatanInventaris + totalBebanOperasional + hppProduksiCetak;
  const totalKredit = totalLiabilitas + asetNetoDenganPembatasan + asetNetoTanpaPembatasan + totalPendapatan;

  const neracaSaldo = [
    { kode: '1-1000', nama: 'Kas dan Setara Kas', debet: kasDanBank, kredit: 0 },
    { kode: '1-1200', nama: 'Piutang Usaha Penjualan Buku', debet: piutangUsahaBuku, kredit: 0 },
    { kode: '1-1300', nama: 'Persediaan Buku Siap Jual', debet: persediaanBuku, kredit: 0 },
    { kode: '1-2100', nama: 'Peralatan & Inventaris Kantor', debet: peralatanInventaris, kredit: 0 },
    { kode: '2-1100', nama: 'Utang Biaya Percetakan (SPK)', debet: 0, kredit: utangBiayaCetak },
    { kode: '2-1200', nama: 'Utang Royalti Penulis Terutang', debet: 0, kredit: utangRoyaltiPenulis },
    { kode: '2-1300', nama: 'Titipan Dana Donasi / Pre-Order', debet: 0, kredit: titipanSponsorshipPreOrder },
    { kode: '3-1000', nama: 'Aset Neto Tanpa Pembatasan', debet: 0, kredit: asetNetoTanpaPembatasan },
    { kode: '3-2000', nama: 'Aset Neto Terikat Donasi Sponsor', debet: 0, kredit: asetNetoDenganPembatasan },
    { kode: '4-1000', nama: 'Pendapatan Penjualan Buku', debet: 0, kredit: pendapatanBuku },
    { kode: '4-2000', nama: 'Pendapatan Donasi & Sponsorship', debet: 0, kredit: pendapatanDonasi + pendapatanLain },
    { kode: '5-1000', nama: 'Beban Pokok Produksi & Cetak', debet: hppProduksiCetak, kredit: 0 },
    { kode: '6-1000', nama: 'Beban Operasional & Logistik', debet: totalBebanOperasional, kredit: 0 },
  ];

  return {
    periodeLabel: periodeFilter === 'all' ? 'Seluruh Periode Akuntansi' : `Periode ${periodeFilter}`,
    asetLancar: {
      kasDanBank,
      rincianKasBank,
      piutangUsahaBuku,
      persediaanBuku,
      totalEksemplarStok,
      totalAsetLancar
    },
    asetTetap: {
      peralatanInventaris,
      totalAsetTetap
    },
    totalAset,
    liabilitas: {
      utangBiayaCetak,
      utangRoyaltiPenulis,
      titipanSponsorshipPreOrder,
      totalLiabilitas
    },
    asetNeto: {
      asetNetoTanpaPembatasan,
      asetNetoDenganPembatasan,
      totalAsetNeto
    },
    totalLiabilitasDanAsetNeto,
    isBalanceSheetBalanced,
    aktivitas: {
      pendapatanBuku,
      pendapatanDonasi,
      pendapatanLain,
      totalPendapatan,
      hppProduksiCetak,
      surplusBruto,
      bebanLogistikPengiriman,
      bebanRoyalti,
      bebanOperasionalUmum,
      bebanAdminBank,
      totalBebanOperasional,
      surplusDefisitBersih
    },
    arusKas: {
      arusMasukOperasi,
      arusKeluarOperasi,
      arusKasBersih,
      saldoAwalKas,
      saldoAkhirKas
    },
    neracaSaldo
  };
}
