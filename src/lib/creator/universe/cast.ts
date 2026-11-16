// The Creator Universe cast: per-family personality, worlds, looks, accessories and moves.
// Pure data so tests and the 3D stage share one source.
import type { CharacterStyle } from "./rules";
import type { Channel, MoveDef } from "./motion";

const K = (...pts: number[]): Channel => {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length; i += 2) out.push([pts[i]!, pts[i + 1]!]);
  return out;
};
const hold = (v: number, d: number): Channel => K(0, v, d, v);

export const MOVE_SLOTS = ["idle", "signature", "celebration", "victory", "reaction", "entrance"] as const;
export type MoveSlot = (typeof MOVE_SLOTS)[number];

export const WORLDS = [
  { id: "studio", name: "Enski Studio", mood: "Soft cobalt light and a floating stage." },
  { id: "palace", name: "Sapphire Palace", mood: "Marble halls, golden motes and a royal spotlight." },
  { id: "battlefield", name: "Ember Field", mood: "Drifting smoke, embers and dramatic rim light." },
  { id: "neon", name: "Neon Night", mood: "A city after dark with moving energy lines." },
  { id: "citadel", name: "Dawn Citadel", mood: "Standing stones, banners and morning sunbeams." },
  { id: "arena", name: "Holo Arena", mood: "Animated grids and floating interface panels." },
  { id: "cosmos", name: "Cosmic Drift", mood: "Stars, glowing dust and floating platforms." },
  { id: "legend", name: "Legend Hall", mood: "Gilded columns and a slow halo of light." },
] as const;
export type WorldId = (typeof WORLDS)[number]["id"];

export const BODIES = [
  "female-b", "female-c", "female-d", "female-e", "female-f",
  "male-a", "male-d", "male-e", "male-f", "male-g",
  "knight", "raider", "robot", "soldier", "alien",
] as const;
export type BodyId = (typeof BODIES)[number];

export const ACCESSORY_KINDS = [
  "crown", "grand-crown", "cape", "sceptre", "sword", "twin-blade", "mask", "hood", "visor",
  "spear", "shield", "crest", "halo", "wings", "drones", "ribbons", "stars", "aura", "circlet",
] as const;
export type AccessoryKind = (typeof ACCESSORY_KINDS)[number];
export type Accessory = { id: AccessoryKind; label: string; unlockLevel: number };
export type Outfit = { id: string; label: string; body: BodyId; unlockLevel: number };

export const COLOURWAYS = [
  { id: "sapphire", label: "Sapphire", primary: "#1A42A6", metal: "#E4C77A", glow: "#7CC2F7", unlockLevel: 0 },
  { id: "sky", label: "Sky", primary: "#3D8EF0", metal: "#D3D9EA", glow: "#B9D8FB", unlockLevel: 0 },
  { id: "midnight", label: "Midnight lime", primary: "#0A1F55", metal: "#C2F24A", glow: "#C2F24A", unlockLevel: 2 },
  { id: "gilded", label: "Gilded", primary: "#E4C77A", metal: "#F4F7FC", glow: "#FFE7A8", unlockLevel: 5 },
  { id: "legend", label: "Legend prism", primary: "#F4F7FC", metal: "#E4C77A", glow: "#3D8EF0", unlockLevel: 9 },
] as const;
export type ColourwayId = (typeof COLOURWAYS)[number]["id"];

export type CastMember = {
  style: CharacterStyle;
  name: string;
  personality: string;
  world: WorldId;
  fx: { primary: string; secondary: string };
  outfits: readonly Outfit[];
  accessories: readonly Accessory[];
  /** How shared reactions are performed by this personality. */
  flavour: { tempo: number; amp: number; float: number };
  moves: Record<MoveSlot, MoveDef>;
};

