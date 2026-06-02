<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\User::with(['role', 'student', 'teacher']);

        if ($request->has('role')) {
            $query->whereHas('role', function($q) use ($request) {
                $q->where('slug', $request->role);
            });
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json(['users' => $users]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        $user = \App\Models\User::create($data);

        // Create role-specific profile
        if ($data['role_id']) {
            $role = \App\Models\Role::find($data['role_id']);
            if ($role) {
                if ($role->slug === 'student') {
                    $user->student()->create(['group_id' => $data['group_id'] ?? null]);
                } elseif ($role->slug === 'teacher') {
                    $user->teacher()->create();
                }
            }
        }

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('role', 'student', 'teacher')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = \App\Models\User::with(['role', 'student.group', 'teacher.modules'])->findOrFail($id);
        return response()->json(['user' => $user]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id)
    {
        $user = \App\Models\User::findOrFail($id);
        $data = $request->validated();

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);

        // Update role-specific profile
        if (isset($data['role_id'])) {
            $role = \App\Models\Role::find($data['role_id']);
            if ($role && $role->slug === 'student' && isset($data['group_id'])) {
                if (!$user->student) {
                    $user->student()->create(['group_id' => $data['group_id']]);
                } else {
                    $user->student->update(['group_id' => $data['group_id']]);
                }
            }
        }

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('role', 'student', 'teacher')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = \App\Models\User::findOrFail($id);
        
        // Delete associated profiles
        if ($user->student) {
            $user->student->delete();
        }
        if ($user->teacher) {
            $user->teacher->delete();
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}
