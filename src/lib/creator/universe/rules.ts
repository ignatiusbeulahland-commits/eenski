import { z } from "zod";
export const MILESTONES = [
  {
    level: 1,
    threshold: 1000,
    title: "Spark",
    identity: "The first light",
    upgrade: "Your first signature outfit",
  },
  {
    level: 2,
    threshold: 5000,
    title: "Forge",
    identity: "Built with intention",
    upgrade: "Tailored outfit and metallic accessories",
  },
  {
    level: 3,
    threshold: 10000,
    title: "Visionary",
    identity: "See beyond the ordinary",
    upgrade: "Creative instruments and signature headwear",
  },
  {
    level: 4,
    threshold: 25000,
    title: "Illumina",
    identity: "Make your light visible",
    upgrade: "Sculpted clothing and flowing silhouettes",
  },
  {
    level: 5,
    threshold: 50000,
    title: "Mogul",
    identity: "Own your creative world",
    upgrade: "Royal couture and precious-metal detailing",
  },
  {
    level: 6,
    threshold: 100000,
    title: "Titan",
    identity: "A force of creation",
    upgrade: "Armoured ensembles and ceremonial instruments",
  },
  {
    level: 7,
    threshold: 250000,
    title: "Ascendant",
    identity: "Rise beyond the expected",
    upgrade: "Suspended ribbons and celestial accents",
  },
  {
    level: 8,
    threshold: 500000,
    title: "Transcendent",
    identity: "Leave the ordinary behind",
    upgrade: "Imperial accessories and sculptural layers",
  },
  {
    level: 9,
    threshold: 1000000,
    title: "Legend",
    identity: "A legacy without limits",
    upgrade: "Exclusive winged ensembles and extraordinary crowns",
  },
] as const;
export const STYLES = [
  {
    id: "queen",
    label: "Queen",
    persona: "The Sovereign",
    description: "Grace, confidence and royal craftsmanship.",
  },
  {
    id: "king",
    label: "King",
    persona: "The Monarch",
    description: "Presence, purpose and a powerful silhouette.",
  },
  {
    id: "masked",
    label: "Masked",
    persona: "The Enigma",
    description: "Quiet confidence. A future-facing identity.",
  },
  {
    id: "warrior",
    label: "Warrior / Slayer",
    persona: "The Vanguard",
    description: "Adventurous armour and fearless expression.",
  },
  {
    id: "futuristic",
    label: "Futuristic",
    persona: "The Inventor",
    description: "Creative instruments and visionary couture.",
  },
  {
    id: "celestial",
    label: "Celestial",
    persona: "The Luminary",
    description: "Feathered silhouettes and luminous elegance.",
  },
] as const;
export type CharacterStyle = (typeof STYLES)[number]["id"];
const styleEnum = z.enum(["queen", "king", "masked", "warrior", "futuristic", "celestial"]);
const formRef = z.object({ style: styleEnum, level: z.number().int().min(1).max(9) });
const customSchema = z.object({
  outfit: z.string().max(40),
  colourway: z.string().max(40),
  hidden: z.array(z.string().max(40)).max(20),
  world: z.string().max(40),
});
/** 3D showroom preferences. Purely presentational: never read by milestone or achievement logic. */
export const showroomSchema = z.object({
  favourite: formRef.nullable(),
  dashboard: formRef.nullable(),
  collected: z.array(z.number().int().min(1).max(9)),
  custom: z.object({
    queen: customSchema.optional(),
    king: customSchema.optional(),
    masked: customSchema.optional(),
    warrior: customSchema.optional(),
    futuristic: customSchema.optional(),
    celestial: customSchema.optional(),
  }),
  reaction: z.string().max(40),
  autoRotate: z.boolean(),
  effects: z.enum(["full", "reduced"]),
  showName: z.boolean(),
});
export type ShowroomState = z.infer<typeof showroomSchema>;
export type FormRef = z.infer<typeof formRef>;
export const initialShowroom: ShowroomState = {
  favourite: null,
  dashboard: null,
  collected: [],
  custom: {},
  reaction: "wave",
  autoRotate: true,
  effects: "full",
  showName: true,
};
export const universeSchema = z.object({
  style: styleEnum,
  chosen: z.boolean(),
  accent: z.enum(["cobalt", "sky", "lime"]),
  alias: z.string().max(40),
  demoEligibleEarningsUsd: z.number().finite().nonnegative(),
  demoVerificationConfirmed: z.boolean(),
  achievements: z.array(
    z.object({ level: z.number().int().min(1).max(9), date: z.string(), celebrated: z.boolean() }),
  ),
  showroom: showroomSchema.default(initialShowroom),
});
export type UniverseState = z.infer<typeof universeSchema>;
export const initialUniverse: UniverseState = {
  style: "masked",
  chosen: false,
  accent: "cobalt",
  alias: "",
  demoEligibleEarningsUsd: 0,
  demoVerificationConfirmed: false,
  achievements: [],
  showroom: initialShowroom,
};
// Existing Creator earnings are NGN demo order sums. No FX or gross-sales eligibility rule is assumed.
export const ELIGIBLE_METRIC = {
  key: "demoEligibleEarningsUsd",
  currency: "USD",
  label: "Eligible earnings (USD)",
  source: "Eligible earnings in USD",
} as const;
export function progression(earnings: number) {
  const amount = Number.isFinite(earnings) ? Math.max(0, earnings) : 0;
  const unlocked = MILESTONES.filter((m) => amount >= m.threshold);
  const current = unlocked.at(-1);
  const next = MILESTONES.find((m) => amount < m.threshold);
  const floor = current?.threshold ?? 0;
  return {
    current,
    next,
    level: current?.level ?? 0,
    unlocked,
    amount,
    remaining: next ? next.threshold - amount : 0,
    percent: next
      ? Math.min(100, Math.max(0, ((amount - floor) / (next.threshold - floor)) * 100))
      : 100,
  };
}
export function reconcileUniverse(
  previous: UniverseState,
  patch: Partial<UniverseState>,
  date: string,
): UniverseState {
  const next = { ...previous, ...patch };
  const p = progression(next.demoEligibleEarningsUsd);
  return {
    ...next,
    achievements: [
      ...next.achievements,
      ...p.unlocked
        .filter((m) => !next.achievements.some((a) => a.level === m.level))
        .map((m) => ({ level: m.level, date, celebrated: false })),
    ],
  };
}
export function isAchieved(state: UniverseState, level: number) {
  return (
    state.demoEligibleEarningsUsd >=
      (MILESTONES.find((m) => m.level === level)?.threshold ?? Infinity) &&
    state.achievements.some((a) => a.level === level)
  );
}
export function canConfirmDemoVerification(
  profile: { firstName: string; lastName: string },
  status: string,
) {
  return Boolean(profile.firstName.trim() && profile.lastName.trim() && status === "submitted");
}
export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
