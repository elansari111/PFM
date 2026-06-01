<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAbsenceJustificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AbsenceJustificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $justifications = $student->absenceJustifications()
            ->with(['reviewer', 'absences'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['justifications' => $justifications]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAbsenceJustificationRequest $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('document')) {
            $documentPath = $request->file('document')->store('absence_justifications', 'public');
            $data['document_path'] = $documentPath;
        }

        $justification = $student->absenceJustifications()->create($data);

        // Link to specific absences if provided
        if ($request->has('absence_ids')) {
            $justification->absences()->sync($request->absence_ids);
        }

        return response()->json([
            'message' => 'Absence justification submitted successfully',
            'justification' => $justification->load('absences')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $justification = $student->absenceJustifications()
            ->with(['reviewer', 'absences.module'])
            ->findOrFail($id);

        return response()->json(['justification' => $justification]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        return response()->json(['message' => 'Cannot update submitted justifications'], 403);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        return response()->json(['message' => 'Cannot delete submitted justifications'], 403);
    }
}
