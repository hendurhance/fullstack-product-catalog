"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button, Input, Label, Textarea } from "@/components/primitives";
import { reviewFormSchema, type ReviewFormValues } from "@/types/forms";

import { submitReviewAction } from "../reviews/actions";

function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`text-lg transition-colors ${
              filled ? "text-(--ink)" : "text-(--rule-strong)"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      reviewer_name: "",
      email: "",
      rating: 0,
      body: "",
    },
  });

  const [rating, setRating] = useState(0);

  useEffect(() => {
    register("rating", { valueAsNumber: true });
  }, [register]);

  function onSubmit(values: ReviewFormValues) {
    startTransition(async () => {
      const result = await submitReviewAction({
        product_id: productId,
        ...values,
      });
      if (result.ok) {
        toast.success("Review submitted! It will appear after moderation.");
        reset();
        setRating(0);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reviewer_name">Name</Label>
          <Input
            id="reviewer_name"
            {...register("reviewer_name")}
            placeholder="Your name"
            disabled={isPending}
            aria-invalid={!!errors.reviewer_name}
          />
          {errors.reviewer_name && (
            <p className="text-xs text-(--danger)">
              {errors.reviewer_name.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            disabled={isPending}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-(--danger)">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Rating</Label>
        <RatingInput
          value={rating}
          onChange={(v) => {
            setRating(v);
            setValue("rating", v, { shouldValidate: true });
          }}
        />
        {errors.rating && (
          <p className="text-xs text-(--danger)">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Review</Label>
        <Textarea
          id="body"
          {...register("body")}
          rows={4}
          placeholder="Share your thoughts…"
          disabled={isPending}
          aria-invalid={!!errors.body}
        />
        {errors.body && (
          <p className="text-xs text-(--danger)">{errors.body.message}</p>
        )}
      </div>

      <Button type="submit" loading={isPending} disabled={isPending}>
        Submit review
      </Button>
    </form>
  );
}
