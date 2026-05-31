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
        Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
        Route::apiResource('roles', \App\Http\Controllers\Api\RoleController::class);
        Route::apiResource('groups', \App\Http\Controllers\Api\GroupController::class);
    });
    
    // Teacher routes
    Route::middleware('role:teacher')->prefix('/teacher')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Teacher dashboard']);
        });
        Route::apiResource('modules', \App\Http\Controllers\Api\ModuleController::class);
        Route::apiResource('schedules', \App\Http\Controllers\Api\ScheduleController::class);
        Route::apiResource('grades', \App\Http\Controllers\Api\GradeController::class);
        Route::apiResource('announcements', \App\Http\Controllers\Api\AnnouncementController::class);
        Route::apiResource('course-materials', \App\Http\Controllers\Api\CourseMaterialController::class);
    });
    
    // Student routes
    Route::middleware('role:student')->prefix('/student')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Student dashboard']);
        });
        Route::get('/modules', function () {
            return response()->json(['message' => 'Student modules']);
        });
        Route::get('/grades', function () {
            return response()->json(['message' => 'Student grades']);
        });
        Route::get('/absences', function () {
            return response()->json(['message' => 'Student absences']);
        });
        Route::post('/absence-justifications', [\App\Http\Controllers\Api\AbsenceJustificationController::class, 'store']);
        Route::post('/administrative-requests', [\App\Http\Controllers\Api\AdministrativeRequestController::class, 'store']);
        Route::get('/generated-documents', function () {
            return response()->json(['message' => 'Student documents']);
        });
    });
    
    // Common routes (accessible by multiple roles)
    Route::middleware('role:admin,teacher')->group(function () {
        Route::apiResource('classrooms', \App\Http\Controllers\Api\ClassroomController::class);
        Route::apiResource('room-reservations', \App\Http\Controllers\Api\RoomReservationController::class);
    });
    
    Route::middleware('role:admin,teacher,student')->group(function () {
        Route::apiResource('comments', \App\Http\Controllers\Api\CommentController::class)->only(['index', 'show', 'store']);
    });
});
