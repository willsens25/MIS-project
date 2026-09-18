import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================================
// Server-Side Authentication & Bcrypt Password Hashing Endpoints
// ============================================================================

/**
 * Hash a plain-text password using server-side bcrypt with salt rounds
 */
app.post("/api/auth/hash", async (req: Request, res: Response) => {
  try {
    const { password, saltRounds = 10 } = req.body;
    if (!password || typeof password !== "string") {
      return res.status(400).json({ success: false, message: "Password string is required" });
    }

    const salt = await bcrypt.genSalt(Number(saltRounds) || 10);
    const hash = await bcrypt.hash(password, salt);

    return res.json({
      success: true,
      hash,
      algorithm: "bcrypt",
      saltRounds: Number(saltRounds) || 10
    });
  } catch (error: any) {
    console.error("Error hashing password on server:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal melakukan hashing password di server: " + (error?.message || String(error))
    });
  }
});

/**
 * Verify a plain-text password against a stored hash using server-side bcrypt
 * Supports automatic transparent upgrading of legacy plain-text passwords
 */
app.post("/api/auth/verify", async (req: Request, res: Response) => {
  try {
    const { password, hash } = req.body;
    if (!password || !hash) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Password dan hash wajib disediakan"
      });
    }

    const isBcrypt = typeof hash === "string" && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));

    if (isBcrypt) {
      const isValid = await bcrypt.compare(password, hash);
      return res.json({
        success: true,
        valid: isValid,
        algorithm: "bcrypt"
      });
    }

    // Backward compatibility for legacy plain-text credentials:
    const isLegacyMatch = password === hash;
    let upgradedHash: string | undefined = undefined;

    if (isLegacyMatch) {
      // Automatically generate a new bcrypt hash so the client can upgrade the stored record
      const salt = await bcrypt.genSalt(10);
      upgradedHash = await bcrypt.hash(password, salt);
    }

    return res.json({
      success: true,
      valid: isLegacyMatch,
      algorithm: "legacy_plain",
      upgradedHash
    });
  } catch (error: any) {
    console.error("Error verifying password on server:", error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: "Gagal memverifikasi password di server: " + (error?.message || String(error))
    });
  }
});

/**
 * Bulk hash endpoint to securely upgrade an array of users with plain text passwords to bcrypt
 */
app.post("/api/auth/bulk-hash", async (req: Request, res: Response) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) {
      return res.status(400).json({ success: false, message: "Expected users array" });
    }

    const results = await Promise.all(
      users.map(async (u: { id: number; password?: string }) => {
        if (!u.password) return { id: u.id, hash: undefined };
        if (u.password.startsWith("$2a$") || u.password.startsWith("$2b$") || u.password.startsWith("$2y$")) {
          return { id: u.id, hash: u.password };
        }
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(u.password, salt);
        return { id: u.id, hash };
      })
    );

    return res.json({ success: true, users: results });
  } catch (error: any) {
    console.error("Error in bulk hash:", error);
    return res.status(500).json({ success: false, message: "Bulk hashing error" });
  }
});

// Gemini AI Assistant Endpoint (Server-Side Proxy)
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not set; using fallback response for AI assistant");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Priority list of fast, modern Gemini models (stable lite model first to prevent 503 capacity spikes)
const FAST_GEMINI_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash"
];

