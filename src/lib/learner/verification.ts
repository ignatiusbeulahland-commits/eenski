/** Builds the verifiable certificate records from Learner data. Browser-only: call after hydration. */
import { certificateCode } from "@/lib/shared/certificate";
import { savedAccountValues } from "@/lib/dashboard/account";
import type { VerifiableCertificate } from "@/lib/shared/certificateVerify";
import { resources } from "./catalog";
import { courseCertificateDesign } from "./certificateStyles";
import { printedName, stateSchema, STORAGE_KEY, type LearnerState } from "./rules";
import { cleanFullName } from "@/lib/shared/names";
import { badgeCredentialId, findPlatformBadge } from "@/lib/shared/badges";

export function learnerCertificateRecords(state: Pick<LearnerState, "certificates" | "profile"> | null): VerifiableCertificate[] {
  const issued: VerifiableCertificate[] = (state?.certificates ?? []).map((c) => ({
    code: certificateCode(c.id), holder: state ? (c.recipientName || cleanFullName(state.profile.fullName) || printedName(c, state.profile)) : "", title: c.title, issuer: c.issuer, issuedAt: c.issuedAt, kind: "issued", design: courseCertificateDesign(c.resourceId),
  }));
  const previews: VerifiableCertificate[] = resources.filter((r) => r.certificate).map((r) => ({
    code: certificateCode(`preview-${r.id}`), holder: "", title: r.title, issuer: r.creator, issuedAt: "", kind: "preview", design: courseCertificateDesign(r.id),
  }));
  return [...issued, ...previews];
}

/** Every learner account saved on this device (one per email), so /verify can check any of them. */
export function readLearnerCertificateRecords(): VerifiableCertificate[] {
  const states: LearnerState[] = [];
  try {
    for (const raw of savedAccountValues(STORAGE_KEY)) {
      const parsed = stateSchema.safeParse(JSON.parse(raw));
      if (parsed.success) states.push(parsed.data);
    }
  } catch { /* unreadable records: nothing issued */ }
  if (!states.length) return learnerCertificateRecords(null);
  const seen = new Set<string>();
  return states.flatMap((s) => learnerCertificateRecords(s)).filter((r) => (seen.has(r.code) ? false : (seen.add(r.code), true)));
}

/** The certificate display name a learner on this device chose, by email (empty when none or unknown). */
export function learnerCertificateNameFor(email: string): string {
  const e = email.trim().toLowerCase();
  if (!e) return "";
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${e}`);
    if (!raw) return "";
    const parsed = stateSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return "";
    return cleanFullName(parsed.data.profile.certificateName) || cleanFullName(parsed.data.profile.fullName);
  } catch {
    return "";
  }
}

/** Automatic badges earned by every learner account on this device, as verifiable records. */
export function readLearnerBadgeRecords(): import("@/lib/shared/certificateVerify").VerifiableBadge[] {
  const out: import("@/lib/shared/certificateVerify").VerifiableBadge[] = [];
  try {
    for (const raw of savedAccountValues(STORAGE_KEY)) {
      const parsed = stateSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) continue;
      const s = parsed.data;
      const email = s.profile.email.trim().toLowerCase();
      if (!email) continue;
      for (const [id, at] of Object.entries(s.badges)) {
        const def = findPlatformBadge(id);
        if (!def) continue;
        out.push({ id: badgeCredentialId(`${email}|${id}`), name: def.name, description: def.description, criteria: def.criteria, holder: cleanFullName(s.profile.fullName) || "Enski learner", issuer: "Enski", issuedAt: at, badge: { name: def.name, category: def.category, icon: def.icon } });
      }
    }
  } catch { /* unreadable: nothing to verify */ }
  return out;
}
