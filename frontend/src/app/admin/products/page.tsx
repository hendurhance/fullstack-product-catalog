import { Suspense } from "react";
import { Eyebrow } from "@/components/primitives";

import { listProductsAction } from "./actions";
import { ProductsTable } from "./_components/products-table";
import { requireAdmin } from "../layout";
import { listCategories } from "@/lib/api/categories";

async function ProductsData() {
  await requireAdmin();
  const [productsResult, categories] = await Promise.all([
    listProductsAction(),
    listCategories({ cache: "no-store" }),
  ]);

  return (
    <ProductsTable
      initial={productsResult.ok ? productsResult.data : []}
      initialError={productsResult.ok ? null : productsResult.error.message}
      categories={categories}
    />
  );
}

function ProductsSkeleton() {
  return (
    <div className="rounded-[12px] border border-(--rule) p-8">
      <div className="h-4 w-48 rounded bg-(--rule)" />
      <div className="mt-4 h-10 w-full rounded bg-(--rule)/50" />
      <div className="mt-2 h-10 w-full rounded bg-(--rule)/30" />
      <div className="mt-2 h-10 w-full rounded bg-(--rule)/20" />
    </div>
  );
}

export default async function AdminProductsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 grid gap-1.5">
        <Eyebrow>Catalog · Records</Eyebrow>
        <div className="flex items-end justify-between gap-6">
          <h1 className="acme-display text-[34px] tracking-tight">
            Products
          </h1>
          <p className="max-w-sm text-right text-xs text-(--ink-muted)">
            Edits revalidate the public product tag immediately. Saved
            records appear on the public site on the next request.
          </p>
        </div>
      </header>

      <Suspense fallback={<ProductsSkeleton />}>
        <ProductsData />
      </Suspense>
    </main>
  );
}
