<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use App\Support\Cache\CachePolicy;
use App\Support\Cache\CacheWrapper;
use App\Support\Cache\RevalidationService;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Support\Facades\DB;

final class ProductService
{
    private const string DOMAIN = 'products';

    public function __construct(
        private readonly ProductRepository $repository,
        private readonly CacheWrapper $cache,
        private readonly RevalidationService $revalidation,
    ) {}

    /**
     * @return CursorPaginator<int, Product>
     */
    public function list(int $perPage = 15, ?string $categoryId = null): CursorPaginator
    {
        return $this->repository->list($perPage, $categoryId);
    }

    public function findBySlug(string $slug): ?Product
    {
        $row = $this->cache->remember(
            [CachePolicy::tag(self::DOMAIN, 'list'), $this->slugTag($slug)],
            "products:slug:{$slug}",
            CachePolicy::ttl(self::DOMAIN, 'detail'),
            fn () => $this->repository->findBySlug($slug)?->toArray(),
        );

        return $row === null ? null : Product::hydrate([$row])->first();
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function create(array $attrs): Product
    {
        return DB::transaction(function () use ($attrs): Product {
            $product = $this->repository->create($attrs);
            $this->invalidate($product->slug, $product->category_id);

            return $product;
        });
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function update(Product $product, array $attrs): Product
    {
        return DB::transaction(function () use ($product, $attrs): Product {
            $previousSlug = $product->slug;
            $previousCategoryId = $product->category_id;
            $updated = $this->repository->update($product, $attrs);
            $this->invalidate(
                $updated->slug,
                $updated->category_id,
                $previousSlug,
                $previousCategoryId,
            );

            return $updated;
        });
    }

    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product): void {
            $slug = $product->slug;
            $categoryId = $product->category_id;
            $this->repository->delete($product);
            $this->invalidate($slug, $categoryId);
        });
    }

    private function invalidate(
        string $slug,
        string $categoryId,
        ?string $previousSlug = null,
        ?string $previousCategoryId = null,
    ): void {
        $tags = [
            CachePolicy::tag(self::DOMAIN, 'list'),
            $this->slugTag($slug),
            $this->categoryTag($categoryId),
        ];

        if ($previousSlug !== null && $previousSlug !== $slug) {
            $tags[] = $this->slugTag($previousSlug);
        }

        if ($previousCategoryId !== null && $previousCategoryId !== $categoryId) {
            $tags[] = $this->categoryTag($previousCategoryId);
        }

        $this->cache->flush($tags);
        $this->revalidation->invalidate($tags);
    }

    private function slugTag(string $slug): string
    {
        return CachePolicy::resolveTag(self::DOMAIN, 'detail', ['slug' => $slug]);
    }

    private function categoryTag(string $categoryId): string
    {
        return CachePolicy::resolveTag(self::DOMAIN, 'category', ['id' => $categoryId]);
    }
}
