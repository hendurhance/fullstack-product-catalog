<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Services\ProductService;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['category_id', 'name', 'slug', 'description', 'price', 'stock_qty', 'is_published'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasSlug, HasUuids, SoftDeletes;

    protected $casts = [
        'is_published' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function resolveRouteBinding($value, $field = null): ?Model
    {
        return app(ProductService::class)->findBySlug((string) $value);
    }
}
