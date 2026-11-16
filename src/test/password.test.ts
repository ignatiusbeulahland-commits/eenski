import { describe, expect, it } from "vitest";
import { isStrongPassword } from "@/components/site/auth/password";

describe("register password rules", () => {
  it("rejects a password shorter than 8 characters", () => {
    expect(isStrongPassword("ab1!xyz")).toBe(false);
  });

  it("rejects a password without a number", () => {
    expect(isStrongPassword("dreamers!go")).toBe(false);
  });

  it("rejects a password without a symbol", () => {
    expect(isStrongPassword("dreamers2026")).toBe(false);
  });

  it("accepts 8+ characters with a number and a symbol", () => {
    expect(isStrongPassword("dreamer#2026")).toBe(true);
  });
});
