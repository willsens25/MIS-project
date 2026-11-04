<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeminiController extends Controller
{
    private const MODEL = 'gemini-flash-latest';

    private const SYSTEM_INSTRUCTION = 'Kamu adalah asisten AI profesional untuk sistem MIS. Analisis input user dan berikan respons yang rapi, ringkas, dan jelas.';

    private const MAX_HISTORY_TURNS = 6;

    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => 'required|string|max:4000',
            'systemContext' => 'nullable|string|max:20000',
            'history' => 'nullable|array|max:20',
            'history.*.role' => 'required|in:user,assistant',
            'history.*.content' => 'required|string|max:4000',
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
                'contents' => $this->buildContents(
                    $validated['prompt'],
                    $validated['systemContext'] ?? null,
                    $validated['history'] ?? [],
                ),
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

    private function buildContents(string $prompt, ?string $systemContext, array $history): array
    {
        $contents = [];

        foreach (array_slice($history, -self::MAX_HISTORY_TURNS) as $turn) {
            $contents[] = [
                'role' => $turn['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $turn['content']]],
            ];
        }

        $contextBlock = $systemContext
            ? "[Konteks & Database Terkini MIS Lamrimnesia]:\n{$systemContext}\n\n"
            : '';

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $contextBlock . "Permintaan/Instruksi Pengguna:\n" . $prompt]],
        ];

        return $contents;
    }
}
