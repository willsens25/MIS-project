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

// Helper function for calling Gemini with model fallback and retries
async function generateWithFallback(ai: GoogleGenAI, fullPrompt: string) {
  const models = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-2.5-flash", "gemini-2.5-pro"];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: fullPrompt,
        });
        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || errMsg.includes("429");
        
        // If 404 (model deprecated for account), break to next model immediately
        if (errMsg.includes("404") || errMsg.includes("NOT_FOUND") || errMsg.includes("no longer available")) {
          break;
        }

        if (isTransient && attempt === 1) {
          // brief pause before retry
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        break; // try next model
      }
    }
  }

  throw lastError;
}

app.post("/api/gemini", async (req: Request, res: Response) => {
  try {
    const { prompt, systemContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.json({
        success: true,
        output: `[Mode Standar / Tanpa API Key]
Ringkasan Data MIS SAPA-ALL:
- Sistem mengelola 6 divisi: Direktorat, Bendahara/Finance, Penerbitan, Marketing, Produksi, dan Logistik.
- Pertanyaan Anda: "${prompt}".
- Untuk mengaktifkan Gemini AI cerdas sepenuhnya, tambahkan GEMINI_API_KEY di Settings/Environment.`
      });
    }

    const fullPrompt = `${systemContext ? `Konteks Sistem MIS SAPA-ALL:\n${systemContext}\n\n` : ''}Pertanyaan/Perintah User:\n${prompt}\n\nBerikan jawaban yang jelas, profesional, dan berbasis data MIS dalam Bahasa Indonesia.`;

    try {
      const result = await generateWithFallback(ai, fullPrompt);
      return res.json({
        success: true,
        output: result.text,
      });
    } catch (apiError: any) {
      console.warn("Semua model Gemini sedang sibuk atau error:", apiError?.message);

      // Graceful fallback response using local context summary when 503 / high demand occurs
      const isCapacityIssue =
        apiError?.message?.includes("503") ||
        apiError?.message?.includes("UNAVAILABLE") ||
        apiError?.message?.includes("high demand") ||
        apiError?.message?.includes("429");

      if (isCapacityIssue) {
        return res.json({
          success: true,
          output: `⚠️ *Layanan Gemini Cloud sedang mengalami lonjakan trafik (503 High Demand). Berikut analisis instan dari ringkasan data lokal MIS:*

${systemContext ? `📌 **Ringkasan Operasional Terkini:**\n${systemContext.split('\n').slice(0, 10).join('\n')}\n\n` : ''}💡 *Terkait pertanyaan Anda ("${prompt}"): Anda dapat mengecek detail langsung melalui modul divisi terkait pada dashboard SAPA-ALL, atau silakan coba ulangi pertanyaan Anda beberapa saat lagi.*`
        });
      }

      throw apiError;
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