// Arm convention (degrees): right arm z +70 hangs down, z -75 overhead, y +80 forward.
// Left arm mirrors z and y. Torso/head x + leans forward / looks down.
const queen: CastMember = {
  style: "queen",
  name: "The Sovereign",
  personality: "Poised, graceful and quietly commanding. Every step is a statement.",
  world: "palace",
  fx: { primary: "#E4C77A", secondary: "#B9D8FB" },
  flavour: { tempo: 1.15, amp: 0.8, float: 0 },
  outfits: [
    { id: "court", label: "Sapphire court", body: "female-d", unlockLevel: 0 },
    { id: "gala", label: "Gala night", body: "female-f", unlockLevel: 2 },
    { id: "sunrise", label: "Sunrise silk", body: "female-b", unlockLevel: 6 },
  ],
  accessories: [
    { id: "cape", label: "Royal cape", unlockLevel: 0 },
    { id: "sceptre", label: "Sceptre", unlockLevel: 1 },
    { id: "crown", label: "Crown", unlockLevel: 3 },
    { id: "ribbons", label: "Floating ribbons", unlockLevel: 7 },
    { id: "grand-crown", label: "Legend crown", unlockLevel: 9 },
  ],
  moves: {
    idle: {
      id: "queen-idle", name: "Poised", description: "A slow weight shift with a hand on the hip.",
      duration: 4, loop: true, clips: [[0, "idle", 0.8]],
      root: { x: K(0, 0, 2, 0.03, 4, 0) },
      bones: { "arm-left": { z: hold(-62, 4), y: hold(25, 4) }, "arm-right": { z: K(0, 60, 2, 56, 4, 60), y: hold(30, 4) }, head: { z: K(0, 0, 2, 6, 4, 0) } },
    },
    signature: {
      id: "queen-signature", name: "Royal promenade",
      description: "An elegant catwalk, a graceful turn and a sceptre raised to the light.",
      duration: 6.4, clips: [[0, "walk", 0.7], [2.3, "idle", 1], [4.9, "walk", 0.5], [6.1, "idle", 1]],
      root: { z: K(0, 0, 2.3, 0.75, 4.9, 0.75, 6.2, 0), ry: K(2.3, 0, 3.5, 360), x: K(0, 0, 1.15, 0.05, 2.3, 0) },
      bones: {
        "arm-right": { z: K(2.3, 55, 2.8, 10, 3.5, 30, 3.9, -78, 4.9, -78, 5.6, 55), y: K(2.3, 35, 3.9, 10, 5.6, 35) },
        "arm-left": { z: K(2.3, -62, 2.9, -5, 3.5, -62), y: hold(25, 6.4) },
        head: { x: K(0, 0, 3.9, -12, 4.9, -12, 5.8, 0) },
      },
      fx: [{ t: 2.35, fx: "sparkle", dur: 1.2 }, { t: 3.9, fx: "burst", at: "hand" }, { t: 3.95, fx: "ring", at: "feet" }, { t: 2.3, fx: "trail", dur: 1.3 }],
      shots: [{ t: 0, shot: "low" }, { t: 2.3, shot: "orbit" }, { t: 3.8, shot: "close" }, { t: 4.9, shot: "hero" }],
    },
    celebration: {
      id: "queen-celebration", name: "Crown twirl", description: "A light hop and a full twirl in golden confetti.",
      duration: 2.8, clips: [[0, "idle", 1], [0.5, "jump", 1], [1.4, "idle", 1]],
      root: { y: K(0, 0, 0.5, 0, 0.9, 0.35, 1.35, 0), ry: K(0.5, 0, 1.5, 360) },
      bones: { "arm-right": { z: K(0, 55, 0.6, -60, 2, -60, 2.6, 55) }, "arm-left": { z: K(0, -55, 0.6, 60, 2, 60, 2.6, -55) } },
      fx: [{ t: 0.9, fx: "confetti" }, { t: 1.35, fx: "ring", at: "feet" }],
      shots: [{ t: 0, shot: "hero" }],
    },
    victory: {
      id: "queen-victory", name: "Regal pose", description: "Sceptre high, chin lifted, perfectly still.",
      duration: 3.2, clips: [[0, "idle", 0.5]],
      bones: { "arm-right": { z: hold(-78, 3.2), y: hold(10, 3.2) }, "arm-left": { z: hold(-62, 3.2), y: hold(25, 3.2) }, head: { x: hold(-12, 3.2) } },
      fx: [{ t: 0.3, fx: "sparkle", dur: 2 }],
      shots: [{ t: 0, shot: "low" }],
    },
    reaction: {
      id: "queen-reaction", name: "Graceful gasp", description: "A hand to the heart and a light step back.",
      duration: 1.7, clips: [[0, "idle", 1]],
      root: { z: K(0, 0, 0.3, -0.14, 1.7, 0) },
      bones: { "arm-right": { y: hold(85, 1.7), z: hold(35, 1.7), x: hold(-15, 1.7) }, head: { x: K(0, 0, 0.3, -14, 1.7, 0) } },
      fx: [{ t: 0.3, fx: "sparkle", dur: 0.8, at: "head" }],
    },
    entrance: {
      id: "queen-entrance", name: "Descending grace", description: "She floats down in a slow half-turn onto a ring of light.",
      duration: 3, clips: [[0, "fall", 0.6], [2.2, "idle", 1]],
      root: { y: K(0, 1.6, 2.2, 0), ry: K(0, -180, 2.2, 0) },
      bones: { "arm-right": { z: K(0, 10, 2.4, 55) }, "arm-left": { z: K(0, -10, 2.4, -55) } },
      fx: [{ t: 0.05, fx: "sparkle", dur: 2 }, { t: 2.2, fx: "ring", at: "feet" }, { t: 2.2, fx: "burst", at: "feet" }],
      shots: [{ t: 0, shot: "wide" }, { t: 2, shot: "hero" }],
    },
  },
};