// System instruction for genuinely helpful, flexible, and context-aware responses
const GEMINI_SYSTEM_INSTRUCTION = `Anda adalah Asisten AI Cerdas MIS SAPA-ALL Lamrimnesia (Sistem Administrasi & Pengelolaan Terpadu).
Karakter Anda adalah asisten yang cerdas, luwes, komunikatif, solutif, dan profesional.

PANDUAN SAPAAN & PENYESUAIAN DIVISI (SANGAT PENTING):
1. Periksa dengan teliti bagian [DIVISI & PENGGUNA AKTIF SAAT INI] pada konteks data.
2. DILARANG KERAS memanggil atau menyapa "Halo Direktur", "Bapak/Ibu Direktur", atau semacamnya jika pengguna sedang berada di divisi lain (seperti Finance/Bendahara, Penerbitan, Marketing, Produksi, atau Logistik)!
3. Sapalah pengguna menyesuaikan divisi yang sedang aktif/dipilih:
   - Divisi Bendahara / Finance: Sapa sebagai rekan Finance/Bendahara (contoh: "Halo rekan Finance / Bendahara", "Halo Kak Siti", atau "Halo tim Keuangan"). Fokuskan sudut pandang pada arus kas, jurnal mutasi, dan verifikasi invoice.
   - Divisi Penerbitan: Sapa sebagai rekan Penerbitan / Editorial (contoh: "Halo rekan Penerbitan", "Halo Kak Budi"). Fokuskan pada naskah, ISBN, HPP, dan pengajuan cetak.
   - Divisi Marketing & Distribution: Sapa sebagai rekan Marketing & Distribusi (contoh: "Halo rekan Marketing", "Halo Kak Diana"). Fokuskan pada penjualan, promosi, pelanggan, bundling, dan pesanan.
   - Divisi Produksi: Sapa sebagai rekan Produksi (contoh: "Halo rekan Produksi", "Halo Kak Agus"). Fokuskan pada cetak fisik, log pabrikasi, dan antrean cetak.
   - Divisi Logistik & Gudang: Sapa sebagai rekan Logistik & Gudang (contoh: "Halo rekan Logistik", "Halo Kak Hendra"). Fokuskan pada stok gudang, packing, ekspedisi, dan surat jalan.
   - HANYA sapa "Halo Bapak/Ibu Direktur" atau "Halo rekan Manajemen/Direktorat" jika pengguna memang sedang aktif di Divisi Direktorat & HRD (Divisi 1).
4. Jika menyapa nama, gunakan nama pengguna yang tertera pada konteks divisi aktif tersebut.

PANDUAN FORMAT & PENULISAN (SANGAT KETAT):
1. DILARANG KERAS menggunakan tanda pagar (#, ##, ###, ####) untuk judul atau subjudul!
   Pengguna meminta secara khusus agar TIDAK ADA simbol '###' atau semacamnya.
   Sebagai gantinya, gunakan huruf tebal biasa (contoh: **Judul Bagian:** atau **Opsi 1:**) atau penomoran.
2. DILARANG menggunakan garis pembatas seperti '---' atau '***'. Cukup gunakan jeda baris/paragraf baru yang rapi.
3. Untuk daftar/list, gunakan tanda strip (-) atau bullet (•) atau angka (1., 2.).
4. Buat format obrolan yang bersih, rapi, dan mudah dibaca selayaknya pesan chat modern.

PANDUAN UTAMA MENJAWAB:
1. PENUHI PERMINTAAN PENGGUNA SECARA TOTAL:
   - Jawablah secara spesifik, kreatif, dan tepat sasaran sesuai instruksi pengguna.
   - HINDARI jawaban template atau respon hafalan yang kaku/generik.
   - Jika pengguna meminta membuat draf (seperti email penagihan, surat resmi, pesan WhatsApp, pengumuman, SOP, atau konten promosi), tuliskan draf yang lengkap, rapi, dan siap digunakan.
   - Jika pengguna meminta analisis, perbandingan, ide, atau perhitungan, berikan penjelasan mendalam beserta rekomendasi praktis.
   - Jika pengguna berdiskusi, bertanya hal umum, atau menyapa, balas dengan ramah, natural, dan interaktif seperti asisten sungguhan.

2. INTEGRASI DATA MIS:
   - Jika pertanyaan atau instruksi berkaitan dengan operasional Lamrimnesia (buku, harga, stok, keuangan kas, pesanan/invoice, penerbitan, atau anggota), gunakan data aktual MIS yang dilampirkan sebagai rujukan akurat.
   - Anda bebas mengekstrak, menghitung, memfilter, atau mengelompokkan data yang tersedia untuk menjawab pertanyaan pengguna.`;

