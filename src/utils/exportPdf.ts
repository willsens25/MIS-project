import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import html2pdf from 'html2pdf.js';

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
   * 'landscape' is optimal for multi-column tables and RGL grids.
   * 'portrait' is suitable for document pages.
   * 'auto' selects orientation based on aspect ratio.
   * Default is 'landscape'.
   */
  orientation?: 'landscape' | 'portrait' | 'auto';

  /**
   * Callback for progress tracking.
   */
  onProgress?: (status: string) => void;
}

export interface RglWidgetSnapshotItem {
  id: string;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
  summaryText?: string;
}

export interface ExportRglDashboardPdfOptions {
  divisionId: number;
  divisionName: string;
  divisionCode?: string;
  userName?: string;
  userRole?: string;
  rglContainerElement?: HTMLElement | null;
  includeFullDashboard?: boolean;
  orientation?: 'landscape' | 'portrait';
  widgetsSnapshot: RglWidgetSnapshotItem[];
  filename?: string;
  onProgress?: (status: string) => void;
}

/**
 * Helper to convert RGL CSS transform: translate(Xpx, Ypx) into explicit left/top
 * so html2canvas / html2pdf renders every RGL item in its exact 2D grid coordinates
 * even when CSS transforms on non-RGL animated wrappers are reset.
 */
const normalizeRglGridItemsForPrint = (root: HTMLElement) => {
  const rglContainers = root.querySelectorAll<HTMLElement>('.react-grid-layout');
  rglContainers.forEach(container => {
    container.style.position = 'relative';
    container.style.display = 'block';
    container.style.overflow = 'visible';
  });

  const rglItems = root.querySelectorAll<HTMLElement>('.react-grid-item');
  rglItems.forEach(item => {
    item.setAttribute('data-rgl-item', 'true');
    const transformStr = item.style.transform || '';
    const match = transformStr.match(/translate(?:3d)?\(\s*(-?\d+(?:\.\d+)?)px\s*,\s*(-?\d+(?:\.\d+)?)px/);
    if (match) {
      const xPx = parseFloat(match[1]);
      const yPx = parseFloat(match[2]);
      item.style.left = `${xPx}px`;
      item.style.top = `${yPx}px`;
      item.style.transform = 'none';
    }
    item.style.position = 'absolute';
    item.style.backgroundColor = '#ffffff';
    item.style.color = '#0f172a';
    item.style.borderColor = '#cbd5e1';
    item.style.borderStyle = 'solid';
    item.style.borderWidth = '1px';
    item.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.06)';
    item.style.pageBreakInside = 'avoid';
    item.style.breakInside = 'avoid';
  });

  // Hide resize handles in PDF output
  const resizeHandles = root.querySelectorAll<HTMLElement>('.react-resizable-handle');
  resizeHandles.forEach(handle => {
    handle.style.display = 'none';
    handle.style.visibility = 'hidden';
  });
};