const king: CastMember = {
  style: "king",
  name: "The Monarch",
  personality: "Grounded, powerful and protective. Moves with weight and purpose.",
  world: "battlefield",
  fx: { primary: "#FFB45C", secondary: "#E4C77A" },
  flavour: { tempo: 1, amp: 1.1, float: 0 },
  outfits: [
    { id: "regalia", label: "Regalia", body: "male-d", unlockLevel: 0 },
    { id: "field", label: "Field commander", body: "male-a", unlockLevel: 2 },
    { id: "evergreen", label: "Evergreen", body: "male-f", unlockLevel: 6 },
  ],
  accessories: [
    { id: "sword", label: "Sovereign blade", unlockLevel: 0 },
    { id: "cape", label: "War cape", unlockLevel: 1 },
    { id: "crown", label: "Iron crown", unlockLevel: 3 },
    { id: "aura", label: "Ember aura", unlockLevel: 7 },
    { id: "grand-crown", label: "Titan crown", unlockLevel: 9 },
  ],
  moves: {
    idle: {
      id: "king-idle", name: "Steady watch", description: "Blade at rest, slow breathing, eyes on the horizon.",
      duration: 3.2, loop: true, clips: [[0, "holding-right", 1]],
      root: { s: K(0, 1, 1.6, 1.012, 3.2, 1) },
      bones: { head: { y: K(0, -10, 1.6, 10, 3.2, -10) } },
    },
    signature: {
      id: "king-signature", name: "Sovereign strike",
      description: "A heavy slash, a spinning blade, a leap and a ground-shaking landing.",
      duration: 5.8, clips: [[0, "crouch", 1], [0.6, "attack-melee-right", 1.1], [1.1, "holding-right", 1], [2.4, "jump", 1], [3.3, "crouch", 1.2], [3.8, "holding-right", 1]],
      root: { ry: K(1.1, 0, 2.3, 360), y: K(2.4, 0, 2.9, 0.75, 3.3, 0), z: K(2.4, 0, 3.3, 0.25, 5.4, 0) },
      bones: {
        "arm-right": { z: K(1.1, 45, 1.3, -75, 2.2, -75, 2.4, 20, 3.3, 60, 5.8, 60), y: K(2.3, 0, 3.3, 80, 5.8, 80), w: K(0, 0, 1.0, 0, 1.2, 1) },
        torso: { x: K(0, 0, 0.5, 18, 0.7, 0, 3.6, -8, 5.8, -8) },
      },
      prop: { spin: K(1.2, 0, 2.3, 720) },
      fx: [{ t: 0.55, fx: "trail", dur: 1.9 }, { t: 1.2, fx: "ring", at: "body" }, { t: 3.3, fx: "dust", at: "feet" }, { t: 3.3, fx: "shake", power: 1 }, { t: 3.3, fx: "ring", at: "feet" }, { t: 3.35, fx: "burst", at: "feet" }],
      shots: [{ t: 0, shot: "hero" }, { t: 1.1, shot: "orbit" }, { t: 2.4, shot: "low" }, { t: 3.3, shot: "wide" }, { t: 4, shot: "close" }],
    },
    celebration: {
      id: "king-celebration", name: "Victory roar", description: "Both fists raised, a stomp and a shower of embers.",
      duration: 2.6, clips: [[0, "emote-yes", 1.2], [0.7, "jump", 1], [1.3, "emote-yes", 1]],
      root: { y: K(0.7, 0, 1, 0.45, 1.3, 0) },
      bones: { "arm-right": { z: K(0, 45, 0.5, -70, 2.1, -70, 2.6, 45) }, "arm-left": { z: K(0, -45, 0.5, 70, 2.1, 70, 2.6, -45) } },
      fx: [{ t: 1.3, fx: "dust", at: "feet" }, { t: 1.3, fx: "burst", at: "body" }, { t: 1.3, fx: "shake", power: 0.4 }],
    },
    victory: {
      id: "king-victory", name: "Planted blade", description: "Sword planted before him, chest forward.",
      duration: 3.2, clips: [[0, "idle", 0.5]],
      bones: { "arm-right": { y: hold(80, 3.2), z: hold(60, 3.2) }, torso: { x: hold(-8, 3.2) }, head: { x: hold(-6, 3.2) } },
      fx: [{ t: 0.2, fx: "burst", at: "hand" }],
      shots: [{ t: 0, shot: "low" }],
    },
    reaction: {
      id: "king-reaction", name: "Shield brace", description: "A step back with arms braced forward.",
      duration: 1.4, clips: [[0, "idle", 1]],
      root: { z: K(0, 0, 0.25, -0.16, 1.4, 0) },
      bones: { "arm-right": { y: hold(80, 1.4), z: hold(15, 1.4) }, "arm-left": { y: hold(-80, 1.4), z: hold(-15, 1.4) }, torso: { x: hold(14, 1.4) } },
      fx: [{ t: 0.25, fx: "dust", at: "feet" }],
    },
    entrance: {
      id: "king-entrance", name: "Battle drop", description: "He drops from the sky and lands in a crouch.",
      duration: 2.4, clips: [[0, "fall", 1], [0.9, "crouch", 1], [1.6, "holding-right", 1]],
      root: { y: K(0, 2.2, 0.9, 0) },
      fx: [{ t: 0.9, fx: "dust", at: "feet" }, { t: 0.9, fx: "shake", power: 1 }, { t: 0.9, fx: "ring", at: "feet" }],
      shots: [{ t: 0, shot: "wide" }, { t: 0.9, shot: "low" }],
    },
  },
};

