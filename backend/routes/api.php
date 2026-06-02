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
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\Api\AdminController::class, 'dashboard']);
        
        // CRUD operations
        Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
        Route::apiResource('roles', \App\Http\Controllers\Api\RoleController::class);
        Route::apiResource('groups', \App\Http\Controllers\Api\GroupController::class);
        Route::apiResource('modules', \App\Http\Controllers\Api\ModuleController::class);
        Route::apiResource('classrooms', \App\Http\Controllers\Api\ClassroomController::class);
        Route::apiResource('schedules', \App\Http\Controllers\Api\ScheduleController::class);
        Route::post('/schedules/check-conflicts', [\App\Http\Controllers\Api\ScheduleController::class, 'checkConflicts']);
        Route::get('/schedules/day-conflicts', [\App\Http\Controllers\Api\ScheduleController::class, 'getDayConflicts']);
        Route::get('/schedules/calendar-events', [\App\Http\Controllers\Api\ScheduleController::class, 'calendarEvents']);
        
        // Absence justifications validation
        Route::get('/absence-justifications', [\App\Http\Controllers\Api\AbsenceJustificationController::class, 'adminIndex']);
        Route::post('/absence-justifications/{id}/validate', [\App\Http\Controllers\Api\AbsenceJustificationController::class, 'validate']);
        
        // Administrative requests validation
        Route::get('/administrative-requests', [\App\Http\Controllers\Api\AdministrativeRequestController::class, 'adminIndex']);
        Route::post('/administrative-requests/{id}/validate', [\App\Http\Controllers\Api\AdministrativeRequestController::class, 'validate']);
        
        // Lesson logs (view all teachers' lesson logs)
        Route::apiResource('lesson-logs', \App\Http\Controllers\Api\LessonLogController::class)->only(['index', 'show']);
        
        // Room reservations management
        Route::get('/room-reservations', [\App\Http\Controllers\Api\AdminController::class, 'roomReservations']);
        Route::post('/room-reservations/{id}/approve', [\App\Http\Controllers\Api\AdminController::class, 'approveReservation']);
        Route::post('/room-reservations/{id}/reject', [\App\Http\Controllers\Api\AdminController::class, 'rejectReservation']);
    });
    
    // Teacher routes
    Route::middleware('role:teacher')->prefix('/teacher')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Teacher dashboard']);
        });
        
        // Teacher-specific endpoints
        Route::get('/modules', [\App\Http\Controllers\Api\TeacherController::class, 'modules']);
        Route::get('/modules/{moduleId}/students', [\App\Http\Controllers\Api\TeacherController::class, 'moduleStudents']);
        Route::post('/grades', [\App\Http\Controllers\Api\TeacherController::class, 'storeGrade']);
        Route::get('/schedule', [\App\Http\Controllers\Api\TeacherController::class, 'schedule']);
        Route::get('/schedule/calendar-events', [\App\Http\Controllers\Api\ScheduleController::class, 'calendarEvents']);
        Route::get('/administrative-requests', [\App\Http\Controllers\Api\TeacherController::class, 'administrativeRequests']);
        Route::post('/administrative-requests', [\App\Http\Controllers\Api\TeacherController::class, 'submitAdministrativeRequest']);
        
        // Attendance management
        Route::get('/attendance', [\App\Http\Controllers\Api\AttendanceController::class, 'index']);
        Route::post('/attendance', [\App\Http\Controllers\Api\AttendanceController::class, 'store']);
        Route::post('/attendance/bulk', [\App\Http\Controllers\Api\AttendanceController::class, 'bulkStore']);
        Route::get('/attendance/{id}', [\App\Http\Controllers\Api\AttendanceController::class, 'show']);
        Route::put('/attendance/{id}', [\App\Http\Controllers\Api\AttendanceController::class, 'update']);
        Route::delete('/attendance/{id}', [\App\Http\Controllers\Api\AttendanceController::class, 'destroy']);
        
        // Announcements
        Route::apiResource('announcements', \App\Http\Controllers\Api\AnnouncementController::class);
        
        // Course materials
        Route::apiResource('course-materials', \App\Http\Controllers\Api\CourseMaterialController::class);
        
        // Room reservations
        Route::apiResource('room-reservations', \App\Http\Controllers\Api\RoomReservationController::class);
        
        // Lesson logs (cahier de textes)
        Route::apiResource('lesson-logs', \App\Http\Controllers\Api\LessonLogController::class);
    });
    
    // Student routes
    Route::middleware('role:student')->prefix('/student')->group(function () {
        Route::get('/dashboard', function () {
            return response()->json(['message' => 'Student dashboard']);
        });
        
        // Student-specific endpoints
        Route::get('/grades', [\App\Http\Controllers\Api\StudentController::class, 'grades']);
        Route::get('/absences', [\App\Http\Controllers\Api\StudentController::class, 'absences']);
        Route::get('/schedule', [\App\Http\Controllers\Api\StudentController::class, 'schedule']);
        Route::get('/schedule/calendar-events', [\App\Http\Controllers\Api\ScheduleController::class, 'calendarEvents']);
        Route::get('/announcements', [\App\Http\Controllers\Api\StudentController::class, 'announcements']);
        Route::get('/course-materials', [\App\Http\Controllers\Api\StudentController::class, 'courseMaterials']);
        Route::get('/administrative-requests', [\App\Http\Controllers\Api\StudentController::class, 'administrativeRequests']);
        Route::get('/generated-documents', [\App\Http\Controllers\Api\StudentController::class, 'generatedDocuments']);
        Route::get('/notifications', [\App\Http\Controllers\Api\StudentController::class, 'notifications']);
        
        // Submit requests
        Route::post('/absence-justifications', [\App\Http\Controllers\Api\AbsenceJustificationController::class, 'store']);
        Route::post('/administrative-requests', [\App\Http\Controllers\Api\AdministrativeRequestController::class, 'store']);
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