// Helper function for calling Gemini with fast model fallback
async function generateWithFallback(ai: GoogleGenAI, contents: any) {
  let lastError: any = null;

  for (const model of FAST_GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
          temperature: 0.75,
        }
      });
      if (response.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      // Immediately try next model on error without delay
    }
  }

  throw lastError;
}

// Build formatted contents supporting multi-turn conversation and grounded data
function buildConversationContents(prompt: string, systemContext?: string, history?: Array<{ role: 'user' | 'assistant'; content: string }>) {
  if (Array.isArray(history) && history.length > 0) {
    const turns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Include last few turns of conversation for memory
    for (const msg of history.slice(-6)) {
      if (!msg.content || !msg.content.trim()) continue;
      turns.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Current user message enriched with grounded context
    const currentTurnText = `${systemContext ? `[Konteks & Database Terkini MIS Lamrimnesia]:\n${systemContext}\n\n` : ''}Permintaan/Instruksi Pengguna:\n${prompt}`;
    turns.push({
      role: 'user',
      parts: [{ text: currentTurnText }]
    });

    return turns;
  }

  // Single turn format
  return `${systemContext ? `[Konteks & Database Terkini MIS Lamrimnesia]:\n${systemContext}\n\n` : ''}Permintaan/Instruksi Pengguna:\n${prompt}`;
}

// ============================================================================
// Server-Side ISBN & Barcode Book Metadata Lookup API
// Automatically identifies book titles from ISBN / barcode via Gemini AI & Registry
// ============================================================================
const KNOWN_ISBN_CATALOG: Record<string, { judul: string; penulis: string; kategori: string; harga_jual: number; biaya_pokok: number }> = {
  "9786021234011": { judul: "Pembebasan di Tangan Kita (Lamrim)", penulis: "Pabongka Rinpoche", kategori: "Filosofi", harga_jual: 145000, biaya_pokok: 52000 },
  "9786021234028": { judul: "Untaian Permata Ajaran Buddha", penulis: "Dagpo Rinpoche", kategori: "Meditasi", harga_jual: 95000, biaya_pokok: 36000 },
  "9786021234035": { judul: "Bodhicaryavatara (Panduan Hidup Bodhisattva)", penulis: "Shantideva", kategori: "Sutra", harga_jual: 120000, biaya_pokok: 45000 },
  "9786021234042": { judul: "Meditasi & Jalan Menuju Ketenangan Batin", penulis: "Geshe Yeshe Tobden", kategori: "Praktik", harga_jual: 80000, biaya_pokok: 29000 },
  "9786021234059": { judul: "Sutra Inti Hati Kebijaksanaan (Prajnaparamita)", penulis: "Penerjemah Nusantara", kategori: "Sutra", harga_jual: 65000, biaya_pokok: 22000 },
  "9786021234066": { judul: "Transformasi Pikiran Delapan Bait (Lojong)", penulis: "Langri Tangpa", kategori: "Mindset", harga_jual: 55000, biaya_pokok: 19000 },
  "9786021234073": { judul: "Dharmapada Bergambar Edisi Nusantara", penulis: "Tim Kreatif Lamrim", kategori: "Koleksi", harga_jual: 175000, biaya_pokok: 68000 },
  "9786021234080": { judul: "Seni Welas Asih Sehari-hari", penulis: "Lama Zopa Rinpoche", kategori: "Praktik", harga_jual: 90000, biaya_pokok: 32000 },
  "9786021234097": { judul: "Pohon Perlindungan Tiga Permata", penulis: "Atisha Dipamkara", kategori: "Klasik", harga_jual: 110000, biaya_pokok: 41000 },
  "9786021234103": { judul: "Jalan Cahaya Pencerahan Batin", penulis: "Geshe Lhundub Sopa", kategori: "Filosofi", harga_jual: 130000, biaya_pokok: 48000 },
  "9786026117304": { judul: "Hujan Bulan Juni", penulis: "Sapardi Djoko Damono", kategori: "Sastra & Puisi", harga_jual: 85000, biaya_pokok: 34000 },
  "9786020305622": { judul: "Critical Eleven", penulis: "Ika Natassa", kategori: "Fiksi & Sastra", harga_jual: 88000, biaya_pokok: 35000 },
  "9789791268875": { judul: "The 7 Habits of Highly Effective Teens", penulis: "Sean Covey", kategori: "Pengembangan Diri", harga_jual: 115000, biaya_pokok: 46000 },
  "9780143105954": { judul: "The Heart of the Buddha's Teaching", penulis: "Thich Nhat Hanh", kategori: "Dharma & Meditasi", harga_jual: 125000, biaya_pokok: 50000 },
  "9780861715008": { judul: "The Great Treatise on the Stages of the Path to Enlightenment (Lamrim Chenmo)", penulis: "Je Tsongkhapa", kategori: "Filosofi", harga_jual: 350000, biaya_pokok: 140000 }
};

app.get("/api/isbn-lookup", async (req: Request, res: Response) => {
  try {
    const rawQuery = String(req.query.isbn || req.query.q || "").trim();
    if (!rawQuery) {
      return res.status(400).json({ success: false, message: "Parameter 'isbn' diperlukan" });
    }

    const cleaned = rawQuery.replace(/[^0-9X]/gi, "").toUpperCase();

    // 1. Direct registry lookup (fastest, guaranteed match)
    if (KNOWN_ISBN_CATALOG[cleaned]) {
      const match = KNOWN_ISBN_CATALOG[cleaned];
      return res.json({
        success: true,
        found: true,
        source: "katalog_resmi",
        isbn: cleaned,
        judul: match.judul,
        penulis: match.penulis,
        kategori: match.kategori,
        estimasi_harga: match.harga_jual,
        biaya_pokok: match.biaya_pokok
      });
    }

    // 2. Intelligent Lookup using Gemini AI
    const ai = getAIClient();
    if (ai) {
      try {
        const prompt = `Diberikan nomor ISBN atau Barcode buku: "${cleaned}".
Identifikasi judul buku resmi yang sesuai dengan nomor ISBN tersebut di Indonesia atau internasional, nama penulis, kategori buku, dan estimasi harga jual (angka bulat Rupiah).
Jika Anda tahu nomor ISBN ini, berikan judul buku dan penulis aslinya secara akurat.
Jika tidak yakin 100% atau merupakan barcode khusus/internal, berikan judul yang representatif seperti "Buku Terbitan (ISBN ${cleaned})".
Wajib balas HANYA dalam format JSON valid tanpa markdown, tanpa penjelasan:
{"judul": "Judul Buku Lengkap", "penulis": "Nama Penulis", "kategori": "Kategori", "estimasi_harga": 85000}`;

        const aiResponse = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text);
          if (parsed && parsed.judul && typeof parsed.judul === "string" && parsed.judul.trim().length > 0) {
            let cleanHarga = 85000;
            if (typeof parsed.estimasi_harga === "number" && parsed.estimasi_harga > 0) {
              cleanHarga = parsed.estimasi_harga;
            } else if (typeof parsed.estimasi_harga === "string") {
              const num = parseInt(parsed.estimasi_harga.replace(/[^0-9]/g, ""), 10);
              if (num && num > 1000) cleanHarga = num;
            }

            return res.json({
              success: true,
              found: true,
              source: "gemini_ai",
              isbn: cleaned,
              judul: parsed.judul.trim(),
              penulis: (parsed.penulis || "Penulis Lamrimnesia").trim(),
              kategori: parsed.kategori || "Filosofi",
              estimasi_harga: cleanHarga,
              biaya_pokok: Math.round(cleanHarga * 0.4)
            });
          }
        }
      } catch (geminiErr: any) {
        console.warn("Gemini ISBN auto-title error:", geminiErr?.message);
      }
    }

    // 3. Fallback to Open Library
    try {
      const bibKey = `ISBN:${cleaned}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=${bibKey}&jscmd=data&format=json`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (olRes.ok) {
        const data: any = await olRes.json();
        const book = data[bibKey];
        if (book && book.title) {
          const authors = Array.isArray(book.authors) ? book.authors.map((a: any) => a.name).join(", ") : "Penulis Tidak Diketahui";
          return res.json({
            success: true,
            found: true,
            source: "open_library",
            isbn: cleaned,
            judul: book.title,
            penulis: authors,
            kategori: Array.isArray(book.subjects) && book.subjects.length > 0 ? book.subjects[0].name : "Umum",
            estimasi_harga: 85000,
            biaya_pokok: 34000
          });
        }
      }
    } catch {
      // ignore
    }

    // 4. Default automatic title so user NEVER has to type the title manually
    return res.json({
      success: true,
      found: true,
      source: "auto_generator",
      isbn: cleaned,
      judul: `Buku Terbitan (ISBN ${cleaned})`,
      penulis: "Penerbit Lamrimnesia",
      kategori: "Umum",
      estimasi_harga: 85000,
      biaya_pokok: 34000
    });
  } catch (error: any) {
    console.error("Error in /api/isbn-lookup:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memproses pencarian ISBN: " + (error?.message || String(error))
    });
  }
});

