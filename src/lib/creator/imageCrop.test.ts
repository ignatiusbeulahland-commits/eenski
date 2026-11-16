import { describe, expect, it } from "vitest";
import { cropRect, imageSizeProblem } from "./imageCrop";

describe("storefront image rules", () => {
  it("accepts images at least 1080 × 1080", () => {
    expect(imageSizeProblem(1080, 1080)).toBeNull();
    expect(imageSizeProblem(4000, 3000)).toBeNull();
  });
  it("refuses images smaller than 1080 on either side", () => {
    expect(imageSizeProblem(1079, 2000)).toContain("1079 × 2000");
    expect(imageSizeProblem(2000, 800)).not.toBeNull();
  });
  it("crops a square from the centre of a wide image", () => {
    expect(cropRect(2000, 1000, 1, { zoom: 1, x: 0.5, y: 0.5 })).toEqual({ sx: 500, sy: 0, sw: 1000, sh: 1000 });
  });
  it("crops a 3:1 banner and zooms in", () => {
    expect(cropRect(1200, 1200, 3, { zoom: 2, x: 0, y: 1 })).toEqual({ sx: 0, sy: 1000, sw: 600, sh: 200 });
  });
});
