"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button, Eyebrow, Hairline } from "@/components/primitives";
import type { Category } from "@/types";

import {
  type ActionError,
  createCategoryAction,
  deleteCategoryAction,
  listCategoriesAction,
  updateCategoryAction,
} from "../actions";
import { CategoryDialog } from "./category-dialog";
import { ConfirmDialog } from "./confirm-dialog";

const QUERY_KEY = ["admin", "categories"] as const;

/*
 * Client-side admin table. TanStack Query owns the cache; the page
 * pre-hydrates the query with `initialData` from a server action so
 * the first paint is data-complete and subsequent operations feel
 * instant. Each mutation does optimistic-write → on-error rollback →
 * on-settled refetch. Server actions revalidate the public Next
 * cache tags, so the public site reflects changes within one render.
 */
export function CategoriesTable({
  initial,
  initialError,
}: {
  initial: Category[];
  initialError: string | null;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await listCategoriesAction();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    initialData: initial,
    initialDataUpdatedAt: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      name: string;
      slug?: string;
      description?: string | null;
    }) => {
      const result = await createCategoryAction(input);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onSuccess: (created) => {
      qc.setQueryData<Category[]>(QUERY_KEY, (prev) =>
        prev ? [...prev, created] : [created],
      );
      toast.success(`Created “${created.name}”.`);
      setCreating(false);
    },
    onError: (error) => {
      toast.error(messageOf(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vars: {
      slug: string;
      input: { name?: string; slug?: string; description?: string | null };
    }) => {
      const result = await updateCategoryAction(vars.slug, vars.input);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Category[]>(QUERY_KEY);
      qc.setQueryData<Category[]>(QUERY_KEY, (prev) =>
        prev?.map((c) =>
          c.slug === vars.slug ? { ...c, ...vars.input } : c,
        ) ?? [],
      );
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
      toast.error(messageOf(error));
    },
    onSuccess: (updated) => {
      toast.success(`Updated “${updated.name}”.`);
      setEditing(null);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const result = await deleteCategoryAction(slug);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onMutate: async (slug) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Category[]>(QUERY_KEY);
      qc.setQueryData<Category[]>(QUERY_KEY, (prev) =>
        prev?.filter((c) => c.slug !== slug) ?? [],
      );
      return { previous };
    },
    onError: (error, _slug, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
      toast.error(messageOf(error));
    },
    onSuccess: ({ slug }) => {
      toast.success(`Deleted “${slug}”.`);
      setPendingDelete(null);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const categories = query.data ?? [];

  return (
    <div className="rounded-[12px] border border-(--rule) bg-(--paper-2)">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-baseline gap-3">
          <Eyebrow>Catalog</Eyebrow>
          <span className="text-sm text-(--ink-muted)">
            <span className="acme-mono text-(--ink)">{categories.length}</span>{" "}
            {categories.length === 1 ? "record" : "records"}
            {query.isFetching ? (
              <span className="acme-mono ml-2 text-[11px] text-(--ink-faint)">
                · syncing
              </span>
            ) : null}
          </span>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <span aria-hidden>+</span>
          New category
        </Button>
      </div>

      <Hairline />

      {initialError ? (
        <p className="border-b border-(--rule) bg-(--danger-bg) px-5 py-3 text-xs text-(--danger)">
          {initialError}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="acme-eyebrow border-b border-(--rule) bg-(--paper)">
              <Th>Name</Th>
              <Th>Slug</Th>
              <Th>Description</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-sm text-(--ink-muted)"
                >
                  <p className="acme-display text-base text-(--ink)">
                    No categories yet
                  </p>
                  <p className="mt-1 text-xs">
                    Create the first one to populate the public catalog.
                  </p>
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-(--rule) last:border-b-0 transition-colors hover:bg-(--paper)"
                >
                  <td className="px-5 py-3 font-medium text-(--ink)">
                    {c.name}
                  </td>
                  <td className="acme-mono px-5 py-3 text-xs text-(--ink-muted)">
                    {c.slug}
                  </td>
                  <td className="px-5 py-3 text-(--ink-muted)">
                    <span className="line-clamp-1 max-w-[42ch]">
                      {c.description ?? (
                        <span className="text-(--ink-faint)">—</span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setPendingDelete(c)}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {creating ? (
        <CategoryDialog
          mode="create"
          onClose={() => setCreating(false)}
          onSubmit={(values) => createMutation.mutate(values)}
          isSubmitting={createMutation.isPending}
          fieldErrors={errorOf(createMutation.error)?.fields}
        />
      ) : null}

      {editing ? (
        <CategoryDialog
          mode="edit"
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(values) =>
            updateMutation.mutate({ slug: editing.slug, input: values })
          }
          isSubmitting={updateMutation.isPending}
          fieldErrors={errorOf(updateMutation.error)?.fields}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          title="Delete category"
          description={
            <>
              This permanently removes{" "}
              <span className="acme-mono text-(--ink)">
                {pendingDelete.slug}
              </span>{" "}
              from the catalog. Public pages refresh on the next request.
            </>
          }
          confirmLabel="Delete"
          isPending={deleteMutation.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteMutation.mutate(pendingDelete.slug)}
        />
      ) : null}
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`px-5 py-2 text-(--ink-muted) ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function errorOf(error: unknown): ActionError | undefined {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "status" in error &&
    "message" in error
  ) {
    return error as ActionError;
  }
  return undefined;
}

function messageOf(error: unknown): string {
  const e = errorOf(error);
  if (e) {
    if (e.fields) {
      const first = Object.values(e.fields)[0]?.[0];
      if (first) return first;
    }
    return e.message;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
