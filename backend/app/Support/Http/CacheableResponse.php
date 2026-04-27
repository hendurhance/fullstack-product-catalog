<?php

declare(strict_types=1);

namespace App\Support\Http;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applies an HTTP Cache-Control header + weak ETag to a response,
 * and collapses to 304 when the client's If-None-Match matches.
 *
 * The Cache-Control value comes from config/cache-policy.php — the
 * single source of truth. Controllers pass the domain + key and this
 * class resolves the header.
 */
final class CacheableResponse
{
    public static function apply(
        Response $response,
        Request $request,
        string $header,
        string $etagKey,
    ): Response {
        $response->headers->set('Cache-Control', $header);
        $response->setEtag(sha1($etagKey));

        $response->isNotModified($request);

        return $response;
    }
}
