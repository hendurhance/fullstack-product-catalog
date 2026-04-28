<?php

declare(strict_types=1);

namespace App\Support\Cache;

use Closure;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\Cursor;
use Illuminate\Support\Facades\Cache;

/**
 * Domain-agnostic cache helper. Services pass the tags they own;
 * the wrapper handles SWR + jitter + tag flush so cache topology
 * lives in exactly one place.
 *
 * Cache primitives only (arrays / scalars / null). Eloquent models
 * round-trip as __PHP_Incomplete_Class because we keep Laravel 13's
 * secure default `cache.serializable_classes = false`. Services that
 * want to cache rows should call `->toArray()` on the way in and
 * `Model::hydrate(...)` on the way out.
 */
final class CacheWrapper
{
    /**
     * Read-through cache with stale-while-revalidate and ±10% TTL jitter.
     *
     * The stale window is 5× the fresh TTL — a slow rebuild won't stampede,
     * and a hot key that misses on rebuild still serves the stale value
     * for up to 5× before clients see an error.
     *
     * @template T
     *
     * @param  array<string>  $tags
     * @param  Closure(): T  $callback
     * @return T
     */
    public function remember(array $tags, string $key, int $ttl, Closure $callback): mixed
    {
        $jittered = $this->jitter($ttl);

        return Cache::tags($tags)->flexible(
            $key,
            [$jittered, $jittered * 5],
            $callback,
        );
    }

    /**
     * Cache a cursor-paginated result set.
     *
     * Paginators contain Eloquent models that can't be serialized, so
     * we store items as arrays + a next_cursor flag, then hydrate and
     * reconstruct on read. All inputs (cursor, path) are parameters —
     * no request() calls inside.
     *
     * @param  array<string>  $tags
     * @param  class-string<Model>  $modelClass
     * @param  Closure(): CursorPaginator  $query
     */
    public function rememberPaginator(
        array $tags,
        string $key,
        int $ttl,
        string $modelClass,
        int $perPage,
        ?string $cursor,
        string $path,
        Closure $query,
    ): CursorPaginator {
        $data = $this->remember($tags, $key, $ttl, function () use ($query): array {
            $paginator = $query();

            return [
                'items' => collect($paginator->items())->map->toArray()->all(),
                'next_cursor' => $paginator->nextCursor()?->encode(),
            ];
        });

        $items = $modelClass::hydrate($data['items']);
        $hasMore = $data['next_cursor'] !== null;
        $cursorObj = $cursor !== null ? Cursor::fromEncoded($cursor) : null;

        return new RestoredCursorPaginator(
            $items, $perPage, $cursorObj, $hasMore,
            ['path' => $path, 'cursorName' => 'cursor'],
        );
    }

    /**
     * @param  array<string>  $tags
     */
    public function flush(array $tags): void
    {
        Cache::tags($tags)->flush();
    }

    private function jitter(int $ttl): int
    {
        $delta = (int) max(1, $ttl * 0.1);

        return $ttl + random_int(-$delta, $delta);
    }
}
