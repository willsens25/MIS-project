import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { MascotAvatar } from './MascotAvatar';
import { Send, X, Loader2, Lightbulb, Sparkles, Mic, MicOff, Volume2, VolumeX, Radio } from 'lucide-react';
import { useWebSpeech } from '../hooks/useWebSpeech';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

// Clean helper to render message without raw markdown artifacts like ###, ##, ---
const renderCleanAiContent = (content: string) => {
  if (!content) return null;

  const lines = content.split('\n');

  return lines.map((line, lIdx) => {
    const trimmed = line.trim();

    // Clean horizontal rules
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      return <div key={lIdx} className="my-2.5 border-t border-white/20" />;
    }

    // Strip markdown headings like ###, ##, #
    const isHeading = /^#{1,6}\s*/.test(line);
    const cleanLine = line.replace(/^#{1,6}\s*/, '');

    // Parse inline bolding **text**
    const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
    const renderedParts = parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={pIdx} className="font-bold text-white tracking-wide">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (isHeading) {
      return (
        <div key={lIdx} className="font-bold text-sm sm:text-base mt-2 mb-0.5 text-teal-100">
          {renderedParts}
        </div>
      );
    }

    return (
      <div key={lIdx} className={cleanLine.trim() === '' ? 'h-2' : 'min-h-[1.25rem]'}>
        {renderedParts}
      </div>
    );
  });
};

const getDivisionGreeting = (userName: string, userRole: string, divisiId: number, divisiName: string) => {
  switch (divisiId) {
    case 2: // Finance
      return `Halo Rekan Finance & Bendahara (${userName})! Saya Asisten AI MIS Lamrimnesia. Saya siap membantu pengecekan kas & bank yayasan, verifikasi invoice, jurnal mutasi, dan analisis keuangan. Ada yang ingin dihitung atau disiapkan hari ini?`;
    case 3: // Penerbitan
      return `Halo Tim Penerbitan & Editorial (${userName})! Saya Asisten AI MIS Lamrimnesia. Saya siap membantu cek katalog buku, status ISBN, perhitungan HPP, draf pengajuan cetak, maupun kurasi naskah. Apa yang sedang dikerjakan hari ini?`;
    case 4: // Marketing
      return `Halo Tim Marketing & Distribusi (${userName})! Saya Asisten AI MIS Lamrimnesia. Saya siap membantu strategi promosi, analisis pesanan, draf pesan penagihan/follow-up WhatsApp, bundling promo buku, hingga cek kupon promo. Ada yang bisa saya bantu?`;
    case 5: // Produksi
      return `Halo Tim Produksi (${userName})! Saya Asisten AI MIS Lamrimnesia. Saya siap membantu pemantauan antrean cetak fisik, log pabrikasi, estimasi kebutuhan eksemplar, dan pencatatan produksi. Apa yang perlu diperiksa hari ini?`;
    case 6: // Logistik
      return `Halo Tim Logistik & Gudang (${userName})! Saya Asisten AI MIS Lamrimnesia. Saya siap membantu cek stok riil buku, antrean packing pesanan, pembuatan draf surat jalan, hingga koordinasi ekspedisi pengiriman. Ada yang ingin dikoordinasikan?`;
    case 1: // Direktorat
    default:
      return `Halo ${userRole === 'Direktur' ? 'Bapak/Ibu Direktur & Manajemen' : userName}! Saya Asisten AI MIS Lamrimnesia (SAPA-ALL). Saya siap membantu monitoring performa seluruh divisi, keanggotaan, audit aktivitas, hingga draf regulasi & pengumuman. Ada yang bisa saya bantu hari ini?`;
  }
};

