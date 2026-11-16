import { describe, expect, it } from "vitest";
import { buildDeviceData, NAMES_KEY, ROLE_KEYS, SHOP_KEY } from "./data";
import { suspensionOf, type AdminState, DEFAULT_ADMIN_SETTINGS } from "./store";

const creator = { profile: { firstName: "Ada", lastName: "Okafor" }, verification: "submitted", items: [{ id: "i1", kind: "course", title: "Figma", price: 5000, status: "published", createdAt: "2026-11-10" }, { id: "i2", kind: "ebook", title: "Old", price: 0, status: "draft", createdAt: "2026-11-01", binnedAt: "2026-11-02" }], orders: [{ id: "o1", amount: 5000, date: "2026-11-11", status: "paid", currency: "NGN", itemTitle: "Figma" }], payouts: [{ id: "p1", amount: 2000, date: "2026-11-12", status: "simulated", currency: "NGN", last4: "4821" }] };

describe("admin device data", () => {
  it("shows nothing when the device has no saved accounts", () => {
    const d = buildDeviceData([]);
    expect(d.accounts).toEqual([]);
    expect(d.orders).toEqual([]);
  });
  it("finds each account once, with every role it signed in as", () => {
    const d = buildDeviceData([
      { key: `${ROLE_KEYS.creator}:ada@mail.com`, value: JSON.stringify(creator) },
      { key: `${ROLE_KEYS.learner}:ada@mail.com`, value: JSON.stringify({ profile: { fullName: "Ada Okafor" } }) },
      { key: NAMES_KEY, value: JSON.stringify({ "ada@mail.com": "Ada Okafor" }) },
    ]);
    expect(d.accounts).toHaveLength(1);
    expect(d.accounts[0]!.roles.sort()).toEqual(["creator", "learner"]);
  });
  it("lists someone who signed up but hasn't opened a dashboard yet", () => {
    const d = buildDeviceData([{ key: NAMES_KEY, value: JSON.stringify({ "Tobi@Mail.com": "Tobi Bello" }) }]);
    expect(d.accounts).toHaveLength(1);
    expect(d.accounts[0]).toMatchObject({ email: "tobi@mail.com", roles: [] });
  });
  it("leaves binned products out and maps older payouts to processing", () => {
    const d = buildDeviceData([{ key: `${ROLE_KEYS.creator}:ada@mail.com`, value: JSON.stringify(creator) }]);
    expect(d.products.map((p) => p.id)).toEqual(["i1"]);
    expect(d.payouts[0]!.status).toBe("processing");
  });
  it("lists checkout payments with their reference and status", () => {
    const d = buildDeviceData([{ key: SHOP_KEY, value: JSON.stringify({ payments: [{ reference: "ENS-ABC123", status: "failed", createdAt: "2026-11-12", totals: [{ currency: "NGN", total: 5000 }], items: [{ title: "ChatGPT" }] }] }) }]);
    expect(d.orders[0]).toMatchObject({ ref: "ENS-ABC123", status: "failed", amount: 5000 });
  });
  it("ignores broken saved data instead of failing", () => {
    expect(() => buildDeviceData([{ key: `${ROLE_KEYS.creator}:x@mail.com`, value: "{not json" }])).not.toThrow();
  });
});

describe("account suspension", () => {
  const state: AdminState = { suspended: { "ada@mail.com": { at: "2026-11-12", reason: "Fraud review", by: "Admin" } }, read: [], settings: DEFAULT_ADMIN_SETTINGS };
  it("matches the email whatever its case or spacing", () => {
    expect(suspensionOf(state, "  ADA@mail.com ")?.reason).toBe("Fraud review");
  });
  it("does not block other accounts", () => {
    expect(suspensionOf(state, "tobi@mail.com")).toBeNull();
  });
});