const masked: CastMember = {
  style: "masked",
  name: "The Enigma",
  personality: "Quick, quiet and impossible to predict. Lets the moves speak.",
  world: "neon",
  fx: { primary: "#C2F24A", secondary: "#3D8EF0" },
  flavour: { tempo: 0.8, amp: 1, float: 0 },
  outfits: [
    { id: "shadow", label: "Shadow weave", body: "raider", unlockLevel: 0 },
    { id: "rogue", label: "Rogue", body: "male-g", unlockLevel: 2 },
    { id: "ghost", label: "Ghost white", body: "female-e", unlockLevel: 6 },
  ],
  accessories: [
    { id: "mask", label: "Enigma mask", unlockLevel: 0 },
    { id: "sword", label: "Short blade", unlockLevel: 1 },
    { id: "hood", label: "Shadow cowl", unlockLevel: 3 },
    { id: "twin-blade", label: "Twin blade", unlockLevel: 5 },
    { id: "aura", label: "Energy trails", unlockLevel: 7 },
    { id: "wings", label: "Shadow wings", unlockLevel: 9 },
  ],
  moves: {
    idle: {
      id: "masked-idle", name: "Ready stance", description: "Low and coiled, scanning the room.",
      duration: 3, loop: true, clips: [[0, "crouch", 0.5]],
      bones: { head: { y: K(0, -22, 1.5, 22, 3, -22) }, "arm-right": { y: hold(45, 3), z: hold(50, 3) } },
    },
    signature: {
      id: "masked-signature", name: "Shadow flip",
      description: "A coiled crouch, a full backflip, a dash and a dramatic slash.",
      duration: 4.8, clips: [[0, "crouch", 1], [0.4, "jump", 1], [1.3, "crouch", 1.4], [1.9, "attack-melee-left", 1.3], [2.5, "attack-melee-right", 1.3], [3, "walk", 0.8], [4.4, "idle", 1]],
      root: { y: K(0, 0, 0.4, 0, 0.85, 0.9, 1.3, 0), rx: K(0.4, 0, 1.3, -360), z: K(0.4, 0, 1.3, -0.45, 1.9, -0.45, 2.25, 0.5, 3, 0.5, 4.4, 0) },
      fx: [{ t: 0.4, fx: "trail", dur: 1 }, { t: 1.3, fx: "dust", at: "feet" }, { t: 1.9, fx: "streaks", dur: 0.6 }, { t: 1.9, fx: "trail", dur: 1 }, { t: 2.6, fx: "flash" }, { t: 2.6, fx: "shake", power: 0.5 }, { t: 2.62, fx: "burst", at: "hand" }],
      shots: [{ t: 0, shot: "side" }, { t: 0.4, shot: "low" }, { t: 1.9, shot: "hero" }, { t: 2.6, shot: "close" }, { t: 3.4, shot: "wide" }],
    },
    celebration: {
      id: "masked-celebration", name: "Smoke vanish", description: "Gone in a puff of smoke, back with a spin.",
      duration: 2.4, clips: [[0, "idle", 1]],
      root: { s: K(0, 1, 0.4, 0.05, 1.3, 0.05, 1.7, 1.08, 2, 1), ry: K(1.3, 0, 1.9, 360) },
      fx: [{ t: 0.25, fx: "smoke" }, { t: 1.4, fx: "smoke" }, { t: 1.7, fx: "sparkle", dur: 0.6 }],
    },
    victory: {
      id: "masked-victory", name: "Silent salute", description: "Two fingers to the mask, then stillness.",
      duration: 3, clips: [[0, "idle", 0.4]],
      bones: { "arm-right": { z: hold(-35, 3), y: hold(70, 3) }, head: { x: hold(6, 3) } },
      fx: [{ t: 0.3, fx: "glow", dur: 1.4 }],
    },
    reaction: {
      id: "masked-reaction", name: "Sidestep", description: "A blink-fast dodge to the side and back.",
      duration: 1.2, clips: [[0, "idle", 1]],
      root: { x: K(0, 0, 0.22, 0.45, 0.7, 0.45, 1.2, 0), rz: K(0, 0, 0.22, -12, 0.7, -4, 1.2, 0) },
      fx: [{ t: 0.05, fx: "streaks", dur: 0.4 }],
    },
    entrance: {
      id: "masked-entrance", name: "Out of the shadows", description: "Smoke parts and they flip down into a crouch.",
      duration: 2.6, clips: [[0, "jump", 1], [1, "crouch", 1], [1.8, "crouch", 0.5]],
      root: { s: K(0, 0.2, 0.3, 1), y: K(0, 1, 1, 0), rx: K(0, -360, 1, 0) },
      fx: [{ t: 0, fx: "smoke" }, { t: 1, fx: "dust", at: "feet" }, { t: 1.05, fx: "burst", at: "feet" }],
      shots: [{ t: 0, shot: "side" }, { t: 1, shot: "hero" }],
    },
  },
};

const warrior: CastMember = {
  style: "warrior",
  name: "The Vanguard",
  personality: "Fearless and loyal. Always the first one in.",
  world: "citadel",
  fx: { primary: "#7CC2F7", secondary: "#F4F7FC" },
  flavour: { tempo: 0.9, amp: 1.2, float: 0 },
  outfits: [
    { id: "guardian", label: "Guardian plate", body: "knight", unlockLevel: 0 },
    { id: "ranger", label: "Ranger", body: "soldier", unlockLevel: 2 },
    { id: "swift", label: "Swift", body: "female-c", unlockLevel: 6 },
  ],
  accessories: [
    { id: "spear", label: "Guardian spear", unlockLevel: 0 },
    { id: "shield", label: "Shield", unlockLevel: 1 },
    { id: "crest", label: "Helm crest", unlockLevel: 3 },
    { id: "aura", label: "Valour aura", unlockLevel: 7 },
    { id: "wings", label: "Legend wings", unlockLevel: 9 },
  ],
  moves: {
    idle: {
      id: "warrior-idle", name: "Shield up", description: "Bouncing on the toes, shield raised.",
      duration: 2.4, loop: true, clips: [[0, "holding-both", 1]],
      root: { y: K(0, 0, 0.6, 0.035, 1.2, 0, 1.8, 0.035, 2.4, 0) },
      bones: { "arm-left": { y: hold(-75, 2.4), z: hold(-10, 2.4) } },
    },
    signature: {
      id: "warrior-signature", name: "Guardian's oath",
      description: "Spins the spear overhead, plants it with a shockwave and strikes a heroic pose.",
      duration: 5.8, clips: [[0, "crouch", 1], [0.5, "holding-right", 1], [2.5, "jump", 1], [3.25, "crouch", 1.2], [3.7, "idle", 0.6]],
      root: { y: K(2.5, 0, 2.9, 0.55, 3.25, 0), ry: K(0.6, 0, 2.3, -360) },
      bones: {
        "arm-right": { z: K(0, 45, 0.6, -80, 2.3, -80, 2.6, -40, 3.25, 70, 5.8, 70), y: K(2.5, 0, 3.25, 80, 5.8, 80) },
        "arm-left": { y: K(3.4, -40, 4, -70, 5.8, -70), z: K(3.4, -40, 4, 10, 5.8, 10) },
        torso: { x: K(0, 0, 0.45, 15, 0.6, 0, 3.6, -6, 5.8, -6) },
        head: { x: K(3.6, 0, 4.1, -10, 5.8, -10) },
      },
      prop: { spin: K(0.6, 0, 2.3, 1080) },
      fx: [{ t: 0.6, fx: "trail", dur: 1.8 }, { t: 3.25, fx: "dust", at: "feet" }, { t: 3.25, fx: "ring", at: "feet" }, { t: 3.25, fx: "shake", power: 0.8 }, { t: 3.4, fx: "burst", at: "body" }],
      shots: [{ t: 0, shot: "hero" }, { t: 0.6, shot: "low" }, { t: 2.5, shot: "wide" }, { t: 3.3, shot: "close" }, { t: 4.1, shot: "hero" }],
    },
    celebration: {
      id: "warrior-celebration", name: "War cry leap", description: "A leap with spear raised and a dusty landing.",
      duration: 2.4, clips: [[0, "idle", 1], [0.5, "jump", 1], [1.2, "idle", 1]],
      root: { y: K(0.5, 0, 0.85, 0.55, 1.2, 0) },
      bones: { "arm-right": { z: K(0, 45, 0.45, -80, 1.8, -80, 2.4, 45) } },
      fx: [{ t: 1.2, fx: "dust", at: "feet" }, { t: 0.85, fx: "confetti" }],
    },
    victory: {
      id: "warrior-victory", name: "Heroic stand", description: "Spear upright, shield forward, ready for anything.",
      duration: 3, clips: [[0, "idle", 0.5]],
      bones: { "arm-left": { y: hold(-70, 3), z: hold(10, 3) }, head: { x: hold(-10, 3) }, torso: { x: hold(-6, 3) } },
      fx: [{ t: 0.2, fx: "sparkle", dur: 1.6 }],
      shots: [{ t: 0, shot: "low" }],
    },
    reaction: {
      id: "warrior-reaction", name: "Kick counter", description: "A quick defensive kick.",
      duration: 1.2, clips: [[0, "attack-kick-right", 1]],
      fx: [{ t: 0.4, fx: "dust", at: "feet" }],
    },
    entrance: {
      id: "warrior-entrance", name: "Charge in", description: "Sprints in from the distance and skids to a stop.",
      duration: 2.4, clips: [[0, "sprint", 1.3], [1.4, "crouch", 1], [1.9, "holding-both", 1]],
      root: { z: K(0, -2.6, 1.4, 0.12, 1.9, 0) },
      fx: [{ t: 0.2, fx: "dust", at: "feet" }, { t: 1.4, fx: "dust", at: "feet" }],
      shots: [{ t: 0, shot: "wide" }, { t: 1.4, shot: "hero" }],
    },
  },
};

