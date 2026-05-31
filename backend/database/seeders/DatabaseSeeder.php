<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            GroupSeeder::class,
            UserSeeder::class,
            ClassroomSeeder::class,
            ModuleSeeder::class,
            ScheduleSeeder::class,
            GradeSeeder::class,
            AbsenceSeeder::class,
            AbsenceJustificationSeeder::class,
            AnnouncementSeeder::class,
            CommentSeeder::class,
            CourseMaterialSeeder::class,
            RoomReservationSeeder::class,
            AdministrativeRequestSeeder::class,
            GeneratedDocumentSeeder::class,
        ]);
    }
}
