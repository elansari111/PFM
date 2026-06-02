<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'group_id' => \App\Models\Group::factory(),
            'student_number' => 'STU' . fake()->unique()->randomNumber(6),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'enrollment_date' => fake()->date(),
        ];
    }
}
