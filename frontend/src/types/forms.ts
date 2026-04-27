import { z } from "zod";

/*
 * Form schemas live next to the rest of the shared types. The OpenAPI-
 * derived `StoreCategoryInput` / `UpdateCategoryInput` are loose shapes
 * for the wire (e.g. `slug` is optional everywhere because the server
 * auto-generates it). These zod schemas mirror the *server validation
 * messages* so the client error UX matches what the server would say
 * if a malformed request slipped through.
 *
 * Keep these aligned with backend/app/Http/Requests/*Category*.php.
 */
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Please enter your password."),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "The category name must be at least 2 characters.")
    .max(120, "The category name may not exceed 120 characters."),
  slug: z
    .string()
    .max(160, "The slug may not exceed 160 characters.")
    .regex(
      SLUG_REGEX,
      'The slug may only contain lowercase letters, numbers, and single hyphens between segments (e.g. "home-and-kitchen").',
    )
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(1000, "The description may not exceed 1000 characters.")
    .optional()
    .or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
