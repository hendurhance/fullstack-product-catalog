"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";

/*
 * Client-side provider tree for admin pages. Created lazily inside a
 * `useState` so each browser session gets its own QueryClient instance
 * and Next's RSC payload never tries to serialize it. Defaults are
 * conservative: a 30s stale window matches the public list cache
 * profile, retry once on failure (auth/validation errors should not
 * loop), and refetch on focus is enabled so the admin sees fresh data
 * after switching tabs.
 *
 * Sonner is themed inline so it aligns with the Acme palette without
 * shipping the package's stock chrome.
 */
export function AdminProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        gap={8}
        toastOptions={{
          unstyled: false,
          classNames: {
            toast:
              "!rounded-[10px] !border !border-(--rule-strong) !bg-(--paper-2) !text-(--ink) !shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]",
            title: "!text-sm !font-medium",
            description: "!text-xs !text-(--ink-muted)",
            error:
              "!border-(--danger) !text-(--danger) !bg-(--danger-bg)",
            success: "!border-(--rule-strong) !text-(--ink)",
          },
        }}
      />
    </QueryClientProvider>
  );
}
