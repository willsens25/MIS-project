/**
 * Utility for exporting data tables and arrays to RFC 4180 compliant CSV files.
 * Includes UTF-8 BOM (\uFEFF) to guarantee seamless opening in Microsoft Excel
 * (Windows & Mac), Google Sheets, LibreOffice, and Apple Numbers.
 */

export interface CsvColumn<T = any> {
  header: string;
  accessor?: (row: T, index: number) => any;
  key?: keyof T;
}

export interface CsvExportOptions<T = any> {
  filename: string;
  columns: CsvColumn<T>[];
  data: T[];
  title?: string;
}

/**
 * Escapes a single CSV cell value according to RFC 4180 standards.
 */
export const escapeCsvCell = (value: any): string => {
  if (value === null || value === undefined) {
    return '""';
  }

  let stringValue: string;
  if (typeof value === 'object') {
    if (value instanceof Date) {
      stringValue = value.toISOString();
    } else {
      stringValue = JSON.stringify(value);
    }
  } else {
    stringValue = String(value);
  }

  // If string contains quotes, commas, or line breaks, enclose in quotes and escape quotes
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return `"${stringValue}"`;
};

/**
 * Exports a structured array of objects to a CSV file.
 */
export const exportDataToCsv = <T = any>({
  filename,
  columns,
  data,
  title,
}: CsvExportOptions<T>): boolean => {
  try {
    const lines: string[] = [];

    // Optional metadata title row
    if (title) {
      lines.push(escapeCsvCell(title));
      lines.push(escapeCsvCell(`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`));
      lines.push(''); // Empty line before headers
    }

    // Header row
    const headerRow = columns.map(col => escapeCsvCell(col.header)).join(',');
    lines.push(headerRow);

    // Data rows
    data.forEach((row, rowIndex) => {
      const rowValues = columns.map(col => {
        let cellVal: any;
        if (col.accessor) {
          cellVal = col.accessor(row, rowIndex);
        } else if (col.key !== undefined) {
          cellVal = (row as any)[col.key];
        } else {
          cellVal = '';
        }
        return escapeCsvCell(cellVal);
      });
      lines.push(rowValues.join(','));
    });

    const csvString = lines.join('\r\n');
    triggerCsvDownload(csvString, filename);
    return true;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return false;
  }
};

/**
 * Extracts data from an HTML <table> element and exports it directly to CSV.
 * Automatically skips columns with the class 'no-export' or 'print:hidden' action buttons.
 */
export const exportHtmlTableToCsv = (
  tableElementOrId: HTMLTableElement | string,
  filename: string,
  title?: string
): boolean => {
  try {
    const table = typeof tableElementOrId === 'string'
      ? (document.getElementById(tableElementOrId) as HTMLTableElement)
      : tableElementOrId;

    if (!table) {
      console.warn(`Table element "${tableElementOrId}" not found for CSV export.`);
      return false;
    }

    const lines: string[] = [];

    if (title) {
      lines.push(escapeCsvCell(title));
      lines.push(escapeCsvCell(`Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`));
      lines.push('');
    }

    // Extract headers
    const headerRow: string[] = [];
    const thElements = table.querySelectorAll('thead tr th');
    
    // Track excluded column indices (e.g., checkboxes, action buttons)
    const excludedColIndices: number[] = [];

    thElements.forEach((th, idx) => {
      const isExcluded = th.classList.contains('no-export') || 
                         th.getAttribute('data-no-export') === 'true' ||
                         th.textContent?.trim().toLowerCase() === 'aksi' ||
                         th.querySelector('input[type="checkbox"]');

      if (isExcluded) {
        excludedColIndices.push(idx);
      } else {
        const cleanText = th.textContent?.trim().replace(/\s+/g, ' ') || `Kolom ${idx + 1}`;
        headerRow.push(escapeCsvCell(cleanText));
      }
    });

    if (headerRow.length > 0) {
      lines.push(headerRow.join(','));
    }

    // Extract body rows
    const trElements = table.querySelectorAll('tbody tr');
    trElements.forEach(tr => {
      // Skip empty or purely informative full-width rows
      if (tr.classList.contains('no-export') || tr.querySelector('td[colspan]')) {
        return;
      }

      const rowValues: string[] = [];
      const tdElements = tr.querySelectorAll('td');

      tdElements.forEach((td, idx) => {
        if (excludedColIndices.includes(idx)) return;
        
        // Clone and remove unwanted action elements if any
        const clone = td.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('button, .no-export, .print\\:hidden').forEach(el => el.remove());
        
        const cleanText = clone.textContent?.trim().replace(/\s+/g, ' ') || '';
        rowValues.push(escapeCsvCell(cleanText));
      });

      if (rowValues.length > 0) {
        lines.push(rowValues.join(','));
      }
    });

    const csvString = lines.join('\r\n');
    triggerCsvDownload(csvString, filename);
    return true;
  } catch (error) {
    console.error('Failed to export HTML table to CSV:', error);
    return false;
  }
};

/**
 * Triggers the browser download dialog for the given CSV content.
 * Prepends the UTF-8 Byte Order Mark (\uFEFF) for Excel compatibility.
 */
export const triggerCsvDownload = (csvContent: string, rawFilename: string): void => {
  const sanitizedFilename = rawFilename.endsWith('.csv') ? rawFilename : `${rawFilename}.csv`;
  
  // UTF-8 BOM ensures Excel detects UTF-8 correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', sanitizedFilename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

/**
 * Generates an ISO date string formatted for file names: YYYY-MM-DD
 */
export const getCsvDateStamp = (): string => {
  return new Date().toISOString().substring(0, 10);
};
