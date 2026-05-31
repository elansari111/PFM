<?php

namespace Database\Factories;

use App\Models\AbsenceJustification;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AbsenceJustification>
 */
class AbsenceJustificationFactory extends Factory
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
            'reason' => fake()->paragraph(),
            'document_path' => fake()->optional()->filePath(),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected']),
            'reviewed_by' => \App\Models\User::factory(),
            'reviewed_at' => fake()->optional()->dateTime(),
            'review_notes' => fake()->optional()->sentence(),
        ];
    }
}
