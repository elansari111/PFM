<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{
    /**
     * Get student's grades with pagination
     */
    public function grades(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $grades = $student->grades()
            ->with(['module', 'module.teacher'])
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'grades' => $grades,
            'statistics' => [
                'average' => $student->grades()->avg('score'),
                'total' => $student->grades()->count(),
                'passed' => $student->grades()->where('score', '>=', 10)->count(),
            ]
        ]);
    }

    /**
     * Get student's absences with pagination
     */
    public function absences(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $absences = $student->absences()
            ->with(['module', 'schedule', 'justification'])
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'absences' => $absences,
            'statistics' => [
                'total' => $student->absences()->count(),
                'unjustified' => $student->absences()->whereNull('justification_id')->count(),
                'justified' => $student->absences()->whereNotNull('justification_id')->count(),
            ]
        ]);
    }

    /**
     * Get student's schedule
     */
    public function schedule(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $modules = $student->group->modules()
            ->with(['schedules.classroom', 'teacher'])
            ->get();

        $schedule = $modules->map(function ($module) {
            return $module->schedules->map(function ($schedule) use ($module) {
                return [
                    'id' => $schedule->id,
                    'module_name' => $module->name,
                    'teacher_name' => $module->teacher->user->name,
                    'classroom' => $schedule->classroom->name,
                    'day_of_week' => $schedule->day_of_week,
                    'start_time' => $schedule->start_time,
                    'end_time' => $schedule->end_time,
                    'type' => $schedule->type,
                ];
            });
        })->flatten()->sortBy('day_of_week')->values();

        return response()->json(['schedule' => $schedule]);
    }

    /**
     * Get announcements for student's group
     */
    public function announcements(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $announcements = \App\Models\Announcement::where('target_role', 'all')
            ->orWhere('target_role', 'student')
            ->orWhere('target_role', $student->group->name)
            ->with(['creator', 'comments'])
            ->orderBy('published_at', 'desc')
            ->where('status', 'published')
            ->paginate($request->per_page ?? 10);

        return response()->json(['announcements' => $announcements]);
    }

    /**
     * Get course materials for student's modules
     */
    public function courseMaterials(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $materials = \App\Models\CourseMaterial::whereIn('module_id', $student->group->modules->pluck('id'))
            ->with(['module', 'uploader'])
            ->where('status', 'published')
            ->orderBy('published_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['materials' => $materials]);
    }

    /**
     * Get student's administrative requests
     */
    public function administrativeRequests(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $requests = $student->administrativeRequests()
            ->with(['generatedDocuments'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['requests' => $requests]);
    }

    /**
     * Get student's generated documents
     */
    public function generatedDocuments(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $documents = $student->generatedDocuments()
            ->orderBy('generated_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['documents' => $documents]);
    }

    /**
     * Get student notifications
     */
    public function notifications(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        // Get recent grades
        $recentGrades = $student->grades()
            ->with('module')
            ->where('created_at', '>', now()->subDays(7))
            ->get();

        // Get recent announcements
        $recentAnnouncements = \App\Models\Announcement::where('target_role', 'all')
            ->orWhere('target_role', 'student')
            ->where('published_at', '>', now()->subDays(7))
            ->get();

        // Get pending justifications
        $pendingJustifications = $student->absenceJustifications()
            ->where('status', 'pending')
            ->get();

        // Get pending requests
        $pendingRequests = $student->administrativeRequests()
            ->whereIn('status', ['pending', 'in_progress'])
            ->get();

        $notifications = collect([
            ...$recentGrades->map(fn ($grade) => [
                'type' => 'grade',
                'title' => 'New Grade Posted',
                'message' => "You received a grade of {$grade->score}/20 in {$grade->module->name}",
                'created_at' => $grade->created_at,
            ]),
            ...$recentAnnouncements->map(fn ($announcement) => [
                'type' => 'announcement',
                'title' => $announcement->title,
                'message' => substr($announcement->content, 0, 100) . '...',
                'created_at' => $announcement->published_at,
            ]),
            ...$pendingJustifications->map(fn ($justification) => [
                'type' => 'justification',
                'title' => 'Absence Justification',
                'message' => 'Your absence justification is ' . $justification->status,
                'created_at' => $justification->created_at,
            ]),
            ...$pendingRequests->map(fn ($request) => [
                'type' => 'request',
                'title' => 'Administrative Request',
                'message' => "Your {$request->type} request is {$request->status}",
                'created_at' => $request->created_at,
            ]),
        ])->sortByDesc('created_at')->values();

        return response()->json(['notifications' => $notifications]);
    }
}
