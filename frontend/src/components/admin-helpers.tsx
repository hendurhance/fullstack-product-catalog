import type { ActionError } from "@/lib/actions";

export function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={`px-5 py-2 text-(--ink-muted) ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

export function errorOf(error: unknown): ActionError | undefined {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "status" in error &&
    "message" in error
  ) {
    return error as ActionError;
  }
  return undefined;
}

export function messageOf(error: unknown): string {
  const e = errorOf(error);
  if (e) {
    if (e.fields) {
      const first = Object.values(e.fields)[0]?.[0];
      if (first) return first;
    }
    return e.message;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
