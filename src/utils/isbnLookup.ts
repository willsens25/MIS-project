/**
 * ISBN & Barcode Lookup Utility
 * Automatically identifies book titles from ISBN or Barcode:
 * 1. Offline Lamrimnesia & Dharma Literature Catalog (0ms response)
 * 2. Backend Server AI & Registry API (/api/isbn-lookup)
 * 3. OpenLibrary / Google Books fallback
 * 4. Smart Title Auto-Generator (guarantees title is NEVER blank)
 */

export interface IsbnLookupResult {
  found: boolean;
  source: 'katalog_resmi' | 'gemini_ai' | 'google_books' | 'open_library' | 'auto_generator' | 'none';
  isbn: string;
  judul: string;
  penulis?: string;
  penerbit?: string;
  tahun_terbit?: string;
  kategori?: string;
  deskripsi?: string;
  cover_url?: string;
  halaman?: number;
  estimasi_harga?: number;
  biaya_pokok?: number;
}

export function cleanIsbn(input: string): string {
  if (!input) return '';
  return input.replace(/[^0-9X]/gi, '').toUpperCase();
}

export function isValidIsbn(input: string): boolean {
  const cleaned = cleanIsbn(input);
  return cleaned.length >= 6; // Allow barcodes, ISBN-10, ISBN-13, or catalog barcodes
}

// Built-in offline dictionary for instant 0ms identification
export const KNOWN_OFFLINE_BOOKS: Record<string, { judul: string; penulis: string; kategori: string; harga_jual: number; biaya_pokok: number }> = {
  '9786021234011': { judul: 'Pembebasan di Tangan Kita (Lamrim)', penulis: 'Pabongka Rinpoche', kategori: 'Filosofi', harga_jual: 145000, biaya_pokok: 52000 },
  '9786021234028': { judul: 'Untaian Permata Ajaran Buddha', penulis: 'Dagpo Rinpoche', kategori: 'Meditasi', harga_jual: 95000, biaya_pokok: 36000 },
  '9786021234035': { judul: 'Bodhicaryavatara (Panduan Hidup Bodhisattva)', penulis: 'Shantideva', kategori: 'Sutra', harga_jual: 120000, biaya_pokok: 45000 },
  '9786021234042': { judul: 'Meditasi & Jalan Menuju Ketenangan Batin', penulis: 'Geshe Yeshe Tobden', kategori: 'Praktik', harga_jual: 80000, biaya_pokok: 29000 },
  '9786021234059': { judul: 'Sutra Inti Hati Kebijaksanaan (Prajnaparamita)', penulis: 'Penerjemah Nusantara', kategori: 'Sutra', harga_jual: 65000, biaya_pokok: 22000 },
  '9786021234066': { judul: 'Transformasi Pikiran Delapan Bait (Lojong)', penulis: 'Langri Tangpa', kategori: 'Mindset', harga_jual: 55000, biaya_pokok: 19000 },
  '9786021234073': { judul: 'Dharmapada Bergambar Edisi Nusantara', penulis: 'Tim Kreatif Lamrim', kategori: 'Koleksi', harga_jual: 175000, biaya_pokok: 68000 },
  '9786021234080': { judul: 'Seni Welas Asih Sehari-hari', penulis: 'Lama Zopa Rinpoche', kategori: 'Praktik', harga_jual: 90000, biaya_pokok: 32000 },
  '9786021234097': { judul: 'Pohon Perlindungan Tiga Permata', penulis: 'Atisha Dipamkara', kategori: 'Klasik', harga_jual: 110000, biaya_pokok: 41000 },
  '9786021234103': { judul: 'Jalan Cahaya Pencerahan Batin', penulis: 'Geshe Lhundub Sopa', kategori: 'Filosofi', harga_jual: 130000, biaya_pokok: 48000 },
  '9786026117304': { judul: 'Hujan Bulan Juni', penulis: 'Sapardi Djoko Damono', kategori: 'Sastra & Puisi', harga_jual: 85000, biaya_pokok: 34000 },
  '9786020305622': { judul: 'Critical Eleven', penulis: 'Ika Natassa', kategori: 'Fiksi & Sastra', harga_jual: 88000, biaya_pokok: 35000 },
  '9789791268875': { judul: 'The 7 Habits of Highly Effective Teens', penulis: 'Sean Covey', kategori: 'Pengembangan Diri', harga_jual: 115000, biaya_pokok: 46000 },
  '9780143105954': { judul: "The Heart of the Buddha's Teaching", penulis: 'Thich Nhat Hanh', kategori: 'Dharma & Meditasi', harga_jual: 125000, biaya_pokok: 50000 },
  '9780861715008': { judul: 'The Great Treatise on the Stages of the Path to Enlightenment (Lamrim Chenmo)', penulis: 'Je Tsongkhapa', kategori: 'Filosofi', harga_jual: 350000, biaya_pokok: 140000 }
};

export async function lookupIsbnOnline(rawIsbn: string): Promise<IsbnLookupResult> {
  const isbn = cleanIsbn(rawIsbn);
  if (!isbn) {
    return {
      found: false,
      source: 'none',
      isbn: rawIsbn,
      judul: ''
    };
  }

  // 1. Check known local catalog (Instant 0ms)
  if (KNOWN_OFFLINE_BOOKS[isbn]) {
    const b = KNOWN_OFFLINE_BOOKS[isbn];
    return {
      found: true,
      source: 'katalog_resmi',
      isbn,
      judul: b.judul,
      penulis: b.penulis,
      kategori: b.kategori,
      estimasi_harga: b.harga_jual,
      biaya_pokok: b.biaya_pokok
    };
  }

  // 2. Call backend server API (/api/isbn-lookup) with Gemini AI & multi-source support
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`/api/isbn-lookup?isbn=${encodeURIComponent(isbn)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.found && data.judul) {
        return {
          found: true,
          source: data.source || 'gemini_ai',
          isbn,
          judul: data.judul,
          penulis: data.penulis || 'Penulis Lamrimnesia',
          kategori: data.kategori || 'Filosofi',
          estimasi_harga: data.estimasi_harga || 85000,
          biaya_pokok: data.biaya_pokok || 34000
        };
      }
    }
  } catch (serverErr) {
    console.warn('Backend ISBN lookup failed, falling back to direct web fetch:', serverErr);
  }

  // 3. Fallback: Direct OpenLibrary lookup
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const bibKey = `ISBN:${isbn}`;
    const res = await fetch(`https://openlibrary.org/api/books?bibkeys=${bibKey}&jscmd=data&format=json`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const book = data[bibKey];
      if (book && book.title) {
        const penulis = Array.isArray(book.authors) ? book.authors.map((a: any) => a.name).join(', ') : 'Penulis Tidak Diketahui';
        return {
          found: true,
          source: 'open_library',
          isbn,
          judul: book.title,
          penulis,
          kategori: Array.isArray(book.subjects) && book.subjects.length > 0 ? book.subjects[0].name : 'Umum',
          estimasi_harga: 85000,
          biaya_pokok: 34000
        };
      }
    }
  } catch (olErr) {
    console.warn('Direct Open Library fallback failed:', olErr);
  }

  // 4. Guarantees title is NEVER empty so the user never has to type it manually!
  return {
    found: true,
    source: 'auto_generator',
    isbn,
    judul: `Buku Terbitan (ISBN ${isbn})`,
    penulis: 'Penerbit Lamrimnesia',
    kategori: 'Filosofi',
    estimasi_harga: 85000,
    biaya_pokok: 34000
  };
}
