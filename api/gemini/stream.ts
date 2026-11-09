import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export const config = {
  supportsResponseStreaming: true,
  maxDuration: 30
};

// Priority list: Put stable, fast, high-capacity flash-lite first to avoid 503 high-demand capacity bottlenecks
const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-4-argon'
];

function formatErrorMessage(err: any): string {
  if (!err) return 'Terjadi kendala pada koneksi server AI.';
  const msg = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
    return 'Pusat data Google Gemini sedang mengalami lonjakan antrean trafik tinggi sesaat (HTTP 503 High Demand). Silakan coba kirim ulang dalam beberapa detik.';
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'Batas kuota permintaan harian/per menit Gemini API Anda sedang tercapai. Mohon tunggu sesaat sebelum mencoba kembali.';
  }
  if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
    return 'Kunci GEMINI_API_KEY tidak valid. Silakan periksa kembali API Key Anda di Google AI Studio dan perbarui di Settings Vercel.';
  }
  return msg.replace(/\{"error":\{.*?"message":"(.*?)"\}.*?\}/gs, '$1');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set Server-Sent Events headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    const errorMsg = '⚠️ Kunci API GEMINI_API_KEY belum dikonfigurasi di Vercel.\n\nSilakan buka Dashboard Vercel > Settings > Environment Variables, lalu tambahkan:\nNama: GEMINI_API_KEY\nNilai: [Kunci API Google AI Studio Anda]';
    res.write(`data: ${JSON.stringify({ chunk: errorMsg })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    return res.end();
  }

  try {
    const { prompt, systemContext } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.write(`data: ${JSON.stringify({ chunk: 'Mohon masukkan pertanyaan atau perintah terlebih dahulu.' })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

    const fullPrompt = `${systemContext ? `[Konteks & Database Terkini MIS Lamrimnesia]:\n${systemContext}\n\n` : ''}Pertanyaan Pengguna:\n${prompt}`;

    const ai = new GoogleGenAI({ apiKey });

    let streamSuccess = false;
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const stream = await ai.models.generateContentStream({
          model,
          contents: fullPrompt,
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            streamSuccess = true;
            res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
          }
        }

        if (streamSuccess) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Vercel Stream] Model ${model} failed, trying next candidate:`, err?.message || err);
        if (streamSuccess) {
          // If we already started streaming chunks, stop gracefully
          break;
        }
      }
    }

    if (!streamSuccess) {
      const friendlyErr = formatErrorMessage(lastError);
      res.write(`data: ${JSON.stringify({ chunk: friendlyErr })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    return res.end();

  } catch (err: any) {
    console.error('Vercel Gemini Stream Fatal Error:', err);
    try {
      res.write(`data: ${JSON.stringify({ chunk: `[Error Server AI]: ${err?.message || 'Terjadi kesalahan sistem'}` })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    } catch {
      return res.end();
    }
  }
}