import React, { useState, useMemo } from 'react';
import {
  Award,
  Crown,
  Shield,
  Star,
  Users,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  CreditCard,
  Share2,
  Sparkles,
  CheckCircle2,
  QrCode,
  ExternalLink,
  ShoppingBag,
  Download,
  Info,
  ChevronRight,
  Flame,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Identitas, Order, MembershipTierLevel } from '../../types';
import { MEMBERSHIP_TIERS } from '../../lib/initialData';
import {
  computeMemberLoyaltyProfile,
  generateMemberWhatsAppMessage,
  MemberLoyaltyProfile
} from '../../utils/membershipUtils';
import { formatNumberWithDots } from '../../utils/currencyUtils';

interface MembershipLoyaltyTabProps {
  onOpenPOSForMember?: (identitas: Identitas, discountPct: number) => void;
}

export const MembershipLoyaltyTab: React.FC<MembershipLoyaltyTabProps> = ({
  onOpenPOSForMember
}) => {
  const { identitasList, orders } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedProfileForCard, setSelectedProfileForCard] = useState<MemberLoyaltyProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Compute loyalty profiles for all registered members
  const memberProfiles: MemberLoyaltyProfile[] = useMemo(() => {
    return identitasList.map(member => computeMemberLoyaltyProfile(member, orders));
  }, [identitasList, orders]);

  // Filtered members list
  const filteredProfiles = useMemo(() => {
    return memberProfiles.filter(p => {
      const matchSearch =
        p.identitas.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.identitas.panggilan && p.identitas.panggilan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.identitas.nomor_hp_primary && p.identitas.nomor_hp_primary.includes(searchQuery)) ||
        p.memberCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTier = tierFilter === 'all' || p.tier.level === tierFilter;
      return matchSearch && matchTier;
    });
  }, [memberProfiles, searchQuery, tierFilter]);

  // Aggregate Community Metrics
  const metrics = useMemo(() => {
    const totalMembers = memberProfiles.length;
    const totalAkumulasiAll = memberProfiles.reduce((sum, p) => sum + p.totalAkumulasi, 0);
    const countBronze = memberProfiles.filter(p => p.tier.level === 'Bronze').length;
    const countSilver = memberProfiles.filter(p => p.tier.level === 'Silver').length;
    const countGold = memberProfiles.filter(p => p.tier.level === 'Gold').length;
    const countPlatinum = memberProfiles.filter(p => p.tier.level === 'Platinum').length;

    // Top patron
    const sorted = [...memberProfiles].sort((a, b) => b.totalAkumulasi - a.totalAkumulasi);
    const topPatron = sorted[0];

    return {
      totalMembers,
      totalAkumulasiAll,
      countBronze,
      countSilver,
      countGold,
      countPlatinum,
      topPatron
    };
  }, [memberProfiles]);

  // Send WhatsApp loyalty notification
  const handleSendWhatsApp = (profile: MemberLoyaltyProfile) => {
    if (!profile.identitas.nomor_hp_primary) {
      showToast('Nomor WhatsApp anggota tidak tercatat.');
      return;
    }
    const cleanPhone = profile.identitas.nomor_hp_primary.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const msg = generateMemberWhatsAppMessage(profile);
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank');
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

      {/* Hero Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900 via-yellow-900 to-slate-900 p-6 sm:p-8 text-white shadow-lg border border-amber-800/40">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Program Apresiasi Pembaca & Komunitas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Sahabat Lamrimnesia (Membership & Loyalty Tier)
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed">
            Sistem pengakuan dan apresiasi otomatis bagi para pembaca setia pustaka Dharma, donatur cetak, dan sukarelawan penyebar kebajikan dengan tingkatan keanggotaan dan hak diskon khusus.
          </p>
        </div>

        {/* Decorative Badge Background */}
        <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none hidden md:block">
          <Crown className="w-64 h-64 text-amber-300" />
        </div>
      </div>

      {/* 4 Membership Tiers Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MEMBERSHIP_TIERS.map(tier => {
          const countInTier =
            tier.level === 'Bronze' ? metrics.countBronze :
            tier.level === 'Silver' ? metrics.countSilver :
            tier.level === 'Gold' ? metrics.countGold : metrics.countPlatinum;

          const icon =
            tier.level === 'Bronze' ? <Shield className="w-5 h-5 text-amber-500" /> :
            tier.level === 'Silver' ? <Star className="w-5 h-5 text-slate-400" /> :
            tier.level === 'Gold' ? <Award className="w-5 h-5 text-yellow-500" /> :
            <Crown className="w-5 h-5 text-purple-400" />;

          return (
            <div
              key={tier.level}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                    {icon}
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${tier.warna_badge}`}>
                    DISKON {tier.diskon_persen}%
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {tier.nama_tier}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tier.min_akumulasi === 0
                      ? 'Anggota baru & pemesanan awal'
                      : `Akumulasi belanja ≥ Rp ${formatNumberWithDots(tier.min_akumulasi)}`}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Hak Istimewa:
                  </span>
                  {tier.keuntungan.map((privilege, i) => (
                    <div key={i} className="flex items-start space-x-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{privilege}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Jumlah Sahabat:</span>
                <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  {countInTier} Anggota
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Aggregate Community Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Sahabat Terdaftar</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {metrics.totalMembers} <span className="text-xs font-normal text-slate-500">orang</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Kontribusi Belanja & Donasi</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            Rp {formatNumberWithDots(metrics.totalAkumulasiAll)}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Top Patron Komunitas</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {metrics.topPatron?.identitas.nama_lengkap || '-'}
          </div>
          <div className="text-xs text-amber-600 dark:text-amber-400 font-bold">
            Rp {formatNumberWithDots(metrics.topPatron?.totalAkumulasi || 0)}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, No. Sahabat, HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="all">Semua Tier</option>
            <option value="Bronze">Sahabat Perunggu (Bronze)</option>
            <option value="Silver">Sahabat Perak (Silver)</option>
            <option value="Gold">Sahabat Emas (Gold)</option>
            <option value="Platinum">Patron Mahadana (Platinum)</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Menampilkan <b>{filteredProfiles.length}</b> dari {memberProfiles.length} sahabat
        </div>
      </div>

      {/* Member Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">No. Member & Nama Sahabat</th>
                <th className="py-3 px-4">Tier & Diskon</th>
                <th className="py-3 px-4">Total Belanja & Donasi</th>
                <th className="py-3 px-4">Progress Naik Tier</th>
                <th className="py-3 px-4 text-center">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProfiles.map(profile => {
                return (
                  <tr
                    key={profile.identitas.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Member Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          {profile.identitas.nama_lengkap.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{profile.identitas.nama_lengkap}</span>
                            {profile.identitas.bhante_lay === 'Bhante' && (
                              <span className="text-[9px] px-1 bg-amber-100 text-amber-800 rounded font-bold">Sangha</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                            <span>{profile.memberCode}</span>
                            <span>•</span>
                            <span>{profile.identitas.nomor_hp_primary || 'Tanpa HP'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tier Badge */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${profile.tier.warna_badge}`}>
                        <span>● {profile.tier.nama_tier}</span>
                        <span>({profile.tier.diskon_persen}%)</span>
                      </span>
                    </td>

                    {/* Total Accumulation */}
                    <td className="py-3 px-4">
                      <div className="font-black text-slate-900 dark:text-white">
                        Rp {formatNumberWithDots(profile.totalAkumulasi)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {profile.orderCount} transaksi {profile.totalDonasi > 0 && `(Donasi: Rp ${formatNumberWithDots(profile.totalDonasi)})`}
                      </div>
                    </td>

                    {/* Progress to Next Tier */}
                    <td className="py-3 px-4 min-w-[200px]">
                      {profile.nextTier ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Ke <b>{profile.nextTier.nama_tier}</b></span>
                            <span className="font-bold text-amber-600">{profile.progressPercent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                              style={{ width: `${profile.progressPercent}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Kurang Rp {formatNumberWithDots(profile.nominalToNextTier)}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                          <Crown className="w-3.5 h-3.5" />
                          <span>Tier Tertinggi (Patron Mahadana)</span>
                        </div>
                      )}
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => setSelectedProfileForCard(profile)}
                          title="Lihat Kartu Digital"
                          className="p-1.5 text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleSendWhatsApp(profile)}
                          title="Kirim Status Loyalitas via WhatsApp"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (onOpenPOSForMember) {
                              onOpenPOSForMember(profile.identitas, profile.tier.diskon_persen);
                            } else {
                              showToast(`Diskon ${profile.tier.diskon_persen}% siap digunakan di kasir POS untuk ${profile.identitas.nama_lengkap}`);
                            }
                          }}
                          title="Buka Kasir POS dengan Diskon Anggota"
                          className="p-1.5 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredProfiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Tidak ada data sahabat yang cocok dengan kata kunci atau filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: KARTU ANGGOTA DIGITAL VIP                         */}
      {/* ======================================================== */}
      {selectedProfileForCard && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kartu Digital Sahabat Lamrimnesia
                </h3>
              </div>
              <button
                onClick={() => setSelectedProfileForCard(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            {/* THE DIGITAL VIP CARD DESIGN */}
            <div
              className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-2xl border aspect-[1.586/1] flex flex-col justify-between bg-gradient-to-tr ${selectedProfileForCard.tier.bg_gradient}`}
              style={{
                boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
              }}
            >
              {/* Shine / Holographic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none" />

              {/* Top Row: Brand & Tier Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-amber-300 block">
                    YAYASAN PENERBITAN
                  </span>
                  <h4 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>LAMRIMNESIA</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h4>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-black text-white">
                  {selectedProfileForCard.tier.nama_tier.toUpperCase()}
                </div>
              </div>

              {/* Golden Smart Card Chip & NFC */}
              <div className="relative z-10 my-auto flex items-center space-x-3">
                <div className="w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-1 border border-yellow-200/50 shadow-inner flex flex-col justify-between">
                  <div className="w-full h-0.5 bg-amber-800/30 rounded" />
                  <div className="w-full h-0.5 bg-amber-800/30 rounded" />
                  <div className="w-full h-0.5 bg-amber-800/30 rounded" />
                </div>
                <div className="text-[10px] text-white/70 font-mono tracking-wider">
                  DISCOUNT PRIVILEGE: <b>{selectedProfileForCard.tier.diskon_persen}% OFF</b>
                </div>
              </div>

              {/* Bottom Row: Member Info & Code */}
              <div className="relative z-10 space-y-1">
                <div className="text-base font-black tracking-wide text-white uppercase drop-shadow">
                  {selectedProfileForCard.identitas.nama_lengkap}
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-white/80">
                  <span>{selectedProfileForCard.memberCode}</span>
                  <span className="text-[10px] tracking-widest text-amber-300 font-sans font-bold">
                    VALID LIFETIME
                  </span>
                </div>
              </div>
            </div>

            {/* Privilege Highlights */}
            <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Hak Istimewa {selectedProfileForCard.tier.nama_tier}:
              </span>
              {selectedProfileForCard.tier.keuntungan.map((k, i) => (
                <div key={i} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{k}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => handleSendWhatsApp(selectedProfileForCard)}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Kirim Kartu ke WA</span>
              </button>

              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Cetak</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
