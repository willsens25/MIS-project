/**
 * Utility functions for Indonesian Rupiah formatting and parsing.
 * Uses dot (.) as thousand separator per Indonesian currency standard (e.g. Rp 1.500.000).
 */

/**
 * Format a number into standard Indonesian Rupiah format with dots as thousand separators.
 * Example: formatRupiah(1500000) => "Rp 1.500.000"
 * Example: formatRupiah(1500000, false) => "1.500.000"
 */
export function formatRupiah(
  value: number | string | null | undefined,
  withPrefix: boolean = true
): string {
  if (value === null || value === undefined || value === '') {
    return withPrefix ? 'Rp 0' : '0';
  }

  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(/,/g, '.')) : value;
  if (isNaN(num)) {
    return withPrefix ? 'Rp 0' : '0';
  }

  const isNegative = num < 0;
  const absInt = Math.abs(Math.round(num));
  const formatted = absInt.toLocaleString('id-ID');

  if (withPrefix) {
    return `${isNegative ? '-Rp ' : 'Rp '}${formatted}`;
  }
  return `${isNegative ? '-' : ''}${formatted}`;
}

/**
 * Parses any rupiah string representation into a clean integer number.
 * Removes dots, spaces, currency codes, non-digit characters.
 * Example: parseRupiah("Rp 1.500.000") => 1500000
 * Example: parseRupiah("1.500.000") => 1500000
 */
export function parseRupiah(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Math.round(value);

  const clean = value.replace(/[^0-9-]/g, '');
  if (!clean || clean === '-') return 0;

  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a raw number or string into a dot-separated number string.
 * Example: formatNumberWithDots(500000) => "500.000"
 */
export function formatNumberWithDots(value: number | string | null | undefined): string {
  return formatRupiah(value, false);
}
