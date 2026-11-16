import { describe, expect, it } from "vitest";
import { fees } from "@/components/pricing/content";

describe("Enski creator fees", () => {
  it("charges 3.5% + NGN100 on local private sales", () => {
    expect(fees.privateLocal.rate).toBe("3.5% + NGN100");
  });

  it("charges 6.5% on international private sales", () => {
    expect(fees.privateInternational.rate).toBe("6.5%");
  });

  it("takes a 40% commission on marketplace sales", () => {
    expect(fees.marketplace.rate).toBe("40%");
  });
});
