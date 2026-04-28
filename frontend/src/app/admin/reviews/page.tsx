import { Suspense } from "react";
import { Eyebrow } from "@/components/primitives";

import { listReviewsAction } from "./actions";
import { ReviewsTable } from "./_components/reviews-table";
import { requireAdminToken } from "@/lib/auth/cookies";

async function ReviewsData() {
  await requireAdminToken();
  const result = await listReviewsAction();

  return (
    <ReviewsTable
      initial={result.ok ? result.data : []}
      initialError={result.ok ? null : result.error.message}
    />
  );
}

function ReviewsSkeleton() {
  return (
    <div className="rounded-[12px] border border-(--rule) p-8">
      <div className="h-4 w-48 rounded bg-(--rule)" />
      <div className="mt-4 h-10 w-full rounded bg-(--rule)/50" />
      <div className="mt-2 h-10 w-full rounded bg-(--rule)/30" />
      <div className="mt-2 h-10 w-full rounded bg-(--rule)/20" />
    </div>
  );
}

export default async function AdminReviewsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="mb-8 grid gap-1.5">
        <Eyebrow>Catalog · Moderation</Eyebrow>
        <div className="flex items-end justify-between gap-6">
          <h1 className="acme-display text-[34px] tracking-tight">
            Reviews
          </h1>
          <p className="max-w-sm text-right text-xs text-(--ink-muted)">
            Approve or reject customer reviews. Approved reviews appear
            on public product pages.
          </p>
        </div>
      </header>

      <Suspense fallback={<ReviewsSkeleton />}>
        <ReviewsData />
      </Suspense>
    </main>
  );
}
