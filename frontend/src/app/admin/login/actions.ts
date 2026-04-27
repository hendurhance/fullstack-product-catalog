"use server";

import { redirect } from "next/navigation";

import { login, logout } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/lib/auth/cookies";
import { loginFormSchema } from "@/types/forms";

export type LoginFieldErrors = Record<string, string[]>;

export type LoginState = {
  error?: string;
  fields?: LoginFieldErrors;
  email?: string;
} | null;

export async function loginAction(
  _: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const raw = {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };

  const parsed = loginFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fields: LoginFieldErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      (fields[key] ??= []).push(issue.message);
    }
    return { fields, email: raw.email };
  }

  try {
    const { token } = await login(parsed.data.email, parsed.data.password);
    await setAdminToken(token);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 422) {
        return {
          error: "The provided credentials are incorrect.",
          email: parsed.data.email,
        };
      }
      if (error.status === 401) {
        return { error: "Invalid email or password.", email: parsed.data.email };
      }
      return { error: error.message, email: parsed.data.email };
    }
    return { error: "Could not reach the server. Is the API running?", email: parsed.data.email };
  }

  redirect("/admin/categories");
}

export async function logoutAction(): Promise<void> {
  /*
   * Revoke the token server-side first so a leaked copy can't outlive
   * the cookie. Best-effort: if the call fails (network blip, expired
   * token already), drop the cookie anyway so the UI matches the
   * user's intent. We never block sign-out on the upstream call.
   */
  const token = await getAdminToken();
  if (token) {
    try {
      await logout(token);
    } catch {
      // swallow — local sign-out must succeed regardless
    }
  }
  await clearAdminToken();
  redirect("/admin/login");
}
