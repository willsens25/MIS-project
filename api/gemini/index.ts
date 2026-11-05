import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-4-argon'
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function formatErrorMessage(err: any): string {
  if (!err) return 'Terjadi kendala pada koneksi server AI.';
  const msg = typeof err === 'string' ? err : err.message || JSON.stringify(err);
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
    return 'Pusat data Google Gemini sedang mengalami antrean trafik tinggi sesaat (HTTP 503 High Demand). Silakan coba kirim ulang dalam beberapa detik.';
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
    return 'Batas kuota harian/per menit Gemini API Anda sedang tercapai. Mohon tunggu sesaat sebelum mencoba kembali.';
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

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    const errorMsg = '⚠️ Kunci API GEMINI_API_KEY belum terpasang di Vercel.\n\nSilakan buka Dashboard Vercel > Settings > Environment Variables, lalu tambahkan:\nNama: GEMINI_API_KEY\nNilai: [Kunci API Google AI Studio Anda]';
    return res.status(200).json({
      success: false,
      output: errorMsg,
      message: errorMsg
    });
  }

  try {
    const { prompt, systemContext } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    const fullPrompt = `${systemContext ? `[Konteks & Database Terkini MIS Lamrimnesia]:\n${systemContext}\n\n` : ''}Pertanyaan Pengguna:\n${prompt}`;

    const ai = new GoogleGenAI({ apiKey });

    let replyText = '';
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: fullPrompt,
        });

        if (response.text) {
          replyText = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err);
        const is503 = errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');
        console.warn(`Model ${model} ${is503 ? 'kapasitas padat (503)' : 'error'} di Vercel function, lanjut ke alternatif...`);
        if (is503) {
          await sleep(350);
        }
      }
    }

    if (!replyText) {
      replyText = formatErrorMessage(lastError);
    }

    return res.status(200).json({
      success: true,
      output: replyText,
      message: replyText
    });

  } catch (error: any) {
    console.error('Gemini API Error in Vercel function:', error);
    const friendly = formatErrorMessage(error);
    return res.status(200).json({
      success: false,
      output: friendly,
      message: friendly
    });
  }
}