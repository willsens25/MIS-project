import React, { useState } from 'react';
import { Order, Identitas, Book } from '../../types';
import {
  WHATSAPP_TEMPLATES,
  formatIndonesianPhone,
  isValidWhatsAppNumber,
  buildWhatsAppLink,
  replaceWhatsAppVariables,
  WhatsAppLogItem,
  YAYASAN_BANK_INFO
} from '../../utils/whatsappTemplates';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Smartphone,
  Send,
  Copy,
  ExternalLink,
  Check,
  CheckCheck,
  Search,
  Filter,
  Sparkles,
  DollarSign,
  Package,
  FileText,
  Calendar,
  History,
  Trash2
} from 'lucide-react';
import { WhatsAppModal } from './WhatsAppModal';

interface WhatsAppAutomationTabProps {
  orders: Order[];
  identitasList: Identitas[];
  books: Book[];
  onTandaiLunas?: (orderId: number) => void;
}

export const WhatsAppAutomationTab: React.FC<WhatsAppAutomationTabProps> = ({
  orders,
  identitasList,
  books,
  onTandaiLunas
}) => {
  // Modal state
  const [modalOrder, setModalOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTemplate, setModalInitialTemplate] = useState<string>('pengingat_ramah');

  // Logs state (persistent across session)
  const [logs, setLogs] = useState<WhatsAppLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('mis_wa_logs');
      return saved ? JSON.parse(saved) : [
        {
          id: 'log_seed_1',
          invoiceNo: 'INV-2026-003',
          pembeliName: 'Dr. Surya Dharma',
          phone: '628123456789',
          templateId: 'lunas_packing',
          templateName: 'Konfirmasi Lunas & Pengemasan',
          sentAt: '13/09/2026, 14:20',
          status: 'Terkirim (WA Link Terbuka)'
        }
      ];
    } catch {
      return [];
    }
  });

  const handleAddLog = (newLog: WhatsAppLogItem) => {
    setLogs(prev => {
      const updated = [newLog, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('mis_wa_logs', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleClearLogs = () => {
    setLogs([]);
    try {
      localStorage.removeItem('mis_wa_logs');
    } catch {
      // ignore
    }
  };

  // Section 1: Reminder Filter State
  const [reminderSearch, setReminderSearch] = useState('');
  const [reminderAgeFilter, setReminderAgeFilter] = useState<'all' | 'new' | 'due' | 'overdue'>('all');

  // Section 2: Composer Hub State
  const [composerSource, setComposerSource] = useState<'order' | 'crm' | 'manual'>('order');
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>(
    orders.find(o => o.status === 'Pending')?.id || orders[0]?.id || ''
  );
  const [selectedIdentitasId, setSelectedIdentitasId] = useState<number | ''>(identitasList[0]?.id || '');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('pengingat_ramah');
  const [customResi, setCustomResi] = useState('');
  const [composerText, setComposerText] = useState('');
  const [copied, setCopied] = useState(false);

  // Derive target order or identitas
  const activeOrder = orders.find(o => o.id === selectedOrderId) || null;
  const activeIdentitas = identitasList.find(i => i.id === selectedIdentitasId) || null;

  // Recipient contact info
  const targetRecipientName = composerSource === 'order'
    ? (activeOrder?.nama_pembeli || '')
    : composerSource === 'crm'
    ? (activeIdentitas?.nama_lengkap || '')
    : manualName;

  const targetPhone = composerSource === 'order'
    ? (activeOrder?.kontak_pembeli || activeOrder?.kontak_penerima || '')
    : composerSource === 'crm'
    ? (activeIdentitas?.nomor_hp_primary || '')
    : manualPhone;

  // Refresh composer text when selection or template changes
  React.useEffect(() => {
    const tmpl = WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId) || WHATSAPP_TEMPLATES[0];
    const generated = replaceWhatsAppVariables(tmpl.defaultText, {
      order: composerSource === 'order' ? activeOrder : null,
      identitas: composerSource === 'crm' ? activeIdentitas : null,
      customPembeli: targetRecipientName,
      customPhone: targetPhone,
      customResi
    });
    setComposerText(generated);
  }, [composerSource, selectedOrderId, selectedIdentitasId, targetRecipientName, targetPhone, selectedTemplateId, customResi]);

  // Compute pending orders with days elapsed
  const today = new Date();
  const pendingOrdersWithAge = orders
    .filter(o => o.status === 'Pending')
    .map(o => {
      const orderDate = new Date(o.tanggal_pesan);
      const diffTime = Math.abs(today.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...o,
        daysElapsed: diffDays,
        urgency: diffDays <= 1 ? 'Baru (<24 jam)' : diffDays <= 3 ? 'Perlu Diingatkan' : 'Jatuh Tempo (>3 hari)'
      };
    });

  const filteredPendingOrders = pendingOrdersWithAge.filter(o => {
    const matchSearch =
      o.no_invoice.toLowerCase().includes(reminderSearch.toLowerCase()) ||
      o.nama_pembeli.toLowerCase().includes(reminderSearch.toLowerCase()) ||
      (o.kontak_pembeli && o.kontak_pembeli.includes(reminderSearch));

    const matchAge =
      reminderAgeFilter === 'all' ||
      (reminderAgeFilter === 'new' && o.daysElapsed <= 1) ||
      (reminderAgeFilter === 'due' && o.daysElapsed > 1 && o.daysElapsed <= 3) ||
      (reminderAgeFilter === 'overdue' && o.daysElapsed > 3);

    return matchSearch && matchAge;
  });

  const ordersLunas = orders.filter(o => o.status === 'Lunas');
  const contactsWithPhone = identitasList.filter(i => i.nomor_hp_primary);

  const formattedTargetPhone = formatIndonesianPhone(targetPhone);
  const isTargetPhoneValid = isValidWhatsAppNumber(targetPhone);

  const handleCopyComposer = () => {
    if (!composerText) return;
    navigator.clipboard.writeText(composerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    handleAddLog({
      id: 'walog_' + Date.now(),
      orderId: activeOrder?.id,
      invoiceNo: activeOrder?.no_invoice,
      pembeliName: targetRecipientName || 'Pelanggan',
      phone: formattedTargetPhone,
      templateId: selectedTemplateId,
      templateName: WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId)?.nama || 'Kustom',
      sentAt: new Date().toLocaleString('id-ID'),
      status: 'Tersalin ke Clipboard'
    });
  };

  const handleOpenWhatsAppComposer = () => {
    if (!isTargetPhoneValid) return;
    const url = buildWhatsAppLink(targetPhone, composerText);
    window.open(url, '_blank', 'noopener,noreferrer');

    handleAddLog({
      id: 'walog_' + Date.now(),
      orderId: activeOrder?.id,
      invoiceNo: activeOrder?.no_invoice,
      pembeliName: targetRecipientName || 'Pelanggan',
      phone: formattedTargetPhone,
      templateId: selectedTemplateId,
      templateName: WHATSAPP_TEMPLATES.find(t => t.id === selectedTemplateId)?.nama || 'Kustom',
      sentAt: new Date().toLocaleString('id-ID'),
      status: 'Terkirim (WA Link Terbuka)'
    });
  };

  const handleQuickModalOpen = (order: Order, templateId: string = 'pengingat_ramah') => {
    setModalOrder(order);
    setModalInitialTemplate(templateId);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-extrabold text-amber-900 dark:text-amber-200">
              {pendingOrdersWithAge.length}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-400 truncate">
              Invoice Butuh Diingatkan
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-200">
              {ordersLunas.length}
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
              Pesanan Lunas Siap Notif
            </div>
          </div>
        </div>

        <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-extrabold text-cyan-900 dark:text-cyan-200">
              {contactsWithPhone.length}
            </div>
            <div className="text-xs text-cyan-700 dark:text-cyan-400 truncate">
              Kontak WhatsApp Terdata
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 p-4 rounded-2xl flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-extrabold text-indigo-900 dark:text-indigo-200">
              {logs.length}
            </div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400 truncate">
              Riwayat Pesan Dikirim
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: ANTRIAN PENGINGAT PEMBAYARAN PENDING (INVOICE REMINDERS) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-slate-50 to-amber-50/40 dark:from-slate-900 dark:to-amber-950/20">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Antrean Pengingat Tagihan (Invoice Pending)
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {pendingOrdersWithAge.length} Menunggu
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kirim pengingat pembayaran santun via WhatsApp 1-klik ke pemesan yang belum melunasi tagihan
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={reminderSearch}
                onChange={e => setReminderSearch(e.target.value)}
                placeholder="Cari invoice/pembeli/HP..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100 w-44 sm:w-56"
              />
            </div>
            <select
              value={reminderAgeFilter}
              onChange={e => setReminderAgeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
            >
              <option value="all">Semua Status</option>
              <option value="new">Baru (&lt;24 Jam)</option>
              <option value="due">Perlu Diingatkan (2-3 Hari)</option>
              <option value="overdue">Jatuh Tempo (&gt;3 Hari)</option>
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 font-semibold">No. Invoice & Tanggal</th>
                <th className="p-3 font-semibold">Nama Pembeli & WhatsApp</th>
                <th className="p-3 font-semibold text-right">Total Tagihan</th>
                <th className="p-3 font-semibold">Usia Tagihan</th>
                <th className="p-3 font-semibold">Status Riwayat WA</th>
                <th className="p-3 font-semibold text-right">Aksi Cepat WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPendingOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    🎉 Tidak ada pesanan pending yang memerlukan pengingat untuk kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredPendingOrders.map(order => {
                  const hasContacted = logs.some(l => l.invoiceNo === order.no_invoice);
                  return (
                    <tr key={order.id} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {order.no_invoice}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{order.tanggal_pesan}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {order.nama_pembeli}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          {order.kontak_pembeli ? (
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                              📱 {order.kontak_pembeli}
                            </span>
                          ) : (
                            <span className="text-amber-500 italic">Tanpa nomor kontak</span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded ml-1">
                            {order.via}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="font-bold text-slate-900 dark:text-white">
                          Rp {order.total_tagihan.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.items.length} judul buku
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.daysElapsed > 3
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : order.daysElapsed > 1
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {order.urgency} ({order.daysElapsed} hari)
                        </span>
                      </td>
                      <td className="p-3">
                        {hasContacted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            <CheckCheck className="w-3 h-3 text-emerald-500" />
                            Pernah diingatkan
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Belum diingatkan
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleQuickModalOpen(order, 'pengingat_ramah')}
                          className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs inline-flex items-center space-x-1 cursor-pointer shadow-xs transition-all active:scale-95"
                          title="Buka composer & kirim pengingat WhatsApp"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Kirim Pengingat WA</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: LIVE WHATSAPP COMPOSER & CRM HUB */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-teal-50/40 dark:from-slate-900 dark:to-teal-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                WA
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Pusat Pesan & Personalisasi Template WhatsApp
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Buat pesan otomatis untuk konfirmasi pesanan, nomor resi pengiriman, hingga broadcast info buku baru
            </p>
          </div>

          {/* Target Source Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setComposerSource('order')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                composerSource === 'order'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dari Pesanan
            </button>
            <button
              type="button"
              onClick={() => setComposerSource('crm')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                composerSource === 'crm'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dari Kontak CRM
            </button>
            <button
              type="button"
              onClick={() => setComposerSource('manual')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                composerSource === 'manual'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Manual Baru
            </button>
          </div>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            {/* Recipient Source Controls */}
            {composerSource === 'order' && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih Pesanan / Invoice:
                </label>
                <select
                  value={selectedOrderId}
                  onChange={e => setSelectedOrderId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                >
                  {orders.map(o => (
                    <option key={o.id} value={o.id}>
                      #{o.no_invoice} - {o.nama_pembeli} ({o.status} | Rp {o.total_tagihan.toLocaleString('id-ID')}) - {o.kontak_pembeli || 'No WA'}
                    </option>
                  ))}
                </select>
                {activeOrder && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-2 pt-1">
                    <span>📱 WA: <strong className="text-emerald-600 dark:text-emerald-400">{activeOrder.kontak_pembeli || 'Belum ada'}</strong></span>
                    <span>📦 Ekspedisi: <strong>{activeOrder.ekspedisi}</strong></span>
                    <span>📍 Kota: <strong>{activeOrder.alamat_penerima || '-'}</strong></span>
                  </div>
                )}
              </div>
            )}

            {composerSource === 'crm' && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih Kontak Anggota / Mitra CRM:
                </label>
                <select
                  value={selectedIdentitasId}
                  onChange={e => setSelectedIdentitasId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                >
                  {identitasList.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.nama_lengkap} ({i.kategori_identitas || i.jenis_umat || 'Kontak'}) - {i.nomor_hp_primary || 'Tanpa No HP'}
                    </option>
                  ))}
                </select>
                {activeIdentitas && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-2 pt-1">
                    <span>📱 No HP: <strong className="text-emerald-600 dark:text-emerald-400">{activeIdentitas.nomor_hp_primary || 'Belum ada'}</strong></span>
                    <span>🏷️ Kategori: <strong>{activeIdentitas.kategori_identitas || 'Umum'}</strong></span>
                  </div>
                )}
              </div>
            )}

            {composerSource === 'manual' && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nama Penerima:
                  </label>
                  <input
                    type="text"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Nomor WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={manualPhone}
                    onChange={e => setManualPhone(e.target.value)}
                    placeholder="0812... atau 62812..."
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            )}

            {/* Template Selector Pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Pilih Format Template:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WHATSAPP_TEMPLATES.map(tmpl => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-[11px] truncate flex items-center justify-between">
                        <span>{tmpl.nama}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {tmpl.deskripsi}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* If Resi Template is selected, allow typing custom resi */}
            {selectedTemplateId === 'resi_pengiriman' && (
              <div className="bg-cyan-50 dark:bg-cyan-950/30 p-3 rounded-xl border border-cyan-200 dark:border-cyan-800/60">
                <label className="block text-[11px] font-bold text-cyan-800 dark:text-cyan-300 mb-1">
                  Nomor Resi Ekspedisi:
                </label>
                <input
                  type="text"
                  value={customResi}
                  onChange={e => setCustomResi(e.target.value)}
                  placeholder="Contoh: JNE0291039129 / SOC1238491"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 rounded-lg focus:ring-2 focus:ring-cyan-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            )}

            {/* Message Box */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sunting Pesan WhatsApp:
                </label>
                <span className="text-[10px] text-slate-400">
                  {composerText.length} Karakter
                </span>
              </div>
              <textarea
                rows={8}
                value={composerText}
                onChange={e => setComposerText(e.target.value)}
                className="w-full p-3 text-xs font-sans leading-relaxed bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 resize-none shadow-2xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-500">
                {isTargetPhoneValid ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Siap kirim ke +{formattedTargetPhone}
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Nomor WhatsApp belum valid / kosong
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyComposer}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsAppComposer}
                  disabled={!isTargetPhoneValid}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Smartphone Simulator: 5 cols */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pratinjau Layar WhatsApp</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                {formattedTargetPhone ? `+${formattedTargetPhone}` : 'No Kontak'}
              </span>
            </div>

            {/* Smartphone Mockup */}
            <div className="flex-1 bg-slate-950 rounded-3xl p-3 border-4 border-slate-800 shadow-xl flex flex-col overflow-hidden min-h-[380px] max-h-[500px]">
              {/* Phone Status bar */}
              <div className="flex justify-between items-center px-3 py-1 text-[10px] text-slate-400 border-b border-slate-800/80 mb-2">
                <span>12:00</span>
                <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />
                <span>4G 100%</span>
              </div>

              {/* WhatsApp App Header */}
              <div className="flex items-center space-x-2.5 px-3 py-2 bg-[#075E54] text-white rounded-t-xl shrink-0">
                <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-xs text-slate-900">
                  {targetRecipientName ? targetRecipientName.charAt(0).toUpperCase() : 'L'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs truncate">
                    {targetRecipientName || 'Nama Penerima'}
                  </div>
                  <div className="text-[10px] text-emerald-100/70 truncate">
                    {formattedTargetPhone ? `+${formattedTargetPhone}` : 'online'}
                  </div>
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 bg-[#EFEAE2] dark:bg-[#0b141a] p-3 overflow-y-auto space-y-2 rounded-b-xl relative text-slate-900 dark:text-slate-100">
                <div className="text-center my-1">
                  <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-[9px] text-slate-500 shadow-2xs">
                    HARI INI
                  </span>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[92%] bg-[#D9FDD3] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 p-3 rounded-2xl rounded-tr-xs shadow-xs text-xs whitespace-pre-wrap leading-relaxed relative break-words">
                    {composerText || (
                      <span className="italic text-slate-400">Pesan WhatsApp akan tampil di sini...</span>
                    )}

                    <div className="flex items-center justify-end space-x-1 mt-1 text-[9px] text-slate-500 dark:text-emerald-200/80">
                      <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      <CheckCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-300 inline" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: RIWAYAT PESAN WHATSAPP & AUDIT LOG */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-indigo-500" />
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Riwayat Pesan & Kontak Terakhir ({logs.length})
            </h4>
          </div>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={handleClearLogs}
              className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Bersihkan Riwayat</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-3 font-semibold">Waktu Kirim</th>
                <th className="p-3 font-semibold">Invoice Terkait</th>
                <th className="p-3 font-semibold">Penerima & WhatsApp</th>
                <th className="p-3 font-semibold">Template</th>
                <th className="p-3 font-semibold">Status Pengiriman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                    Belum ada riwayat pesan yang dikirimkan pada sesi ini.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{log.sentAt}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {log.invoiceNo ? `#${log.invoiceNo}` : '-'}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white">{log.pembeliName}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5 font-mono">({log.phone ? `+${log.phone}` : '-'})</span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">{log.templateName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 w-max">
                        <CheckCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Modal for Quick Actions */}
      <WhatsAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={modalOrder}
        initialTemplateId={modalInitialTemplate}
        onLogSent={handleAddLog}
      />
    </div>
  );
};
