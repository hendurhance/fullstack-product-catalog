"use server";

import { updateTag } from "next/cache";

import {
  CATEGORY_TAGS,
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/api/categories";
import { requireAdminToken } from "@/lib/auth/cookies";
import type { Category, StoreCategoryInput, UpdateCategoryInput } from "@/types";
import { handleActionError } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-types";

export async function listCategoriesAction(): Promise<ActionResult<Category[]>> {
  try {
    const data = await listCategories({ cache: "no-store" });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
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
    return { ok: false, error: await handleActionError(error) };
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
    return { ok: false, error: await handleActionError(error) };
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
    return { ok: false, error: await handleActionError(error) };
  }
}
