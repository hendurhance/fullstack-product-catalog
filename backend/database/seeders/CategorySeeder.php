<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Electronics',
                'slug' => 'electronics',
                'description' => 'Phones, laptops, audio gear, and accessories.',
            ],
            [
                'name' => 'Books',
                'slug' => 'books',
                'description' => 'Fiction, non-fiction, technical, and reference titles.',
            ],
            [
                'name' => 'Home & Kitchen',
                'slug' => 'home-and-kitchen',
                'description' => 'Cookware, small appliances, and home essentials.',
            ],
        ];

        foreach ($categories as $attrs) {
            Category::firstOrCreate(['slug' => $attrs['slug']], $attrs);
        }
    }
}
