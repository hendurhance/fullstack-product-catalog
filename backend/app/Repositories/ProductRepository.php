<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ProductRepository
{
    /**
     * @return CursorPaginator<int, Product>
     */
    public function list(int $perPage = 15, ?string $categoryId = null): CursorPaginator
    {
        return Product::query()
            ->where('is_published', true)
            ->when($categoryId, fn ($q) => $q->where('category_id', $categoryId))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate(perPage: $perPage);
    }

    public function findBySlug(string $slug): ?Product
    {
        return Product::query()->where('slug', $slug)->first();
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function create(array $attrs): Product
    {
        return Product::create($attrs);
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function update(Product $product, array $attrs): Product
    {
        $product->update($attrs);

        return $product->refresh();
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
