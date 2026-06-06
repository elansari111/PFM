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

        if ($request->filled('role')) {
            $query->whereHas('role', function($q) use ($request) {
                $q->where('slug', $request->role);
            });
        }

        if ($request->filled('search')) {
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
                $nameParts = explode(' ', $data['name'], 2);
                $firstName = $nameParts[0];
                $lastName = count($nameParts) > 1 ? $nameParts[1] : '';

                if ($role->slug === 'student') {
                    $user->student()->create([
                        'group_id' => $data['group_id'] ?? null,
                        'student_number' => 'STU-' . strtoupper(\Illuminate\Support\Str::random(6)),
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'enrollment_date' => now(),
                    ]);
                } elseif ($role->slug === 'teacher') {
                    $user->teacher()->create([
                        'employee_number' => 'T-' . strtoupper(\Illuminate\Support\Str::random(6)),
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'specialization' => 'General',
                        'hire_date' => now(),
                    ]);
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
        if (isset($data['role_id']) || isset($data['name'])) {
            $nameParts = explode(' ', $user->name, 2);
            $firstName = $nameParts[0];
            $lastName = count($nameParts) > 1 ? $nameParts[1] : '';

            $role = \App\Models\Role::find($user->role_id);
            if ($role) {
                if ($role->slug === 'student') {
                    if (!$user->student) {
                        $user->student()->create([
                            'group_id' => $data['group_id'] ?? null,
                            'student_number' => 'STU-' . strtoupper(\Illuminate\Support\Str::random(6)),
                            'first_name' => $firstName,
                            'last_name' => $lastName,
                            'enrollment_date' => now(),
                        ]);
                    } else {
                        $updateData = ['first_name' => $firstName, 'last_name' => $lastName];
                        if (array_key_exists('group_id', $data)) {
                            $updateData['group_id'] = $data['group_id'];
                        }
                        $user->student->update($updateData);
                    }
                } elseif ($role->slug === 'teacher') {
                    if (!$user->teacher) {
                        $user->teacher()->create([
                            'employee_number' => 'T-' . strtoupper(\Illuminate\Support\Str::random(6)),
                            'first_name' => $firstName,
                            'last_name' => $lastName,
                            'specialization' => 'General',
                            'hire_date' => now(),
                        ]);
                    } else {
                        $user->teacher->update(['first_name' => $firstName, 'last_name' => $lastName]);
                    }
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
