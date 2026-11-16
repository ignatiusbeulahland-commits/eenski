import { describe, expect, it } from "vitest";
import { checkNameChange, displayNameProblem, resolveIdentity, splitName } from "./identity";

describe("names across Enski", () => {
  it("greets by display name when one is set", () => {
    expect(resolveIdentity({ fullName: "Beulahland Ignatius", displayName: "Beulah" }, "b@mail.com", "").greet).toBe("Beulah");
  });
  it("greets by the first word of the full name when no display name is set", () => {
    expect(resolveIdentity(undefined, "b@mail.com", "  Beulahland   Ignatius ").greet).toBe("Beulahland");
  });
  it("prints the full name on certificates unless a certificate name is chosen", () => {
    expect(resolveIdentity({ fullName: "Ada Okafor" }, "a@mail.com", "").printed).toBe("Ada Okafor");
    expect(resolveIdentity({ fullName: "Ada Okafor", certificateName: "Ada N. Okafor" }, "a@mail.com", "").printed).toBe("Ada N. Okafor");
  });
  it("rejects empty and whitespace-only names", () => {
    expect(checkNameChange("fullName", "   ")).toEqual({ error: "Enter your full name" });
    expect(displayNameProblem("   ")).toBe("Enter the name you'd like us to use");
  });
  it("trims extra spaces from names", () => {
    expect(checkNameChange("fullName", "  Ada   Okafor ")).toEqual({ value: "Ada Okafor" });
    expect(checkNameChange("displayName", " Ada ")).toEqual({ value: "Ada" });
  });
  it("lets the certificate name be cleared to fall back to the full name", () => {
    expect(checkNameChange("certificateName", "  ")).toEqual({ value: "" });
  });
  it("splits a full name for older first/last fields", () => {
    expect(splitName("Ada Nkem Okafor")).toEqual({ firstName: "Ada", lastName: "Nkem Okafor" });
  });
});
