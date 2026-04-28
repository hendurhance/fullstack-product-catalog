"use client";

import { useState } from "react";
import Link from "next/link";

import type { Product } from "@/types";
import { formatPrice } from "@/lib/money";
import { Button } from "@/components/primitives";

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-[12px] border border-(--rule) bg-(--paper-2) p-5 transition-[border-color,box-shadow] hover:border-(--ink-muted) hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="acme-display text-[18px] leading-snug text-(--ink) transition-transform group-hover:translate-x-0.5">
          {product.name}
        </h2>
        <span
          aria-hidden
          className="mt-1 text-(--ink-faint) transition-transform group-hover:translate-x-1 group-hover:text-(--ink)"
        >
          →
        </span>
      </div>
      {product.description ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-(--ink-muted)">
          {product.description}
        </p>
      ) : null}
      <div className="mt-4 flex items-baseline justify-between">
        <span className="acme-mono text-sm font-medium text-(--ink)">
          {formatPrice(product.price)}
        </span>
        <span className="acme-mono text-[11px] text-(--ink-faint)">
          {product.stock_qty > 0 ? `${product.stock_qty} in stock` : "Out of stock"}
        </span>
      </div>
    </Link>
  );
}

export function ProductListClient({
  initialProducts,
  initialNextCursor,
  categoryId,
}: {
  initialProducts: Product[];
  initialNextCursor: string | null;
  categoryId?: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor) return;
    setLoading(true);

    try {
      const basePath = categoryId
        ? `/products?category_id=${categoryId}&cursor=${nextCursor}`
        : `/products?cursor=${nextCursor}`;

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const resp = await fetch(`${baseUrl}${basePath}`);
      const json = await resp.json();

      setProducts((prev) => [...prev, ...json.data]);
      setNextCursor(json.meta?.next_cursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[12px] border border-dashed border-(--rule-strong) px-8 py-16 text-center">
        <p className="acme-display text-xl text-(--ink)">No products found</p>
        <p className="mt-2 text-sm text-(--ink-muted)">
          {categoryId
            ? "No products in this category yet."
            : "The catalog will populate once products are published."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {nextCursor && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="secondary"
            onClick={loadMore}
            loading={loading}
          >
            Load more products
          </Button>
        </div>
      )}
    </div>
  );
}
