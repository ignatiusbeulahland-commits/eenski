import { describe, expect, it } from "vitest";

import { COVER_VARIANTS, coverFor } from "./covers";

const item = (title: string, summary = "", skills: string[] = [], id = "x") => ({ id, title, summary, skills });

describe("coverFor", () => {
  it("matches the subject in the title", () => {
    expect(coverFor(item("Docker & Kubernetes in Practice")).id).toBe("devops");
    expect(coverFor(item("PostgreSQL Performance & Advanced Querying")).id).toBe("data");
    expect(coverFor(item("iOS App Development with SwiftUI")).id).toBe("mobile");
    expect(coverFor(item("How to Use ChatGPT as a Product Manager")).id).toBe("ai");
    expect(coverFor(item("The Practical Guide to API Design")).id).toBe("code");
    expect(coverFor(item("The Beginner's Guide to Product Management")).id).toBe("product");
    expect(coverFor(item("The Remote Team Handbook")).id).toBe("business");
  });

  it("does not read 'ai' inside longer words", () => {
    expect(coverFor(item("Air travel tips")).id).toBe("lifestyle");
  });

  it("lets the title win over the summary", () => {
    expect(coverFor(item("Personal finance basics", "Build a budget in a spreadsheet app with code")).id).toBe("finance");
  });

  it("falls back to the summary and skills, then a general photo", () => {
    expect(coverFor(item("Masterclass", "", ["Figma"])).id).toBe("design");
    expect(coverFor(item("Scenario public community gig")).id).toBe("general");
  });

  it("picks a stable variant within range", () => {
    for (const id of ["a", "b", "c", "d"]) {
      const c = coverFor(item("Advanced React Patterns", "", [], id));
      expect(c.id).toBe("code");
      expect(c.variant).toBeLessThan(COVER_VARIANTS.code);
      expect(coverFor(item("Advanced React Patterns", "", [], id)).variant).toBe(c.variant);
    }
  });
});
