<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Category;
use App\Repositories\CategoryRepository;
use App\Support\Cache\CacheWrapper;
use App\Support\Cache\RevalidationService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class CategoryService
{
    /** Brief requires per-route TTLs documented in README — see PLAN D3. */
    private const int TTL_LIST = 600;

    private const int TTL_DETAIL = 600;

    private const string TAG_DOMAIN = 'categories';

    public function __construct(
        private readonly CategoryRepository $repository,
        private readonly CacheWrapper $cache,
        private readonly RevalidationService $revalidation,
    ) {}

    /**
     * @return Collection<int, Category>
     */
    public function list(): Collection
    {
        $rows = $this->cache->remember(
            [self::TAG_DOMAIN],
            'categories:list',
            self::TTL_LIST,
            fn () => $this->repository->all()->toArray(),
        );

        return Category::hydrate($rows);
    }

    public function findBySlug(string $slug): ?Category
    {
        $row = $this->cache->remember(
            [self::TAG_DOMAIN, self::slugTag($slug)],
            "categories:slug:{$slug}",
            self::TTL_DETAIL,
            fn () => $this->repository->findBySlug($slug)?->toArray(),
        );

        return $row === null ? null : Category::hydrate([$row])->first();
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function create(array $attrs): Category
    {
        return DB::transaction(function () use ($attrs): Category {
            $category = $this->repository->create($attrs);
            $this->invalidate($category->slug);

            return $category;
        });
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    public function update(Category $category, array $attrs): Category
    {
        return DB::transaction(function () use ($category, $attrs): Category {
            $previousSlug = $category->slug;
            $updated = $this->repository->update($category, $attrs);
            $this->invalidate($updated->slug, $previousSlug);

            return $updated;
        });
    }

    public function delete(Category $category): void
    {
        DB::transaction(function () use ($category): void {
            $slug = $category->slug;
            $this->repository->delete($category);
            $this->invalidate($slug);
        });
    }

    private function invalidate(string $slug, ?string $previousSlug = null): void
    {
        $tags = [self::TAG_DOMAIN, self::slugTag($slug)];
        if ($previousSlug !== null && $previousSlug !== $slug) {
            $tags[] = self::slugTag($previousSlug);
        }

        $this->cache->flush($tags);
        $this->revalidation->invalidate($tags);
    }

    private static function slugTag(string $slug): string
    {
        return "category:slug:{$slug}";
    }
}
