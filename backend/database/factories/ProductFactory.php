<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'category_id' => Category::factory(),
            'name' => \Illuminate\Support\Str::title($name),
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . \Illuminate\Support\Str::lower(\Illuminate\Support\Str::random(4)),
            'description' => fake()->sentence(12),
            'price' => fake()->numberBetween(100, 99999),
            'stock_qty' => fake()->numberBetween(0, 500),
            'is_published' => true,
        ];
    }
}
