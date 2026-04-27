import type { operations } from "@/types/openapi";

import { apiFetch } from "./client";

type LoginResponse =
  operations["auth.login"]["responses"]["200"]["content"]["application/json"]["data"];

type MeResponse =
  operations["auth.me"]["responses"]["200"]["content"]["application/json"]["data"];

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await apiFetch<{ data: LoginResponse }>("/auth/login", {
    method: "POST",
    body: { email, password },
    cache: "no-store",
  });
  return res.data;
}

export async function getMe(token: string): Promise<MeResponse> {
  const res = await apiFetch<{ data: MeResponse }>("/auth/me", {
    token,
    cache: "no-store",
  });
  return res.data;
}

export async function logout(token: string): Promise<void> {
  await apiFetch<void>("/auth/logout", {
    method: "POST",
    token,
    cache: "no-store",
  });
}
