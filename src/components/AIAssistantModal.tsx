import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { MascotAvatar } from './MascotAvatar';
import { Send, X, Loader2, Lightbulb, Sparkles } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { books, orders, mutasis, identitasList, pengajuans, currentUser } = useApp();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Halo ${currentUser.name}! Saya Asisten AI MIS Lamrimnesia. Saya siap membantu kamu memeriksa stok buku gudang, kas keuangan yayasan, status pemesanan, maupun analisis data divisi lainnya. Apa yang ingin kamu ketahui hari ini?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'Buku apa saja yang stoknya menipis di bawah 20 pcs?',
    'Berapa total kas masuk dan kas keluar bulan ini?',
    'Rangkum status invoice dan pemesanan terbaru.',
    'Berapa banyak anggota yang terdaftar per kategori?'
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    // Build system data summary for grounding
    const lowStockBooks = books.filter(b => b.stok_gudang < 20).map(b => `${b.judul} (sisa ${b.stok_gudang} pcs)`).join(', ');
    const totalMasuk = mutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
    const totalKeluar = mutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
    const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
    const pendingCetakCount = pengajuans.filter(p => p.status === 'pending').length;

    const systemContext = `
Data Terkini Sistem MIS Lamrimnesia:
- Total Judul Buku: ${books.length}
- Buku Stok Rendah (<20 pcs): ${lowStockBooks || 'Semua stok aman'}
- Total Kas Masuk: Rp ${totalMasuk.toLocaleString('id-ID')}
- Total Kas Keluar: Rp ${totalKeluar.toLocaleString('id-ID')}
- Saldo Kas Bersih: Rp ${(totalMasuk - totalKeluar).toLocaleString('id-ID')}
- Total Pesanan/Invoice: ${orders.length} (Pending: ${pendingOrdersCount}, Lunas: ${orders.length - pendingOrdersCount})
- Pengajuan Cetak Pending: ${pendingCetakCount}
- Total Anggota Terdaftar: ${identitasList.length}
- Pengguna Aktif: ${currentUser.name} (${currentUser.role})
    `;

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          systemContext
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.output }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Maaf, terjadi kendala saat memproses: ${data.message}` }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Gagal menghubungi server AI: ${err.message || 'Koneksi terputus.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl h-[600px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header with Official Mascot Badge */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 text-white border-b border-slate-800">
              <div className="flex items-center space-x-3">
                {/* Mascot Logo from Image 2: Green Ring & Pink Background */}
                <div className="relative">
                  <MascotAvatar size="md" variant="badge" className="ring-2 ring-white/30 shadow-md" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-100">
                      AI MIS Lamrimnesia
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                      Gemini Flash
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Asisten Cerdas Analitik & Operasional MIS</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
                aria-label="Tutup jendela chat"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Chat History Canvas */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#E8EAED] dark:bg-slate-950/90 transition-colors">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Assistant Mascot (from Image 1: Yellow Circle Avatar) */}
                  {msg.role === 'assistant' && (
                    <motion.div
                      whileHover={{ rotate: [0, -8, 8, 0] }}
                      transition={{ duration: 0.4 }}
                      className="shrink-0 mt-0.5"
                    >
                      <MascotAvatar size="md" variant="yellow" className="shadow-md ring-1 ring-amber-300/40" />
                    </motion.div>
                  )}

                  {/* Message Bubbles */}
                  {msg.role === 'assistant' ? (
                    /* Assistant Speech Bubble from Image 1: Turquoise / Teal with Pointer Tail */
                    <div className="relative group max-w-[85%] sm:max-w-[78%]">
                      {/* Left speech pointer triangle pointing to mascot */}
                      <div
                        className="absolute -left-2 top-3.5 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#0a9396] drop-shadow-xs pointer-events-none"
                        aria-hidden="true"
                      />
                      
                      <div className="bg-[#0a9396] text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl rounded-tl-sm text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-wrap select-text selection:bg-teal-900 selection:text-white">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    /* User Message Bubble */
                    <div className="flex items-start justify-end gap-2.5 max-w-[85%] sm:max-w-[78%]">
                      <div className="relative">
                        {/* Right speech pointer triangle */}
                        <div
                          className="absolute -right-2 top-3 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-slate-800 dark:border-l-indigo-600 drop-shadow-xs pointer-events-none"
                          aria-hidden="true"
                        />
                        <div className="bg-slate-800 dark:bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-xs sm:text-sm leading-relaxed shadow-sm whitespace-pre-wrap select-text">
                          {msg.content}
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm ring-1 ring-white/20">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Loading Indicator with Mascot Typing State */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 justify-start"
                >
                  <div className="shrink-0 mt-0.5">
                    <MascotAvatar size="md" variant="yellow" className="shadow-md" />
                  </div>
                  <div className="relative max-w-[85%]">
                    <div
                      className="absolute -left-2 top-3.5 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#0a9396]"
                      aria-hidden="true"
                    />
                    <div className="bg-[#0a9396] text-white px-4 py-3 rounded-2xl rounded-tl-sm text-xs flex items-center space-x-2 shadow-sm">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-200" />
                      <span className="font-medium">Sedang memikirkan jawaban dan menganalisis data...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {quickPrompts.map((qp, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleSend(qp)}
                  className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-[#0a9396] dark:hover:text-teal-300 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors shrink-0 cursor-pointer text-xs"
                >
                  {qp}
                </motion.button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanyakan analisis buku, kas, invoice, atau data anggota MIS..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a9396]"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleSend()}
                disabled={!prompt.trim() || isLoading}
                className="px-4 py-2.5 bg-[#0a9396] hover:bg-[#087f81] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kirim</span>
              </motion.button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