const futuristic: CastMember = {
  style: "futuristic",
  name: "The Inventor",
  personality: "Curious, inventive and a little bit extra. Always testing something new.",
  world: "arena",
  fx: { primary: "#3D8EF0", secondary: "#C2F24A" },
  flavour: { tempo: 0.9, amp: 0.9, float: 0.08 },
  outfits: [
    { id: "prototype", label: "Lab suit", body: "male-e", unlockLevel: 0 },
    { id: "mech", label: "Mech shell", body: "robot", unlockLevel: 2 },
    { id: "visitor", label: "Visitor", body: "alien", unlockLevel: 6 },
  ],
  accessories: [
    { id: "visor", label: "Holo visor", unlockLevel: 0 },
    { id: "halo", label: "Orbit ring", unlockLevel: 3 },
    { id: "drones", label: "Helper drones", unlockLevel: 5 },
    { id: "aura", label: "Data aura", unlockLevel: 7 },
    { id: "wings", label: "Light wings", unlockLevel: 9 },
  ],
  moves: {
    idle: {
      id: "futuristic-idle", name: "Hover calibrate", description: "A gentle hover with small calibrating tilts.",
      duration: 3, loop: true, clips: [[0, "idle", 0.7]],
      root: { y: K(0, 0.06, 1.5, 0.13, 3, 0.06) },
      bones: { head: { z: K(0, -5, 1.5, 5, 3, -5) } },
    },
    signature: {
      id: "futuristic-signature", name: "Hologram reboot",
      description: "Glitches into a hologram, spins up in pure energy and bursts back into form.",
      duration: 5.2, clips: [[0, "emote-no", 1.5], [1.6, "static", 1], [4.2, "idle", 1]],
      root: { s: K(0.6, 1, 0.7, 0.93, 0.8, 1.05, 0.9, 0.97, 1.0, 1), y: K(0, 0.06, 1.6, 0.1, 2.4, 0.75, 3.4, 0.75, 4.2, 0.08), ry: K(1.6, 0, 3.2, 720) },
      bones: {
        "arm-right": { z: K(1.6, 40, 2.2, -5, 3.4, -5, 4.2, 15, 5.2, 15), y: K(4, 0, 4.4, 80, 5.2, 80) },
        "arm-left": { z: K(1.6, -40, 2.2, 5, 3.4, 5, 4.2, -40) },
      },
      fx: [{ t: 0, fx: "holo", dur: 1.6 }, { t: 1.6, fx: "glow", dur: 1.9 }, { t: 3.2, fx: "burst", at: "body" }, { t: 3.2, fx: "ring", at: "body" }, { t: 3.2, fx: "streaks", dur: 0.8 }, { t: 3.2, fx: "shake", power: 0.4 }],
      shots: [{ t: 0, shot: "orbit" }, { t: 1.6, shot: "close" }, { t: 2.4, shot: "low" }, { t: 3.2, shot: "wide" }, { t: 4.2, shot: "hero" }],
    },
    celebration: {
      id: "futuristic-celebration", name: "Pixel fireworks", description: "A jump and a burst of pixel confetti.",
      duration: 2.4, clips: [[0, "idle", 1], [0.4, "jump", 1], [1.1, "idle", 1]],
      root: { y: K(0, 0.06, 0.4, 0.06, 0.75, 0.6, 1.1, 0.06) },
      bones: { "arm-right": { z: K(0, 40, 0.4, -70, 1.8, -70, 2.4, 40) }, "arm-left": { z: K(0, -40, 0.4, 70, 1.8, 70, 2.4, -40) } },
      fx: [{ t: 0.75, fx: "confetti" }, { t: 0.8, fx: "burst", at: "head" }],
    },
    victory: {
      id: "futuristic-victory", name: "Inventor's point", description: "Points forward as a holo ring locks on.",
      duration: 3, clips: [[0, "idle", 0.5]],
      root: { y: hold(0.1, 3) },
      bones: { "arm-right": { y: hold(80, 3), z: hold(5, 3), x: hold(-8, 3) }, "arm-left": { z: hold(-55, 3), y: hold(-35, 3) } },
      fx: [{ t: 0.2, fx: "ring", at: "hand" }],
    },
    reaction: {
      id: "futuristic-reaction", name: "System surprise", description: "A startled shake and a quick glitch.",
      duration: 1.4, clips: [[0, "emote-no", 1.4]],
      root: { y: hold(0.06, 1.4), s: K(0.2, 1, 0.3, 0.95, 0.4, 1.04, 0.5, 1) },
      fx: [{ t: 0.2, fx: "holo", dur: 0.6 }],
    },
    entrance: {
      id: "futuristic-entrance", name: "Teleport in", description: "Beams down in a column of light and reassembles.",
      duration: 2.4, clips: [[0, "static", 1], [1.2, "idle", 1]],
      root: { s: K(0, 0.02, 0.25, 0.02, 1.2, 1), y: hold(0.06, 2.4) },
      fx: [{ t: 0, fx: "holo", dur: 1.4 }, { t: 1.2, fx: "burst", at: "body" }],
      shots: [{ t: 0, shot: "orbit" }, { t: 1.2, shot: "hero" }],
    },
  },
};

