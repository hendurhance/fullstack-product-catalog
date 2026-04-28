<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $products = Product::all();
        if ($products->isEmpty()) {
            return;
        }

        Review::factory()
            ->count(7)
            ->approved()
            ->create(['product_id' => $products->random()->id]);

        Review::factory()
            ->count(3)
            ->unapproved()
            ->create(['product_id' => $products->random()->id]);
    }
}
