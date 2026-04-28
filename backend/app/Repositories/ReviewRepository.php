<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Review;
use Illuminate\Contracts\Pagination\CursorPaginator;

final class ReviewRepository
{
    /**
     * @return CursorPaginator<int, Review>
     */
    public function list(int $perPage = 15): CursorPaginator
    {
        return Review::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate(perPage: $perPage);
    }

    /**
     * @return CursorPaginator<int, Review>
     */
    public function listByProduct(string $productId, int $perPage = 15): CursorPaginator
    {
        return Review::query()
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->cursorPaginate(perPage: $perPage);
    }

    public function find(string $id): ?Review
    {
        return Review::query()->find($id);
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function create(array $attrs): Review
    {
        return Review::create($attrs);
    }

    public function approve(Review $review): Review
    {
        $review->update(['is_approved' => true]);

        return $review->refresh();
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function update(Review $review, array $attrs): Review
    {
        $review->update($attrs);

        return $review->refresh();
    }

    public function reject(Review $review): Review
    {
        $review->update(['is_approved' => false]);

        return $review->refresh();
    }

    public function delete(Review $review): void
    {
        $review->delete();
    }
}
