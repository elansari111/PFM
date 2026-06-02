<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGradeRequest;
use App\Http\Requests\UpdateGradeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherController extends Controller
{
    /**
     * Get teacher's modules
     */
    public function modules(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $modules = $teacher->modules()
            ->with(['group', 'schedules'])
            ->orderBy('name')
            ->paginate($request->per_page ?? 10);

        return response()->json(['modules' => $modules]);
    }

    /**
     * Get students for a specific module
     */
    public function moduleStudents(Request $request, $moduleId)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $module = $teacher->modules()->findOrFail($moduleId);
        $students = $module->group->students()
            ->with(['user', 'grades' => function($query) use ($moduleId) {
                $query->where('module_id', $moduleId);
            }])
            ->orderBy('user.name')
            ->paginate($request->per_page ?? 20);

        return response()->json(['students' => $students]);
    }

    /**
     * Create or update grade for a student
     */
    public function storeGrade(StoreGradeRequest $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $data = $request->validated();
        
        // Verify teacher owns the module
        $module = $teacher->modules()->findOrFail($data['module_id']);
        
        // Verify student is in the module's group
        $student = \App\Models\Student::findOrFail($data['student_id']);
        if ($student->group_id !== $module->group_id) {
            return response()->json(['message' => 'Student is not enrolled in this module'], 403);
        }

        // Check if grade already exists
        $existingGrade = \App\Models\Grade::where('student_id', $data['student_id'])
            ->where('module_id', $data['module_id'])
            ->where('grade_type', $data['grade_type'])
            ->first();

        if ($existingGrade) {
            $existingGrade->update([
                'score' => $data['score'],
                'date' => $data['date'] ?? now(),
            ]);
            
            // Calculate final grade
            $this->calculateFinalGrade($data['student_id'], $data['module_id']);
            
            return response()->json([
                'message' => 'Grade updated successfully',
                'grade' => $existingGrade->load('module')
            ]);
        }

        $grade = \App\Models\Grade::create([
            'student_id' => $data['student_id'],
            'module_id' => $data['module_id'],
            'grade_type' => $data['grade_type'],
            'score' => $data['score'],
            'date' => $data['date'] ?? now(),
        ]);

        // Calculate final grade
        $this->calculateFinalGrade($data['student_id'], $data['module_id']);

        return response()->json([
            'message' => 'Grade created successfully',
            'grade' => $grade->load('module')
        ], 201);
    }

    /**
     * Calculate final grade for a student in a module
     * Formula: Final grade = ((CC1 + CC2)/2)*0.4 + Exam*0.6
     */
    private function calculateFinalGrade($studentId, $moduleId)
    {
        $grades = \App\Models\Grade::where('student_id', $studentId)
            ->where('module_id', $moduleId)
            ->get();

        $cc1 = $grades->where('grade_type', 'cc1')->first()?->score ?? 0;
        $cc2 = $grades->where('grade_type', 'cc2')->first()?->score ?? 0;
        $exam = $grades->where('grade_type', 'exam')->first()?->score ?? 0;

        // Calculate final grade
        $finalGrade = (($cc1 + $cc2) / 2) * 0.4 + ($exam * 0.6);
        $finalGrade = round($finalGrade, 2);

        // Update or create final grade record
        $finalGradeRecord = \App\Models\Grade::where('student_id', $studentId)
            ->where('module_id', $moduleId)
            ->where('grade_type', 'final')
            ->first();

        if ($finalGradeRecord) {
            $finalGradeRecord->update(['score' => $finalGrade]);
        } else {
            \App\Models\Grade::create([
                'student_id' => $studentId,
                'module_id' => $moduleId,
                'grade_type' => 'final',
                'score' => $finalGrade,
                'date' => now(),
            ]);
        }
    }

    /**
     * Get teacher's schedule
     */
    public function schedule(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $modules = $teacher->modules()
            ->with(['schedules.classroom', 'group'])
            ->get();

        $schedule = $modules->map(function ($module) {
            return $module->schedules->map(function ($schedule) use ($module) {
                return [
                    'id' => $schedule->id,
                    'module_name' => $module->name,
                    'group_name' => $module->group->name,
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
     * Get teacher's administrative requests
     */
    public function administrativeRequests(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $requests = $teacher->administrativeRequests()
            ->with(['generatedDocuments'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['requests' => $requests]);
    }

    /**
     * Submit administrative request
     */
    public function submitAdministrativeRequest(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $data = $request->validate([
            'type' => 'required|in:transcript,certificate,attestation,other',
            'title' => 'required|string|min:3|max:255',
            'description' => 'required|string|min:10|max:2000',
        ]);

        $data['teacher_id'] = $teacher->id;
        $data['submitted_at'] = now();

        $request = $teacher->administrativeRequests()->create($data);

        return response()->json([
            'message' => 'Administrative request submitted successfully',
            'request' => $request
        ], 201);
    }
}
