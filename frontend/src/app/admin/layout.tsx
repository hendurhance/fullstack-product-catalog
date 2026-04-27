import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { AdminProviders } from "@/components/providers";
import { Button, Eyebrow } from "@/components/primitives";
import { getAdminToken } from "@/lib/auth/cookies";

import { logoutAction } from "./login/actions";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminProviders>
      <div className="acme-grain min-h-full flex flex-col">
        <Suspense fallback={<header className="h-13 border-b border-(--rule)" />}>
          <AdminHeader />
        </Suspense>
        <div className="flex-1">{children}</div>
      </div>
    </AdminProviders>
  );
}

async function AdminHeader() {
  const token = await getAdminToken();
  return (
    <header className="border-b border-(--rule) bg-(--paper-2)/80 backdrop-blur-sm">
      <div className="mx-auto flex h-13 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-7">
          <Link
            href="/"
            className="group flex items-center gap-2 text-(--ink)"
            aria-label="Acme home"
          >
            <span
              aria-hidden
              className="inline-flex size-5 items-center justify-center rounded-[4px] bg-(--ink) text-[10px] font-bold leading-none text-(--paper) transition-transform group-hover:rotate-[-4deg]"
            >
              ◆
            </span>
            <span className="acme-display text-[15px] tracking-tight">
              Acme
            </span>
            <Eyebrow className="ml-1.5 hidden border-l border-(--rule) pl-2 text-(--ink-faint) sm:inline">
              Admin
            </Eyebrow>
          </Link>

          {token ? (
            <nav
              aria-label="Admin sections"
              className="flex items-center gap-1 text-sm"
            >
              <Link
                href="/admin/categories"
                className="rounded-[6px] px-2.5 py-1 text-(--ink) transition-colors hover:bg-(--paper)"
              >
                Categories
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/categories"
            className="hidden text-xs text-(--ink-muted) transition-colors hover:text-(--ink) sm:inline"
          >
            View public site ↗
          </Link>
          {token ? (
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          ) : (
            <Link href="/admin/login">
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export async function requireAdmin(): Promise<string> {
  const token = await getAdminToken();
  if (!token) {
    redirect("/admin/login");
  }
  return token;
}
