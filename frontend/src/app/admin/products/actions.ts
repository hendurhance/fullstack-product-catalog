"use server";

import { updateTag } from "next/cache";

import {
  PRODUCT_TAGS,
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "@/lib/api/products";
import { requireAdminToken } from "@/lib/auth/cookies";
import type { Product, StoreProductInput, UpdateProductInput } from "@/types";
import { handleActionError } from "@/lib/actions";
import type { ActionResult } from "@/lib/action-types";

export async function listProductsAction(): Promise<
  ActionResult<Product[]>
> {
  try {
    const res = await listProducts({ cache: "no-store" });
    return { ok: true, data: res.data };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}

export async function createProductAction(
  input: StoreProductInput,
): Promise<ActionResult<Product>> {
  try {
    const token = await requireAdminToken();
    const data = await createProduct(input, { token });
    updateTag(PRODUCT_TAGS.list);
    updateTag(PRODUCT_TAGS.category(data.category_id));
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}

export async function updateProductAction(
  slug: string,
  input: UpdateProductInput,
): Promise<ActionResult<Product>> {
  try {
    const token = await requireAdminToken();
    const data = await updateProduct(slug, input, { token });
    updateTag(PRODUCT_TAGS.list);
    updateTag(PRODUCT_TAGS.detail(slug));
    if (data.slug !== slug) {
      updateTag(PRODUCT_TAGS.detail(data.slug));
    }
    updateTag(PRODUCT_TAGS.category(data.category_id));
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}

export async function deleteProductAction(
  slug: string,
): Promise<ActionResult<{ slug: string }>> {
  try {
    const token = await requireAdminToken();
    await deleteProduct(slug, { token });
    updateTag(PRODUCT_TAGS.list);
    updateTag(PRODUCT_TAGS.detail(slug));
    return { ok: true, data: { slug } };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}

export async function togglePublishedAction(
  slug: string,
  is_published: boolean,
): Promise<ActionResult<Product>> {
  try {
    const token = await requireAdminToken();
    const data = await updateProduct(slug, { is_published }, { token });
    updateTag(PRODUCT_TAGS.list);
    updateTag(PRODUCT_TAGS.detail(slug));
    updateTag(PRODUCT_TAGS.category(data.category_id));
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: await handleActionError(error) };
  }
}
