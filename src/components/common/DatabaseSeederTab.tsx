import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { SeederSummary } from '../../types';
import {
  Sparkles,
  BookOpen,
  Users,
  ShoppingCart,
  Receipt,
  Printer,
  Factory,
  Truck,
  Plus,
  Minus,
  CheckCircle2,
  RefreshCw,
  Sliders,
  RotateCcw
} from 'lucide-react';

interface DatabaseSeederTabProps {
  onSuccess?: () => void;
}

export const DatabaseSeederTab: React.FC<DatabaseSeederTabProps> = ({ onSuccess }) => {
  const { seedDummyData } = useApp();

  // Quantities for each entity
  const [counts, setCounts] = useState({
    books: 5,
    identitas: 5,
    orders: 5,
    mutasis: 5,
    pengajuans: 2,
    production: 2,
    logistic: 3
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [seederResult, setSeederResult] = useState<SeederSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateCount = (key: keyof typeof counts, delta: number) => {
    setCounts((prev) => {
      const nextVal = Math.max(0, Math.min(100, prev[key] + delta));
      return { ...prev, [key]: nextVal };
    });
  };

  const setCountDirect = (key: keyof typeof counts, value: number) => {
    const clamped = Math.max(0, Math.min(200, isNaN(value) ? 0 : value));
    setCounts((prev) => ({ ...prev, [key]: clamped }));
  };

  const applyPreset = (preset: 'minimal' | 'standar' | 'lengkap') => {
    if (preset === 'minimal') {
      setCounts({
        books: 2,
        identitas: 2,
        orders: 2,
        mutasis: 2,
        pengajuans: 1,
        production: 1,
        logistic: 1
      });
    } else if (preset === 'standar') {
      setCounts({
        books: 5,
        identitas: 5,
        orders: 5,
        mutasis: 5,
        pengajuans: 3,
        production: 3,
        logistic: 4
      });
    } else if (preset === 'lengkap') {
      setCounts({
        books: 12,
        identitas: 15,
        orders: 15,
        mutasis: 15,
        pengajuans: 6,
        production: 6,
        logistic: 8
      });
    }
  };

  const totalItemsToGenerate = Object.values(counts).reduce((a, b) => a + b, 0);

  const handleExecuteSeed = () => {
    if (totalItemsToGenerate === 0) {
      setErrorMessage('Pilih minimal 1 jumlah data dummy pada salah satu counter di atas.');
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setSeederResult(null);

    setTimeout(() => {
      try {
        const summary = seedDummyData({
          bookCount: counts.books,
          identitasCount: counts.identitas,
          orderCount: counts.orders,
          mutasiCount: counts.mutasis,
          pengajuanCount: counts.pengajuans,
          productionCount: counts.production,
          logisticCount: counts.logistic
        });
        setSeederResult(summary);
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error('Seeder execution error:', err);
        setErrorMessage('Terjadi kesalahan saat menyuntikkan data dummy.');
      } finally {
        setIsGenerating(false);
      }
    }, 350);
  };

  const entityConfigs: {
    key: keyof typeof counts;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgBadge: string;
  }[] = [
    {
      key: 'books',
      label: 'Katalog Buku & Judul Baru',
      description: 'Judul dharma, ISBN, harga jual, biaya pokok (HPP), dan stok gudang',
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      color: 'emerald',
      bgBadge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    },
    {
      key: 'identitas',
      label: 'Anggota, Donatur & Agen',
      description: 'Profil anggota KTP, kota, kontak WA/email, dan status keanggotaan',
      icon: <Users className="w-4 h-4 text-cyan-500" />,
      color: 'cyan',
      bgBadge: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800'
    },
    {
      key: 'orders',
      label: 'Pesanan Masuk & Invoice POS',
      description: 'Invoice belanja buku, status pelunasan, ekspedisi pengiriman & donasi',
      icon: <ShoppingCart className="w-4 h-4 text-indigo-500" />,
      color: 'indigo',
      bgBadge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
    },
    {
      key: 'mutasis',
      label: 'Mutasi Keuangan (Kas / Bank)',
      description: 'Jurnal kas masuk/keluar ke rekening yayasan beserta kategori akuntansi',
      icon: <Receipt className="w-4 h-4 text-amber-500" />,
      color: 'amber',
      bgBadge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    },
    {
      key: 'pengajuans',
      label: 'Pengajuan Cetak Naskah',
      description: 'Permohonan cetak buku baru / cetak ulang untuk persetujuan bendahara',
      icon: <Printer className="w-4 h-4 text-purple-500" />,
      color: 'purple',
      bgBadge: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
    },
    {
      key: 'production',
      label: 'Log Percetakan / Produksi',
      description: 'Catatan hasil cetak fisik pabrikasi yang siap didistribusikan',
      icon: <Factory className="w-4 h-4 text-blue-500" />,
      color: 'blue',
      bgBadge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
    },
    {
      key: 'logistic',
      label: 'Log Ekspedisi & Gudang',
      description: 'Catatan paket keluar gudang beserta ekspedisi dan kota tujuan',
      icon: <Truck className="w-4 h-4 text-orange-500" />,
      color: 'orange',
      bgBadge: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Banner Intro */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-pink-500/10 border border-purple-200/70 dark:border-purple-800/60 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-400 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Generator Data Dummy Realistis (*Database Seeder*)
          </p>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Tambahkan entri data buatan realistis untuk menguji fitur laporan, grafik dashboard, mutasi kas, antrean packing logistik, dan POS. Gunakan tombol counter di bawah untuk menyesuaikan jumlah data yang ingin disuntikkan.
          </p>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span>Preset Cepat:</span>
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('minimal')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-2xs transition-colors cursor-pointer"
          >
            Ringan (~10 item)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('standar')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
          >
            Standar (~30 item)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('lengkap')}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
          >
            Banyak (~75 item)
          </button>
          <button
            type="button"
            onClick={() =>
              setCounts({
                books: 0,
                identitas: 0,
                orders: 0,
                mutasis: 0,
                pengajuans: 0,
                production: 0,
                logistic: 0
              })
            }
            title="Reset semua ke 0"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="space-y-2.5">
        {entityConfigs.map((entity) => {
          const count = counts[entity.key];

          return (
            <div
              key={entity.key}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-3"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  {entity.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {entity.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${entity.bgBadge}`}
                    >
                      +{count}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {entity.description}
                  </p>
                </div>
              </div>

              {/* Counter Stepper */}
              <div className="flex items-center space-x-1.5 shrink-0 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => updateCount(entity.key, -5)}
                  disabled={count === 0}
                  title="Kurangi 5"
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => updateCount(entity.key, -1)}
                  disabled={count === 0}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  min="0"
                  max="200"
                  value={count}
                  onChange={(e) => setCountDirect(entity.key, parseInt(e.target.value, 10))}
                  className="w-11 text-center font-bold text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() => updateCount(entity.key, 1)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateCount(entity.key, 5)}
                  title="Tambah 5"
                  className="w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  +5
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          id="btn-run-seeder"
          onClick={handleExecuteSeed}
          disabled={isGenerating || totalItemsToGenerate === 0}
          className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyuntikkan Data Dummy...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                Tambahkan {totalItemsToGenerate} Data Dummy ke Database
              </span>
            </>
          )}
        </button>
      </div>

      {/* Result Callout */}
      {seederResult && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2 text-emerald-900 dark:text-emerald-100"
        >
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Berhasil Menambahkan Data Dummy!</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] pt-1 border-t border-emerald-200/60 dark:border-emerald-800/60">
            <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[9px]">Buku Baru</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                +{seederResult.booksAdded} judul
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[9px]">Anggota/Donatur</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                +{seederResult.identitasAdded} orang
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[9px]">Pesanan Masuk</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                +{seederResult.ordersAdded} invoice
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/40">
              <span className="text-slate-500 dark:text-slate-400 block text-[9px]">Mutasi Keuangan</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                +{seederResult.mutasisAdded} transaksi
              </span>
            </div>
          </div>
          <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 italic">
            Semua data langsung tersinkronisasi ke seluruh tabel, antrean pengiriman, jurnal keuangan, dan laporan divisi.
          </p>
        </motion.div>
      )}
    </div>
  );
};
