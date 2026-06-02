<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $moduleId = $request->query('module_id');
        $date = $request->query('date');

        $query = \App\Models\Absence::query();

        if ($moduleId) {
            $module = $teacher->modules()->findOrFail($moduleId);
            $query->where('module_id', $moduleId);
        }

        if ($date) {
            $query->where('date', $date);
        } else {
            // Filter to only show absences from teacher's modules
            $query->whereIn('module_id', $teacher->modules->pluck('id'));
        }

        $absences = $query->with(['student.user', 'module', 'schedule'])
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json(['absences' => $absences]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAttendanceRequest $request)
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

        // Check if attendance already exists for this date and student
        $existingAttendance = \App\Models\Absence::where('student_id', $data['student_id'])
            ->where('module_id', $data['module_id'])
            ->where('date', $data['date'])
            ->first();

        if ($existingAttendance) {
            $existingAttendance->update([
                'status' => $data['status'],
                'notes' => $data['notes'] ?? null,
                'schedule_id' => $data['schedule_id'] ?? null,
            ]);

            return response()->json([
                'message' => 'Attendance updated successfully',
                'absence' => $existingAttendance->load('student.user', 'module')
            ]);
        }

        $absence = \App\Models\Absence::create([
            'student_id' => $data['student_id'],
            'module_id' => $data['module_id'],
            'schedule_id' => $data['schedule_id'] ?? null,
            'date' => $data['date'],
            'status' => $data['status'],
            'notes' => $data['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Attendance recorded successfully',
            'absence' => $absence->load('student.user', 'module')
        ], 201);
    }

    /**
     * Bulk record attendance for multiple students
     */
    public function bulkStore(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $data = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'date' => 'required|date',
            'schedule_id' => 'nullable|exists:schedules,id',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.notes' => 'nullable|string|max:500',
        ]);

        // Verify teacher owns the module
        $module = $teacher->modules()->findOrFail($data['module_id']);

        $results = [];
        foreach ($data['attendances'] as $attendanceData) {
            // Verify student is in the module's group
            $student = \App\Models\Student::findOrFail($attendanceData['student_id']);
            if ($student->group_id !== $module->group_id) {
                $results[] = [
                    'student_id' => $attendanceData['student_id'],
                    'success' => false,
                    'message' => 'Student not enrolled in this module'
                ];
                continue;
            }

            // Check if attendance already exists
            $existingAttendance = \App\Models\Absence::where('student_id', $attendanceData['student_id'])
                ->where('module_id', $data['module_id'])
                ->where('date', $data['date'])
                ->first();

            if ($existingAttendance) {
                $existingAttendance->update([
                    'status' => $attendanceData['status'],
                    'notes' => $attendanceData['notes'] ?? null,
                    'schedule_id' => $data['schedule_id'] ?? null,
                ]);
                $results[] = [
                    'student_id' => $attendanceData['student_id'],
                    'success' => true,
                    'message' => 'Attendance updated'
                ];
            } else {
                \App\Models\Absence::create([
                    'student_id' => $attendanceData['student_id'],
                    'module_id' => $data['module_id'],
                    'schedule_id' => $data['schedule_id'] ?? null,
                    'date' => $data['date'],
                    'status' => $attendanceData['status'],
                    'notes' => $attendanceData['notes'] ?? null,
                ]);
                $results[] = [
                    'student_id' => $attendanceData['student_id'],
                    'success' => true,
                    'message' => 'Attendance recorded'
                ];
            }
        }

        return response()->json([
            'message' => 'Bulk attendance recording completed',
            'results' => $results
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $absence = \App\Models\Absence::whereIn('module_id', $teacher->modules->pluck('id'))
            ->with(['student.user', 'module', 'schedule', 'justification'])
            ->findOrFail($id);

        return response()->json(['absence' => $absence]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $data = $request->validate([
            'status' => 'required|in:present,absent,late,excused',
            'notes' => 'nullable|string|max:500',
        ]);

        $absence = \App\Models\Absence::whereIn('module_id', $teacher->modules->pluck('id'))
            ->findOrFail($id);

        $absence->update($data);

        return response()->json([
            'message' => 'Attendance updated successfully',
            'absence' => $absence->load('student.user', 'module')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $absence = \App\Models\Absence::whereIn('module_id', $teacher->modules->pluck('id'))
            ->findOrFail($id);

        $absence->delete();

        return response()->json(['message' => 'Attendance deleted successfully']);
    }
}
