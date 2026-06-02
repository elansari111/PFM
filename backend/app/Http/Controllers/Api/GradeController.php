<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Grade::with(['student.user', 'module']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->has('grade_type')) {
            $query->where('grade_type', $request->grade_type);
        }

        $grades = $query->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json(['grades' => $grades]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'student_id' => 'required|exists:students,id',
            'module_id' => 'required|exists:modules,id',
            'grade_type' => 'required|in:cc1,cc2,exam,final',
            'score' => 'required|numeric|min:0|max:20',
            'date' => 'nullable|date',
            'comments' => 'nullable|string|max:500',
        ]);

        $grade = \App\Models\Grade::create([
            'student_id' => $data['student_id'],
            'module_id' => $data['module_id'],
            'grade_type' => $data['grade_type'],
            'score' => $data['score'],
            'date' => $data['date'] ?? now(),
            'comments' => $data['comments'] ?? null,
        ]);

        return response()->json([
            'message' => 'Grade created successfully',
            'grade' => $grade->load('student.user', 'module')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $grade = \App\Models\Grade::with(['student.user', 'module'])
            ->findOrFail($id);
        return response()->json(['grade' => $grade]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $grade = \App\Models\Grade::findOrFail($id);

        $data = $request->validate([
            'score' => 'nullable|numeric|min:0|max:20',
            'date' => 'nullable|date',
            'comments' => 'nullable|string|max:500',
        ]);

        $grade->update($data);

        return response()->json([
            'message' => 'Grade updated successfully',
            'grade' => $grade->load('student.user', 'module')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $grade = \App\Models\Grade::findOrFail($id);
        $grade->delete();

        return response()->json(['message' => 'Grade deleted successfully']);
    }
}
