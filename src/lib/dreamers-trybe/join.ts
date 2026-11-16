import { z } from "zod";

import { demoId, readLocal, simulateDelay, writeLocal } from "@/lib/demo/local";

/**
 * Simulated Dreamers Trybe sign-ups (the join form from the Enski Dreamers Trybe
 * project). Nothing is sent: each sign-up is saved on this device only, one per email.
 */

export const TRYBE_MEMBERS_KEY = "enski:demo:dreamers-trybe-members";

export const TRYBE_GOALS = [
  "Land my first job",
  "Learn a new skill",
  "Build my personal brand",
  "Start a business",
  "Challenge myself to do new things",
  "Earn my first $1,000",
  "Scale to $10,000",
  "Just stay accountable",
] as const;

export const trybeJoinSchema = z.object({
  full_name: z.string().trim().min(1, "Please enter your full name").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
  whatsapp: z.string().trim().regex(/^\+?[0-9 ()-]{7,20}$/, "Enter a valid WhatsApp number"),
  dream: z.string().trim().max(300, "Keep it to 300 characters or fewer"),
  goal: z.string().trim().max(200),
  consent: z.boolean(),
});

export type TrybeJoin = z.infer<typeof trybeJoinSchema>;
export type TrybeMember = TrybeJoin & { id: string; joinedAt: string };

export type JoinCheck = { ok: true; values: TrybeJoin } | { ok: false; error: string };

/** Same checks and messages as the source form; the email is stored lower-cased. */
export function checkTrybeJoin(input: unknown): JoinCheck {
  const r = trybeJoinSchema.safeParse(input);
  if (!r.success) return { ok: false, error: r.error.issues[0]?.message ?? "Check your details" };
  return { ok: true, values: { ...r.data, email: r.data.email.toLowerCase() } };
}

export function readTrybeMembers(): TrybeMember[] {
  return readLocal<TrybeMember[]>(TRYBE_MEMBERS_KEY, []);
}

/** Save on this device. Joining again with the same email updates the earlier sign-up. */
export async function saveTrybeJoin(values: TrybeJoin): Promise<{ status: "joined" | "updated"; member: TrybeMember }> {
  await simulateDelay();
  const all = readTrybeMembers();
  const email = values.email.trim().toLowerCase();
  const prev = all.find((m) => m.email === email);
  const member: TrybeMember = { ...values, email, id: prev?.id ?? demoId(), joinedAt: prev?.joinedAt ?? new Date().toISOString() };
  writeLocal(TRYBE_MEMBERS_KEY, [member, ...all.filter((m) => m.email !== email)]);
  return { status: prev ? "updated" : "joined", member };
}
