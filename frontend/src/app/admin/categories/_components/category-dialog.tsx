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
import type { Category } from "@/types";
import {
  categoryFormSchema,
  type CategoryFormValues,
} from "@/types/forms";

type Props =
  | {
      mode: "create";
      initial?: undefined;
      onClose: () => void;
      onSubmit: (values: {
        name: string;
        slug?: string;
        description?: string | null;
      }) => void;
      isSubmitting: boolean;
      fieldErrors?: Record<string, string[]>;
    }
  | {
      mode: "edit";
      initial: Category;
      onClose: () => void;
      onSubmit: (values: {
        name?: string;
        slug?: string;
        description?: string | null;
      }) => void;
      isSubmitting: boolean;
      fieldErrors?: Record<string, string[]>;
    };

/*
 * Modal create/edit form. Validation rules are mirrored from the
 * backend FormRequest messages — same wording, same constraints —
 * so the client and server agree on what "valid" means and the user
 * doesn't see a different message after a round trip.
 *
 * `fieldErrors` carries server-side per-field messages (422
 * envelope). They render alongside RHF's client errors so a slug
 * collision (only the server can know) appears in the right place.
 */
export function CategoryDialog(props: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues:
      props.mode === "edit"
        ? {
            name: props.initial.name,
            slug: props.initial.slug,
            description: props.initial.description ?? "",
          }
        : { name: "", slug: "", description: "" },
  });

  useEffect(() => {
    if (!props.fieldErrors) return;
    for (const [field, msgs] of Object.entries(props.fieldErrors)) {
      if (msgs[0]) {
        setError(field as keyof CategoryFormValues, {
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

  function submit(values: CategoryFormValues) {
    const payload = {
      name: values.name,
      slug: values.slug === "" ? undefined : values.slug,
      description:
        values.description === "" ? null : (values.description ?? null),
    };

    if (props.mode === "create") {
      props.onSubmit(payload);
    } else {
      props.onSubmit(payload);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-dialog-title"
      className="acme-fade fixed inset-0 z-50 flex items-center justify-center bg-(--ink)/35 px-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !props.isSubmitting) {
          reset();
          props.onClose();
        }
      }}
    >
      <div className="acme-pop w-full max-w-[480px] rounded-[12px] border border-(--rule) bg-(--paper-2) shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)]">
        <header className="flex items-baseline justify-between border-b border-(--rule) px-5 py-4">
          <div className="flex items-baseline gap-3">
            <Eyebrow>
              {props.mode === "create" ? "New" : "Edit"}
            </Eyebrow>
            <h2
              id="category-dialog-title"
              className="acme-display text-[16px] text-(--ink)"
            >
              {props.mode === "create"
                ? "Create category"
                : props.initial.name}
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
            id="name"
            label="Name"
            error={errors.name?.message}
            input={
              <Input
                id="name"
                {...register("name")}
                aria-invalid={!!errors.name}
                autoFocus
                placeholder="Home & Kitchen"
              />
            }
          />

          <Field
            id="slug"
            label="Slug"
            hint={
              props.mode === "create"
                ? "Optional · auto-generated from the name when blank."
                : "Changing the slug will break existing URLs."
            }
            error={errors.slug?.message}
            input={
              <Input
                id="slug"
                {...register("slug")}
                aria-invalid={!!errors.slug}
                placeholder="home-and-kitchen"
                className="acme-mono"
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
                placeholder="Optional summary shown on the public catalog page."
              />
            }
          />

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
