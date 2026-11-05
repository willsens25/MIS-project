import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY belum terpasang di Vercel.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { prompt, systemContext } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    const fullPrompt = `${systemContext || ''}\n\nPertanyaan: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
    });

    const replyText = response.text || 'Tidak ada tanggapan dari Gemini.';

    return res.status(200).json({ 
      output: replyText,
      message: replyText 
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Terjadi kesalahan pada server AI.' 
    });
  }
}