import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY belum dikonfigurasi di Vercel.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const { prompt, systemContext } = req.body || {};

    if (!prompt) {
      throw new Error('Prompt tidak boleh kosong.');
    }

    const fullPrompt = `${systemContext || ''}\n\nPertanyaan Pengguna: ${prompt}`;

    // UBAH NAMA MODEL DI SINI: gunakan 'gemini-3.6-flash'
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
    });

    const aiReply = response.text || 'Tidak ada teks dari AI.';

    res.write(`data: ${JSON.stringify({ chunk: aiReply })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    return res.end();

  } catch (err: any) {
    console.error('Vercel Gemini Error:', err);
    const errorMessage = `[Error AI Server]: ${err.message || 'Gagal memproses respons.'}`;
    res.write(`data: ${JSON.stringify({ chunk: errorMessage })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    return res.end();
  }
}