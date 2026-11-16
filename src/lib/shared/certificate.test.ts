import { describe, expect, it } from "vitest";
import { certificateCode, certificateDesignSchema, completionLine, issuerDisplay, signerRoleDisplay, wrapLines } from "./certificate";

describe("certificate design", () => {
  it("names the school or institution when set, otherwise the creator", () => {
    expect(issuerDisplay({ issuerName: "Lagos School of Design" }, "Ada Nwosu")).toBe("Lagos School of Design");
    expect(issuerDisplay({ issuerName: "  " }, "Ada Nwosu")).toBe("Ada Nwosu");
  });
  it("words the completion line for who issues it", () => {
    expect(completionLine("creator", "Ada Nwosu")).toBe("an online course created by Ada Nwosu and offered through Enski");
    expect(completionLine("school", "Yaba Tech")).toBe("an online course authorised by Yaba Tech and offered through Enski");
  });
  it("defaults the signer title by issuer type", () => {
    expect(signerRoleDisplay({ signerRole: "", issuerType: "institution" })).toBe("Programme director");
    expect(signerRoleDisplay({ signerRole: "Dean", issuerType: "school" })).toBe("Dean");
  });
  it("gives every certificate a stable ID", () => {
    expect(certificateCode("cert-a")).toBe(certificateCode("cert-a"));
    expect(certificateCode("cert-a")).not.toBe(certificateCode("cert-b"));
    expect(certificateCode("cert-a")).toMatch(/^ENS-[2-9A-Z]{4}-[2-9A-Z]{4}$/);
  });
  it("wraps long course titles and trims overflow", () => {
    expect(wrapLines("Design sprint in a day", 40, 2)).toEqual(["Design sprint in a day"]);
    const lines = wrapLines("A very long course title that keeps going well past what fits on two lines of a certificate", 30, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1]!.endsWith("…")).toBe(true);
  });
  it("older saved settings without a design get the Classic defaults", () => {
    expect(certificateDesignSchema.parse({}).template).toBe("classic");
    expect(certificateDesignSchema.parse({}).showSeal).toBe(true);
  });
});

describe("certificate title wrapping", () => {
  it("balances two-line titles so the last line isn't a lone word", () => {
    const lines = wrapLines("LinkedIn visibility: get seen, get chosen, get paid", 46, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1]!.split(" ").length).toBeGreaterThan(1);
    expect(lines.join(" ")).toBe("LinkedIn visibility: get seen, get chosen, get paid");
  });
});
