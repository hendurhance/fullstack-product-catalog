"use server";

import { updateTag } from "next/cache";

import {
  REVIEW_TAGS,
  approveReview,
  deleteReview,
  listReviews,
  rejectReview,
} from "@/lib/api/reviews";
import { requireAdminToken } from "@/lib/auth/cookies";
import type { Review } from "@/types";
import { handleActionError } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-types";

export async function listReviewsAction(): Promise<
  ActionResult<Review[]>
> {
  try {
    const res = await listReviews({ cache: "no-store" });
    return { ok: true, data: res.data };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}

export async function approveReviewAction(
  id: string,
): Promise<ActionResult<Review>> {
  try {
    const token = await requireAdminToken();
    const data = await approveReview(id, { token });
    updateTag(REVIEW_TAGS.list);
    updateTag(REVIEW_TAGS.product(data.product_id));
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}

export async function rejectReviewAction(
  id: string,
): Promise<ActionResult<Review>> {
  try {
    const token = await requireAdminToken();
    const data = await rejectReview(id, { token });
    updateTag(REVIEW_TAGS.list);
    updateTag(REVIEW_TAGS.product(data.product_id));
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}

export async function deleteReviewAction(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const token = await requireAdminToken();
    await deleteReview(id, { token });
    updateTag(REVIEW_TAGS.list);
    return { ok: true, data: { id } };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}
