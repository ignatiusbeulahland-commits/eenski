import { describe, expect, it } from "vitest";
import { applyTheme, THEME_KEY } from "@/lib/theme";

describe("light and dark mode", () => {
  it("shares the Enski website's saved choice and toggles the dark class", () => {
    expect(THEME_KEY).toBe("enski-theme");
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_KEY)).toBe("dark");
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_KEY)).toBe("light");
  });
});
