<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');  // Change 'Dashboard' to 'dashboard'
    })->name('dashboard');
    
    Route::get('chat', function () {
        return Inertia::render('Chat');
    })->name('chat');
});

// Health Portal Routes
Route::prefix('health')->group(function () {
    Route::get('/', function () {
        return Inertia::render('Health/Home');
    })->name('health.home');
    
    Route::get('symptoms', function () {
        return Inertia::render('Health/Symptoms');
    })->name('health.symptoms');
    
    Route::get('medications', function () {
        return Inertia::render('Health/Medications');
    })->name('health.medications');
    
    Route::get('telehealth', function () {
        return Inertia::render('Health/Telehealth');
    })->name('health.telehealth');
    
    // Add the new AI Assistant route
    Route::get('assistant', function () {
        return Inertia::render('Health/Assistant');
    })->name('health.assistant');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
