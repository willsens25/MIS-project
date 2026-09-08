import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

/**
 * Utility for standalone document printing and downloading.
 * Supports:
 * 1. Direct PDF (.pdf) generation and download using html2canvas & jsPDF.
 * 2. Isolated iframe printing (with fallback to direct PDF if blocked by iframe sandbox).
 * 3. Standalone HTML download (offline viewable, printable, 100% styled).
 * 4. Microsoft Word (.doc) download.
 */

const getDocumentStyles = () => `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #0f172a;
    background: #ffffff;
    padding: 24px;
    font-size: 12px;
    line-height: 1.5;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  @page {
    size: A4 portrait;
    margin: 12mm;
  }

  .print-action-bar {
    position: sticky;
    top: 0;
    background: #0f172a;
    color: #ffffff;
    padding: 12px 20px;
    margin: -24px -24px 24px -24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
  }

  .print-action-btn {
    background: #d97706;
    color: white;
    border: none;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }

  .print-action-btn:hover {
    background: #b45309;
  }

  @media print {
    .print-action-bar, .no-print, .print\\:hidden {
      display: none !important;
    }
    body {
      padding: 0 !important;
      margin: 0 !important;
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 8px 10px;
  }

  /* Utility helper styling matching Tailwind */
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  .p-2 { padding: 8px; }
  .p-3 { padding: 12px; }
  .p-4 { padding: 16px; }
  .p-6 { padding: 24px; }
  .rounded-xl { border-radius: 12px; }
  .rounded-2xl { border-radius: 16px; }
  .border { border: 1px solid #e2e8f0; }
  .border-b { border-bottom: 1px solid #e2e8f0; }
  .border-b-2 { border-bottom: 2px solid #0f172a; }
  .border-t-2 { border-top: 2px solid #0f172a; }
  .bg-slate-50 { background-color: #f8fafc; }
  .bg-slate-100 { background-color: #f1f5f9; }
  .bg-amber-50 { background-color: #fffbeb; }
  .text-emerald-700 { color: #047857; }
  .text-rose-700 { color: #be123c; }
  .text-indigo-700 { color: #4338ca; }
  .text-amber-700 { color: #b45309; }
  .font-bold { font-weight: 700; }
  .font-extrabold { font-weight: 800; }
  .font-mono { font-family: monospace; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
`;

/**
 * Direct PDF Generator using html2canvas and jsPDF.
 * Automatically slices multi-page documents into clean A4 sheets.
 * Works 100% reliably inside sandboxed iframes without relying on browser print dialogs.
 */
export const downloadDocumentAsPdf = async (
  elementId: string,
  filename: string,
  onStatus?: (status: string) => void
): Promise<boolean> => {
  const elem = document.getElementById(elementId);
  if (!elem) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  try {
    if (onStatus) onStatus('Menyiapkan tata letak dokumen PDF...');

    // High quality rasterization
    const canvas = await html2canvas(elem, {
      scale: 2, // 2x DPI for crisp text and tables
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: elem.scrollWidth || 950,
    });

    if (onStatus) onStatus('Menyusun halaman PDF A4...');

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    const imgData = canvas.toDataURL('image/jpeg', 0.96);
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Add subsequent pages if document is longer than single A4 page
    while (heightLeft > 5) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
    if (onStatus) onStatus('File PDF berhasil disimpan!');
    return true;
  } catch (err) {
    console.error('Failed to generate direct PDF:', err);
    if (onStatus) onStatus('Gagal membuat PDF.');
    return false;
  }
};

/**
 * Triggers clean print of a specific DOM element using a hidden iframe.
 * If iframe printing fails or is blocked by sandbox policy, automatically falls back to downloadDocumentAsPdf.
 */
export const printElement = (elementId: string, docTitle?: string, fallbackFilename?: string) => {
  const elem = document.getElementById(elementId);
  if (!elem) {
    try {
      window.print();
    } catch {
      // ignore
    }
    return;
  }

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      try {
        window.print();
      } catch {
        downloadDocumentAsPdf(elementId, fallbackFilename || 'Dokumen_Dharma_Patriot');
      }
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>${docTitle || 'Dokumen Resmi Yayasan Dharma Patriot'}</title>
          <style>
            ${getDocumentStyles()}
          </style>
        </head>
        <body>
          ${elem.outerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed or blocked, falling back to direct PDF download', err);
        downloadDocumentAsPdf(elementId, fallbackFilename || 'Dokumen_Dharma_Patriot');
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 300);
  } catch (e) {
    console.warn('Print helper error, downloading PDF directly', e);
    downloadDocumentAsPdf(elementId, fallbackFilename || 'Dokumen_Dharma_Patriot');
  }
};

/**
 * Downloads the document element as a standalone, styled HTML file.
 * The file includes an interactive print button and full CSS formatting.
 */
export const downloadDocumentAsHtml = (elementId: string, filename: string, docTitle?: string) => {
  const elem = document.getElementById(elementId);
  if (!elem) return;

  const title = docTitle || 'Dokumen Resmi Yayasan Dharma Patriot';
  const cleanFilename = filename.endsWith('.html') ? filename : `${filename}.html`;

  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${getDocumentStyles()}
  </style>
</head>
<body>
  <div class="print-action-bar">
    <div style="font-weight: 600; font-size: 13px;">
      📄 ${title}
    </div>
    <div style="display: flex; gap: 10px; align-items: center;">
      <button class="print-action-btn" onclick="window.print()">
        🖨️ Cetak Dokumen / Simpan PDF
      </button>
    </div>
  </div>

  <div style="max-width: 900px; margin: 0 auto;">
    ${elem.innerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads document as Word (.doc) compatible HTML.
 */
export const downloadDocumentAsWord = (elementId: string, filename: string, docTitle?: string) => {
  const elem = document.getElementById(elementId);
  if (!elem) return;

  const title = docTitle || 'Dokumen Resmi Yayasan Dharma Patriot';
  const cleanFilename = filename.endsWith('.doc') ? filename : `${filename}.doc`;

  const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
  <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
  </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      color: #0f172a;
      line-height: 1.4;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6pt 8pt;
      font-size: 10pt;
    }
    th {
      background-color: #f1f5f9;
      font-weight: bold;
    }
    h1 { font-size: 18pt; font-weight: bold; margin-bottom: 4pt; }
    h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
    h3 { font-size: 12pt; font-weight: bold; margin-top: 10pt; margin-bottom: 4pt; }
    p { margin-bottom: 6pt; }
  </style>
</head>
<body>
  ${elem.innerHTML}
</body>
</html>`;

  const blob = new Blob(['\ufeff', wordHtml], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
