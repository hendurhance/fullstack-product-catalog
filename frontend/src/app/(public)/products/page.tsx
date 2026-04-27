import Link from "next/link";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { PRODUCT_TAGS, listProducts } from "@/lib/api/products";
import { CATEGORY_TAGS, listCategories } from "@/lib/api/categories";
import { formatPrice } from "@/lib/money";

export const metadata = {
  title: "Products · Acme",
  description: "Browse our curated product catalog.",
};

async function ProductGrid() {
  "use cache";
  cacheLife("productList");
  cacheTag(PRODUCT_TAGS.list);

  const res = await listProducts();
  const products = res.data;

  if (products.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-(--rule-strong) px-8 py-16 text-center">
        <p className="acme-display text-xl text-(--ink)">No products yet</p>
        <p className="mt-2 text-sm text-(--ink-muted)">
          The catalog will populate once products are published.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.slug}`}
          className="group rounded-[12px] border border-(--rule) bg-(--paper-2) p-5 transition-[border-color,box-shadow] hover:border-(--ink-muted) hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-start justify-between gap-2">
            <h2 className="acme-display text-[18px] leading-snug text-(--ink) transition-transform group-hover:translate-x-0.5">
              {p.name}
            </h2>
            <span
              aria-hidden
              className="mt-1 text-(--ink-faint) transition-transform group-hover:translate-x-1 group-hover:text-(--ink)"
            >
              →
            </span>
          </div>
          {p.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-(--ink-muted)">
              {p.description}
            </p>
          ) : null}
          <div className="mt-4 flex items-baseline justify-between">
            <span className="acme-mono text-sm font-medium text-(--ink)">
              {formatPrice(p.price)}
            </span>
            <span className="acme-mono text-[11px] text-(--ink-faint)">
              {p.stock_qty > 0 ? `${p.stock_qty} in stock` : "Out of stock"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function CategoryFilter() {
  "use cache";
  cacheLife("categoryList");
  cacheTag(CATEGORY_TAGS.list);

  const categories = await listCategories();

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/products"
        className="rounded-[8px] border border-(--ink) bg-(--ink) px-3.5 py-1.5 text-sm font-medium text-(--paper) transition-colors"
      >
        All
      </Link>
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/categories/${c.slug}`}
          className="rounded-[8px] border border-(--rule-strong) bg-(--paper-2) px-3.5 py-1.5 text-sm text-(--ink-muted) transition-colors hover:border-(--ink-muted) hover:text-(--ink)"
        >
          {c.name}
        </Link>
      ))}
    </div>
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

export default function ProductsPage() {
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
          <CategoryFilter />
        </Suspense>
      </div>

      <Suspense fallback={<ProductSkeleton />}>
        <ProductGrid />
      </Suspense>

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
