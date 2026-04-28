<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Requests\Review\UpdateReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Services\ReviewService;
use App\Support\Cache\CachePolicy;
use App\Support\Http\CacheableResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

final class ReviewController extends Controller implements HasMiddleware
{
    private const string DOMAIN = 'reviews';

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum', except: ['index', 'show', 'store']),
            new Middleware('abilities:reviews:moderate', except: ['index', 'show', 'store']),
            new Middleware('throttle:5,1', only: ['store']),
        ];
    }

    public function __construct(
        private readonly ReviewService $service,
    ) {}

    public function index(Request $request): ResponseAlias
    {
        $productId = $request->query('product_id');

        $reviews = $productId
            ? $this->service->listByProduct(
                productId: $productId,
                perPage: (int) $request->query('per_page', 15),
                cursor: $request->query('cursor'),
                path: $request->url(),
            )
            : $this->service->list(
                perPage: (int) $request->query('per_page', 15),
                cursor: $request->query('cursor'),
                path: $request->url(),
            );

        return CacheableResponse::apply(
            ReviewResource::collection($reviews)->toResponse($request),
            $request,
            header: CachePolicy::header(self::DOMAIN, 'list'),
        );
    }

    public function show(Review $review, Request $request): ResponseAlias
    {
        return CacheableResponse::apply(
            (new ReviewResource($review))->toResponse($request),
            $request,
            header: CachePolicy::header(self::DOMAIN, 'list'),
            etagKey: sprintf(
                'reviews:detail:%s:%d',
                $review->id,
                $review->updated_at?->getTimestamp() ?? 0,
            ),
        );
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $review = $this->service->create($request->validated());

        return ReviewResource::make($review)
            ->response()
            ->setStatusCode(ResponseAlias::HTTP_CREATED);
    }

    public function update(UpdateReviewRequest $request, Review $review): ReviewResource
    {
        $this->authorize('update', $review);

        return new ReviewResource(
            $this->service->update($review, $request->validated()),
        );
    }

    public function approve(Review $review): ReviewResource
    {
        $this->authorize('approve', $review);

        return new ReviewResource(
            $this->service->approve($review),
        );
    }

    public function reject(Review $review): ReviewResource
    {
        $this->authorize('reject', $review);

        return new ReviewResource(
            $this->service->reject($review),
        );
    }

    public function destroy(Review $review): ResponseAlias
    {
        $this->authorize('delete', $review);

        $this->service->delete($review);

        return response()->noContent();
    }
}
