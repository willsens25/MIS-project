import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface ExportPdfOptions {
  /**
   * The DOM ID of the container to export.
   * Defaults to 'printable-area'.
   */
  targetElementId?: string;

  /**
   * Output filename (with or without .pdf).
   * E.g. 'laporan_keuangan_mutasi_2026-09-15.pdf'
   */
  filename?: string;

  /**
   * Document title used for metadata / headers.
   */
  documentTitle?: string;

  /**
   * Page orientation:
   * 'landscape' is optimal for multi-column tables.
   * 'portrait' is suitable for document pages.
   * 'auto' selects orientation based on table aspect ratio.
   * Default is 'landscape'.
   */
  orientation?: 'landscape' | 'portrait' | 'auto';

  /**
   * Callback for progress tracking.
   */
  onProgress?: (status: string) => void;
}

/**
 * Generates and downloads a PDF file directly from the current DOM table view,
 * maintaining the EXACT styling rules defined for printing (official header,
 * clean white background, table formatting, hiding action buttons/checkboxes).
 */
export const exportCurrentViewToPdf = async (
  options: ExportPdfOptions = {}
): Promise<boolean> => {
  const {
    targetElementId = 'printable-area',
    filename = 'laporan_sapa_mis',
    orientation = 'landscape',
    onProgress
  } = options;

  // 1. Locate the target element
  const sourceElem =
    document.getElementById(targetElementId) ||
    document.querySelector('.printable-dashboard') ||
    document.querySelector('main');

  if (!sourceElem) {
    console.error(`Export PDF Error: Element #${targetElementId} not found.`);
    if (onProgress) onProgress('Elemen tabel tidak ditemukan.');
    return false;
  }

  // Generate date stamp if not provided in filename
  const dateStamp = new Date().toISOString().substring(0, 10);
  const cleanFilename = filename.toLowerCase().endsWith('.pdf')
    ? filename
    : `${filename}_${dateStamp}.pdf`;

  let offscreenWrapper: HTMLDivElement | null = null;

  try {
    if (onProgress) onProgress('Menyiapkan tata letak cetak tabel...');

    // 2. Determine orientation & dimensions
    const isLandscape =
      orientation === 'landscape' ||
      (orientation === 'auto' && (sourceElem.clientWidth > 768 || window.innerWidth > 900));

    // Desired render width for crisp rasterization
    const renderWidthPx = isLandscape ? 1120 : 840;

    // 3. Create an isolated offscreen wrapper with the exact PDF export print classes
    offscreenWrapper = document.createElement('div');
    offscreenWrapper.className = 'pdf-export-mode';
    offscreenWrapper.id = 'pdf-export-active-container';
    offscreenWrapper.setAttribute('data-theme', 'light');

    // Offscreen styling positioning (renderable by html2canvas without flicker)
    Object.assign(offscreenWrapper.style, {
      position: 'fixed',
      left: '-99999px',
      top: '0',
      width: `${renderWidthPx}px`,
      minWidth: `${renderWidthPx}px`,
      maxWidth: `${renderWidthPx}px`,
      backgroundColor: '#ffffff',
      color: '#0f172a',
      padding: '24px',
      margin: '0',
      boxSizing: 'border-box',
      zIndex: '-9999',
      opacity: '1',
      overflow: 'visible'
    });

    // 4. Deep clone the source element
    const clonedNode = sourceElem.cloneNode(true) as HTMLElement;

    // 5. Apply the exact Print Styling Rules to the cloned DOM:
    // A. Make print headers (like PrintReportHeader with 'hidden print:block') completely visible
    const printOnlyBlocks = clonedNode.querySelectorAll<HTMLElement>(
      '.hidden.print\\:block, .print\\:block, .print-block, [class*="print:block"]'
    );
    printOnlyBlocks.forEach(el => {
      el.classList.remove('hidden');
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });

    // B. Hide interactive UI controls, action bars, checkboxes, and buttons
    const interactiveElements = clonedNode.querySelectorAll<HTMLElement>(
      '.print\\:hidden, .print-hidden, .no-export, button:not(.print-include), input[type="checkbox"], [data-no-print="true"]'
    );
    interactiveElements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
    });

    // C. Format all tables cleanly with borders and full width
    const tables = clonedNode.querySelectorAll<HTMLTableElement>('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '11px';
      table.style.color = '#0f172a';
      table.style.marginTop = '12px';
      table.style.marginBottom = '16px';
    });

    // D. Un-collapse overflow scroll containers so tables don't get clipped
    const overflowContainers = clonedNode.querySelectorAll<HTMLElement>(
      '.overflow-x-auto, .overflow-y-auto, .overflow-hidden'
    );
    overflowContainers.forEach(container => {
      container.style.overflow = 'visible';
      container.style.maxHeight = 'none';
      container.style.maxWidth = 'none';
    });

    // E. Remove animation transforms that could displace rasterization
    const animatedElements = clonedNode.querySelectorAll<HTMLElement>('*');
    animatedElements.forEach(el => {
      if (el.style.transform) el.style.transform = 'none';
      if (el.style.transition) el.style.transition = 'none';
      if (el.style.animation) el.style.animation = 'none';
    });

    // Append clone to wrapper, then wrapper to document body
    offscreenWrapper.appendChild(clonedNode);
    document.body.appendChild(offscreenWrapper);

    // Give DOM a microtick to compute layout & resolve fonts/images
    await new Promise(resolve => setTimeout(resolve, 150));

    if (onProgress) onProgress('Merender tabel dengan resolusi tinggi...');

    // 6. High-DPI rasterization via html2canvas-pro
    const canvas = await html2canvas(offscreenWrapper, {
      scale: 2, // 2x retina scale for crisp vector-like text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: renderWidthPx,
      scrollX: 0,
      scrollY: 0
    });

    if (onProgress) onProgress('Menyusun lembar PDF dokumen resmi...');

    // 7. Initialize jsPDF document (A4 Landscape or Portrait)
    const pdfOrientation = isLandscape ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation: pdfOrientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // A4 dimensions in mm
    const pdfWidth = isLandscape ? 297 : 210;
    const pdfHeight = isLandscape ? 210 : 297;

    // Calculate proportional height of the canvas on A4 page
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Add subsequent pages if table view spans beyond a single A4 page
    let pageNumber = 1;
    while (heightLeft > 5) {
      position -= pdfHeight;
      pdf.addPage();
      pageNumber++;
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    if (onProgress) onProgress('Menyimpan file PDF...');

    // 8. Trigger direct browser download of the PDF file
    pdf.save(cleanFilename);

    if (onProgress) onProgress('PDF berhasil diunduh!');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (onProgress) onProgress('Gagal mengunduh PDF.');
    return false;
  } finally {
    // 9. Clean up offscreen wrapper
    if (offscreenWrapper && document.body.contains(offscreenWrapper)) {
      document.body.removeChild(offscreenWrapper);
    }
  }
};
