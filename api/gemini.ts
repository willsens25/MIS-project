import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ambil prompt dan systemContext dari body request React
    const { prompt, systemContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt parameter is required' });
    }

    // Gabungkan konteks data sistem dengan prompt pengguna
    const fullPrompt = `${systemContext || ''}\n\nPertanyaan Pengguna: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    // Sesuaikan format balasan JSON agar cocok dengan expectation React
    return res.status(200).json({ 
      output: response.text,
      message: response.text 
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Terjadi kesalahan pada server AI.' 
    });
  }
}