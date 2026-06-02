<?php

namespace Database\Factories;

use App\Models\Classroom;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Classroom>
 */
class ClassroomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $uniqueId = fake()->unique()->randomNumber(4);
        return [
            'name' => fake()->word() . ' Room ' . $uniqueId,
            'code' => 'ROOM' . $uniqueId,
            'capacity' => fake()->numberBetween(20, 100),
            'building' => fake()->randomElement(['A', 'B', 'C', 'D']),
            'floor' => fake()->numberBetween(0, 5),
            'equipment' => fake()->randomElements(['projector', 'computer', 'whiteboard', 'sound_system'], fake()->numberBetween(0, 4)),
            'status' => 'available',
        ];
    }
}
