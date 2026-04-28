import { z } from "zod";

/*
 * Form schemas mirror the *server validation messages* so the client
 * error UX matches what the server would say if a malformed request
 * slipped through.
 *
 * Keep these aligned with backend/app/Http/Requests/*.php.
 * Slug is auto-generated from name on the backend — not part of any form.
 */

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
  description: z
    .string()
    .max(1000, "The description may not exceed 1000 characters.")
    .optional()
    .or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const productFormSchema = z.object({
  category_id: z.string().uuid("Please select a valid category."),
  name: z
    .string()
    .min(2, "The product name must be at least 2 characters.")
    .max(255, "The product name may not exceed 255 characters."),
  description: z
    .string()
    .max(2000, "The description may not exceed 2000 characters.")
    .optional()
    .or(z.literal("")),
  price: z
    .number({ error: "The price must be a whole number." })
    .min(0, "The price cannot be negative."),
  stock_qty: z
    .number({ error: "The stock quantity must be a whole number." })
    .int("The stock quantity must be a whole number.")
    .min(0, "The stock quantity cannot be negative."),
  is_published: z.boolean().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export const reviewFormSchema = z.object({
  reviewer_name: z
    .string()
    .min(2, "Your name must be at least 2 characters.")
    .max(120, "Your name may not exceed 120 characters."),
  email: z
    .string()
    .min(1, "Your email address is required.")
    .max(255, "Your email may not exceed 255 characters.")
    .email("Please enter a valid email address."),
  rating: z
    .number({ error: "A rating is required." })
    .int()
    .min(1, "The rating must be at least 1.")
    .max(5, "The rating may not exceed 5."),
  body: z
    .string()
    .min(10, "The review must be at least 10 characters.")
    .max(2000, "The review may not exceed 2000 characters."),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
