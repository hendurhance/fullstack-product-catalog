<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Generate or pass through an X-Request-ID, share it with the log context,
 * and echo it back in the response header. Used by the error envelope
 * (`request_id` field) and by the frontend toasts so a single ID grep
 * lines up across stacks.
 */
final class AssignRequestId
{
    public const string HEADER = 'X-Request-ID';

    public const string ATTRIBUTE = 'request_id';

    public function handle(Request $request, Closure $next): Response
    {
        $id = $request->headers->get(self::HEADER);
        if (! is_string($id) || $id === '' || strlen($id) > 128) {
            $id = (string) Str::ulid();
        }

        $request->attributes->set(self::ATTRIBUTE, $id);
        $request->headers->set(self::HEADER, $id);
        Log::shareContext(['request_id' => $id]);

        $response = $next($request);
        $response->headers->set(self::HEADER, $id);

        return $response;
    }
}
