<?php

namespace Database\Factories;

use App\Models\AdministrativeRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AdministrativeRequest>
 */
class AdministrativeRequestFactory extends Factory
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
            'type' => fake()->randomElement(['transcript', 'certificate', 'attestation', 'other']),
            'title' => fake()->sentence(),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(['pending', 'in_progress', 'approved', 'rejected', 'completed']),
            'submitted_at' => fake()->dateTime(),
            'processed_by' => fake()->boolean(50) ? \App\Models\User::factory() : null,
            'processed_at' => fake()->optional()->dateTime(),
            'admin_notes' => fake()->optional()->sentence(),
        ];
    }
}
