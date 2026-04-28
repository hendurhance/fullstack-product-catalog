<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Review>
 */
class ReviewFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'reviewer_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'rating' => fake()->numberBetween(1, 5),
            'body' => fake()->paragraph(3),
            'is_approved' => true,
        ];
    }

    public function approved(): static
    {
        return $this->state(['is_approved' => true]);
    }

    public function unapproved(): static
    {
        return $this->state(['is_approved' => false]);
    }
}
