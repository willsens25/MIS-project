import { DocumentAttachment } from '../types';

/**
 * Format bytes to readable human-friendly size (e.g. 1.2 MB, 450 KB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formatted = (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0);
  return `${formatted} ${units[i] || 'B'}`;
}

/**
 * Get category badge styles
 */
export function getCategoryBadge(category: string): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Bukti Transaksi & Nota':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800'
      };
    case 'Draft Naskah & Editorial':
      return {
        bg: 'bg-violet-50 dark:bg-violet-950/60',
        text: 'text-violet-700 dark:text-violet-300',
        border: 'border-violet-200 dark:border-violet-800'
      };
    case 'Surat Jalan & Logistik':
      return {
        bg: 'bg-cyan-50 dark:bg-cyan-950/60',
        text: 'text-cyan-700 dark:text-cyan-300',
        border: 'border-cyan-200 dark:border-cyan-800'
      };
    case 'Notulensi & Berita Acara':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-950/60',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800'
      };
    case 'Kontrak & MoU':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800'
      };
    case 'Dokumen Tugas & TOR':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/60',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800'
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700'
      };
  }
}

/**
 * Triggers genuine browser file download for a DocumentAttachment
 */
export function downloadAttachment(attachment: DocumentAttachment): void {
  try {
    const filename = attachment.name || `dokumen-${attachment.id}`;
    if (attachment.fileData) {
      const a = document.createElement('a');
      a.href = attachment.fileData;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // If no direct data, generate a realistic text/markdown summary file for download
    const content = `========================================================================
ARSIP DOKUMEN DIGITAL MIS LAMRIMNESIA
========================================================================
Nama Dokumen   : ${attachment.name}
Nomor Referensi: ${attachment.referenceNumber || '-'}
Kategori       : ${attachment.category}
Divisi         : Divisi ID ${attachment.divisionId}
Diunggah Oleh  : ${attachment.uploadedBy}
Tanggal Unggah : ${attachment.uploadedAt}
Ukuran Berkas  : ${formatFileSize(attachment.size)}
Tipe Berkas    : ${attachment.type}
Keterangan     : ${attachment.description || '-'}
Entitas Terkait: ${attachment.relatedEntityType || '-'} (${attachment.relatedEntityId || '-'})
========================================================================
Yayasan Pelestarian & Pengembangan Lamrim Nusantara
SAPA-ALL MIS Project
========================================================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error('Gagal mengunduh berkas:', err);
  }
}

/**
 * Read browser File into DataURL and metadata
 */
export function readFileAsDataUrl(
  file: File
): Promise<{ dataUrl: string; size: number; name: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: reader.result as string,
        size: file.size,
        name: file.name,
        type: file.type || 'application/octet-stream'
      });
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to generate an SVG Receipt Data URL
 */
export function createSampleReceiptSvg(
  title: string,
  refNumber: string,
  amount: string,
  notes: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="600" height="800" fill="url(#grad)" rx="16" />
    <rect x="24" y="24" width="552" height="752" fill="#ffffff" rx="12" stroke="#cbd5e1" stroke-width="2" />
    
    <!-- Header -->
    <rect x="24" y="24" width="552" height="90" fill="#0f172a" rx="12" />
    <text x="50" y="65" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff">YAYASAN LAMRIMNESIA</text>
    <text x="50" y="88" font-family="sans-serif" font-size="12" fill="#94a3b8">BUKTI TRANSAKSI &amp; KEUANGAN RESMI</text>
    
    <!-- Title & Ref -->
    <text x="50" y="160" font-family="sans-serif" font-size="18" font-weight="bold" fill="#0f172a">${title}</text>
    <text x="50" y="185" font-family="monospace" font-size="13" fill="#64748b">No. Referensi: ${refNumber}</text>
    
    <!-- Divider -->
    <line x1="50" y1="210" x2="550" y2="210" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="6,6" />
    
    <!-- Nominal Box -->
    <rect x="50" y="235" width="500" height="90" fill="#ecfdf5" rx="10" stroke="#a7f3d0" stroke-width="2" />
    <text x="75" y="265" font-family="sans-serif" font-size="12" font-weight="bold" fill="#047857">TOTAL TRANSAKSI RESMI:</text>
    <text x="75" y="305" font-family="sans-serif" font-size="28" font-weight="extrabold" fill="#065f46">${amount}</text>
    
    <!-- Details -->
    <text x="50" y="365" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155">Rincian &amp; Keterangan:</text>
    <foreignObject x="50" y="380" width="500" height="140">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:sans-serif;font-size:13px;color:#475569;line-height:1.6;">
        ${notes}
      </div>
    </foreignObject>
    
    <!-- Verification Badge / Stamp -->
    <circle cx="470" cy="620" r="55" fill="none" stroke="#059669" stroke-width="3" stroke-dasharray="8,4" />
    <circle cx="470" cy="620" r="48" fill="none" stroke="#059669" stroke-width="1.5" />
    <text x="470" y="615" font-family="sans-serif" font-size="11" font-weight="bold" fill="#059669" text-anchor="middle">TERVERIFIKASI</text>
    <text x="470" y="632" font-family="sans-serif" font-size="9" font-weight="bold" fill="#059669" text-anchor="middle">BENDAHARA YAYASAN</text>
    
    <!-- Footer -->
    <line x1="50" y1="710" x2="550" y2="710" stroke="#e2e8f0" stroke-width="1.5" />
    <text x="50" y="740" font-family="sans-serif" font-size="11" fill="#94a3b8">Dokumen ini diterbitkan secara sah oleh Sistem Manajemen Informasi (MIS) Lamrimnesia.</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Helper to generate an SVG Manuscript / Document Preview
 */
export function createSampleDocumentSvg(
  docTitle: string,
  docSub: string,
  divisionName: string,
  excerpt: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
    <rect width="600" height="800" fill="#f8fafc" rx="16" />
    <rect x="24" y="24" width="552" height="752" fill="#ffffff" rx="12" stroke="#e2e8f0" stroke-width="2" />
    
    <!-- Division Ribbon -->
    <rect x="50" y="50" width="160" height="26" fill="#ede9fe" rx="6" />
    <text x="62" y="68" font-family="sans-serif" font-size="11" font-weight="bold" fill="#6d28d9">${divisionName.toUpperCase()}</text>
    
    <!-- Title -->
    <text x="50" y="120" font-family="serif" font-size="22" font-weight="bold" fill="#1e1b4b">${docTitle}</text>
    <text x="50" y="145" font-family="sans-serif" font-size="13" fill="#6b7280">${docSub}</text>
    
    <line x1="50" y1="170" x2="550" y2="170" stroke="#cbd5e1" stroke-width="1.5" />
    
    <!-- Content preview -->
    <foreignObject x="50" y="195" width="500" height="480">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:serif;font-size:14px;color:#334155;line-height:1.8;text-align:justify;">
        <p style="margin-top:0;"><strong>Ringkasan Dokumen:</strong></p>
        <p>${excerpt}</p>
        <div style="margin-top:24px;padding:14px;background:#f1f5f9;border-left:4px solid #6366f1;border-radius:4px;font-family:sans-serif;font-size:12px;color:#475569;">
          <strong>Catatan Kurasi Editorial:</strong> Seluruh kutipan naskah klasik telah dicocokkan dengan edisi Kangyur dan Tengyur. Tata letak telah disesuaikan dengan pedoman cetak Penerbitan Lamrimnesia.
        </div>
      </div>
    </foreignObject>
    
    <!-- Bottom seal -->
    <line x1="50" y1="710" x2="550" y2="710" stroke="#e2e8f0" stroke-width="1.5" />
    <text x="50" y="740" font-family="sans-serif" font-size="11" fill="#94a3b8">Arsip Resmi Naskah &amp; Dokumen Editorial Lamrimnesia</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
