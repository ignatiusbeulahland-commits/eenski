import { describe, expect, it } from "vitest";
import { certificateCode } from "@/lib/shared/certificate";
import { decodeShareToken, encodeShareToken, linkedInAddUrl, resolveSharedCertificate } from "./certificateShare";

const rid = "linkedin-visibility";
const token = encodeShareToken({ resourceId: rid, holder: "Adaeze Ọkọnkwọ", issuedAt: "2026-11-10T09:00:00.000Z", design: { template: "midnight", accent: "sky" } });

describe("shareable certificate links", () => {
  it("round-trips name, date and style, including accented names", () => {
    expect(decodeShareToken(token)).toEqual({ v: 1, r: rid, n: "Adaeze Ọkọnkwọ", d: "2026-11-10", t: "midnight", a: "sky" });
  });
  it("takes course, creator and ID from Enski, not the link", () => {
    const c = resolveSharedCertificate(token)!;
    expect(c.code).toBe(certificateCode(`cert-${rid}`));
    expect(c.issuer).toBe("Blossom Affia");
  });
  it("only says verified when this device issued it to the same name", () => {
    expect(resolveSharedCertificate(token)!.status).toBe("confirmed");
    const issued = [{ code: certificateCode(`cert-${rid}`), holder: "adaeze ọkọnkwọ", title: "", issuer: "", issuedAt: "2026-11-10T09:00:00.000Z", kind: "issued" as const }];
    expect(resolveSharedCertificate(token, issued)!.status).toBe("verified");
    expect(resolveSharedCertificate(token, [{ ...issued[0]!, holder: "Someone Else" }])!.status).toBe("confirmed");
  });
  it("rejects tampered links and courses without certificates", () => {
    expect(resolveSharedCertificate("not-a-token")).toBeNull();
    expect(resolveSharedCertificate(token.slice(0, -4))).toBeNull();
    expect(resolveSharedCertificate(encodeShareToken({ resourceId: "content-planner", holder: "A B", issuedAt: "2026-11-10" }))).toBeNull();
  });
  it("prefills LinkedIn with the course, Enski, issue month and ID", () => {
    const u = new URL(linkedInAddUrl({ title: "Course", issuedAt: "2026-11-10T09:00:00.000Z", code: "ENS-2222-3333", url: "https://x.test/c" }));
    expect(u.searchParams.get("organizationName")).toBe("Enski");
    expect(u.searchParams.get("issueYear")).toBe("2026");
    expect(u.searchParams.get("issueMonth")).toBe("11");
    expect(u.searchParams.get("certId")).toBe("ENS-2222-3333");
  });
});
