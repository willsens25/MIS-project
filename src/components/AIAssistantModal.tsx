import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bot, Sparkles, Send, X, Loader2, Lightbulb, CheckCircle } from 'lucide-react';

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
      content: `Halo! Saya Asisten AI MIS Lamrimnesia. Saya dapat membantu menganalisis stok gudang, ringkasan kas keuangan, status invoice, serta data keanggotaan. Ada yang bisa saya bantu?`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

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
        setMessages(prev => [...prev, { role: 'assistant', content: `Maaf, terjadi kesalahan: ${data.message}` }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Gagal menghubungi server AI: ${err.message || 'Koneksi terputus.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl h-[560px] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                Asisten AI MIS Lamrimnesia
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Konsultasi data analitik, stok, kas & laporan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-none shadow-sm whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Menyiapkan analisis data MIS...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors shrink-0 cursor-pointer"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pertanyaan terkait data MIS (misal: analisis keuangan atau buku)..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!prompt.trim() || isLoading}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim</span>
          </button>
        </div>

      </div>
    </div>
  );
};
