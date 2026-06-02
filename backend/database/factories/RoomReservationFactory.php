<?php

namespace Database\Factories;

use App\Models\RoomReservation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomReservation>
 */
class RoomReservationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'classroom_id' => \App\Models\Classroom::factory(),
            'user_id' => \App\Models\User::factory(),
            'purpose' => fake()->sentence(),
            'description' => fake()->optional()->paragraph(),
            'start_datetime' => fake()->dateTimeBetween('+1 week', '+2 weeks'),
            'end_datetime' => fake()->dateTimeBetween('+2 weeks', '+2 weeks +2 hours'),
            'status' => fake()->randomElement(['pending', 'approved', 'rejected', 'cancelled']),
            'approved_by' => fake()->boolean(50) ? \App\Models\User::factory() : null,
            'approved_at' => fake()->optional()->dateTime(),
            'rejection_reason' => fake()->optional()->sentence(),
        ];
    }
}