const celestial: CastMember = {
  style: "celestial",
  name: "The Luminary",
  personality: "Calm, luminous and kind. Seems to float above every room.",
  world: "cosmos",
  fx: { primary: "#B9D8FB", secondary: "#E4C77A" },
  flavour: { tempo: 1.25, amp: 0.75, float: 0.2 },
  outfits: [
    { id: "dawn", label: "Dawn robe", body: "female-b", unlockLevel: 0 },
    { id: "dusk", label: "Dusk veil", body: "female-f", unlockLevel: 2 },
    { id: "zenith", label: "Zenith", body: "male-a", unlockLevel: 6 },
  ],
  accessories: [
    { id: "halo", label: "Halo", unlockLevel: 0 },
    { id: "wings", label: "Feather wings", unlockLevel: 3 },
    { id: "circlet", label: "Star circlet", unlockLevel: 5 },
    { id: "stars", label: "Orbiting stars", unlockLevel: 7 },
    { id: "aura", label: "Radiance", unlockLevel: 9 },
  ],
  moves: {
    idle: {
      id: "celestial-idle", name: "Drift", description: "Floats softly with arms open.",
      duration: 4, loop: true, clips: [[0, "idle", 0.6]],
      root: { y: K(0, 0.18, 2, 0.3, 4, 0.18) },
      bones: { "arm-right": { z: K(0, 25, 2, 15, 4, 25) }, "arm-left": { z: K(0, -25, 2, -15, 4, -25) } },
    },
    signature: {
      id: "celestial-signature", name: "Ascension",
      description: "Rises, unfurls glowing wings, spins through the air and descends in starlight.",
      duration: 6, clips: [[0, "idle", 0.6], [0.6, "static", 1], [4.4, "idle", 0.6]],
      root: { y: K(0, 0.18, 0.6, 0.18, 2.2, 1.0, 3.8, 1.0, 5.6, 0.2), ry: K(2.2, 0, 3.8, 720) },
      bones: {
        "arm-right": { y: K(0, 0, 0.5, 60, 1.4, 60, 2, 0), z: K(0, 25, 0.5, 40, 1.4, 40, 2.2, -45, 3.8, -45, 5, 20) },
        "arm-left": { y: K(0, 0, 0.5, -60, 1.4, -60, 2, 0), z: K(0, -25, 0.5, -40, 1.4, -40, 2.2, 45, 3.8, 45, 5, -20) },
        head: { x: K(1.4, 0, 2.2, -15, 3.8, -15, 4.6, 0) },
      },
      fx: [{ t: 0.8, fx: "wings", dur: 4.4 }, { t: 1.4, fx: "glow", dur: 3 }, { t: 2.2, fx: "sparkle", dur: 1.6 }, { t: 3.8, fx: "burst", at: "body" }, { t: 3.8, fx: "ring", at: "body" }, { t: 4.4, fx: "trail", dur: 1.2 }],
      shots: [{ t: 0, shot: "low" }, { t: 1, shot: "orbit" }, { t: 2.2, shot: "top" }, { t: 3.8, shot: "close" }, { t: 4.6, shot: "hero" }],
    },
    celebration: {
      id: "celestial-celebration", name: "Starfall", description: "A slow spin under falling stars.",
      duration: 2.8, clips: [[0, "idle", 0.8]],
      root: { y: K(0, 0.18, 0.8, 0.45, 2.2, 0.45, 2.8, 0.18), ry: K(0.6, 0, 2.2, 360) },
      bones: { "arm-right": { z: K(0, 25, 0.6, -50, 2.2, -50, 2.8, 25) }, "arm-left": { z: K(0, -25, 0.6, 50, 2.2, 50, 2.8, -25) } },
      fx: [{ t: 0.6, fx: "confetti" }, { t: 1.4, fx: "sparkle", dur: 1.2 }],
    },
    victory: {
      id: "celestial-victory", name: "Radiant bloom", description: "Arms open to the sky, glowing softly.",
      duration: 3.2, clips: [[0, "static", 1]],
      root: { y: hold(0.32, 3.2) },
      bones: { "arm-right": { z: hold(-45, 3.2) }, "arm-left": { z: hold(45, 3.2) }, head: { x: hold(-15, 3.2) } },
      fx: [{ t: 0.2, fx: "glow", dur: 2.6 }, { t: 0.2, fx: "wings", dur: 2.8 }],
      shots: [{ t: 0, shot: "low" }],
    },
    reaction: {
      id: "celestial-reaction", name: "Startle shimmer", description: "Floats back with a shimmer of light.",
      duration: 1.5, clips: [[0, "idle", 1]],
      root: { y: K(0, 0.18, 0.3, 0.35, 1.5, 0.18), z: K(0, 0, 0.3, -0.18, 1.5, 0) },
      bones: { "arm-right": { y: hold(70, 1.5), z: hold(45, 1.5) }, "arm-left": { y: hold(-70, 1.5), z: hold(-45, 1.5) } },
      fx: [{ t: 0.3, fx: "sparkle", dur: 0.9 }],
    },
    entrance: {
      id: "celestial-entrance", name: "Comet arrival", description: "Arrives like a comet and settles into a float.",
      duration: 3, clips: [[0, "static", 1], [2, "idle", 0.6]],
      root: { x: K(0, -1.6, 2, 0), y: K(0, 1.8, 2, 0.2), ry: K(0, -90, 2, 0) },
      fx: [{ t: 0, fx: "trail", dur: 2 }, { t: 0, fx: "streaks", dur: 1.6 }, { t: 2, fx: "ring", at: "feet" }, { t: 2, fx: "sparkle", dur: 1 }],
      shots: [{ t: 0, shot: "wide" }, { t: 2, shot: "hero" }],
    },
  },
};

