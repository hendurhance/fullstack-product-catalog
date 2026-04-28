"use server";

import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api/client";
import { clearAdminToken } from "@/lib/auth/cookies";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export type ActionError = {
  message: string;
  status: number;
  code: string;
  fields?: Record<string, string[]>;
};

export async function handleActionError(error: unknown): Promise<ActionError> {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      await clearAdminToken();
      redirect("/admin/login");
    }
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      fields: error.errors,
    };
  }
  return {
    message: error instanceof Error ? error.message : "Request failed",
    status: 0,
    code: "UNKNOWN",
  };
}
