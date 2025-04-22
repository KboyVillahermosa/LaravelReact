<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatSessionController;

// Chat session routes
Route::get('/chat-sessions', [ChatSessionController::class, 'index']);
Route::post('/chat-sessions', [ChatSessionController::class, 'store']);
Route::delete('/chat-sessions/{id}', [ChatSessionController::class, 'destroy']);

// Test route to verify API is accessible
Route::get('/test', function() {
    return response()->json(['message' => 'API is working']);
});