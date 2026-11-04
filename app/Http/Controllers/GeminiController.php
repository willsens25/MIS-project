<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeminiController extends Controller
{
    private const MODEL = 'gemini-flash-latest';

    private const SYSTEM_INSTRUCTION = 'Kamu adalah asisten AI profesional untuk sistem MIS. Analisis input user dan berikan respons yang rapi, ringkas, dan jelas.';

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:4000',
        ]);

        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API Key Gemini belum terkonfigurasi. Isi GEMINI_API_KEY di file .env.'
            ], 500);
        }

        $response = Http::timeout(30)
            ->withHeaders([
                'Content-Type' => 'application/json',
                'x-goog-api-key' => $apiKey,
            ])
            ->post('https://generativelanguage.googleapis.com/v1beta/models/' . self::MODEL . ':generateContent', [
                'systemInstruction' => [
                    'parts' => [['text' => self::SYSTEM_INSTRUCTION]],
                ],
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [['text' => $validated['prompt']]],
                    ],
                ],
            ]);

        if (!$response->successful()) {
            report(new \RuntimeException('Gemini request failed: HTTP ' . $response->status()));

            return response()->json([
                'success' => false,
                'message' => 'Gagal terhubung ke Google AI Studio. Silakan coba lagi sesaat lagi.'
            ], 502);
        }

        $text = $response->json('candidates.0.content.parts.0.text');

        if (!is_string($text) || trim($text) === '') {
            return response()->json([
                'success' => false,
                'message' => 'AI tidak memberikan respon. Silakan ajukan ulang pertanyaan Anda.'
            ], 502);
        }

        return response()->json([
            'success' => true,
            'output' => $text,
        ]);
    }
}
