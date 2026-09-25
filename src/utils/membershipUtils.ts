import { Identitas, Order, MembershipTierConfig, MembershipTierLevel } from '../types';
import { MEMBERSHIP_TIERS } from '../lib/initialData';

export interface MemberLoyaltyProfile {
  identitas: Identitas;
  memberCode: string;
  totalBelanja: number;
  totalDonasi: number;
  totalAkumulasi: number;
  orderCount: number;
  lastOrderDate?: string;
  tier: MembershipTierConfig;
  nextTier?: MembershipTierConfig;
  nominalToNextTier: number;
  progressPercent: number;
}

/**
 * Get tier configuration by level
 */
export function getTierConfig(level: MembershipTierLevel): MembershipTierConfig {
  return MEMBERSHIP_TIERS.find(t => t.level === level) || MEMBERSHIP_TIERS[0];
}

/**
 * Determine tier based on total accumulated spend + donations
 */
export function determineTier(totalAkumulasi: number): MembershipTierConfig {
  if (totalAkumulasi >= 10000000) {
    return getTierConfig('Platinum');
  }
  if (totalAkumulasi >= 2500000) {
    return getTierConfig('Gold');
  }
  if (totalAkumulasi >= 500000) {
    return getTierConfig('Silver');
  }
  return getTierConfig('Bronze');
}

/**
 * Determine next tier and calculation to reach it
 */
export function getNextTierInfo(totalAkumulasi: number, currentTier: MembershipTierConfig): {
  nextTier?: MembershipTierConfig;
  nominalToNextTier: number;
  progressPercent: number;
} {
  if (currentTier.level === 'Platinum') {
    return {
      nextTier: undefined,
      nominalToNextTier: 0,
      progressPercent: 100
    };
  }

  const tierOrder: MembershipTierLevel[] = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const currentIndex = tierOrder.indexOf(currentTier.level);
  const nextLevel = tierOrder[currentIndex + 1];
  const nextTier = getTierConfig(nextLevel);

  const prevMin = currentTier.min_akumulasi;
  const targetMin = nextTier.min_akumulasi;
  const nominalToNext = Math.max(0, targetMin - totalAkumulasi);

  const range = targetMin - prevMin;
  const currentInRange = Math.max(0, totalAkumulasi - prevMin);
  const percent = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));

  return {
    nextTier,
    nominalToNextTier: nominalToNext,
    progressPercent: percent
  };
}

/**
 * Generate standardized member code (e.g. SLM-0042)
 */
export function generateMemberCode(identitasId: number): string {
  return `SLM-${identitasId.toString().padStart(4, '0')}`;
}

/**
 * Compute loyalty profile for a given identity from the orders list
 */
export function computeMemberLoyaltyProfile(
  identitas: Identitas,
  orders: Order[]
): MemberLoyaltyProfile {
  // Normalize comparison values
  const id = identitas.id;
  const normName = identitas.nama_lengkap.trim().toLowerCase();
  const cleanPhone = (identitas.nomor_hp_primary || '').replace(/\D/g, '');

  const memberOrders = orders.filter(ord => {
    if (ord.status === 'Cancelled') return false;

    // Match by explicit identitas ID
    if (ord.pembeli_identitas_id && ord.pembeli_identitas_id === id) return true;

    // Match by customer phone if exists
    if (cleanPhone && ord.kontak_pembeli) {
      const ordPhone = ord.kontak_pembeli.replace(/\D/g, '');
      if (ordPhone && (ordPhone === cleanPhone || (ordPhone.length >= 8 && cleanPhone.endsWith(ordPhone.slice(-8))))) {
        return true;
      }
    }

    // Match by customer full name
    if (ord.nama_pembeli && ord.nama_pembeli.trim().toLowerCase() === normName) {
      return true;
    }

    return false;
  });

  let totalBelanja = 0;
  let totalDonasi = 0;
  let latestDate: string | undefined = undefined;

  for (const ord of memberOrders) {
    // If order has items, sum items subtotal minus item discounts
    if (ord.items && ord.items.length > 0) {
      const itemsTotal = ord.items.reduce((sum, it) => sum + (it.subtotal || 0), 0);
      totalBelanja += itemsTotal;
    } else {
      totalBelanja += Math.max(0, ord.total_tagihan - (ord.ongkir || 0) - (ord.donasi || 0));
    }

    if (ord.donasi && ord.donasi > 0) {
      totalDonasi += ord.donasi;
    }

    if (!latestDate || ord.tanggal_pesan > latestDate) {
      latestDate = ord.tanggal_pesan;
    }
  }

  const totalAkumulasi = totalBelanja + totalDonasi;
  const tier = determineTier(totalAkumulasi);
  const { nextTier, nominalToNextTier, progressPercent } = getNextTierInfo(totalAkumulasi, tier);

  return {
    identitas,
    memberCode: generateMemberCode(identitas.id),
    totalBelanja,
    totalDonasi,
    totalAkumulasi,
    orderCount: memberOrders.length,
    lastOrderDate: latestDate,
    tier,
    nextTier,
    nominalToNextTier,
    progressPercent
  };
}

/**
 * Generate personalized WhatsApp appreciation & promo message based on member tier
 */
export function generateMemberWhatsAppMessage(profile: MemberLoyaltyProfile): string {
  const { identitas, memberCode, tier, totalAkumulasi, nextTier, nominalToNextTier } = profile;
  const honorific = identitas.bhante_lay === 'Bhante' ? 'Bhante' : identitas.bhante_lay === 'Ayya' ? 'Ayya' : 'Bapak/Ibu';
  const name = identitas.panggilan || identitas.nama_lengkap;

  let msg = `Namo Buddhaya, ${honorific} ${name},\n\n`;
  msg += `Terima kasih atas jalinan jodoh baik dan dukungan ${honorific} terhadap penyebaran pustaka Dharma bersama Yayasan Penerbitan Lamrimnesia.\n\n`;
  msg += `Berikut status keanggotaan Sahabat Lamrimnesia Anda:\n`;
  msg += `🏷️ *Nomor Anggota:* ${memberCode}\n`;
  msg += `🎖️ *Tier Keanggotaan:* ${tier.nama_tier} (${tier.diskon_persen}% Diskon)\n`;
  msg += `💎 *Total Akumulasi Pembaca & Donasi:* Rp ${totalAkumulasi.toLocaleString('id-ID')}\n\n`;

  msg += `*Keistimewaan Tier Anda:*\n`;
  tier.keuntungan.forEach(k => {
    msg += `• ${k}\n`;
  });

  if (nextTier) {
    msg += `\n✨ *Peluang Naik Tier:*\n`;
    msg += `Cukup belanja / berdonasi Rp ${nominalToNextTier.toLocaleString('id-ID')} lagi untuk naik ke *${nextTier.nama_tier}* dengan hak diskon ${nextTier.diskon_persen}%!\n`;
  }

  msg += `\nSemoga kebajikan ini membawa kebahagiaan dan kemajuan batin. Salam hangat dari seluruh staf & relawan Lamrimnesia. 🙏`;

  return msg;
}
