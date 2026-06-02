<?php

namespace Database\Factories;

use App\Models\GeneratedDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GeneratedDocument>
 */
class GeneratedDocumentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'request_id' => fake()->boolean(50) ? \App\Models\AdministrativeRequest::factory() : null,
            'student_id' => \App\Models\Student::factory(),
            'type' => fake()->randomElement(['transcript', 'certificate', 'attestation', 'grade_report', 'other']),
            'title' => fake()->sentence(),
            'file_path' => fake()->filePath(),
            'file_type' => fake()->randomElement(['pdf', 'docx']),
            'generated_by' => \App\Models\User::factory(),
            'generated_at' => fake()->dateTime(),
            'is_official' => fake()->boolean(),
            'reference_number' => fake()->optional()->bothify('REF-####-####'),
        ];
    }
}
