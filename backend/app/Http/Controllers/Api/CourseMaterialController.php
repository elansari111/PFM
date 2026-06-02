<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CourseMaterialController extends Controller
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

        $materials = \App\Models\CourseMaterial::where('uploader_id', Auth::id())
            ->with(['module'])
            ->orderBy('published_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['materials' => $materials]);
    }

    use \App\Traits\UploadsSecureProcessing;

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $data = $request->validate([
            'module_id' => 'required|exists:modules,id',
            'title' => 'required|string|min:3|max:255',
            'description' => 'nullable|string|max:2000',
            'file' => 'required|file|mimes:pdf,doc,docx,ppt,pptx,zip|max:10240',
        ]);

        // Verify teacher owns the module
        $module = $teacher->modules()->findOrFail($data['module_id']);

        // Handle file upload securely
        if ($request->hasFile('file')) {
            $filePath = $this->storeSecurely($request->file('file'), 'course_materials');
            $data['file_path'] = $filePath;
            $data['file_type'] = $request->file('file')->getClientOriginalExtension();
            $data['file_size'] = $request->file('file')->getSize();
        }

        $data['uploader_id'] = Auth::id();
        $data['status'] = 'published';
        $data['published_at'] = now();

        $material = \App\Models\CourseMaterial::create($data);

        return response()->json([
            'message' => 'Course material uploaded successfully',
            'material' => $material->load('module', 'uploader')
        ], 201);
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

        $material = \App\Models\CourseMaterial::where('uploader_id', Auth::id())
            ->with(['module', 'uploader'])
            ->findOrFail($id);

        return response()->json(['material' => $material]);
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

        $material = \App\Models\CourseMaterial::where('uploader_id', Auth::id())
            ->findOrFail($id);

        $data = $request->validate([
            'title' => 'nullable|string|min:3|max:255',
            'description' => 'nullable|string|max:2000',
            'status' => 'nullable|in:draft,published,archived',
        ]);

        $material->update($data);

        return response()->json([
            'message' => 'Course material updated successfully',
            'material' => $material->load('module', 'uploader')
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

        $material = \App\Models\CourseMaterial::where('uploader_id', Auth::id())
            ->findOrFail($id);

        // Delete file from storage
        if ($material->file_path) {
            \Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return response()->json(['message' => 'Course material deleted successfully']);
    }
}
