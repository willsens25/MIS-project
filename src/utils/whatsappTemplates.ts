import { Order, Identitas } from '../types';

export interface WhatsAppTemplate {
  id: string;
  nama: string;
  kategori: 'transaksional' | 'pengingat' | 'pengiriman' | 'crm';
  deskripsi: string;
  defaultText: string;
}

/**
 * Format nomor telepon Indonesia ke format internasional (E.164 tanpa tanda +)
 * Contoh: '0812-3456-7890' -> '6281234567890'
 */
export function formatIndonesianPhone(phone: string): string {
  if (!phone) return '';
  // Bersihkan karakter non-digit
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  } else if (cleaned.startsWith('62')) {
    // sudah diawali 62
  }
  return cleaned;
}

/**
 * Validasi apakah nomor HP valid untuk WhatsApp
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  const formatted = formatIndonesianPhone(phone);
  return formatted.length >= 10 && formatted.length <= 15 && formatted.startsWith('62');
}

/**
 * Bangun URL wa.me
 */
export function buildWhatsAppLink(phone: string, text: string): string {
  const formattedPhone = formatIndonesianPhone(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

export const YAYASAN_BANK_INFO = `BCA 123-456-7890 a.n. Yayasan Dharma Patriot (MIS Lamrimnesia)`;

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tagihan_pending',
    nama: '1. Konfirmasi Pesanan & Instruksi Pembayaran',
    kategori: 'transaksional',
    deskripsi: 'Pemberitahuan invoice baru dengan rincian total tagihan dan nomor rekening transfer.',
    defaultText: `Halo Kak *{nama_pembeli}*, salam hangat dari Yayasan Dharma Patriot (Lamrimnesia) 🙏

Terima kasih atas pemesanan buku karya Dharma. Berikut rincian pesanan Anda:

📄 *No. Invoice:* #{no_invoice}
📅 *Tanggal:* {tanggal_pesan}
📚 *Buku yang Dipesan:*
{daftar_buku}

💰 *Subtotal & Ongkir:* Rp {total_tagihan}
📦 *Ekspedisi:* {ekspedisi}
📍 *Alamat Pengiriman:* {alamat_penerima}

Silakan lakukan pembayaran ke rekening resmi yayasan:
💳 *{rekening_bank}*

Setelah transfer, mohon kirimkan foto bukti pembayaran ke nomor ini ya Kak. Pesanan akan langsung kami siapkan untuk dikemas. Terima kasih banyak atas dukungan kebajikan Anda! 🙏✨`
  },
  {
    id: 'pengingat_ramah',
    nama: '2. Pengingat Pembayaran Santun (Reminder Tagihan)',
    kategori: 'pengingat',
    deskripsi: 'Pengingat ramah untuk pesanan berstatus Pending yang belum dibayar.',
    defaultText: `Namo Buddhaya, Halo Kak *{nama_pembeli}* 🙏

Semoga hari Kakak senantiasa dipenuhi ketenangan dan sukacita.

Kami ingin mengingatkan secara ramah mengenai pesanan buku dengan *Invoice #{no_invoice}* sebesar *Rp {total_tagihan}* yang masih menunggu penyelesaian pembayaran.

Rincian pesanan:
{daftar_buku}

Pembayaran dapat disalurkan melalui:
💳 *{rekening_bank}*

Apabila Kakak sudah melakukan transfer atau membutuhkan penyesuaian pesanan, silakan kabari kami ya Kak. Kami siap membantu dengan senang hati. Terima kasih banyak! 🙏🌸`
  },
  {
    id: 'lunas_packing',
    nama: '3. Konfirmasi Lunas & Persiapan Pengemasan',
    kategori: 'transaksional',
    deskripsi: 'Notifikasi pembayaran berhasil diverifikasi dan buku sedang dikemas di gudang.',
    defaultText: `Halo Kak *{nama_pembeli}*, kabar baik! 🎉

Pembayaran untuk *Invoice #{no_invoice}* sebesar *Rp {total_tagihan}* telah kami terima dan verifikasi dengan baik.

Saat ini tim Logistik & Gudang Lamrimnesia sedang menyiapkan serta mengemas paket buku Anda dengan rapi dan aman.

Kami akan segera mengabarkan nomor resi pengiriman setelah paket diserahkan ke pihak ekspedisi *{ekspedisi}*. 

Semoga buku-buku Dharma yang dipesan membawa banyak berkah, inspirasi, dan pencerahan bagi Kakak sekeluarga. Terima kasih atas ketulusan Anda! 🙏✨`
  },
  {
    id: 'resi_pengiriman',
    nama: '4. Notifikasi Resi & Keberangkatan Paket',
    kategori: 'pengiriman',
    deskripsi: 'Pemberitahuan paket telah dikirim beserta ekspedisi dan nomor resi pengiriman.',
    defaultText: `Halo Kak *{nama_pembeli}*, pesanan Anda telah dalam perjalanan! 🚚📦

Pesanan *Invoice #{no_invoice}* telah resmi diserahkan ke pihak ekspedisi:

📦 *Kurir Ekspedisi:* {ekspedisi}
🔖 *Nomor Resi:* *{nomor_resi}*
📍 *Penerima:* {nama_penerima}
🏠 *Alamat Tujuan:* {alamat_penerima}

Kakak dapat memantau perjalanan paket melalui aplikasi atau website resmi ekspedisi terkait. Jika paket sudah tiba, mohon kesediaannya untuk mengabari kami ya Kak.

Selamat membaca dan semoga bermanfaat bagi batin! 🙏🌸`
  },
  {
    id: 'crm_ucapan_terima_kasih',
    nama: '5. Ucapan Terima Kasih & Ulasan Buku (Purna Jual)',
    kategori: 'crm',
    deskripsi: 'Menjalin silaturahmi hangat setelah pesanan diterima dan menanyakan masukan.',
    defaultText: `Namo Buddhaya, Halo Kak *{nama_pembeli}* 🙏

Semoga buku-buku Dharma dari Lamrimnesia telah tiba dengan selamat dan menemani hari-hari Kakak dengan damai.

Kami dari Yayasan Dharma Patriot mengucapkan anubhava dan terima kasih yang tulus atas kepercayaan serta donasi yang tersalurkan melalui pemesanan *#{no_invoice}*.

Bagaimana kesan atau pengalaman membaca buku tersebut sejauh ini, Kak? Masukan dari Kakak sangat berharga untuk perbaikan karya dan publikasi kami berikutnya.

Semoga Kakak dan keluarga senantiasa sehat, damai, dan berbahagia! 🙏🌺`
  },
  {
    id: 'broadcast_buku_baru',
    nama: '6. Info Publikasi Buku Baru & Promo Anggota',
    kategori: 'crm',
    deskripsi: 'Broadcast pengumuman karya buku terbitan baru atau program apresiasi pembaca.',
    defaultText: `Namo Buddhaya, Salam kebajikan untuk Kak *{nama_pembeli}* 🙏

Kabar gembira dari Penerbit Lamrimnesia! Kami baru saja menerbitkan seri naskah Dharma terbaru yang penuh inspirasi untuk praktik keseharian.

Sebagai bentuk apresiasi bagi sahabat setia pembaca, kami menyediakan potongan khusus untuk pesanan minggu ini.

Silakan hubungi kami untuk katalog terbaru atau pemesanan melalui WhatsApp ini.

Semoga berkah kebajikan senantiasa menyertai setiap langkah Kakak! 🙏✨`
  }
];

