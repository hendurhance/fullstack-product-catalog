import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";

import {
  PRODUCT_TAGS,
  getProduct,
  listProducts,
} from "@/lib/api/products";
import { formatPrice } from "@/lib/money";
import type { Product } from "@/types";
import { ApiError } from "@/lib/api/client";
import { ProductReviews } from "./product-reviews";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  "use cache";
  cacheLife("productList");
  cacheTag(PRODUCT_TAGS.list);

  const slugs: string[] = [];
  let cursor: string | undefined;

  do {
    const res = await listProducts(cursor ? { cache: "no-store", cursor } : undefined);
    for (const p of res.data) {
      slugs.push(p.slug);
    }
    cursor = res.meta.next_cursor ?? undefined;
  } while (cursor);

  return slugs.map((slug) => ({ slug }));
}

async function loadProduct(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife("productDetail");
  cacheTag(PRODUCT_TAGS.list, PRODUCT_TAGS.detail(slug));

  try {
    return await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Product not found · Acme" };
  return {
    title: `${product.name} · Acme`,
    description: product.description ?? `${product.name} product page.`,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="acme-grain mx-auto w-full max-w-3xl px-6 py-20">
      <nav className="mb-12">
        <Link
          href="/products"
          className="acme-eyebrow text-(--ink-muted) transition-colors hover:text-(--ink)"
        >
          ← All products
        </Link>
      </nav>

      <header className="mb-12">
        <p className="acme-eyebrow mb-3">Product</p>
        <h1 className="acme-display text-[56px] leading-[1.05] tracking-[-0.03em] text-(--ink)">
          {product.name}
        </h1>
        <div className="mt-5 flex items-baseline gap-3">
          <span className="acme-display text-[28px] text-(--ink)">
            {product.price_display}
          </span>
          <span className="acme-mono text-xs text-(--ink-faint)">
            {product.stock_qty > 0
              ? `${product.stock_qty} in stock`
              : "Out of stock"}
          </span>
        </div>
      </header>

      {product.description ? (
        <div className="border-t border-(--rule) pt-8">
          <p className="max-w-prose text-[18px] leading-[1.7] text-(--ink)">
            {product.description}
          </p>
        </div>
      ) : (
        <div className="border-t border-(--rule) pt-8">
          <p className="text-(--ink-faint) italic">No description.</p>
        </div>
      )}

      <ProductReviews
        productId={product.id}
        averageRating={product.review_summary?.average_rating ?? 0}
        reviewCount={product.review_summary?.count ?? 0}
      />

      <footer className="mt-20 grid gap-2 border-t border-(--rule) pt-6 sm:grid-cols-2 sm:gap-0">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="acme-mono text-(--ink-faint)">id</dt>
          <dd className="acme-mono text-(--ink-muted)">{product.id}</dd>
          <dt className="acme-mono text-(--ink-faint)">price</dt>
          <dd className="acme-mono text-(--ink-muted)">{formatPrice(product.price)}</dd>
          <dt className="acme-mono text-(--ink-faint)">updated</dt>
          <dd className="acme-mono text-(--ink-muted)">
            <time dateTime={product.updated_at}>
              {new Date(product.updated_at).toLocaleString()}
            </time>
          </dd>
        </dl>
        <Link
          href="/products"
          className="text-xs text-(--ink-muted) transition-colors hover:text-(--ink) sm:text-right"
        >
          Back to index →
        </Link>
      </footer>
    </main>
  );
}
