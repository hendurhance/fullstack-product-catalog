"use server";

import { updateTag } from "next/cache";

import {
  CATEGORY_TAGS,
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/api/categories";
import { ApiError } from "@/lib/api/client";
import { requireAdminToken } from "@/lib/auth/cookies";
import type { Category, StoreCategoryInput, UpdateCategoryInput } from "@/types";

/*
 * Server Actions are the bridge between the client admin UI and the
 * backend SDK. Token lives in an HttpOnly cookie that JS can't read,
 * so every mutation reads the cookie here and forwards it as a
 * bearer header. Each successful mutation also flushes the public
 * Next cache tags so the public catalog reflects the change without
 * waiting for the cacheLife window — closes the loop end-to-end.
 *
 * Errors are normalized to a small ActionError shape; the client
 * renders the field-level `errors` map straight into RHF.
 */

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export type ActionError = {
  message: string;
  status: number;
  code: string;
  fields?: Record<string, string[]>;
};

function toActionError(error: unknown): ActionError {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      fields: error.errors,
    };
  }
  return {
    message: error instanceof Error ? error.message : "Request failed",
    status: 0,
    code: "UNKNOWN",
  };
}

export async function listCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const data = await listCategories({ cache: "no-store" });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function createCategoryAction(
  input: StoreCategoryInput,
): Promise<ActionResult<Category>> {
  try {
    const token = await requireAdminToken();
    const data = await createCategory(input, { token });
    updateTag(CATEGORY_TAGS.list);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function updateCategoryAction(
  slug: string,
  input: UpdateCategoryInput,
): Promise<ActionResult<Category>> {
  try {
    const token = await requireAdminToken();
    const data = await updateCategory(slug, input, { token });
    updateTag(CATEGORY_TAGS.list);
    updateTag(CATEGORY_TAGS.detail(slug));
    if (data.slug !== slug) {
      updateTag(CATEGORY_TAGS.detail(data.slug));
    }
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}

export async function deleteCategoryAction(
  slug: string,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const token = await requireAdminToken();
    await deleteCategory(slug, { token });
    updateTag(CATEGORY_TAGS.list);
    updateTag(CATEGORY_TAGS.detail(slug));
    return { ok: true, data: { slug } };
  } catch (error) {
    return { ok: false, error: toActionError(error) };
  }
}
