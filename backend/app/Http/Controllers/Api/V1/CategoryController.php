<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use App\Support\Cache\CachePolicy;
use App\Support\Http\CacheableResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

final class CategoryController extends Controller implements HasMiddleware
{
    private const string DOMAIN = 'categories';

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
            header: CachePolicy::header(self::DOMAIN, 'list'),
            etagKey: sprintf(
                'categories:list:%d:%d',
                $latest?->getTimestamp() ?? 0,
                $categories->count(),
            ),
        );
    }

    public function show(string $category, Request $request): ResponseAlias
    {
        $model = $this->service->findBySlug($category);
        abort_if($model === null, 404);

        return CacheableResponse::apply(
            (new CategoryResource($model))->toResponse($request),
            $request,
            header: CachePolicy::header(self::DOMAIN, 'detail'),
            etagKey: sprintf(
                'categories:detail:%s:%d',
                $model->slug,
                $model->updated_at?->getTimestamp() ?? 0,
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
