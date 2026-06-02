<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = [
            [
                'name' => 'Group A - L3 Computer Science',
                'code' => 'L3-CS-A',
                'description' => 'Third year Computer Science students - Group A',
                'capacity' => 30,
                'level_id' => 3,
            ],
            [
                'name' => 'Group B - L3 Computer Science',
                'code' => 'L3-CS-B',
                'description' => 'Third year Computer Science students - Group B',
                'capacity' => 30,
                'level_id' => 3,
            ],
        ];

        foreach ($groups as $group) {
            \App\Models\Group::firstOrCreate(
                ['code' => $group['code']],
                $group
            );
        }
    }
}
