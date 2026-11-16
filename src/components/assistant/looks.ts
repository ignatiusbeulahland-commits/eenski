/**
 * Charm's four selectable looks (from the Enski mascot concept sheet). 3D art in src/assets/charm.
 * The original poses are never edited; the newer expressions were made from them. blink, wink and
 * laugh are face-only frames the same size as idle so they swap in place. Missing art falls back
 * (scholar laugh → wink, dance → celebrate, surprised → think).
 */
import type { LookId, Pose } from "@/lib/assistant/types";
import classicIdle from "@/assets/charm/classic-idle.webp";
import classicWave from "@/assets/charm/classic-wave.webp";
import classicThink from "@/assets/charm/classic-think.webp";
import classicPoint from "@/assets/charm/classic-point.webp";
import classicCelebrate from "@/assets/charm/classic-celebrate.webp";
import classicConcerned from "@/assets/charm/classic-concerned.webp";
import classicBlink from "@/assets/charm/classic-blink.webp";
import classicWink from "@/assets/charm/classic-wink.webp";
import classicLaugh from "@/assets/charm/classic-laugh.webp";
import classicThumbsup from "@/assets/charm/classic-thumbsup.webp";
import classicClap from "@/assets/charm/classic-clap.webp";
import classicProud from "@/assets/charm/classic-proud.webp";
import classicHead from "@/assets/charm/classic-head.webp";
import scholarIdle from "@/assets/charm/scholar-idle.webp";
import scholarWave from "@/assets/charm/scholar-wave.webp";
import scholarThink from "@/assets/charm/scholar-think.webp";
import scholarPoint from "@/assets/charm/scholar-point.webp";
import scholarCelebrate from "@/assets/charm/scholar-celebrate.webp";
import scholarConcerned from "@/assets/charm/scholar-concerned.webp";
import scholarBlink from "@/assets/charm/scholar-blink.webp";
import scholarWink from "@/assets/charm/scholar-wink.webp";
import scholarThumbsup from "@/assets/charm/scholar-thumbsup.webp";
import scholarClap from "@/assets/charm/scholar-clap.webp";
import scholarProud from "@/assets/charm/scholar-proud.webp";
import scholarHead from "@/assets/charm/scholar-head.webp";
import coachIdle from "@/assets/charm/coach-idle.webp";
import coachWave from "@/assets/charm/coach-wave.webp";
import coachThink from "@/assets/charm/coach-think.webp";
import coachPoint from "@/assets/charm/coach-point.webp";
import coachCelebrate from "@/assets/charm/coach-celebrate.webp";
import coachConcerned from "@/assets/charm/coach-concerned.webp";
import coachBlink from "@/assets/charm/coach-blink.webp";
import coachWink from "@/assets/charm/coach-wink.webp";
import coachLaugh from "@/assets/charm/coach-laugh.webp";
import coachThumbsup from "@/assets/charm/coach-thumbsup.webp";
import coachClap from "@/assets/charm/coach-clap.webp";
import coachProud from "@/assets/charm/coach-proud.webp";
import coachHead from "@/assets/charm/coach-head.webp";
import innovatorIdle from "@/assets/charm/innovator-idle.webp";
import innovatorWave from "@/assets/charm/innovator-wave.webp";
import innovatorThink from "@/assets/charm/innovator-think.webp";
import innovatorPoint from "@/assets/charm/innovator-point.webp";
import innovatorCelebrate from "@/assets/charm/innovator-celebrate.webp";
import innovatorConcerned from "@/assets/charm/innovator-concerned.webp";
import innovatorBlink from "@/assets/charm/innovator-blink.webp";
import innovatorWink from "@/assets/charm/innovator-wink.webp";
import innovatorLaugh from "@/assets/charm/innovator-laugh.webp";
import innovatorThumbsup from "@/assets/charm/innovator-thumbsup.webp";
import innovatorClap from "@/assets/charm/innovator-clap.webp";
import innovatorProud from "@/assets/charm/innovator-proud.webp";
import innovatorHead from "@/assets/charm/innovator-head.webp";

export type CharmLook = {
  id: LookId;
  name: string;
  tagline: string;
  blurb: string;
  head: string;
  /** Eyes-closed frame drawn on the idle body, swapped in for a moment to blink. */
  blink: string;
  poses: Record<Pose, string>;
};

export const LOOKS: CharmLook[] = [
  {
    id: "classic",
    name: "Charm Classic",
    tagline: "The friendly guide.",
    blurb: "Warm, upbeat and always nearby in his navy Enski hoodie, ready to point you the right way.",
    head: classicHead,
    blink: classicBlink,
    poses: { idle: classicIdle, wave: classicWave, think: classicThink, point: classicPoint, celebrate: classicCelebrate, concerned: classicConcerned, wink: classicWink, laugh: classicLaugh, thumbsup: classicThumbsup, clap: classicClap, proud: classicProud, dance: classicCelebrate, surprised: classicThink },
  },
  {
    id: "scholar",
    name: "The Scholar",
    tagline: "The wise mentor.",
    blurb: "Calm, insightful and deeply knowledgeable. He inspires, teaches and helps you make smarter career and learning decisions.",
    head: scholarHead,
    blink: scholarBlink,
    poses: { idle: scholarIdle, wave: scholarWave, think: scholarThink, point: scholarPoint, celebrate: scholarCelebrate, concerned: scholarConcerned, wink: scholarWink, laugh: scholarWink, thumbsup: scholarThumbsup, clap: scholarClap, proud: scholarProud, dance: scholarCelebrate, surprised: scholarThink },
  },
  {
    id: "coach",
    name: "The Dreamer's Coach",
    tagline: "The hype professor.",
    blurb: "Energetic, witty and always in your corner. He keeps you accountable, pushes you to show up and reminds you to Dare to Dream.",
    head: coachHead,
    blink: coachBlink,
    poses: { idle: coachIdle, wave: coachWave, think: coachThink, point: coachPoint, celebrate: coachCelebrate, concerned: coachConcerned, wink: coachWink, laugh: coachLaugh, thumbsup: coachThumbsup, clap: coachClap, proud: coachProud, dance: coachCelebrate, surprised: coachThink },
  },
  {
    id: "innovator",
    name: "The Innovator",
    tagline: "The tech sage.",
    blurb: "Curious, creative and future-focused. He helps you explore new skills, tools and opportunities in the digital economy.",
    head: innovatorHead,
    blink: innovatorBlink,
    poses: { idle: innovatorIdle, wave: innovatorWave, think: innovatorThink, point: innovatorPoint, celebrate: innovatorCelebrate, concerned: innovatorConcerned, wink: innovatorWink, laugh: innovatorLaugh, thumbsup: innovatorThumbsup, clap: innovatorClap, proud: innovatorProud, dance: innovatorCelebrate, surprised: innovatorThink },
  },
];

export function lookFor(id: LookId | null | undefined): CharmLook {
  return LOOKS.find((l) => l.id === id) ?? LOOKS[0]!;
}
