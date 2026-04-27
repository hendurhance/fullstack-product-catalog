<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait HasSlug
{
    /*
     * Length of the random suffix appended to auto-generated slugs.
     * 5 alphanumeric characters → ~60 bits of collision resistance after
     * Str::lower, comfortable head-room against the partial unique index.
     */
    private const int SLUG_SUFFIX_LENGTH = 5;

    protected static function bootHasSlug(): void
    {
        static::creating(function (Model $model): void {
            if (! empty($model->slug)) {
                return;
            }

            $source = $model->getSlugSource();
            if ($source === null || empty($model->{$source})) {
                return;
            }

            $base = Str::slug((string) $model->{$source});
            $model->slug = $base.'-'.Str::lower(Str::random(self::SLUG_SUFFIX_LENGTH));
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function getSlugSource(): ?string
    {
        return property_exists($this, 'slugSource') ? $this->slugSource : 'name';
    }
}
