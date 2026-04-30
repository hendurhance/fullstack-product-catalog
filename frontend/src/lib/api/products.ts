import type {
  Product,
  StoreProductInput,
  UpdateProductInput,
} from "@/types";
import { apiFetch, type RequestOptions } from "./client";

export const PRODUCT_TAGS = {
  list: "products",
  detail: (slug: string) => `product:slug:${slug}`,
  category: (categoryId: string) => `products:category:${categoryId}`,
} as const;

type AuthOpts = Pick<RequestOptions, "token">;
type FetchOpts = Pick<RequestOptions, "cache" | "next" | "signal">;

type ProductListResponse = {
  data: Product[];
  links: { first: string | null; last: string | null; prev: string | null; next: string | null };
  meta: { path: string; per_page: number; next_cursor: string | null; prev_cursor: string | null };
};

type ProductEnvelope = { data: Product };

export async function listProducts(opts: FetchOpts & { cursor?: string } = {}): Promise<ProductListResponse> {
  const { cursor, ...fetchOpts } = opts;
  const qs = cursor ? `?cursor=${cursor}` : "";
  return apiFetch<ProductListResponse>(`/products${qs}`, {
    next: { tags: [PRODUCT_TAGS.list] },
    ...fetchOpts,
  });
}

export async function listProductsByCategory(
  categoryId: string,
  opts: FetchOpts = {},
): Promise<ProductListResponse> {
  return apiFetch<ProductListResponse>(`/products?category_id=${categoryId}`, {
    next: { tags: [PRODUCT_TAGS.list, PRODUCT_TAGS.category(categoryId)] },
    ...opts,
  });
}

export async function getProduct(
  slug: string,
  opts: FetchOpts = {},
): Promise<Product> {
  const res = await apiFetch<ProductEnvelope>(`/products/${slug}`, {
    next: { tags: [PRODUCT_TAGS.list, PRODUCT_TAGS.detail(slug)] },
    ...opts,
  });
  return res.data;
}

export async function createProduct(
  input: StoreProductInput,
  opts: AuthOpts,
): Promise<Product> {
  const res = await apiFetch<ProductEnvelope>("/products", {
    method: "POST",
    body: input,
    ...opts,
  });
  return res.data;
}

export async function updateProduct(
  slug: string,
  input: UpdateProductInput,
  opts: AuthOpts,
): Promise<Product> {
  const res = await apiFetch<ProductEnvelope>(`/products/${slug}`, {
    method: "PATCH",
    body: input,
    ...opts,
  });
  return res.data;
}

export async function deleteProduct(
  slug: string,
  opts: AuthOpts,
): Promise<void> {
  await apiFetch<void>(`/products/${slug}`, {
    method: "DELETE",
    ...opts,
  });
}
