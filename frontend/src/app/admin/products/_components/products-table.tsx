"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button, Eyebrow, Hairline } from "@/components/primitives";
import { formatPrice } from "@/lib/money";
import type { Category, Product } from "@/types";

import {
  type ActionError,
  createProductAction,
  deleteProductAction,
  listProductsAction,
  togglePublishedAction,
  updateProductAction,
} from "../actions";
import { ProductDialog } from "./product-dialog";
import { ConfirmDialog } from "../../categories/_components/confirm-dialog";

const QUERY_KEY = ["admin", "products"] as const;

export function ProductsTable({
  initial,
  initialError,
  categories,
}: {
  initial: Product[];
  initialError: string | null;
  categories: Category[];
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await listProductsAction();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    initialData: initial,
    initialDataUpdatedAt: 0,
  });

  const createMutation = useMutation({
    mutationFn: async (input: {
      category_id: string;
      name: string;
      description?: string | null;
      price: number;
      stock_qty: number;
      is_published?: boolean;
    }) => {
      const result = await createProductAction(input);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onSuccess: (created) => {
      qc.setQueryData<Product[]>(QUERY_KEY, (prev) =>
        prev ? [...prev, created] : [created],
      );
      toast.success(`Created "${created.name}".`);
      setCreating(false);
    },
    onError: (error) => {
      toast.error(messageOf(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vars: {
      slug: string;
      input: {
        category_id?: string;
        name?: string;
        description?: string | null;
        price?: number;
        stock_qty?: number;
        is_published?: boolean;
      };
    }) => {
      const result = await updateProductAction(vars.slug, vars.input);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Product[]>(QUERY_KEY);
      qc.setQueryData<Product[]>(QUERY_KEY, (prev) =>
        prev?.map((p) =>
          p.slug === vars.slug ? { ...p, ...vars.input } : p,
        ) ?? [],
      );
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
      toast.error(messageOf(error));
    },
    onSuccess: (updated) => {
      toast.success(`Updated "${updated.name}".`);
      setEditing(null);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const result = await deleteProductAction(slug);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onMutate: async (slug) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Product[]>(QUERY_KEY);
      qc.setQueryData<Product[]>(QUERY_KEY, (prev) =>
        prev?.filter((p) => p.slug !== slug) ?? [],
      );
      return { previous };
    },
    onError: (error, _slug, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
      toast.error(messageOf(error));
    },
    onSuccess: ({ slug }) => {
      toast.success(`Deleted "${slug}".`);
      setPendingDelete(null);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ slug, is_published }: { slug: string; is_published: boolean }) => {
      const result = await togglePublishedAction(slug, is_published);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onMutate: async ({ slug, is_published }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Product[]>(QUERY_KEY);
      qc.setQueryData<Product[]>(QUERY_KEY, (prev) =>
        prev?.map((p) =>
          p.slug === slug ? { ...p, is_published } : p,
        ) ?? [],
      );
      return { previous };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
      toast.error(messageOf(error));
    },
    onSuccess: (updated) => {
      toast.success(updated.is_published ? "Published." : "Unpublished.");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const products = query.data ?? [];
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="rounded-[12px] border border-(--rule) bg-(--paper-2)">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-baseline gap-3">
          <Eyebrow>Catalog</Eyebrow>
          <span className="text-sm text-(--ink-muted)">
            <span className="acme-mono text-(--ink)">{products.length}</span>{" "}
            {products.length === 1 ? "record" : "records"}
            {query.isFetching ? (
              <span className="acme-mono ml-2 text-[11px] text-(--ink-faint)">
                · syncing
              </span>
            ) : null}
          </span>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <span aria-hidden>+</span>
          New product
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
              <Th>Category</Th>
              <Th align="right">Price</Th>
              <Th align="right">Stock</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-(--ink-muted)"
                >
                  <p className="acme-display text-base text-(--ink)">
                    No products yet
                  </p>
                  <p className="mt-1 text-xs">
                    Create the first one to populate the public catalog.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-(--rule) last:border-b-0 transition-colors hover:bg-(--paper)"
                >
                  <td className="sticky left-0 z-10 bg-(--paper-2) px-5 py-3 font-medium text-(--ink) after:absolute after:right-0 after:top-0 after:h-full after:w-4 after:bg-gradient-to-r after:from-(--paper-2)/80 after:to-transparent group-hover:after:from-(--paper)/80">
                    {p.name}
                  </td>
                  <td className="px-5 py-3 text-(--ink-muted)">
                    {categoryMap.get(p.category_id) ?? (
                      <span className="text-(--ink-faint)">—</span>
                    )}
                  </td>
                  <td className="acme-mono px-5 py-3 text-xs text-(--ink) text-right">
                    {formatPrice(p.price)}
                  </td>
                  <td className="acme-mono px-5 py-3 text-xs text-(--ink-muted) text-right">
                    {p.stock_qty}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleMutation.mutate({
                          slug: p.slug,
                          is_published: !p.is_published,
                        })
                      }
                      disabled={toggleMutation.isPending}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                        p.is_published
                          ? "bg-(--ink)/8 text-(--ink) hover:bg-(--ink)/15"
                          : "bg-(--rule) text-(--ink-faint) hover:bg-(--rule-strong)"
                      }`}
                    >
                      <span
                        className={`inline-block size-1.5 rounded-full ${
                          p.is_published
                            ? "bg-(--ink)"
                            : "bg-(--ink-faint)"
                        }`}
                      />
                      {p.is_published ? "Live" : "Draft"}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setPendingDelete(p)}
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
        <ProductDialog
          mode="create"
          categories={categories}
          onClose={() => setCreating(false)}
          onSubmit={(values) => createMutation.mutate(values)}
          isSubmitting={createMutation.isPending}
          fieldErrors={errorOf(createMutation.error)?.fields}
        />
      ) : null}

      {editing ? (
        <ProductDialog
          mode="edit"
          initial={editing}
          categories={categories}
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
          title="Delete product"
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
