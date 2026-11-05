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
        console.warn(`Model ${model} failed in Vercel API, trying next:`, err?.message);
      }
    }

    if (!replyText) {
      replyText = `Maaf, server AI sedang mengalami lonjakan trafik: ${lastError?.message || 'Tidak ada respons dari model'}. Silakan coba kembali sesaat lagi.`;
    }

    return res.status(200).json({
      success: true,
      output: replyText,
      message: replyText
    });

  } catch (error: any) {
    console.error('Gemini API Error in Vercel function:', error);
    return res.status(200).json({
      success: false,
      output: `[Error Server AI]: ${error?.message || 'Terjadi kesalahan pada server AI.'}`,
      message: `[Error Server AI]: ${error?.message || 'Terjadi kesalahan pada server AI.'}`
    });
  }
}
