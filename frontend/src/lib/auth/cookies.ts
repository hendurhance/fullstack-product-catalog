import "server-only";
import { cookies } from "next/headers";

/*
 * Admin token storage. HttpOnly so JS can't read it (mitigates XSS-driven
 * exfiltration); SameSite=Lax so it travels with same-origin navigations
 * but not third-party POSTs. SECURE only in production — over plain HTTP
 * in dev the browser drops the cookie and login appears broken.
 */
const COOKIE_NAME = "admin_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function setAdminToken(token: string): Promise<void> {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminToken(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function requireAdminToken(): Promise<string> {
  const token = await getAdminToken();
  if (!token) {
    throw new Error("Admin token missing");
  }
  return token;
}
