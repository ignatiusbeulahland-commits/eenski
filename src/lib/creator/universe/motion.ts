// Pure animation timeline maths for the Creator Universe 3D showroom.
// No React or three.js here: the stage only reads these samples.
export const BONES = ["torso", "head", "arm-left", "arm-right", "leg-left", "leg-right"] as const;
export type BoneName = (typeof BONES)[number];
export const CLIPS = [
  "idle", "walk", "sprint", "jump", "fall", "crouch", "pick-up", "emote-yes", "emote-no",
  "holding-right", "holding-both", "attack-melee-right", "attack-melee-left",
  "attack-kick-right", "interact-right", "interact-left", "static",
] as const;
export type ClipName = (typeof CLIPS)[number];
/** Keyframes as [seconds, value]. Rotations are degrees, positions are world units (figure ≈ 1.7 tall). */
export type Channel = readonly (readonly [number, number])[];
export const ROOT_KEYS = ["x", "y", "z", "rx", "ry", "rz", "s"] as const;
export type RootKey = (typeof ROOT_KEYS)[number];
export type BoneTrack = { x?: Channel | undefined; y?: Channel | undefined; z?: Channel | undefined; w?: Channel | undefined };
export const FX_KINDS = [
  "burst", "ring", "dust", "trail", "streaks", "sparkle", "glow", "holo", "shake", "flash", "confetti", "smoke", "wings",
] as const;
export type FxKind = (typeof FX_KINDS)[number];
export type FxCue = { t: number; fx: FxKind; dur?: number | undefined; power?: number | undefined; at?: "feet" | "body" | "head" | "hand" | undefined };
export const SHOTS = ["hero", "low", "close", "side", "wide", "top", "orbit"] as const;
export type Shot = (typeof SHOTS)[number];
export type ShotCue = { t: number; shot: Shot };
export interface MoveDef {
  /** Weapon or prop spin (degrees) around its own axis. */
  prop?: { spin?: Channel };
  id: string;
  name: string;
  description: string;
  duration: number;
  loop?: boolean;
  /** Clip timeline: [startSeconds, clip, speed]. */
  clips: readonly (readonly [number, ClipName, number?])[];
  root?: Partial<Record<RootKey, Channel | undefined>>;
  bones?: Partial<Record<BoneName, BoneTrack>>;
  fx?: readonly FxCue[] | undefined;
  shots?: readonly ShotCue[];
}
export type BonePose = { x: number; y: number; z: number; w: number };
export type Pose = { root: Record<RootKey, number>; bones: Partial<Record<BoneName, BonePose>>; spin: number };
export const REST_ROOT: Record<RootKey, number> = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1 };
const ease = (u: number) => u * u * (3 - 2 * u);
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export function sampleChannel(ch: Channel | undefined, t: number, fallback = 0): number {
  if (!ch || !ch.length) return fallback;
  const first = ch[0]!;
  if (t <= first[0]) return first[1];
  for (let i = 1; i < ch.length; i++) {
    const a = ch[i - 1]!;
    const b = ch[i]!;
    if (t <= b[0]) {
      const span = b[0] - a[0];
      const u = span <= 0 ? 1 : ease(clamp01((t - a[0]) / span));
      return a[1] + (b[1] - a[1]) * u;
    }
  }
  return ch[ch.length - 1]![1];
}
/** Weight envelope: overrides fade in and out unless the track sets its own weight. */
function envelope(move: MoveDef, t: number) {
  if (move.loop) return 1;
  const fadeIn = Math.min(0.22, move.duration / 4);
  const fadeOut = Math.min(0.3, move.duration / 4);
  return Math.min(clamp01(t / fadeIn), clamp01((move.duration - t) / fadeOut));
}
export type Calm = { motion: number };
/** Reduced motion keeps poses but removes spins, flips, travel and big jumps. */
export function sampleMove(move: MoveDef, rawT: number, calm = false): Pose {
  const t = move.loop ? rawT % move.duration : Math.min(rawT, move.duration);
  const root = { ...REST_ROOT };
  for (const k of ROOT_KEYS) root[k] = sampleChannel(move.root?.[k], t, REST_ROOT[k]);
  if (calm) {
    root.rx = 0; root.rz = 0; root.ry = Math.max(-20, Math.min(20, root.ry % 360));
    root.x *= 0.2; root.z *= 0.2; root.y = Math.min(root.y, 0.12); root.s = 1 + (root.s - 1) * 0.3;
  }
  root.y = Math.max(0, root.y);
  const env = envelope(move, t);
  const bones: Partial<Record<BoneName, BonePose>> = {};
  for (const name of BONES) {
    const tr = move.bones?.[name];
    if (!tr) continue;
    bones[name] = {
      x: sampleChannel(tr.x, t),
      y: sampleChannel(tr.y, t),
      z: sampleChannel(tr.z, t),
      w: (tr.w ? sampleChannel(tr.w, t) : 1) * env,
    };
  }
  return { root, bones, spin: sampleChannel(move.prop?.spin, t) };
}
export function clipAt(move: MoveDef, rawT: number): { clip: ClipName; speed: number; index: number } {
  const t = move.loop ? rawT % move.duration : rawT;
  let pick = move.clips[0] ?? ([0, "idle", 1] as const);
  let index = 0;
  move.clips.forEach((c, i) => { if (t >= c[0]) { pick = c; index = i; } });
  return { clip: pick[1], speed: pick[2] ?? 1, index };
}
const wrap = (deg: number) => { const d = ((deg % 360) + 540) % 360 - 180; return d === -180 ? 180 : d; };
/** Normalise a snapshot so a finished 360° spin does not unwind backwards when blending. */
export function settle(p: Pose): Pose {
  return { root: { ...p.root, rx: wrap(p.root.rx), ry: wrap(p.root.ry), rz: wrap(p.root.rz) }, bones: { ...p.bones }, spin: wrap(p.spin) };
}
export function blendPose(from: Pose, to: Pose, k: number): Pose {
  const u = ease(clamp01(k));
  const root = { ...to.root };
  for (const key of ROOT_KEYS) root[key] = from.root[key] + (to.root[key] - from.root[key]) * u;
  const bones: Partial<Record<BoneName, BonePose>> = {};
  for (const name of BONES) {
    const a = from.bones[name];
    const b = to.bones[name];
    if (!a && !b) continue;
    const A = a ?? { ...b!, w: 0 };
    const B = b ?? { ...a!, w: 0 };
    bones[name] = {
      x: A.x + (B.x - A.x) * u,
      y: A.y + (B.y - A.y) * u,
      z: A.z + (B.z - A.z) * u,
      w: A.w + (B.w - A.w) * u,
    };
  }
  return { root, bones, spin: from.spin + (to.spin - from.spin) * u };
}
/** Cues that start inside (from, to]. */
export function cuesBetween<T extends { t: number }>(cues: readonly T[] | undefined, from: number, to: number) {
  return (cues ?? []).filter((c) => c.t > from && c.t <= to);
}
