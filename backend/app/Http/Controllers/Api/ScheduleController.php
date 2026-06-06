<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Schedule::with(['module.teacher', 'classroom']);

        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->classroom_id);
        }

        if ($request->filled('day_of_week')) {
            $query->where('day_of_week', $request->day_of_week);
        }

        $schedules = $query->orderBy('day_of_week')
            ->orderBy('start_time')
            ->paginate($request->per_page ?? 20);

        return response()->json(['schedules' => $schedules]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreScheduleRequest $request)
    {
        $data = $request->validated();

        // Check for conflicts
        $conflictService = new \App\Services\ScheduleConflictService();
        $conflicts = $conflictService->checkConflicts($data);

        if (!empty($conflicts)) {
            // Broadcast conflict detection
            broadcast(new \App\Events\ScheduleConflictDetected($conflicts, $data));

            return response()->json([
                'message' => 'Schedule conflicts detected',
                'conflicts' => $conflicts,
            ], 422);
        }

        $schedule = \App\Models\Schedule::create($data);

        // Broadcast schedule update
        broadcast(new \App\Events\ScheduleUpdated($schedule, 'created'));

        return response()->json([
            'message' => 'Schedule created successfully',
            'schedule' => $schedule->load('module.teacher', 'classroom')
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $schedule = \App\Models\Schedule::with(['module.teacher', 'module.group', 'classroom'])
            ->findOrFail($id);
        return response()->json(['schedule' => $schedule]);
    }

    /**
     * Check for conflicts
     */
    public function checkConflicts(Request $request)
    {
        $data = $request->validate([
            'classroom_id' => 'required|exists:classrooms,id',
            'module_id' => 'required|exists:modules,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);

        $conflictService = new \App\Services\ScheduleConflictService();
        $conflicts = $conflictService->checkConflicts($data);

        return response()->json([
            'has_conflicts' => !empty($conflicts),
            'conflicts' => $conflicts,
        ]);
    }

    /**
     * Get conflicts for a specific day
     */
    public function getDayConflicts(Request $request)
    {
        $data = $request->validate([
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday',
        ]);

        $conflictService = new \App\Services\ScheduleConflictService();
        $conflicts = $conflictService->getDayConflicts($data['day_of_week']);

        return response()->json([
            'conflicts' => $conflicts,
        ]);
    }

    /**
     * Get schedules in FullCalendar format
     */
    public function calendarEvents(Request $request)
    {
        $query = \App\Models\Schedule::with(['module.teacher', 'module.group', 'classroom']);

        // Filter by user role
        $user = auth()->user();
        if ($user->student) {
            $groupIds = $user->student->group_id ? [$user->student->group_id] : [];
            $query->whereHas('module', function($q) use ($groupIds) {
                $q->whereIn('group_id', $groupIds);
            });
        } elseif ($user->teacher) {
            $teacherId = $user->teacher->id;
            $query->whereHas('module', function($q) use ($teacherId) {
                $q->where('teacher_id', $teacherId);
            });
        }

        if ($request->has('start') && $request->has('end')) {
            $startDate = \Carbon\Carbon::parse($request->start);
            $endDate = \Carbon\Carbon::parse($request->end);
            
            $events = [];
            $currentDate = $startDate->copy();
            
            while ($currentDate <= $endDate) {
                $dayOfWeek = strtolower($currentDate->format('l'));
                $daySchedules = (clone $query)->where('day_of_week', $dayOfWeek)->get();
                
                foreach ($daySchedules as $schedule) {
                    $eventDate = $currentDate->format('Y-m-d');
                    $events[] = [
                        'id' => $schedule->id,
                        'title' => $schedule->module->name,
                        'start' => $eventDate . 'T' . $schedule->start_time,
                        'end' => $eventDate . 'T' . $schedule->end_time,
                        'extendedProps' => [
                            'module_id' => $schedule->module_id,
                            'module_name' => $schedule->module->name,
                            'module_code' => $schedule->module->code,
                            'teacher_name' => $schedule->module->teacher ? $schedule->module->teacher->name : 'N/A',
                            'classroom_name' => $schedule->classroom->name,
                            'classroom_building' => $schedule->classroom->building,
                            'type' => $schedule->type,
                            'group_name' => $schedule->module->group ? $schedule->module->group->name : 'N/A',
                        ],
                        'backgroundColor' => $this->getEventColor($schedule->type),
                        'borderColor' => $this->getEventColor($schedule->type),
                    ];
                }
                
                $currentDate->addDay();
            }
            
            return response()->json($events);
        }

        return response()->json([]);
    }

    /**
     * Get color based on schedule type
     */
    private function getEventColor($type)
    {
        return match($type) {
            'lecture' => '#3b82f6',
            'lab' => '#10b981',
            'exam' => '#ef4444',
            'tutorial' => '#f59e0b',
            default => '#6b7280',
        };
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateScheduleRequest $request, string $id)
    {
        $schedule = \App\Models\Schedule::findOrFail($id);
        $data = $request->validated();

        // Check for conflicts
        $conflictService = new \App\Services\ScheduleConflictService();
        $conflicts = $conflictService->checkConflicts($data, $id);

        if (!empty($conflicts)) {
            // Broadcast conflict detection
            broadcast(new \App\Events\ScheduleConflictDetected($conflicts, $data));

            return response()->json([
                'message' => 'Schedule conflicts detected',
                'conflicts' => $conflicts,
            ], 422);
        }

        $schedule->update($data);

        // Broadcast schedule update
        broadcast(new \App\Events\ScheduleUpdated($schedule, 'updated'));

        return response()->json([
            'message' => 'Schedule updated successfully',
            'schedule' => $schedule->load('module.teacher', 'classroom')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $schedule = \App\Models\Schedule::findOrFail($id);
        $schedule->delete();

        // Broadcast schedule deletion
        broadcast(new \App\Events\ScheduleUpdated($schedule, 'deleted'));

        return response()->json(['message' => 'Schedule deleted successfully']);
    }
}
