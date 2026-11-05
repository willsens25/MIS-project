import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite'
];

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
            res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
          }
        }

        streamSuccess = true;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed in Vercel stream, trying next:`, err?.message);
      }
    }

    if (!streamSuccess) {
      // Fallback single generation if stream had issues
      try {
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: fullPrompt,
        });
        if (fallbackRes.text) {
          res.write(`data: ${JSON.stringify({ chunk: fallbackRes.text })}\n\n`);
          streamSuccess = true;
        }
      } catch (fbErr: any) {
        lastError = fbErr;
      }
    }

    if (!streamSuccess) {
      const friendlyErr = `Maaf, server AI sedang mengalami kendala trafik: ${lastError?.message || 'Gagal memproses permintaan'}. Silakan coba kembali sesaat lagi.`;
      res.write(`data: ${JSON.stringify({ chunk: friendlyErr })}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    return res.end();

  } catch (err: any) {
    console.error('Vercel Gemini Stream Error:', err);
    try {
      res.write(`data: ${JSON.stringify({ chunk: `[Error Server AI]: ${err?.message || 'Terjadi kesalahan sistem'}` })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    } catch {
      return res.end();
    }
  }
}