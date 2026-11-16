import { describe, expect, it } from "vitest";

import { enskiTarget, percentOff, shareLinks } from "@/components/product/share";
import { plainText } from "@/lib/marketplace/normalize";

describe("product page sharing", () => {
  it("offers WhatsApp, LinkedIn, Facebook, Twitter and email with the page URL", () => {
    const links = shareLinks("https://ensk.lovable.app/courses/a b", "My course");
    expect(links.map((l) => l.id)).toEqual(["whatsapp", "linkedin", "facebook", "twitter", "email"]);
    for (const l of links) expect(l.href).toContain(encodeURIComponent("https://ensk.lovable.app/courses/a b"));
  });

  it("calls Twitter Twitter, never X", () => {
    const tw = shareLinks("https://x.test", "t").find((l) => l.id === "twitter")!;
    expect(tw.label).toBe("Share on Twitter");
  });
});

describe("Enski-style product links", () => {
  it("send /course/<creator>/<slug> to the course page", () => {
    expect(enskiTarget("course", "ios-app")).toEqual({ to: "/courses/$slug", slug: "ios-app" });
  });
  it("send /ebooks/<creator>/<slug> to the eBook's Dreamverse page", () => {
    expect(enskiTarget("ebooks", "api-guide")).toEqual({ to: "/dreamverse/$slug", slug: "ebook-api-guide" });
  });
  it("send /coaching/<creator>/<slug> to the coaching Dreamverse page", () => {
    expect(enskiTarget("coaching", "career")).toEqual({ to: "/dreamverse/$slug", slug: "coaching-career" });
  });
});

describe("course descriptions from Enski's editor", () => {
  it("show as plain paragraphs, not raw HTML", () => {
    const html =
      '<div>Share your answers.</div><div><br></div><div style="text-align: center;"><span style="x"><i>And remember, </i></span>you&#39;ve got this &amp; more.</div>';
    expect(plainText(html)).toBe("Share your answers.\n\nAnd remember, you've got this & more.");
  });
});

describe("discount chip", () => {
  it("rounds the saving to a whole percent", () => expect(percentOff(479, 383)).toBe(20));
  it("shows nothing when there's no saving", () => expect(percentOff(100, 100)).toBe(0));
});
