import { describe, it, expect } from "vitest";
import { CAST, MOVE_SLOTS, REACTIONS, reactionMove, worldUnlockLevel, visibleAccessories } from "@/lib/creator/universe/cast";
import { blendPose, sampleChannel, sampleMove, settle, ROOT_KEYS } from "@/lib/creator/universe/motion";
import { initialUniverse, reconcileUniverse, universeSchema, STYLES, type UniverseState } from "@/lib/creator/universe/rules";
import { customFor, showcase, achievedLevel, showcaseCardDetails } from "@/lib/creator/universe/showroom";

const families = STYLES.map((s) => s.id);
const withLevel = (lvl: number, patch: Partial<UniverseState> = {}): UniverseState => {
  const th = [1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
  return reconcileUniverse(initialUniverse, { demoEligibleEarningsUsd: lvl ? th[lvl - 1]! : 0, ...patch }, "2026-11-12T00:00:00Z");
};

describe("Creator Universe cast and moves", () => {
  it("gives every character all six moves", () => {
    for (const f of families) for (const slot of MOVE_SLOTS) expect(CAST[f].moves[slot].duration).toBeGreaterThan(0);
  });
  it("never reuses a signature move between characters", () => {
    const sigs = families.map((f) => CAST[f].moves.signature);
    expect(new Set(sigs.map((m) => m.name)).size).toBe(6);
    expect(new Set(sigs.map((m) => JSON.stringify({ root: m.root, bones: m.bones, clips: m.clips }))).size).toBe(6);
    const all = families.flatMap((f) => MOVE_SLOTS.map((s) => CAST[f].moves[s].id));
    expect(new Set(all).size).toBe(all.length);
  });
  it("never authors a move below the floor", () => {
    for (const f of families) for (const slot of MOVE_SLOTS) {
      const m = CAST[f].moves[slot];
      for (let t = 0; t <= m.duration; t += m.duration / 120) expect(sampleChannel(m.root?.y, t)).toBeGreaterThanOrEqual(0);
    }
  });
  it("ends one-shot moves where the idle can take over without snapping", () => {
    for (const f of families) for (const slot of MOVE_SLOTS) {
      const m = CAST[f].moves[slot];
      if (m.loop) continue;
      const end = settle(sampleMove(m, m.duration));
      expect(Math.abs(end.root.x)).toBeLessThan(0.05);
      expect(Math.abs(end.root.z)).toBeLessThan(0.05);
      expect(Math.abs(end.root.ry)).toBeLessThan(1);
      expect(Math.abs(end.root.rx)).toBeLessThan(1);
      expect(end.root.s).toBeCloseTo(1, 1);
    }
  });
  it("blends poses smoothly and unwinds full spins the short way", () => {
    const a = sampleMove(CAST.queen.moves.idle, 0);
    const b = sampleMove(CAST.queen.moves.signature, 3.6);
    for (const k of ROOT_KEYS) {
      expect(blendPose(a, b, 0).root[k]).toBeCloseTo(a.root[k]);
      expect(blendPose(a, b, 1).root[k]).toBeCloseTo(b.root[k]);
    }
    const spun = { ...a, root: { ...a.root, ry: 720 } };
    expect(settle(spun).root.ry).toBe(0);
  });
  it("softens spins, flips and jumps for reduced motion", () => {
    for (const f of families) {
      const m = CAST[f].moves.signature;
      for (let t = 0; t <= m.duration; t += 0.05) {
        const p = sampleMove(m, t, true);
        expect(p.root.rx).toBe(0);
        expect(Math.abs(p.root.ry)).toBeLessThanOrEqual(20);
        expect(p.root.y).toBeLessThanOrEqual(0.12);
      }
    }
  });
  it("offers all ten reactions, performed in each personality's style", () => {
    expect(REACTIONS.map((r) => r.id)).toEqual(["wave", "dance", "laugh", "wink", "bow", "flex", "celebrate", "confidence", "surprise", "signature"]);
    for (const f of families) for (const r of REACTIONS) expect(reactionMove(f, r.id).duration).toBeGreaterThan(0);
    expect(reactionMove("queen", "wave").duration).not.toBe(reactionMove("masked", "wave").duration);
    expect(reactionMove("queen", "bow").name).toBe("Curtsy");
    expect(reactionMove("king", "signature")).toBe(CAST.king.moves.signature);
  });
});

describe("Creator Universe unlocks", () => {
  it("opens the home world at Spark, other worlds at Illumina and Legend Hall at Legend", () => {
    expect(worldUnlockLevel("queen", "studio")).toBe(0);
    expect(worldUnlockLevel("queen", "palace")).toBe(1);
    expect(worldUnlockLevel("queen", "neon")).toBe(4);
    expect(worldUnlockLevel("masked", "legend")).toBe(9);
  });
  it("starts a new creator with no unlocked character, favourite or dashboard pick", () => {
    const u = withLevel(0);
    expect(achievedLevel(u)).toBe(0);
    expect(showcase(u)).toEqual({ level: 0, favourite: null, dashboard: null });
    expect(customFor(u, "queen")).toMatchObject({ outfit: "court", colourway: "sapphire", world: "studio" });
  });
  it("ignores saved choices that are not unlocked yet", () => {
    const u = withLevel(1, {
      showroom: { ...initialUniverse.showroom, favourite: { style: "king", level: 5 }, custom: { queen: { outfit: "sunrise", colourway: "legend", hidden: [], world: "legend" } } },
    });
    expect(showcase(u).favourite).toBeNull();
    expect(customFor(u, "queen")).toMatchObject({ outfit: "court", colourway: "sapphire", world: "palace" });
  });
  it("honours unlocked choices", () => {
    const u = withLevel(6, {
      showroom: { ...initialUniverse.showroom, favourite: { style: "king", level: 5 }, custom: { queen: { outfit: "sunrise", colourway: "gilded", hidden: ["cape"], world: "neon" } } },
    });
    expect(showcase(u).favourite).toEqual({ style: "king", level: 5 });
    expect(customFor(u, "queen")).toMatchObject({ outfit: "sunrise", colourway: "gilded", world: "neon" });
    expect(visibleAccessories("queen", 6, ["cape"]).map((a) => a.id)).toEqual(["sceptre", "crown"]);
  });
  it("swaps the crown for the Legend crown only at Legend", () => {
    expect(visibleAccessories("king", 8, []).map((a) => a.id)).toContain("crown");
    const legend = visibleAccessories("king", 9, []).map((a) => a.id);
    expect(legend).toContain("grand-crown");
    expect(legend).not.toContain("crown");
  });
  it("never changes earnings or achievements when customising", () => {
    const u = withLevel(3);
    const next = reconcileUniverse(u, { showroom: { ...u.showroom, reaction: "dance", autoRotate: false, collected: [1, 2, 3] } }, "2026-12-01T00:00:00Z");
    expect(next.achievements).toEqual(u.achievements);
    expect(next.demoEligibleEarningsUsd).toBe(u.demoEligibleEarningsUsd);
  });
  it("loads saved progress from before the showroom existed", () => {
    const { showroom: _omit, ...old } = initialUniverse;
    const parsed = universeSchema.parse(old);
    expect(parsed.showroom.autoRotate).toBe(true);
    expect(parsed.showroom.collected).toEqual([]);
  });
});

describe("Character showcase card", () => {
  const person = { firstName: "Ada", lastName: "Obi", handle: "@@adaobi" };
  it("prints the chosen character, its world, signature move and the creator's name", () => {
    const u = withLevel(3, { style: "king" });
    const d = showcaseCardDetails(u, person);
    expect(d.style).toBe("king");
    expect(d.preview).toBe(false);
    expect(d.rank).toBe("Level 3 · Visionary");
    expect(d.move.name).toBe(CAST.king.moves.signature.name);
    expect(d.world.name).toBe("Ember Field");
    expect(d.creatorName).toBe("Ada Obi");
    expect(d.handle).toBe("@adaobi");
  });
  it("uses the saved world when it is unlocked", () => {
    const u = withLevel(4, { style: "queen" });
    const saved = { ...u, showroom: { ...u.showroom, custom: { queen: { outfit: "court", colourway: "sapphire", hidden: [], world: "neon" } } } };
    expect(showcaseCardDetails(saved, person).world.name).toBe("Neon Night");
  });
  it("labels a card as a preview and claims no milestone before Spark is earned", () => {
    const d = showcaseCardDetails(withLevel(0, { style: "celestial" }), person);
    expect(d.preview).toBe(true);
    expect(d.rank).toBe("Starter preview · unlocks at Spark");
    expect(d.rank).not.toMatch(/Level/);
  });
  it("prefers the creator's own character alias over the family name", () => {
    expect(showcaseCardDetails(withLevel(1, { alias: "  Nova  " }), person).characterName).toBe("Nova");
  });
});