/**
 * Generates and downloads a PDF file directly from the current DOM table/dashboard view,
 * maintaining the EXACT styling rules defined for printing (official header,
 * clean white background, table formatting, RGL grid coordinates, hiding action buttons).
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

  const dateStamp = new Date().toISOString().substring(0, 10);
  const cleanFilename = filename.toLowerCase().endsWith('.pdf')
    ? filename
    : `${filename}_${dateStamp}.pdf`;

  let offscreenWrapper: HTMLDivElement | null = null;

  try {
    if (onProgress) onProgress('Menyiapkan tata letak cetak...');

    const isLandscape =
      orientation === 'landscape' ||
      (orientation === 'auto' && (sourceElem.clientWidth > 768 || window.innerWidth > 900));

    const renderWidthPx = isLandscape ? 1120 : 840;

    offscreenWrapper = document.createElement('div');
    offscreenWrapper.className = 'pdf-export-mode';
    offscreenWrapper.id = 'pdf-export-active-container';
    offscreenWrapper.setAttribute('data-theme', 'light');

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

    const clonedNode = sourceElem.cloneNode(true) as HTMLElement;

    // Normalize React Grid Layout items BEFORE stripping generic animation transforms
    normalizeRglGridItemsForPrint(clonedNode);

    const printOnlyBlocks = clonedNode.querySelectorAll<HTMLElement>(
      '.hidden.print\\:block, .print\\:block, .print-block, [class*="print:block"]'
    );
    printOnlyBlocks.forEach(el => {
      el.classList.remove('hidden');
      el.style.display = 'block';
      el.style.visibility = 'visible';
      el.style.opacity = '1';
    });

    const interactiveElements = clonedNode.querySelectorAll<HTMLElement>(
      '.print\\:hidden, .print-hidden, .no-export, button:not(.print-include), input[type="checkbox"], [data-no-print="true"]'
    );
    interactiveElements.forEach(el => {
      el.style.display = 'none';
      el.style.visibility = 'hidden';
    });

    const tables = clonedNode.querySelectorAll<HTMLTableElement>('table');
    tables.forEach(table => {
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.fontSize = '11px';
      table.style.color = '#0f172a';
      table.style.marginTop = '12px';
      table.style.marginBottom = '16px';
    });

    const overflowContainers = clonedNode.querySelectorAll<HTMLElement>(
      '.overflow-x-auto, .overflow-y-auto, .overflow-hidden'
    );
    overflowContainers.forEach(container => {
      if (!container.classList.contains('react-grid-item')) {
        container.style.overflow = 'visible';
        container.style.maxHeight = 'none';
        container.style.maxWidth = 'none';
      }
    });

    const animatedElements = clonedNode.querySelectorAll<HTMLElement>('*');
    animatedElements.forEach(el => {
      if (el.getAttribute('data-rgl-item') !== 'true' && !el.classList.contains('react-grid-item')) {
        if (el.style.transform) el.style.transform = 'none';
      }
      if (el.style.transition) el.style.transition = 'none';
      if (el.style.animation) el.style.animation = 'none';
    });

    offscreenWrapper.appendChild(clonedNode);
    document.body.appendChild(offscreenWrapper);

    await new Promise(resolve => setTimeout(resolve, 150));

    if (onProgress) onProgress('Merender tampilan dengan resolusi tinggi...');

    const canvas = await html2canvas(offscreenWrapper, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: renderWidthPx,
      scrollX: 0,
      scrollY: 0
    });

    if (onProgress) onProgress('Menyusun lembar PDF terpaginasi via html2pdf...');

    const pdfOrientation = isLandscape ? 'landscape' : 'portrait';

    // Use html2pdf.js pipeline to paginate and save cleanly
    const worker = html2pdf()
      .set({
        margin: [8, 8, 12, 8],
        filename: cleanFilename,
        image: { type: 'jpeg', quality: 0.96 },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: pdfOrientation
        }
      })
      .from(canvas)
      .toPdf();

    const pdfInstance: jsPDF = await worker.get('pdf');
    const totalPages = pdfInstance.getNumberOfPages();
    const pageW = pdfInstance.internal.pageSize.getWidth();
    const pageH = pdfInstance.internal.pageSize.getHeight();

    for (let i = 1; i <= totalPages; i++) {
      pdfInstance.setPage(i);
      pdfInstance.setFontSize(8);
      pdfInstance.setTextColor(100, 116, 139);
      pdfInstance.text(
        `SAPA-MIS Executive Report • Dicetak: ${new Date().toLocaleString('id-ID')}`,
        10,
        pageH - 5
      );
      pdfInstance.text(`Halaman ${i} dari ${totalPages}`, pageW - 35, pageH - 5);
    }

    await worker.save();

    if (onProgress) onProgress('PDF berhasil diunduh!');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (onProgress) onProgress('Gagal mengunduh PDF.');
    return false;
  } finally {
    if (offscreenWrapper && document.body.contains(offscreenWrapper)) {
      document.body.removeChild(offscreenWrapper);
    }
  }
};

/**
 * Captures the current React Grid Layout (RGL) state and division dashboard view
 * as a clean, multi-page paginated PDF report using html2pdf.js + html2canvas-pro.
 */
