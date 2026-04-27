<?php

declare(strict_types=1);

/*
 * Central cache policy — the single source of truth for all TTLs,
 * cache tag names, and HTTP Cache-Control headers across the system.
 *
 * Services read from here; no more hardcoded constants scattered
 * across the codebase. The frontend mirrors these values in
 * next.config.ts cacheLife profiles.
 */
return [
    /*
    |------------------------------------------------------------------
    | Domain configurations
    |------------------------------------------------------------------
    |
    | Each domain (categories, products, etc.) declares:
    |   - tags    : cache tag names used for Redis key grouping
    |   - ttl     : fresh-window seconds for list and detail queries
    |   - headers : HTTP Cache-Control header templates per route shape
    |
    */
    'domains' => [
        'categories' => [
            'tags' => [
                'list' => 'categories',
                'detail' => 'category:slug:{slug}',
            ],
            'ttl' => [
                'list' => (int) env('CACHE_TTL_CATEGORY_LIST', 60),
                'detail' => (int) env('CACHE_TTL_CATEGORY_DETAIL', 300),
            ],
            'headers' => [
                'list' => env('CACHE_POLICY_LIST', 'public, max-age=60, stale-while-revalidate=120'),
                'detail' => env('CACHE_POLICY_DETAIL', 'public, max-age=300, stale-while-revalidate=300'),
            ],
        ],
        'products' => [
            'tags' => [
                'list' => 'products',
                'detail' => 'product:slug:{slug}',
                'category' => 'products:category:{id}',
            ],
            'ttl' => [
                'list' => (int) env('CACHE_TTL_PRODUCT_LIST', 60),
                'detail' => (int) env('CACHE_TTL_PRODUCT_DETAIL', 120),
            ],
            'headers' => [
                'list' => env('CACHE_POLICY_PRODUCT_LIST', 'public, max-age=60, stale-while-revalidate=120'),
                'detail' => env('CACHE_POLICY_PRODUCT_DETAIL', 'public, max-age=120, stale-while-revalidate=600'),
            ],
        ],
    ],
];
