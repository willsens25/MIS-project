import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem, Promo, Book, Identitas, SalesChannel, Expedition } from '../../types';
import {
  ShoppingBag,
  Plus,
  Search,
  Printer,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Users,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  Package,
  Truck,
  Sparkles,
  TrendingUp,
  Check,
  X,
  Globe,
  Calendar,
  DollarSign,
  HeartHandshake,
  Gift,
  FileText,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ChevronDown,
  MessageSquare,
  Zap
} from 'lucide-react';
import { InvoicePrintModal } from '../modals/InvoicePrintModal';
import { MarketingCharts } from '../charts/MarketingCharts';
import { ConfirmModal } from '../modals/ConfirmModal';
import { SalesChannelModal } from './SalesChannelModal';
import { ExpeditionModal } from './ExpeditionModal';
import { ChannelsAndExpeditionsTab } from './ChannelsAndExpeditionsTab';
import { WhatsAppModal } from './WhatsAppModal';
import { WhatsAppAutomationTab } from './WhatsAppAutomationTab';
import { EventPOSDashboard } from './EventPOSDashboard';
import { BazaarEventsTab } from './BazaarEventsTab';
import { PrintCurrentViewButton } from '../common/PrintCurrentViewButton';
import { PrintReportHeader } from '../common/PrintReportHeader';
import { DownloadPdfButton } from '../common/DownloadPdfButton';

