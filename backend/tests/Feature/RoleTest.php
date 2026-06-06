<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleTest extends TestCase
{
    use RefreshDatabase;

    private $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create an admin role and user for authorization
        $adminRole = Role::factory()->create(['slug' => 'admin', 'name' => 'Admin']);
        $this->admin = User::factory()->create(['role_id' => $adminRole->id]);
    }

    public function test_admin_can_list_roles()
    {
        Role::factory()->count(3)->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/roles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'roles' => [
                    '*' => ['id', 'name', 'slug', 'description']
                ]
            ]);
    }

    public function test_admin_can_create_role()
    {
        $roleData = [
            'name' => 'New Role',
            'slug' => 'new-role', // Note: controller doesn't validate slug on creation based on code, but table might require it. Let's see if it fails.
            'description' => 'A new test role'
        ];

        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/admin/roles', $roleData);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Role created successfully',
            ]);
            
        $this->assertDatabaseHas('roles', ['name' => 'New Role']);
    }

    public function test_admin_can_view_specific_role()
    {
        $role = Role::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/admin/roles/' . $role->id);

        $response->assertStatus(200)
            ->assertJsonPath('role.id', $role->id);
    }

    public function test_admin_can_update_role()
    {
        $role = Role::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($this->admin, 'sanctum')->putJson('/api/admin/roles/' . $role->id, [
            'name' => 'Updated Name',
            'description' => 'Updated description'
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Role updated successfully',
            ]);
            
        $this->assertDatabaseHas('roles', ['id' => $role->id, 'name' => 'Updated Name']);
    }

    public function test_admin_can_delete_role()
    {
        $role = Role::factory()->create();

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson('/api/admin/roles/' . $role->id);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Role deleted successfully',
            ]);
            
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    public function test_admin_cannot_delete_role_with_users()
    {
        $role = Role::factory()->create();
        User::factory()->create(['role_id' => $role->id]);

        $response = $this->actingAs($this->admin, 'sanctum')->deleteJson('/api/admin/roles/' . $role->id);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Cannot delete role with assigned users',
            ]);
    }

    public function test_non_admin_cannot_access_roles()
    {
        $studentRole = Role::factory()->create(['slug' => 'student']);
        $student = User::factory()->create(['role_id' => $studentRole->id]);

        $response = $this->actingAs($student, 'sanctum')->getJson('/api/admin/roles');

        // Should be forbidden or unauthorized based on middleware
        $response->assertStatus(403);
    }
}
