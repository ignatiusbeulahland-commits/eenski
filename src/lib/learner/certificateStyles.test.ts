import { describe, expect, it } from "vitest";
import { certificateDesignSchema } from "@/lib/shared/certificate";
import { encodeShareToken, resolveSharedCertificate } from "./certificateShare";
import { courseCertificateDesign, learnerCertificateDesign } from "./certificateStyles";

describe("creator-chosen certificate style", () => {
  it("learners see the creator's style first", () => {
    const d = courseCertificateDesign("linkedin-visibility");
    expect(d.template).toBe("midnight");
    expect(learnerCertificateDesign(d).template).toBe("midnight");
  });
  it("learners can switch when the creator allows it", () => {
    expect(learnerCertificateDesign(courseCertificateDesign("linkedin-visibility"), { template: "minimal" }).template).toBe("minimal");
  });
  it("a locked style ignores the learner's pick, including on shared links", () => {
    const locked = courseCertificateDesign("react-patterns");
    expect(locked.learnerCanChange).toBe(false);
    expect(learnerCertificateDesign(locked, { template: "classic", accent: "lime" }).template).toBe("midnight");
    const token = encodeShareToken({ resourceId: "react-patterns", holder: "Ada Obi", issuedAt: "2026-11-10", design: { template: "classic", accent: "lime" } });
    expect(resolveSharedCertificate(token)!.design.template).toBe("midnight");
  });
  it("older saved certificate designs default to letting learners switch", () => {
    expect(certificateDesignSchema.parse({ template: "horizon" }).learnerCanChange).toBe(true);
  });
});
