import Link from "next/link";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { CATEGORY_TAGS, listCategories } from "@/lib/api/categories";

export const metadata = {
  title: "Categories · Acme",
  description: "Browse all product categories.",
};

async function CategoryGrid() {
  "use cache";
  cacheLife("categoryList");
  cacheTag(CATEGORY_TAGS.list);

  const categories = await listCategories();

  if (categories.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-(--rule-strong) px-8 py-16 text-center">
        <p className="acme-display text-xl text-(--ink)">No categories yet</p>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Categories will appear once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/categories/${c.slug}`}
          className="group rounded-[12px] border border-(--rule) bg-(--paper-2) p-6 transition-[border-color,box-shadow] hover:border-(--ink-muted) hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="acme-display text-[22px] text-(--ink) transition-transform group-hover:translate-x-0.5">
              {c.name}
            </h2>
            <span
              aria-hidden
              className="mt-1.5 text-(--ink-faint) transition-transform group-hover:translate-x-1 group-hover:text-(--ink)"
            >
              →
            </span>
          </div>
          {c.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-(--ink-muted)">
              {c.description}
            </p>
          ) : (
            <p className="mt-3 text-sm italic text-(--ink-faint)">
              No description.
            </p>
          )}
          <p className="acme-mono mt-5 text-[11px] text-(--ink-faint)">
            /{c.slug}
          </p>
        </Link>
      ))}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[12px] border border-(--rule) bg-(--paper-2) p-6"
        >
          <div className="h-6 w-1/2 rounded bg-(--rule)" />
          <div className="mt-4 h-3 w-full rounded bg-(--rule)/60" />
          <div className="mt-2 h-3 w-3/4 rounded bg-(--rule)/40" />
          <div className="mt-5 h-3 w-1/4 rounded bg-(--rule)" />
        </div>
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <main className="acme-grain mx-auto w-full max-w-5xl px-6 py-20">
      <header className="mb-14">
        <p className="acme-eyebrow mb-3">The Acme Index</p>
        <h1 className="acme-display text-[56px] tracking-[-0.03em] text-(--ink) sm:text-[64px]">
          Categories
        </h1>
        <p className="mt-3 max-w-prose text-[15px] text-(--ink-muted)">
          Every category in the catalog. Click to see its products.
        </p>
      </header>

      <Suspense fallback={<CategorySkeleton />}>
        <CategoryGrid />
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
