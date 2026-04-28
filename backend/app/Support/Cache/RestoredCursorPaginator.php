<?php

declare(strict_types=1);

namespace App\Support\Cache;

use Illuminate\Pagination\Cursor;
use Illuminate\Pagination\CursorPaginator;
use Illuminate\Support\Collection;

/**
 * A CursorPaginator reconstructed from cache.
 *
 * Laravel's CursorPaginator determines hasMore by fetching N+1 rows
 * and checking count > perPage in setItems(). When we restore from
 * cache we already know whether there's a next page, so we inject
 * the flag before setItems() runs.
 */
final class RestoredCursorPaginator extends CursorPaginator
{
    private bool $cachedHasMore;

    public function __construct(
        $items,
        int $perPage,
        ?Cursor $cursor = null,
        bool $hasMore = false,
        array $options = [],
    ) {
        $this->cachedHasMore = $hasMore;
        parent::__construct($items, $perPage, $cursor, $options);
    }

    protected function setItems($items): void
    {
        $this->items = $items instanceof Collection ? $items : collect($items);
        $this->hasMore = $this->cachedHasMore;
        $this->items = $this->items->slice(0, $this->perPage);
    }
}
