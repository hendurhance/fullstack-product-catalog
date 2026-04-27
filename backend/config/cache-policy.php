<?php

declare(strict_types=1);

/*
 * HTTP cache policies for read endpoints. Each profile is a
 * `Cache-Control` header value chosen for the freshness model
 * of that endpoint shape.
 *
 *   list   — short fresh window because any mutation on the
 *            domain invalidates the list. SWR lets shared
 *            caches keep serving while we refresh.
 *   detail — wider fresh window because detail rows only
 *            change when that specific record changes.
 *            Mirrors the Next.js ISR(300s) cadence.
 *
 * Override per environment via `CACHE_POLICY_<PROFILE>=...`.
 */
return [
    'profiles' => [
        'list' => env(
            'CACHE_POLICY_LIST',
            'public, max-age=60, stale-while-revalidate=120',
        ),
        'detail' => env(
            'CACHE_POLICY_DETAIL',
            'public, max-age=300, stale-while-revalidate=300',
        ),
    ],
];
