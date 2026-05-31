<?php

namespace Database\Factories;

use App\Models\Comment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Comment>
 */
class CommentFactory extends Factory
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
            'content' => fake()->paragraph(),
            'commentable_type' => fake()->randomElement([Module::class, Announcement::class, CourseMaterial::class, AdministrativeRequest::class]),
            'commentable_id' => fake()->numberBetween(1, 10),
            'parent_id' => null,
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'hidden']),
        ];
    }
}
