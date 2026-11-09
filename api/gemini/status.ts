import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

interface HealthStatusResult {
  status: 'healthy' | 'degraded' | 'quota_exceeded' | 'invalid_key' | 'unconfigured' | 'down';
  online: boolean;
  hasDisruption: boolean;
  severity: 'none' | 'warning' | 'critical';
  title: string;
  message: string;
  troubleshooting?: string;
  activeModel?: string;
  latencyMs: number;
  timestamp: string;
}

// In-memory cache to prevent hitting rate limits during health polling
let cachedStatus: HealthStatusResult | null = null;
let lastCheckTime = 0;
const CACHE_TTL_MS = 45 * 1000; // 45 seconds cache

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const force = req.query.force === 'true' || req.body?.force === true;
  const now = Date.now();

  if (!force && cachedStatus && (now - lastCheckTime < CACHE_TTL_MS)) {
    return res.status(200).json({
      ...cachedStatus,
      cached: true,
      ageSeconds: Math.round((now - lastCheckTime) / 1000)
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    const unconfiguredResult: HealthStatusResult = {
      status: 'unconfigured',
      online: false,
      hasDisruption: true,
      severity: 'critical',
      title: 'API Key Belum Terpasang',
      message: 'Kunci API GEMINI_API_KEY belum dikonfigurasi di Environment Variables.',
      troubleshooting: 'Tambahkan variabel GEMINI_API_KEY di pengaturan Vercel (Settings > Environment Variables) atau file .env.',
      activeModel: 'Belum terhubung',
      latencyMs: 0,
      timestamp: new Date().toISOString()
    };
    cachedStatus = unconfiguredResult;
    lastCheckTime = now;
    return res.status(200).json(unconfiguredResult);
  }

  const startTime = Date.now();

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Perform ultra-light probe using the efficient gemini-3.1-flash-lite model
    await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'ping',
      config: {
        maxOutputTokens: 5,
        temperature: 0.1
      }
    });

    const latencyMs = Date.now() - startTime;
    const healthyResult: HealthStatusResult = {
      status: 'healthy',
      online: true,
      hasDisruption: false,
      severity: 'none',
      title: 'Koneksi AI Optimal',
      message: 'Layanan Google Gemini AI terhubung dengan baik dan siap memproses perintah.',
      activeModel: 'gemini-3.8-flash (utama) & gemini-3.1-flash-lite (cadangan)',
      latencyMs,
      timestamp: new Date().toISOString()
    };

    cachedStatus = healthyResult;
    lastCheckTime = now;
    return res.status(200).json(healthyResult);

  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const errStr = String(error?.message || error);
    let result: HealthStatusResult;

    if (errStr.includes('503') || errStr.includes('high demand') || errStr.includes('UNAVAILABLE')) {
      result = {
        status: 'degraded',
        online: true,
        hasDisruption: true,
        severity: 'warning',
        title: 'Lonjakan Antrean Trafik (HTTP 503)',
        message: 'Pusat data Google AI saat ini sedang mengalami lonjakan trafik global sesaat.',
        troubleshooting: 'Sistem aplikasi otomatis beralih ke model cadangan dan sistem antrean. Anda tetap dapat mengirim pertanyaan.',
        activeModel: 'gemini-3.1-flash-lite (failover)',
        latencyMs,
        timestamp: new Date().toISOString()
      };
    } else if (errStr.includes('429') || errStr.includes('quota') || errStr.includes('RESOURCE_EXHAUSTED')) {
      result = {
        status: 'quota_exceeded',
        online: false,
        hasDisruption: true,
        severity: 'warning',
        title: 'Batas Kuota Tercapai (HTTP 429)',
        message: 'Batas kuota harian atau permintaan per menit API Gemini telah tercapai.',
        troubleshooting: 'Silakan tunggu sekitar 1-2 menit atau periksa kuota akun di Google AI Studio.',
        latencyMs,
        timestamp: new Date().toISOString()
      };
    } else if (errStr.includes('API_KEY_INVALID') || errStr.includes('API key not valid')) {
      result = {
        status: 'invalid_key',
        online: false,
        hasDisruption: true,
        severity: 'critical',
        title: 'Kunci API Tidak Valid',
        message: 'Kunci GEMINI_API_KEY ditolak oleh server Google AI.',
        troubleshooting: 'Periksa kembali API Key Anda di Google AI Studio dan pastikan sudah diperbarui di Vercel.',
        latencyMs,
        timestamp: new Date().toISOString()
      };
    } else {
      result = {
        status: 'down',
        online: false,
        hasDisruption: true,
        severity: 'critical',
        title: 'Gangguan Teknis Server AI',
        message: 'Koneksi ke gateway Google AI sedang mengalami gangguan.',
        troubleshooting: errStr.replace(/\{"error":\{.*?"message":"(.*?)"\}.*?\}/gs, '$1'),
        latencyMs,
        timestamp: new Date().toISOString()
      };
    }

    cachedStatus = result;
    lastCheckTime = now;
    return res.status(200).json(result);
  }
}