const getDivisionQuickPrompts = (divisiId: number) => {
  switch (divisiId) {
    case 2: // Finance
      return [
        'Berapa total kas masuk dan kas keluar bulan ini?',
        'Analisis kesehatan kas keuangan yayasan saat ini',
        'Buatkan draf WhatsApp penagihan invoice yang ramah',
        'Cek rincian saldo rekening kas & bank yayasan'
      ];
    case 3: // Penerbitan
      return [
        'Buku apa saja yang stoknya di bawah 20 pcs?',
        'Rangkum status pengajuan cetak yang pending',
        'Berapa jumlah buku yang terdaftar di katalog?',
        'Buatkan ide sinopsis menarik untuk buku Dharma'
      ];
    case 4: // Marketing
      return [
        'Rangkum status invoice dan pemesanan terbaru',
        'Beri ide bundling promo untuk buku yang stoknya banyak',
        'Buatkan draf teks promosi WhatsApp untuk pelanggan',
        'Cek pesanan yang masih pending pembayarannya'
      ];
    case 5: // Produksi
      return [
        'Rangkum pengajuan cetak buku yang butuh diproses',
        'Berapa estimasi kebutuhan cetak ulang buku menipis?',
        'Cek daftar buku dengan stok paling kritis',
        'Buatkan draf catatan log produksi percetakan'
      ];
    case 6: // Logistik
      return [
        'Buku apa saja yang stok gudangnya menipis (<20 pcs)?',
        'Rangkum pesanan yang siap dikemas dan dikirim',
        'Buatkan draf surat jalan pengiriman buku ke ekspedisi',
        'Cek stok fisik riil seluruh buku di gudang'
      ];
    case 1: // Direktorat
    default:
      return [
        'Rangkum performa operasional seluruh divisi',
        'Berapa total kas masuk dan keluar yayasan saat ini?',
        'Berapa banyak anggota yang terdaftar per kategori?',
        'Buatkan draf pengumuman internal untuk seluruh staf'
      ];
  }
};

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, initialPrompt }) => {
  const {
    books,
    orders,
    mutasis,
    identitasList,
    pengajuans,
    accounts,
    currentUser,
    divisiList,
    currentSubTab,
    setAiAppState,
    triggerTaskSuccess
  } = useApp();
  const [prompt, setPrompt] = useState(initialPrompt || '');

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const currentDivisi = divisiList.find(d => d.id === currentUser.divisi_id);
  const currentDivisiName = currentDivisi?.nama_divisi || 'Direktorat';

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: getDivisionGreeting(currentUser.name, currentUser.role || 'Staff', currentUser.divisi_id, currentDivisiName)
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [autoSendVoice, setAutoSendVoice] = useState(true);

  // Reference to handleSend so speech callback can invoke the latest version
  const handleSendRef = useRef<((customPrompt?: string) => Promise<void>) | undefined>(undefined);

  const {
    isRecognitionSupported,
    isTtsSupported,
    isListening,
    interimTranscript,
    speechError,
    setSpeechError,
    selectedLang,
    setSelectedLang,
    startListening,
    stopListening,
    toggleListening,
    isSpeaking,
    speakingIndex,
    speak,
    stopSpeaking
  } = useWebSpeech({
    defaultLang: 'id-ID',
    onFinalResult: (transcript) => {
      if (!transcript || !transcript.trim()) return;
      setPrompt(transcript);
      if (autoSendVoice) {
        handleSendRef.current?.(transcript);
      }
    }
  });

  // Automatically adapt welcome greeting whenever the active division changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: getDivisionGreeting(currentUser.name, currentUser.role || 'Staff', currentUser.divisi_id, currentDivisiName)
      }
    ]);
  }, [currentUser.divisi_id, currentUser.name, currentUser.role, currentDivisiName]);

  // Stop listening and voice playback if modal is closed
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen, stopListening, stopSpeaking]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = getDivisionQuickPrompts(currentUser.divisi_id);

  const handleSend = async (customPrompt?: string) => {
    // If currently speaking, stop synthesis on new send
    stopSpeaking();
    // If currently listening, stop recognition
    if (isListening) stopListening();

    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: textToSend };
    // Pre-insert user message and empty assistant message for instant streaming display
    setMessages(prev => [...prev, userMessage, { role: 'assistant' as const, content: '' }]);
    setPrompt('');
    setIsLoading(true);
    setAiAppState('thinking');

    // Build rich, grounded system data summary so AI can answer specific questions with real facts
    const booksCatalogSummary = books.slice(0, 15).map(b => 
      `- "${b.judul}" oleh ${b.penulis} | Kategori: ${b.kategori || 'Umum'} | Harga: Rp ${b.harga_jual.toLocaleString('id-ID')} | Stok: ${b.stok_gudang} pcs | ISBN: ${b.isbn}`
    ).join('\n');

    const accountsSummary = accounts?.map(a => 
      `- ${a.nama_akun} (${a.kode_akun}): Saldo Awal Rp ${(a.saldo_awal || 0).toLocaleString('id-ID')}`
    ).join('\n') || '';

    const totalMasuk = mutasis.filter(m => m.tipe === 'Masuk').reduce((s, m) => s + m.nominal, 0);
    const totalKeluar = mutasis.filter(m => m.tipe === 'Keluar').reduce((s, m) => s + m.nominal, 0);
    const recentMutasis = mutasis.slice(-5).reverse().map(m => 
      `- [${m.tanggal || 'Terbaru'}] ${m.tipe}: Rp ${m.nominal.toLocaleString('id-ID')} (${m.category?.nama_kategori || 'Kas'}) - ${m.keterangan}`
    ).join('\n');

    const pendingOrders = orders.filter(o => o.status === 'Pending');
    const recentOrdersSummary = orders.slice(-5).reverse().map(o => 
      `- Invoice ${o.no_invoice}: Pelanggan "${o.nama_pembeli}", Total: Rp ${o.total_tagihan.toLocaleString('id-ID')}, Status: ${o.status}`
    ).join('\n');

    const pendingCetakSummary = pengajuans.filter(p => p.status === 'pending').map(p => 
      `- Judul: "${p.buku?.judul || 'Buku #' + p.buku_id}", Jumlah: ${p.jumlah_pengajuan} eks (status: ${p.status})`
    ).join('\n');

    const identitasKategoriCount: Record<string, number> = {};
    identitasList.forEach(i => {
      const kat = i.jenis_umat || i.kategori_identitas || 'Umum';
      identitasKategoriCount[kat] = (identitasKategoriCount[kat] || 0) + 1;
    });
    const kategoriSummary = Object.entries(identitasKategoriCount).map(([k, v]) => `${k}: ${v}`).join(', ');

    const systemContext = `
[DIVISI & PENGGUNA AKTIF SAAT INI]:
- Divisi yang Sedang Dibuka Pengguna: Divisi ${currentUser.divisi_id} (${currentDivisiName})
- Modul/Sub-Tab Aktif: ${currentSubTab}
- Pengguna yang Sedang Aktif: ${currentUser.name} (Jabatan: ${currentUser.role})
- PETUNJUK SAPAAN MUTLAK:
  * Pengguna saat ini sedang berada di ${currentDivisiName}.
  * JANGAN PERNAH menyapa "Halo Direktur", "Bapak Direktur", atau semacamnya karena pengguna TIDAK sedang di posisi Direktur (kecuali jika divisi aktif adalah Direktorat & HRD).
  * Sapalah secara profesional dan akrab menyesuaikan divisi ${currentDivisiName} (contoh: "Halo rekan Finance", "Halo Kak ${currentUser.name.split(' ')[0]}", atau sapaan yang sesuai dengan divisi ${currentDivisiName}).

[DATABASE SISTEM MIS SAPA-ALL LAMRIMNESIA]:
1. Katalog Buku Terkini (${books.length} judul):
${booksCatalogSummary}

2. Keuangan & Kas Yayasan:
- Rekening Kas & Bank:
${accountsSummary}
- Total Pemasukan: Rp ${totalMasuk.toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${totalKeluar.toLocaleString('id-ID')}
- Saldo Kas Bersih: Rp ${(totalMasuk - totalKeluar).toLocaleString('id-ID')}
- Transaksi Mutasi Terbaru:
${recentMutasis || 'Belum ada mutasi'}

3. Pesanan & Invoice (${orders.length} pesanan, Pending: ${pendingOrders.length}):
${recentOrdersSummary || 'Belum ada pesanan'}

4. Pengajuan Cetak Pending:
${pendingCetakSummary || 'Tidak ada pengajuan cetak pending'}

5. Informasi Anggota & Pengguna:
- Total Anggota Terdaftar: ${identitasList.length} orang (${kategoriSummary || 'Umum'})
    `.trim();

    // Pass previous dialogue turns for multi-turn conversational context
    const conversationHistory = messages
      .filter(m => m.content && m.content.trim().length > 0)
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      // 1. Try real-time streaming endpoint first for fastest Time-to-First-Token
      const response = await fetch('/api/gemini/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          systemContext,
          history: conversationHistory
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let streamAccumulator = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataPayload = trimmed.slice(5).trim();
          if (dataPayload === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataPayload);
            if (parsed.chunk) {
              streamAccumulator += parsed.chunk;
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = { ...updated[lastIdx], content: streamAccumulator };
                }
                return updated;
              });
            }
          } catch {
            // Ignore partial JSON parse errors
          }
        }
      }

      // If streaming completed without any text, provide fallback
      if (!streamAccumulator.trim()) {
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant' && !updated[lastIdx].content) {
            updated[lastIdx] = { ...updated[lastIdx], content: 'Tidak ada respon yang diterima dari server AI. Silakan coba kembali.' };
          }
          return updated;
        });
        triggerTaskSuccess('Respon AI selesai');
      } else {
        triggerTaskSuccess('Respon AI siap ditinjau!');
      }
    } catch (streamError) {
      console.warn('Streaming error, falling back to standard API:', streamError);
      // Fallback to standard endpoint
      try {
        const fallbackRes = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            systemContext,
            history: conversationHistory
          })
        });
        const data = await fallbackRes.json();
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: data.output || data.message || 'Respon selesai.' };
          }
          return updated;
        });
        triggerTaskSuccess('Respon AI siap!');
      } catch (err: any) {
        setAiAppState('idle');
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: `Gagal menghubungi server AI: ${err.message || 'Koneksi terputus.'}` };
          }
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      setAiAppState(prev => prev === 'thinking' ? 'idle' : prev);
    }
  };

  handleSendRef.current = handleSend;

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
            {/* Header with Official Mascot Badge & Voice Indicators */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 text-white border-b border-slate-800">
              <div className="flex items-center space-x-3">
                {/* Mascot Logo from Image 2: Green Ring & Pink Background */}
                <div className="relative">
                  <MascotAvatar size="md" variant="badge" className="ring-2 ring-white/30 shadow-md" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-100">
                      AI MIS Lamrimnesia
                    </h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                      Gemini Flash
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80 hidden xs:inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {currentDivisiName}
                    </span>
                    {isRecognitionSupported && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 hidden sm:inline-flex items-center gap-1">
                        <Mic className="w-2.5 h-2.5 text-teal-400" />
                        Voice Ready
                      </span>
                    )}
                    {isSpeaking && (
                      <button
                        type="button"
                        onClick={stopSpeaking}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse cursor-pointer hover:bg-amber-500/30"
                        title="Klik untuk hentikan pembacaan suara"
                      >
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>Membacakan...</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Asisten Cerdas Analitik & Perintah Suara MIS</p>
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
              {messages.map((msg, idx) => {
                // If this is an empty assistant placeholder waiting for first chunk, don't show blank bubble yet
                if (msg.role === 'assistant' && !msg.content && isLoading) {
                  return null;
                }

                return (
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
                        whileHover={{ scale: 1.08, rotate: 6 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                        className="shrink-0 mt-0.5"
                      >
                        <MascotAvatar size="md" variant="yellow" interactive={false} className="shadow-md ring-1 ring-amber-300/40" />
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
                        
                        <div className="bg-[#0a9396] text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl rounded-tl-sm text-xs sm:text-sm leading-relaxed shadow-sm select-text selection:bg-teal-900 selection:text-white">
                          {renderCleanAiContent(msg.content)}
                          {isLoading && idx === messages.length - 1 && (
                            <span className="inline-block w-1.5 h-3.5 ml-1 bg-teal-200 animate-pulse align-middle" />
                          )}

                          {/* Action Footer for Web Speech TTS */}
                          {msg.content && !(isLoading && idx === messages.length - 1) && isTtsSupported && (
                            <div className="mt-2.5 pt-1.5 border-t border-teal-600/50 flex items-center justify-between text-[11px] text-teal-100/90">
                              <span className="text-[10px] text-teal-200/70">MIS AI</span>
                              <button
                                type="button"
                                onClick={() => isSpeaking && speakingIndex === idx ? stopSpeaking() : speak(msg.content, idx)}
                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors cursor-pointer text-xs font-medium ${
                                  isSpeaking && speakingIndex === idx
                                    ? 'bg-amber-400 text-slate-900 font-semibold shadow-xs'
                                    : 'hover:bg-teal-700/70 text-teal-100 hover:text-white'
                                }`}
                                title={isSpeaking && speakingIndex === idx ? 'Hentikan pembacaan suara' : 'Bacakan jawaban ini dengan Web Speech API'}
                              >
                                {isSpeaking && speakingIndex === idx ? (
                                  <>
                                    <VolumeX className="w-3.5 h-3.5" />
                                    <span>Hentikan Suara</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Bacakan</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
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
                );
              })}

              {/* Loading Indicator with Mascot Typing State (shown before first token arrives) */}
              {isLoading && (!messages.length || (messages[messages.length - 1].role === 'assistant' && !messages[messages.length - 1].content)) && (
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

            {/* Live Voice Recognition Active Banner */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white border-t border-teal-600/40 flex items-center justify-between gap-3 overflow-hidden text-xs shadow-inner"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-semibold text-teal-300 text-[11px]">
                        <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                        <span>Mendengarkan Perintah Suara...</span>
                      </div>
                      <p className="italic text-slate-200 text-xs truncate">
                        "{interimTranscript || 'Bicaralah sekarang (misal: "Berapa stok buku menipis?")...'}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedLang(selectedLang === 'id-ID' ? 'en-US' : 'id-ID')}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors cursor-pointer"
                      title="Ganti bahasa pengenalan suara"
                    >
                      {selectedLang === 'id-ID' ? '🇮🇩 ID' : '🇺🇸 EN'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoSendVoice(!autoSendVoice)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        autoSendVoice
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title={autoSendVoice ? 'Otomatis kirim saat selesai bicara' : 'Kirim manual'}
                    >
                      {autoSendVoice ? 'Auto-Kirim: On' : 'Auto-Kirim: Off'}
                    </button>
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      Selesai
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Speech Error Banner */}
            {speechError && (
              <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-500 font-bold">⚠️</span>
                  {speechError}
                </span>
                <button
                  type="button"
                  onClick={() => setSpeechError(null)}
                  className="p-1 hover:bg-amber-500/20 rounded text-amber-700 dark:text-amber-300 transition-colors cursor-pointer"
                  aria-label="Tutup pesan error suara"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? 'Mendengarkan suara Anda...' : 'Tanyakan analisis buku, kas, invoice, atau bicara perintah suara...'}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a9396]"
              />

              {/* Web Speech API Microphone Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                  isListening
                    ? 'bg-red-500 text-white ring-4 ring-red-400/40 animate-pulse'
                    : 'bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-[#0a9396] dark:hover:text-teal-300 border border-slate-300 dark:border-slate-700'
                }`}
                title={
                  !isRecognitionSupported
                    ? 'Web Speech API belum didukung pada browser ini'
                    : isListening
                    ? 'Sedang mendengarkan suara... Klik untuk berhenti'
                    : 'Bicara perintah suara (Web Speech API)'
                }
                aria-label={isListening ? 'Berhenti mendengarkan suara' : 'Mulai perintah suara'}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </motion.button>

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
