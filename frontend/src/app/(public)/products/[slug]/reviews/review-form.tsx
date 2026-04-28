"use client";

import {
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { Button, Input, Label, Textarea } from "@/components/primitives";
import type { StoreReviewInput } from "@/types";

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
  const ratingRef = useRef(0);
  const [rating, setRating] = useState(0);
  const [touched, setTouched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    if (ratingRef.current === 0) {
      setTouched(true);
      return;
    }

    const input: StoreReviewInput = {
      product_id: productId,
      reviewer_name: String(formData.get("reviewer_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      rating: ratingRef.current,
      body: String(formData.get("body") ?? ""),
    };

    startTransition(async () => {
      const result = await submitReviewAction(input);
      if (result.ok) {
        toast.success("Review submitted! It will appear after moderation.");
        ratingRef.current = 0;
        setRating(0);
        setTouched(false);
        formRef.current?.reset();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRatingChange(v: number) {
    ratingRef.current = v;
    setRating(v);
  }

  const ratingError = touched && rating === 0;

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reviewer_name">Name</Label>
          <Input
            id="reviewer_name"
            name="reviewer_name"
            required
            placeholder="Your name"
            disabled={isPending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Rating</Label>
        <RatingInput value={rating} onChange={handleRatingChange} />
        {ratingError && (
          <p className="text-xs text-(--danger)">Please select a rating.</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Review</Label>
        <Textarea
          id="body"
          name="body"
          required
          rows={4}
          placeholder="Share your thoughts…"
          disabled={isPending}
        />
      </div>

      <Button type="submit" loading={isPending} disabled={isPending}>
        Submit review
      </Button>
    </form>
  );
}
