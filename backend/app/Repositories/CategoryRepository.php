<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

final class CategoryRepository
{
    /**
     * @return Collection<int, Category>
     */
    public function all(): Collection
    {
        return Category::query()->orderBy('name')->get();
    }

    public function findBySlug(string $slug): ?Category
    {
        return Category::query()->where('slug', $slug)->first();
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function create(array $attrs): Category
    {
        return Category::create($attrs);
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function update(Category $category, array $attrs): Category
    {
        $category->update($attrs);

        return $category->refresh();
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }
}
