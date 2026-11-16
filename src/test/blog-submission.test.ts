import { describe, expect, it } from "vitest";
import { checkFile, normalizeUrl, validateSubmission, type SubmissionInput } from "@/components/blog/submission";

const base: SubmissionInput = {
  fullName: "Ada Okafor",
  email: " Ada@Example.COM ",
  bio: "",
  linkedin: "",
  socials: {},
  title: "How I got my first gig",
  category: "Careers",
  body: "a".repeat(300),
  hasDocument: false,
  hasCover: true,
  agreed: true,
};

describe("write an article form", () => {
  it("accepts a complete submission and lower-cases the email", () => {
    const r = validateSubmission(base);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.email).toBe("ada@example.com");
  });

  it("requires a cover image", () => {
    const r = validateSubmission({ ...base, hasCover: false });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.cover).toBeDefined();
  });

  it("needs at least 300 characters of article text unless a document is uploaded", () => {
    expect(validateSubmission({ ...base, body: "a".repeat(299) }).ok).toBe(false);
    expect(validateSubmission({ ...base, body: "", hasDocument: true }).ok).toBe(true);
  });

  it("only accepts LinkedIn links in the LinkedIn field", () => {
    const bad = validateSubmission({ ...base, linkedin: "twitter.com/ada" });
    expect(bad.ok).toBe(false);
    const good = validateSubmission({ ...base, linkedin: "linkedin.com/in/ada" });
    expect(good.ok && good.data.linkedin_url).toBe("https://linkedin.com/in/ada");
  });

  it("keeps filled-in socials as labelled links", () => {
    const r = validateSubmission({ ...base, socials: { twitter: "twitter.com/ada", instagram: "" } });
    expect(r.ok && r.data.social_links).toEqual([{ label: "Twitter", url: "https://twitter.com/ada" }]);
  });

  it("requires agreeing it's original work", () => {
    expect(validateSubmission({ ...base, agreed: false }).ok).toBe(false);
  });

  it("limits images to 5 MB and documents to 10 MB", () => {
    expect(checkFile({ name: "c.jpg", size: 5 * 1024 * 1024 + 1 }, "image")).not.toBeNull();
    expect(checkFile({ name: "c.webp", size: 1000 }, "image")).toBeNull();
    expect(checkFile({ name: "a.docx", size: 10 * 1024 * 1024 + 1 }, "document")).not.toBeNull();
    expect(checkFile({ name: "a.exe", size: 1000 }, "document")).not.toBeNull();
  });

  it("rejects things that aren't web links", () => {
    expect(normalizeUrl("not a link")).toBeNull();
  });
});
