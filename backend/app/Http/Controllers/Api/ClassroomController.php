<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClassroomRequest;
use App\Http\Requests\UpdateClassroomRequest;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Classroom::with(['schedules.module', 'roomReservations']);

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $classrooms = $query->orderBy('name')
            ->paginate($request->per_page ?? 20);

        return response()->json(['classrooms' => $classrooms]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreClassroomRequest $request)
    {
        $data = $request->validated();
        $classroom = \App\Models\Classroom::create($data);

        return response()->json([
            'message' => 'Classroom created successfully',
            'classroom' => $classroom
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $classroom = \App\Models\Classroom::with(['schedules.module.teacher.user', 'roomReservations.teacher.user'])
            ->findOrFail($id);
        return response()->json(['classroom' => $classroom]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateClassroomRequest $request, string $id)
    {
        $classroom = \App\Models\Classroom::findOrFail($id);
        $classroom->update($request->validated());

        return response()->json([
            'message' => 'Classroom updated successfully',
            'classroom' => $classroom
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $classroom = \App\Models\Classroom::findOrFail($id);
        $classroom->delete();

        return response()->json(['message' => 'Classroom deleted successfully']);
    }
}
