import { boolean, int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Drizzle row schemas — kept in this repo per the brief, even though
 * the frontend never opens a DB connection. Drizzle's `$inferSelect`
 * gives us a row type derived from the column definitions; that row
 * type is reconciled against the OpenAPI-derived `CategoryResource`
 * type at compile time (see `./index.ts`) so the two cannot drift.
 *
 * Mirror the backend migration exactly: any column rename here without
 * a matching migration must fail typecheck via the reconciliation
 * `satisfies` block.
 */
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type CategoryRow = typeof categories.$inferSelect;

export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),
  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  stockQty: int("stock_qty").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export type ProductRow = typeof products.$inferSelect;

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  reviewerName: varchar("reviewer_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  rating: int("rating").notNull(),
  body: text("body").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ReviewRow = typeof reviews.$inferSelect;
