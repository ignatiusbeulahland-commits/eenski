import { beforeEach, describe, expect, it } from "vitest";

import { links } from "@/components/site/data";
import { ENSKI } from "@/lib/enski-links";
import { checkTrybeJoin, readTrybeMembers, saveTrybeJoin } from "@/lib/dreamers-trybe/join";

const base = { full_name: "Ada Obi", email: "Ada@Example.com ", whatsapp: "+234 801 234 5678", dream: "", goal: "Learn a new skill", consent: true };

describe("Dreamers Trybe", () => {
  beforeEach(() => window.localStorage.clear());

  it("every Join the Dreamers Trybe link opens the on-site /dreamers-trybe page", () => {
    expect(links.community).toBe("/dreamers-trybe");
    expect(links.dreamersTribe).toBe("/dreamers-trybe");
    expect(ENSKI.dreamersTribe).toBe("/dreamers-trybe");
  });

  it("needs a full name, a valid email and a WhatsApp number", () => {
    expect(checkTrybeJoin({ ...base, full_name: " " })).toEqual({ ok: false, error: "Please enter your full name" });
    expect(checkTrybeJoin({ ...base, email: "nope" })).toEqual({ ok: false, error: "Enter a valid email" });
    expect(checkTrybeJoin({ ...base, whatsapp: "12" })).toEqual({ ok: false, error: "Enter a valid WhatsApp number" });
  });

  it("saves on the device with the email lower-cased, and a repeat email updates instead of duplicating", async () => {
    const r = checkTrybeJoin(base);
    if (!r.ok) throw new Error("expected valid");
    expect((await saveTrybeJoin(r.values)).status).toBe("joined");
    expect((await saveTrybeJoin({ ...r.values, goal: "Start a business" })).status).toBe("updated");
    const all = readTrybeMembers();
    expect(all).toHaveLength(1);
    expect(all[0]?.email).toBe("ada@example.com");
    expect(all[0]?.goal).toBe("Start a business");
  });
});
