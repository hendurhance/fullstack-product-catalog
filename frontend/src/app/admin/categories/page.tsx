import { Suspense } from "react";
import { Eyebrow } from "@/components/primitives";

import { listCategoriesAction } from "./actions";
import { CategoriesTable } from "./_components/categories-table";
import { requireAdminToken } from "@/lib/auth/cookies";

async function CategoriesData() {
  await requireAdminToken();
  const initial = await listCategoriesAction();

  return (
    <CategoriesTable
      initial={initial.ok ? initial.data : []}
      initialError={initial.ok ? null : initial.error.message}
    />
  );
}

function CategoriesSkeleton() {
  return (
    <div className="rounded-[12px] border border-(--rule) p-8">
      <div className="h-4 w-48 rounded bg-(--rule)" />
      <div className="mt-4 h-10 w-full rounded bg-(--rule)/50" />
      <div className="mt-2 h-10 w-full rounded bg-(--rule)/30" />
      <div className="mt-2 h-10 w-full rounded bg-(--rule)/20" />
    </div>
  );
}

export default async function AdminCategoriesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 grid gap-1.5">
        <Eyebrow>Catalog · Records</Eyebrow>
        <div className="flex items-end justify-between gap-6">
          <h1 className="acme-display text-[34px] tracking-tight">
            Categories
          </h1>
          <p className="max-w-sm text-right text-xs text-(--ink-muted)">
            Edits revalidate the public catalog tag immediately. Saved
            records appear on the public site on the next request.
          </p>
        </div>
      </header>

      <Suspense fallback={<CategoriesSkeleton />}>
        <CategoriesData />
      </Suspense>
    </main>
  );
}
