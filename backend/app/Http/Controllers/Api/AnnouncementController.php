<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnnouncementController extends Controller
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

        $announcements = \App\Models\Announcement::where('creator_id', Auth::id())
            ->with(['comments'])
            ->orderBy('published_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['announcements' => $announcements]);
    }

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
            'title' => 'required|string|min:3|max:255',
            'content' => 'required|string|min:10|max:5000',
            'target_role' => 'required|in:all,student,teacher,admin',
            'is_pinned' => 'nullable|boolean',
            'published_at' => 'nullable|date',
        ]);

        $data['creator_id'] = Auth::id();
        $data['status'] = 'published';
        $data['published_at'] = $data['published_at'] ?? now();

        $announcement = \App\Models\Announcement::create($data);

        return response()->json([
            'message' => 'Announcement created successfully',
            'announcement' => $announcement->load('creator')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $announcement = \App\Models\Announcement::with(['creator', 'comments'])
            ->findOrFail($id);

        return response()->json(['announcement' => $announcement]);
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

        $announcement = \App\Models\Announcement::where('creator_id', Auth::id())
            ->findOrFail($id);

        $data = $request->validate([
            'title' => 'nullable|string|min:3|max:255',
            'content' => 'nullable|string|min:10|max:5000',
            'target_role' => 'nullable|in:all,student,teacher,admin',
            'is_pinned' => 'nullable|boolean',
            'status' => 'nullable|in:draft,published,archived',
        ]);

        $announcement->update($data);

        return response()->json([
            'message' => 'Announcement updated successfully',
            'announcement' => $announcement->load('creator')
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

        $announcement = \App\Models\Announcement::where('creator_id', Auth::id())
            ->findOrFail($id);

        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted successfully']);
    }
}
