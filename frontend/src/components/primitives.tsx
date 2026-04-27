import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type LabelHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/*
 * Small in-house primitives. We build *just enough* to express the
 * Acme/Untitled-style aesthetic — sharp small radius, hairline 1px
 * borders, type-driven hierarchy. Variants are intentional and few;
 * adding more should require justification, not reflex.
 */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap " +
  "transition-[background,border-color,color,box-shadow] duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ink) focus-visible:ring-offset-2 focus-visible:ring-offset-(--paper) " +
  "disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-(--ink) text-(--paper) border border-(--ink) hover:bg-(--ink-muted) hover:border-(--ink-muted)",
  secondary:
    "bg-(--paper-2) text-(--ink) border border-(--rule-strong) hover:bg-(--paper) hover:border-(--ink-muted)",
  ghost:
    "bg-transparent text-(--ink-muted) border border-transparent hover:text-(--ink) hover:bg-(--paper-2)",
  danger:
    "bg-transparent text-(--danger) border border-(--rule-strong) hover:bg-(--danger-bg) hover:border-(--danger)",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-7 px-2.5 text-xs rounded-[6px]",
  md: "h-9 px-3.5 text-sm rounded-[8px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", loading, children, disabled, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={rest.type ?? "button"}
        disabled={disabled || loading}
        data-loading={loading ? "" : undefined}
        className={cn(buttonBase, buttonVariants[variant], buttonSizes[size], className)}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-9 w-full rounded-[8px] border border-(--rule-strong) bg-(--paper-2) px-3 text-sm text-(--ink) placeholder:text-(--ink-faint)",
          "transition-colors focus:border-(--ink) focus:outline-none focus:ring-1 focus:ring-(--ink)",
          "disabled:cursor-not-allowed disabled:bg-(--paper) disabled:text-(--ink-muted)",
          "aria-[invalid=true]:border-(--danger) aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-(--danger)",
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 3, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full rounded-[8px] border border-(--rule-strong) bg-(--paper-2) px-3 py-2 text-sm leading-relaxed text-(--ink) placeholder:text-(--ink-faint)",
        "transition-colors resize-y focus:border-(--ink) focus:outline-none focus:ring-1 focus:ring-(--ink)",
        "disabled:cursor-not-allowed disabled:bg-(--paper) disabled:text-(--ink-muted)",
        "aria-[invalid=true]:border-(--danger) aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-(--danger)",
        className,
      )}
      {...rest}
    />
  );
});

export function Label({
  className,
  children,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-medium text-(--ink-muted) tracking-wide",
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}

export function Surface({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-(--rule) bg-(--paper-2)",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Hairline({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-(--rule)", className)} />;
}

export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("acme-eyebrow", className)}>{children}</span>;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="acme-mono inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-(--rule-strong) bg-(--paper-2) px-1.5 text-[10px] text-(--ink-muted)">
      {children}
    </kbd>
  );
}
