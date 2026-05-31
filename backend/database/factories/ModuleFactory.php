<?php

namespace Database\Factories;

use App\Models\Module;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Module>
 */
class ModuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'code' => strtoupper(fake()->unique()->bothify('???###')),
            'description' => fake()->paragraph(),
            'credits' => fake()->numberBetween(1, 6),
            'teacher_id' => \App\Models\User::factory(),
            'group_id' => \App\Models\Group::factory(),
            'level' => fake()->randomElement(['L1', 'L2', 'L3', 'M1', 'M2']),
            'semester' => fake()->randomElement(['S1', 'S2']),
            'status' => 'active',
        ];
    }
}
