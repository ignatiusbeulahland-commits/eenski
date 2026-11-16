import { describe, expect, it } from "vitest";
import { team } from "@/components/about/Team";

describe("About page team", () => {
  it("lists Beulahland Ignatius as UI/UX Product Manager", () => {
    expect(team.find((m) => m.name === "Beulahland Ignatius")?.role).toBe("UI/UX Product Manager");
  });

  it("shows Beulahland Ignatius's own photo instead of initials", () => {
    expect(team.find((m) => m.name === "Beulahland Ignatius")?.photo).toBeDefined();
  });
});
