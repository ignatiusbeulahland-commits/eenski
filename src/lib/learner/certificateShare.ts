/**
 * Shareable certificate links. The link carries only the holder's name, issue date and chosen style;
 * course title, creator and certificate ID are always read from the Enski catalogue, never from the link.
 */
import { z } from "zod";
import { CERT_ACCENTS, CERT_TEMPLATES, certificateCode, type CertificateDesign } from "@/lib/shared/certificate";
import type { VerifiableCertificate } from "@/lib/shared/certificateVerify";
import { findResource } from "./catalog";
import { courseCertificateDesign, learnerCertificateDesign } from "./certificateStyles";

const payloadSchema = z.object({
  v: z.literal(1),
  r: z.string().min(1).max(80),
  n: z.string().trim().min(1).max(80),
  d: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  t: z.enum(CERT_TEMPLATES).optional(),
  a: z.enum(CERT_ACCENTS).optional(),
});
export type SharePayload = z.infer<typeof payloadSchema>;

const toB64Url = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)));
};

export function encodeShareToken(p: { resourceId: string; holder: string; issuedAt: string; design?: Pick<CertificateDesign, "template" | "accent"> }) {
  const payload: SharePayload = { v: 1, r: p.resourceId, n: p.holder.trim(), d: p.issuedAt.slice(0, 10), ...(p.design ? { t: p.design.template, a: p.design.accent } : {}) };
  return toB64Url(JSON.stringify(payload));
}

export function decodeShareToken(token: string): SharePayload | null {
  if (!token || token.length > 600 || !/^[A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const parsed = payloadSchema.safeParse(JSON.parse(fromB64Url(token)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export type SharedCertificate = {
  status: "verified" | "confirmed";
  code: string;
  holder: string;
  title: string;
  issuer: string;
  category: string;
  issuedAt: string;
  design: CertificateDesign;
};

/**
 * "verified": matches a certificate issued on this device to the same name.
 * "confirmed": the ID genuinely belongs to this Enski course; name and date are as shared.
 * null: not an Enski certificate link.
 */
export function resolveSharedCertificate(token: string, issued: VerifiableCertificate[] = []): SharedCertificate | null {
  const p = decodeShareToken(token);
  if (!p) return null;
  const r = findResource(p.r);
  if (!r?.certificate) return null;
  const code = certificateCode(`cert-${r.id}`);
  const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
  const local = issued.find((c) => c.kind === "issued" && c.code === code && same(c.holder, p.n));
  return {
    status: local ? "verified" : "confirmed",
    code, holder: p.n, title: r.title, issuer: r.creator, category: r.category,
    issuedAt: local?.issuedAt ?? `${p.d}T12:00:00.000Z`,
    design: learnerCertificateDesign(courseCertificateDesign(r.id), { ...(p.t ? { template: p.t } : {}), ...(p.a ? { accent: p.a } : {}) }),
  };
}

/** LinkedIn's "Add licence or certification" form, prefilled. */
export function linkedInAddUrl(c: { title: string; issuedAt: string; code: string; url: string }) {
  const d = new Date(c.issuedAt);
  const q = new URLSearchParams({
    startTask: "CERTIFICATION_NAME", name: c.title, organizationName: "Enski",
    issueYear: String(d.getUTCFullYear()), issueMonth: String(d.getUTCMonth() + 1), certUrl: c.url, certId: c.code,
  });
  return `https://www.linkedin.com/profile/add?${q.toString()}`;
}
