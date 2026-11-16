import { describe, expect, it } from "vitest";
import { layoutOf, templateForLayout, templatesFor } from "@/lib/shared/certificate";
import { backTarget } from "@/lib/shared/back";

describe("certificate layouts", () => {
  it("portrait offers only the formal portrait template", () => {
    expect(templatesFor("portrait")).toEqual(["portrait"]);
  });
  it("landscape offers every other template", () => {
    expect(templatesFor("landscape")).toEqual(["classic", "midnight", "horizon", "minimal"]);
  });
  it("switching to portrait picks the portrait template", () => {
    expect(templateForLayout("midnight", "portrait")).toBe("portrait");
  });
  it("switching back to landscape restores the last landscape template", () => {
    expect(templateForLayout("portrait", "landscape", "horizon")).toBe("horizon");
  });
  it("switching back with no remembered template uses Classic", () => {
    expect(templateForLayout("portrait", "landscape")).toBe("classic");
  });
  it("keeps the current template when the layout already matches", () => {
    expect(templateForLayout("minimal", "landscape", "classic")).toBe("minimal");
    expect(layoutOf({ template: "portrait" })).toBe("portrait");
  });
});

describe("badge page back button", () => {
  it("returns to the Badges tab of Certificates / Badges", () => {
    const nav = new Map([["/learner/dashboard", "Overview"], ["/learner/certificates", "Certificates / Badges"]]);
    expect(backTarget("/learner/badges/first-lesson", nav, "/learner/dashboard", () => false)).toEqual({
      to: "/learner/certificates", label: "Back to Certificates / Badges", search: { tab: "badges" },
    });
  });
});
