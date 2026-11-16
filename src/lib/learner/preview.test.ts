import { describe, expect, it } from "vitest";
import { events, isPreviewEvent, isPreviewResource, publishedEvents, publishedResources, resources } from "./catalog";

describe("live events and preview resources", () => {
  it("lists every catalogue event as a live event page", () => {
    expect(events.length).toBeGreaterThan(0);
    expect(publishedEvents).toHaveLength(events.length);
    expect(events.some(isPreviewEvent)).toBe(false);
  });
  it("has no live resources yet", () => expect(publishedResources).toHaveLength(0));
  it("treats every existing catalogue resource as a preview page", () => {
    expect(resources.length).toBeGreaterThan(0);
    expect(resources.every(isPreviewResource)).toBe(true);
  });
});
