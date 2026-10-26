import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Sun,
  Coffee,
  BatteryCharging,
  Sparkles,
  Heart,
  CheckCircle2,
  X,
  Target,
  Briefcase,
  Flame,
  Clock,
  Compass,
  ArrowRight,
  Smile,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DailyPulseEnergyLevel, DailyPulseWorkload, DailyPulseRecord, DivisionId } from '../../types';
import { playPleasantSuccessChime, playPleasantClickSound } from '../../utils/soundEffects';
import { getFriendlyUserFirstName } from '../../utils/greetingUtils';

interface DailyPulseCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (pulse: DailyPulseRecord) => void;
}

interface EnergyOption {
  level: DailyPulseEnergyLevel;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  percent: number;
  activeBorder: string;
  activeBg: string;
  activeText: string;
}

interface WorkloadOption {
  level: DailyPulseWorkload;
  label: string;
  desc: string;
  colorDot: string;
  badgeClass: string;
}

const MINDFUL_QUOTES = [
  'Awali hari dengan kesadaran murni. Setiap pekerjaan bernilai bajik jika dilakukan dengan ketulusan hati.',
  'Bekerja dengan penuh kesadaran (sati) dan perhatian adalah latihan spiritual yang sejati dalam kehidupan sehari-hari.',
  'Kesabaran dan ketenangan pikiran adalah pelindung terbaik di tengah padatnya tugas dan tanggung jawab.',
  'Jadikan setiap interaksi dengan rekan kerja sebagai kesempatan menabur welas asih dan pengertian.',
  'Fokuslah pada satu langkah saat ini. Kualitas proses hari ini menentukan berkah hasil di kemudian hari.'
];

const DIVISION_GOAL_SUGGESTIONS: Record<DivisionId, string[]> = {
  1: [
    'Review rekapitulasi performa mingguan & koordinasi pengurus',
    'Sinkronisasi agenda strategis & arahan pimpinan yayasan',
    'Verifikasi database anggota & laporan evaluasi divisi'
  ],
  2: [
    'Rekonsiliasi rekening koran bank & mutasi kas harian',
    'Verifikasi pencairan persetujuan SPK cetak buku penerbitan',
    'Review laporan arus kas & pelunasan invoice masuk'
  ],
  3: [
    'Review naskah cetak & koordinasi kelengkapan ISBN',
    'Follow-up komunikasi penulis & data sponsor donasi cetak',
    'Pemeriksaan draf tata letak buku dharma terbaru'
  ],
  4: [
    'Follow-up invoice pending melalui WhatsApp & cek konfirmasi',
    'Persiapan materi event bazaar & optimasi bundle pre-order',
    'Evaluasi program loyalitas sahabat pembaca & promosi'
  ],
  5: [
    'Monitoring progres SPK cetak buku & antrean mesin cetak',
    'Quality control (QC) hasil jilid & koordinasi vendor kertas',
    'Perhitungan estimasi HPP cetak ulang naskah reguler'
  ],
  6: [
    'Proses packing pesanan lunas & serah terima ke kurir ekspedisi',
    'Input nomor resi pengiriman & broadcast notifikasi WhatsApp',
    'Stock opname buku gudang dengan sisa kuota menipis'
  ]
};

