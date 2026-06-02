<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LessonLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\LessonLog::with(['teacher.user', 'module']);

        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->has('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->has('date_from')) {
            $query->where('date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('date', '<=', $request->date_to);
        }

        $lessonLogs = $query->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json(['lesson_logs' => $lessonLogs]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'module_id' => 'required|exists:modules,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'objective' => 'required|string|max:500',
            'nature' => 'required|in:Cours,TD,TP',
            'notes' => 'nullable|string|max:1000',
        ]);

        $lessonLog = \App\Models\LessonLog::create($data);

        return response()->json([
            'message' => 'Lesson log created successfully',
            'lesson_log' => $lessonLog->load('teacher.user', 'module')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $lessonLog = \App\Models\LessonLog::with(['teacher.user', 'module'])
            ->findOrFail($id);
        return response()->json(['lesson_log' => $lessonLog]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $lessonLog = \App\Models\LessonLog::findOrFail($id);

        $data = $request->validate([
            'date' => 'nullable|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'objective' => 'nullable|string|max:500',
            'nature' => 'nullable|in:Cours,TD,TP',
            'notes' => 'nullable|string|max:1000',
        ]);

        $lessonLog->update($data);

        return response()->json([
            'message' => 'Lesson log updated successfully',
            'lesson_log' => $lessonLog->load('teacher.user', 'module')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $lessonLog = \App\Models\LessonLog::findOrFail($id);
        $lessonLog->delete();

        return response()->json(['message' => 'Lesson log deleted successfully']);
    }
}
