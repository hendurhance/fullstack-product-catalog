import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";

import {
  CATEGORY_TAGS,
  getCategory,
  listCategories,
} from "@/lib/api/categories";
import type { Category } from "@/types";
import { ApiError } from "@/lib/api/client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  "use cache";
  cacheLife("categoriesList");
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
