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
    const { prompt, systemContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt required' });
    }

    // Gabungkan data konteks sistem dengan pertanyaan pengguna
    const fullPrompt = `${systemContext || ''}\n\nPertanyaan: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    // Ambil isi teks teks balasan dari Gemini AI
    const aiText = response.text || 'Tidak ada respons dari AI.';

    // Kirimkan key output & message agar terbaca oleh AIAssistant.tsx
    return res.status(200).json({ 
      output: aiText,
      message: aiText 
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Terjadi kesalahan pada server AI.' 
    });
  }
}