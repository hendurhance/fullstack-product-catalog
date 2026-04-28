"use server";

import { updateTag } from "next/cache";

import { REVIEW_TAGS, createReview, listReviewsByProduct } from "@/lib/api/reviews";
import { ApiError } from "@/lib/api/client";
import type { Review, StoreReviewInput } from "@/types";

export type SubmitResult =
  | { ok: true; data: Review }
  | { ok: false; error: string; fields?: Record<string, string[]> };

export async function submitReviewAction(
  input: StoreReviewInput,
): Promise<SubmitResult> {
  try {
    const data = await createReview(input);
    updateTag(REVIEW_TAGS.product(input.product_id));
    updateTag(REVIEW_TAGS.list);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        error: error.message,
        fields: error.errors,
      };
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Submission failed.",
    };
  }
}

export async function loadProductReviews(
  productId: string,
): Promise<{ reviews: Review[]; error: string | null }> {
  try {
    const res = await listReviewsByProduct(productId, {
      cache: "no-store",
    });
    return { reviews: res.data, error: null };
  } catch (error) {
    return {
      reviews: [],
      error: error instanceof Error ? error.message : "Failed to load reviews.",
    };
  }
}
