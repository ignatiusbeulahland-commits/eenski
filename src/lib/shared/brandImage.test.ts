import { describe, expect, it } from "vitest";
import { brandFileProblem, inkBox, knockOutWhite } from "./brandImage";

describe("certificate brand uploads", () => {
  it("accepts PNG, JPG, WebP and SVG", () => {
    for (const type of ["image/png", "image/jpeg", "image/webp", "image/svg+xml"]) expect(brandFileProblem({ type, size: 2000 })).toBeNull();
  });
  it("rejects other file types", () => expect(brandFileProblem({ type: "application/pdf", size: 2000 })).toBe("Use a PNG, JPG, WebP or SVG image"));
  it("rejects images over 4 MB and SVGs over 1 MB", () => {
    expect(brandFileProblem({ type: "image/png", size: 4 * 1024 * 1024 + 1 })).toBe("Choose an image under 4 MB");
    expect(brandFileProblem({ type: "image/svg+xml", size: 1024 * 1024 + 1 })).toBe("SVG files must be under 1 MB");
  });
  it("finds the signature ink and ignores transparent edges", () => {
    const w = 4, h = 3;
    const data = new Uint8ClampedArray(w * h * 4);
    const i = (1 * w + 2) * 4; // one dark pixel at (2,1)
    data[i + 3] = 255;
    expect(inkBox(data, w, h, false)).toEqual({ x: 2, y: 1, w: 1, h: 1 });
  });
  it("turns white paper transparent but keeps dark ink", () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 20, 20, 60, 255]);
    knockOutWhite(data);
    expect(data[3]).toBe(0);
    expect(data[7]).toBe(255);
  });
});
