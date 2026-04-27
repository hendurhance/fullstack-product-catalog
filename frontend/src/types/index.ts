import type { components } from "./openapi";
import type { CategoryRow } from "./schema";

/**
 * Public, app-facing aliases. Components import from here, never from
 * `./openapi.ts` directly — that file is auto-generated and exists to
 * be replaced wholesale on every contract change.
 */
export type Category = components["schemas"]["CategoryResource"];
export type StoreCategoryInput = components["schemas"]["StoreCategoryRequest"];
export type UpdateCategoryInput = components["schemas"]["UpdateCategoryRequest"];

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

// Compile-time reconciliation. If the row drifts, both sides fail to
// satisfy the contract and the build breaks before reaching CI.
const _categoryContract = {} as CategoryContract satisfies CategoryRowContract;
const _categoryRowContract = {} as CategoryRowContract satisfies CategoryContract;
void _categoryContract;
void _categoryRowContract;
