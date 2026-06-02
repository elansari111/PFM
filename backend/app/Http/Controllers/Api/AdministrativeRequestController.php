<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdministrativeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdministrativeRequestController extends Controller
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

        $requests = $student->administrativeRequests()
            ->with(['generatedDocuments'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['requests' => $requests]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAdministrativeRequest $request)
    {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $data = $request->validated();
        $data['student_id'] = $student->id;
        $data['submitted_at'] = now();

        $request = $student->administrativeRequests()->create($data);

        return response()->json([
            'message' => 'Administrative request submitted successfully',
            'request' => $request
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

        $request = $student->administrativeRequests()
            ->with(['generatedDocuments'])
            ->findOrFail($id);

        return response()->json(['request' => $request]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        return response()->json(['message' => 'Cannot update submitted requests'], 403);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        return response()->json(['message' => 'Cannot delete submitted requests'], 403);
    }

    /**
     * Admin: Get all administrative requests
     */
    public function adminIndex(Request $request)
    {
        $query = \App\Models\AdministrativeRequest::with(['student.user', 'teacher.user', 'generatedDocuments']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $requests = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json(['requests' => $requests]);
    }

    /**
     * Admin: Validate administrative request
     */
    public function validate(Request $request, string $id)
    {
        $adminRequest = \App\Models\AdministrativeRequest::findOrFail($id);

        $data = $request->validate([
            'status' => 'required|in:approved,rejected,in_progress,completed',
            'reviewer_notes' => 'nullable|string|max:500',
        ]);

        $adminRequest->update([
            'status' => $data['status'],
            'reviewer_notes' => $data['reviewer_notes'] ?? null,
            'reviewed_at' => now(),
        ]);

        // Generate document if approved and type is transcript/certificate
        if ($data['status'] === 'approved' && in_array($adminRequest->type, ['transcript', 'certificate', 'attestation'])) {
            try {
                $pdfService = new \App\Services\PdfService();
                $documentPath = $pdfService->generateDocument($adminRequest);
                
                // Create generated document record
                \App\Models\GeneratedDocument::create([
                    'administrative_request_id' => $adminRequest->id,
                    'file_path' => $documentPath,
                    'generated_at' => now(),
                ]);

                $adminRequest->update(['status' => 'completed']);
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Log::error('PDF generation failed: ' . $e->getMessage());
                $adminRequest->update(['status' => 'in_progress']);
            }
        }

        return response()->json([
            'message' => 'Request validated successfully',
            'request' => $adminRequest->load('student.user', 'teacher.user', 'generatedDocuments')
        ]);
    }
}
