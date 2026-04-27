<?php

declare(strict_types=1);

namespace App\Support\Cache;

use Closure;
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
