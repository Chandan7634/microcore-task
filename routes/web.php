<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\FollowUpController;
use App\Http\Controllers\CustomerController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/followups', [FollowUpController::class, 'index'])->name('followups.index');
    Route::get('/followups/create', [FollowUpController::class, 'create'])->name('followups.create');
    Route::post('/followups', [FollowUpController::class, 'store'])->name('followups.store');
    Route::get('/followups/{followUp}/edit', [FollowUpController::class, 'edit'])->name('followups.edit');
    Route::put('/followups/{followUp}', [FollowUpController::class, 'update'])->name('followups.update');
    Route::put('/followups/{followUp}/complete', [FollowUpController::class, 'markAsCompleted'])->name('followups.markAsCompleted');
    Route::delete('/followups/{followUp}', [FollowUpController::class, 'destroy'])->name('followups.destroy');
    
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/messages', [ChatController::class, 'getMessages'])->name('chat.messages');
    Route::post('/chat/send', [ChatController::class, 'sendMessage'])->name('chat.send');
    Route::put('/chat/{chat}', [ChatController::class, 'update'])->name('chat.update');
    Route::delete('/chat/{chat}', [ChatController::class, 'deleteForMe'])->name('chat.deleteForMe');
    Route::delete('/chat/{chat}', [ChatController::class, 'deleteForEveryone'])->name('chat.deleteForEveryone');
    Route::post('/chat/markAllAsRead', [ChatController::class, 'markAllAsRead'])->name('chat.markAllAsRead');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Customer Routes
    Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');
    Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create');
    Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store');
    Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy');
});

require __DIR__.'/auth.php';
