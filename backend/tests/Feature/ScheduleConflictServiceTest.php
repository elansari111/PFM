<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\Group;
use App\Models\Module;
use App\Models\Role;
use App\Models\Schedule;
use App\Models\Teacher;
use App\Models\User;
use App\Services\ScheduleConflictService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduleConflictServiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles
        Role::create(['name' => 'Admin', 'slug' => 'admin', 'description' => 'Admin role']);
        Role::create(['name' => 'Teacher', 'slug' => 'teacher', 'description' => 'Teacher role']);
        Role::create(['name' => 'Student', 'slug' => 'student', 'description' => 'Student role']);
    }

    /**
     * Test classroom availability conflict prevention.
     */
    public function test_classroom_conflict_is_detected(): void
    {
        $classroom = Classroom::create([
            'name' => 'Amphi A',
            'building' => 'Block A',
            'capacity' => 120,
            'status' => 'available',
            'equipment' => ['projector', 'whiteboard']
        ]);

        $group = Group::create([
            'name' => 'G1_CS',
            'semester' => 'S1',
            'academic_year' => '2026'
        ]);

        $teacherUser = User::create([
            'name' => 'Prof. Smith',
            'email' => 'smith@univ.ma',
            'password' => bcrypt('password'),
            'role_id' => Role::where('slug', 'teacher')->first()->id
        ]);

        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'specialty' => 'Computer Science',
            'office' => 'B201'
        ]);

        $module1 = Module::create([
            'name' => 'Algebra 1',
            'code' => 'MATH101',
            'teacher_id' => $teacher->id,
            'group_id' => $group->id
        ]);

        // Existing schedule on Monday from 08:30 to 10:30
        Schedule::create([
            'module_id' => $module1->id,
            'classroom_id' => $classroom->id,
            'day_of_week' => 'monday',
            'start_time' => '08:30',
            'end_time' => '10:30',
            'type' => 'lecture'
        ]);

        $conflictService = new ScheduleConflictService();

        // 1. Overlapping classroom booking: Monday 09:00 - 11:00 (starts inside)
        $conflicts = $conflictService->checkConflicts([
            'classroom_id' => $classroom->id,
            'module_id' => $module1->id,
            'day_of_week' => 'monday',
            'start_time' => '09:00',
            'end_time' => '11:00',
        ]);

        $this->assertNotEmpty($conflicts);
        $this->assertEquals('classroom', $conflicts[0]['type']);

        // 2. Non-overlapping classroom booking: Monday 10:30 - 12:30
        $noConflicts = $conflictService->checkConflicts([
            'classroom_id' => $classroom->id,
            'module_id' => $module1->id,
            'day_of_week' => 'monday',
            'start_time' => '10:30',
            'end_time' => '12:30',
        ]);

        $this->assertEmpty($noConflicts);
    }

    /**
     * Test teacher availability conflict prevention.
     */
    public function test_teacher_conflict_is_detected(): void
    {
        $classroom1 = Classroom::create([
            'name' => 'Amphi A',
            'building' => 'Block A',
            'capacity' => 120,
            'status' => 'available',
        ]);

        $classroom2 = Classroom::create([
            'name' => 'Lab 2',
            'building' => 'Block B',
            'capacity' => 30,
            'status' => 'available',
        ]);

        $group1 = Group::create([
            'name' => 'G1_CS',
            'semester' => 'S1',
            'academic_year' => '2026'
        ]);

        $group2 = Group::create([
            'name' => 'G2_CS',
            'semester' => 'S1',
            'academic_year' => '2026'
        ]);

        $teacherUser = User::create([
            'name' => 'Prof. Smith',
            'email' => 'smith@univ.ma',
            'password' => bcrypt('password'),
            'role_id' => Role::where('slug', 'teacher')->first()->id
        ]);

        $teacher = Teacher::create([
            'user_id' => $teacherUser->id,
            'specialty' => 'Computer Science',
            'office' => 'B201'
        ]);

        $module1 = Module::create([
            'name' => 'Algebra 1',
            'code' => 'MATH101',
            'teacher_id' => $teacher->id,
            'group_id' => $group1->id
        ]);

        $module2 = Module::create([
            'name' => 'Physics 1',
            'code' => 'PHYS101',
            'teacher_id' => $teacher->id,
            'group_id' => $group2->id
        ]);

        // Teacher is teaching module1 in classroom1 on Monday from 14:00 to 16:00
        Schedule::create([
            'module_id' => $module1->id,
            'classroom_id' => $classroom1->id,
            'day_of_week' => 'monday',
            'start_time' => '14:00',
            'end_time' => '16:00',
            'type' => 'lecture'
        ]);

        $conflictService = new ScheduleConflictService();

        // Monday 15:00 - 17:00: Teacher overlap in classroom2 with module2
        $conflicts = $conflictService->checkConflicts([
            'classroom_id' => $classroom2->id,
            'module_id' => $module2->id,
            'day_of_week' => 'monday',
            'start_time' => '15:00',
            'end_time' => '17:00',
        ]);

        $this->assertNotEmpty($conflicts);
        $this->assertEquals('teacher', $conflicts[0]['type']);
    }

    /**
     * Test student group availability conflict prevention.
     */
    public function test_group_conflict_is_detected(): void
    {
        $classroom1 = Classroom::create([
            'name' => 'Amphi A',
            'building' => 'Block A',
            'capacity' => 120,
            'status' => 'available',
        ]);

        $classroom2 = Classroom::create([
            'name' => 'Lab 2',
            'building' => 'Block B',
            'capacity' => 30,
            'status' => 'available',
        ]);

        $group = Group::create([
            'name' => 'G1_CS',
            'semester' => 'S1',
            'academic_year' => '2026'
        ]);

        $teacherUser1 = User::create([
            'name' => 'Prof. Smith',
            'email' => 'smith@univ.ma',
            'password' => bcrypt('password'),
            'role_id' => Role::where('slug', 'teacher')->first()->id
        ]);

        $teacherUser2 = User::create([
            'name' => 'Prof. Jones',
            'email' => 'jones@univ.ma',
            'password' => bcrypt('password'),
            'role_id' => Role::where('slug', 'teacher')->first()->id
        ]);

        $teacher1 = Teacher::create([
            'user_id' => $teacherUser1->id,
            'specialty' => 'Computer Science',
            'office' => 'B201'
        ]);

        $teacher2 = Teacher::create([
            'user_id' => $teacherUser2->id,
            'specialty' => 'Mathematics',
            'office' => 'B202'
        ]);

        $module1 = Module::create([
            'name' => 'Algebra 1',
            'code' => 'MATH101',
            'teacher_id' => $teacher1->id,
            'group_id' => $group->id
        ]);

        $module2 = Module::create([
            'name' => 'Physics 1',
            'code' => 'PHYS101',
            'teacher_id' => $teacher2->id,
            'group_id' => $group->id
        ]);

        // Group is already having a class on Wednesday from 10:00 to 12:00
        Schedule::create([
            'module_id' => $module1->id,
            'classroom_id' => $classroom1->id,
            'day_of_week' => 'wednesday',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'type' => 'lecture'
        ]);

        $conflictService = new ScheduleConflictService();

        // Overlapping group booking on Wednesday 11:00 - 13:00
        $conflicts = $conflictService->checkConflicts([
            'classroom_id' => $classroom2->id,
            'module_id' => $module2->id,
            'day_of_week' => 'wednesday',
            'start_time' => '11:00',
            'end_time' => '13:00',
        ]);

        $this->assertNotEmpty($conflicts);
        $this->assertEquals('group', $conflicts[0]['type']);
    }
}
