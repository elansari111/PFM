<?php

namespace Database\Factories;

use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Teacher>
 */
class TeacherFactory extends Factory
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
            'employee_number' => 'EMP' . fake()->unique()->randomNumber(6),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'specialization' => fake()->randomElement(['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology']),
            'hire_date' => fake()->date(),
        ];
    }
}
