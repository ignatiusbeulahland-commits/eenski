import { z } from "zod";

// Waitlist and contact forms. This page is a design prototype, so entries are checked
// in the browser and confirmed on screen but not sent or stored anywhere.

const name = z
  .string()
  .trim()
  .min(1, "Enter your name.")
  .max(100, "Keep your name under 100 characters.");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .max(254, "That email is too long.")
  .email("Enter a valid email address.");

export const waitlistSchema = z.object({ name, email });

export const contactSchema = z.object({
  name,
  email,
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters).")
    .max(1000, "Keep your message under 1000 characters."),
});

export type LeadKind = "waitlist" | "contact";
export type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

export function validateLead(
  kind: LeadKind,
  values: Record<string, string>,
): { ok: true; data: { name: string; email: string; message?: string } } | { ok: false; errors: FieldErrors } {
  const schema = kind === "waitlist" ? waitlistSchema : contactSchema;
  const r = schema.safeParse(values);
  if (r.success) return { ok: true, data: r.data };
  const errors: FieldErrors = {};
  for (const issue of r.error.issues) {
    const key = issue.path[0] as keyof FieldErrors;
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

/** Prototype submit: validates, waits briefly, then reports success. Nothing leaves the browser. */
export async function submitLead(kind: LeadKind, values: Record<string, string>) {
  const r = validateLead(kind, values);
  if (!r.ok) return r;
  await new Promise((res) => setTimeout(res, 600));
  return r;
}
