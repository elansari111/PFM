<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoomReservationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RoomReservationController extends Controller
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

        $reservations = $teacher->roomReservations()
            ->with(['classroom', 'module'])
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json(['reservations' => $reservations]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoomReservationRequest $request)
    {
        $teacher = Auth::user()->teacher;
        
        if (!$teacher) {
            return response()->json(['message' => 'Teacher profile not found'], 404);
        }

        $data = $request->validated();
        $data['teacher_id'] = $teacher->id;
        $data['status'] = 'pending';

        // Check for conflicting reservations
        $conflict = \App\Models\RoomReservation::where('classroom_id', $data['classroom_id'])
            ->where('date', $data['date'])
            ->where('start_time', '<=', $data['end_time'])
            ->where('end_time', '>=', $data['start_time'])
            ->where('status', '!=', 'cancelled')
            ->first();

        if ($conflict) {
            return response()->json([
                'message' => 'Room is already reserved for this time slot',
                'conflict' => $conflict
            ], 409);
        }

        $reservation = $teacher->roomReservations()->create($data);

        return response()->json([
            'message' => 'Room reservation submitted successfully',
            'reservation' => $reservation->load('classroom', 'module')
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

        $reservation = $teacher->roomReservations()
            ->with(['classroom', 'module'])
            ->findOrFail($id);

        return response()->json(['reservation' => $reservation]);
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

        $reservation = $teacher->roomReservations()->findOrFail($id);

        // Only allow cancellation for pending reservations
        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Cannot update approved or completed reservations'], 403);
        }

        $data = $request->validate([
            'date' => 'nullable|date|after:today',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'purpose' => 'nullable|string|max:500',
        ]);

        // Check for conflicts if date/time is being changed
        if (isset($data['date']) || isset($data['start_time']) || isset($data['end_time'])) {
            $conflict = \App\Models\RoomReservation::where('classroom_id', $reservation->classroom_id)
                ->where('id', '!=', $id)
                ->where('date', $data['date'] ?? $reservation->date)
                ->where('start_time', '<=', $data['end_time'] ?? $reservation->end_time)
                ->where('end_time', '>=', $data['start_time'] ?? $reservation->start_time)
                ->where('status', '!=', 'cancelled')
                ->first();

            if ($conflict) {
                return response()->json([
                    'message' => 'Room is already reserved for this time slot',
                    'conflict' => $conflict
                ], 409);
            }
        }

        $reservation->update($data);

        return response()->json([
            'message' => 'Room reservation updated successfully',
            'reservation' => $reservation->load('classroom', 'module')
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

        $reservation = $teacher->roomReservations()->findOrFail($id);

        // Only allow cancellation for pending reservations
        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Cannot cancel approved or completed reservations'], 403);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Room reservation cancelled successfully']);
    }
}
