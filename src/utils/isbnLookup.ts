/**
 * ISBN Lookup Utility
 * Queries Google Books API and OpenLibrary API to fetch book metadata
 * by ISBN (10 or 13 digits).
 */

export interface IsbnLookupResult {
  found: boolean;
  source: 'google_books' | 'open_library' | 'none';
  isbn: string;
  judul?: string;
  penulis?: string;
  penerbit?: string;
  tahun_terbit?: string;
  kategori?: string;
  deskripsi?: string;
  cover_url?: string;
  halaman?: number;
  estimasi_harga?: number;
}

export function cleanIsbn(input: string): string {
  if (!input) return '';
  return input.replace(/[^0-9X]/gi, '').toUpperCase();
}

export function isValidIsbn(input: string): boolean {
  const cleaned = cleanIsbn(input);
  return cleaned.length === 10 || cleaned.length === 13;
}

export async function lookupIsbnOnline(rawIsbn: string): Promise<IsbnLookupResult> {
  const isbn = cleanIsbn(rawIsbn);
  if (!isValidIsbn(isbn)) {
    return {
      found: false,
      source: 'none',
      isbn: rawIsbn
    };
  }

  // 1. Try Google Books API first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const item = data.items[0];
        const info = item.volumeInfo || {};
        const saleInfo = item.saleInfo || {};

        const judul = info.title ? (info.subtitle ? `${info.title}: ${info.subtitle}` : info.title) : undefined;
        const penulis = Array.isArray(info.authors) ? info.authors.join(', ') : (info.authors || 'Penulis Tidak Diketahui');
        const penerbit = info.publisher || '';
        const tahun_terbit = info.publishedDate ? info.publishedDate.substring(0, 4) : '';
        const kategori = Array.isArray(info.categories) && info.categories.length > 0 ? info.categories[0] : 'Umum';
        const deskripsi = info.description || '';
        const cover_url = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || undefined;
        const halaman = info.pageCount || undefined;

        let estimasi_harga: number | undefined = undefined;
        if (saleInfo.retailPrice?.amount) {
          estimasi_harga = Math.round(saleInfo.retailPrice.amount);
        } else if (saleInfo.listPrice?.amount) {
          estimasi_harga = Math.round(saleInfo.listPrice.amount);
        }

        return {
          found: true,
          source: 'google_books',
          isbn,
          judul,
          penulis,
          penerbit,
          tahun_terbit,
          kategori,
          deskripsi,
          cover_url,
          halaman,
          estimasi_harga
        };
      }
    }
  } catch (err) {
    console.warn('Google Books API lookup failed, trying fallback:', err);
  }

  // 2. Fallback to Open Library
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const bibKey = `ISBN:${isbn}`;
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=${bibKey}&jscmd=data&format=json`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const book = data[bibKey];
      if (book) {
        const judul = book.title || undefined;
        const penulis = Array.isArray(book.authors) ? book.authors.map((a: any) => a.name).join(', ') : 'Penulis Tidak Diketahui';
        const penerbit = Array.isArray(book.publishers) && book.publishers.length > 0 ? book.publishers[0].name : '';
        const tahun_terbit = book.publish_date ? book.publish_date.substring(0, 4) : '';
        const kategori = Array.isArray(book.subjects) && book.subjects.length > 0 ? book.subjects[0].name : 'Umum';
        const cover_url = book.cover?.medium || book.cover?.small || undefined;
        const halaman = book.number_of_pages || undefined;

        return {
          found: true,
          source: 'open_library',
          isbn,
          judul,
          penulis,
          penerbit,
          tahun_terbit,
          kategori,
          cover_url,
          halaman
        };
      }
    }
  } catch (err) {
    console.warn('Open Library API lookup failed:', err);
  }

  return {
    found: false,
    source: 'none',
    isbn
  };
}
