"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button, Eyebrow, Hairline } from "@/components/primitives";
import { Th, messageOf } from "@/components/admin-helpers";
import type { Review } from "@/types";

import {
  approveReviewAction,
  deleteReviewAction,
  listReviewsAction,
  rejectReviewAction,
} from "../actions";
import { ConfirmDialog } from "../../categories/_components/confirm-dialog";

const QUERY_KEY = ["admin", "reviews"] as const;

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-xs ${i < rating ? "text-(--ink)" : "text-(--rule-strong)"}`}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewsTable({
  initial,
  initialError,
}: {
  initial: Review[];
  initialError: string | null;
}) {
  const qc = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null);

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const result = await listReviewsAction();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    initialData: initial,
    initialDataUpdatedAt: 0,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await approveReviewAction(id);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Review[]>(QUERY_KEY);
      qc.setQueryData<Review[]>(QUERY_KEY, (prev) =>
        prev?.map((r) => (r.id === id ? { ...r, is_approved: true } : r)) ?? [],
      );
      return { previous };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
      toast.error(messageOf(error));
    },
    onSuccess: () => toast.success("Review approved."),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await rejectReviewAction(id);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Review[]>(QUERY_KEY);
      qc.setQueryData<Review[]>(QUERY_KEY, (prev) =>
        prev?.map((r) => (r.id === id ? { ...r, is_approved: false } : r)) ?? [],
      );
      return { previous };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
      toast.error(messageOf(error));
    },
    onSuccess: () => toast.success("Review rejected."),
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteReviewAction(id);
      if (!result.ok) throw result.error;
      return result.data;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEY });
      const previous = qc.getQueryData<Review[]>(QUERY_KEY);
      qc.setQueryData<Review[]>(QUERY_KEY, (prev) =>
        prev?.filter((r) => r.id !== id) ?? [],
      );
      return { previous };
    },
    onError: (error, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(QUERY_KEY, ctx.previous);
      toast.error(messageOf(error));
    },
    onSuccess: () => {
      toast.success("Review deleted.");
      setPendingDelete(null);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const reviews = query.data ?? [];

  return (
    <div className="rounded-[12px] border border-(--rule) bg-(--paper-2)">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-baseline gap-3">
          <Eyebrow>Moderation</Eyebrow>
          <span className="text-sm text-(--ink-muted)">
            <span className="acme-mono text-(--ink)">{reviews.length}</span>{" "}
            {reviews.length === 1 ? "review" : "reviews"}
            {query.isFetching ? (
              <span className="acme-mono ml-2 text-[11px] text-(--ink-faint)">
                · syncing
              </span>
            ) : null}
          </span>
        </div>
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
              <Th>Reviewer</Th>
              <Th>Rating</Th>
              <Th>Review</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-(--ink-muted)"
                >
                  <p className="acme-display text-base text-(--ink)">
                    No reviews yet
                  </p>
                  <p className="mt-1 text-xs">
                    Reviews will appear here once customers submit them.
                  </p>
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-(--rule) last:border-b-0 transition-colors hover:bg-(--paper)"
                >
                  <td className="sticky left-0 z-10 bg-(--paper-2) px-5 py-3 after:absolute after:right-0 after:top-0 after:h-full after:w-4 after:bg-gradient-to-r after:from-(--paper-2)/80 after:to-transparent">
                    <div className="font-medium text-(--ink)">{r.reviewer_name}</div>
                    <div className="acme-mono text-[11px] text-(--ink-faint)">{r.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <RatingStars rating={r.rating} />
                  </td>
                  <td className="max-w-[300px] truncate px-5 py-3 text-(--ink-muted)">
                    {r.body}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 text-[11px] font-medium ${
                        r.is_approved
                          ? "bg-(--ink)/8 text-(--ink)"
                          : "bg-(--rule) text-(--ink-faint)"
                      }`}
                    >
                      <span
                        className={`inline-block size-1.5 rounded-full ${
                          r.is_approved ? "bg-(--ink)" : "bg-(--ink-faint)"
                        }`}
                      />
                      {r.is_approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      {!r.is_approved ? (
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(r.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => rejectMutation.mutate(r.id)}
                          disabled={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setPendingDelete(r)}
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

      {pendingDelete ? (
        <ConfirmDialog
          title="Delete review"
          description={
            <>
              This permanently removes the review by{" "}
              <span className="acme-mono text-(--ink)">
                {pendingDelete.reviewer_name}
              </span>
              .
            </>
          }
          confirmLabel="Delete"
          isPending={deleteMutation.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteMutation.mutate(pendingDelete.id)}
        />
      ) : null}
    </div>
  );
}
