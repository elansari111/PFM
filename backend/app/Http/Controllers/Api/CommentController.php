<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $announcementId = $request->query('announcement_id');

        if ($announcementId) {
            $comments = \App\Models\Comment::where('announcement_id', $announcementId)
                ->with(['user'])
                ->orderBy('created_at', 'desc')
                ->paginate($request->per_page ?? 20);
        } else {
            $comments = \App\Models\Comment::where('user_id', Auth::id())
                ->with(['announcement'])
                ->orderBy('created_at', 'desc')
                ->paginate($request->per_page ?? 20);
        }

        return response()->json(['comments' => $comments]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'announcement_id' => 'required|exists:announcements,id',
            'content' => 'required|string|min:1|max:1000',
        ]);

        $data['user_id'] = Auth::id();

        $comment = \App\Models\Comment::create($data);

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => $comment->load('user')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $comment = \App\Models\Comment::with(['user', 'announcement'])
            ->findOrFail($id);

        return response()->json(['comment' => $comment]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $comment = \App\Models\Comment::where('user_id', Auth::id())
            ->findOrFail($id);

        $data = $request->validate([
            'content' => 'required|string|min:1|max:1000',
        ]);

        $comment->update($data);

        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => $comment->load('user')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $comment = \App\Models\Comment::where('user_id', Auth::id())
            ->findOrFail($id);

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}
