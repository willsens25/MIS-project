import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Printer,
  QrCode,
  Banknote,
  CreditCard,
  RotateCcw,
  Sparkles,
  Share2,
  Send,
  X,
  User,
  Clock,
  Package,
  Calendar,
  Layers,
  FileText,
  ScanBarcode,
  ArrowRight,
  BadgePercent,
  Heart,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Book, Order, OrderItem } from '../../types';
import { cleanIsbn } from '../../utils/isbnLookup';
import { BarcodeScannerModal } from '../modals/BarcodeScannerModal';

interface CartItem {
  book: Book;
  qty: number;
  discountPercentage: number;
  customPrice?: number;
}

const PRESET_EVENTS = [
  'Bazar Waisak Jakarta',
  'Retreat Meditasi Lamrim',
  'Pameran Buku Dharma Indonesia',
  'Bazar Vihara & Komunitas',
  'Stand Publikasi Kantor Lamrimnesia',
  'Pameran Budaya & Buku Buddhis',
  'Kustom / Acara Lainnya'
];

export const EventPOSDashboard: React.FC = () => {
  const {
    books,
    accounts,
    promos,
    currentUser,
    createOrder,
    orders,
    recordActivity
  } = useApp();

  // Event & Cashier Configurations
  const [selectedEvent, setSelectedEvent] = useState<string>('Bazar Waisak Jakarta');
  const [customEventName, setCustomEventName] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<number>(() => {
    const cashAcc = accounts.find(a => a.nama_akun.toLowerCase().includes('kas')) || accounts[0];
    return cashAcc?.id || 1;
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalDiscountType, setGlobalDiscountType] = useState<'none' | '5' | '10' | '15' | '20' | 'custom'>('none');
  const [customDiscountNominal, setCustomDiscountNominal] = useState<number>(0);
  const [donasiNominal, setDonasiNominal] = useState<number>(0);
  const [keteranganDonasi, setKeteranganDonasi] = useState<string>('Dana Cetak Buku Dharma');

  // Customer Info
  const [namaPembeli, setNamaPembeli] = useState('Pengunjung Bazar');
  const [kontakWa, setKontakWa] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [transferRef, setTransferRef] = useState<string>('');

  // UI / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentCompletedOrder, setRecentCompletedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const activeEventName = selectedEvent === 'Kustom / Acara Lainnya' && customEventName.trim()
    ? customEventName.trim()
    : selectedEvent;

  // Categories extraction
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach(b => {
      if (b.kategori) set.add(b.kategori);
    });
    return ['Semua', ...Array.from(set)];
  }, [books]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return books.filter(b => {
      const matchCat = selectedCategory === 'Semua' || b.kategori === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;
      const matchJudul = b.judul.toLowerCase().includes(q);
      const matchPenulis = (b.penulis || '').toLowerCase().includes(q);
      const matchIsbn = (b.isbn || '').toLowerCase().includes(q);
      return matchJudul || matchPenulis || matchIsbn;
    });
  }, [books, searchQuery, selectedCategory]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const price = item.customPrice ?? item.book.harga_jual;
      return acc + (price * item.qty);
    }, 0);
  }, [cart]);

  const discountNominal = useMemo(() => {
    if (globalDiscountType === 'none') return 0;
    if (globalDiscountType === 'custom') return customDiscountNominal;
    const pct = parseInt(globalDiscountType, 10);
    return Math.round((subtotal * pct) / 100);
  }, [subtotal, globalDiscountType, customDiscountNominal]);

  const totalTagihan = useMemo(() => {
    return Math.max(0, subtotal - discountNominal + donasiNominal);
  }, [subtotal, discountNominal, donasiNominal]);

  const kembalian = useMemo(() => {
    if (paymentMethod !== 'cash') return 0;
    return Math.max(0, cashTendered - totalTagihan);
  }, [paymentMethod, cashTendered, totalTagihan]);

  const isCashInsufficient = paymentMethod === 'cash' && cashTendered < totalTagihan && totalTagihan > 0;

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Book to Cart
  const handleAddToCart = (book: Book, qtyToAdd = 1) => {
    if (book.stok_gudang <= 0) {
      showToast(`⚠️ Stok buku "${book.judul}" kosong di gudang.`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.book.id === book.id);
      if (existing) {
        const nextQty = existing.qty + qtyToAdd;
        if (nextQty > book.stok_gudang) {
          showToast(`⚠️ Maksimal stok tersedia: ${book.stok_gudang} eks.`);
          return prev.map(item => item.book.id === book.id ? { ...item, qty: book.stok_gudang } : item);
        }
        return prev.map(item => item.book.id === book.id ? { ...item, qty: nextQty } : item);
      } else {
        return [...prev, { book, qty: Math.min(qtyToAdd, book.stok_gudang), discountPercentage: 0 }];
      }
    });

    showToast(`🛒 "${book.judul}" ditambahkan ke keranjang`);
  };

  // Update Cart Item Quantity
  const handleUpdateQty = (bookId: number, nextQty: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    if (nextQty <= 0) {
      handleRemoveItem(bookId);
      return;
    }

    if (nextQty > book.stok_gudang) {
      showToast(`⚠️ Stok maksimal "${book.judul}" adalah ${book.stok_gudang} eks.`);
      nextQty = book.stok_gudang;
    }

    setCart(prev => prev.map(it => it.book.id === bookId ? { ...it, qty: nextQty } : it));
  };

  // Remove Item from Cart
  const handleRemoveItem = (bookId: number) => {
    setCart(prev => prev.filter(it => it.book.id !== bookId));
  };

  // Clear Cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Bersihkan semua item dalam keranjang kasir?')) {
      setCart([]);
      setCashTendered(0);
    }
  };

  // Quick Barcode Input Keydown
  const handleBarcodeKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = barcodeInput.trim();
      if (!code) return;

      const cleanCode = cleanIsbn(code);
      const matched = books.find(b => {
        const bIsbn = cleanIsbn(b.isbn || '');
        return bIsbn && (bIsbn === cleanCode || bIsbn.includes(cleanCode) || cleanCode.includes(bIsbn));
      });

      if (matched) {
        handleAddToCart(matched, 1);
        setBarcodeInput('');
      } else {
        showToast(`❌ Buku dengan barcode/ISBN "${code}" tidak ditemukan di database.`);
      }
    }
  };

  // Handle Barcode Modal Success
  const handleBarcodeModalSuccess = (detectedIsbn?: string) => {
    if (!detectedIsbn) return;
    const clean = cleanIsbn(detectedIsbn);
    const matched = books.find(b => {
      const bIsbn = cleanIsbn(b.isbn || '');
      return bIsbn && (bIsbn === clean || bIsbn.includes(clean) || clean.includes(bIsbn));
    });

    if (matched) {
      handleAddToCart(matched, 1);
    }
  };

  // Auto-set cash tendered when total changes if method is cash
  useEffect(() => {
    if (paymentMethod === 'cash' && (cashTendered === 0 || cashTendered < totalTagihan)) {
      setCashTendered(totalTagihan);
    }
  }, [totalTagihan, paymentMethod]);

  // Handle Checkout Execution
  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('⚠️ Keranjang belanja masih kosong.');
      return;
    }

    if (isCashInsufficient) {
      showToast(`⚠️ Uang tunai yang diterima masih kurang Rp ${(totalTagihan - cashTendered).toLocaleString('id-ID')}`);
      return;
    }

    // Verify stock one last time
    for (const item of cart) {
      const curBook = books.find(b => b.id === item.book.id);
      if (!curBook || curBook.stok_gudang < item.qty) {
        showToast(`⚠️ Stok "${item.book.judul}" tidak mencukupi untuk checkout.`);
        return;
      }
    }

    const orderDate = new Date().toISOString().substring(0, 10);
    const timestampStr = Date.now().toString().slice(-6);
    const invoiceNo = `EVT-${orderDate.replace(/-/g, '')}-${timestampStr}`;

    const orderItems: OrderItem[] = cart.map(item => {
      const price = item.customPrice ?? item.book.harga_jual;
      return {
        buku_id: item.book.id,
        jumlah: item.qty,
        harga_satuan: price,
        subtotal: price * item.qty,
        potongan_diskon: discountNominal > 0 ? Math.round((price * item.qty / subtotal) * discountNominal) : 0
      };
    });

    const orderData: Omit<Order, 'id' | 'created_at'> = {
      no_invoice: invoiceNo,
      tanggal_pesan: orderDate,
      via: `Event - ${activeEventName}`,
      nama_pembeli: namaPembeli.trim() || 'Pengunjung Bazar',
      kontak_pembeli: kontakWa.trim() || undefined,
      nama_penerima: namaPembeli.trim() || 'Pengunjung Bazar',
      alamat_penerima: `Lokasi Acara: ${activeEventName} (Serah Terima Langsung)`,
      ekspedisi: 'Ambil di Tempat / Kasir Langsung',
      ongkir: 0,
      donasi: donasiNominal > 0 ? donasiNominal : undefined,
      keterangan_donasi: donasiNominal > 0 ? keteranganDonasi : undefined,
      status: 'Lunas',
      total_tagihan: totalTagihan,
      user_id: currentUser?.id || 1,
      keterangan: `Kasir: ${currentUser?.name || 'Kasir'} | Metode: ${paymentMethod.toUpperCase()} | Diskon: Rp ${discountNominal.toLocaleString('id-ID')}${transferRef ? ` | Ref: ${transferRef}` : ''}`,
      tercatat_finance: 1,
      items: orderItems
    };

    const res = createOrder(orderData, selectedAccountId);

    if (res.success && res.order) {
      setRecentCompletedOrder(res.order);
      setIsReceiptModalOpen(true);
      showToast(`🎉 Pembayaran berhasil! Transaksi #${res.order.no_invoice} tersimpan.`);

      // Reset cart
      setCart([]);
      setCashTendered(0);
      setCustomDiscountNominal(0);
      setGlobalDiscountType('none');
      setDonasiNominal(0);
      setTransferRef('');
      setNamaPembeli('Pengunjung Bazar');
      setKontakWa('');
    } else {
      showToast(`❌ Gagal checkout: ${res.message}`);
    }
  };

  // Today's Event Session Orders
  const todayDateStr = new Date().toISOString().substring(0, 10);
  const todayEventOrders = useMemo(() => {
    return orders.filter(o => o.via.includes('Event -') && o.tanggal_pesan === todayDateStr);
  }, [orders, todayDateStr]);

  const todayEventOmzet = useMemo(() => {
    return todayEventOrders.reduce((sum, o) => sum + o.total_tagihan, 0);
  }, [todayEventOrders]);

  const todayBooksSold = useMemo(() => {
    return todayEventOrders.reduce((sum, o) => {
      const itemsCount = o.items.reduce((s, it) => s + it.jumlah, 0);
      return sum + itemsCount;
    }, 0);
  }, [todayEventOrders]);

  // Generate WhatsApp Receipt Text
  const generateWhatsAppMessage = (order: Order) => {
    const cleanPhone = (order.kontak_pembeli || '').replace(/[^0-9]/g, '');
    const targetPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

    const itemList = order.items.map((it, idx) => {
      const book = books.find(b => b.id === it.buku_id);
      const title = book?.judul || `Buku ID #${it.buku_id}`;
      return `${idx + 1}. *${title}* x ${it.jumlah} eks = Rp ${it.subtotal.toLocaleString('id-ID')}`;
    }).join('\n');

    const msg = `*STRUK DIGITAL PEMBELIAN BUKU - LAMRIMNESIA*
=================================
📍 *Acara:* ${order.via.replace('Event - ', '')}
🧾 *No. Invoice:* ${order.no_invoice}
📅 *Tanggal:* ${order.tanggal_pesan}
👤 *Pembeli:* ${order.nama_pembeli}
=================================
*DAFTAR BUKU:*
${itemList}
=================================
${order.donasi ? `❤️ *Donasi Dharma:* Rp ${order.donasi.toLocaleString('id-ID')}\n` : ''}💰 *TOTAL DIBAYAR:* Rp ${order.total_tagihan.toLocaleString('id-ID')}
💳 *Status:* LUNAS (${order.keterangan || 'Kasir Event'})
=================================
_Terima kasih telah mendukung pelestarian dan penyebaran ajaran Dharma melalui Penerbitan Lamrimnesia._
_Semoga kebajikan ini membawa kebahagiaan bagi semua makhluk. Sadhu, sadhu, sadhu._ 🙏✨`;

    const encoded = encodeURIComponent(msg);
    if (targetPhone.length >= 8) {
      window.open(`https://wa.me/${targetPhone}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP EVENT BAR & METRICS */}
      <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-teal-500/15 p-4 sm:p-5 rounded-3xl border border-amber-300/40 dark:border-amber-700/40 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                Kasir Cepat POS Event & Bazar
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  Mode Cepat
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pencatatan kasir layar sentuh instan, scan barcode, diskon bazar, struk thermal, & auto-potong stok.
              </p>
            </div>
          </div>
        </div>

        {/* Quick event configuration */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Preset event picker */}
          <div className="relative flex-1 sm:w-60">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {PRESET_EVENTS.map(ev => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          {selectedEvent === 'Kustom / Acara Lainnya' && (
            <input
              type="text"
              value={customEventName}
              onChange={(e) => setCustomEventName(e.target.value)}
              placeholder="Tulis nama acara..."
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          )}

          {/* Account selector */}
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(Number(e.target.value))}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            title="Akun penampungan omzet kasir"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.nama_akun}
              </option>
            ))}
          </select>

          {/* Session history toggle button */}
          <button
            type="button"
            onClick={() => setIsSessionHistoryOpen(prev => !prev)}
            className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Sesi Hari Ini ({todayEventOrders.length})</span>
          </button>
        </div>
      </div>

      {/* TODAY EVENT SUMMARY WIDGET (COLLAPSIBLE / ACCORDION) */}
      {isSessionHistoryOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Rekap Transaksi Kasir Event Hari Ini ({todayDateStr})
              </h3>
              <p className="text-xs text-slate-500">
                Lokasi: <strong>{activeEventName}</strong> | Kasir: <strong>{currentUser?.name || 'Kasir'}</strong>
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-slate-500 block">Total Omzet Hari Ini:</span>
                <span className="font-black text-emerald-600 text-sm">
                  Rp {todayEventOmzet.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Buku Terjual:</span>
                <span className="font-black text-indigo-600 text-sm">
                  {todayBooksSold} eks
                </span>
              </div>
            </div>
          </div>

          {todayEventOrders.length === 0 ? (
            <p className="text-xs text-center py-6 text-slate-400">
              Belum ada transaksi di sesi kasir event hari ini. Silakan mulai transaksi di bawah.
            </p>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {todayEventOrders.map(ord => (
                <div key={ord.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{ord.no_invoice}</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Lunas
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {ord.nama_pembeli} • {ord.items.reduce((acc, it) => acc + it.jumlah, 0)} buku • {ord.keterangan?.split('|')[1]?.trim() || 'Kasir'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 dark:text-white">
                      Rp {ord.total_tagihan.toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRecentCompletedOrder(ord);
                        setIsReceiptModalOpen(true);
                      }}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Cetak ulang struk"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Struk</span>
                    </button>
                    {ord.kontak_pembeli && (
                      <button
                        type="button"
                        onClick={() => generateWhatsAppMessage(ord)}
                        className="p-1.5 bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Kirim Struk WA"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* 2. MAIN 2-COLUMN LAYOUT: (LEFT: CATALOG & QUICK SCANNER, RIGHT: INTERACTIVE CART) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CATALOG & BARCODE SCANNER (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Quick Search & Barcode Scan Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul buku, penulis, atau ISBN..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Instant Camera Scan Button */}
              <button
                type="button"
                onClick={() => setIsBarcodeScannerOpen(true)}
                className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
                title="Buka Kamera Barcode Scanner"
              >
                <ScanBarcode className="w-4 h-4" />
                <span className="hidden sm:inline">Scan Kamera</span>
              </button>
            </div>

            {/* Quick Barcode Scanner USB reader input */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
                <ScanBarcode className="w-3.5 h-3.5 text-amber-500" />
                Input Barcode Cepat:
              </span>
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeKeydown}
                placeholder="Scan barcode scanner USB atau ketik ISBN lalu [Enter]..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-bold text-[11px] transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Book Touch Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredBooks.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <Package className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Tidak ada buku yang sesuai dengan pencarian "{searchQuery}"
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Coba kata kunci lain atau pilih kategori Semua.
                </p>
              </div>
            ) : (
              filteredBooks.map(book => {
                const inCart = cart.find(it => it.book.id === book.id);
                const isOutOfStock = book.stok_gudang <= 0;

                return (
                  <motion.div
                    key={book.id}
                    whileHover={{ scale: isOutOfStock ? 1 : 1.01 }}
                    whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
                    onClick={() => !isOutOfStock && handleAddToCart(book, 1)}
                    className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      inCart
                        ? 'border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs'
                        : isOutOfStock
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/40 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-700 shadow-xs'
                    }`}
                  >
                    {/* Badge In Cart */}
                    {inCart && (
                      <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[10px] shadow-sm flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        <span>{inCart.qty} di keranjang</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {book.kategori || 'Dharma'}
                        </span>
                        
                        {/* Stock indicator badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : book.stok_gudang <= 10
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isOutOfStock ? 'Habis' : `Sisa ${book.stok_gudang}`}
                        </span>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                        {book.judul}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {book.penulis || 'Penulis Lamrimnesia'}
                      </p>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Harga Bazar:</span>
                        <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                          Rp {book.harga_jual.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOutOfStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book, 1);
                        }}
                        className={`p-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Pilih</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE POS CART & BILLING (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400/80 dark:border-amber-600 shadow-lg space-y-4">
            
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 rounded-xl">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Keranjang Kasir ({cart.reduce((a, b) => a + b.qty, 0)} item)
                </h3>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 flex items-center justify-center mx-auto text-amber-500">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Keranjang masih kosong
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Ketuk buku di katalog samping atau scan barcode buku untuk langsung memasukkannya ke kasir.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.map(item => {
                  const price = item.customPrice ?? item.book.harga_jual;
                  const itemSubtotal = price * item.qty;

                  return (
                    <div
                      key={item.book.id}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-900 dark:text-white truncate">
                          {item.book.judul}
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          @ Rp {price.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center gap-1 shrink-0 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.book.id, item.qty - 1)}
                          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.book.stok_gudang}
                          value={item.qty}
                          onChange={(e) => handleUpdateQty(item.book.id, parseInt(e.target.value) || 1)}
                          className="w-8 text-center text-xs font-black bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.book.id, item.qty + 1)}
                          className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right shrink-0 min-w-[70px]">
                        <span className="font-black text-slate-900 dark:text-white block">
                          Rp {itemSubtotal.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.book.id)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Hapus item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* EVENT DISCOUNTS & PROMOS (QUICK SELECTOR) */}
            <div className="p-3 bg-amber-50/70 dark:bg-slate-800/70 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <BadgePercent className="w-3.5 h-3.5 text-amber-600" />
                  Diskon Event / Promo Bazar:
                </span>
                {discountNominal > 0 && (
                  <span className="text-[11px] font-black text-rose-600">
                    -Rp {discountNominal.toLocaleString('id-ID')}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-6 gap-1 text-[11px] font-bold">
                {[
                  { key: 'none', label: '0%' },
                  { key: '5', label: '5%' },
                  { key: '10', label: '10%' },
                  { key: '15', label: '15%' },
                  { key: '20', label: '20%' },
                  { key: 'custom', label: 'Rp' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setGlobalDiscountType(opt.key as any)}
                    className={`py-1 rounded-lg text-center transition-colors ${
                      globalDiscountType === opt.key
                        ? 'bg-amber-500 text-white shadow-xs font-black'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {globalDiscountType === 'custom' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Potongan Rp:</span>
                  <input
                    type="number"
                    step="1000"
                    value={customDiscountNominal || ''}
                    onChange={(e) => setCustomDiscountNominal(Number(e.target.value))}
                    placeholder="Contoh: 15000"
                    className="flex-1 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              )}
            </div>

            {/* VOLUNTARY DONATION / DANA DHARMA */}
            <div className="p-3 bg-emerald-50/60 dark:bg-slate-800/60 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  Dana / Donasi Sukarela (Opsional):
                </span>
                {donasiNominal > 0 && (
                  <span className="text-[11px] font-black text-emerald-600">
                    +Rp {donasiNominal.toLocaleString('id-ID')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1 text-[10px] font-bold">
                {[0, 10000, 20000, 50000, 100000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonasiNominal(amt)}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      donasiNominal === amt
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950'
                    }`}
                  >
                    {amt === 0 ? 'Tidak Ada' : `+${amt / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOMER INFO (OPTIONAL FOR WHATSAPP RECEIPT) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Pembeli:
                </label>
                <input
                  type="text"
                  value={namaPembeli}
                  onChange={(e) => setNamaPembeli(e.target.value)}
                  placeholder="Pengunjung Bazar"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  No. WhatsApp (Struk):
                </label>
                <input
                  type="text"
                  value={kontakWa}
                  onChange={(e) => setKontakWa(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* GRAND TOTAL DISPLAY */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-inner space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal Buku:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              {discountNominal > 0 && (
                <div className="flex justify-between text-xs text-amber-400">
                  <span>Diskon Bazar:</span>
                  <span>-Rp {discountNominal.toLocaleString('id-ID')}</span>
                </div>
              )}
              {donasiNominal > 0 && (
                <div className="flex justify-between text-xs text-emerald-400">
                  <span>Donasi Dharma:</span>
                  <span>+Rp {donasiNominal.toLocaleString('id-ID')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Total Tagihan:
                </span>
                <span className="text-2xl font-black text-amber-400">
                  Rp {totalTagihan.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* PAYMENT METHODS SELECTOR */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Metode Pembayaran:
              </span>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>Tunai / Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-2.5 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'qris'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>QRIS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-2.5 rounded-2xl border text-xs font-black flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'transfer'
                      ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Transfer / EDC</span>
                </button>
              </div>

              {/* PAYMENT DETAILS: CASH */}
              {paymentMethod === 'cash' && (
                <div className="p-3 bg-amber-50/80 dark:bg-slate-800/80 rounded-2xl border border-amber-200 dark:border-amber-900/50 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Uang Diterima (Tunai):
                    </label>
                    <button
                      type="button"
                      onClick={() => setCashTendered(totalTagihan)}
                      className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline"
                    >
                      Uang Pas
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      step="1000"
                      value={cashTendered || ''}
                      onChange={(e) => setCashTendered(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-lg font-black focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Cash Quick Buttons */}
                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-bold">
                    {[50000, 100000, 150000, 200000, 500000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCashTendered(val)}
                        className={`px-2 py-1 rounded-lg border transition-colors ${
                          cashTendered === val
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-100'
                        }`}
                      >
                        {val / 1000}k
                      </button>
                    ))}
                  </div>

                  {/* Change Calculator */}
                  <div className={`p-3 rounded-xl flex items-center justify-between font-black ${
                    isCashInsufficient
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200'
                      : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200'
                  }`}>
                    <span className="text-xs">
                      {isCashInsufficient ? 'Uang Masih Kurang:' : 'Kembalian:'}
                    </span>
                    <span className="text-lg">
                      Rp {(isCashInsufficient ? totalTagihan - cashTendered : kembalian).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              {/* PAYMENT DETAILS: QRIS */}
              {paymentMethod === 'qris' && (
                <div className="p-4 bg-indigo-50/80 dark:bg-slate-800/80 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 text-center space-y-3">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                      QRIS Standar Pembayaran Nasional
                    </span>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Yayasan Pelestarian & Pengembangan Lamrim Nusantara
                    </h5>
                  </div>

                  {/* Simulated QR Code Card */}
                  <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl shadow-md border-2 border-indigo-500 flex flex-col items-center justify-between">
                    <div className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                      QRIS • GPN
                    </div>
                    <QrCode className="w-28 h-28 text-slate-900" />
                    <div className="text-[10px] font-black text-indigo-700">
                      Rp {totalTagihan.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Arahkan kamera aplikasi BCA, Livin, GoPay, OVO, atau ShopeePay pembeli ke QRIS di atas.
                  </p>
                </div>
              )}

              {/* PAYMENT DETAILS: TRANSFER */}
              {paymentMethod === 'transfer' && (
                <div className="p-3.5 bg-teal-50/80 dark:bg-slate-800/80 rounded-2xl border border-teal-200 dark:border-teal-900/50 space-y-2 text-xs">
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-teal-200 dark:border-teal-900">
                    <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block">
                      Rekening Bank Yayasan:
                    </span>
                    <div className="font-mono font-black text-sm text-slate-900 dark:text-white">
                      BCA 789-0123-456
                    </div>
                    <span className="text-[10px] text-slate-500">
                      a.n. Yayasan Pelestarian Lamrim Nusantara
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      No. Referensi / Bukti Transfer (Opsional):
                    </label>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="Contoh: TRF-98762"
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CHECKOUT ACTION BUTTON */}
            <button
              type="button"
              disabled={cart.length === 0 || isCashInsufficient}
              onClick={handleCheckout}
              className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                cart.length === 0 || isCashInsufficient
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25 active:scale-[0.99]'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isCashInsufficient
                  ? 'Uang Tunai Kurang'
                  : `BAYAR & CETAK STRUK (Rp ${totalTagihan.toLocaleString('id-ID')})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. THERMAL RECEIPT & PRINT MODAL */}
      <AnimatePresence>
        {isReceiptModalOpen && recentCompletedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Actions */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-amber-500" />
                  Struk Transaksi Kasir
                </span>
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thermal Receipt Paper Layout (Printable) */}
              <div className="p-5 overflow-y-auto flex-1 bg-amber-50/30 dark:bg-slate-950 font-mono text-[11px] text-slate-800 dark:text-slate-200 select-text print:bg-white print:text-black">
                <div id="thermal-pos-receipt" className="space-y-3 text-center">
                  <div className="space-y-0.5">
                    <h4 className="font-black text-sm tracking-wider uppercase">
                      LAMRIMNESIA
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      SAPA-ALL MIS Penerbitan & Toko Dharma
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Jl. Pegangsaan Dua, Jakarta • lamrimnesia.org
                    </p>
                  </div>

                  <div className="border-t border-b border-dashed border-slate-400 py-1.5 text-left text-[10px] space-y-0.5">
                    <div className="flex justify-between">
                      <span>No: {recentCompletedOrder.no_invoice}</span>
                      <span>{recentCompletedOrder.tanggal_pesan}</span>
                    </div>
                    <div>Event: {recentCompletedOrder.via.replace('Event - ', '')}</div>
                    <div>Kasir: {currentUser?.name || 'Kasir'}</div>
                    <div>Pembeli: {recentCompletedOrder.nama_pembeli}</div>
                  </div>

                  {/* Items List */}
                  <div className="text-left space-y-1 py-1">
                    {recentCompletedOrder.items.map((it, idx) => {
                      const book = books.find(b => b.id === it.buku_id);
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {book?.judul || `Buku ID #${it.buku_id}`}
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-400">
                            <span>{it.jumlah} x Rp {it.harga_satuan.toLocaleString('id-ID')}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Rp {it.subtotal.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bill Breakdown */}
                  <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-right text-[10px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rp {recentCompletedOrder.items.reduce((s, it) => s + it.subtotal, 0).toLocaleString('id-ID')}</span>
                    </div>
                    {recentCompletedOrder.donasi && (
                      <div className="flex justify-between">
                        <span>Donasi:</span>
                        <span>+Rp {recentCompletedOrder.donasi.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-black pt-1 border-t border-slate-300">
                      <span>TOTAL:</span>
                      <span>Rp {recentCompletedOrder.total_tagihan.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Status:</span>
                      <span className="font-bold text-emerald-600">LUNAS</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-slate-400 pt-2 text-center text-[10px] text-slate-500 italic">
                    "Semoga kebajikan ini membawa kebahagiaan bagi semua makhluk. Sadhu, sadhu, sadhu."
                  </div>
                </div>
              </div>

              {/* Modal Bottom Print & Share Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>Cetak Struk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => generateWhatsAppMessage(recentCompletedOrder)}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim WA</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="w-full py-2 bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Transaksi Baru
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. BARCODE SCANNER MODAL (FOR CAMERA SCAN) */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          // extract isbn if present
          const match = msg.match(/[0-9]{9,13}/);
          if (match && match[0]) {
            handleBarcodeModalSuccess(match[0]);
          }
        }}
      />

      {/* 5. TOAST FEEDBACK */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
