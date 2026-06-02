<?php

namespace Database\Factories;

use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Group>
 */
class GroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $levels = ['L1', 'L2', 'L3', 'M1', 'M2'];
        $level = fake()->randomElement($levels);
        $groupLetter = fake()->randomElement(['A', 'B', 'C']);
        $subject = fake()->randomElement(['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology']);
        $uniqueId = fake()->unique()->randomNumber(4);
        
        return [
            'name' => "Group {$groupLetter} - {$level} {$subject} {$uniqueId}",
            'code' => "{$level}-" . fake()->randomElement(['CS', 'MATH', 'PHY', 'CHM', 'BIO']) . "-{$groupLetter}-{$uniqueId}",
            'description' => fake()->sentence(),
            'capacity' => fake()->numberBetween(20, 40),
            'level_id' => fake()->numberBetween(1, 5),
        ];
    }
}
