import Link from "next/link";

export default function Home() {
  return (
    <main className="acme-grain mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-20">
      <header className="mb-16 flex items-baseline justify-between">
        <p className="acme-eyebrow">Acme · Catalog</p>
        <p className="acme-mono text-[11px] text-(--ink-faint)">v1.0</p>
      </header>

      <section className="grid gap-8">
        <h1 className="acme-display text-[72px] leading-[0.95] tracking-[-0.03em] text-(--ink)">
          A small catalog,
          <br />
          carefully wired.
        </h1>

        <p className="max-w-prose text-[16px] leading-relaxed text-(--ink-muted)">
          A reference implementation of a product catalog where the contract
          is the source of truth. Laravel emits OpenAPI; Next consumes the
          types; Drizzle reconciles them at compile time. No drift survives
          a build.
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/categories"
            className="inline-flex h-10 items-center rounded-[8px] bg-(--ink) px-4 text-sm font-medium text-(--paper) transition-colors hover:bg-(--ink-muted)"
          >
            Browse categories
          </Link>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center rounded-[8px] border border-(--rule-strong) bg-(--paper-2) px-4 text-sm font-medium text-(--ink) transition-colors hover:border-(--ink-muted)"
          >
            Admin →
          </Link>
        </div>
      </section>

      <footer className="mt-auto flex items-baseline justify-between border-t border-(--rule) pt-8 text-xs text-(--ink-faint)">
        <span className="acme-mono">Laravel 13 · Next 16 · Postgres · Redis</span>
        <span>Take-home assessment</span>
      </footer>
    </main>
  );
}
