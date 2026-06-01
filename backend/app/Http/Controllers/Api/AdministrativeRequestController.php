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
}
