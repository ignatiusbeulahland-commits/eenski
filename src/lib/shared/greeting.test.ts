import { describe, expect, it } from "vitest";
import { dashboardGreeting, greetName, partOfDay, signInWelcome } from "./greeting";

const at = (h: number) => new Date(2026, 10, 13, h, 30);

describe("personal greetings", () => {
  it("uses the local time of day", () => {
    expect(partOfDay(at(8))).toBe("morning");
    expect(partOfDay(at(13))).toBe("afternoon");
    expect(partOfDay(at(19))).toBe("evening");
    expect(partOfDay(at(2))).toBe("evening");
  });
  it("greets returning people by time of day and new people with a welcome", () => {
    expect(dashboardGreeting("Ada", "returning", at(14))).toBe("Good afternoon, Ada");
    expect(dashboardGreeting("Daniel", "returning", at(20))).toBe("Good evening, Daniel");
    expect(dashboardGreeting("Ada", "new", at(9))).toBe("Welcome to Enski, Ada");
  });
  it("prefers the display name over the full name", () => {
    expect(greetName("Beulah", "Beulahland Ignatius")).toBe("Beulah");
    expect(greetName("  ", "Beulahland Ignatius")).toBe("Beulahland");
  });
  it("says welcome back after sign-in for returning people", () => {
    expect(signInWelcome("Beulahland", "returning")).toBe("Welcome back, Beulahland!");
    expect(signInWelcome("Ada", "new")).toBe("Welcome to Enski, Ada!");
  });
});
