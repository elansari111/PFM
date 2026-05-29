<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Admin routes
    Route::middleware('role:admin')->prefix('/admin')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Admin dashboard']);
        });
    });
    
    // Teacher routes
    Route::middleware('role:teacher')->prefix('/teacher')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Teacher dashboard']);
        });
    });
    
    // Student routes
    Route::middleware('role:student')->prefix('/student')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Student dashboard']);
        });
    });
});
