<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use App\Services\CategoryService;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable(['name', 'slug', 'description'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory, HasSlug, HasUuids, SoftDeletes;

    /*
     * Resolve {category} bindings through CategoryService so every detail
     * lookup — public detail page, controller actions, anywhere a route
     * model bind fires — flows through the same cache path. Returning null
     * lets Laravel raise a ModelNotFoundException, which the error envelope
     * shapes into `CATEGORY_NOT_FOUND`.
     */
    public function resolveRouteBinding($value, $field = null): ?Model
    {
        return app(CategoryService::class)->findBySlug((string) $value);
    }
}