export const exportRglDashboardToPdf = async (
  options: ExportRglDashboardPdfOptions
): Promise<boolean> => {
  const {
    divisionId,
    divisionName,
    divisionCode = `DIV-${divisionId}`,
    userName = 'Eksekutif Yayasan',
    userRole = 'Administrator',
    rglContainerElement,
    includeFullDashboard = true,
    orientation = 'landscape',
    widgetsSnapshot,
    filename,
    onProgress
  } = options;

  const dateStamp = new Date().toISOString().substring(0, 10);
  const safeDivSlug = divisionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  const defaultFile = `Laporan_Dashboard_RGL_${safeDivSlug}_${dateStamp}.pdf`;
  const cleanFilename = filename
    ? filename.toLowerCase().endsWith('.pdf')
      ? filename
      : `${filename}_${dateStamp}.pdf`
    : defaultFile;

  let offscreenWrapper: HTMLDivElement | null = null;

  try {
    if (onProgress) onProgress('Menangkap state React Grid Layout (RGL)...');

    const isLandscape = orientation === 'landscape';
    const renderWidthPx = isLandscape ? 1120 : 840;

    offscreenWrapper = document.createElement('div');
    offscreenWrapper.className = 'pdf-export-mode';
    offscreenWrapper.id = 'pdf-rgl-export-container';
    offscreenWrapper.setAttribute('data-theme', 'light');

    Object.assign(offscreenWrapper.style, {
      position: 'fixed',
      left: '-99999px',
      top: '0',
      width: `${renderWidthPx}px`,
      minWidth: `${renderWidthPx}px`,
      maxWidth: `${renderWidthPx}px`,
      backgroundColor: '#ffffff',
      color: '#0f172a',
      padding: '28px',
      margin: '0',
      boxSizing: 'border-box',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      zIndex: '-9999',
      opacity: '1',
      overflow: 'visible'
    });

    const activeWidgets = widgetsSnapshot.filter(w => w.visible);
    const hiddenWidgets = widgetsSnapshot.filter(w => !w.visible);
    const formattedDate = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const formattedTime = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // 1. Build Official Report Header Banner
    const headerBanner = document.createElement('div');
    headerBanner.style.cssText = `
      border-bottom: 3px double #1e293b;
      padding-bottom: 14px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: #ffffff;
    `;
    headerBanner.innerHTML = `
      <div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="background: #4f46e5; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.06em;">
            SAPA-MIS • ${divisionCode}
          </span>
          <span style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px;">
            React Grid Layout (RGL) Snapshot Report
          </span>
        </div>
        <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 4px 0 2px 0; letter-spacing: -0.02em;">
          LAPORAN DASHBOARD & TATA LETAK WIDGET: ${divisionName.toUpperCase()}
        </h1>
        <p style="font-size: 11px; color: #475569; margin: 0;">
          Sistem Informasi Manajemen Terpadu • Rekapitulasi Metrik Real-Time & Konfigurasi Posisi Grid
        </p>
      </div>
      <div style="text-align: right; font-size: 10.5px; color: #334155; line-height: 1.5; background: #f8fafc; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div><strong>Tanggal Cetak:</strong> ${formattedDate} (${formattedTime} WIB)</div>
        <div><strong>Diekspor Oleh:</strong> ${userName} (${userRole})</div>
        <div><strong>Status RGL Grid:</strong> ${activeWidgets.length} Aktif / ${hiddenWidgets.length} Disembunyikan (12-Col Grid)</div>
      </div>
    `;
    offscreenWrapper.appendChild(headerBanner);

    // 2. Clone and normalize the live RGL Widget Canvas
    const sectionTitle1 = document.createElement('div');
    sectionTitle1.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 6px 10px;
      background: #f1f5f9;
      border-left: 4px solid #4f46e5;
      border-radius: 4px;
    `;
    sectionTitle1.innerHTML = `
      <span style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em;">
        I. Visualisasi Kanvas Widget Beranda (React Grid Layout State)
      </span>
      <span style="font-size: 10.5px; font-weight: 600; color: #475569;">
        Menampilkan ${activeWidgets.length} dari ${widgetsSnapshot.length} Widget Divisi sesuai koordinat kustom pengguna
      </span>
    `;
    offscreenWrapper.appendChild(sectionTitle1);

    if (rglContainerElement && activeWidgets.length > 0) {
      const rglClone = rglContainerElement.cloneNode(true) as HTMLElement;
      normalizeRglGridItemsForPrint(rglClone);

      // Hide edit-mode controls or buttons inside RGL cards
      const buttonsInRgl = rglClone.querySelectorAll<HTMLElement>(
        'button, .print\\:hidden, [data-no-print="true"]'
      );
      buttonsInRgl.forEach(btn => {
        btn.style.display = 'none';
        btn.style.visibility = 'hidden';
      });

      const rglWrapperBox = document.createElement('div');
      rglWrapperBox.style.cssText = `
        margin-bottom: 20px;
        padding: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: visible;
      `;
      rglWrapperBox.appendChild(rglClone);
      offscreenWrapper.appendChild(rglWrapperBox);
    }

    // 3. Build RGL Layout State & Coordinates Table
    const sectionTitle2 = document.createElement('div');
    sectionTitle2.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 14px;
      margin-bottom: 8px;
      padding: 6px 10px;
      background: #f1f5f9;
      border-left: 4px solid #0284c7;
      border-radius: 4px;
    `;
    sectionTitle2.innerHTML = `
      <span style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em;">
        II. Matriks Koordinat & Konfigurasi State React Grid Layout (RGL)
      </span>
      <span style="font-size: 10.5px; font-weight: 600; color: #475569;">
        Key Penyimpanan: mis_rgl_division_widgets_v1_div_${divisionId}
      </span>
    `;
    offscreenWrapper.appendChild(sectionTitle2);

    const stateTable = document.createElement('table');
    stateTable.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 22px;
      background: #ffffff;
    `;
    stateTable.innerHTML = `
      <thead>
        <tr style="background: #1e293b; color: #ffffff; text-align: left;">
          <th style="padding: 7px 10px; border: 1px solid #cbd5e1; width: 36px;">No</th>
          <th style="padding: 7px 10px; border: 1px solid #cbd5e1;">ID & Nama Widget</th>
          <th style="padding: 7px 10px; border: 1px solid #cbd5e1;">Deskripsi / Ringkasan Metrik</th>
          <th style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center; width: 120px;">Koordinat Grid (X, Y)</th>
          <th style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center; width: 130px;">Dimensi Span (W × H)</th>
          <th style="padding: 7px 10px; border: 1px solid #cbd5e1; text-align: center; width: 110px;">Status Visibilitas</th>
        </tr>
      </thead>
      <tbody>
        ${widgetsSnapshot
          .map(
            (w, idx) => `
          <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #475569;">${idx + 1}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">
              <div style="font-weight: 800; color: #0f172a;">${w.title}</div>
              <div style="font-size: 9.5px; color: #64748b; font-family: monospace;">${w.id}</div>
            </td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #334155;">
              ${w.summaryText ? `<strong>${w.summaryText}</strong> — ` : ''}${w.subtitle}
            </td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; font-weight: 700; color: #1e293b;">
              Col ${w.x}, Row ${w.y}
            </td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; font-weight: 700; color: #4f46e5;">
              ${w.w}/12 Kolom × ${w.h} Baris
            </td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 9.5px; font-weight: 800; background: ${
                w.visible ? '#dcfce7' : '#f1f5f9'
              }; color: ${w.visible ? '#166534' : '#64748b'}; border: 1px solid ${
              w.visible ? '#86efac' : '#cbd5e1'
            };">
                ${w.visible ? 'AKTIF (TAMPIL)' : 'DISEMBUNYIKAN'}
              </span>
            </td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    `;
    offscreenWrapper.appendChild(stateTable);

    // 4. Optional: Include the rest of the current Division Dashboard view below
    if (includeFullDashboard) {
      const printableArea =
        document.getElementById('printable-area') ||
        document.querySelector<HTMLElement>('.printable-dashboard');

      if (printableArea) {
        const sectionTitle3 = document.createElement('div');
        sectionTitle3.style.cssText = `
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
          margin-bottom: 10px;
          padding: 6px 10px;
          background: #f1f5f9;
          border-left: 4px solid #059669;
          border-radius: 4px;
        `;
        sectionTitle3.innerHTML = `
          <span style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em;">
            III. Lampiran Data & Visualisasi Lengkap Beranda ${divisionName}
          </span>
          <span style="font-size: 10.5px; font-weight: 600; color: #475569;">
            Tampilan Tabel & Grafik Aktif
          </span>
        `;
        offscreenWrapper.appendChild(sectionTitle3);

        const dashboardClone = printableArea.cloneNode(true) as HTMLElement;

        // Remove duplicate RGL widget workspace inside the cloned full dashboard since Section I already rendered it cleanly
        const duplicateRglWorkspaces = dashboardClone.querySelectorAll<HTMLElement>(
          '[data-rgl-widget-workspace="true"]'
        );
        duplicateRglWorkspaces.forEach(el => el.remove());

        // Hide interactive elements
        const interactiveEls = dashboardClone.querySelectorAll<HTMLElement>(
          '.print\\:hidden, .print-hidden, .no-export, button:not(.print-include), input[type="checkbox"], [data-no-print="true"]'
        );
        interactiveEls.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        });

        // Un-collapse scroll containers
        const scrollContainers = dashboardClone.querySelectorAll<HTMLElement>(
          '.overflow-x-auto, .overflow-y-auto, .overflow-hidden'
        );
        scrollContainers.forEach(container => {
          container.style.overflow = 'visible';
          container.style.maxHeight = 'none';
          container.style.maxWidth = 'none';
        });

        // Clean up transforms on non-RGL nodes
        const allNodes = dashboardClone.querySelectorAll<HTMLElement>('*');
        allNodes.forEach(el => {
          if (el.style.transform) el.style.transform = 'none';
          if (el.style.transition) el.style.transition = 'none';
          if (el.style.animation) el.style.animation = 'none';
        });

        offscreenWrapper.appendChild(dashboardClone);
      }
    }

    document.body.appendChild(offscreenWrapper);

    // Wait a microtick for layout & SVG charts to settle
    await new Promise(resolve => setTimeout(resolve, 180));

    if (onProgress) onProgress('Merasterisasi laporan RGL beresolusi tinggi...');

    const canvas = await html2canvas(offscreenWrapper, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: renderWidthPx,
      scrollX: 0,
      scrollY: 0
    });

    if (onProgress) onProgress('Membuat dokumen PDF terpaginasi (html2pdf)...');

    const pdfOrientation = isLandscape ? 'landscape' : 'portrait';

    // Use html2pdf.js worker to paginate the rendered canvas into multi-page A4 PDF
    const worker = html2pdf()
      .set({
        margin: [10, 10, 14, 10],
        filename: cleanFilename,
        image: { type: 'jpeg', quality: 0.96 },
        enableLinks: true,
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: pdfOrientation
        }
      })
      .from(canvas)
      .toPdf();

    const pdfInstance: jsPDF = await worker.get('pdf');
    const totalPages = pdfInstance.getNumberOfPages();
    const pageW = pdfInstance.internal.pageSize.getWidth();
    const pageH = pdfInstance.internal.pageSize.getHeight();

    // Stamp running header & paginated footer on every page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      pdfInstance.setPage(pageNum);

      // Top subtle running header on page > 1
      if (pageNum > 1) {
        pdfInstance.setFontSize(7.5);
        pdfInstance.setTextColor(100, 116, 139);
        pdfInstance.text(
          `SAPA-MIS • Laporan Dashboard & RGL Layout — ${divisionName}`,
          10,
          6
        );
        pdfInstance.text(`${formattedDate}`, pageW - 10, 6, { align: 'right' });
      }

      // Bottom page footer bar
      pdfInstance.setDrawColor(203, 213, 225);
      pdfInstance.setLineWidth(0.25);
      pdfInstance.line(10, pageH - 9, pageW - 10, pageH - 9);

      pdfInstance.setFontSize(8);
      pdfInstance.setTextColor(71, 85, 105);
      pdfInstance.text(
        `Dokumen Resmi SAPA-MIS • ${divisionName} (${activeWidgets.length}/${widgetsSnapshot.length} RGL Widget Aktif)`,
        10,
        pageH - 4.5
      );
      pdfInstance.text(
        `Halaman ${pageNum} dari ${totalPages}`,
        pageW - 10,
        pageH - 4.5,
        { align: 'right' }
      );
    }

    if (onProgress) onProgress('Menyimpan laporan PDF...');
    await worker.save();

    if (onProgress) onProgress('PDF RGL berhasil diunduh!');
    return true;
  } catch (error) {
    console.error('Error exporting RGL Dashboard PDF:', error);
    if (onProgress) onProgress('Gagal mengekspor PDF.');
    return false;
  } finally {
    if (offscreenWrapper && document.body.contains(offscreenWrapper)) {
      document.body.removeChild(offscreenWrapper);
    }
  }
};
