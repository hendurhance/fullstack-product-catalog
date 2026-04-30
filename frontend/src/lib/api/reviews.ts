import type {
  Review,
  StoreReviewInput,
} from "@/types";
import { apiFetch, type RequestOptions } from "./client";

export const REVIEW_TAGS = {
  list: "reviews",
  product: (productId: string) => `reviews:product:${productId}`,
} as const;

type AuthOpts = Pick<RequestOptions, "token">;
type FetchOpts = Pick<RequestOptions, "cache" | "next" | "signal">;

type ReviewListResponse = {
  data: Review[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { path: string; per_page: number; next_cursor: string | null; prev_cursor: string | null };
};

type ReviewEnvelope = { data: Review };

export async function listReviews(opts: FetchOpts = {}): Promise<ReviewListResponse> {
  return apiFetch<ReviewListResponse>("/reviews", {
    next: { tags: [REVIEW_TAGS.list] },
    ...opts,
  });
}

export async function listReviewsByProduct(
  productId: string,
  opts: FetchOpts & { cursor?: string } = {},
): Promise<ReviewListResponse> {
  const { cursor, ...fetchOpts } = opts;
  const params = new URLSearchParams({ product_id: productId });
  if (cursor) params.set("cursor", cursor);
  return apiFetch<ReviewListResponse>(`/reviews?${params}`, {
    next: { tags: [REVIEW_TAGS.list, REVIEW_TAGS.product(productId)] },
    ...fetchOpts,
  });
}

export async function createReview(
  input: StoreReviewInput,
): Promise<Review> {
  const res = await apiFetch<ReviewEnvelope>("/reviews", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function approveReview(
  id: string,
  opts: AuthOpts,
): Promise<Review> {
  const res = await apiFetch<ReviewEnvelope>(`/reviews/${id}/approve`, {
    method: "POST",
    ...opts,
  });
  return res.data;
}

export async function rejectReview(
  id: string,
  opts: AuthOpts,
): Promise<Review> {
  const res = await apiFetch<ReviewEnvelope>(`/reviews/${id}/reject`, {
    method: "POST",
    ...opts,
  });
  return res.data;
}

export async function deleteReview(
  id: string,
  opts: AuthOpts,
): Promise<void> {
  await apiFetch<void>(`/reviews/${id}`, {
    method: "DELETE",
    ...opts,
  });
}
