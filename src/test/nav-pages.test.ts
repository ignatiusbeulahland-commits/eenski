import { describe, expect, it } from "vitest";
import { links, mainNav } from "@/components/site/data";

const child = (parent: string, label: string) =>
  mainNav.find((n) => n.label === parent)?.children?.find((c) => c.label === label)?.href;

// The imported pages live on this site, so the menu must open them here, not on the live Enski site.
describe("menu opens the imported pages on this site", () => {
  it("Dreamverse opens /dreamverse", () => {
    expect(mainNav.find((n) => n.label === "Dreamverse")?.href).toBe("/dreamverse");
  });
  it("For Creators → Features opens /features", () => {
    expect(child("For Creators", "Features")).toBe("/features");
  });
  it("For Creators → Pricing opens /pricing", () => {
    expect(child("For Creators", "Pricing")).toBe("/pricing");
  });
  it("Resources → Blog opens /blog", () => {
    expect(child("Resources", "Blog")).toBe("/blog");
  });
  it("Resources → About Us opens /about", () => {
    expect(child("Resources", "About Us")).toBe("/about");
  });
  it("Log in and Register open this site's /auth page", () => {
    expect(links.login).toBe("/auth");
    expect(links.register).toBe("/auth?s=register");
  });
});

describe("courses and verification are reachable from the menu", () => {
  it("Courses opens /courses", () => {
    expect(mainNav.find((n) => n.label === "Courses")?.href).toBe("/courses");
  });
  it("Resources → Verify a Certificate opens /verify", () => {
    expect(child("Resources", "Verify a Certificate")).toBe("/verify");
  });
});

describe("Community page", () => {
  it("Resources → Community opens /community", () => {
    expect(child("Resources", "Community")).toBe("/community");
  });
});

describe("Help centre page", () => {
  it("Resources → FAQ opens /faq", () => {
    expect(child("Resources", "FAQ")).toBe("/faq");
  });
  it("the footer FAQ link opens /faq", () => {
    expect(links.faq).toBe("/faq");
  });
});

describe("Ambassador page", () => {
  it("Become An Ambassador in the menu opens /become-an-ambassador", () => {
    expect(mainNav.find((n) => n.label === "Become An Ambassador")?.href).toBe("/become-an-ambassador");
  });
  it("the footer ambassador link opens /become-an-ambassador", () => {
    expect(links.ambassador).toBe("/become-an-ambassador");
  });
});
