import { z } from "zod";
import { readLocal, simulateDelay, writeLocal } from "@/lib/demo/local";

const KEY = "enski:demo:newsletter";

export const newsletterEmail = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address.")
  .max(254, "That email is too long.")
  .email("Enter a valid email address.");

export type SubscribeResult =
  | { status: "subscribed" }
  | { status: "already" }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string };

export function parseNewsletterEmail(raw: string): { ok: true; email: string } | { ok: false; message: string } {
  const r = newsletterEmail.safeParse(raw);
  if (!r.success) return { ok: false, message: r.error.issues[0]?.message ?? "Enter a valid email address." };
  return { ok: true, email: r.data };
}

/** Optional first name: trimmed, inner spaces collapsed, empty becomes null, capped at 80 characters. */
export function parseFirstName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ").slice(0, 80);
  return name || null;
}

/** Demo sign-up: kept on this device only; the same address twice reads as "already on the list". */
export async function subscribeToNewsletter(
  raw: string,
  source = "homepage",
  firstName = "",
): Promise<SubscribeResult> {
  const parsed = parseNewsletterEmail(raw);
  if (!parsed.ok) return { status: "invalid", message: parsed.message };

  await simulateDelay();
  const list = readLocal<{ email: string; firstName: string | null; source: string; at: string }[]>(KEY, []);
  if (list.some((r) => r.email === parsed.email)) return { status: "already" };
  const saved = writeLocal(KEY, [...list, { email: parsed.email, firstName: parseFirstName(firstName), source, at: new Date().toISOString() }]);
  return saved ? { status: "subscribed" } : { status: "error", message: "Your browser blocked saving this sign-up. Please try again." };
}