export const MarketingDashboard: React.FC = () => {
  const {
    orders,
    createOrder,
    tandaiLunasOrder,
    cancelOrder,
    bulkDeleteOrders,
    books,
    promos,
    addPromo,
    updatePromo,
    deletePromo,
    bulkDeletePromos,
    checkPromoCode,
    lookupEligiblePromos,
    salesChannels,
    addSalesChannel,
    updateSalesChannel,
    deleteSalesChannel,
    expeditions,
    addExpedition,
    updateExpedition,
    deleteExpedition,
    identitasList,
    accounts,
    bazaarEvents,
    currentSubTab,
    setCurrentSubTab
  } = useApp();

  const activeSubTab = (['pos', 'event_pos', 'bazaar', 'grafik', 'invoices', 'promos', 'saluran', 'agen', 'whatsapp'].includes(currentSubTab)
    ? currentSubTab
    : 'pos') as 'pos' | 'event_pos' | 'bazaar' | 'grafik' | 'invoices' | 'promos' | 'saluran' | 'agen' | 'whatsapp';
  const setActiveSubTab = (tab: 'pos' | 'event_pos' | 'bazaar' | 'grafik' | 'invoices' | 'promos' | 'saluran' | 'agen' | 'whatsapp') => setCurrentSubTab(tab);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // WhatsApp quick modal state
  const [whatsAppModalOrder, setWhatsAppModalOrder] = useState<Order | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppInitialTemplate, setWhatsAppInitialTemplate] = useState<string>('pengingat_ramah');

  const handleOpenWhatsAppModal = (order: Order, templateId: string = 'pengingat_ramah') => {
    setWhatsAppModalOrder(order);
    setWhatsAppInitialTemplate(templateId);
    setIsWhatsAppModalOpen(true);
  };

  // Selection states for bulk delete & bulk lunas
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [selectedPromoIds, setSelectedPromoIds] = useState<number[]>([]);

  // Pelunasan Modal
  const [pelunasanModalOrder, setPelunasanModalOrder] = useState<Order | null>(null);
  const [pelunasanAccountId, setPelunasanAccountId] = useState<number>(accounts[0]?.id || 1);

  // Toast & ConfirmModal states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'primary';
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger',
    confirmText: 'Ya, Lanjutkan'
  });

  // Print Invoice Modal
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // Quick modals for POS inline creation
  const [isAddChannelQuickModalOpen, setIsAddChannelQuickModalOpen] = useState(false);
  const [isAddExpeditionQuickModalOpen, setIsAddExpeditionQuickModalOpen] = useState(false);

  // POS Form State (All 12 user requested fields)
  // 1. Tanggal (Tanggal Pesen)
  const [tanggalPesan, setTanggalPesan] = useState(new Date().toISOString().substring(0, 10));
  // 2. Via (Marketplace / Saluran)
  const [viaPlatform, setViaPlatform] = useState(salesChannels[0]?.nama_channel || 'Tokopedia');
  // 3. Pembeli (Nama, WA/HP, Email)
  const [pembeliName, setPembeliName] = useState('');
  const [kontakPembeli, setKontakPembeli] = useState('');
  const [emailPembeli, setEmailPembeli] = useState('');
  const [selectedIdentitasId, setSelectedIdentitasId] = useState<number | ''>('');
  // 4. Penerima
  const [penerimaName, setPenerimaName] = useState('');
  const [kontakPenerima, setKontakPenerima] = useState('');
  // 5. Alamat Penerima
  const [alamatPenerima, setAlamatPenerima] = useState('');
  // 6. Jenis Ekspedisi
  const [ekspedisi, setEkspedisi] = useState(expeditions[0]?.nama_ekspedisi || 'JNE Reguler');
  // 7. Ongkos Kirim
  const [ongkir, setOngkir] = useState<number>(0);
  // 8. Donasi
  const [donasi, setDonasi] = useState<number>(0);
  // 9. Keterangan Donasi
  const [keteranganDonasi, setKeteranganDonasi] = useState('');
  // 10. Keterangan (Kartu ucapan, permintaan khusus, dll)
  const [keterangan, setKeterangan] = useState('');

  // 11. Buku & Promo (Multi-row with VLOOKUP)
  const [orderItems, setOrderItems] = useState<Array<{
    buku_id: number;
    jumlah: number;
    promo_code: string;
    promo_status?: string;
  }>>([
    { buku_id: books[0]?.id || 1, jumlah: 1, promo_code: '' }
  ]);

  // Promo Modal
  const [modalPromoOpen, setModalPromoOpen] = useState(false);
  const [promoForm, setPromoForm] = useState<{
    code: string;
    nama_promo?: string;
    type: 'percentage' | 'nominal';
    reward_value: number;
    max_uses: number;
    start_date?: string;
    expiry_date: string;
    min_order?: number;
    khusus_kategori_pembeli?: string;
    buku_id_khusus?: number;
    deskripsi?: string;
  }>({
    code: '',
    nama_promo: '',
    type: 'percentage',
    reward_value: 10,
    max_uses: 100,
    start_date: new Date().toISOString().substring(0, 10),
    expiry_date: '2027-12-31',
    min_order: 0,
    khusus_kategori_pembeli: '',
    deskripsi: ''
  });

  // Handle agent selection auto-fill
  const handleSelectAgent = (identitasId: number) => {
    const identitas = identitasList.find(i => i.id === identitasId);
    if (identitas) {
      setSelectedIdentitasId(identitas.id);
      setPembeliName(identitas.nama_lengkap);
      setKontakPembeli(identitas.nomor_hp_primary || '');
      setEmailPembeli(identitas.email || '');
      setPenerimaName(identitas.panggilan || identitas.nama_lengkap);
      setKontakPenerima(identitas.nomor_hp_primary || '');
      setAlamatPenerima(`${identitas.alamat || ''}, ${identitas.kota || ''}`.trim());
      setToastMessage(`Data pembeli otomatis dimuat dari master identitas: ${identitas.nama_lengkap}`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Copy buyer info to recipient
  const handleCopyPembeliToPenerima = () => {
    if (!pembeliName) {
      setToastMessage('Harap isi Nama Pembeli terlebih dahulu.');
      setTimeout(() => setToastMessage(null), 2500);
      return;
    }
    setPenerimaName(pembeliName);
    if (kontakPembeli) setKontakPenerima(kontakPembeli);
    setToastMessage('Data penerima disamakan dengan data pembeli.');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Add Item Row
  const handleAddItemRow = () => {
    setOrderItems([...orderItems, { buku_id: books[0]?.id || 1, jumlah: 1, promo_code: '' }]);
  };

  // Remove Item Row
  const handleRemoveItemRow = (index: number) => {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, idx) => idx !== index));
  };

  // Update item field
  const handleUpdateItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    (updated[index] as any)[field] = value;
    setOrderItems(updated);
  };

  // Calculate POS totals with intelligent promo VLOOKUP
  const calculatedItems: OrderItem[] = orderItems.map(row => {
    const book = books.find(b => b.id === row.buku_id);
    const hargaSatuan = book?.harga_jual || 0;
    const subtotalAwal = hargaSatuan * row.jumlah;

    let potonganDiskon = 0;
    let validPromoCode: string | null = null;

    if (row.promo_code.trim()) {
      const check = checkPromoCode(
        row.promo_code,
        row.buku_id,
        tanggalPesan,
        typeof selectedIdentitasId === 'number' ? selectedIdentitasId : undefined,
        subtotalAwal
      );
      if (check.valid) {
        validPromoCode = row.promo_code.trim().toUpperCase();
        if (check.type === 'percentage') {
          potonganDiskon = Math.round(subtotalAwal * ((check.value || 0) / 100));
        } else if (check.type === 'nominal') {
          potonganDiskon = Math.min(subtotalAwal, (check.value || 0));
        }
      }
    }

    const subtotalFinal = Math.max(0, subtotalAwal - potonganDiskon);

    return {
      buku_id: row.buku_id,
      book,
      jumlah: row.jumlah,
      harga_satuan: hargaSatuan,
      subtotal: subtotalFinal,
      kode_promo_terpakai: validPromoCode,
      potongan_diskon: potonganDiskon
    };
  });

  const totalItemCount = calculatedItems.reduce((s, it) => s + it.jumlah, 0);
  const totalSubtotalKotor = calculatedItems.reduce((s, it) => s + (it.harga_satuan * it.jumlah), 0);
  const totalDiskonPromo = calculatedItems.reduce((s, it) => s + (it.potongan_diskon || 0), 0);
  const totalSubtotalItems = calculatedItems.reduce((s, it) => s + it.subtotal, 0);
  const totalTagihanAkhir = totalSubtotalItems + (ongkir || 0) + (donasi || 0);

  // Submit Order with all 12 requested fields
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pembeliName.trim()) {
      setToastMessage('Peringatan: Nama Pembeli wajib diisi!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    if (orderItems.length === 0 || totalItemCount === 0) {
      setToastMessage('Peringatan: Pesanan harus memiliki minimal 1 item buku!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    // Generate invoice no: INV-YYYYMMDD-XXXX
    const dateStr = (tanggalPesan || new Date().toISOString().substring(0, 10)).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`;

    const newOrderData: Omit<Order, 'id' | 'created_at'> = {
      no_invoice: invoiceNo,
      tanggal_pesan: tanggalPesan || new Date().toISOString().substring(0, 10),
      via: viaPlatform,
      nama_pembeli: pembeliName.trim().toUpperCase(),
      kontak_pembeli: kontakPembeli.trim() || undefined,
      email_pembeli: emailPembeli.trim() || undefined,
      pembeli_identitas_id: typeof selectedIdentitasId === 'number' ? selectedIdentitasId : undefined,
      nama_penerima: (penerimaName.trim() || pembeliName.trim()).toUpperCase(),
      kontak_penerima: kontakPenerima.trim() || kontakPembeli.trim() || undefined,
      alamat_penerima: alamatPenerima.trim() || 'Alamat Toko / Pengambilan Kantor',
      ekspedisi,
      ongkir: ongkir || 0,
      donasi: donasi || 0,
      keterangan_donasi: keteranganDonasi.trim() || undefined,
      keterangan: keterangan.trim() || undefined,
      status: 'Pending',
      total_tagihan: totalTagihanAkhir,
      items: calculatedItems,
      tercatat_finance: 0
    };

    const res = createOrder(newOrderData);
    if (res.success) {
      setToastMessage(res.message);
      setTimeout(() => setToastMessage(null), 4000);
      // Reset form
      setPembeliName('');
      setKontakPembeli('');
      setEmailPembeli('');
      setSelectedIdentitasId('');
      setPenerimaName('');
      setKontakPenerima('');
      setAlamatPenerima('');
      setOngkir(0);
      setDonasi(0);
      setKeteranganDonasi('');
      setKeterangan('');
      setOrderItems([{ buku_id: books[0]?.id || 1, jumlah: 1, promo_code: '' }]);
      setActiveSubTab('invoices');
    } else {
      setToastMessage(`Gagal: ${res.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code.trim() || promoForm.reward_value <= 0) {
      setToastMessage('Kode Promo dan Nilai Diskon harus diisi dengan benar!');
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    addPromo(promoForm);
    setModalPromoOpen(false);
    setPromoForm({
      code: '',
      nama_promo: '',
      type: 'percentage',
      reward_value: 10,
      max_uses: 100,
      start_date: new Date().toISOString().substring(0, 10),
      expiry_date: '2027-12-31',
      min_order: 0,
      khusus_kategori_pembeli: '',
      deskripsi: ''
    });
    setToastMessage(`Kode promo "${promoForm.code.toUpperCase()}" berhasil disimpan!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.no_invoice.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      o.nama_pembeli.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      (o.nama_penerima && o.nama_penerima.toLowerCase().includes(invoiceSearch.toLowerCase())) ||
      (o.kontak_pembeli && o.kontak_pembeli.includes(invoiceSearch)) ||
      (o.kontak_penerima && o.kontak_penerima.includes(invoiceSearch)) ||
      o.via.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchChannel = channelFilter === 'all' || o.via === channelFilter;
    return matchSearch && matchStatus && matchChannel;
  });

  const pendingSelectedOrders = orders.filter(o => selectedOrderIds.includes(o.id) && o.status === 'Pending');

  const handleToggleSelectOrder = (id: number) => {
    setSelectedOrderIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAllOrders = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleBulkLunasOrders = () => {
    if (pendingSelectedOrders.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Tandai Lunas Invoice Terpilih',
      message: `Yakin ingin mengonfirmasi pelunasan untuk ${pendingSelectedOrders.length} invoice pending terpilih? Mutasi kas masuk akan dicatat ke Finance dan item dialirkan ke antrean packing Logistik.`,
      variant: 'primary',
      confirmText: 'Ya, Tandai Lunas Semua',
      onConfirm: () => {
        const defaultAcc = accounts.find(a => a.nama_akun.toLowerCase().includes('bca'))?.id || accounts[0]?.id || 1;
        pendingSelectedOrders.forEach(o => {
          tandaiLunasOrder(o.id, defaultAcc);
        });
        setSelectedOrderIds([]);
        setToastMessage(`${pendingSelectedOrders.length} invoice berhasil ditandai LUNAS!`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    });
  };

  const handleBulkDeleteOrders = () => {
    if (selectedOrderIds.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Invoice Terpilih',
      message: `Yakin ingin menghapus ${selectedOrderIds.length} invoice terpilih? Mutasi dan antrean logistik terkait akan otomatis dibersihkan.`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Invoice',
      onConfirm: () => {
        bulkDeleteOrders(selectedOrderIds);
        setSelectedOrderIds([]);
        setToastMessage(`${selectedOrderIds.length} invoice berhasil dihapus.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    });
  };

  const handleToggleSelectPromo = (id: number) => {
    setSelectedPromoIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSelectAllPromos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPromoIds(promos.map(p => p.id));
    } else {
      setSelectedPromoIds([]);
    }
  };

  const handleBulkDeletePromos = () => {
    if (selectedPromoIds.length === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Hapus Kode Promo Terpilih',
      message: `Yakin ingin menghapus ${selectedPromoIds.length} kode promo terpilih?`,
      variant: 'danger',
      confirmText: 'Ya, Hapus Promo',
      onConfirm: () => {
        bulkDeletePromos(selectedPromoIds);
        setSelectedPromoIds([]);
        setToastMessage(`${selectedPromoIds.length} kode promo berhasil dihapus.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    });
  };

  const handleExportOrdersCSV = () => {
    const headers = ['No Invoice,Tanggal Pesan,Via Saluran,Nama Pembeli,Kontak Pembeli,Email Pembeli,Nama Penerima,Kontak Penerima,Alamat Penerima,Ekspedisi,Ongkir,Donasi,Keterangan Donasi,Catatan Tambahan,Status,Total Tagihan'];
    const rows = filteredOrders.map(o =>
      `"${o.no_invoice}","${o.tanggal_pesan}","${o.via}","${o.nama_pembeli}","${o.kontak_pembeli || '-'}","${o.email_pembeli || '-'}","${o.nama_penerima || o.nama_pembeli}","${o.kontak_penerima || '-'}","${(o.alamat_penerima || '').replace(/"/g, '""')}","${o.ekspedisi}","${o.ongkir}","${o.donasi || 0}","${o.keterangan_donasi || '-'}","${(o.keterangan || '').replace(/"/g, '""')}","${o.status}","${o.total_tagihan}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_penjualan_marketing_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Official Print Header */}
      <PrintReportHeader
        divisionName="Marketing & Penjualan"
        divisionCode="MKT"
        subTabTitle={
          activeSubTab === 'event_pos'
            ? 'Kasir Cepat POS Event & Bazar (Touch POS)'
            : activeSubTab === 'grafik'
            ? 'Grafik & Analisis Penjualan'
            : activeSubTab === 'pos'
            ? 'Point of Sale (POS) & Buat Pesanan'
            : activeSubTab === 'invoices'
            ? 'Daftar Invoice & Riwayat Pesanan'
            : activeSubTab === 'promos'
            ? 'Manajemen Kode Promo & Diskon'
            : activeSubTab === 'saluran'
            ? 'Saluran Penjualan & Ekspedisi Pengiriman'
            : activeSubTab === 'agen'
            ? 'Direktori Agen & Mitra Pembeli'
            : 'Integrasi & Notifikasi WhatsApp'
        }
      />

      {/* Sub tabs */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl flex-wrap">
          <button
            onClick={() => setActiveSubTab('event_pos')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'event_pos'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
                : 'text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-white hover:bg-amber-100/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ Kasir Event / Bazar</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bazaar')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'bazaar'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm'
                : 'text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-50/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>🎪 Agenda Bazaar & Konsinyasi</span>
            {bazaarEvents.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'bazaar'
                  ? 'bg-white text-indigo-700'
                  : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
              }`}>
                {bazaarEvents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('grafik')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'grafik'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Grafik & Analisis Penjualan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('pos')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'pos'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>POS & Buat Pesanan</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invoices')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'invoices'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Daftar Invoice & Pesanan ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('promos')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'promos'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Kode Promo ({promos.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('saluran')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'saluran'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Saluran & Ekspedisi ({salesChannels.length}/{expeditions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('agen')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'agen'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Agen & Pembeli</span>
          </button>

          <button
            onClick={() => setActiveSubTab('whatsapp')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Otomatisasi WhatsApp</span>
            {orders.filter(o => o.status === 'Pending').length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === 'whatsapp'
                  ? 'bg-white text-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {orders.filter(o => o.status === 'Pending').length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Print Current View Action Button */}
          <PrintCurrentViewButton
            id="btn-print-marketing"
            fallbackFilename={`Laporan_Marketing_${activeSubTab}`}
          />

          {/* Download Current Table View directly as PDF */}
          <DownloadPdfButton
            id="btn-download-pdf-marketing"
            filename={`Laporan_Marketing_${activeSubTab}`}
            tooltip="Unduh tampilan tabel saat ini langsung sebagai file PDF resmi berformat cetak"
          />

          {activeSubTab === 'invoices' && (
            <button
              onClick={handleExportOrdersCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Rekap Excel / CSV</span>
            </button>
          )}

          {activeSubTab === 'promos' && (
            <button
              onClick={() => setModalPromoOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kode Promo</span>
            </button>
          )}
        </div>
      </div>

      {/* KASIR CEPAT EVENT & BAZAR SUB TAB */}
      {activeSubTab === 'event_pos' && (
        <EventPOSDashboard />
      )}

      {/* AGENDA BAZAAR & KONSINYASI SUB TAB */}
      {activeSubTab === 'bazaar' && (
        <BazaarEventsTab onOpenEventPOS={() => setActiveSubTab('event_pos')} />
      )}

      {/* GRAFIK & ANALISIS SUB TAB */}
      {activeSubTab === 'grafik' && (
        <MarketingCharts orders={orders} books={books} />
      )}

      {/* POS / BUAT PESANAN SUB TAB */}
      {activeSubTab === 'pos' && (
        <form onSubmit={handleCreateOrderSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Form Fields & Multi Items */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* 1. Tanggal Pesan & Saluran Penjualan (Via) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      1. Tanggal Pesan & Saluran Penjualan (Via)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Waktu order masuk dan kanal pemesanan (Tokopedia, Shopee, Event, dsb.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Tanggal Pesan (Tanggal Transaksi) *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={tanggalPesan}
                      onChange={e => setTanggalPesan(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                    />
                  </div>
                  <div className="flex space-x-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => setTanggalPesan(new Date().toISOString().substring(0, 10))}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Hari Ini
                    </button>
                    <span className="text-[10px] text-slate-400">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() - 1);
                        setTanggalPesan(d.toISOString().substring(0, 10));
                      }}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                    >
                      Kemarin
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold">
                      Via Saluran / Marketplace *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddChannelQuickModalOpen(true)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center space-x-0.5 hover:underline"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tambah Saluran</span>
                    </button>
                  </div>
                  <select
                    value={viaPlatform}
                    onChange={e => setViaPlatform(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {salesChannels.filter(c => (c.is_active ?? c.aktif ?? true)).map(channel => (
                      <option key={channel.id} value={channel.nama_channel}>
                        {channel.nama_channel} ({channel.kategori})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Dapat ditambah sendiri kapan saja bila ada kanal atau event baru.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Informasi Pembeli (Pemesan) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      2. Data Pembeli (Penanggung Jawab Pesanan)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Invoice dan resi akan dikirim ke pembeli (bisa berbeda dari penerima hadiah/paket)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Pilih dari Master Agen / Anggota Komunitas (Opsional)
                  </label>
                  <select
                    value={selectedIdentitasId}
                    onChange={e => {
                      const id = parseInt(e.target.value);
                      if (id) handleSelectAgent(id);
                      else setSelectedIdentitasId('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">-- Pilih Anggota / Agen Terdaftar (Isi Cepat) --</option>
                    {identitasList.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.nama_lengkap} — {i.kategori_identitas || i.jenis_umat || 'Umat'} ({i.kota || 'Indonesia'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Nama Pembeli / Pemesan *
                    </label>
                    <input
                      type="text"
                      required
                      value={pembeliName}
                      onChange={e => setPembeliName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold uppercase"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      No. WhatsApp / HP Pembeli
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={kontakPembeli}
                        onChange={e => setKontakPembeli(e.target.value)}
                        placeholder="08123456789 (Kirim resi/invoice)"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                      Email Pembeli (Opsional)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        value={emailPembeli}
                        onChange={e => setEmailPembeli(e.target.value)}
                        placeholder="email@domain.com"
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Informasi Penerima & Alamat Kirim */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      3. Data Penerima & Alamat Pengiriman
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Tujuan fisik pengiriman buku paket ekspedisi
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPembeliToPenerima}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1"
                >
                  <span>Sama dengan Pembeli</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nama Penerima Paket
                  </label>
                  <input
                    type="text"
                    value={penerimaName}
                    onChange={e => setPenerimaName(e.target.value)}
                    placeholder="Nama orang yang menerima paket"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl uppercase font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Biarkan kosong jika sama dengan nama pembeli.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    No. Kontak WhatsApp / HP Penerima (Untuk Kurir)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={kontakPenerima}
                      onChange={e => setKontakPenerima(e.target.value)}
                      placeholder="081xxxxxxx (Nomor di label paket)"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Alamat Lengkap Penerima *
                  </label>
                  <textarea
                    rows={2}
                    value={alamatPenerima}
                    onChange={e => setAlamatPenerima(e.target.value)}
                    placeholder="Jl. Nama Jalan No. XX, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten, Kode Pos, Patokan..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* 4. Ekspedisi & Ongkir */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      4. Jenis Ekspedisi & Ongkos Kirim
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Pilihan kurir pengiriman (bisa di-lookup & ditambah fleksibel)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddExpeditionQuickModalOpen(true)}
                  className="text-[10px] text-teal-600 dark:text-teal-400 font-bold flex items-center space-x-0.5 hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Ekspedisi</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Pilihan Jenis Ekspedisi / Kurir
                  </label>
                  <select
                    value={ekspedisi}
                    onChange={e => setEkspedisi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {expeditions.filter(e => (e.is_active ?? e.aktif ?? true)).map(exp => (
                      <option key={exp.id} value={exp.nama_ekspedisi}>
                        {exp.nama_ekspedisi} [{exp.kategori}] {exp.estimasi ? `(${exp.estimasi})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Ongkos Kirim (Rupiah)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={ongkir || ''}
                    onChange={e => setOngkir(parseInt(e.target.value) || 0)}
                    placeholder="0 (Gratis Ongkir)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                  <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">Preset:</span>
                    {[0, 10000, 15000, 25000, 50000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setOngkir(val)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border ${
                          ongkir === val
                            ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 text-teal-700 dark:text-teal-300 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val === 0 ? 'Gratis' : `Rp ${(val / 1000)}rb`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Pilihan Buku & Promo (VLOOKUP) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      5. Buku yang Dipesan & Kode Promo (VLOOKUP)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Daftar buku, kuantitas, dan promo yang berlaku untuk tanggal & pembeli ini
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Buku</span>
                </button>
              </div>

              <div className="space-y-3.5">
                {orderItems.map((item, idx) => {
                  const currentBook = books.find(b => b.id === item.buku_id);
                  const isLowStock = currentBook && currentBook.stok_gudang < item.jumlah;
                  const calculated = calculatedItems[idx];
                  
                  // Lookup eligible promos for this specific row
                  const eligiblePromos = lookupEligiblePromos({
                    orderDate: tanggalPesan,
                    bookId: item.buku_id,
                    identitasId: typeof selectedIdentitasId === 'number' ? selectedIdentitasId : undefined,
                    subtotal: (currentBook?.harga_jual || 0) * item.jumlah
                  });

                  return (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
                        
                        {/* Book Select */}
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                            Buku & Harga Jual Satuan
                          </label>
                          <select
                            value={item.buku_id}
                            onChange={e => handleUpdateItem(idx, 'buku_id', parseInt(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium"
                          >
                            {books.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.judul} — Rp {b.harga_jual.toLocaleString('id-ID')} (Stok: {b.stok_gudang})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Qty */}
                        <div className="w-24">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                            Berapa Banyak (QTY)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.jumlah}
                            onChange={e => handleUpdateItem(idx, 'jumlah', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
                          />
                        </div>

                        {/* Promo Code with VLOOKUP Suggestions */}
                        <div className="w-48">
                          <div className="flex items-center justify-between mb-0.5">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase">
                              Promo (VLOOKUP)
                            </label>
                            {eligiblePromos.length > 0 && (
                              <span className="text-[10px] text-indigo-600 font-bold">
                                {eligiblePromos.length} Berlaku
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            {eligiblePromos.length > 0 ? (
                              <select
                                value={item.promo_code}
                                onChange={e => handleUpdateItem(idx, 'promo_code', e.target.value)}
                                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                              >
                                <option value="">-- Pilih Promo Berlaku --</option>
                                {eligiblePromos.map(p => (
                                  <option key={p.id} value={p.code}>
                                    {p.code} ({p.nama_promo || (p.type === 'percentage' ? `Diskon ${p.reward_value}%` : `Diskon Rp ${p.reward_value.toLocaleString('id-ID')}`)})
                                  </option>
                                ))}
                                <option value="CUSTOM">-- Ketik Kode Lain Manual --</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={item.promo_code}
                                onChange={e => handleUpdateItem(idx, 'promo_code', e.target.value.toUpperCase())}
                                placeholder="Ketik Kode Promo..."
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase text-xs"
                              />
                            )}

                            {item.promo_code === 'CUSTOM' && (
                              <input
                                type="text"
                                autoFocus
                                value=""
                                onChange={e => handleUpdateItem(idx, 'promo_code', e.target.value.toUpperCase())}
                                placeholder="Ketik Kode Promo..."
                                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase text-xs"
                              />
                            )}
                          </div>
                        </div>

                        {/* Remove */}
                        <div className="pt-3.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={orderItems.length === 1}
                            className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                            title="Hapus Baris Buku"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Row calculation info & warnings */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-slate-700/40">
                        <div className="flex items-center space-x-2">
                          {isLowStock ? (
                            <span className="flex items-center space-x-1 text-rose-600 dark:text-rose-400 font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Stok hanya {currentBook?.stok_gudang} pcs di gudang.</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Subtotal Kotor: Rp {((currentBook?.harga_jual || 0) * item.jumlah).toLocaleString('id-ID')}
                            </span>
                          )}

                          {calculated && calculated.potongan_diskon && calculated.potongan_diskon > 0 ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded font-bold">
                              <Sparkles className="w-3 h-3" />
                              <span>Hemat: -Rp {calculated.potongan_diskon.toLocaleString('id-ID')} ({calculated.kode_promo_terpakai})</span>
                            </span>
                          ) : null}
                        </div>

                        <div className="font-extrabold text-slate-900 dark:text-white">
                          Subtotal Bersih: Rp {(calculated?.subtotal || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. Donasi, Keterangan Donasi & Keterangan Khusus */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      6. Donasi & Catatan Khusus Pelanggan
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Donasi sukarela pembeli serta permintaan khusus (kartu ucapan, hadiah, dll.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Donasi Nominal */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nominal Donasi Tambahan (Rupiah)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={donasi || ''}
                    onChange={e => setDonasi(parseInt(e.target.value) || 0)}
                    placeholder="0 (Tidak ada donasi)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                  <div className="flex items-center space-x-1.5 mt-1.5 flex-wrap gap-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">Preset:</span>
                    {[0, 10000, 25000, 50000, 100000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDonasi(val)}
                        className={`text-[10px] px-2 py-0.5 rounded-md border ${
                          donasi === val
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-700 dark:text-amber-300 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {val === 0 ? 'Tanpa Donasi' : `Rp ${(val / 1000)}rb`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keterangan Donasi */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Keterangan Donasi (Alokasi Dana)
                  </label>
                  <input
                    type="text"
                    value={keteranganDonasi}
                    onChange={e => setKeteranganDonasi(e.target.value)}
                    placeholder="Contoh: Donasi Dana Dharma, Donasi Cetak Buku Gratis"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                  <div className="flex items-center space-x-1 mt-1.5 flex-wrap gap-y-1">
                    {['Dana Dharma', 'Cetak Buku Gratis', 'Operasional Yayasan'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setKeteranganDonasi(`Donasi ${tag}`)}
                        className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded hover:bg-amber-100"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keterangan / Permintaan Khusus */}
                <div className="sm:col-span-2">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Gift className="w-3.5 h-3.5 text-slate-400" />
                    <label className="block text-slate-600 dark:text-slate-400 font-semibold">
                      Keterangan & Permintaan Khusus Pelanggan (Kartu Ucapan / Packing)
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    value={keterangan}
                    onChange={e => setKeterangan(e.target.value)}
                    placeholder="Contoh: Titip kartu ucapan 'Selamat Ulang Tahun untuk Ani', Jangan tempel harga, Bungkus bubble tebal..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Col: Order Summary & Checkout Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Ringkasan Tagihan POS
                </h3>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-bold">
                  {viaPlatform}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Total Kuantitas Buku:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{totalItemCount} Eksemplar</span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal Kotor Buku:</span>
                  <span>Rp {totalSubtotalKotor.toLocaleString('id-ID')}</span>
                </div>

                {totalDiskonPromo > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Diskon Promo:</span>
                    <span>-Rp {totalDiskonPromo.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Subtotal Buku Bersih:</span>
                  <span className="font-bold">Rp {totalSubtotalItems.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Ongkos Kirim ({ekspedisi}):</span>
                  <span className="font-bold">Rp {(ongkir || 0).toLocaleString('id-ID')}</span>
                </div>

                {donasi > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                    <span>Donasi ({keteranganDonasi || 'Sukarela'}):</span>
                    <span>+Rp {donasi.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>TOTAL TAGIHAN:</span>
                  <span className="text-xl text-indigo-600 dark:text-indigo-400 font-black">
                    Rp {totalTagihanAkhir.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl text-[11px] text-slate-500 space-y-1">
                <p><strong>Pembeli:</strong> {pembeliName || '—'}</p>
                <p><strong>Penerima:</strong> {penerimaName || pembeliName || '—'}</p>
                <p><strong>Kurir:</strong> {ekspedisi}</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Simpan & Buat Pesanan Baru</span>
              </button>
            </div>
          </div>

        </form>
      )}

      {/* DAFTAR INVOICE SUB TAB */}
      {activeSubTab === 'invoices' && (
        <div className="space-y-4">
          
          {/* Filters */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari no invoice, nama pembeli, via platform..."
                  value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {pendingSelectedOrders.length > 0 && (
                  <button
                    onClick={handleBulkLunasOrders}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Lunas Terpilih ({pendingSelectedOrders.length})</span>
                  </button>
                )}

                {selectedOrderIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteOrders}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Massal Invoice ({selectedOrderIds.length})</span>
                  </button>
                )}

                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="all">Semua Status Invoice</option>
                  <option value="Pending">Pending (Belum Bayar)</option>
                  <option value="Lunas">Lunas (Tercatat Finance)</option>
                  <option value="Dikirim">Dikirim (Logistik)</option>
                  <option value="Cancelled">Cancelled (Dibatalkan)</option>
                </select>

                <select
                  value={channelFilter}
                  onChange={e => setChannelFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium"
                >
                  <option value="all">Semua Saluran (Via)</option>
                  {salesChannels.map(c => (
                    <option key={c.id} value={c.nama_channel}>
                      {c.nama_channel}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAllOrders}
                        checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                        title="Pilih Semua"
                      />
                    </th>
                    <th className="p-3.5">Invoice & Tanggal</th>
                    <th className="p-3.5">Pembeli & Kontak</th>
                    <th className="p-3.5">Penerima & Ekspedisi</th>
                    <th className="p-3.5 text-right">Total Tagihan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        selectedOrderIds.includes(order.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedOrderIds.includes(order.id)}
                          onChange={() => handleToggleSelectOrder(order.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{order.no_invoice}</div>
                        <div className="text-[11px] text-slate-500">{order.tanggal_pesan}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                          <span>{order.nama_pembeli}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                            {order.via}
                          </span>
                          {order.kontak_pembeli && (
                            <span className="text-[10px] text-slate-500">
                              📞 {order.kontak_pembeli}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold flex items-center space-x-1.5">
                          <span>{order.ekspedisi}</span>
                          {order.nama_penerima && order.nama_penerima !== order.nama_pembeli && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                              Penerima: {order.nama_penerima}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{order.alamat_penerima || 'Ambil langsung / Tanpa alamat'}</div>
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                        <div>Rp {order.total_tagihan.toLocaleString('id-ID')}</div>
                        {order.donasi && order.donasi > 0 ? (
                          <div className="text-[10px] font-normal text-amber-600 dark:text-amber-400">
                            +Donasi: Rp {order.donasi.toLocaleString('id-ID')}
                          </div>
                        ) : null}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === 'Lunas' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          order.status === 'Dikirim' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300' :
                          order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setPrintingOrder(order)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-[11px]"
                          title="Cetak Nota / Invoice"
                        >
                          <Printer className="w-3 h-3 inline mr-1" />
                          Cetak
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenWhatsAppModal(order, order.status === 'Pending' ? 'pengingat_ramah' : order.status === 'Lunas' ? 'lunas_packing' : 'resi_pengiriman')}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-700/50 rounded-lg font-semibold text-[11px] inline-flex items-center space-x-1 cursor-pointer transition-colors"
                          title="Kirim Notifikasi / Pengingat WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>

                        {order.status === 'Pending' && (
                          <button
                            onClick={() => {
                              setPelunasanAccountId(accounts[0]?.id || 1);
                              setPelunasanModalOrder(order);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] inline-flex items-center space-x-1 cursor-pointer shadow-xs transition-colors"
                            title="Konfirmasi Pembayaran Lunas"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Tandai Lunas</span>
                          </button>
                        )}

                        {order.status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              setConfirmModalConfig({
                                isOpen: true,
                                title: 'Batalkan Invoice',
                                message: `Yakin ingin membatalkan invoice #${order.no_invoice} (${order.nama_pembeli})? Stok buku pesanan otomatis dikembalikan ke gudang.`,
                                variant: 'danger',
                                confirmText: 'Ya, Batalkan Invoice',
                                onConfirm: () => {
                                  cancelOrder(order.id);
                                  setToastMessage(`Invoice #${order.no_invoice} berhasil dibatalkan dan stok dikembalikan.`);
                                  setTimeout(() => setToastMessage(null), 3500);
                                }
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                            title="Batalkan Invoice"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* KODE PROMO SUB TAB */}
      {activeSubTab === 'promos' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daftar Kode Promo & Diskon Penjualan</h3>
              <p className="text-xs text-slate-500">Kode promo dapat digunakan pada saat input pesanan di POS.</p>
            </div>
            {selectedPromoIds.length > 0 && (
              <button
                onClick={handleBulkDeletePromos}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Promo Terpilih ({selectedPromoIds.length})</span>
              </button>
            )}
          </div>

          {promos.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs border border-slate-200 dark:border-slate-700">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  onChange={handleSelectAllPromos}
                  checked={selectedPromoIds.length === promos.length && promos.length > 0}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Pilih Semua Kode Promo</span>
              </label>
              <span className="text-slate-500 text-[11px]">
                {selectedPromoIds.length} dari {promos.length} dipilih
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {promos.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl space-y-2 border transition-colors ${
                  selectedPromoIds.includes(p.id)
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPromoIds.includes(p.id)}
                      onChange={() => handleToggleSelectPromo(p.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono tracking-wider">
                      {p.code}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    {p.type === 'percentage' ? `${p.reward_value}% OFF` : `Potongan Rp ${p.reward_value.toLocaleString('id-ID')}`}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <div>Terpakai: <span className="font-bold text-slate-800 dark:text-slate-200">{p.used_count}</span> / {p.max_uses} kali</div>
                  <div>Kedaluwarsa: <span className="font-mono">{p.expiry_date || 'Permanen'}</span></div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                  <button
                    onClick={() => {
                      setConfirmModalConfig({
                        isOpen: true,
                        title: 'Hapus Kode Promo',
                        message: `Yakin ingin menghapus kode promo "${p.code}"?`,
                        variant: 'danger',
                        confirmText: 'Ya, Hapus Promo',
                        onConfirm: () => {
                          deletePromo(p.id);
                          setToastMessage(`Kode promo "${p.code}" berhasil dihapus.`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }
                      });
                    }}
                    className="text-rose-600 hover:underline font-semibold text-[11px] cursor-pointer"
                  >
                    Hapus Kode
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AGEN SUB TAB */}
      {activeSubTab === 'agen' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daftar Agen & Toko Buku Terdaftar</h3>
            <p className="text-xs text-slate-500">Anggota dengan status Agen Purna atau pembeli langganan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {identitasList.map(a => (
              <div key={a.id} className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{a.nama_lengkap}</span>
                  {Boolean(a.is_agen_purna) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      Agen Purna
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">{a.alamat || 'Alamat belum diatur'}, {a.kota || 'Indonesia'}</p>
                <div className="text-xs text-slate-500">WA: {a.nomor_hp_primary || '-'}</div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                  <button
                    onClick={() => {
                      handleSelectAgent(a.id);
                      setActiveSubTab('pos');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:underline"
                  >
                    Buat Pesanan untuk Agen Ini →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SALURAN & EKSPEDISI SUB TAB */}
      {activeSubTab === 'saluran' && (
        <ChannelsAndExpeditionsTab />
      )}

      {/* OTOMATISASI WHATSAPP & CRM SUB TAB */}
      {activeSubTab === 'whatsapp' && (
        <WhatsAppAutomationTab
          orders={orders}
          identitasList={identitasList}
          books={books}
          onTandaiLunas={(orderId) => {
            const acc = accounts[0]?.id || 1;
            tandaiLunasOrder(orderId, acc);
          }}
        />
      )}

      {/* Quick Add Channel Modal for POS */}
      <SalesChannelModal
        isOpen={isAddChannelQuickModalOpen}
        onClose={() => setIsAddChannelQuickModalOpen(false)}
        onSave={(newChannel) => {
          addSalesChannel(newChannel);
          setViaPlatform(newChannel.nama_channel);
          setToastMessage(`Saluran "${newChannel.nama_channel}" berhasil ditambahkan dan dipilih!`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Quick Add Expedition Modal for POS */}
      <ExpeditionModal
        isOpen={isAddExpeditionQuickModalOpen}
        onClose={() => setIsAddExpeditionQuickModalOpen(false)}
        onSave={(newExp) => {
          addExpedition(newExp);
          setEkspedisi(newExp.nama_ekspedisi);
          setToastMessage(`Ekspedisi "${newExp.nama_ekspedisi}" berhasil ditambahkan dan dipilih!`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        order={printingOrder}
        onClose={() => setPrintingOrder(null)}
      />

      {/* Promo Add Modal */}
      {modalPromoOpen && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={e => {
            if (e.target === e.currentTarget) setModalPromoOpen(false);
          }}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-left animate-in zoom-in-95 duration-150"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Tambah Kode Promo Baru</h3>
              <form onSubmit={handleSavePromo} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Kode Promo (Kupon)</label>
                  <input
                    type="text"
                    required
                    value={promoForm.code}
                    onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: DHARMA20"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tipe Diskon</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, type: 'percentage' })}
                      className={`py-2 rounded-xl font-bold ${
                        promoForm.type === 'percentage' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      Persentase (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPromoForm({ ...promoForm, type: 'nominal' })}
                      className={`py-2 rounded-xl font-bold ${
                        promoForm.type === 'nominal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      Nominal (Rp)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                    Nilai Diskon ({promoForm.type === 'percentage' ? '%' : 'Rupiah'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={promoForm.reward_value || ''}
                    onChange={e => setPromoForm({ ...promoForm, reward_value: parseInt(e.target.value) || 0 })}
                    placeholder={promoForm.type === 'percentage' ? '10' : '20000'}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Batas Kuota Pemakaian (Maksimal)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={promoForm.max_uses || ''}
                    onChange={e => setPromoForm({ ...promoForm, max_uses: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Tanggal Kedaluwarsa</label>
                  <input
                    type="date"
                    value={promoForm.expiry_date}
                    onChange={e => setPromoForm({ ...promoForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalPromoOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold cursor-pointer"
                  >
                    Simpan Promo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Dedicated Pelunasan Invoice Modal */}
      {pelunasanModalOrder && createPortal(
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPelunasanModalOrder(null)}
        >
          <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
            <div
              className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      Konfirmasi Pelunasan Invoice
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pencatatan kas masuk & aktivasi antrean packing gudang
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPelunasanModalOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2.5 text-xs border border-slate-100 dark:border-slate-700/60">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">No. Invoice:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {pelunasanModalOrder.no_invoice}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Pelanggan / Agen:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {pelunasanModalOrder.nama_pembeli}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Saluran Pemesanan:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {pelunasanModalOrder.via}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Total Tagihan:</span>
                  <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    Rp {pelunasanModalOrder.total_tagihan.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5">
                    Pilih Rekening Kas / Bank Penerima:
                  </label>
                  <select
                    value={pelunasanAccountId}
                    onChange={e => setPelunasanAccountId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nama_akun} ({a.kode_akun})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1.5">
                <p className="font-bold flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Dampak Otomatis Sistem setelah Pelunasan:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1 leading-relaxed">
                  <li>
                    Status invoice berubah menjadi <strong className="text-emerald-600 dark:text-emerald-400">LUNAS</strong>.
                  </li>
                  <li>
                    Otomatis mencatat <strong className="text-slate-900 dark:text-white">Kas Masuk</strong> senilai <strong>Rp {pelunasanModalOrder.total_tagihan.toLocaleString('id-ID')}</strong> di Divisi Finance.
                  </li>
                  <li>
                    Item pesanan otomatis dialirkan ke <strong className="text-slate-900 dark:text-white">Antrean Packing</strong> Divisi Logistik untuk dikemas dan dikirim.
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPelunasanModalOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = tandaiLunasOrder(pelunasanModalOrder.id, pelunasanAccountId);
                    setToastMessage(res?.message || `Invoice #${pelunasanModalOrder.no_invoice} berhasil ditandai LUNAS!`);
                    setTimeout(() => setToastMessage(null), 4000);
                    setPelunasanModalOrder(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 cursor-pointer flex items-center space-x-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Konfirmasi Lunas & Sinkronkan</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalConfig.isOpen}
        onClose={() => setConfirmModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          confirmModalConfig.onConfirm();
          setConfirmModalConfig(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        variant={confirmModalConfig.variant}
        confirmText={confirmModalConfig.confirmText}
      />

      {/* Floating Toast Notification */}
      {toastMessage && createPortal(
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center space-x-2.5 px-4 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl shadow-xl text-xs font-semibold border border-slate-700 dark:border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        order={whatsAppModalOrder}
        initialTemplateId={whatsAppInitialTemplate}
      />

    </div>
  );
};
