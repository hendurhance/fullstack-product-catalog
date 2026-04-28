import Link from "next/link";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { listProducts, listProductsByCategory } from "@/lib/api/products";
import { CATEGORY_TAGS, listCategories } from "@/lib/api/categories";
import { ProductListClient } from "./product-list-client";

export const metadata = {
  title: "Products · Acme",
  description: "Browse our curated product catalog.",
};

async function CategoryFilterBar({ activeCategory }: { activeCategory?: string }) {
  "use cache";
  cacheLife("categoryList");
  cacheTag(CATEGORY_TAGS.list);

  const categories = await listCategories();

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className={`rounded-[8px] border px-3.5 py-1.5 text-sm font-medium transition-colors ${
          !activeCategory
            ? "border-(--ink) bg-(--ink) text-(--paper)"
            : "border-(--rule-strong) bg-(--paper-2) text-(--ink-muted) hover:border-(--ink-muted) hover:text-(--ink)"
        }`}
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/products?category=${c.slug}`}
          className={`rounded-[8px] border px-3.5 py-1.5 text-sm transition-colors ${
            activeCategory === c.slug
              ? "border-(--ink) bg-(--ink) text-(--paper) font-medium"
              : "border-(--rule-strong) bg-(--paper-2) text-(--ink-muted) hover:border-(--ink-muted) hover:text-(--ink)"
          }`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}

async function ProductGrid({ categoryId }: { categoryId?: string }) {
  const res = categoryId
    ? await listProductsByCategory(categoryId)
    : await listProducts();

  return (
    <ProductListClient
      initialProducts={res.data}
      initialNextCursor={res.meta.next_cursor}
      categoryId={categoryId}
    />
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-[12px] border border-(--rule) bg-(--paper-2) p-5"
        >
          <div className="h-5 w-2/3 rounded bg-(--rule)" />
          <div className="mt-3 h-3 w-full rounded bg-(--rule)/60" />
          <div className="mt-2 h-3 w-4/5 rounded bg-(--rule)/40" />
          <div className="mt-5 h-4 w-1/3 rounded bg-(--rule)" />
        </div>
      ))}
    </div>
  );
}

async function CategoryResolver({ categorySlug }: { categorySlug?: string }) {
  if (!categorySlug) {
    return (
      <Suspense fallback={<ProductSkeleton />}>
        <ProductGrid />
      </Suspense>
    );
  }

  const categories = await listCategories();
  const cat = categories.find((c) => c.slug === categorySlug);

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductGrid categoryId={cat?.id} />
    </Suspense>
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  return (
    <main className="acme-grain mx-auto w-full max-w-5xl px-6 py-20">
      <header className="mb-10">
        <p className="acme-eyebrow mb-3">The Acme Index</p>
        <h1 className="acme-display text-[56px] tracking-[-0.03em] text-(--ink) sm:text-[64px]">
          Products
        </h1>
        <p className="mt-3 max-w-prose text-[15px] text-(--ink-muted)">
          Browse the full catalog. Filter by category to narrow your search.
        </p>
      </header>

      <div className="mb-8">
        <Suspense
          fallback={
            <div className="flex gap-2">
              <div className="h-8 w-14 rounded-[8px] bg-(--rule)" />
              <div className="h-8 w-24 rounded-[8px] bg-(--rule)" />
              <div className="h-8 w-20 rounded-[8px] bg-(--rule)" />
            </div>
          }
        >
          <CategoryFilterBar activeCategory={category} />
        </Suspense>
      </div>

      <CategoryResolver categorySlug={category} />

      <footer className="mt-16 flex items-baseline justify-between border-t border-(--rule) pt-6 text-xs text-(--ink-faint)">
        <span className="acme-mono">/v1/products</span>
        <Link
          href="/admin/products"
          className="text-(--ink-muted) transition-colors hover:text-(--ink)"
        >
          Admin →
        </Link>
      </footer>
    </main>
  );
}
