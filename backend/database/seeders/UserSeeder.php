<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = \App\Models\Role::where('slug', 'admin')->first();
        $teacherRole = \App\Models\Role::where('slug', 'teacher')->first();
        $studentRole = \App\Models\Role::where('slug', 'student')->first();

        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@test.com',
                'password' => bcrypt('password'),
                'role_id' => $adminRole->id,
                'phone' => '+1234567890',
            ],
            [
                'name' => 'Teacher User',
                'email' => 'teacher@test.com',
                'password' => bcrypt('password'),
                'role_id' => $teacherRole->id,
                'phone' => '+1234567891',
            ],
            [
                'name' => 'Student User',
                'email' => 'student@test.com',
                'password' => bcrypt('password'),
                'role_id' => $studentRole->id,
                'phone' => '+1234567892',
            ],
        ];

        foreach ($users as $user) {
            \App\Models\User::create($user);
        }
    }
}
