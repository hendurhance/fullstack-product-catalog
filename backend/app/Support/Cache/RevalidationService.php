<?php

declare(strict_types=1);

namespace App\Support\Cache;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

final class RevalidationService
{
    public function __construct(
        private readonly string $secret,
        private readonly string $url,
    ) {}

    /**
     * @param  array<string>  $tags
     */
    public function invalidate(array $tags): void
    {
        if ($this->secret === '' || $this->url === '') {
            return;
        }

        $payload = json_encode($tags, JSON_THROW_ON_ERROR);
        $signature = hash_hmac('sha256', $payload, $this->secret);

        $response = Http::withHeaders([
            'X-Revalidation-Signature' => $signature,
            'Content-Type' => 'application/json',
        ])
            ->timeout(5)
            ->withBody($payload, 'application/json')
            ->post($this->url);

        if ($response->successful()) {
            return;
        }

        Log::warning('Revalidation webhook failed', [
            'tags' => $tags,
            'status' => $response->status(),
            'body' => $response->body(),
        ]);
    }
}
