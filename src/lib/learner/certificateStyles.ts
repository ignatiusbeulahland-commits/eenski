/** The certificate style each catalogue course's creator chose. Learners see it first. */
import { certificateDesignSchema, type CertificateDesign } from "@/lib/shared/certificate";

const creatorChoices: Record<string, Partial<CertificateDesign>> = {
  "linkedin-visibility": { template: "midnight", accent: "lime" },
  "get-gigs": { template: "horizon", accent: "sky" },
  "vibe-coding": { template: "classic", accent: "lime" },
  "creator-economy": { template: "minimal", accent: "cobalt" },
  "canva-design": { template: "horizon", accent: "lime" },
  "react-patterns": { template: "midnight", accent: "sky", learnerCanChange: false },
  "figma-design": { template: "classic", accent: "sky" },
  "podcast": { template: "minimal", accent: "lime", learnerCanChange: false },
};

export function courseCertificateDesign(resourceId: string): CertificateDesign {
  return certificateDesignSchema.parse(creatorChoices[resourceId] ?? {});
}

/** The style a learner sees: their pick when the creator allows it, otherwise the creator's. */
export function learnerCertificateDesign(courseDesign: CertificateDesign, pick?: Partial<Pick<CertificateDesign, "template" | "accent">>): CertificateDesign {
  return courseDesign.learnerCanChange && pick ? { ...courseDesign, ...pick } : courseDesign;
}
