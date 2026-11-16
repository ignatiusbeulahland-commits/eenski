import { afterEach, describe, expect, it, vi } from "vitest";
import { canAutoPlay, loadSlide, slideSource } from "@/components/site/slide-loading";

afterEach(() => vi.unstubAllGlobals());

describe("people photo loading", () => {
  it("does not finish loading before the photo decodes", async () => {
    let resolve: (() => void) | undefined;
    vi.stubGlobal("Image", class {
      naturalWidth = 900;
      decode() { return new Promise<void>((done) => { resolve = done; }); }
    });
    let finished = false;
    const pending = loadSlide("creator.webp").then((ok) => { finished = true; return ok; });
    await Promise.resolve();
    expect(finished).toBe(false);
    resolve?.();
    expect(await pending).toBe(true);
  });
  it("keeps failed photos out of the visible slide", async () => {
    vi.stubGlobal("Image", class { decode() { return Promise.reject(new Error("offline")); } });
    expect(await loadSlide("missing.webp")).toBe(false);
  });
  it("disables automatic downloads in low-data mode", () => {
    expect(canAutoPlay(false, false, true, true)).toBe(false);
  });
  it("keeps reduced-motion photos still", () => {
    expect(canAutoPlay(false, true, false, true)).toBe(false);
  });
  it("pauses offscreen and while interacting", () => {
    expect(canAutoPlay(false, false, false, false)).toBe(false);
    expect(canAutoPlay(true, false, false, true)).toBe(false);
    expect(canAutoPlay(false, false, false, true)).toBe(true);
  });
});
describe("hero photo sizes", () => {
  const slide = { src: "big.webp", srcSet: "s.webp 640w, m.webp 960w, big.webp 1344w", sizes: "100vw", small: "s.webp" };
  it("lets the browser pick a copy from the size list normally", () => {
    expect(slideSource(slide, false)).toEqual({ src: "big.webp", srcSet: slide.srcSet, sizes: "100vw" });
  });
  it("uses the smallest copy on low data", () => {
    expect(slideSource(slide, true)).toEqual({ src: "s.webp" });
  });
  it("offers 640, 960 and 1344 pixel copies of every hero photo", async () => {
    const { heroSlides } = await import("@/components/site/hero-images");
    for (const hero of heroSlides) expect(hero.srcSet?.match(/\d+w/g)).toEqual(["640w", "960w", "1344w"]);
  });
});