// Real-time streaming endpoint (Server-Sent Events) for immediate response
app.post("/api/gemini/stream", async (req: Request, res: Response) => {
  try {
    const { prompt, systemContext, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const ai = getAIClient();
    if (!ai) {
      const fallbackMsg = `[Mode Standar / Tanpa API Key]
Saya mencatat pertanyaan Anda: "${prompt}".
Untuk mengaktifkan kecerdasan penuh Gemini AI agar dapat menganalisis data dan menjawab secara bebas, silakan hubungkan GEMINI_API_KEY di pengaturan.`;
      res.write(`data: ${JSON.stringify({ chunk: fallbackMsg })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    const contents = buildConversationContents(prompt, systemContext, history);
    let streamStarted = false;

    for (const model of FAST_GEMINI_MODELS) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
            temperature: 0.75,
          }
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            streamStarted = true;
            res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
          }
        }

        res.write("data: [DONE]\n\n");
        return res.end();
      } catch (err: any) {
        const errStr = String(err?.message || err);
        const is503 = errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand");
        console.warn(`[AI Stream] Model ${model} ${is503 ? 'temporarily at capacity (503)' : 'encountered error'}, proceeding to fallback model...`);
        if (streamStarted) {
          res.write("data: [DONE]\n\n");
          return res.end();
        }
        // Try next fast model immediately
      }
    }

    // If all models failed to start, send helpful fallback based on prompt
    const fallbackSummary = `Maaf, server AI saat ini sedang mengalami lonjakan trafik tinggi. 
Namun data operasional MIS Anda tetap aman dan dapat diakses langsung melalui modul yang tersedia pada sistem dashboard SAPA-ALL. Silakan ajukan kembali pertanyaan Anda beberapa saat lagi.`;

    res.write(`data: ${JSON.stringify({ chunk: fallbackSummary })}\n\n`);
    res.write("data: [DONE]\n\n");
    return res.end();
  } catch (error: any) {
    console.error("Stream route fatal error:", error);
    try {
      res.write(`data: ${JSON.stringify({ error: error?.message || "Internal Server Error" })}\n\n`);
      res.write("data: [DONE]\n\n");
      res.end();
    } catch {
      // Ignored
    }
  }
});

app.post("/api/gemini", async (req: Request, res: Response) => {
  try {
    const { prompt, systemContext, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        success: true,
        output: `[Mode Standar / Tanpa API Key]\nPertanyaan Anda: "${prompt}". Hubungkan GEMINI_API_KEY untuk respon AI cerdas.`
      });
    }

    const contents = buildConversationContents(prompt, systemContext, history);

    try {
      const result = await generateWithFallback(ai, contents);
      return res.json({
        success: true,
        output: result.text,
      });
    } catch (apiError: any) {
      console.warn("Semua model Gemini sedang sibuk atau error:", apiError?.message);

      return res.json({
        success: true,
        output: `Maaf, server AI sedang mengalami lonjakan trafik saat ini. Silakan coba kembali sesaat lagi.`
      });
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal terhubung ke Google AI Gemini: " + (error.message || String(error)),
      error: error.message || String(error)
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: 3000 },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
