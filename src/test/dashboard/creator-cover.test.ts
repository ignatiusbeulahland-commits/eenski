import { describe, expect, it } from "vitest";
import { fitWithin, validateCoverFile } from "@/lib/creator/cover";

describe("Creator cover upload rules", () => {
  it("accepts JPG, PNG and WebP images", () => {
    for (const type of ["image/jpeg", "image/png", "image/webp"]) expect(validateCoverFile({ type, size: 1000 })).toBeNull();
  });
  it("rejects other file types", () => expect(validateCoverFile({ type: "application/pdf", size: 1000 })).not.toBeNull());
  it("rejects images larger than 5 MB", () => {
    expect(validateCoverFile({ type: "image/png", size: 5 * 1024 * 1024 })).toBeNull();
    expect(validateCoverFile({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).not.toBeNull();
  });
  it("resizes so the longest side is at most 1200px", () => {
    expect(fitWithin(4000, 2500)).toEqual({ width: 1200, height: 750 });
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});
