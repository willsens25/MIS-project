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

    const fullPrompt = `${systemContext || ''}\n\nPertanyaan: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const formattedChunk = JSON.stringify({ chunk: response.text });
    res.write(`data: ${formattedChunk}\n\n`);
    res.write(`data: [DONE]\n\n`);
    return res.end();
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    return res.status(500).json({ error: error.message });
  }
}