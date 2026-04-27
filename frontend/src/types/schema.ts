import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export type CategoryRow = typeof categories.$inferSelect;
