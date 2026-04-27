"use client";

import { useActionState } from "react";

import { Button, Eyebrow, Input, Label } from "@/components/primitives";

import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <div className="acme-pop w-full max-w-[380px]">
      <div className="mb-8 flex items-baseline justify-between">
        <Eyebrow>Acme · Admin</Eyebrow>
        <span className="acme-mono text-[11px] text-(--ink-faint)">v1</span>
      </div>

      <div className="rounded-[12px] border border-(--rule) bg-(--paper-2)">
        <header className="flex items-baseline justify-between border-b border-(--rule) px-6 py-4">
          <h1 className="acme-display text-[20px] text-(--ink)">Sign in</h1>
          <span className="acme-mono text-[11px] text-(--ink-faint)">
            /auth/login
          </span>
        </header>

        <form action={formAction} className="grid gap-4 px-6 py-5">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              defaultValue={state?.email ?? ""}
              aria-invalid={!!state?.fields?.email}
            />
            {state?.fields?.email ? (
              <p role="alert" className="text-xs text-(--danger)">
                {state.fields.email.join(" ")}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!state?.fields?.password}
            />
            {state?.fields?.password ? (
              <p role="alert" className="text-xs text-(--danger)">
                {state.fields.password.join(" ")}
              </p>
            ) : null}
          </div>

          {state?.error ? (
            <p
              role="alert"
              className="acme-fade rounded-[8px] border border-(--danger) bg-(--danger-bg) px-3 py-2 text-xs text-(--danger)"
            >
              {state.error}
            </p>
          ) : null}

          <Button type="submit" loading={isPending} className="mt-1 w-full">
            {isPending ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <footer className="border-t border-(--rule) bg-(--paper) px-6 py-3">
          <p className="acme-mono text-[11px] text-(--ink-faint)">
            admin@example.com · password
          </p>
        </footer>
      </div>

      <p className="mt-6 text-center text-xs text-(--ink-faint)">
        Tokens are revoked on sign-out.
      </p>
    </div>
  );
}