export const DailyPulseCheckModal: React.FC<DailyPulseCheckModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const {
    currentUser,
    divisiList,
    showToast,
    recordActivity,
    dailyPulse,
    saveDailyPulse
  } = useApp();

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [energyLevel, setEnergyLevel] = useState<DailyPulseEnergyLevel>('good');
  const [workload, setWorkload] = useState<DailyPulseWorkload>('normal');
  const [goalNote, setGoalNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pick deterministic quote of the day based on date
  const quoteOfTheDay = useMemo(() => {
    const dayIndex = new Date().getDate() % MINDFUL_QUOTES.length;
    return MINDFUL_QUOTES[dayIndex];
  }, []);

  // Initialize from existing pulse if user had already filled today or default
  useEffect(() => {
    if (isOpen) {
      if (dailyPulse && dailyPulse.date === todayStr) {
        setEnergyLevel(dailyPulse.energyLevel);
        setWorkload(dailyPulse.workload);
        setGoalNote(dailyPulse.goalNote || '');
      } else {
        // Try read from localStorage
        try {
          const key = `mis_daily_pulse_${currentUser.id}_${todayStr}`;
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed: DailyPulseRecord = JSON.parse(stored);
            setEnergyLevel(parsed.energyLevel);
            setWorkload(parsed.workload);
            setGoalNote(parsed.goalNote || '');
          } else {
            setEnergyLevel('good');
            setWorkload('normal');
            setGoalNote('');
          }
        } catch {
          // fallback
        }
      }
    }
  }, [isOpen, dailyPulse, currentUser.id, todayStr]);

  const userFirstName = getFriendlyUserFirstName(currentUser.name);
  const userDivision = divisiList.find(d => d.id === currentUser.divisi_id);

  const energyOptions: EnergyOption[] = [
    {
      level: 'peak',
      title: 'Penuh Semangat',
      subtitle: 'Stamina prima, siap untuk tugas kompleks & strategi besar',
      icon: <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />,
      percent: 100,
      activeBorder: 'border-amber-500/50 dark:border-amber-500/60 ring-2 ring-amber-500/20',
      activeBg: 'bg-amber-500/10 dark:bg-amber-500/15',
      activeText: 'text-amber-800 dark:text-amber-200'
    },
    {
      level: 'good',
      title: 'Optimal & Fokus',
      subtitle: 'Konsentrasi stabil, ritme kerja teratur & siap eksekusi',
      icon: <Sun className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />,
      percent: 80,
      activeBorder: 'border-emerald-500/50 dark:border-emerald-500/60 ring-2 ring-emerald-500/20',
      activeBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      activeText: 'text-emerald-800 dark:text-emerald-200'
    },
    {
      level: 'moderate',
      title: 'Sedang / Cukup',
      subtitle: 'Energi moderat, menangani rutinitas harian dengan santai',
      icon: <Coffee className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />,
      percent: 60,
      activeBorder: 'border-indigo-500/50 dark:border-indigo-500/60 ring-2 ring-indigo-500/20',
      activeBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      activeText: 'text-indigo-800 dark:text-indigo-200'
    },
    {
      level: 'low',
      title: 'Hemat Daya',
      subtitle: 'Baterai menurun, prioritaskan tugas esensial & minimalkan distraksi',
      icon: <BatteryCharging className="w-5 h-5 text-orange-500 fill-orange-500/20" />,
      percent: 40,
      activeBorder: 'border-orange-500/50 dark:border-orange-500/60 ring-2 ring-orange-500/20',
      activeBg: 'bg-orange-500/10 dark:bg-orange-500/15',
      activeText: 'text-orange-800 dark:text-orange-200'
    },
    {
      level: 'drained',
      title: 'Kelelahan / Jeda',
      subtitle: 'Kurang fit atau overload, butuh pacing santai & dukungan rekan',
      icon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />,
      percent: 20,
      activeBorder: 'border-rose-500/50 dark:border-rose-500/60 ring-2 ring-rose-500/20',
      activeBg: 'bg-rose-500/10 dark:bg-rose-500/15',
      activeText: 'text-rose-800 dark:text-rose-200'
    }
  ];

  const workloadOptions: WorkloadOption[] = [
    {
      level: 'light',
      label: 'Ringan',
      desc: 'Review santai & perapian data',
      colorDot: 'bg-emerald-500',
      badgeClass: 'hover:border-emerald-400'
    },
    {
      level: 'normal',
      label: 'Normal',
      desc: 'Beban standar terencana',
      colorDot: 'bg-teal-500',
      badgeClass: 'hover:border-teal-400'
    },
    {
      level: 'heavy',
      label: 'Padat',
      desc: 'Banyak deadline & koordinasi',
      colorDot: 'bg-amber-500',
      badgeClass: 'hover:border-amber-400'
    },
    {
      level: 'critical',
      label: 'Kritis / Sprint',
      desc: 'Prioritas tinggi & intensif',
      colorDot: 'bg-rose-500',
      badgeClass: 'hover:border-rose-400'
    }
  ];

  const handleSelectEnergy = (lvl: DailyPulseEnergyLevel) => {
    setEnergyLevel(lvl);
    try {
      playPleasantClickSound();
    } catch {
      // ignore
    }
  };

  const handleSelectWorkload = (wl: DailyPulseWorkload) => {
    setWorkload(wl);
    try {
      playPleasantClickSound();
    } catch {
      // ignore
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setGoalNote(prev => (prev ? `${prev}. ${suggestion}` : suggestion));
    try {
      playPleasantClickSound();
    } catch {
      // ignore
    }
  };

  const handleDismiss = () => {
    try {
      // Mark as dismissed for this session so it won't repeatedly pop up
      sessionStorage.setItem('mis_pulse_dismissed_session', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const record: DailyPulseRecord = {
      id: `pulse-${currentUser.id}-${todayStr}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userDivisionId: currentUser.divisi_id,
      date: todayStr,
      energyLevel,
      workload,
      goalNote: goalNote.trim(),
      mindfulQuote: quoteOfTheDay,
      createdAt: dailyPulse?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save via context handler
    if (saveDailyPulse) {
      saveDailyPulse(record);
    } else {
      try {
        localStorage.setItem(`mis_daily_pulse_${currentUser.id}_${todayStr}`, JSON.stringify(record));
        localStorage.setItem(`mis_last_active_pulse_${currentUser.id}`, JSON.stringify(record));
      } catch {
        // ignore
      }
    }

    try {
      playPleasantSuccessChime();
    } catch {
      // ignore
    }

    const energyTitles: Record<DailyPulseEnergyLevel, string> = {
      peak: 'Penuh Semangat (100%)',
      good: 'Optimal & Fokus (80%)',
      moderate: 'Sedang / Cukup (60%)',
      low: 'Hemat Daya (40%)',
      drained: 'Perlu Jeda & Pacing (20%)'
    };

    recordActivity(
      'Daily Pulse Check',
      'User',
      `Check-in harian: Energi [${energyTitles[energyLevel]}], Beban Kerja [${workload}]. Target: "${goalNote.trim() || 'Fokus operasional umum'}"`
    );

    showToast({
      title: '✨ Pulse Harian Tercatat!',
      message: `Selamat bertugas, Kak ${userFirstName}. Fokus & ritme kerja Anda siap mendampingi hari ini.`,
      type: 'success',
      category: 'system'
    });

    if (onSaved) {
      onSaved(record);
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Decorative Mood Gradient Banner */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-teal-400 to-indigo-500" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Daily Pulse Check</span>
              <span aria-hidden="true">·</span>
              <span>Kak {userFirstName}</span>
              <span aria-hidden="true">·</span>
              <span>{userDivision?.nama_divisi || 'Yayasan Dharma'}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Bagaimana Kondisi Anda Hari Ini?</span>
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Luangkan 30 detik untuk menyelaraskan energi, ekspektasi beban kerja, dan target utama sebelum memulai aktivitas.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Lewati (Nanti Saja)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Section 1: Level Energi Hari Ini */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>1. Level Energi & Kesiapan Mental</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih salah satu
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {energyOptions.map(opt => {
                const isSelected = energyLevel === opt.level;
                return (
                  <button
                    key={opt.level}
                    type="button"
                    onClick={() => handleSelectEnergy(opt.level)}
                    className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-start gap-3 ${
                      isSelected
                        ? `${opt.activeBorder} ${opt.activeBg} ${opt.activeText}`
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-2xs shrink-0 border border-slate-100 dark:border-slate-800">
                      {opt.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold block">{opt.title}</span>
                        <span className="text-[10px] font-semibold opacity-75">{opt.percent}%</span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-0.5 line-clamp-2 leading-relaxed">
                        {opt.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Beban Kerja / Workload Expectation */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Briefcase className="w-3.5 h-3.5 text-teal-500" />
                <span>2. Ekspektasi Beban Kerja Hari Ini</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Sesuai agenda to-do
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {workloadOptions.map(w => {
                const isSelected = workload === w.level;
                return (
                  <button
                    key={w.level}
                    type="button"
                    onClick={() => handleSelectWorkload(w.level)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                        : `border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 ${w.badgeClass}`
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${w.colorDot}`} />
                      <span className="text-xs font-bold">{w.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {w.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Target Utama & Catatan Niat Hari Ini */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Target className="w-3.5 h-3.5 text-rose-500" />
                <span>3. Target / 1-2 Fokus Utama Hari Ini</span>
              </label>
              <span className="text-[11px] text-slate-400">Opsional namun dianjurkan</span>
            </div>

            <textarea
              value={goalNote}
              onChange={e => setGoalNote(e.target.value)}
              placeholder="Contoh: Selesaikan rekonsiliasi kas sebelum jam 14:00, review draft buku cetak..."
              rows={2}
              maxLength={250}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
            />

            {/* Quick Suggestions based on Division */}
            <div className="mt-2">
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <span>Rekomendasi Cepat ({userDivision?.nama_divisi || 'Divisi'}):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(DIVISION_GOAL_SUGGESTIONS[currentUser.divisi_id] || DIVISION_GOAL_SUGGESTIONS[1]).map(
                  (suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
                    >
                      + {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Dharma / Mindful Reflection Quote Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/5 via-teal-500/5 to-indigo-500/5 dark:from-amber-950/20 dark:via-teal-950/20 dark:to-indigo-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-300 block mb-0.5">
                Refleksi Kesadaran Kerja (Right Mindfulness)
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                "{quoteOfTheDay}"
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
            >
              Lewati (Nanti Saja)
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-teal-600 hover:from-indigo-500 hover:via-indigo-600 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Pulse Hari Ini</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
