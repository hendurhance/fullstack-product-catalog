export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export type ActionError = {
  message: string;
  status: number;
  code: string;
  fields?: Record<string, string[]>;
};
