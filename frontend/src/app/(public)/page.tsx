import Link from "next/link";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";

import { PRODUCT_TAGS, listProducts } from "@/lib/api/products";
import { formatPrice } from "@/lib/money";

export const metadata = {
  title: "Acme · Catalog",
  description: "A small product catalog, carefully wired.",
};

async function FeaturedProducts() {
  "use cache";
  cacheLife("productList");
  cacheTag(PRODUCT_TAGS.list);

  const res = await listProducts();
  const products = res.data.slice(0, 4);

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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.slug}`}
          className="group rounded-[12px] border border-(--rule) bg-(--paper-2) p-5 transition-[border-color,box-shadow] hover:border-(--ink-muted) hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="acme-display text-[18px] leading-snug text-(--ink) transition-transform group-hover:translate-x-0.5">
              {p.name}
            </h3>
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
            <span className="acme-mono text-sm text-(--ink)">
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

function FeaturedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
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

export default function Home() {
  return (
    <main className="acme-grain mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
      <header className="mb-14">
        <p className="acme-eyebrow mb-3">Acme · Catalog</p>
        <h1 className="acme-display text-[56px] leading-[0.95] tracking-[-0.03em] text-(--ink) sm:text-[72px]">
          A small catalog,
          <br />
          carefully wired.
        </h1>
        <p className="mt-4 max-w-prose text-[16px] leading-relaxed text-(--ink-muted)">
          A full-stack product catalog where the contract is the source of truth.
          Browse our featured products below or explore the full range.
        </p>
      </header>

      <section className="mb-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="acme-display text-[28px] text-(--ink)">Featured</h2>
          <Link
            href="/products"
            className="text-sm text-(--ink-muted) transition-colors hover:text-(--ink)"
          >
            All products →
          </Link>
        </div>
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      </section>

      <footer className="mt-auto flex items-baseline justify-between border-t border-(--rule) pt-8 text-xs text-(--ink-faint)">
        <span className="acme-mono">Laravel 13 · Next 16 · MySQL · Redis</span>
        <span>Take-home assessment</span>
      </footer>
    </main>
  );
}
