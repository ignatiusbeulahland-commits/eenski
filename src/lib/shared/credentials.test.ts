import { describe, expect, it } from "vitest";
import { findPlatformBadge } from "./badges";
import { awardProblem, certificateProblem, emptyCredentials, type AwardInput, type Credentials } from "./credentials";

const base = (over: Partial<AwardInput> = {}): AwardInput => ({
  badge: findPlatformBadge("top-performer")!, badgeId: "top-performer", recipientName: "Ada Obi", recipientEmail: "ada@mail.com",
  issuer: "Demo Creator", issuerEmail: "creator@demo.enski", evidence: "Top score of 96% in the final assessment", criteriaConfirmed: true, ...over,
});

describe("badge awarding rules", () => {
  it("allows a creator badge when criteria are confirmed with evidence", () => expect(awardProblem(emptyCredentials, base())).toBeNull());
  it("requires the creator to confirm the criteria", () => expect(awardProblem(emptyCredentials, base({ criteriaConfirmed: false }))).toBe("Confirm the learner meets the badge criteria"));
  it("requires evidence", () => expect(awardProblem(emptyCredentials, base({ evidence: "good" }))).toMatch(/Describe how/));
  it("never lets creators award automatic or Enski-only badges", () => {
    expect(awardProblem(emptyCredentials, base({ badge: findPlatformBadge("finisher")!, badgeId: "finisher" }))).toMatch(/automatically/);
    expect(awardProblem(emptyCredentials, base({ badge: findPlatformBadge("outstanding-facilitator")!, badgeId: "outstanding-facilitator" }))).toMatch(/Enski team/);
  });
  it("blocks a duplicate active award", () => {
    const c: Credentials = { ...emptyCredentials, badgeAwards: [{ id: "ENB-AAAA-BBBB", badgeId: "top-performer", badge: { name: "Top Performer", description: "", criteria: "", category: "performance", icon: "trophy", artwork: "" }, issuer: "x", issuerEmail: "x", recipientName: "Ada", recipientEmail: "ADA@mail.com", evidence: "x", courseTitle: "", certificateCode: "", issuedAt: "2026-11-01", status: "active" }] };
    expect(awardProblem(c, base())).toMatch(/already holds/);
  });
});

describe("certificate issuing rules", () => {
  it("needs a name and a valid email", () => {
    expect(certificateProblem(emptyCredentials, { itemId: "c1", recipientName: " ", recipientEmail: "a@b.co" })).toBe("Enter the student's name");
    expect(certificateProblem(emptyCredentials, { itemId: "c1", recipientName: "Ada", recipientEmail: "nope" })).toBe("Enter the student's email address");
  });
});

import { beforeEach } from "vitest";
import { decideCorrection, issueCertificate, readCredentials, requestCorrection } from "./credentials";
import { certificateDesignSchema } from "./certificate";

describe("certificate name corrections", () => {
  beforeEach(() => localStorage.clear());
  it("keeps the credential ID and records the old name when the issuer approves", () => {
    const r = issueCertificate({ itemId: "c1", recipientName: "Beulahland Ignatius", recipientEmail: "b@mail.com", courseTitle: "Vibe coding", title: "Certificate of completion", issuer: "Demo", issuerEmail: "creator@demo.enski", signer: "Demo", design: certificateDesignSchema.parse({}) });
    if (!r.ok) throw new Error(r.error);
    requestCorrection({ code: r.record.code, requesterEmail: "b@mail.com", currentName: "Beulahland Ignatius", requestedName: "Beulahland I. Ignatius", reason: "Middle initial" });
    const req = readCredentials().corrections[0]!;
    decideCorrection(req.id, true, "creator@demo.enski");
    const cert = readCredentials().certificates[0]!;
    expect(cert.code).toBe(r.record.code);
    expect(cert.recipientName).toBe("Beulahland I. Ignatius");
    expect(cert.previousNames[0]?.name).toBe("Beulahland Ignatius");
  });
  it("ignores decisions from someone who didn't issue it", () => {
    const r = issueCertificate({ itemId: "c2", recipientName: "Ada Obi", recipientEmail: "a@mail.com", courseTitle: "X", title: "Certificate", issuer: "Demo", issuerEmail: "creator@demo.enski", signer: "Demo", design: certificateDesignSchema.parse({}) });
    if (!r.ok) throw new Error(r.error);
    requestCorrection({ code: r.record.code, requesterEmail: "a@mail.com", currentName: "Ada Obi", requestedName: "Ada N. Obi", reason: "Typo here" });
    decideCorrection(readCredentials().corrections[0]!.id, true, "someone@else.com");
    expect(readCredentials().certificates[0]!.recipientName).toBe("Ada Obi");
  });
});

import { verifyBadge, verifyCertificate } from "./certificateVerify";
import { registryBadgeRecords, registryCertificateRecords, revokeCertificate, revokeBadgeAward, awardBadge } from "./credentials";

describe("verification states", () => {
  beforeEach(() => localStorage.clear());
  it("shows a creator-issued certificate as verified, then revoked", () => {
    const r = issueCertificate({ itemId: "c9", recipientName: "Daniel Okoro", recipientEmail: "d@mail.com", courseTitle: "Design", title: "Certificate", issuer: "Demo", issuerEmail: "creator@demo.enski", signer: "Demo", design: certificateDesignSchema.parse({}) });
    if (!r.ok) throw new Error(r.error);
    expect(verifyCertificate(r.record.code, registryCertificateRecords()).status).toBe("verified");
    revokeCertificate(r.record.code, "Issued in error", "creator@demo.enski");
    expect(verifyCertificate(r.record.code, registryCertificateRecords()).status).toBe("revoked");
  });
  it("never verifies an unknown ID, and says unavailable when records can't be read", () => {
    expect(verifyCertificate("ENS-2222-3333", []).status).toBe("not_found");
    expect(verifyCertificate("ENS-2222-3333", [], true).status).toBe("unavailable");
    expect(verifyCertificate("hello", []).status).toBe("invalid");
  });
  it("verifies and revokes badges by their ENB ID", () => {
    const a = awardBadge({ badge: findPlatformBadge("best-project")!, badgeId: "best-project", recipientName: "Ada", recipientEmail: "a@mail.com", issuer: "Demo", issuerEmail: "creator@demo.enski", evidence: "Chosen as best final project", criteriaConfirmed: true });
    if (!a.ok) throw new Error(a.error);
    expect(verifyBadge(a.award.id, registryBadgeRecords()).status).toBe("valid");
    revokeBadgeAward(a.award.id, "Duplicate award", "creator@demo.enski");
    expect(verifyBadge(a.award.id, registryBadgeRecords()).status).toBe("revoked");
    expect(verifyBadge("ENB-2222-3333", registryBadgeRecords()).status).toBe("not_found");
  });
});
