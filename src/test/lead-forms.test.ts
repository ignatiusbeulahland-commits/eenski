import { describe, expect, it } from "vitest";
import { validateLead } from "@/components/pricing/leadForms";

describe("waitlist form", () => {
  it("needs a name and a valid email", () => {
    const r = validateLead("waitlist", { name: " ", email: "ada@" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["email", "name"]);
  });

  it("accepts a name and email, trimming and lower-casing the email", () => {
    expect(validateLead("waitlist", { name: "Ada", email: " Ada@Enski.COM " })).toEqual({
      ok: true,
      data: { name: "Ada", email: "ada@enski.com" },
    });
  });
});

describe("contact form", () => {
  it("rejects a message shorter than 10 characters", () => {
    const r = validateLead("contact", { name: "Ada", email: "ada@enski.com", message: "hi" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.message).toBeDefined();
  });

  it("rejects a message over 1000 characters", () => {
    const r = validateLead("contact", { name: "Ada", email: "ada@enski.com", message: "a".repeat(1001) });
    expect(r.ok).toBe(false);
  });
});
