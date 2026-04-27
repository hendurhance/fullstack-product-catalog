<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $electronics = Category::where('name', 'Electronics')->first();
        $books = Category::where('name', 'Books')->first();
        $home = Category::where('name', 'Home & Kitchen')->first();

        $products = [
            [
                'category_id' => $electronics?->id,
                'name' => 'Wireless Noise-Cancelling Headphones',
                'description' => 'Premium over-ear headphones with active noise cancellation and 30-hour battery life.',
                'price' => 24999,
                'stock_qty' => 120,
                'is_published' => true,
            ],
            [
                'category_id' => $electronics?->id,
                'name' => 'Mechanical Keyboard',
                'description' => 'Hot-swappable switches, RGB backlight, and a solid aluminum frame.',
                'price' => 12999,
                'stock_qty' => 85,
                'is_published' => true,
            ],
            [
                'category_id' => $books?->id,
                'name' => 'Designing Data-Intensive Applications',
                'description' => 'Martin Kleppmann\'s deep dive into the big ideas behind reliable, scalable, and maintainable systems.',
                'price' => 3999,
                'stock_qty' => 200,
                'is_published' => true,
            ],
            [
                'category_id' => $books?->id,
                'name' => 'Clean Architecture',
                'description' => 'Robert C. Martin\'s guide to software structure and design principles.',
                'price' => 2999,
                'stock_qty' => 150,
                'is_published' => true,
            ],
            [
                'category_id' => $home?->id,
                'name' => 'French Press Coffee Maker',
                'description' => 'Borosilicate glass carafe with stainless steel filter. 34 oz capacity.',
                'price' => 2499,
                'stock_qty' => 300,
                'is_published' => true,
            ],
            [
                'category_id' => $electronics?->id,
                'name' => 'Portable Bluetooth Speaker',
                'description' => 'Waterproof, 12-hour battery, rich 360-degree sound.',
                'price' => 7999,
                'stock_qty' => 60,
                'is_published' => true,
            ],
            [
                'category_id' => $home?->id,
                'name' => 'Cast Iron Skillet 12"',
                'description' => 'Pre-seasoned, oven-safe to 500°F. A kitchen essential.',
                'price' => 3499,
                'stock_qty' => 0,
                'is_published' => false,
            ],
            [
                'category_id' => $books?->id,
                'name' => 'The Pragmatic Programmer',
                'description' => 'Your journey to mastery by Hunt & Thomas. 20th anniversary edition.',
                'price' => 4499,
                'stock_qty' => 0,
                'is_published' => false,
            ],
        ];

        foreach ($products as $attrs) {
            if ($attrs['category_id'] === null) {
                continue;
            }

            Product::firstOrCreate(['name' => $attrs['name']], $attrs);
        }
    }
}
