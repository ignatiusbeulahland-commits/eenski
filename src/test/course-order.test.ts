import { describe, expect, it } from "vitest";

import { products } from "@/components/site/data";

describe("Beulahland Ignatius course order", () => {
  const positions = products
    .map((p, i) => (p.creator === "Beulahland Ignatius" ? i : -1))
    .filter((i) => i >= 0);

  it("keeps vibe coding 3rd and product management 7th", () => {
    expect(products[2]?.title).toMatch(/^Vibe coding/);
    expect(products[6]?.title).toMatch(/^Product management/);
  });

  it("never puts her courses last", () => {
    expect(positions).not.toContain(products.length - 1);
  });

  it("never puts her courses side by side", () => {
    positions.slice(1).forEach((pos, i) => expect(pos - (positions[i] ?? -Infinity)).toBeGreaterThan(1));
  });
});
