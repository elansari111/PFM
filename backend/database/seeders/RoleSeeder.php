<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Administrator with full access to the system',
            ],
            [
                'name' => 'Teacher',
                'slug' => 'teacher',
                'description' => 'Teacher with access to teaching-related features',
            ],
            [
                'name' => 'Student',
                'slug' => 'student',
                'description' => 'Student with access to learning-related features',
            ],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::create($role);
        }
    }
}