export interface WhatsAppLogItem {
  id: string;
  orderId?: number;
  invoiceNo?: string;
  pembeliName: string;
  phone: string;
  templateId: string;
  templateName: string;
  sentAt: string;
  status: 'Terkirim (WA Link Terbuka)' | 'Tersalin ke Clipboard';
}

/**
 * Gantikan tag-tag variabel dengan data aktual
 */
export function replaceWhatsAppVariables(
  templateText: string,
  params: {
    order?: Order | null;
    identitas?: Identitas | null;
    customPembeli?: string;
    customPhone?: string;
    customResi?: string;
  }
): string {
  const { order, identitas, customPembeli, customPhone, customResi } = params;

  let text = templateText;

  const namaPembeli = order?.nama_pembeli || identitas?.nama_lengkap || customPembeli || 'Pelanggan';
  const namaPenerima = order?.nama_penerima || namaPembeli;
  const noInvoice = order?.no_invoice || 'INV-DRAFT';
  const tanggalPesan = order?.tanggal_pesan || new Date().toISOString().substring(0, 10);
  const totalTagihan = order ? order.total_tagihan.toLocaleString('id-ID') : '0';
  const ekspedisi = order?.ekspedisi || 'JNE Reguler';
  const alamatPenerima = order?.alamat_penerima || identitas?.alamat || 'Alamat Penerima';
  const nomorResi = customResi || 'RESI-SEDANG-DIPROSES';

  let daftarBuku = '';
  if (order && order.items && order.items.length > 0) {
    daftarBuku = order.items.map((it, idx) => {
      const judul = it.book?.judul || `Buku ID #${it.buku_id}`;
      return `${idx + 1}. ${judul} (${it.jumlah} eks x Rp ${it.harga_satuan.toLocaleString('id-ID')})`;
    }).join('\n');
  } else {
    daftarBuku = '1. Buku Dharma Pilihan (1 eks)';
  }

  text = text.replace(/{nama_pembeli}/g, namaPembeli);
  text = text.replace(/{nama_penerima}/g, namaPenerima);
  text = text.replace(/{no_invoice}/g, noInvoice);
  text = text.replace(/{tanggal_pesan}/g, tanggalPesan);
  text = text.replace(/{total_tagihan}/g, totalTagihan);
  text = text.replace(/{ekspedisi}/g, ekspedisi);
  text = text.replace(/{alamat_penerima}/g, alamatPenerima);
  text = text.replace(/{daftar_buku}/g, daftarBuku);
  text = text.replace(/{rekening_bank}/g, YAYASAN_BANK_INFO);
  text = text.replace(/{nomor_resi}/g, nomorResi);

  return text;
}
