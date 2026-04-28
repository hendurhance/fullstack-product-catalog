import { Suspense } from "react";

import { listReviewsByProduct } from "@/lib/api/reviews";
import { ReviewForm } from "./reviews/review-form";
import type { Review } from "@/types";

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-sm ${i < rating ? "text-(--ink)" : "text-(--rule-strong)"}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-sm font-medium text-(--ink)">
            {review.reviewer_name}
          </span>
          <span className="ml-2 text-xs text-(--ink-faint)">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
        <RatingStars rating={review.rating} />
      </div>
      <p className="text-sm leading-relaxed text-(--ink-muted)">{review.body}</p>
    </article>
  );
}

async function ReviewList({ productId }: { productId: string }) {
  const res = await listReviewsByProduct(productId);
  const reviews = res.data;

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-(--ink-muted)">
        No reviews yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex gap-3">
            <div className="h-4 w-24 rounded bg-(--rule)" />
            <div className="h-4 w-20 rounded bg-(--rule)" />
          </div>
          <div className="h-3 w-full rounded bg-(--rule)/50" />
          <div className="h-3 w-3/4 rounded bg-(--rule)/30" />
        </div>
      ))}
    </div>
  );
}

export function ProductReviews({
  productId,
  averageRating,
  reviewCount,
}: {
  productId: string;
  averageRating: number;
  reviewCount: number;
}) {
  return (
    <section className="mt-16 border-t border-(--rule) pt-10">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h2 className="acme-display text-[22px] text-(--ink)">
          Reviews
          {reviewCount > 0 && (
            <span className="ml-2 text-sm font-normal text-(--ink-muted)">
              ({reviewCount})
            </span>
          )}
        </h2>
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <RatingStars rating={Math.round(averageRating)} />
            <span className="acme-mono text-sm text-(--ink-muted)">
              {averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <Suspense fallback={<ReviewListSkeleton />}>
          <ReviewList productId={productId} />
        </Suspense>

        <div className="rounded-[12px] border border-(--rule) bg-(--paper-2) p-5">
          <h3 className="acme-display mb-4 text-[16px] text-(--ink)">
            Write a review
          </h3>
          <ReviewForm productId={productId} />
        </div>
      </div>
    </section>
  );
}
