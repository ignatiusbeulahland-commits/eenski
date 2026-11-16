import { BriefcaseBusiness, Compass, GraduationCap, HandCoins, Lightbulb, UsersRound, type LucideIcon } from "lucide-react";

import heroBraidsSmall from "@/assets/dreamers-trybe/hero-braids-900.webp";
import heroBraids from "@/assets/dreamers-trybe/hero-braids.webp";
import heroDreamerSmall from "@/assets/dreamers-trybe/hero-dreamer-900.webp";
import heroDreamer from "@/assets/dreamers-trybe/hero-dreamer.webp";
import heroLaptopSmall from "@/assets/dreamers-trybe/hero-laptop-960.webp";
import heroLaptop from "@/assets/dreamers-trybe/hero-laptop.webp";
import heroLightsSmall from "@/assets/dreamers-trybe/hero-lights-900.webp";
import heroLights from "@/assets/dreamers-trybe/hero-lights.webp";
import heroMoonSmall from "@/assets/dreamers-trybe/hero-moon-900.webp";
import heroMoon from "@/assets/dreamers-trybe/hero-moon.webp";
import heroReachSmall from "@/assets/dreamers-trybe/hero-reach-900.webp";
import heroReach from "@/assets/dreamers-trybe/hero-reach.webp";
import heroSmileSmall from "@/assets/dreamers-trybe/hero-smile-900.webp";
import heroSmile from "@/assets/dreamers-trybe/hero-smile.webp";

/** Copy and photos for /dreamers-trybe, from the Enski Dreamers Trybe project. */

export type TrybeHeroSlide = { src: string; srcSet: string; sizes: string; alt: string; pos: string; fill?: true };

// Portrait photos sit whole (object-contain) over a blurred copy, so they never show taller than the hero.
const PORTRAIT_SIZES = "(min-width: 1024px) 640px, 100vw";
const portrait = (small: string, smallW: number, big: string, bigW: number) => ({ src: small, srcSet: `${small} ${smallW}w, ${big} ${bigW}w`, sizes: PORTRAIT_SIZES });

export const TRYBE_HERO_SLIDES: TrybeHeroSlide[] = [
  { ...portrait(heroDreamerSmall, 720, heroDreamer, 1024), alt: "A young woman in a simple room smiling with her eyes closed, dreaming of leading her own studio", pos: "50% 30%" },
  { ...portrait(heroMoonSmall, 675, heroMoon, 1200), alt: "A hand reaching up toward the moon in a starry sky", pos: "50% 40%" },
  { ...portrait(heroBraidsSmall, 720, heroBraids, 1280), alt: "A confident young Nigerian woman with braids smiling", pos: "50% 20%" },
  { ...portrait(heroReachSmall, 600, heroReach, 1067), alt: "A young Black man reaching upward with confidence", pos: "50% 20%" },
  { ...portrait(heroSmileSmall, 720, heroSmile, 1280), alt: "A joyful young woman smiling in Lagos", pos: "50% 20%" },
  { ...portrait(heroLightsSmall, 599, heroLights, 1064), alt: "A young man looking up with hope under city lights", pos: "50% 20%" },
  { src: heroLaptop, srcSet: `${heroLaptopSmall} 960w, ${heroLaptop} 1920w`, sizes: "100vw", alt: "A smiling young creator working on a laptop", pos: "60% 30%", fill: true },
];

export const trybeHeroPreload = {
  href: heroDreamerSmall,
  imageSrcSet: TRYBE_HERO_SLIDES[0]!.srcSet,
  imageSizes: TRYBE_HERO_SLIDES[0]!.sizes,
};

export const HERO_POINTS = ["Free to join", "Clear next steps", "Accountability buddies", "Trainings and Career Placements Opportunities"];

export const TICKER: { icon: LucideIcon; t: string }[] = [
  { icon: Compass, t: "Clear next steps" },
  { icon: UsersRound, t: "Accountability buddies" },
  { icon: GraduationCap, t: "Trainings" },
  { icon: BriefcaseBusiness, t: "Career placements" },
  { icon: Lightbulb, t: "Learn a new skill" },
  { icon: HandCoins, t: "Get your first client" },
];

export const DREAMS = [
  { w: "Land your first job", d: "Find roles that fit you, sharpen your CV and practise interviews." },
  { w: "Learn a new skill", d: "Design, code, write or analyse data. Pick one and stay consistent." },
  { w: "Build your personal brand", d: "Share your work and tell your story so the right people find you." },
  { w: "Start a business", d: "Test it, get feedback and find your first customers." },
  { w: "Build your network", d: "Meet ambitious people building, learning and changing careers." },
  { w: "Get your first client", d: "Price your skills, pitch with confidence and land the first yes." },
  { w: "Earn your first $1,000", d: "Find ways to earn and take action every week." },
  { w: "Grow your income", d: "Raise your value and add new ways to earn." },
  { w: "Launch something", d: "The portfolio, the post, the product. Ship it." },
  { w: "Challenge yourself", d: "Try new things and prove you're capable of more." },
  { w: "Become more intentional", d: "Set goals that matter and act on them." },
];

export const FAQ_CATS = ["Getting started", "Cost and time", "Community", "Opportunities"] as const;
export type FaqCat = (typeof FAQ_CATS)[number];
export const FAQ: { c: FaqCat; q: string; a: string }[] = [
  { c: "Getting started", q: "Who is it for?", a: "Young people with a dream, whether it's a job, a skill, a brand or a business." },
  { c: "Getting started", q: "What if I'm just starting?", a: "Perfect. Most dreamers start with only an idea." },
  { c: "Getting started", q: "Do I need any experience?", a: "No experience needed. Just the will to start." },
  { c: "Getting started", q: "How do I join?", a: "Fill in the short form on this page. It takes 30 seconds and there's no approval wait." },
  { c: "Cost and time", q: "Is it really free?", a: "Yes. Joining the Dreamers Trybe is free." },
  { c: "Cost and time", q: "How much time do I need?", a: "A few minutes a day. You move at your own pace." },
  { c: "Community", q: "Who keeps me going?", a: "You get accountability buddies and a community of dreamers who check in on your progress." },
  { c: "Community", q: "Where are the dreamers from?", a: "Lagos, Abuja, Port Harcourt, Accra, Nairobi and beyond." },
  { c: "Community", q: "Who runs the Trybe?", a: "The Dreamers Trybe is powered by Enski, Africa's platform for dreamers." },
  { c: "Opportunities", q: "What do I get?", a: "Clear next steps, accountability buddies, trainings and career placement opportunities." },
  { c: "Opportunities", q: "Can it help me earn?", a: "Yes. Dreamers work toward their first client, their first $1,000 and growing their income." },
  { c: "Opportunities", q: "Will I hear about jobs and trainings?", a: "Yes. We share trainings and career placement opportunities with members as they come up." },
];
