<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreModuleRequest;
use App\Http\Requests\UpdateModuleRequest;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Module::with(['group', 'teacher.user', 'schedules']);

        if ($request->has('group_id')) {
            $query->where('group_id', $request->group_id);
        }

        if ($request->has('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $modules = $query->orderBy('name')
            ->paginate($request->per_page ?? 20);

        return response()->json(['modules' => $modules]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreModuleRequest $request)
    {
        $data = $request->validated();
        $module = \App\Models\Module::create($data);

        return response()->json([
            'message' => 'Module created successfully',
            'module' => $module->load('group', 'teacher.user')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $module = \App\Models\Module::with(['group', 'teacher.user', 'schedules.classroom', 'grades.student.user'])
            ->findOrFail($id);
        return response()->json(['module' => $module]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateModuleRequest $request, string $id)
    {
        $module = \App\Models\Module::findOrFail($id);
        $module->update($request->validated());

        return response()->json([
            'message' => 'Module updated successfully',
            'module' => $module->load('group', 'teacher.user')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $module = \App\Models\Module::findOrFail($id);
        $module->delete();

        return response()->json(['message' => 'Module deleted successfully']);
    }
}
