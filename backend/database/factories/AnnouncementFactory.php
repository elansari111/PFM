<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'content' => fake()->paragraph(3),
            'target_role' => fake()->randomElement(['all', 'admin', 'teacher', 'student']),
            'created_by' => \App\Models\User::factory(),
            'published_at' => fake()->dateTime(),
            'expires_at' => fake()->optional()->dateTimeBetween('+1 week', '+1 month'),
            'is_pinned' => fake()->boolean(20),
            'status' => fake()->randomElement(['draft', 'published', 'archived']),
        ];
    }
}
