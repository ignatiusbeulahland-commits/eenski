/**
 * Credentials issued by creators on this device: certificates they issue by hand, badges they
 * award, and their own custom badges. Shared across accounts on the device (like a tiny registry),
 * so a learner signed in with the recipient email receives them and /verify can check them.
 * Demo only: nothing leaves the device.
 */
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { BADGE_CATEGORIES, BADGE_ICONS, badgeCredentialId, type BadgeDefinition } from "./badges";
import { certificateCode, certificateDesignSchema } from "./certificate";
import type { VerifiableBadge, VerifiableCertificate } from "./certificateVerify";

const badgeSnapshot = z.object({
  name: z.string(), description: z.string(), criteria: z.string(),
  category: z.enum(BADGE_CATEGORIES), icon: z.enum(BADGE_ICONS), artwork: z.string().default(""),
});
const revocation = { status: z.enum(["active", "revoked"]).default("active"), revokedAt: z.string().optional(), revokeReason: z.string().optional() };

export const customBadgeSchema = badgeSnapshot.extend({
  id: z.string(), owner: z.string(), issuer: z.string(), createdAt: z.string(), archived: z.boolean().default(false),
});
export const badgeAwardSchema = z.object({
  id: z.string(), badgeId: z.string(), badge: badgeSnapshot,
  issuer: z.string(), issuerEmail: z.string(), recipientName: z.string(), recipientEmail: z.string(),
  evidence: z.string(), courseTitle: z.string().default(""), certificateCode: z.string().default(""), issuedAt: z.string(),
  ...revocation,
});
export const issuedCertificateSchema = z.object({
  code: z.string(), itemId: z.string(), recipientName: z.string(), recipientEmail: z.string(),
  courseTitle: z.string(), title: z.string(), issuer: z.string(), issuerEmail: z.string(), signer: z.string(), issuedAt: z.string(),
  design: certificateDesignSchema, badgeAwardId: z.string().default(""),
  /** Names this certificate carried before an approved correction (the ID never changes). */
  previousNames: z.array(z.object({ name: z.string(), until: z.string() })).default([]),
  ...revocation,
});
export const correctionSchema = z.object({
  id: z.string(), code: z.string(), requesterEmail: z.string(), currentName: z.string(), requestedName: z.string(), reason: z.string(), at: z.string(),
  status: z.enum(["pending", "approved", "declined", "withdrawn"]), decidedAt: z.string().optional(),
});
export type CorrectionRequest = z.infer<typeof correctionSchema>;
export const credentialsSchema = z.object({
  customBadges: z.array(customBadgeSchema).default([]),
  badgeAwards: z.array(badgeAwardSchema).default([]),
  certificates: z.array(issuedCertificateSchema).default([]),
  corrections: z.array(correctionSchema).default([]),
});
export type CustomBadge = z.infer<typeof customBadgeSchema>;
export type BadgeAward = z.infer<typeof badgeAwardSchema>;
export type IssuedCertificate = z.infer<typeof issuedCertificateSchema>;
export type Credentials = z.infer<typeof credentialsSchema>;
export const emptyCredentials: Credentials = credentialsSchema.parse({});

export const CREDENTIALS_KEY = "enski:credentials:v1";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Credentials } = { raw: null, value: emptyCredentials };
/** True when the saved records exist but couldn't be read (shown as "unavailable", never as invalid). */
let unreadable = false;

export function readCredentials(): Credentials {
  if (typeof window === "undefined") return emptyCredentials;
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(CREDENTIALS_KEY); } catch { unreadable = true; return emptyCredentials; }
  if (raw === cache.raw) return cache.value;
  let value = emptyCredentials;
  unreadable = false;
  if (raw) {
    try {
      const parsed = credentialsSchema.safeParse(JSON.parse(raw));
      if (parsed.success) value = parsed.data;
      else unreadable = true;
    } catch { unreadable = true; }
  }
  cache = { raw, value };
  return value;
}
export const credentialsUnreadable = () => { readCredentials(); return unreadable; };

