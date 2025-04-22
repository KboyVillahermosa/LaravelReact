<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

// DeepAI API endpoint
Route::post('/chat', function (Request $request) {
    $validatedData = $request->validate([
        'prompt' => 'required|string|max:2000',
    ]);

    try {
        $response = Http::withHeaders([
            'api-key' => env('DEEPAI_API_KEY'),
            'Content-Type' => 'application/json',
        ])->post('https://api.deepai.org/api/text-generator', [
            'text' => $validatedData['prompt']
        ]);

        return $response->json();
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to get response from AI',
            'message' => $e->getMessage()
        ], 500);
    }
})->middleware('auth');