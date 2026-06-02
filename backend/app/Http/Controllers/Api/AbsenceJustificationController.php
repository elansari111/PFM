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

    use \App\Traits\UploadsSecureProcessing;

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

        // Handle file upload securely
        if ($request->hasFile('document')) {
            $documentPath = $this->storeSecurely($request->file('document'), 'absence_justifications');
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

    /**
     * Admin: Get all justifications for validation
     */
    public function adminIndex(Request $request)
    {
        $query = \App\Models\AbsenceJustification::with(['student.user', 'reviewer', 'absences.module']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $justifications = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json(['justifications' => $justifications]);
    }

    /**
     * Admin: Validate absence justification
     */
    public function validate(Request $request, string $id)
    {
        $justification = \App\Models\AbsenceJustification::findOrFail($id);

        $data = $request->validate([
            'status' => 'required|in:approved,rejected',
            'reviewer_notes' => 'nullable|string|max:500',
        ]);

        $justification->update([
            'status' => $data['status'],
            'reviewer_notes' => $data['reviewer_notes'] ?? null,
            'reviewer_id' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        // Update related absences if approved
        if ($data['status'] === 'approved') {
            $justification->absences()->update(['status' => 'excused']);
        }

        return response()->json([
            'message' => 'Justification validated successfully',
            'justification' => $justification->load('student.user', 'reviewer')
        ]);
    }
}
