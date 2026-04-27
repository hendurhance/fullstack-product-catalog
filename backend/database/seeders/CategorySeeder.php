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
                'description' => 'Phones, laptops, audio gear, and accessories.',
            ],
            [
                'name' => 'Books',
                'description' => 'Fiction, non-fiction, technical, and reference titles.',
            ],
            [
                'name' => 'Home & Kitchen',
                'description' => 'Cookware, small appliances, and home essentials.',
            ],
        ];

        foreach ($categories as $attrs) {
            Category::firstOrCreate(['name' => $attrs['name']], $attrs);
        }
    }
}
