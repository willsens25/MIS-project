import { downloadDocumentAsPdf } from './documentExport';

/**
 * Options for exporting cloned DOM content to PDF Print dialog.
 */
export interface ExportClonedPdfOptions {
  /**
   * The DOM ID of the container to clone.
   * Defaults to 'printable-area'.
   */
  targetElementId?: string;

  /**
   * Document title displayed on the print dialog / exported PDF.
   */
  documentTitle?: string;

  /**
   * Filename if fallback direct PDF download is invoked.
   */
  filename?: string;

  /**
   * Optional callback when export starts or finishes.
   */
  onStatus?: (status: string) => void;
}

/**
 * Clones the #printable-area content, applies the `pdf-export-mode` CSS class for styling,
 * and triggers a print dialog specifically for that cloned content using an isolated print frame.
 */
export const exportClonedContentToPdf = (options?: ExportClonedPdfOptions): boolean => {
  const targetId = options?.targetElementId || 'printable-area';
  const docTitle = options?.documentTitle || 'Laporan Resmi SAPA-ALL MIS - Yayasan Lamrimnesia';
  const filename = options?.filename || `Laporan_MIS_${new Date().toISOString().substring(0, 10)}`;

  const sourceElem = document.getElementById(targetId);
  if (!sourceElem) {
    console.warn(`Target element #${targetId} not found for PDF export.`);
    return false;
  }

  try {
    options?.onStatus?.('Menyiapkan kloning konten dan menerapkan kelas pdf-export-mode...');

    // 1. Clone the #printable-area content
    const clonedNode = sourceElem.cloneNode(true) as HTMLElement;

    // 2. Apply the `pdf-export-mode` CSS class
    clonedNode.classList.add('pdf-export-mode');

    // Remove interactive buttons, search inputs, dropdowns, and widgets from the cloned DOM
    clonedNode
      .querySelectorAll(
        'button:not(.print-include), input[type="text"], input[type="search"], select, textarea, .print\\:hidden, .no-print, .no-export, [data-rgl-widget-workspace="true"]'
      )
      .forEach((el) => {
        // If it's the official print header, keep it visible!
        if (el.classList.contains('hidden') && el.classList.contains('print:block')) {
          el.classList.remove('hidden');
          (el as HTMLElement).style.display = 'block';
          return;
        }
        el.remove();
      });

    // Ensure all print headers inside the clone are explicitly displayed
    clonedNode.querySelectorAll<HTMLElement>('.print-report-header, .print\\:block').forEach((el) => {
      el.classList.remove('hidden');
      el.style.display = 'block';
    });

    // Neutralize any constrained overflows and fix table widths
    clonedNode.querySelectorAll<HTMLElement>('.overflow-x-auto, .overflow-hidden, .overflow-y-auto').forEach((el) => {
      el.style.overflow = 'visible';
      el.style.width = '100%';
      el.style.maxWidth = '100%';
      el.style.border = 'none';
    });

    clonedNode.querySelectorAll<HTMLElement>('table').forEach((tbl) => {
      tbl.style.width = '100%';
      tbl.style.minWidth = '100%';
      tbl.style.maxWidth = '100%';
      tbl.style.tableLayout = 'auto';
      tbl.style.borderCollapse = 'collapse';
    });

    // 3. Extract all page stylesheets and Tailwind link tags to inject into the isolated iframe
    const styleTags: string[] = [];
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      styleTags.push((link as HTMLLinkElement).outerHTML);
    });
    document.querySelectorAll('style').forEach((style) => {
      styleTags.push(style.outerHTML);
    });

    // 4. Create an isolated hidden iframe specifically to host the cloned content
    const iframe = document.createElement('iframe');
    iframe.id = 'isolated-pdf-export-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-9999';

    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      // Fallback
      downloadDocumentAsPdf(targetId, filename);
      return false;
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="id" class="pdf-export-mode">
        <head>
          <meta charset="utf-8">
          <title>${docTitle}</title>
          ${styleTags.join('\n')}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 12mm 12mm;
            }
            html, body {
              background-color: #ffffff !important;
              color: #0f172a !important;
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif !important;
              font-size: 10pt !important;
              line-height: 1.4 !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .pdf-export-mode-wrapper {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          </style>
        </head>
        <body class="pdf-export-mode">
          <div class="pdf-export-mode pdf-export-mode-wrapper">
            ${clonedNode.outerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    options?.onStatus?.('Membuka dialog cetak PDF untuk konten terkloning...');

    // 5. Trigger the print dialog specifically for that cloned content
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print dialog failed, falling back to direct PDF download', err);
        downloadDocumentAsPdf(targetId, filename);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }
    }, 400);

    return true;
  } catch (error) {
    console.error('Error during exportClonedContentToPdf:', error);
    // Ultimate fallback to direct PDF file download
    downloadDocumentAsPdf(targetId, filename);
    return false;
  }
};
