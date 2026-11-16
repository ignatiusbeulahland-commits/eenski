import { describe, expect, it } from "vitest";
import { prepareImage } from "@/lib/dashboard/imageLoading";

describe("dashboard image loading", () => {
  it("makes images lazy unless marked eager", () => {
    const a = document.createElement("img");
    prepareImage(a);
    expect(a.getAttribute("loading")).toBe("lazy");
    const b = document.createElement("img");
    b.setAttribute("loading", "eager");
    prepareImage(b);
    expect(b.getAttribute("loading")).toBe("eager");
  });
  it("fades in after load and marks failures", () => {
    const a = document.createElement("img");
    Object.defineProperty(a, "complete", { value: false });
    prepareImage(a);
    expect(a.dataset["img"]).toBe("wait");
    a.dispatchEvent(new Event("error"));
    expect(a.dataset["img"]).toBe("off");
  });
});
