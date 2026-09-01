<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class GeminiController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string',
        ]);

        $apiKey = config('services.gemini.key');

        if (!$apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API Key Gemini belum terkonfigurasi di config/services.php'
            ], 500);
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={$apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $request->prompt]
                    ]
                ]
            ]
        ]);

        if ($response->successful()) {
            $result = $response->json();
            $text = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'Tidak ada respon dari AI.';
            
            return response()->json([
                'success' => true,
                'output' => $text
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Gagal terhubung ke Google AI Studio.',
            'error' => $response->json()
        ], 500);
    }
}