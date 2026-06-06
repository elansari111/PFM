<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    private $admin;
    private $adminRole;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->adminRole = Role::factory()->create(['slug' => 'admin', 'name' => 'Admin']);
        $this->admin = User::factory()->create(['role_id' => $this->adminRole->id]);
    }

    public function test_admin_can_list_users()
    {
        User::factory()->count(3)->create(['role_id' => $this->adminRole->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'users' => [
                    'data' => [
                        '*' => ['id', 'name', 'email', 'role']
                    ]
                ]
            ]);
    }

    public function test_admin_can_create_student_user()
    {
        $studentRole = Role::factory()->create(['slug' => 'student', 'name' => 'Student']);
        $group = Group::factory()->create();

        $userData = [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => $studentRole->id,
            'group_id' => $group->id
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/admin/users', $userData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'User created successfully',
            ]);
            
        $this->assertDatabaseHas('users', ['email' => 'johndoe@example.com']);
        $this->assertDatabaseHas('students', ['group_id' => $group->id]);
    }

    public function test_admin_can_create_teacher_user()
    {
        $teacherRole = Role::factory()->create(['slug' => 'teacher', 'name' => 'Teacher']);

        $userData = [
            'name' => 'Jane Smith',
            'email' => 'janesmith@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => $teacherRole->id
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/admin/users', $userData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'User created successfully',
            ]);
            
        $this->assertDatabaseHas('users', ['email' => 'janesmith@example.com']);
        $this->assertDatabaseHas('teachers', []); // Just check if a teacher profile was created
    }

    public function test_admin_can_view_specific_user()
    {
        $user = User::factory()->create(['role_id' => $this->adminRole->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/users/' . $user->id);

        $response->assertStatus(200)
            ->assertJsonPath('user.id', $user->id);
    }

    public function test_admin_can_update_user()
    {
        $user = User::factory()->create(['role_id' => $this->adminRole->id, 'name' => 'Old Name']);

        $response = $this->actingAs($this->admin, 'sanctum')->putJson('/api/admin/users/' . $user->id, [
            'name' => 'Updated Name',
            'email' => $user->email, // Often required in validation
            'role_id' => $this->adminRole->id
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User updated successfully',
            ]);
            
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_user()
    {
        $user = User::factory()->create(['role_id' => $this->adminRole->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson('/api/admin/users/' . $user->id);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'User deleted successfully',
            ]);
            
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
}
