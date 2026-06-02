<?php

namespace Database\Factories;

use App\Models\Grade;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Grade>
 */
class GradeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => \App\Models\Student::factory(),
            'module_id' => \App\Models\Module::factory(),
            'grade_type' => fake()->randomElement(['cc1', 'cc2', 'exam', 'final']),
            'score' => fake()->randomFloat(1, 0, 20),
            'max_score' => 20,
            'date' => fake()->date(),
            'comments' => fake()->optional()->sentence(),
        ];
    }
}
