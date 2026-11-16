// Resolves saved showroom choices against what is actually unlocked.
import { CAST, COLOURWAYS, WORLDS, worldUnlockLevel, type ColourwayId, type WorldId } from "./cast";
import { MILESTONES, STYLES, isAchieved, progression, type CharacterStyle, type FormRef, type UniverseState } from "./rules";

/** Highest level that is both above threshold and recorded as achieved. */
export function achievedLevel(u: UniverseState) {
  const p = progression(u.demoEligibleEarningsUsd);
  let level = 0;
  for (const m of p.unlocked) if (isAchieved(u, m.level)) level = m.level;
  return level;
}
export function isFormUnlocked(u: UniverseState, level: number) {
  return level >= 1 && isAchieved(u, level);
}
const validForm = (u: UniverseState, f: FormRef | null) => (f && isFormUnlocked(u, f.level) ? f : null);
export function showcase(u: UniverseState) {
  const level = achievedLevel(u);
  const fallback: FormRef | null = level ? { style: u.style, level } : null;
  return {
    level,
    favourite: validForm(u, u.showroom.favourite),
    dashboard: validForm(u, u.showroom.dashboard) ?? fallback,
  };
}
export type ResolvedCustom = { outfit: string; colourway: ColourwayId; hidden: string[]; world: WorldId };
/** Saved customisation, falling back to the first unlocked option whenever a choice is not available. */
export function customFor(u: UniverseState, style: CharacterStyle): ResolvedCustom {
  const level = achievedLevel(u);
  const saved = u.showroom.custom[style];
  const cast = CAST[style];
  const outfit = cast.outfits.find((o) => o.id === saved?.outfit && o.unlockLevel <= level) ?? cast.outfits[0]!;
  const colourway = COLOURWAYS.find((c) => c.id === saved?.colourway && c.unlockLevel <= level) ?? COLOURWAYS[0];
  const savedWorld = WORLDS.find((w) => w.id === saved?.world && worldUnlockLevel(style, w.id) <= level);
  const world = savedWorld?.id ?? (worldUnlockLevel(style, cast.world) <= level ? cast.world : "studio");
  return { outfit: outfit.id, colourway: colourway.id, hidden: saved?.hidden ?? [], world };
}
export function isNewlyUnlocked(u: UniverseState, level: number) {
  return isFormUnlocked(u, level) && !u.showroom.collected.includes(level);
}

/** The character the showroom presents: the favourite or highest earned form, else a starter preview. */
export function showroomSubject(u: UniverseState) {
  const sc = showcase(u);
  const shown = sc.favourite ?? (sc.level ? { style: u.style, level: sc.level } : null);
  const style = shown?.style ?? u.style;
  const form = shown?.level ?? 1;
  const preview = !shown;
  const resolved = customFor(u, style);
  const look: ResolvedCustom = preview ? { ...resolved, world: CAST[style].world } : resolved;
  return { style, form, preview, look };
}

/** Everything the downloadable showcase card prints. Preview cards never claim a milestone. */
export function showcaseCardDetails(u: UniverseState, person: { firstName: string; lastName: string; handle?: string }) {
  const subject = showroomSubject(u);
  const cast = CAST[subject.style];
  const world = WORLDS.find((w) => w.id === subject.look.world) ?? WORLDS[0];
  const milestone = MILESTONES.find((m) => m.level === subject.form) ?? MILESTONES[0];
  const handle = (person.handle ?? "").trim().replace(/^@+/, "");
  return {
    ...subject,
    characterName: u.alias.trim() || cast.name,
    persona: STYLES.find((s) => s.id === subject.style)?.label ?? "",
    world: { name: world.name, mood: world.mood },
    move: { name: cast.moves.signature.name, description: cast.moves.signature.description },
    rank: subject.preview ? `Starter preview · unlocks at ${MILESTONES[0].title}` : `Level ${milestone.level} · ${milestone.title}`,
    creatorName: `${person.firstName} ${person.lastName}`.trim(),
    handle: handle ? `@${handle}` : "",
  };
}
export type ShowcaseCardDetails = ReturnType<typeof showcaseCardDetails>;
