<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function dashboard()
    {
        $stats = [
            'users' => [
                'total' => \App\Models\User::count(),
                'students' => \App\Models\User::whereHas('role', fn($q) => $q->where('slug', 'student'))->count(),
                'teachers' => \App\Models\User::whereHas('role', fn($q) => $q->where('slug', 'teacher'))->count(),
                'admins' => \App\Models\User::whereHas('role', fn($q) => $q->where('slug', 'admin'))->count(),
            ],
            'modules' => [
                'total' => \App\Models\Module::count(),
                'active' => \App\Models\Module::where('status', 'active')->count(),
            ],
            'groups' => [
                'total' => \App\Models\Group::count(),
                'total_students' => \App\Models\Student::count(),
            ],
            'classrooms' => [
                'total' => \App\Models\Classroom::count(),
            ],
            'absences' => [
                'total' => \App\Models\Absence::count(),
                'pending_justifications' => \App\Models\AbsenceJustification::where('status', 'pending')->count(),
            ],
            'administrative_requests' => [
                'total' => \App\Models\AdministrativeRequest::count(),
                'pending' => \App\Models\AdministrativeRequest::where('status', 'pending')->count(),
                'in_progress' => \App\Models\AdministrativeRequest::where('status', 'in_progress')->count(),
            ],
            'room_reservations' => [
                'total' => \App\Models\RoomReservation::count(),
                'pending' => \App\Models\RoomReservation::where('status', 'pending')->count(),
            ],
            'grades' => [
                'total' => \App\Models\Grade::count(),
                'average' => \App\Models\Grade::where('grade_type', 'final')->avg('score') ?? 0,
            ],
        ];

        return response()->json(['stats' => $stats]);
    }

    /**
     * Get all room reservations for management
     */
    public function roomReservations(Request $request)
    {
        $query = \App\Models\RoomReservation::with(['classroom', 'user']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereDate('start_datetime', $request->date);
        }

        $reservations = $query->orderBy('start_datetime', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json(['reservations' => $reservations]);
    }

    /**
     * Approve room reservation
     */
    public function approveReservation(Request $request, string $id)
    {
        $reservation = \App\Models\RoomReservation::findOrFail($id);

        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Can only approve pending reservations'], 403);
        }

        $reservation->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Room reservation approved successfully',
            'reservation' => $reservation->load('classroom', 'user')
        ]);
    }

    /**
     * Reject room reservation
     */
    public function rejectReservation(Request $request, string $id)
    {
        $reservation = \App\Models\RoomReservation::findOrFail($id);

        if ($reservation->status !== 'pending') {
            return response()->json(['message' => 'Can only reject pending reservations'], 403);
        }

        $data = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $reservation->update([
            'status' => 'rejected',
            'rejection_reason' => $data['rejection_reason'],
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Room reservation rejected successfully',
            'reservation' => $reservation->load('classroom', 'user')
        ]);
    }
}