export function writeCredentials(next: Credentials): boolean {
  try { window.localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(next)); } catch { return false; }
  listeners.forEach((l) => l());
  return true;
}
const update = (fn: (c: Credentials) => Credentials) => writeCredentials(fn(readCredentials()));

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === CREDENTIALS_KEY) l(); };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}
export function useCredentials(): Credentials {
  return useSyncExternalStore(subscribe, readCredentials, () => emptyCredentials);
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
export const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
const nonce = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e9).toString(36)}`;

/* ---------- pure rules ---------- */

export type IssueCertificateInput = { itemId: string; recipientName: string; recipientEmail: string; courseTitle: string; title: string; issuer: string; issuerEmail: string; signer: string; design: IssuedCertificate["design"] };

/** Why a certificate can't be issued, or null. One active certificate per course per recipient. */
export function certificateProblem(c: Credentials, i: Pick<IssueCertificateInput, "itemId" | "recipientName" | "recipientEmail">): string | null {
  if (!i.recipientName.trim()) return "Enter the student's name";
  if (!validEmail(i.recipientEmail)) return "Enter the student's email address";
  if (c.certificates.some((x) => x.status === "active" && x.itemId === i.itemId && sameEmail(x.recipientEmail, i.recipientEmail))) return "This student already has an active certificate for this course";
  return null;
}

export type AwardInput = { badge: BadgeDefinition; badgeId: string; recipientName: string; recipientEmail: string; issuer: string; issuerEmail: string; evidence: string; criteriaConfirmed: boolean; courseTitle?: string; certificateCode?: string };

/** Why a badge can't be awarded, or null. Creators can't award Enski-only or automatic badges, and must confirm criteria with evidence. */
export function awardProblem(c: Credentials, i: AwardInput): string | null {
  if (i.badge.awardedBy === "enski") return "Only the Enski team can award this badge";
  if (i.badge.awardedBy === "auto") return "This badge is earned automatically when the learner meets its criteria";
  if (!i.recipientName.trim()) return "Enter the learner's name";
  if (!validEmail(i.recipientEmail)) return "Enter the learner's email address";
  if (!i.criteriaConfirmed) return "Confirm the learner meets the badge criteria";
  if (i.evidence.trim().length < 10) return "Describe how the learner met the criteria (at least 10 characters)";
  if (c.badgeAwards.some((a) => a.status === "active" && a.badgeId === i.badgeId && sameEmail(a.recipientEmail, i.recipientEmail) && a.courseTitle === (i.courseTitle ?? ""))) return "This learner already holds this badge for this course";
  return null;
}

/* ---------- actions ---------- */

export function issueCertificate(i: IssueCertificateInput, now = new Date()): { ok: true; record: IssuedCertificate } | { ok: false; error: string } {
  const c = readCredentials();
  const problem = certificateProblem(c, i);
  if (problem) return { ok: false, error: problem };
  let code = certificateCode(`${i.issuerEmail}|${i.recipientEmail}|${i.itemId}|${nonce()}`);
  while (c.certificates.some((x) => x.code === code)) code = certificateCode(nonce());
  const record: IssuedCertificate = issuedCertificateSchema.parse({ ...i, recipientName: i.recipientName.trim(), recipientEmail: i.recipientEmail.trim().toLowerCase(), code, issuedAt: now.toISOString() });
  if (!writeCredentials({ ...c, certificates: [record, ...c.certificates] })) return { ok: false, error: "This device is out of space. Remove some images and try again." };
  return { ok: true, record };
}

export function awardBadge(i: AwardInput, now = new Date()): { ok: true; award: BadgeAward } | { ok: false; error: string } {
  const c = readCredentials();
  const problem = awardProblem(c, i);
  if (problem) return { ok: false, error: problem };
  let id = badgeCredentialId(`${i.issuerEmail}|${i.recipientEmail}|${i.badgeId}|${nonce()}`);
  while (c.badgeAwards.some((a) => a.id === id)) id = badgeCredentialId(nonce());
  const { name, description, criteria, category, icon, artwork } = i.badge;
  const award: BadgeAward = badgeAwardSchema.parse({
    id, badgeId: i.badgeId, badge: { name, description, criteria, category, icon, artwork: artwork ?? "" },
    issuer: i.issuer, issuerEmail: i.issuerEmail, recipientName: i.recipientName.trim(), recipientEmail: i.recipientEmail.trim().toLowerCase(),
    evidence: i.evidence.trim().slice(0, 400), courseTitle: i.courseTitle ?? "", certificateCode: i.certificateCode ?? "", issuedAt: now.toISOString(),
  });
  if (!writeCredentials({ ...c, badgeAwards: [award, ...c.badgeAwards] })) return { ok: false, error: "This device is out of space." };
  return { ok: true, award };
}

/** Revokes are kept on record (never deleted) so verification can report them. */
export function revokeBadgeAward(id: string, reason: string, issuerEmail: string, now = new Date()) {
  return update((c) => ({ ...c, badgeAwards: c.badgeAwards.map((a) => (a.id === id && sameEmail(a.issuerEmail, issuerEmail) && a.status === "active" ? { ...a, status: "revoked" as const, revokedAt: now.toISOString(), revokeReason: reason.trim().slice(0, 200) } : a)) }));
}
export function revokeCertificate(code: string, reason: string, issuerEmail: string, now = new Date()) {
  return update((c) => ({ ...c, certificates: c.certificates.map((x) => (x.code === code && sameEmail(x.issuerEmail, issuerEmail) && x.status === "active" ? { ...x, status: "revoked" as const, revokedAt: now.toISOString(), revokeReason: reason.trim().slice(0, 200) } : x)) }));
}

/** The Enski team can revoke any credential (e.g. fraud); the record and reason stay for verification. */
export function revokeAsEnski(kind: "certificate" | "badge", id: string, reason: string, now = new Date()) {
  const r = { status: "revoked" as const, revokedAt: now.toISOString(), revokeReason: `Revoked by Enski: ${reason.trim().slice(0, 180)}` };
  return update((c) => kind === "badge"
    ? { ...c, badgeAwards: c.badgeAwards.map((a) => (a.id === id && a.status === "active" ? { ...a, ...r } : a)) }
    : { ...c, certificates: c.certificates.map((x) => (x.code === id && x.status === "active" ? { ...x, ...r } : x)) });
}

export function saveCustomBadge(b: Omit<CustomBadge, "id" | "createdAt" | "archived"> & { id?: string | undefined }) {
  return update((c) => {
    const existing = b.id ? c.customBadges.find((x) => x.id === b.id) : undefined;
    const next: CustomBadge = customBadgeSchema.parse({ ...existing, ...b, id: b.id ?? `custom-${nonce()}`, createdAt: existing?.createdAt ?? new Date().toISOString() });
    return { ...c, customBadges: existing ? c.customBadges.map((x) => (x.id === next.id ? next : x)) : [next, ...c.customBadges] };
  });
}
/** Badges already awarded can only be archived (awarded copies stay valid); unused ones are deleted. */
export function removeCustomBadge(id: string) {
  return update((c) => c.badgeAwards.some((a) => a.badgeId === id)
    ? { ...c, customBadges: c.customBadges.map((x) => (x.id === id ? { ...x, archived: true } : x)) }
    : { ...c, customBadges: c.customBadges.filter((x) => x.id !== id) });
}

export const customBadgeDefinition = (b: CustomBadge): BadgeDefinition => ({ id: b.id, name: b.name, category: b.category, icon: b.icon, description: b.description, criteria: b.criteria, awardedBy: "issuer", owner: b.owner, artwork: b.artwork });
export const awardsFor = (c: Credentials, email: string) => c.badgeAwards.filter((a) => sameEmail(a.recipientEmail, email));
export const certificatesFor = (c: Credentials, email: string) => c.certificates.filter((x) => sameEmail(x.recipientEmail, email));

/* ---------- name corrections for creator-issued certificates ---------- */

export function requestCorrection(r: Omit<CorrectionRequest, "id" | "at" | "status">, now = new Date()) {
  return update((c) => ({ ...c, corrections: [{ ...r, id: `corr-${nonce()}`, at: now.toISOString(), status: "pending" as const }, ...c.corrections.filter((x) => !(x.code === r.code && x.status === "pending"))] }));
}
export function withdrawCorrection(id: string) {
  return update((c) => ({ ...c, corrections: c.corrections.map((x) => (x.id === id && x.status === "pending" ? { ...x, status: "withdrawn" as const } : x)) }));
}
/** The issuer decides. Approving changes the printed name, keeps the ID and records the old name. */
export function decideCorrection(id: string, approve: boolean, issuerEmail: string, now = new Date()) {
  return update((c) => {
    const req = c.corrections.find((x) => x.id === id && x.status === "pending");
    if (!req) return c;
    const cert = c.certificates.find((x) => x.code === req.code);
    if (!cert || !sameEmail(cert.issuerEmail, issuerEmail)) return c;
    const at = now.toISOString();
    return {
      ...c,
      corrections: c.corrections.map((x) => (x.id === id ? { ...x, status: approve ? ("approved" as const) : ("declined" as const), decidedAt: at } : x)),
      certificates: approve ? c.certificates.map((x) => (x.code === req.code ? { ...x, recipientName: req.requestedName, previousNames: [...x.previousNames, { name: x.recipientName, until: at }] } : x)) : c.certificates,
    };
  });
}
export const pendingRegistryCorrection = (c: Credentials, code: string) => c.corrections.find((x) => x.code === code && x.status === "pending");

/* ---------- verification records ---------- */

export function registryCertificateRecords(c: Credentials = readCredentials()): VerifiableCertificate[] {
  return c.certificates.map((x) => ({
    code: x.code, holder: x.recipientName, title: x.courseTitle, issuer: x.issuer, issuedAt: x.issuedAt, kind: "issued" as const, design: x.design,
    revoked: x.status === "revoked" ? { at: x.revokedAt ?? "", reason: x.revokeReason ?? "" } : undefined,
  }));
}
export function registryBadgeRecords(c: Credentials = readCredentials()): VerifiableBadge[] {
  return c.badgeAwards.map((a) => ({
    id: a.id, name: a.badge.name, description: a.badge.description, criteria: a.badge.criteria, holder: a.recipientName, issuer: a.issuer, issuedAt: a.issuedAt,
    badge: { name: a.badge.name, category: a.badge.category, icon: a.badge.icon, artwork: a.badge.artwork || undefined }, courseTitle: a.courseTitle || undefined,
    revoked: a.status === "revoked" ? { at: a.revokedAt ?? "", reason: a.revokeReason ?? "" } : undefined,
  }));
}
