/**
 * Typed fetch wrapper for the backend API. One choke point so:
 *  - All requests go through the same base URL resolution
 *    (browser → `NEXT_PUBLIC_API_URL`, server → `INTERNAL_API_URL`,
 *    so SSR/SSG hits the in-network host without crossing the proxy).
 *  - The error envelope (`{ message, code, request_id, errors? }`) is
 *    raised as a typed `ApiError` instead of a generic Response.
 *  - JSON parsing happens once and is consistent across endpoints.
 *
 * Caller code never touches `fetch` directly. When the backend grows
 * a header (Idempotency-Key, X-Request-ID, etc.), it lands here.
 */

export type ApiErrorPayload = {
  message: string;
  code: string;
  request_id?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly errors?: Record<string, string[]>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.status = status;
    this.code = payload.code;
    this.requestId = payload.request_id;
    this.errors = payload.errors;
    this.name = "ApiError";
  }
}

function resolveBaseUrl(): string {
  // Server-side: prefer the in-network hostname when running in compose.
  if (typeof window === "undefined") {
    const internal = process.env.INTERNAL_API_URL;
    if (internal && internal !== "") return internal;
  }
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (!pub || pub === "") {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return pub;
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  // Forwarded directly to fetch — Next 16 reads `cache` and `next` from here.
  next?: { tags?: string[]; revalidate?: number | false };
  cache?: RequestCache;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export async function apiFetch<TResponse>(
  path: string,
  opts: RequestOptions = {},
): Promise<TResponse> {
  const url = `${resolveBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...opts.headers,
  };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;

  const response = await fetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: opts.cache,
    next: opts.next,
    signal: opts.signal,
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const text = await response.text();
  const json = text === "" ? undefined : (JSON.parse(text) as unknown);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      document.cookie = "admin_token=; Path=/; Max-Age=0";
      window.location.href = "/admin/login";
    }

    const payload = (json ?? { message: "Request failed", code: "UNKNOWN" }) as ApiErrorPayload;
    throw new ApiError(response.status, payload);
  }

  return json as TResponse;
}
