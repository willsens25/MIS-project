import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY belum dikonfigurasi di Vercel.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const { prompt, systemContext } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }

    const fullPrompt = `${systemContext || ''}\n\nPertanyaan Pengguna: ${prompt}`;

    // Memanggil model Gemini 3.6 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
    });

    const aiReply = response.text || 'Tidak ada teks yang dikembalikan oleh AI.';

    // Kirim format Server-Sent Events (SSE) yang valid dalam skenario stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`data: ${JSON.stringify({ chunk: aiReply })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    return res.end();

  } catch (err: any) {
    console.error('Vercel Gemini Error:', err);
    // Kembalikan JSON error yang aman agar tidak memicu Unexpected Token 'A'
    return res.status(500).json({ 
      error: err.message || 'Terjadi kesalahan pada server AI.' 
    });
  }
}