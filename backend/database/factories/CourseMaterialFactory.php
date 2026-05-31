<?php

namespace Database\Factories;

use App\Models\CourseMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseMaterial>
 */
class CourseMaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'module_id' => \App\Models\Module::factory(),
            'title' => fake()->sentence(),
            'description' => fake()->optional()->paragraph(),
            'file_path' => fake()->filePath(),
            'file_type' => fake()->randomElement(['pdf', 'docx', 'pptx', 'zip']),
            'file_size' => fake()->numberBetween(100, 10000),
            'uploaded_by' => \App\Models\User::factory(),
            'status' => fake()->randomElement(['draft', 'published', 'archived']),
            'published_at' => fake()->optional()->dateTime(),
        ];
    }
}
