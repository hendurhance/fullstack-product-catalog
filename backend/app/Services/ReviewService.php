<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Review;
use App\Repositories\ReviewRepository;
use App\Support\Cache\CachePolicy;
use App\Support\Cache\CacheWrapper;
use App\Support\Cache\RevalidationService;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Support\Facades\DB;

final class ReviewService
{
    private const string DOMAIN = 'reviews';

    public function __construct(
        private readonly ReviewRepository $repository,
        private readonly CacheWrapper $cache,
        private readonly RevalidationService $revalidation,
    ) {}

    public function list(
        int $perPage = 15,
        ?string $cursor = null,
        string $path = '/',
    ): CursorPaginator {
        $key = sprintf('reviews:list:%d:%s', $perPage, $cursor ?? '');

        return $this->cache->rememberPaginator(
            [CachePolicy::tag(self::DOMAIN, 'list')],
            $key,
            CachePolicy::ttl(self::DOMAIN, 'list'),
            Review::class,
            $perPage,
            $cursor,
            $path,
            fn () => $this->repository->list($perPage),
        );
    }

    public function listByProduct(
        string $productId,
        int $perPage = 15,
        ?string $cursor = null,
        string $path = '/',
    ): CursorPaginator {
        $key = sprintf('reviews:product:%s:%d:%s', $productId, $perPage, $cursor ?? '');

        return $this->cache->rememberPaginator(
            [CachePolicy::resolveTag(self::DOMAIN, 'product', ['id' => $productId])],
            $key,
            CachePolicy::ttl(self::DOMAIN, 'product'),
            Review::class,
            $perPage,
            $cursor,
            $path,
            fn () => $this->repository->listByProduct($productId, $perPage),
        );
    }

    public function find(string $id): ?Review
    {
        return $this->repository->find($id);
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function create(array $attrs): Review
    {
        $attrs['is_approved'] = false;

        return DB::transaction(function () use ($attrs): Review {
            $review = $this->repository->create($attrs);
            $this->invalidate($review->product_id);

            return $review;
        });
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function update(Review $review, array $attrs): Review
    {
        return DB::transaction(function () use ($review, $attrs): Review {
            $updated = $this->repository->update($review, $attrs);
            $this->invalidate($updated->product_id);

            return $updated;
        });
    }

    public function approve(Review $review): Review
    {
        return DB::transaction(function () use ($review): Review {
            $updated = $this->repository->approve($review);
            $this->invalidate($updated->product_id);

            return $updated;
        });
    }

    public function reject(Review $review): Review
    {
        return DB::transaction(function () use ($review): Review {
            $updated = $this->repository->reject($review);
            $this->invalidate($updated->product_id);

            return $updated;
        });
    }

    public function delete(Review $review): void
    {
        DB::transaction(function () use ($review): void {
            $productId = $review->product_id;
            $this->repository->delete($review);
            $this->invalidate($productId);
        });
    }

    private function invalidate(string $productId): void
    {
        $tags = [
            CachePolicy::tag('products', 'detail'),
            CachePolicy::resolveTag(self::DOMAIN, 'product', ['id' => $productId]),
            CachePolicy::tag(self::DOMAIN, 'list'),
        ];

        $this->cache->flush($tags);
        $this->revalidation->invalidate($tags);
    }
}
