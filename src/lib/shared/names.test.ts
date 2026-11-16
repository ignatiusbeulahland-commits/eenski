import { describe, expect, it } from "vitest";
import { certificateNameOf, cleanFullName, fullNameProblem } from "./names";

describe("full name field", () => {
  it("trims extra spaces", () => expect(cleanFullName("  Beulahland   Ignatius ")).toBe("Beulahland Ignatius"));
  it("rejects an empty or blank name", () => {
    expect(fullNameProblem("")).toBe("Enter your full name");
    expect(fullNameProblem("    ")).toBe("Enter your full name");
  });
  it("accepts many names, hyphens and international names", () => {
    for (const n of ["Beulahland Ignatius", "Chukwuemeka Oluwaseun Adeyemi-Okafor", "Seán O’Brien", "José María García", "李小龍", "Nguyễn Thị Minh Khai", "Mary-Jane K. Smith"]) {
      expect(fullNameProblem(n)).toBeNull();
    }
  });
  it("rejects digits and symbols", () => expect(fullNameProblem("Ada 123")).not.toBeNull());
});

describe("certificate display name", () => {
  it("uses the chosen certificate name", () => expect(certificateNameOf({ fullName: "Beulahland Ignatius", certificateName: "Beulahland I. Ignatius" })).toBe("Beulahland I. Ignatius"));
  it("falls back to the full account name", () => expect(certificateNameOf({ fullName: "Beulahland Ignatius", certificateName: " " })).toBe("Beulahland Ignatius"));
});
