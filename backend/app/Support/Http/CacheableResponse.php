<?php

declare(strict_types=1);

namespace App\Support\Http;

use Illuminate\Http\Request;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applies a named HTTP cache profile + a weak ETag to a response, and
 * collapses to 304 when the client's `If-None-Match` matches.
 *
 * Profiles live in `config/cache-policy.php` so SREs can tune freshness
 * windows without touching controllers; controllers stay focused on
 * "what to return", not "how it should be cached".
 *
 * The etag-key contract is intentionally caller-supplied: only the
 * caller knows which fields move the freshness needle for that
 * endpoint (max(updated_at) for a list, single row's updated_at for
 * detail, etc.). Keep keys stable across processes — no `microtime()`,
 * no instance state.
 */
final class CacheableResponse
{
    public static function apply(
        Response $response,
        Request $request,
        string $profile,
        string $etagKey,
    ): Response {
        $directive = config("cache-policy.profiles.{$profile}");
        if (! is_string($directive) || $directive === '') {
            throw new InvalidArgumentException(
                "Unknown cache profile: {$profile}. Add it to config/cache-policy.php.",
            );
        }

        $response->headers->set('Cache-Control', $directive);
        $response->setEtag(sha1($etagKey));

        // Mutates to 304 with empty body when If-None-Match matches.
        $response->isNotModified($request);

        return $response;
    }
}
