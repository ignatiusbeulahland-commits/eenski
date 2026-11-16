/** Pure certificate-ID verification rules for the public /verify page. */
import type { CertificateDesign } from "./certificate";
import type { BadgeCategory, BadgeIcon } from "./badges";

export type VerifiableCertificate = {
  code: string;
  holder: string;
  title: string;
  issuer: string;
  issuedAt: string;
  /** "issued" = earned by a learner; "preview" = a style preview shown before completion, never awarded. */
  kind: "issued" | "preview";
  /** The issuing creator's chosen certificate design, when known. */
  design?: CertificateDesign;
  /** Set when the issuer revoked it; the record is kept so checks can say so. */
  revoked?: { at: string; reason: string } | undefined;
};

export type VerifyResult =
  | { status: "empty" }
  | { status: "invalid"; message: string }
  | { status: "verified"; code: string; certificate: VerifiableCertificate }
  | { status: "preview"; code: string; certificate: VerifiableCertificate }
  | { status: "revoked"; code: string; certificate: VerifiableCertificate }
  | { status: "unavailable"; code: string }
  | { status: "not_found"; code: string };

const ALPHABET = /^[2-9A-HJ-NP-Z]{8}$/;

/** Accepts "ens-7f3k-92qd", "ENS 7F3K 92QD" or "7F3K92QD" and returns "ENS-7F3K-92QD", else null. */
export function normalizeCertificateId(input: string): string | null {
  let s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (s.startsWith("ENS")) s = s.slice(3);
  return ALPHABET.test(s) ? `ENS-${s.slice(0, 4)}-${s.slice(4)}` : null;
}

/** `unavailable` = the records on this device couldn't be read, so we can't say either way. */
export function verifyCertificate(input: string, records: VerifiableCertificate[], unavailable = false): VerifyResult {
  if (!input.trim()) return { status: "empty" };
  const code = normalizeCertificateId(input);
  if (!code) {
    return { status: "invalid", message: "Enter the full ID shown on the certificate, for example ENS-7F3K-92QD. IDs use letters and the numbers 2 to 9." };
  }
  // A real, issued record always wins over a preview with the same code.
  const issued = records.find((r) => r.kind === "issued" && r.code === code);
  if (issued) return issued.revoked ? { status: "revoked", code, certificate: issued } : { status: "verified", code, certificate: issued };
  const preview = records.find((r) => r.kind === "preview" && r.code === code);
  if (preview) return { status: "preview", code, certificate: preview };
  return unavailable ? { status: "unavailable", code } : { status: "not_found", code };
}

/* ---------- badges ---------- */

export type VerifiableBadge = {
  id: string; name: string; description: string; criteria: string; holder: string; issuer: string; issuedAt: string;
  badge: { name: string; category: BadgeCategory; icon: BadgeIcon; artwork?: string | undefined };
  courseTitle?: string | undefined;
  revoked?: { at: string; reason: string } | undefined;
};
export type BadgeVerifyResult =
  | { status: "invalid"; message: string }
  | { status: "valid" | "revoked"; id: string; badge: VerifiableBadge }
  | { status: "unavailable" | "not_found"; id: string };

const BADGE_ID = /^ENB[2-9A-HJ-NP-Z]{8}$/;
/** Accepts "enb-7f3k-92qd" or "ENB 7F3K 92QD" and returns "ENB-7F3K-92QD", else null. */
export function normalizeBadgeId(input: string): string | null {
  const s = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return BADGE_ID.test(s) ? `ENB-${s.slice(3, 7)}-${s.slice(7)}` : null;
}
export const looksLikeBadgeId = (input: string) => input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").startsWith("ENB");

export function verifyBadge(input: string, records: VerifiableBadge[], unavailable = false): BadgeVerifyResult {
  const id = normalizeBadgeId(input);
  if (!id) return { status: "invalid", message: "Enter the full badge ID, for example ENB-7F3K-92QD. IDs use letters and the numbers 2 to 9." };
  const hit = records.find((r) => r.id === id);
  if (hit) return { status: hit.revoked ? "revoked" : "valid", id, badge: hit };
  return { status: unavailable ? "unavailable" : "not_found", id };
}