export const CAST: Record<CharacterStyle, CastMember> = { queen, king, masked, warrior, futuristic, celestial };

// ---------- Shared reactions, performed in each personality's own style ----------
export const REACTIONS = [
  { id: "wave", label: "Wave" },
  { id: "dance", label: "Dance" },
  { id: "laugh", label: "Laugh" },
  { id: "wink", label: "Wink" },
  { id: "bow", label: "Bow" },
  { id: "flex", label: "Flex" },
  { id: "celebrate", label: "Celebrate" },
  { id: "confidence", label: "Confidence" },
  { id: "surprise", label: "Surprise" },
  { id: "signature", label: "Signature move" },
] as const;
export type ReactionId = (typeof REACTIONS)[number]["id"];

const scaleChannel = (ch: Channel | undefined, tempo: number, amp = 1, add = 0) =>
  ch?.map(([t, v]) => [t * tempo, v * amp + add] as const);
function flavourMove(m: MoveDef, f: CastMember["flavour"], style: CharacterStyle): MoveDef {
  const bones: MoveDef["bones"] = {};
  for (const [name, tr] of Object.entries(m.bones ?? {})) {
    bones[name as keyof typeof bones] = {
      x: scaleChannel(tr.x, f.tempo, f.amp), y: scaleChannel(tr.y, f.tempo, f.amp),
      z: scaleChannel(tr.z, f.tempo, f.amp), w: scaleChannel(tr.w, f.tempo),
    };
  }
  const root: MoveDef["root"] = {};
  for (const [k, ch] of Object.entries(m.root ?? {})) root[k as keyof typeof root] = scaleChannel(ch, f.tempo, k === "s" ? 1 : f.amp);
  if (f.float) root.y = (root.y ?? K(0, 0, m.duration, 0)).map(([t, v]) => [t, v + f.float] as const);
  return {
    ...m,
    id: `${style}-${m.id}`,
    duration: m.duration * f.tempo,
    clips: m.clips.map(([t, c, s]) => [t * f.tempo, c, (s ?? 1) / f.tempo] as const),
    root, bones,
    fx: m.fx?.map((c) => ({ ...c, t: c.t * f.tempo, dur: c.dur && c.dur * f.tempo })),
  };
}
const shared: Record<"wave" | "dance" | "laugh" | "wink" | "bow" | "flex" | "confidence", MoveDef> = {
  wave: {
    id: "wave", name: "Wave", description: "A friendly wave.", duration: 2, clips: [[0, "idle", 1]],
    bones: { "arm-right": { z: K(0, 45, 0.35, -65, 0.6, -95, 0.85, -65, 1.1, -95, 1.35, -65, 1.6, -80) }, head: { z: K(0, 0, 0.4, 8, 1.6, 8, 2, 0) } },
  },
  dance: {
    id: "dance", name: "Dance", description: "A few bouncy steps.", duration: 3.2, clips: [[0, "walk", 1.6]],
    root: { ry: K(0, 0, 0.8, 25, 1.6, -25, 2.4, 25, 3.2, 0), y: K(0, 0, 0.4, 0.07, 0.8, 0, 1.2, 0.07, 1.6, 0, 2, 0.07, 2.4, 0, 2.8, 0.07, 3.2, 0) },
    bones: { "arm-right": { z: K(0, 45, 0.4, -60, 0.8, 45, 1.2, -60, 1.6, 45, 2, -60, 2.4, 45, 2.8, -60, 3.2, 45) }, "arm-left": { z: K(0, -45, 0.4, 45, 0.8, -60, 1.2, 45, 1.6, -60, 2, 45, 2.4, -60, 2.8, 45, 3.2, -45) } },
    fx: [{ t: 0.4, fx: "sparkle", dur: 2.4 }],
  },
  laugh: {
    id: "laugh", name: "Laugh", description: "A full-body laugh.", duration: 1.9, clips: [[0, "idle", 1]],
    root: { y: K(0, 0, 0.2, 0.03, 0.4, 0, 0.6, 0.03, 0.8, 0, 1, 0.03, 1.2, 0) },
    bones: {
      torso: { x: K(0, 0, 0.15, -12, 0.3, -5, 0.45, -12, 0.6, -5, 0.75, -12, 0.9, -5, 1.3, 0) },
      head: { x: K(0, 0, 0.2, -22, 1.2, -22, 1.6, 0) },
      "arm-right": { y: hold(60, 1.9), z: hold(55, 1.9) }, "arm-left": { y: hold(-60, 1.9), z: hold(-55, 1.9) },
    },
  },
  wink: {
    id: "wink", name: "Wink", description: "A head tilt, a finger point and a twinkle.", duration: 1.6, clips: [[0, "idle", 1]],
    bones: { head: { z: K(0, 0, 0.3, 14, 1.2, 14, 1.6, 0), y: K(0, 0, 0.3, 10, 1.6, 0) }, "arm-right": { y: hold(75, 1.6), z: hold(20, 1.6) } },
    fx: [{ t: 0.4, fx: "sparkle", dur: 0.6, at: "head" }],
  },
  bow: {
    id: "bow", name: "Bow", description: "A respectful bow.", duration: 2.3, clips: [[0, "idle", 0.8]],
    bones: {
      torso: { x: K(0, 0, 0.6, 42, 1.5, 42, 2.3, 0) }, head: { x: K(0, 0, 0.6, 12, 1.5, 12, 2.3, 0) },
      "arm-right": { y: hold(70, 2.3), z: hold(50, 2.3) },
    },
  },
  flex: {
    id: "flex", name: "Flex", description: "A proud double flex.", duration: 2, clips: [[0, "idle", 1]],
    root: { s: K(0, 1, 0.5, 1, 0.7, 1.05, 1.4, 1.05, 1.8, 1) },
    bones: { "arm-right": { z: hold(-30, 2), y: hold(20, 2) }, "arm-left": { z: hold(30, 2), y: hold(-20, 2) }, torso: { x: hold(-8, 2) }, head: { x: hold(-8, 2) } },
    fx: [{ t: 0.7, fx: "burst", at: "body" }],
  },
  confidence: {
    id: "confidence", name: "Confidence", description: "Hands on hips, chin up.", duration: 2.4, clips: [[0, "idle", 0.6]],
    root: { s: K(0, 1, 0.5, 1.02, 2.4, 1) },
    bones: { "arm-right": { z: hold(55, 2.4), y: hold(-35, 2.4) }, "arm-left": { z: hold(-55, 2.4), y: hold(35, 2.4) }, head: { x: K(0, 0, 0.5, -12, 1.6, -12, 2.4, 0), y: K(0.6, 0, 1.2, 12, 2, 0) } },
  },
};
// Personality-specific variants of shared reactions.
const variants: Partial<Record<CharacterStyle, Partial<Record<keyof typeof shared, MoveDef>>>> = {
  queen: {
    bow: { ...shared.bow, id: "curtsy", name: "Curtsy", description: "A deep, graceful curtsy.", clips: [[0, "idle", 1], [0.4, "crouch", 0.7], [1.6, "idle", 1]],
      bones: { torso: { x: K(0, 0, 0.6, 18, 1.5, 18, 2.3, 0) }, "arm-right": { z: hold(20, 2.3) }, "arm-left": { z: hold(-20, 2.3) }, head: { x: K(0, 0, 0.6, 15, 1.5, 15, 2.3, 0) } } },
    dance: { ...shared.dance, id: "waltz", name: "Royal waltz", description: "A turning waltz.", root: { ry: K(0, 0, 3.2, 360), y: shared.dance.root!.y! } },
  },
  masked: {
    bow: { ...shared.bow, id: "fist-bow", name: "Martial bow", description: "Fist to palm, a short sharp bow.", bones: { torso: { x: K(0, 0, 0.4, 25, 1.2, 25, 1.7, 0) }, "arm-right": { y: hold(80, 2.3), z: hold(40, 2.3) }, "arm-left": { y: hold(-80, 2.3), z: hold(-40, 2.3) } } },
    dance: { ...shared.dance, id: "pop", name: "Pop and lock", description: "Sharp robotic hits.", clips: [[0, "static", 1]] },
  },
  king: { flex: { ...shared.flex, fx: [{ t: 0.7, fx: "dust", at: "feet" }, { t: 0.7, fx: "shake", power: 0.3 }] } },
  celestial: { wave: { ...shared.wave, fx: [{ t: 0.5, fx: "sparkle", dur: 1.2, at: "hand" }] } },
  futuristic: { wink: { ...shared.wink, fx: [{ t: 0.4, fx: "holo", dur: 0.5 }] } },
};
export function reactionMove(style: CharacterStyle, id: ReactionId): MoveDef {
  const c = CAST[style];
  if (id === "signature") return c.moves.signature;
  if (id === "celebrate") return c.moves.celebration;
  if (id === "surprise") return c.moves.reaction;
  const base = variants[style]?.[id] ?? shared[id];
  return flavourMove(base, c.flavour, style);
}
export function moveFor(style: CharacterStyle, slot: MoveSlot) {
  return CAST[style].moves[slot];
}

// ---------- Unlock gating ----------
export function worldUnlockLevel(style: CharacterStyle, world: WorldId) {
  if (world === "studio") return 0;
  if (world === "legend") return 9;
  return CAST[style].world === world ? 1 : 4;
}
export const isOptionUnlocked = (unlockLevel: number, level: number) => level >= unlockLevel;
export function visibleAccessories(style: CharacterStyle, form: number, hidden: readonly string[]) {
  const list = CAST[style].accessories.filter((a) => a.unlockLevel <= form && !hidden.includes(a.id));
  // The legend crown replaces the standard crown.
  return list.some((a) => a.id === "grand-crown") ? list.filter((a) => a.id !== "crown") : list;
}
