<?php

namespace App\Services;

use App\Models\Schedule;
use App\Models\Module;
use App\Models\Classroom;

class ScheduleConflictService
{
    /**
     * Check for schedule conflicts
     */
    public function checkConflicts(array $data, $excludeId = null)
    {
        $conflicts = [];

        // Check classroom availability
        $classroomConflict = $this->checkClassroomConflict(
            $data['classroom_id'],
            $data['day_of_week'],
            $data['start_time'],
            $data['end_time'],
            $excludeId
        );

        if ($classroomConflict) {
            $conflicts[] = [
                'type' => 'classroom',
                'message' => 'Classroom is already booked for this time slot',
                'conflicting_schedule' => $classroomConflict,
            ];
        }

        // Check teacher availability if module is assigned
        if (isset($data['module_id'])) {
            $module = Module::find($data['module_id']);
            if ($module && $module->teacher_id) {
                $teacherConflict = $this->checkTeacherConflict(
                    $module->teacher_id,
                    $data['day_of_week'],
                    $data['start_time'],
                    $data['end_time'],
                    $excludeId
                );

                if ($teacherConflict) {
                    $conflicts[] = [
                        'type' => 'teacher',
                        'message' => 'Teacher is already scheduled for this time slot',
                        'conflicting_schedule' => $teacherConflict,
                    ];
                }
            }
        }

        // Check group availability if module is assigned
        if (isset($data['module_id'])) {
            $module = Module::find($data['module_id']);
            if ($module && $module->group_id) {
                $groupConflict = $this->checkGroupConflict(
                    $module->group_id,
                    $data['day_of_week'],
                    $data['start_time'],
                    $data['end_time'],
                    $excludeId
                );

                if ($groupConflict) {
                    $conflicts[] = [
                        'type' => 'group',
                        'message' => 'Group is already scheduled for this time slot',
                        'conflicting_schedule' => $groupConflict,
                    ];
                }
            }
        }

        return $conflicts;
    }

    /**
     * Check if classroom is available
     */
    private function checkClassroomConflict($classroomId, $dayOfWeek, $startTime, $endTime, $excludeId)
    {
        return Schedule::where('classroom_id', $classroomId)
            ->where('day_of_week', $dayOfWeek)
            ->where(function($query) use ($startTime, $endTime) {
                $query->where(function($q) use ($startTime, $endTime) {
                    // New schedule starts during existing schedule
                    $q->where('start_time', '<=', $startTime)
                      ->where('end_time', '>', $startTime);
                })->orWhere(function($q) use ($startTime, $endTime) {
                    // New schedule ends during existing schedule
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>=', $endTime);
                })->orWhere(function($q) use ($startTime, $endTime) {
                    // New schedule completely contains existing schedule
                    $q->where('start_time', '>=', $startTime)
                      ->where('end_time', '<=', $endTime);
                });
            })
            ->when($excludeId, function($query) use ($excludeId) {
                return $query->where('id', '!=', $excludeId);
            })
            ->with(['module.teacher.user', 'classroom'])
            ->first();
    }

    /**
     * Check if teacher is available
     */
    private function checkTeacherConflict($teacherId, $dayOfWeek, $startTime, $endTime, $excludeId)
    {
        return Schedule::whereHas('module', function($query) use ($teacherId) {
            $query->where('teacher_id', $teacherId);
        })
            ->where('day_of_week', $dayOfWeek)
            ->where(function($query) use ($startTime, $endTime) {
                $query->where(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<=', $startTime)
                      ->where('end_time', '>', $startTime);
                })->orWhere(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>=', $endTime);
                })->orWhere(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '>=', $startTime)
                      ->where('end_time', '<=', $endTime);
                });
            })
            ->when($excludeId, function($query) use ($excludeId) {
                return $query->where('id', '!=', $excludeId);
            })
            ->with(['module.teacher.user', 'classroom'])
            ->first();
    }

    /**
     * Check if group is available
     */
    private function checkGroupConflict($groupId, $dayOfWeek, $startTime, $endTime, $excludeId)
    {
        return Schedule::whereHas('module', function($query) use ($groupId) {
            $query->where('group_id', $groupId);
        })
            ->where('day_of_week', $dayOfWeek)
            ->where(function($query) use ($startTime, $endTime) {
                $query->where(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<=', $startTime)
                      ->where('end_time', '>', $startTime);
                })->orWhere(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>=', $endTime);
                })->orWhere(function($q) use ($startTime, $endTime) {
                    $q->where('start_time', '>=', $startTime)
                      ->where('end_time', '<=', $endTime);
                });
            })
            ->when($excludeId, function($query) use ($excludeId) {
                return $query->where('id', '!=', $excludeId);
            })
            ->with(['module.teacher.user', 'classroom'])
            ->first();
    }

    /**
     * Get all conflicts for a specific day
     */
    public function getDayConflicts($dayOfWeek)
    {
        $schedules = Schedule::where('day_of_week', $dayOfWeek)
            ->with(['module.teacher.user', 'module.group', 'classroom'])
            ->orderBy('start_time')
            ->get();

        $conflicts = [];

        for ($i = 0; $i < $schedules->count(); $i++) {
            for ($j = $i + 1; $j < $schedules->count(); $j++) {
                $schedule1 = $schedules[$i];
                $schedule2 = $schedules[$j];

                if ($this->timeOverlap(
                    $schedule1->start_time,
                    $schedule1->end_time,
                    $schedule2->start_time,
                    $schedule2->end_time
                )) {
                    $conflictType = [];

                    if ($schedule1->classroom_id === $schedule2->classroom_id) {
                        $conflictType[] = 'classroom';
                    }
                    if ($schedule1->module->teacher_id === $schedule2->module->teacher_id) {
                        $conflictType[] = 'teacher';
                    }
                    if ($schedule1->module->group_id === $schedule2->module->group_id) {
                        $conflictType[] = 'group';
                    }

                    if (!empty($conflictType)) {
                        $conflicts[] = [
                            'schedule1' => $schedule1,
                            'schedule2' => $schedule2,
                            'conflict_type' => $conflictType,
                        ];
                    }
                }
            }
        }

        return $conflicts;
    }

    /**
     * Check if two time ranges overlap
     */
    private function timeOverlap($start1, $end1, $start2, $end2)
    {
        return $start1 < $end2 && $end1 > $start2;
    }
}
