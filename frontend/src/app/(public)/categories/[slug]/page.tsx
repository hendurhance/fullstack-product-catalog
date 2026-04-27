import Link from "next/link";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";

import {
  CATEGORY_TAGS,
  getCategory,
  listCategories,
} from "@/lib/api/categories";
import { PRODUCT_TAGS, listProductsByCategory } from "@/lib/api/products";
import type { Category, Product } from "@/types";
import { ApiError } from "@/lib/api/client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  "use cache";
  cacheLife("categoryList");
  cacheTag(CATEGORY_TAGS.list);

  const categories = await listCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

async function loadCategory(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("categoryDetail");
  cacheTag(CATEGORY_TAGS.list, CATEGORY_TAGS.detail(slug));

  try {
    return await getCategory(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function loadProducts(categoryId: string): Promise<Product[]> {
  "use cache";
  cacheLife("productList");
  cacheTag(PRODUCT_TAGS.list, PRODUCT_TAGS.category(categoryId));

  const res = await listProductsByCategory(categoryId);
  return res.data;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) return { title: "Category not found · Acme" };
  return {
    title: `${category.name} · Acme`,
    description: category.description ?? `${category.name} category page.`,
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await loadCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="acme-grain mx-auto w-full max-w-3xl px-6 py-20">
      <nav className="mb-12">
        <Link
          href="/categories"
          className="acme-eyebrow text-(--ink-muted) transition-colors hover:text-(--ink)"
        >
          ← All categories
        </Link>
      </nav>

      <header className="mb-12">
        <p className="acme-eyebrow mb-3">Category</p>
        <h1 className="acme-display text-[68px] tracking-[-0.03em] text-(--ink)">
          {category.name}
        </h1>
        <p className="acme-mono mt-4 text-xs text-(--ink-faint)">
          /{category.slug}
        </p>
      </header>

      {category.description ? (
        <div className="border-t border-(--rule) pt-8">
          <p className="max-w-prose text-[18px] leading-[1.7] text-(--ink)">
            {category.description}
          </p>
        </div>
      ) : (
        <div className="border-t border-(--rule) pt-8">
          <p className="text-(--ink-faint) italic">No description.</p>
        </div>
      )}

      <section className="mt-16">
        <div className="flex items-baseline justify-between">
          <h2 className="acme-display text-[22px] text-(--ink)">Products</h2>
          <Link
            href="/products"
            className="text-xs text-(--ink-muted) transition-colors hover:text-(--ink)"
          >
            All products →
          </Link>
        </div>
        <Suspense
          fallback={
            <div className="mt-6 divide-y divide-(--rule) border-y border-(--rule)">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-baseline gap-6 py-5">
                  <div className="flex-1">
                    <div className="h-5 w-1/3 rounded bg-(--rule)" />
                    <div className="mt-2 h-3 w-2/3 rounded bg-(--rule)/60" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <CategoryProducts categoryId={category.id} />
        </Suspense>
      </section>

      <footer className="mt-20 grid gap-2 border-t border-(--rule) pt-6 sm:grid-cols-2 sm:gap-0">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="acme-mono text-(--ink-faint)">id</dt>
          <dd className="acme-mono text-(--ink-muted)">{category.id}</dd>
          <dt className="acme-mono text-(--ink-faint)">updated</dt>
          <dd className="acme-mono text-(--ink-muted)">
            <time dateTime={category.updated_at}>
              {new Date(category.updated_at).toLocaleString()}
            </time>
          </dd>
        </dl>
        <Link
          href="/categories"
          className="text-xs text-(--ink-muted) transition-colors hover:text-(--ink) sm:text-right"
        >
          Back to index →
        </Link>
      </footer>
    </main>
  );
}

async function CategoryProducts({ categoryId }: { categoryId: string }) {
  const products = await loadProducts(categoryId);

  if (products.length === 0) {
    return (
      <div className="mt-6 rounded-[12px] border border-dashed border-(--rule-strong) px-8 py-10 text-center">
        <p className="text-sm text-(--ink-muted)">
          No products in this category yet.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 divide-y divide-(--rule) border-y border-(--rule)">
      {products.map((p, i) => (
        <li key={p.id}>
          <Link
            href={`/products/${p.slug}`}
            className="group flex items-baseline gap-6 py-5 transition-colors hover:bg-(--paper-2)"
          >
            <span className="acme-mono w-8 shrink-0 text-[11px] text-(--ink-faint) tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex-1">
              <h3 className="acme-display text-[18px] text-(--ink) transition-transform group-hover:translate-x-1">
                {p.name}
              </h3>
              {p.description ? (
                <p className="mt-0.5 line-clamp-1 max-w-prose text-sm text-(--ink-muted)">
                  {p.description}
                </p>
              ) : null}
            </div>
            <span className="acme-mono text-sm text-(--ink)">
              {p.price_display}
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
