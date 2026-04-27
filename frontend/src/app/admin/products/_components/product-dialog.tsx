"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Button,
  Eyebrow,
  Hairline,
  Input,
  Label,
  Textarea,
} from "@/components/primitives";
import { dollarsToCents, centsToDollars } from "@/lib/money";
import type { Category, Product } from "@/types";
import {
  productFormSchema,
  type ProductFormValues,
} from "@/types/forms";

type Props =
  | {
      mode: "create";
      initial?: undefined;
      categories: Category[];
      onClose: () => void;
      onSubmit: (values: {
        category_id: string;
        name: string;
        description?: string | null;
        price: number;
        stock_qty: number;
        is_published?: boolean;
      }) => void;
      isSubmitting: boolean;
      fieldErrors?: Record<string, string[]>;
    }
  | {
      mode: "edit";
      initial: Product;
      categories: Category[];
      onClose: () => void;
      onSubmit: (values: {
        category_id?: string;
        name?: string;
        description?: string | null;
        price?: number;
        stock_qty?: number;
        is_published?: boolean;
      }) => void;
      isSubmitting: boolean;
      fieldErrors?: Record<string, string[]>;
    };

export function ProductDialog(props: Props) {
  const isEdit = props.mode === "edit";
  const initial = isEdit ? props.initial : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEdit
      ? {
          category_id: initial!.category_id,
          name: initial!.name,
          description: initial!.description ?? "",
          price: centsToDollars(initial!.price),
          stock_qty: initial!.stock_qty,
          is_published: initial!.is_published,
        }
      : {
          category_id: props.categories[0]?.id ?? "",
          name: "",
          description: "",
          price: 0,
          stock_qty: 0,
          is_published: false,
        },
  });

  useEffect(() => {
    if (!props.fieldErrors) return;
    for (const [field, msgs] of Object.entries(props.fieldErrors)) {
      if (msgs[0]) {
        setError(field as keyof ProductFormValues, {
          type: "server",
          message: msgs[0],
        });
      }
    }
  }, [props.fieldErrors, setError]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !props.isSubmitting) {
        reset();
        props.onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [props, reset]);

  function submit(values: ProductFormValues) {
    props.onSubmit({
      category_id: values.category_id,
      name: values.name,
      description: values.description === "" ? null : (values.description ?? null),
      price: dollarsToCents(values.price),
      stock_qty: values.stock_qty,
      is_published: values.is_published,
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-dialog-title"
      className="acme-fade fixed inset-0 z-50 flex items-center justify-center bg-(--ink)/35 px-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !props.isSubmitting) {
          reset();
          props.onClose();
        }
      }}
    >
      <div className="acme-pop w-full max-w-[520px] rounded-[12px] border border-(--rule) bg-(--paper-2) shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)]">
        <header className="flex items-baseline justify-between border-b border-(--rule) px-5 py-4">
          <div className="flex items-baseline gap-3">
            <Eyebrow>
              {props.mode === "create" ? "New" : "Edit"}
            </Eyebrow>
            <h2
              id="product-dialog-title"
              className="acme-display text-[16px] text-(--ink)"
            >
              {props.mode === "create"
                ? "Create product"
                : initial!.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              reset();
              props.onClose();
            }}
            className="text-(--ink-faint) transition-colors hover:text-(--ink)"
            aria-label="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 3l8 8M11 3l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4 px-5 py-5">
          <Field
            id="category_id"
            label="Category"
            error={errors.category_id?.message}
            input={
              <select
                id="category_id"
                {...register("category_id")}
                aria-invalid={!!errors.category_id}
                className="h-9 w-full rounded-[8px] border border-(--rule-strong) bg-(--paper-2) px-3 text-sm text-(--ink) transition-colors focus:border-(--ink) focus:outline-none focus:ring-1 focus:ring-(--ink) aria-[invalid=true]:border-(--danger) aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-(--danger)"
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {props.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            }
          />

          <Field
            id="name"
            label="Name"
            error={errors.name?.message}
            input={
              <Input
                id="name"
                {...register("name")}
                aria-invalid={!!errors.name}
                autoFocus
                placeholder="Precision Grinder 3000"
              />
            }
          />

          <Field
            id="description"
            label="Description"
            error={errors.description?.message}
            input={
              <Textarea
                id="description"
                {...register("description")}
                aria-invalid={!!errors.description}
                placeholder="Optional summary shown on the public product page."
              />
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              id="price"
              label="Price (USD)"
              error={errors.price?.message}
              input={
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-(--ink-faint)">
                    $
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("price", { valueAsNumber: true })}
                    aria-invalid={!!errors.price}
                    className="acme-mono pl-5"
                    placeholder="29.99"
                  />
                </div>
              }
            />

            <Field
              id="stock_qty"
              label="Stock quantity"
              error={errors.stock_qty?.message}
              input={
                <Input
                  id="stock_qty"
                  type="number"
                  min="0"
                  step="1"
                  {...register("stock_qty", { valueAsNumber: true })}
                  aria-invalid={!!errors.stock_qty}
                  className="acme-mono"
                  placeholder="100"
                />
              }
            />
          </div>

          <label className="flex items-center gap-2.5 text-sm text-(--ink-muted)">
            <input
              type="checkbox"
              {...register("is_published")}
              className="size-4 rounded-[4px] border border-(--rule-strong) accent-(--ink)"
            />
            Published
          </label>

          <Hairline className="my-1" />

          <footer className="flex items-center justify-between gap-2">
            <span className="acme-mono text-[11px] text-(--ink-faint)">
              esc to cancel
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  reset();
                  props.onClose();
                }}
                disabled={props.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" loading={props.isSubmitting}>
                {props.isSubmitting
                  ? "Saving…"
                  : props.mode === "create"
                    ? "Create"
                    : "Save changes"}
              </Button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  input,
  error,
  hint,
}: {
  id: string;
  label: string;
  input: React.ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {input}
      {hint && !error ? (
        <span className="acme-mono text-[11px] text-(--ink-faint)">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span role="alert" className="text-[12px] text-(--danger)">
          {error}
        </span>
      ) : null}
    </div>
  );
}
