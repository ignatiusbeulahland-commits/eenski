import { certificateDesignSchema, type CertificateDesign } from "@/lib/shared/certificate";

const designKey = (id: string) => `enski:cert:ready-design:${id}`;

/** Keeps the style the learner downloaded in, so the congratulations screen shows the same art. */
export function rememberReadyDesign(id: string, design: CertificateDesign) {
  try { sessionStorage.setItem(designKey(id), JSON.stringify(design)); } catch { /* private mode */ }
}
export function readyDesign(id: string): CertificateDesign | null {
  try {
    const raw = sessionStorage.getItem(designKey(id));
    const parsed = raw ? certificateDesignSchema.safeParse(JSON.parse(raw)) : null;
    return parsed?.success ? parsed.data : null;
  } catch { return null; }
}
