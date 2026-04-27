import Link from "next/link";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { CATEGORY_TAGS, listCategories } from "@/lib/api/categories";

export const metadata = {
  title: "Categories · Acme",
  description: "Browse all product categories.",
};

async function CategoriesList() {
  "use cache";
  cacheLife("categoriesList");
  cacheTag(CATEGORY_TAGS.list);

  const categories = await listCategories();

  if (categories.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-(--rule-strong) px-8 py-16 text-center">
        <p className="acme-display text-xl text-(--ink)">No categories yet</p>
        <p className="mt-2 text-sm text-(--ink-muted)">
          The catalog will populate once an admin publishes the first record.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-(--rule) border-y border-(--rule)">
      {categories.map((c, i) => (
        <li key={c.id}>
          <Link
            href={`/categories/${c.slug}`}
            className="group flex items-baseline gap-6 py-6 transition-colors hover:bg-(--paper-2)"
          >
            <span className="acme-mono w-10 shrink-0 text-[11px] text-(--ink-faint) tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <h2 className="acme-display text-[26px] text-(--ink) transition-transform group-hover:translate-x-1">
                {c.name}
              </h2>
              {c.description ? (
                <p className="mt-1 line-clamp-1 max-w-prose text-sm text-(--ink-muted)">
                  {c.description}
                </p>
              ) : null}
            </div>
            <span className="acme-mono hidden text-[11px] text-(--ink-faint) sm:inline">
              {c.slug}
            </span>
            <span
              aria-hidden
              className="text-(--ink-faint) transition-transform group-hover:translate-x-1 group-hover:text-(--ink)"
            >
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CategoriesListSkeleton() {
  return (
    <div className="divide-y divide-(--rule) border-y border-(--rule)">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-baseline gap-6 py-6">
          <div className="acme-mono w-10 shrink-0 text-[11px] text-(--ink-faint)">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="flex-1">
            <div className="h-7 w-1/3 rounded bg-(--rule)" />
            <div className="mt-3 h-3 w-2/3 rounded bg-(--rule)/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <main className="acme-grain mx-auto w-full max-w-3xl px-6 py-20">
      <header className="mb-14">
        <p className="acme-eyebrow mb-3">The Acme Index</p>
        <h1 className="acme-display text-[64px] tracking-[-0.03em] text-(--ink)">
          Categories
        </h1>
        <p className="mt-3 max-w-prose text-[15px] text-(--ink-muted)">
          Every shelf in the catalog. Each entry links through to the
          dedicated detail page where products will eventually be listed.
        </p>
      </header>

      <Suspense fallback={<CategoriesListSkeleton />}>
        <CategoriesList />
      </Suspense>

      <footer className="mt-16 flex items-baseline justify-between border-t border-(--rule) pt-6 text-xs text-(--ink-faint)">
        <span className="acme-mono">/v1/categories</span>
        <Link
          href="/admin/categories"
          className="text-(--ink-muted) transition-colors hover:text-(--ink)"
        >
          Admin →
        </Link>
      </footer>
    </main>
  );
}
