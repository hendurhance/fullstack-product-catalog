"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="border-b border-(--rule) bg-(--paper-2)/80 backdrop-blur-sm">
      <div className="mx-auto flex h-13 max-w-5xl items-center justify-between px-6">
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
          <span className="acme-display text-[15px] tracking-tight">Acme</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm sm:flex">
          <NavLink href="/products" active={pathname === "/products"}>
            Products
          </NavLink>
          <NavLink href="/categories" active={pathname === "/categories"}>
            Categories
          </NavLink>
          <Link
            href="/admin"
            className="text-(--ink-muted) transition-colors hover:text-(--ink)"
          >
            Admin
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-[6px] text-(--ink) transition-colors hover:bg-(--paper)"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-(--rule) bg-(--paper-2) px-6 pb-4 pt-2 sm:hidden">
          <div className="grid gap-1">
            <MobileLink href="/products" onClick={() => setOpen(false)}>
              Products
            </MobileLink>
            <MobileLink href="/categories" onClick={() => setOpen(false)}>
              Categories
            </MobileLink>
            <MobileLink href="/admin" onClick={() => setOpen(false)}>
              Admin
            </MobileLink>
          </div>
        </nav>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-[6px] px-2.5 py-1 transition-colors ${
        active
          ? "text-(--ink) bg-(--paper)"
          : "text-(--ink-muted) hover:text-(--ink) hover:bg-(--paper)"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-[6px] px-3 py-2 text-sm text-(--ink-muted) transition-colors hover:bg-(--paper) hover:text-(--ink)"
    >
      {children}
    </Link>
  );
}
