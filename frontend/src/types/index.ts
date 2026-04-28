import type { components } from "./openapi";
import type { CategoryRow, ProductRow, ReviewRow } from "./schema";

/**
 * Public, app-facing aliases. Components import from here, never from
 * `./openapi.ts` directly — that file is auto-generated and exists to
 * be replaced wholesale on every contract change.
 */
export type Category = components["schemas"]["CategoryResource"];
export type StoreCategoryInput = components["schemas"]["StoreCategoryRequest"];
export type UpdateCategoryInput = components["schemas"]["UpdateCategoryRequest"];

export type Product = components["schemas"]["ProductResource"];
export type StoreProductInput = components["schemas"]["StoreProductRequest"];
export type UpdateProductInput = components["schemas"]["UpdateProductRequest"];

export type Review = components["schemas"]["ReviewResource"];
export type StoreReviewInput = components["schemas"]["StoreReviewRequest"];
export type UpdateReviewInput = components["schemas"]["UpdateReviewRequest"];

/**
 * Drift guard: the OpenAPI-derived shape and the Drizzle-inferred row
 * shape must agree on the columns the API returns. Any rename or type
 * change on either side that breaks this satisfies block fails the TS
 * build. The reconciliation runs at the field level — Drizzle's row
 * carries DB-only columns (deleted_at) that the API hides; the API's
 * timestamps are ISO strings while Drizzle returns Date. This block
 * pins exactly the fields that *should* match shape-for-shape.
 */
type CategoryContract = {
  id: Category["id"];
  name: Category["name"];
  slug: Category["slug"];
  description: Category["description"];
};

type CategoryRowContract = {
  id: CategoryRow["id"];
  name: CategoryRow["name"];
  slug: CategoryRow["slug"];
  description: CategoryRow["description"];
};

type ProductContract = {
  id: Product["id"];
  name: Product["name"];
  slug: Product["slug"];
  description: Product["description"];
};

type ProductRowContract = {
  id: ProductRow["id"];
  name: ProductRow["name"];
  slug: ProductRow["slug"];
  description: ProductRow["description"];
};

type ReviewContract = {
  id: Review["id"];
  product_id: Review["product_id"];
  reviewer_name: Review["reviewer_name"];
  email: Review["email"];
  rating: Review["rating"];
  body: Review["body"];
  is_approved: Review["is_approved"];
};

type ReviewRowContract = {
  id: ReviewRow["id"];
  product_id: ReviewRow["productId"];
  reviewer_name: ReviewRow["reviewerName"];
  email: ReviewRow["email"];
  rating: ReviewRow["rating"];
  body: ReviewRow["body"];
  is_approved: ReviewRow["isApproved"];
};

// Compile-time reconciliation. If the row drifts, both sides fail to
// satisfy the contract and the build breaks before reaching CI.
const _categoryContract = {} as CategoryContract satisfies CategoryRowContract;
const _categoryRowContract = {} as CategoryRowContract satisfies CategoryContract;
const _productContract = {} as ProductContract satisfies ProductRowContract;
const _productRowContract = {} as ProductRowContract satisfies ProductContract;
const _reviewContract = {} as ReviewContract satisfies ReviewRowContract;
const _reviewRowContract = {} as ReviewRowContract satisfies ReviewContract;
void _categoryContract;
void _categoryRowContract;
void _productContract;
void _productRowContract;
void _reviewContract;
void _reviewRowContract;
