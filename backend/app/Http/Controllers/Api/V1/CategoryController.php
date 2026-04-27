<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use App\Support\Http\CacheableResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

final class CategoryController extends Controller implements HasMiddleware
{
    /*
     * Auth + ability gating lives next to the controller actions they guard.
     * `auth:sanctum` runs before `abilities:*`, and both are scoped to the
     * mutating methods so public reads stay anonymous.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show']),
            new Middleware('abilities:categories:write', except: ['index', 'show']),
        ];
    }

    public function __construct(
        private readonly CategoryService $service,
    ) {}

    public function index(Request $request): ResponseAlias
    {
        $categories = $this->service->list();
        $latest = $categories->max('updated_at');

        return CacheableResponse::apply(
            CategoryResource::collection($categories)->toResponse($request),
            $request,
            profile: 'list',
            etagKey: sprintf(
                'categories:list:%d:%d',
                $latest?->getTimestamp() ?? 0,
                $categories->count(),
            ),
        );
    }

    public function show(Category $category, Request $request): ResponseAlias
    {
        return CacheableResponse::apply(
            (new CategoryResource($category))->toResponse($request),
            $request,
            profile: 'detail',
            etagKey: sprintf(
                'categories:detail:%s:%d',
                $category->slug,
                $category->updated_at?->getTimestamp() ?? 0,
            ),
        );
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $category = $this->service->create($request->validated());

        return CategoryResource::make($category)
            ->response()
            ->setStatusCode(ResponseAlias::HTTP_CREATED);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $this->authorize('update', $category);

        return new CategoryResource(
            $this->service->update($category, $request->validated()),
        );
    }

    public function destroy(Category $category): ResponseAlias
    {
        $this->authorize('delete', $category);

        $this->service->delete($category);

        return response()->noContent();
    }
}
