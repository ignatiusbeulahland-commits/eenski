import { describe, expect, it } from "vitest";

import {
  SPLASH_FADE_MS,
  SPLASH_MAX_MS,
  isNetworkError,
  isServerOutageStatus,
  retryDelay,
  splashHoldMs,
} from "@/lib/network/timing";

// The opening screen lasts one extra second: about 2 seconds, capped at 3 seconds.
describe("opening screen timing", () => {
  it("holds for one additional second when the page is ready early", () => {
    expect(splashHoldMs(300)).toBe(1700);
    expect(splashHoldMs(1400)).toBe(600);
  });
  it("lifts straight away when the page took longer than 2 seconds", () => {
    expect(splashHoldMs(2400)).toBe(0);
  });
  it("is fully gone by 3 seconds", () => {
    expect(SPLASH_MAX_MS).toBe(3000);
    for (const elapsed of [0, 500, 1999, 2500, 2900, 3500]) {
      expect(elapsed + splashHoldMs(elapsed) + SPLASH_FADE_MS).toBeLessThanOrEqual(Math.max(SPLASH_MAX_MS, elapsed + SPLASH_FADE_MS));
    }
  });
});

describe("automatic reconnect attempts", () => {
  it("wait longer each time, capped at 30 seconds", () => {
    expect(retryDelay(0)).toBe(3000);
    expect(retryDelay(1)).toBe(6000);
    expect(retryDelay(50)).toBe(30000);
  });
});

// Server trouble is told apart from the visitor's own connection.
describe("telling connection problems apart", () => {
  it("treats gateway errors as a server outage", () => {
    expect(isServerOutageStatus(503)).toBe(true);
    expect(isServerOutageStatus(404)).toBe(false);
  });
  it("recognises a request that never reached the server", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError(new Error("Not found"))).toBe(false);
  });
});
