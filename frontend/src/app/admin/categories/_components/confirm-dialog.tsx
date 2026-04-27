"use client";

import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/primitives";

/*
 * Tiny confirmation dialog. Replaces window.confirm() — keeps the
 * delete flow on-brand and keyboard-accessible without dragging in a
 * full headless dialog dependency. Esc closes; click backdrop closes.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  isPending,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: ReactNode;
  confirmLabel: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, isPending]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="acme-fade fixed inset-0 z-50 flex items-center justify-center bg-(--ink)/35 px-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onCancel();
      }}
    >
      <div className="acme-pop w-full max-w-[420px] rounded-[12px] border border-(--rule) bg-(--paper-2) shadow-[0_24px_60px_-24px_rgba(0,0,0,0.25)]">
        <header className="border-b border-(--rule) px-5 py-4">
          <h2
            id="confirm-title"
            className="acme-display text-[16px] text-(--ink)"
          >
            {title}
          </h2>
        </header>
        <div className="px-5 py-4 text-sm leading-relaxed text-(--ink-muted)">
          {description}
        </div>
        <footer className="flex items-center justify-end gap-2 border-t border-(--rule) bg-(--paper) px-5 py-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            loading={isPending}
            className="!bg-(--danger) !border-(--danger) hover:!bg-(--danger) hover:!border-(--danger) text-(--paper-2)"
          >
            {isPending ? "Deleting…" : confirmLabel}
          </Button>
        </footer>
      </div>
    </div>
  );
}
