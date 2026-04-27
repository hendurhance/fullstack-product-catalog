<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\IndexProductRequest;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use App\Support\Cache\CachePolicy;
use App\Support\Http\CacheableResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

final class ProductController extends Controller implements HasMiddleware
{
    private const string DOMAIN = 'products';

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show']),
            new Middleware('abilities:products:write', except: ['index', 'show']),
        ];
    }

    public function __construct(
        private readonly ProductService $service,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(IndexProductRequest $request): mixed
    {
        $products = $this->service->list(
            perPage: (int) $request->validated('per_page', 15),
            categoryId: $request->validated('category_id'),
        );

        return ProductResource::collection($products)
            ->toResponse($request);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);

        $product = $this->service->create($request->validated());

        return ProductResource::make($product)
            ->response()
            ->setStatusCode(ResponseAlias::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product, Request $request): ResponseAlias
    {
        if (! $product->is_published) {
            return response()->json([
                'message' => 'Resource not found.',
                'code' => 'PRODUCT_NOT_FOUND',
                'request_id' => $request->attributes->get('request_id'),
            ], 404);
        }

        return CacheableResponse::apply(
            (new ProductResource($product))->toResponse($request),
            $request,
            header: CachePolicy::header(self::DOMAIN, 'detail'),
            etagKey: sprintf(
                'products:detail:%s:%d',
                $product->slug,
                $product->updated_at?->getTimestamp() ?? 0,
            ),
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);

        return new ProductResource(
            $this->service->update($product, $request->validated()),
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product): ResponseAlias
    {
        $this->authorize('delete', $product);

        $this->service->delete($product);

        return response()->noContent();
    }
}
