import { describe, expect, it } from "vitest";
import { connectionCopy, loadErrorCopy, missingCopy } from "./statusCopy";

const all = [...Object.values(missingCopy), loadErrorCopy, connectionCopy.offline, connectionCopy.online]
  .flatMap((c) => Object.values(c) as string[]);

describe("status and connection wording", () => {
  it("never calls the app a demo, prototype, preview or simulation", () => {
    for (const line of all) expect(line).not.toMatch(/demo|prototype|preview|simulat|sample/i);
  });
  it("every missing state has an eyebrow, title and explanation", () => {
    for (const c of Object.values(missingCopy)) {
      expect(c.eyebrow.length).toBeGreaterThan(0);
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.body.length).toBeGreaterThan(20);
    }
  });
});
