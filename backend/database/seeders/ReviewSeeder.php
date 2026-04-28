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

        // 7 approved + 3 unapproved = 10 total
        $products->take(6)->each(function (Product $product) {
            Review::factory()
                ->count(random_int(1, 2))
                ->approved()
                ->create(['product_id' => $product->id]);
        });

        Review::factory()
            ->count(3)
            ->unapproved()
            ->create(['product_id' => $products->random()->id]);
    }
}
