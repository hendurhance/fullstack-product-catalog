<?php

declare(strict_types=1);

namespace App\Support\Cache;

/**
 * Read-only access to config/cache-policy.php.
 *
 * Services resolve their TTLs, tags, and headers through here
 * instead of maintaining their own constants.
 */
final readonly class CachePolicy
{
    /**
     * @return array{list: string, detail: string, ...}
     */
    public static function tags(string $domain): array
    {
        return config("cache-policy.domains.{$domain}.tags");
    }

    public static function tag(string $domain, string $key): string
    {
        return config("cache-policy.domains.{$domain}.tags.{$key}");
    }

    public static function ttl(string $domain, string $key): int
    {
        return config("cache-policy.domains.{$domain}.ttl.{$key}");
    }

    public static function header(string $domain, string $key): string
    {
        return config("cache-policy.domains.{$domain}.headers.{$key}");
    }

    /**
     * Resolve a tag template like "product:slug:{slug}" with actual values.
     *
     * @param  array<string, string>  $values
     */
    public static function resolveTag(string $domain, string $key, array $values = []): string
    {
        $template = self::tag($domain, $key);

        return str_replace(
            array_map(fn (string $k): string => '{'.$k.'}', array_keys($values)),
            array_values($values),
            $template,
        );
    }
}
