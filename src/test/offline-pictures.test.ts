import { describe, expect, it } from "vitest";

import { picturesInPage } from "@/lib/offline/pictures";

const BASE = "https://ensk.lovable.app";

describe("pictures saved for offline use", () => {
  it("keeps a photo's size list so the copy this screen shows is the one saved", () => {
    const html = `<img src="/assets/hero.webp" srcset="/assets/hero-640.webp 640w, /assets/hero.webp 1344w" sizes="100vw" alt="">`;
    expect(picturesInPage(html, BASE)).toEqual([
      { src: "/assets/hero.webp", srcSet: "/assets/hero-640.webp 640w, /assets/hero.webp 1344w", sizes: "100vw" },
    ]);
  });

  it("finds photos mentioned in page data, without saving every size of one already listed", () => {
    const html = `<img src="/assets/a.webp" srcset="/assets/a-640.webp 640w, /assets/a.webp 1200w" sizes="50vw"><script>{"cover":"/demo/enski/course-1.webp","small":"/assets/a-640.webp"}</script>`;
    const srcs = picturesInPage(html, BASE).map((p) => p.src);
    expect(srcs).toEqual(["/assets/a.webp", "/demo/enski/course-1.webp"]);
  });

  it("skips other sites, link-preview images and embedded data", () => {
    const html = `<img src="https://images.example.com/x.jpg"><img src="/og/home.jpg"><img src="data:image/png;base64,AAAA"><img src="/brand/logo.webp">`;
    expect(picturesInPage(html, BASE).map((p) => p.src)).toEqual(["/brand/logo.webp"]);
  });

  it("includes image preloads and inline background photos", () => {
    const html = `<link rel="preload" as="image" href="/assets/h.webp" imagesrcset="/assets/h-640.webp 640w, /assets/h.webp 1344w" imagesizes="100vw"><div style="background-image:url('/assets/bg.webp')"></div>`;
    expect(picturesInPage(html, BASE).map((p) => p.src)).toEqual(["/assets/h.webp", "/assets/bg.webp"]);
  });
});
