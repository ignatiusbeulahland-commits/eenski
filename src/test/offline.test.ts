import { describe, expect, it } from "vitest";
import { isBlockedHost, OFFLINE_PAGES } from "@/lib/offline/register";

// Offline support must never switch on inside the Lovable editor preview.
describe("offline support stays off in previews", () => {
  it("blocks the editor preview address", () => {
    expect(isBlockedHost("id-preview--f8a6e56e-b2bc-4030-80d5-d2415aac8804.lovable.app")).toBe(true);
  });
  it("blocks lovableproject.com previews", () => {
    expect(isBlockedHost("f8a6e56e.lovableproject.com")).toBe(true);
  });
  it("allows the published site", () => {
    expect(isBlockedHost("enski.lovable.app")).toBe(false);
    expect(isBlockedHost("www.tryenski.com")).toBe(false);
  });
});

describe("pages saved for offline", () => {
  it("include the homepage and the Ambassador page", () => {
    expect(OFFLINE_PAGES).toContain("/");
    expect(OFFLINE_PAGES).toContain("/become-an-ambassador");
  });
});
