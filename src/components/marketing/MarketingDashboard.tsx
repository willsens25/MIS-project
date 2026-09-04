import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Order, OrderItem, Promo, Book, Identitas } from '../../types';
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
  TrendingUp
} from 'lucide-react';
import { InvoicePrintModal } from '../modals/InvoicePrintModal';
import { MarketingCharts } from '../charts/MarketingCharts';

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
    deletePromo,
    bulkDeletePromos,
    checkPromoCode,
    identitasList
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'pos' | 'grafik' | 'invoices' | 'promos' | 'agen'>('pos');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selection states for bulk delete
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [selectedPromoIds, setSelectedPromoIds] = useState<number[]>([]);

  // Print Invoice Modal
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

  // POS Form State
  const [pembeliName, setPembeliName] = useState('');
  const [selectedIdentitasId, setSelectedIdentitasId] = useState<number | ''>('');
  const [viaPlatform, setViaPlatform] = useState('WhatsApp Marketing');
  const [penerimaName, setPenerimaName] = useState('');
  const [alamatPenerima, setAlamatPenerima] = useState('');
  const [ekspedisi, setEkspedisi] = useState('JNE Reguler');
  const [ongkir, setOngkir] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');

  // POS Items
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
    type: 'percentage' | 'nominal';
    reward_value: number;
    max_uses: number;
    expiry_date: string;
  }>({
    code: '',
    type: 'percentage',
    reward_value: 10,
    max_uses: 100,
    expiry_date: '2027-12-31'
  });

  // Handle agent selection auto-fill
  const handleSelectAgent = (identitasId: number) => {
    const identitas = identitasList.find(i => i.id === identitasId);
    if (identitas) {
      setSelectedIdentitasId(identitas.id);
      setPembeliName(identitas.nama_lengkap);
      setPenerimaName(identitas.panggilan || identitas.nama_lengkap);
      setAlamatPenerima(`${identitas.alamat || ''}, ${identitas.kota || ''}`.trim());
    }
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

  // Calculate POS totals
  const calculatedItems: OrderItem[] = orderItems.map(row => {
    const book = books.find(b => b.id === row.buku_id);
    const hargaSatuan = book?.harga_jual || 0;
    const subtotalAwal = hargaSatuan * row.jumlah;

    let potonganDiskon = 0;
    let validPromoCode: string | null = null;

    if (row.promo_code.trim()) {
      const check = checkPromoCode(row.promo_code, row.buku_id);
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
  const totalSubtotalItems = calculatedItems.reduce((s, it) => s + it.subtotal, 0);
  const totalTagihanAkhir = totalSubtotalItems + (ongkir || 0);

  // Submit Order
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pembeliName.trim()) {
      alert('Nama Pembeli / Agen wajib diisi!');
      return;
    }
    if (orderItems.length === 0 || totalItemCount === 0) {
      alert('Pesanan harus memiliki minimal 1 item buku!');
      return;
    }

    // Generate invoice no: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`;

    const newOrderData: Omit<Order, 'id' | 'created_at'> = {
      no_invoice: invoiceNo,
      tanggal_pesan: new Date().toISOString().substring(0, 10),
      via: viaPlatform,
      nama_pembeli: pembeliName.trim().toUpperCase(),
      nama_penerima: penerimaName.trim() || pembeliName.trim(),
      alamat_penerima: alamatPenerima.trim() || 'Alamat Toko / Pengambilan Kantor',
      ekspedisi,
      ongkir: ongkir || 0,
      status: 'Pending',
      total_tagihan: totalTagihanAkhir,
      keterangan,
      items: calculatedItems,
      tercatat_finance: 0
    };

    const res = createOrder(newOrderData);
    if (res.success) {
      alert(res.message);
      // Reset form
      setPembeliName('');
      setPenerimaName('');
      setAlamatPenerima('');
      setOngkir(0);
      setKeterangan('');
      setOrderItems([{ buku_id: books[0]?.id || 1, jumlah: 1, promo_code: '' }]);
      setActiveSubTab('invoices');
    } else {
      alert(res.message);
    }
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code.trim() || promoForm.reward_value <= 0) {
      alert('Kode Promo dan Nilai Reward harus diisi dengan benar!');
      return;
    }
    addPromo(promoForm);
    setModalPromoOpen(false);
    setPromoForm({ code: '', type: 'percentage', reward_value: 10, max_uses: 100, expiry_date: '2027-12-31' });
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.no_invoice.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      o.nama_pembeli.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      o.via.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

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

  const handleBulkDeleteOrders = () => {
    if (selectedOrderIds.length === 0) return;
    if (confirm(`Yakin ingin menghapus ${selectedOrderIds.length} invoice terpilih? Mutasi dan antrean logistik terkait akan otomatis dibersihkan.`)) {
      bulkDeleteOrders(selectedOrderIds);
      setSelectedOrderIds([]);
    }
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
    if (confirm(`Yakin ingin menghapus ${selectedPromoIds.length} kode promo terpilih?`)) {
      bulkDeletePromos(selectedPromoIds);
      setSelectedPromoIds([]);
    }
  };

  const handleExportOrdersCSV = () => {
    const headers = ['No Invoice,Tanggal,Via,Pembeli,Ekspedisi,Ongkir,Status,Total Tagihan'];
    const rows = filteredOrders.map(o =>
      `"${o.no_invoice}","${o.tanggal_pesan}","${o.via}","${o.nama_pembeli}","${o.ekspedisi}","${o.ongkir}","${o.status}","${o.total_tagihan}"`
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
      
      {/* Sub tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center space-x-1.5 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl">
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
        </div>

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

      {/* GRAFIK & ANALISIS SUB TAB */}
      {activeSubTab === 'grafik' && (
        <MarketingCharts orders={orders} books={books} />
      )}

      {/* POS / BUAT PESANAN SUB TAB */}
      {activeSubTab === 'pos' && (
        <form onSubmit={handleCreateOrderSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Form Fields & Multi Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Customer & Platform */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Informasi Pembeli & Saluran Penjualan</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Pilih dari Master Agen / Anggota (Opsional)</label>
                  <select
                    value={selectedIdentitasId}
                    onChange={e => {
                      const id = parseInt(e.target.value);
                      if (id) handleSelectAgent(id);
                      else setSelectedIdentitasId('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="">-- Pilih Anggota / Agen Terdaftar --</option>
                    {identitasList.map(i => (
                      <option key={i.id} value={i.id}>{i.nama_lengkap} ({i.kota || 'Indonesia'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nama Pembeli / Agen *</label>
                  <input
                    type="text"
                    required
                    value={pembeliName}
                    onChange={e => setPembeliName(e.target.value)}
                    placeholder="Nama Lengkap Pembeli / Toko"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Via Saluran / Marketplace *</label>
                  <select
                    value={viaPlatform}
                    onChange={e => setViaPlatform(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="WhatsApp Marketing">WhatsApp Marketing</option>
                    <option value="Tokopedia">Tokopedia</option>
                    <option value="Shopee">Shopee</option>
                    <option value="Bazar / Event Vihara">Bazar / Event Vihara</option>
                    <option value="Direct Order Offline">Direct Order Offline</option>
                    <option value="Website Lamrimnesia">Website Lamrimnesia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Nama Penerima Paket</label>
                  <input
                    type="text"
                    value={penerimaName}
                    onChange={e => setPenerimaName(e.target.value)}
                    placeholder="Sama dengan nama pembeli jika kosong"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Alamat Tujuan Pengiriman</label>
                  <textarea
                    rows={2}
                    value={alamatPenerima}
                    onChange={e => setAlamatPenerima(e.target.value)}
                    placeholder="Jl. Nama Jalan No. XX, Kota, Kode Pos..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Pilihan Ekspedisi / Kurir</label>
                  <select
                    value={ekspedisi}
                    onChange={e => setEkspedisi(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                  >
                    <option value="JNE Reguler">JNE Reguler</option>
                    <option value="JNE YES">JNE YES</option>
                    <option value="SiCepat Reguler">SiCepat Reguler</option>
                    <option value="SiCepat Cargo / Gokil">SiCepat Cargo / Gokil</option>
                    <option value="J&T Express">J&T Express</option>
                    <option value="GrabExpress / GoSend">GrabExpress / GoSend</option>
                    <option value="Ambil Sendiri di Gudang">Ambil Sendiri di Gudang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Ongkos Kirim (Rupiah)</label>
                  <input
                    type="number"
                    min="0"
                    value={ongkir || ''}
                    onChange={e => setOngkir(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Items Selection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Pilihan Buku & Kode Promo Per Baris</h3>
                  <p className="text-xs text-slate-500">Stok divalidasi langsung dari database gudang.</p>
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

              <div className="space-y-3">
                {orderItems.map((item, idx) => {
                  const currentBook = books.find(b => b.id === item.buku_id);
                  const isLowStock = currentBook && currentBook.stok_gudang < item.jumlah;

                  return (
                    <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                      <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
                        
                        {/* Book Select */}
                        <div className="flex-1 w-full">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Judul Buku</label>
                          <select
                            value={item.buku_id}
                            onChange={e => handleUpdateItem(idx, 'buku_id', parseInt(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
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
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">QTY</label>
                          <input
                            type="number"
                            min="1"
                            value={item.jumlah}
                            onChange={e => handleUpdateItem(idx, 'jumlah', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
                          />
                        </div>

                        {/* Promo Code */}
                        <div className="w-36">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Kode Promo</label>
                          <input
                            type="text"
                            value={item.promo_code}
                            onChange={e => handleUpdateItem(idx, 'promo_code', e.target.value.toUpperCase())}
                            placeholder="DHARMA10"
                            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg uppercase text-xs"
                          />
                        </div>

                        {/* Remove */}
                        <div className="pt-3.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            disabled={orderItems.length === 1}
                            className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {isLowStock && (
                        <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 text-[11px] font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Stok tidak mencukupi! Hanya tersedia {currentBook?.stok_gudang} pcs di gudang.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Col: Order Summary & Checkout Card */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 sticky top-20">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
                Ringkasan Tagihan POS
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Total Kuantitas Buku:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{totalItemCount} Eksemplar</span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal Buku:</span>
                  <span className="font-bold">Rp {totalSubtotalItems.toLocaleString('id-ID')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Ongkos Kirim ({ekspedisi}):</span>
                  <span className="font-bold">Rp {(ongkir || 0).toLocaleString('id-ID')}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>TOTAL TAGIHAN:</span>
                  <span className="text-lg text-indigo-600 dark:text-indigo-400">
                    Rp {totalTagihanAkhir.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 text-xs font-semibold mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  placeholder="Catatan packing atau instruksi khusus..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
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
                    <th className="p-3.5">Pembeli & Saluran</th>
                    <th className="p-3.5">Ekspedisi / Tujuan</th>
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
                        <div className="font-bold text-slate-900 dark:text-white">{order.nama_pembeli}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {order.via}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-semibold">{order.ekspedisi}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{order.alamat_penerima}</div>
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                        Rp {order.total_tagihan.toLocaleString('id-ID')}
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

                        {order.status === 'Pending' && (
                          <button
                            onClick={() => {
                              if (confirm(`Konfirmasi pembayaran lunas untuk ${order.no_invoice}? Data akan otomatis masuk ke Jurnal Finance dan Antrean Packing Logistik.`)) {
                                tandaiLunasOrder(order.id);
                              }
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px]"
                          >
                            Tandai Lunas
                          </button>
                        )}

                        {order.status !== 'Cancelled' && (
                          <button
                            onClick={() => {
                              if (confirm(`Batalkan invoice ${order.no_invoice}? Stok buku akan dikembalikan ke gudang.`)) {
                                cancelOrder(order.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Batalkan Invoice"
                          >
                            <XCircle className="w-3.5 h-3.5" />
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
                      if (confirm(`Hapus kode promo ${p.code}?`)) deletePromo(p.id);
                    }}
                    className="text-rose-600 hover:underline font-semibold text-[11px]"
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

    </div>
  );
};
