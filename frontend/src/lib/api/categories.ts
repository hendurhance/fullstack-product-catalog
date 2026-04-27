import type {
  Category,
  StoreCategoryInput,
  UpdateCategoryInput,
} from "@/types";
import { apiFetch, type RequestOptions } from "./client";

/**
 * Categories SDK — one function per endpoint, all typed against the
 * OpenAPI-generated component schemas re-exported from `@/types`.
 *
 * Cache tags live here so a renamed tag changes in one place. The
 * revalidation webhook (Phase 1, step 11) flushes by these tag names;
 * page-level fetches and admin mutations both reference the same set.
 */

export const CATEGORY_TAGS = {
  list: "categories",
  detail: (slug: string) => `category:${slug}`,
} as const;

type AuthOpts = Pick<RequestOptions, "token">;
type FetchOpts = Pick<RequestOptions, "cache" | "next" | "signal">;

type Envelope<T> = { data: T };

export async function listCategories(opts: FetchOpts = {}): Promise<Category[]> {
  const res = await apiFetch<Envelope<Category[]>>("/categories", {
    next: { tags: [CATEGORY_TAGS.list] },
    ...opts,
  });
  return res.data;
}

export async function getCategory(
  slug: string,
  opts: FetchOpts = {},
): Promise<Category> {
  const res = await apiFetch<Envelope<Category>>(`/categories/${slug}`, {
    next: { tags: [CATEGORY_TAGS.list, CATEGORY_TAGS.detail(slug)] },
    ...opts,
  });
  return res.data;
}

export async function createCategory(
  input: StoreCategoryInput,
  opts: AuthOpts,
): Promise<Category> {
  const res = await apiFetch<Envelope<Category>>("/categories", {
    method: "POST",
    body: input,
    ...opts,
  });
  return res.data;
}

export async function updateCategory(
  slug: string,
  input: UpdateCategoryInput,
  opts: AuthOpts,
): Promise<Category> {
  const res = await apiFetch<Envelope<Category>>(`/categories/${slug}`, {
    method: "PATCH",
    body: input,
    ...opts,
  });
  return res.data;
}

export async function deleteCategory(
  slug: string,
  opts: AuthOpts,
): Promise<void> {
  await apiFetch<void>(`/categories/${slug}`, {
    method: "DELETE",
    ...opts,
  });
}
