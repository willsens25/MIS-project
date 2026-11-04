import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Inisialisasi SDK Gemini menggunakan API Key dari Environment Variable Vercel
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Batasi hanya menerima request POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message parameter is required' });
    }

    // 2. Panggil API Gemini untuk generate jawaban
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      // Opsional: kamu bisa menambahkan system instruction di sini jika ada
      // config: {
      //   systemInstruction: "Kamu adalah asisten AI untuk MIS-project...",
      // }
    });

    // 3. Kembalikan respons berformat JSON ke frontend
    return res.status(200).json({ text: response.text });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Terjadi kesalahan pada server AI.' 
    });
  }
}