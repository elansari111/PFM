<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Group::with(['students.user', 'modules.teacher.user']);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $groups = $query->orderBy('name')
            ->paginate($request->per_page ?? 20);

        return response()->json(['groups' => $groups]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGroupRequest $request)
    {
        $data = $request->validated();
        $group = \App\Models\Group::create($data);

        return response()->json([
            'message' => 'Group created successfully',
            'group' => $group->load('students.user')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $group = \App\Models\Group::with(['students.user', 'modules.teacher.user', 'modules.schedules'])
            ->findOrFail($id);
        return response()->json(['group' => $group]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGroupRequest $request, string $id)
    {
        $group = \App\Models\Group::findOrFail($id);
        $group->update($request->validated());

        return response()->json([
            'message' => 'Group updated successfully',
            'group' => $group->load('students.user')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $group = \App\Models\Group::findOrFail($id);
        $group->delete();

        return response()->json(['message' => 'Group deleted successfully']);
    }
}
