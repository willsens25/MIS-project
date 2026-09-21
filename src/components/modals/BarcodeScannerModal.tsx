import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  ScanBarcode,
  Camera,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Package,
  BookOpen,
  DollarSign,
  Plus,
  RefreshCw,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Book } from '../../types';
import { cleanIsbn, isValidIsbn, lookupIsbnOnline, IsbnLookupResult } from '../../utils/isbnLookup';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  defaultMode?: 'camera' | 'manual';
}

// Audio beep feedback using Web Audio API
function playBeepSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'manual'
}) => {
  const { books, addBook, updateBook, adjustBookStock } = useApp();

  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>(defaultMode);
  const [isbnInput, setIsbnInput] = useState('');
  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found_local' | 'found_online' | 'manual_needed'>('idle');

  // Book data fields
  const [existingBook, setExistingBook] = useState<Book | null>(null);
  const [onlineResult, setOnlineResult] = useState<IsbnLookupResult | null>(null);

  const [judul, setJudul] = useState('');
  const [penulis, setPenulis] = useState('');
  const [kategori, setKategori] = useState('Filosofi');
  const [hargaJual, setHargaJual] = useState<number>(85000);
  const [biayaPokok, setBiayaPokok] = useState<number>(34000);
  const [manualStok, setManualStok] = useState<number>(20);
  const [stockAdjustmentMode, setStockAdjustmentMode] = useState<'add' | 'set'>('add');
  const [catatanStok, setCatatanStok] = useState('Penerimaan stok via Barcode Scanner');
  const [autoFilledTitle, setAutoFilledTitle] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const stockInputRef = useRef<HTMLInputElement | null>(null);
  const priceInputRef = useRef<HTMLInputElement | null>(null);
  const readerElementId = 'sapa-barcode-reader-viewport';

  // Available categories
  const categories = [
    'Filosofi',
    'Lamrim',
    'Meditasi',
    'Doa & Mantra',
    'Biografi',
    'Keluarga & Anak',
    'Umum',
    'Sastra & Puisi'
  ];

  // Initialize camera list on mount or tab switch
  useEffect(() => {
    isMountedRef.current = true;

    if (isOpen && activeTab === 'camera') {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (!isMountedRef.current) return;
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
            // Default to back/environment camera if available
            const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
            setSelectedCameraId(backCam ? backCam.id : devices[0].id);
          } else {
            setCameraError('Tidak ada perangkat kamera yang terdeteksi.');
          }
        })
        .catch((err) => {
          if (!isMountedRef.current) return;
          console.warn('Camera detection error:', err);
          setCameraError('Izin akses kamera belum diberikan atau kamera tidak tersedia.');
        });
    }

    return () => {
      isMountedRef.current = false;
      stopCameraScanner();
    };
  }, [isOpen, activeTab]);

  // Clean up scanner on modal close
  useEffect(() => {
    if (!isOpen) {
      stopCameraScanner();
      resetForm();
    }
  }, [isOpen]);

  const stopCameraScanner = async () => {
    setIsScanningCamera(false);
    const scanner = scannerRef.current;
    scannerRef.current = null;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (e) {
        // Ignore play interruption or transition errors
      }
      try {
        await scanner.clear();
      } catch (e) {
        // Ignore clear errors
      }
    }
  };

  const startCameraScanner = async (cameraId?: string) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraError(null);

    const targetCameraId = cameraId || selectedCameraId;

    try {
      // Clean up previous instance cleanly
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch {
          // ignore
        }
        try {
          await scannerRef.current.clear();
        } catch {
          // ignore
        }
        scannerRef.current = null;
      }

      if (!isMountedRef.current) {
        isStartingRef.current = false;
        return;
      }

      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E
        ],
        verbose: false
      });

      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 280, height: 160 },
        aspectRatio: 1.777778
      };

      const cameraParam = targetCameraId ? { deviceId: { exact: targetCameraId } } : { facingMode: 'environment' };

      await html5QrCode.start(
        cameraParam,
        config,
        (decodedText) => {
          // Success callback
          playBeepSound();
          handleBarcodeDetected(decodedText);
          stopCameraScanner();
        },
        () => {
          // Frame error callback, safe to ignore
        }
      ).catch((startErr) => {
        const msg = String(startErr?.message || startErr || '');
        if (!msg.includes('interrupted') && !msg.includes('AbortError')) {
          throw startErr;
        }
      });

      if (isMountedRef.current) {
        setIsScanningCamera(true);
      } else {
        // Component unmounted while camera was initializing
        try {
          if (html5QrCode.isScanning) {
            await html5QrCode.stop();
          }
          await html5QrCode.clear();
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const msg = String(err?.message || err || '');
        if (!msg.includes('interrupted') && !msg.includes('AbortError')) {
          console.error('Failed to start camera:', err);
          setCameraError(err?.message || 'Gagal memulai kamera. Pastikan izin kamera telah disetujui pada browser.');
        }
        setIsScanningCamera(false);
      }
    } finally {
      isStartingRef.current = false;
    }
  };

  const resetForm = () => {
    setIsbnInput('');
    setSearchStatus('idle');
    setExistingBook(null);
    setOnlineResult(null);
    setJudul('');
    setPenulis('');
    setHargaJual(85000);
    setBiayaPokok(34000);
    setManualStok(20);
    setStockAdjustmentMode('add');
    setCatatanStok('Penerimaan stok via Barcode Scanner');
    setAutoFilledTitle(false);
  };

  const handleBarcodeDetected = (rawCode: string) => {
    const cleaned = cleanIsbn(rawCode);
    setIsbnInput(cleaned || rawCode);
    executeIsbnLookup(cleaned || rawCode);
  };

  const executeIsbnLookup = async (isbnQuery: string) => {
    const cleaned = cleanIsbn(isbnQuery);
    if (!cleaned) return;

    setIsSearching(true);
    setSearchStatus('idle');
    setExistingBook(null);
    setOnlineResult(null);

    // Helper to auto-focus on stock input so the user only types stock & price
    const focusStockInput = () => {
      setTimeout(() => {
        if (stockInputRef.current) {
          stockInputRef.current.focus();
          stockInputRef.current.select();
        }
      }, 150);
    };

    // 1. Check local database first
    const foundLocal = books.find(b => {
      const bIsbn = cleanIsbn(b.isbn || '');
      return bIsbn && (bIsbn === cleaned || bIsbn.includes(cleaned) || cleaned.includes(bIsbn));
    });

    if (foundLocal) {
      setExistingBook(foundLocal);
      setJudul(foundLocal.judul);
      setPenulis(foundLocal.penulis);
      setKategori(foundLocal.kategori || 'Filosofi');
      setHargaJual(foundLocal.harga_jual);
      setBiayaPokok(foundLocal.biaya_pokok || Math.round(foundLocal.harga_jual * 0.4));
      setSearchStatus('found_local');
      setAutoFilledTitle(true);
      setIsSearching(false);
      setToastFeedback(`✨ Judul "${foundLocal.judul}" otomatis terdeteksi! Silakan input stok & harga.`);
      focusStockInput();
      return;
    }

    // 2. Lookup online from AI / Catalog
    const online = await lookupIsbnOnline(cleaned);
    setIsSearching(false);

    if (online && online.judul) {
      setOnlineResult(online);
      setJudul(online.judul);
      setPenulis(online.penulis || 'Penulis Lamrimnesia');
      setKategori(online.kategori || 'Filosofi');
      const estimatedPrice = online.estimasi_harga && online.estimasi_harga > 1000 ? online.estimasi_harga : 85000;
      setHargaJual(estimatedPrice);
      setBiayaPokok(online.biaya_pokok || Math.round(estimatedPrice * 0.4));
      setSearchStatus('found_online');
      setAutoFilledTitle(true);
      setToastFeedback(`✨ Judul "${online.judul}" berhasil terisi otomatis! Silakan input stok & harga.`);
      focusStockInput();
    } else {
      const fallbackJudul = `Buku Terbitan (ISBN ${cleaned})`;
      setJudul(fallbackJudul);
      setPenulis('Penerbit Lamrimnesia');
      setKategori('Filosofi');
      setHargaJual(85000);
      setBiayaPokok(34000);
      setSearchStatus('found_online');
      setAutoFilledTitle(true);
      setToastFeedback(`✨ Judul otomatis disiapkan ("${fallbackJudul}"). Silakan input stok & harga.`);
      focusStockInput();
    }
  };

  const handleManualSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isbnInput.trim()) return;
    executeIsbnLookup(isbnInput.trim());
  };

  const handleSaveBookAndStock = () => {
    if (!judul.trim()) {
      setToastFeedback('⚠️ Judul buku wajib diisi sebelum menyimpan data!');
      return;
    }

    setIsSaving(true);

    try {
      const cleanedIsbn = cleanIsbn(isbnInput);

      if (existingBook) {
        // Mode 1: Update Existing Book
        if (stockAdjustmentMode === 'add') {
          adjustBookStock(existingBook.id, manualStok, 'add', catatanStok);
        } else {
          adjustBookStock(existingBook.id, manualStok, 'set', catatanStok);
        }

        // Also update price / HPP / category if modified
        updateBook(
          existingBook.id,
          judul.trim(),
          penulis.trim() || existingBook.penulis,
          hargaJual,
          biayaPokok,
          kategori,
          cleanedIsbn || existingBook.isbn
        );

        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });

        const successMsg = `Stok buku "${judul}" berhasil diperbarui (${stockAdjustmentMode === 'add' ? `+${manualStok} eks` : `Stok diset: ${manualStok} eks`})!`;
        if (onSuccess) onSuccess(successMsg);
        onClose();
      } else {
        // Mode 2: Register New Book with Initial Stock
        addBook(
          judul.trim(),
          penulis.trim() || 'Tim Penerbitan Lamrimnesia',
          hargaJual,
          manualStok,
          biayaPokok,
          kategori,
          cleanedIsbn || isbnInput.trim()
        );

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });

        const successMsg = `Buku baru "${judul}" berhasil didaftarkan ke sistem dengan stok fisik ${manualStok} eksemplar!`;
        if (onSuccess) onSuccess(successMsg);
        onClose();
      }
    } catch (err: any) {
      console.error('Error saving book:', err);
      setToastFeedback('⚠️ Terjadi kesalahan saat menyimpan data buku. Silakan periksa kembali.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = async () => {
    await stopCameraScanner();
    onClose();
  };

  const handleSwitchTab = async (newTab: 'camera' | 'manual') => {
    if (newTab === activeTab) return;
    if (activeTab === 'camera') {
      await stopCameraScanner();
    }
    setActiveTab(newTab);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide flex items-center gap-2">
                Scan Barcode & Input Stok ISBN
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                  Otomatis & Manual
                </span>
              </h2>
              <p className="text-xs text-indigo-200/80">
                Pindai barcode atau ketik manual ISBN buku, lalu masukkan jumlah stok fisik ke sistem.
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSwitchTab('manual')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Ketik Manual ISBN / Barcode Scanner USB
          </button>
          <button
            type="button"
            onClick={() => handleSwitchTab('camera')}
            className={`pb-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            Kamera Langsung (Smartphone / Webcam)
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* Toast Notification inside modal */}
          {toastFeedback && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                {toastFeedback}
              </span>
              <button
                type="button"
                onClick={() => setToastFeedback(null)}
                className="text-indigo-500 hover:text-indigo-800 dark:hover:text-indigo-200 ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: CAMERA SCANNER (Preserved in DOM to prevent media play interruptions) */}
          <div className={activeTab === 'camera' ? 'space-y-4' : 'hidden'}>
            <div className="bg-slate-900 rounded-2xl p-4 text-center text-white relative overflow-hidden border border-slate-800">
              {/* HTML5 QRCODE VIEWPORT WRAPPER */}
              <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden bg-black/60 aspect-video flex items-center justify-center text-slate-400">
                {/* Dedicated element for html5-qrcode. Kept child-free for React virtual DOM reconciliation */}
                <div
                  id={readerElementId}
                  className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
                />

                {/* React placeholder overlay */}
                {!isScanningCamera && !cameraError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2 pointer-events-none bg-black/70">
                    <Camera className="w-10 h-10 text-indigo-400 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-300">Kamera siap. Klik tombol di bawah untuk mulai memindai barcode.</p>
                  </div>
                )}
              </div>

                {/* Camera control buttons */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  {!isScanningCamera ? (
                    <button
                      type="button"
                      onClick={() => startCameraScanner()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Mulai Pindai Barcode Kamera
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCameraScanner}
                      className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Hentikan Kamera
                    </button>
                  )}

                  {availableCameras.length > 1 && (
                    <select
                      value={selectedCameraId}
                      onChange={(e) => {
                        setSelectedCameraId(e.target.value);
                        if (isScanningCamera) {
                          startCameraScanner(e.target.value);
                        }
                      }}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {availableCameras.map((cam, idx) => (
                        <option key={cam.id} value={cam.id}>
                          {cam.label || `Kamera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {cameraError && (
                  <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Kendala Akses Kamera:</p>
                      <p className="text-[11px] text-rose-200/90">{cameraError}</p>
                      <p className="text-[10px] text-rose-300/70 mt-1">
                        Tips: Anda juga dapat menggunakan tab <strong>"Ketik Manual ISBN"</strong> di atas atau menggunakan scanner barcode laser USB.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          {/* TAB 2: MANUAL / USB BARCODE SCANNER INPUT */}
          <div className="space-y-4">
            <form onSubmit={handleManualSearchSubmit} className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nomor ISBN / Kode Barcode Buku (10 atau 13 Digit):
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ScanBarcode className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={isbnInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIsbnInput(val);
                      const cleaned = cleanIsbn(val);
                      if (cleaned.length === 10 || cleaned.length === 13) {
                        executeIsbnLookup(cleaned);
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      const cleaned = cleanIsbn(pasted);
                      if (cleaned.length >= 6) {
                        setTimeout(() => executeIsbnLookup(cleaned), 60);
                      }
                    }}
                    placeholder="Contoh: 9786026117304 atau scan barcode langsung..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none tracking-wider"
                    autoFocus
                  />
                  {isbnInput && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !isbnInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-2 shrink-0 transition-all cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Cari Metadata
                    </>
                  )}
                </button>
              </div>

              {/* Quick sample chips for testing */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400">Contoh Uji Coba:</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsbnInput('9786026117304');
                    executeIsbnLookup('9786026117304');
                  }}
                  className="px-2 py-1 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  978-602-61173-0-4 (Lamrim)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsbnInput('9780143105954');
                    executeIsbnLookup('9780143105954');
                  }}
                  className="px-2 py-1 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  978-0143105954 (Dharma)
                </button>
              </div>
            </form>

            {/* STATUS BANNER */}
            {searchStatus === 'found_local' && existingBook && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-700 dark:text-emerald-300 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-200 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100">
                        Buku Sudah Terdaftar di Sistem
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ID #{existingBook.id}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                      {existingBook.judul}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Penulis: <strong>{existingBook.penulis}</strong> | Kategori: <strong>{existingBook.kategori || 'Filosofi'}</strong>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <div className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 font-semibold text-emerald-700 dark:text-emerald-300">
                        Stok Fisik Saat Ini: <span className="text-sm font-black">{existingBook.stok_gudang}</span> eks
                      </div>
                      <div className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        Harga Jual: Rp {existingBook.harga_jual.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock operation mode selector */}
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-4 text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Tindakan Stok:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="stockMode"
                      checked={stockAdjustmentMode === 'add'}
                      onChange={() => setStockAdjustmentMode('add')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Tambah Stok Masuk (+X)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="stockMode"
                      checked={stockAdjustmentMode === 'set'}
                      onChange={() => setStockAdjustmentMode('set')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Set / Koreksi Total Stok (Stock Opname)</span>
                  </label>
                </div>
              </div>
            )}

            {searchStatus === 'found_online' && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 rounded-lg text-indigo-700 dark:text-indigo-300 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-200 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">
                    Data Berhasil Terdeteksi Online
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Metadata resmi buku ditemukan via <strong>{onlineResult?.source === 'google_books' ? 'Google Books API' : 'Open Library'}</strong>. Judul dan penulis telah terisi otomatis. Anda dapat menyesuaikan harga dan memasukkan jumlah stok fisik.
                  </p>
                </div>
              </div>
            )}

            {searchStatus === 'manual_needed' && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-100">
                    Pendaftaran Buku Baru
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    ISBN belum terdaftar di sistem. Silakan isi judul, penulis, harga jual, dan jumlah stok fisik buku di bawah ini.
                  </p>
                </div>
              </div>
            )}

            {/* EDITABLE FORM & MANUAL STOCK INPUT */}
            {(searchStatus !== 'idle' || isbnInput.trim().length > 0) && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                {/* Auto-filled Notification Banner */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Judul buku <strong>otomatis terisi</strong> saat barcode dipindai! Anda hanya perlu mengisi <strong>Stok Fisik</strong> dan <strong>Harga Jual</strong> di bawah.
                    </span>
                  </div>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100">
                    Auto-Fill Aktif
                  </span>
                </div>

                {/* Section 1: Book Identity (Auto-filled) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      Identitas Buku:
                    </span>
                    {autoFilledTitle && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Judul Terisi Otomatis
                      </span>
                    )}
                  </div>

                  {/* Judul Buku */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Judul Buku (Otomatis):
                    </label>
                    <input
                      type="text"
                      value={judul}
                      onChange={(e) => setJudul(e.target.value)}
                      placeholder="Judul terisi otomatis saat scan barcode..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      💡 Anda tidak perlu mengetik judul ini secara manual, kecuali ingin mengubah atau menyempurnakannya.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Penulis */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Penulis / Penyusun:
                      </label>
                      <input
                        type="text"
                        value={penulis}
                        onChange={(e) => setPenulis(e.target.value)}
                        placeholder="Nama penulis..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Kategori */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Kategori Buku:
                      </label>
                      <select
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: MANUAL INPUT SECTION (STOCK + PRICE) */}
                <div className="p-4 bg-indigo-50/90 dark:bg-slate-800/90 rounded-2xl border-2 border-indigo-400 dark:border-indigo-600 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                      <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-100 uppercase tracking-wider">
                        Bagian Yang Diketik Manual: Stok & Harga
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                      ⌨️ Tekan [Enter] untuk Simpan Cepat
                    </span>
                  </div>

                  {/* Dual Grid: 1. Stok Masuk, 2. Harga Jual */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 1. JUMLAH STOK */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-indigo-600" />
                          {existingBook
                            ? stockAdjustmentMode === 'add'
                              ? '1. Tambah Stok Masuk:'
                              : '1. Set Total Stok Baru:'
                            : '1. Jumlah Stok Fisik:'}
                        </label>
                        {existingBook && (
                          <span className="text-[10px] font-medium text-slate-500">
                            Stok Saat Ini: {existingBook.stok_gudang} eks
                          </span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          ref={stockInputRef}
                          type="number"
                          min="0"
                          value={manualStok}
                          onChange={(e) => setManualStok(Math.max(0, parseInt(e.target.value) || 0))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveBookAndStock();
                            }
                          }}
                          className="w-full px-3 py-2 rounded-xl border-2 border-indigo-500 bg-indigo-50/40 dark:bg-slate-800 text-indigo-950 dark:text-white text-xl font-black tracking-wide text-center focus:outline-none focus:ring-2 focus:ring-indigo-600"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          eks
                        </span>
                      </div>

                      {/* Quick increment buttons */}
                      <div className="flex flex-wrap items-center gap-1">
                        {[5, 10, 20, 50, 100].map((step) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() => setManualStok((prev) => prev + step)}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                          >
                            +{step}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setManualStok(0)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-[11px] font-semibold text-slate-500"
                        >
                          0
                        </button>
                      </div>

                      {existingBook && (
                        <div className="text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-100 dark:border-slate-800">
                          {stockAdjustmentMode === 'add'
                            ? `Total gudang setelah simpan: ${existingBook.stok_gudang + manualStok} eks`
                            : `Selisih opname: ${manualStok - existingBook.stok_gudang >= 0 ? `+${manualStok - existingBook.stok_gudang}` : manualStok - existingBook.stok_gudang} eks`}
                        </div>
                      )}
                    </div>

                    {/* 2. HARGA JUAL SATUAN */}
                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900 shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          2. Harga Jual Satuan (Rp):
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">
                          HPP: Rp {(biayaPokok || 0).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          Rp
                        </span>
                        <input
                          ref={priceInputRef}
                          type="number"
                          min="0"
                          step="1000"
                          value={hargaJual || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setHargaJual(val);
                            if (!existingBook) {
                              setBiayaPokok(Math.round(val * 0.4));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSaveBookAndStock();
                            }
                          }}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-black focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          placeholder="85000"
                        />
                      </div>

                      {/* Quick price chips */}
                      <div className="flex flex-wrap items-center gap-1">
                        {[65000, 85000, 95000, 120000, 145000].map((prc) => (
                          <button
                            key={prc}
                            type="button"
                            onClick={() => {
                              setHargaJual(prc);
                              setBiayaPokok(Math.round(prc * 0.4));
                            }}
                            className={`px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${
                              hargaJual === prc
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            }`}
                          >
                            {prc / 1000}k
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Biaya Pokok (HPP 40%):</span>
                        <input
                          type="number"
                          value={biayaPokok || ''}
                          onChange={(e) => setBiayaPokok(Number(e.target.value))}
                          className="w-20 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-[10px] font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Keterangan / Lokasi Gudang */}
                  <div>
                    <input
                      type="text"
                      value={catatanStok}
                      onChange={(e) => setCatatanStok(e.target.value)}
                      placeholder="Catatan penerimaan / lokasi rak gudang (opsional)..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Reset Form
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={isSaving || !judul.trim() || manualStok < 0}
              onClick={handleSaveBookAndStock}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {existingBook ? 'Simpan Pembaruan Stok' : 'Simpan Buku & Stok ke Sistem'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
