<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\RoomReservation;
use App\Models\Module;
use App\Models\Classroom;
use App\Models\Teacher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $adminRole = Role::factory()->create(['slug' => 'admin', 'name' => 'Admin']);
        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
    }

    public function test_admin_can_access_dashboard_stats()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'users',
                    'modules',
                    'groups',
                    'classrooms',
                    'absences',
                    'administrative_requests',
                    'room_reservations',
                    'grades'
                ]
            ]);
    }

    public function test_admin_can_list_room_reservations()
    {
        // Generate necessary data for a reservation
        $teacherRole = Role::factory()->create(['slug' => 'teacher', 'name' => 'Teacher']);
        $teacherUser = User::factory()->create(['role_id' => $teacherRole->id]);
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);
        
        $module = Module::factory()->create();
        $classroom = Classroom::factory()->create();

        RoomReservation::factory()->create([
            'user_id' => $teacherUser->id,
            'classroom_id' => $classroom->id,
            'status' => 'pending'
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/room-reservations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'reservations' => [
                    'data' => [
                        '*' => ['id', 'status', 'classroom', 'user']
                    ]
                ]
            ]);
    }

    public function test_admin_can_approve_pending_reservation()
    {
        $teacherRole = Role::factory()->create(['slug' => 'teacher', 'name' => 'Teacher']);
        $teacherUser = User::factory()->create(['role_id' => $teacherRole->id]);
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);
        
        $module = Module::factory()->create();
        $classroom = Classroom::factory()->create();

        $reservation = RoomReservation::factory()->create([
            'user_id' => $teacherUser->id,
            'classroom_id' => $classroom->id,
            'status' => 'pending'
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson("/api/admin/room-reservations/{$reservation->id}/approve");

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Room reservation approved successfully',
            ]);

        $this->assertDatabaseHas('room_reservations', [
            'id' => $reservation->id,
            'status' => 'approved',
            'approved_by' => $this->admin->id
        ]);
    }

    public function test_admin_can_reject_pending_reservation()
    {
        $teacherRole = Role::factory()->create(['slug' => 'teacher', 'name' => 'Teacher']);
        $teacherUser = User::factory()->create(['role_id' => $teacherRole->id]);
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);
        
        $module = Module::factory()->create();
        $classroom = Classroom::factory()->create();

        $reservation = RoomReservation::factory()->create([
            'user_id' => $teacherUser->id,
            'classroom_id' => $classroom->id,
            'status' => 'pending'
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson("/api/admin/room-reservations/{$reservation->id}/reject", [
            'rejection_reason' => 'Room is under maintenance'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Room reservation rejected successfully',
            ]);

        $this->assertDatabaseHas('room_reservations', [
            'id' => $reservation->id,
            'status' => 'rejected',
            'approved_by' => $this->admin->id,
            'rejection_reason' => 'Room is under maintenance'
        ]);
    }

    public function test_admin_cannot_approve_already_processed_reservation()
    {
        $teacherRole = Role::factory()->create(['slug' => 'teacher', 'name' => 'Teacher']);
        $teacherUser = User::factory()->create(['role_id' => $teacherRole->id]);
        $teacher = Teacher::factory()->create(['user_id' => $teacherUser->id]);
        
        $module = Module::factory()->create();
        $classroom = Classroom::factory()->create();

        $reservation = RoomReservation::factory()->create([
            'user_id' => $teacherUser->id,
            'classroom_id' => $classroom->id,
            'status' => 'approved' // Already approved
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')->postJson("/api/admin/room-reservations/{$reservation->id}/approve");

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Can only approve pending reservations',
            ]);
    }
}
