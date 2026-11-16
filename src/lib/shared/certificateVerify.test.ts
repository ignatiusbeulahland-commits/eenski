import { describe, expect, it } from "vitest";
import { certificateCode } from "./certificate";
import { normalizeCertificateId, verifyCertificate, type VerifiableCertificate } from "./certificateVerify";
import { learnerCertificateRecords } from "@/lib/learner/verification";

const issuedCode = certificateCode("cert-course-1");
const records: VerifiableCertificate[] = [
  { code: issuedCode, holder: "Ada Obi", title: "Brand Strategy", issuer: "Tolu", issuedAt: "2026-01-02T10:00:00.000Z", kind: "issued" },
  { code: certificateCode("preview-x"), holder: "", title: "Brand Strategy", issuer: "Tolu", issuedAt: "", kind: "preview" },
];

describe("certificate verification", () => {
  it("accepts lowercase, spaces and missing dashes", () => {
    expect(normalizeCertificateId("ens 7f3k 92qd")).toBe("ENS-7F3K-92QD");
    expect(normalizeCertificateId("7F3K92QD")).toBe("ENS-7F3K-92QD");
  });
  it("rejects IDs that are too short or use 0, 1, I or O", () => {
    expect(normalizeCertificateId("ENS-7F3K")).toBeNull();
    expect(normalizeCertificateId("ENS-7F3K-920D")).toBeNull();
    expect(verifyCertificate("abc", records).status).toBe("invalid");
  });
  it("confirms an issued certificate", () => {
    const r = verifyCertificate(issuedCode.toLowerCase(), records);
    expect(r.status).toBe("verified");
    if (r.status === "verified") expect(r.certificate.holder).toBe("Ada Obi");
  });
  it("never confirms a preview certificate as issued", () => {
    expect(verifyCertificate(certificateCode("preview-x"), records).status).toBe("preview");
  });
  it("reports unknown IDs as not found", () => {
    expect(verifyCertificate("ENS-2222-2222", records).status).toBe("not_found");
  });
  it("a new learner has no issued certificates to verify", () => {
    expect(learnerCertificateRecords(null).filter((r) => r.kind === "issued")).toEqual([]);
  });
});
