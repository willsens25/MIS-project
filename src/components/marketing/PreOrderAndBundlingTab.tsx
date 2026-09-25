import React, { useState, useMemo } from 'react';
import {
  Rocket,
  Package,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Share2,
  Trash2,
  Edit3,
  ExternalLink,
  ShoppingBag,
  Award,
  ChevronRight,
  Gift,
  Boxes,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PreOrderCampaign, BookBundle, Book } from '../../types';
import { RupiahInput } from '../common/RupiahInput';
import { formatNumberWithDots } from '../../utils/currencyUtils';

interface PreOrderAndBundlingTabProps {
  onOpenPOSWithBundle?: (bundle: BookBundle) => void;
  onOpenPOSWithPreOrder?: (campaign: PreOrderCampaign) => void;
}

export const PreOrderAndBundlingTab: React.FC<PreOrderAndBundlingTabProps> = ({
  onOpenPOSWithBundle,
  onOpenPOSWithPreOrder
}) => {
  const {
    books,
    preOrderCampaigns,
    addPreOrderCampaign,
    updatePreOrderCampaign,
    deletePreOrderCampaign,
    recordPreOrderOrder,
    bookBundles,
    addBookBundle,
    updateBookBundle,
    deleteBookBundle,
    identitasList,
    createOrder,
    accounts
  } = useApp();

  const [activeSection, setActiveSection] = useState<'preorder' | 'bundling'>('preorder');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal states for Pre-Order Campaign
  const [isPOCampaignModalOpen, setIsPOCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<PreOrderCampaign | null>(null);

  // Form states for Pre-Order Campaign
  const [poForm, setPoForm] = useState<{
    judul_campaign: string;
    kode_campaign: string;
    buku_id: number;
    target_kuota: number;
    harga_normal: number;
    harga_po: number;
    minimal_dp: number;
    tanggal_mulai: string;
    tanggal_selesai: string;
    estimasi_pengiriman: string;
    status: 'Draft' | 'Aktif' | 'Tercapai' | 'Ditutup' | 'Selesai';
    bonus_item: string;
    deskripsi: string;
  }>({
    judul_campaign: '',
    kode_campaign: '',
    buku_id: books[0]?.id || 1,
    target_kuota: 100,
    harga_normal: 150000,
    harga_po: 125000,
    minimal_dp: 50000,
    tanggal_mulai: new Date().toISOString().substring(0, 10),
    tanggal_selesai: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    estimasi_pengiriman: 'Akhir Bulan Depan',
    status: 'Aktif',
    bonus_item: 'Pembatas Buku Logam Kuningan & Boxset Eksklusif',
    deskripsi: ''
  });

  // Modal states for Book Bundle
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<BookBundle | null>(null);

  // Form states for Book Bundle
  const [bundleForm, setBundleForm] = useState<{
    nama_bundle: string;
    kode_bundle: string;
    deskripsi: string;
    items: { buku_id: number; jumlah: number }[];
    harga_bundle: number;
    badge: string;
    is_active: boolean;
  }>({
    nama_bundle: '',
    kode_bundle: '',
    deskripsi: '',
    items: books.length >= 2 ? [{ buku_id: books[0].id, jumlah: 1 }, { buku_id: books[1].id, jumlah: 1 }] : [],
    harga_bundle: 0,
    badge: 'Paket Hemat',
    is_active: true
  });

  // Modal Quick Order Pre-Order
  const [quickPOModalCampaign, setQuickPOModalCampaign] = useState<PreOrderCampaign | null>(null);
  const [quickPONama, setQuickPONama] = useState('');
  const [quickPOKontak, setQuickPOKontak] = useState('');
  const [quickPOAlamat, setQuickPOAlamat] = useState('');
  const [quickPOTipeBayar, setQuickPOTipeBayar] = useState<'lunas' | 'dp'>('lunas');
  const [quickPOJumlah, setQuickPOJumlah] = useState<number>(1);
  const [quickPOIdentitasId, setQuickPOIdentitasId] = useState<number | undefined>(undefined);
  const [quickPOTerbayar, setQuickPOTerbayar] = useState<number>(0);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to open PO Campaign Form
  const handleOpenNewCampaign = () => {
    setEditingCampaign(null);
    const defaultBook = books[0];
    const normalPrice = defaultBook?.harga_jual || 150000;
    setPoForm({
      judul_campaign: defaultBook ? `Pre-Order Khusus: ${defaultBook.judul}` : 'Pre-Order Judul Baru',
      kode_campaign: `PO-${Date.now().toString().slice(-4)}`,
      buku_id: defaultBook?.id || 1,
      target_kuota: 200,
      harga_normal: normalPrice,
      harga_po: Math.round(normalPrice * 0.85),
      minimal_dp: Math.round(normalPrice * 0.4),
      tanggal_mulai: new Date().toISOString().substring(0, 10),
      tanggal_selesai: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      estimasi_pengiriman: '4-6 Minggu setelah kuota tercapai',
      status: 'Aktif',
      bonus_item: 'Edisi Khusus Bertanda Tangan + Pembatas Buku Simbol Dharma',
      deskripsi: defaultBook ? `Peluncuran perdana cetakan buku "${defaultBook.judul}" dengan bonus edisi kolektor.` : ''
    });
    setIsPOCampaignModalOpen(true);
  };

  const handleEditCampaign = (campaign: PreOrderCampaign) => {
    setEditingCampaign(campaign);
    setPoForm({
      judul_campaign: campaign.judul_campaign,
      kode_campaign: campaign.kode_campaign,
      buku_id: campaign.buku_id,
      target_kuota: campaign.target_kuota,
      harga_normal: campaign.harga_normal,
      harga_po: campaign.harga_po,
      minimal_dp: campaign.minimal_dp,
      tanggal_mulai: campaign.tanggal_mulai,
      tanggal_selesai: campaign.tanggal_selesai,
      estimasi_pengiriman: campaign.estimasi_pengiriman,
      status: campaign.status,
      bonus_item: campaign.bonus_item,
      deskripsi: campaign.deskripsi
    });
    setIsPOCampaignModalOpen(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.judul_campaign.trim()) {
      showToast('Judul campaign tidak boleh kosong');
      return;
    }

    if (editingCampaign) {
      updatePreOrderCampaign(editingCampaign.id, poForm);
      showToast(`Campaign "${poForm.judul_campaign}" berhasil diperbarui.`);
    } else {
      addPreOrderCampaign(poForm);
      showToast(`Campaign baru "${poForm.judul_campaign}" berhasil dipublikasikan!`);
    }
    setIsPOCampaignModalOpen(false);
  };

  // Helper to open Bundle Form
  const handleOpenNewBundle = () => {
    setEditingBundle(null);
    const initialItems = books.length >= 2
      ? [{ buku_id: books[0].id, jumlah: 1 }, { buku_id: books[1].id, jumlah: 1 }]
      : [{ buku_id: books[0]?.id || 1, jumlah: 1 }];

    const normalSum = initialItems.reduce((sum, item) => {
      const b = books.find(book => book.id === item.buku_id);
      return sum + ((b?.harga_jual || 0) * item.jumlah);
    }, 0);

    setBundleForm({
      nama_bundle: 'Paket Bundling Buku Pilihan',
      kode_bundle: `BNDL-${Date.now().toString().slice(-4)}`,
      deskripsi: 'Paket bundling tematik istimewa dengan harga lebih hemat.',
      items: initialItems,
      harga_bundle: Math.round(normalSum * 0.85),
      badge: 'Hemat 15%',
      is_active: true
    });
    setIsBundleModalOpen(true);
  };

  const handleEditBundle = (bundle: BookBundle) => {
    setEditingBundle(bundle);
    setBundleForm({
      nama_bundle: bundle.nama_bundle,
      kode_bundle: bundle.kode_bundle,
      deskripsi: bundle.deskripsi,
      items: [...bundle.items],
      harga_bundle: bundle.harga_bundle,
      badge: bundle.badge || 'Paket Hemat',
      is_active: bundle.is_active
    });
    setIsBundleModalOpen(true);
  };

  const handleSaveBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleForm.nama_bundle.trim()) {
      showToast('Nama paket bundling tidak boleh kosong');
      return;
    }
    if (bundleForm.items.length === 0) {
      showToast('Paket harus memiliki minimal 1 judul buku');
      return;
    }

    if (editingBundle) {
      updateBookBundle(editingBundle.id, bundleForm);
      showToast(`Paket bundling "${bundleForm.nama_bundle}" berhasil diperbarui.`);
    } else {
      addBookBundle(bundleForm);
      showToast(`Paket bundling baru "${bundleForm.nama_bundle}" berhasil dibuat!`);
    }
    setIsBundleModalOpen(false);
  };

  // Quick PO Order handler
  const handleOpenQuickPO = (campaign: PreOrderCampaign) => {
    setQuickPOModalCampaign(campaign);
    setQuickPONama('');
    setQuickPOKontak('');
    setQuickPOAlamat('');
    setQuickPOTipeBayar('lunas');
    setQuickPOJumlah(1);
    setQuickPOIdentitasId(undefined);
    setQuickPOTerbayar(campaign.harga_po);
  };

  const handleSubmitQuickPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPOModalCampaign) return;
    if (!quickPONama.trim()) {
      showToast('Nama pemesan wajib diisi');
      return;
    }

    const campaign = quickPOModalCampaign;
    const nominalBayar = quickPOTerbayar;
    const totalTagihan = campaign.harga_po * quickPOJumlah;
    const sisaTagihan = totalTagihan - nominalBayar;

    // Create an Order record for this PO
    const book = books.find(b => b.id === campaign.buku_id);
    const invoiceNo = `PO-${campaign.kode_campaign}-${Date.now().toString().slice(-4)}`;

    createOrder({
      no_invoice: invoiceNo,
      tanggal_pesan: new Date().toISOString().substring(0, 10),
      via: 'Pre-Order Campaign',
      nama_pembeli: quickPONama,
      kontak_pembeli: quickPOKontak,
      nama_penerima: quickPONama,
      kontak_penerima: quickPOKontak,
      alamat_penerima: quickPOAlamat || 'Alamat konfirmasi saat buku siap kirim',
      ekspedisi: 'Menunggu Pengiriman PO',
      ongkir: 0,
      status: sisaTagihan <= 0 ? 'Lunas' : 'Pending',
      total_tagihan: totalTagihan,
      pembeli_identitas_id: quickPOIdentitasId,
      keterangan: `Pesanan Pre-Order: ${campaign.judul_campaign} (${quickPOJumlah} eks). Tipe: ${quickPOTipeBayar === 'dp' ? `DP Rp ${formatNumberWithDots(nominalBayar)} (Sisa Rp ${formatNumberWithDots(sisaTagihan)})` : 'Lunas Penuh'}. Bonus: ${campaign.bonus_item}`,
      items: [
        {
          buku_id: campaign.buku_id,
          book: book,
          jumlah: quickPOJumlah,
          harga_satuan: campaign.harga_po,
          subtotal: totalTagihan,
          potongan_diskon: (campaign.harga_normal - campaign.harga_po) * quickPOJumlah
        }
      ]
    }, accounts[0]?.id || 1);

    // Update campaign metrics
    recordPreOrderOrder(campaign.id, nominalBayar);

    showToast(`Pesanan PO atas nama ${quickPONama} berhasil dicatat! (Invoice: ${invoiceNo})`);
    setQuickPOModalCampaign(null);
  };

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return preOrderCampaigns.filter(c => {
      const matchSearch =
        c.judul_campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.kode_campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.bonus_item.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [preOrderCampaigns, searchQuery, statusFilter]);

  // Pre-Order Summary KPI
  const poKPI = useMemo(() => {
    const totalCampaigns = preOrderCampaigns.length;
    const activeCampaigns = preOrderCampaigns.filter(c => c.status === 'Aktif').length;
    const totalPemesan = preOrderCampaigns.reduce((sum, c) => sum + c.tercapai_kuota, 0);
    const totalDana = preOrderCampaigns.reduce((sum, c) => sum + c.total_dana_terkumpul, 0);
    return { totalCampaigns, activeCampaigns, totalPemesan, totalDana };
  }, [preOrderCampaigns]);

  // Share campaign via WhatsApp
  const handleShareCampaignWA = (campaign: PreOrderCampaign) => {
    const book = books.find(b => b.id === campaign.buku_id);
    const text = `*📢 PRE-ORDER BUKU DHARMA TERBARU: ${campaign.judul_campaign}*\n\n` +
      `Namo Buddhaya, kabar gembira bagi sahabat Dharma! Lamrimnesia membuka kesempatan pemesanan eksklusif:\n\n` +
      `📖 *Judul:* ${book?.judul || campaign.judul_campaign}\n` +
      `💰 *Harga Khusus PO:* Rp ${formatNumberWithDots(campaign.harga_po)} (Harga Normal Rp ${formatNumberWithDots(campaign.harga_normal)})\n` +
      `💳 *Minimal DP:* Rp ${formatNumberWithDots(campaign.minimal_dp)}\n` +
      `🎁 *Bonus Spesial PO:* ${campaign.bonus_item}\n` +
      `📦 *Estimasi Pengiriman:* ${campaign.estimasi_pengiriman}\n` +
      `🎯 *Progress Kuota:* ${campaign.tercapai_kuota} / ${campaign.target_kuota} pemesan telah bergabung!\n\n` +
      `Yuk amankan eksemplar Anda sekarang untuk mendukung penerbitan Dharma Nusantara. 🙏`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Sub-header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Rocket className="w-6 h-6 text-orange-500" />
            <span>Pre-Order & Paket Bundling Buku</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kelola kampanye peluncuran naskah baru, kuota cetak kolektif, dan paket hemat bundling buku.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setActiveSection('preorder')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'preorder'
                ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>Campaign Pre-Order (PO)</span>
            <span className="px-1.5 py-0.2 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded text-[10px]">
              {preOrderCampaigns.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSection('bundling')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'bundling'
                ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Paket Bundling Buku</span>
            <span className="px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded text-[10px]">
              {bookBundles.length}
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: PRE-ORDER CAMPAIGNS                           */}
      {/* ======================================================== */}
      {activeSection === 'preorder' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 rounded-xl border border-orange-200/70 dark:border-orange-900/40">
              <div className="flex items-center justify-between text-orange-600 dark:text-orange-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Campaign Aktif</span>
                <Rocket className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {poKPI.activeCampaigns} <span className="text-xs font-normal text-slate-500">/ {poKPI.totalCampaigns} total</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-xl border border-blue-200/70 dark:border-blue-900/40">
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Pemesan Terdaftar</span>
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {poKPI.totalPemesan} <span className="text-xs font-normal text-slate-500">eksemplar</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 col-span-2 md:col-span-2">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">Total Dana PO Terhimpun</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                Rp {formatNumberWithDots(poKPI.totalDana)}
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari campaign PO..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tercapai">Tercapai</option>
                <option value="Ditutup">Ditutup</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <button
              onClick={handleOpenNewCampaign}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-lg text-xs font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Campaign Pre-Order Baru</span>
            </button>
          </div>

          {/* Pre-Order Grid Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredCampaigns.map(campaign => {
              const book = books.find(b => b.id === campaign.buku_id);
              const progressPct = Math.min(100, Math.round((campaign.tercapai_kuota / campaign.target_kuota) * 100));
              const hematRp = campaign.harga_normal - campaign.harga_po;
              const hematPct = Math.round((hematRp / campaign.harga_normal) * 100);

              return (
                <div
                  key={campaign.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Top Row: Code & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {campaign.kode_campaign}
                        </span>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          campaign.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : campaign.status === 'Tercapai'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          ● {campaign.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleShareCampaignWA(campaign)}
                          title="Bagikan ke WhatsApp"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditCampaign(campaign)}
                          title="Edit Campaign"
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus campaign "${campaign.judul_campaign}"?`)) {
                              deletePreOrderCampaign(campaign.id);
                              showToast('Campaign berhasil dihapus');
                            }
                          }}
                          title="Hapus Campaign"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                        {campaign.judul_campaign}
                      </h3>
                      {campaign.deskripsi && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {campaign.deskripsi}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar Kuota */}
                    <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                          <span>Progress Kuota Cetak:</span>
                        </span>
                        <span className="font-black text-orange-600 dark:text-orange-400">
                          {campaign.tercapai_kuota} / {campaign.target_kuota} Pemesan ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            progressPct >= 100
                              ? 'bg-gradient-to-r from-purple-500 to-emerald-500'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Dana Terhimpun: <b>Rp {formatNumberWithDots(campaign.total_dana_terkumpul)}</b></span>
                        <span>Estimasi Kirim: <b>{campaign.estimasi_pengiriman}</b></span>
                      </div>
                    </div>

                    {/* Pricing Matrix */}
                    <div className="grid grid-cols-3 gap-2 py-1 border-t border-b border-slate-100 dark:border-slate-800 text-center">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Harga Normal</span>
                        <span className="text-xs text-slate-400 line-through">Rp {formatNumberWithDots(campaign.harga_normal)}</span>
                      </div>
                      <div className="bg-orange-50/50 dark:bg-orange-950/20 py-1 rounded-lg">
                        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider block">Harga PO</span>
                        <span className="text-sm font-black text-orange-600 dark:text-orange-400">Rp {formatNumberWithDots(campaign.harga_po)}</span>
                        <span className="text-[9px] font-bold text-emerald-600 block">Hemat {hematPct}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Minimal DP</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rp {formatNumberWithDots(campaign.minimal_dp)}</span>
                      </div>
                    </div>

                    {/* Bonus item */}
                    {campaign.bonus_item && (
                      <div className="flex items-start space-x-2 text-xs bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200">
                        <Gift className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Bonus Eksklusif PO: </span>
                          <span>{campaign.bonus_item}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenQuickPO(campaign)}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Catat Pesanan PO</span>
                    </button>

                    <button
                      onClick={() => handleShareCampaignWA(campaign)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Kirim WA</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCampaigns.length === 0 && (
              <div className="col-span-2 py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                <Rocket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada campaign Pre-Order aktif</h4>
                <p className="text-xs text-slate-500 mt-1">Klik tombol di atas untuk meluncurkan program pemesanan buku baru.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: BOOK BUNDLING                                 */}
      {/* ======================================================== */}
      {activeSection === 'bundling' && (
        <div className="space-y-6">
          {/* Action & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari paket bundling..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={handleOpenNewBundle}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Paket Bundling Baru</span>
            </button>
          </div>

          {/* Bundles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookBundles
              .filter(b => b.nama_bundle.toLowerCase().includes(searchQuery.toLowerCase()) || b.kode_bundle.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(bundle => {
                // Calculate original total price
                const originalTotal = bundle.items.reduce((sum, item) => {
                  const b = books.find(book => book.id === item.buku_id);
                  return sum + ((b?.harga_jual || 0) * item.jumlah);
                }, 0);

                const hematNominal = Math.max(0, originalTotal - bundle.harga_bundle);
                const hematPersen = originalTotal > 0 ? Math.round((hematNominal / originalTotal) * 100) : 0;

                // Calculate stock availability (min stock of component books)
                const bundleStock = bundle.items.reduce((min, item) => {
                  const b = books.find(book => book.id === item.buku_id);
                  const availableForThis = b ? Math.floor(b.stok_gudang / item.jumlah) : 0;
                  return Math.min(min, availableForThis);
                }, Infinity);

                return (
                  <div
                    key={bundle.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-4">
                      {/* Top Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {bundle.kode_bundle}
                        </span>
                        <div className="flex items-center space-x-1">
                          {bundle.badge && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                              ★ {bundle.badge}
                            </span>
                          )}
                          <button
                            onClick={() => handleEditBundle(bundle)}
                            className="p-1 text-slate-400 hover:text-blue-600"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus paket bundling "${bundle.nama_bundle}"?`)) {
                                deleteBookBundle(bundle.id);
                                showToast('Paket bundling dihapus');
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {bundle.nama_bundle}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {bundle.deskripsi}
                        </p>
                      </div>

                      {/* Component Books List */}
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Isi Paket ({bundle.items.length} Judul Buku):
                        </span>
                        {bundle.items.map((item, idx) => {
                          const b = books.find(book => book.id === item.buku_id);
                          return (
                            <div key={idx} className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                              <span className="truncate pr-2">• {b?.judul || `Buku #${item.buku_id}`}</span>
                              <span className="font-bold shrink-0">{item.jumlah}x</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pricing Comparison */}
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/60 dark:border-purple-900/40">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Harga Normal Satuan</span>
                          <span className="text-xs text-slate-400 line-through">Rp {formatNumberWithDots(originalTotal)}</span>
                          <span className="text-sm font-black text-purple-700 dark:text-purple-300 block">
                            Rp {formatNumberWithDots(bundle.harga_bundle)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                            HEMAT {hematPersen}%
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            - Rp {formatNumberWithDots(hematNominal)}
                          </span>
                        </div>
                      </div>

                      {/* Stock availability indicator */}
                      <div className="flex items-center justify-between text-xs px-1">
                        <span className="text-slate-500">Stok Paket Tersedia:</span>
                        <span className={`font-bold ${
                          bundleStock > 10 ? 'text-emerald-600' : bundleStock > 0 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {bundleStock === Infinity ? 0 : bundleStock} paket
                        </span>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          if (onOpenPOSWithBundle) {
                            onOpenPOSWithBundle(bundle);
                          } else {
                            showToast(`Paket "${bundle.nama_bundle}" siap dimasukkan ke keranjang kasir.`);
                          }
                        }}
                        className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow transition-all"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Jual via POS / Kasir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BUAT / EDIT CAMPAIGN PRE-ORDER                   */}
      {/* ======================================================== */}
      {isPOCampaignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Rocket className="w-5 h-5 text-orange-500" />
                <span>{editingCampaign ? 'Edit Campaign Pre-Order' : 'Buat Campaign Pre-Order Baru'}</span>
              </h3>
              <button
                onClick={() => setIsPOCampaignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Campaign PO</label>
                  <input
                    type="text"
                    required
                    value={poForm.judul_campaign}
                    onChange={(e) => setPoForm({ ...poForm, judul_campaign: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="Contoh: PO Eksklusif: Lamrim Chenmo Edisi Lengkap"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Campaign</label>
                  <input
                    type="text"
                    required
                    value={poForm.kode_campaign}
                    onChange={(e) => setPoForm({ ...poForm, kode_campaign: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus:outline-none"
                    placeholder="PO-LRM-01"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Buku Terkait</label>
                  <select
                    value={poForm.buku_id}
                    onChange={(e) => {
                      const bId = Number(e.target.value);
                      const selectedBuku = books.find(b => b.id === bId);
                      setPoForm({
                        ...poForm,
                        buku_id: bId,
                        harga_normal: selectedBuku?.harga_jual || poForm.harga_normal,
                        harga_po: selectedBuku ? Math.round(selectedBuku.harga_jual * 0.85) : poForm.harga_po
                      });
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {books.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.judul} (Rp {formatNumberWithDots(b.harga_jual)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Kuota Pemesan (Eks)</label>
                  <input
                    type="number"
                    min="10"
                    required
                    value={poForm.target_kuota}
                    onChange={(e) => setPoForm({ ...poForm, target_kuota: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Campaign</label>
                  <select
                    value={poForm.status}
                    onChange={(e) => setPoForm({ ...poForm, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Aktif">Aktif (Sedang Berjalan)</option>
                    <option value="Tercapai">Tercapai (Kuota Penuh)</option>
                    <option value="Ditutup">Ditutup</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Normal (Rp)</label>
                  <RupiahInput
                    value={poForm.harga_normal}
                    onChange={(val) => setPoForm({ ...poForm, harga_normal: val })}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Harga Pre-Order (Rp)</label>
                  <RupiahInput
                    value={poForm.harga_po}
                    onChange={(val) => setPoForm({ ...poForm, harga_po: val })}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Minimal DP (Rp)</label>
                  <RupiahInput
                    value={poForm.minimal_dp}
                    onChange={(val) => setPoForm({ ...poForm, minimal_dp: val })}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Estimasi Pengiriman</label>
                  <input
                    type="text"
                    value={poForm.estimasi_pengiriman}
                    onChange={(e) => setPoForm({ ...poForm, estimasi_pengiriman: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    placeholder="Contoh: 15 November 2026"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bonus Merchandise Spesial PO</label>
                  <input
                    type="text"
                    value={poForm.bonus_item}
                    onChange={(e) => setPoForm({ ...poForm, bonus_item: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    placeholder="Contoh: Hardcover Slipcase + Pembatas Logam Kuningan"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi & Catatan Naskah</label>
                  <textarea
                    rows={2}
                    value={poForm.deskripsi}
                    onChange={(e) => setPoForm({ ...poForm, deskripsi: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    placeholder="Tuliskan latar belakang naskah, penerjemah, atau keutamaan edisi khusus ini..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPOCampaignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow"
                >
                  {editingCampaign ? 'Simpan Perubahan' : 'Publikasikan Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BUAT / EDIT PAKET BUNDLING                        */}
      {/* ======================================================== */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-purple-600" />
                <span>{editingBundle ? 'Edit Paket Bundling' : 'Buat Paket Bundling Baru'}</span>
              </h3>
              <button
                onClick={() => setIsBundleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBundle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Paket Bundling</label>
                  <input
                    type="text"
                    required
                    value={bundleForm.nama_bundle}
                    onChange={(e) => setBundleForm({ ...bundleForm, nama_bundle: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: Paket Trilogi Lamrim Pemula"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Paket</label>
                  <input
                    type="text"
                    required
                    value={bundleForm.kode_bundle}
                    onChange={(e) => setBundleForm({ ...bundleForm, kode_bundle: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase focus:outline-none"
                    placeholder="BNDL-LRM-01"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Label Promosi (Badge)</label>
                  <input
                    type="text"
                    value={bundleForm.badge}
                    onChange={(e) => setBundleForm({ ...bundleForm, badge: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    placeholder="Contoh: Paling Laris / Hemat 20%"
                  />
                </div>

                {/* Component Books Builder */}
                <div className="col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Buku dalam Paket ({bundleForm.items.length} Judul):
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const unusedBook = books.find(b => !bundleForm.items.some(i => i.buku_id === b.id));
                        setBundleForm({
                          ...bundleForm,
                          items: [...bundleForm.items, { buku_id: unusedBook?.id || books[0].id, jumlah: 1 }]
                        });
                      }}
                      className="text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Judul</span>
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {bundleForm.items.map((item, index) => {
                      const book = books.find(b => b.id === item.buku_id);
                      return (
                        <div key={index} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          <select
                            value={item.buku_id}
                            onChange={(e) => {
                              const updated = [...bundleForm.items];
                              updated[index].buku_id = Number(e.target.value);
                              setBundleForm({ ...bundleForm, items: updated });
                            }}
                            className="flex-1 p-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white"
                          >
                            {books.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.judul} (Rp {formatNumberWithDots(b.harga_jual)})
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center space-x-1 shrink-0">
                            <span className="text-slate-500">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.jumlah}
                              onChange={(e) => {
                                const updated = [...bundleForm.items];
                                updated[index].jumlah = Math.max(1, Number(e.target.value));
                                setBundleForm({ ...bundleForm, items: updated });
                              }}
                              className="w-14 p-1.5 text-center text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white font-bold"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (bundleForm.items.length <= 1) {
                                showToast('Minimal harus ada 1 buku');
                                return;
                              }
                              setBundleForm({
                                ...bundleForm,
                                items: bundleForm.items.filter((_, idx) => idx !== index)
                              });
                            }}
                            className="p-1.5 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price suggestion preview */}
                <div className="col-span-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Total Harga Asli Satuan:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Rp {formatNumberWithDots(
                        bundleForm.items.reduce((sum, item) => {
                          const b = books.find(book => book.id === item.buku_id);
                          return sum + ((b?.harga_jual || 0) * item.jumlah);
                        }, 0)
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        const sum = bundleForm.items.reduce((acc, item) => {
                          const b = books.find(book => book.id === item.buku_id);
                          return acc + ((b?.harga_jual || 0) * item.jumlah);
                        }, 0);
                        setBundleForm({ ...bundleForm, harga_bundle: Math.round(sum * 0.85) });
                      }}
                      className="text-xs text-purple-700 dark:text-purple-300 font-bold hover:underline"
                    >
                      ⚡ Pasang Diskon 15% Otomatis
                    </button>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Harga Paket Bundling (Rp)
                  </label>
                  <RupiahInput
                    value={bundleForm.harga_bundle}
                    onChange={(val) => setBundleForm({ ...bundleForm, harga_bundle: val })}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Paket</label>
                  <textarea
                    rows={2}
                    value={bundleForm.deskripsi}
                    onChange={(e) => setBundleForm({ ...bundleForm, deskripsi: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    placeholder="Jelaskan manfaat dan sasaran pembaca paket buku ini..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBundleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow"
                >
                  {editingBundle ? 'Simpan Perubahan' : 'Buat Paket Bundling'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: QUICK ORDER PRE-ORDER                             */}
      {/* ======================================================== */}
      {quickPOModalCampaign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-500" />
                <span>Pencatatan Pesanan Pre-Order</span>
              </h3>
              <button
                onClick={() => setQuickPOModalCampaign(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-900/40 text-xs">
              <div className="font-bold text-orange-900 dark:text-orange-200">{quickPOModalCampaign.judul_campaign}</div>
              <div className="text-orange-700 dark:text-orange-300 mt-0.5">
                Harga PO: <b>Rp {formatNumberWithDots(quickPOModalCampaign.harga_po)}</b> | Min. DP: Rp {formatNumberWithDots(quickPOModalCampaign.minimal_dp)}
              </div>
            </div>

            <form onSubmit={handleSubmitQuickPO} className="space-y-3.5 text-xs">
              {/* Member Quick Fill */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih dari Master Identitas / Anggota (Opsional)
                </label>
                <select
                  value={quickPOIdentitasId || ''}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const member = identitasList.find(m => m.id === id);
                    if (member) {
                      setQuickPOIdentitasId(member.id);
                      setQuickPONama(member.nama_lengkap);
                      setQuickPOKontak(member.nomor_hp_primary || '');
                      setQuickPOAlamat(`${member.alamat || ''}, ${member.kota || ''}`.trim());
                    } else {
                      setQuickPOIdentitasId(undefined);
                    }
                  }}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">-- Input Bebas (Bukan Anggota Terdaftar) --</option>
                  {identitasList.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nama_lengkap} ({m.nomor_hp_primary || 'No HP -'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Pemesan</label>
                <input
                  type="text"
                  required
                  value={quickPONama}
                  onChange={(e) => setQuickPONama(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  placeholder="Nama lengkap pemesan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    required
                    value={quickPOKontak}
                    onChange={(e) => setQuickPOKontak(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    placeholder="0812xxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Pesanan (Eks)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickPOJumlah}
                    onChange={(e) => {
                      const qty = Math.max(1, Number(e.target.value));
                      setQuickPOJumlah(qty);
                      if (quickPOTipeBayar === 'lunas') {
                        setQuickPOTerbayar(qty * quickPOModalCampaign.harga_po);
                      } else {
                        setQuickPOTerbayar(qty * quickPOModalCampaign.minimal_dp);
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Type */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 dark:text-slate-300">Tipe Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickPOTipeBayar('lunas');
                      setQuickPOTerbayar(quickPOJumlah * quickPOModalCampaign.harga_po);
                    }}
                    className={`py-2 px-3 rounded-lg font-bold border text-center transition-all ${
                      quickPOTipeBayar === 'lunas'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ✓ Bayar Lunas Penuh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickPOTipeBayar('dp');
                      setQuickPOTerbayar(quickPOJumlah * quickPOModalCampaign.minimal_dp);
                    }}
                    className={`py-2 px-3 rounded-lg font-bold border text-center transition-all ${
                      quickPOTipeBayar === 'dp'
                        ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-700 dark:text-orange-300'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    ⚡ Uang Muka (DP)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Diterima Sekarang (Rp)
                </label>
                <RupiahInput
                  value={quickPOTerbayar}
                  onChange={(val) => setQuickPOTerbayar(val)}
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Total Tagihan: <b>Rp {formatNumberWithDots(quickPOJumlah * quickPOModalCampaign.harga_po)}</b>
                  {quickPOTipeBayar === 'dp' && (
                    <span className="text-orange-600 ml-1">
                      (Sisa Rp {formatNumberWithDots((quickPOJumlah * quickPOModalCampaign.harga_po) - quickPOTerbayar)} saat buku siap kirim)
                    </span>
                  )}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Pengiriman</label>
                <textarea
                  rows={2}
                  value={quickPOAlamat}
                  onChange={(e) => setQuickPOAlamat(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  placeholder="Alamat lengkap penerima..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setQuickPOModalCampaign(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-lg shadow"
                >
                  Simpan & Buat Invoice PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
