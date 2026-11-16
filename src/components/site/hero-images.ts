import heroGroup from "@/assets/people/hero-group.webp";
import heroGroup640 from "@/assets/people/hero-group-640.webp";
import heroGroup960 from "@/assets/people/hero-group-960.webp";
import heroLime from "@/assets/people/hero-slide2.webp";
import heroLime640 from "@/assets/people/hero-slide2-640.webp";
import heroLime960 from "@/assets/people/hero-slide2-960.webp";
import heroCargo from "@/assets/people/hero-slide3.webp";
import heroCargo640 from "@/assets/people/hero-slide3-640.webp";
import heroCargo960 from "@/assets/people/hero-slide3-960.webp";
import type { PeopleSlide } from "./PeopleSlides";

/**
 * How wide the hero photo is drawn, measured in the browser:
 * phones zoom it to 132% of the screen minus padding (max ~740px),
 * tablets show it at 583px and laptops at up to 588px.
 */
export const HERO_SIZES =
  "(min-width: 1280px) 588px, (min-width: 1024px) calc(35.5vw + 133px), (min-width: 640px) 583px, min(740px, calc(132vw - 53px))";

const set = (small: string, medium: string, large: string) => `${small} 640w, ${medium} 960w, ${large} 1344w`;

export const heroSlides: PeopleSlide[] = [
  {
    src: heroGroup,
    srcSet: set(heroGroup640, heroGroup960, heroGroup),
    small: heroGroup640,
    sizes: HERO_SIZES,
    width: 1344,
    height: 1002,
    alt: "Three young Africans in brand colours: a man in a sky-blue hoodie and baggy navy trousers, an excited woman in a navy t-shirt checking her phone, and a laughing woman in a navy jacket",
  },
  {
    src: heroLime,
    srcSet: set(heroLime640, heroLime960, heroLime),
    small: heroLime640,
    sizes: HERO_SIZES,
    width: 1344,
    height: 1008,
    alt: "Three laughing friends in lime green hoodies: a man in a plain lime hoodie and baggy navy jeans, a woman in a cropped hoodie and cobalt joggers holding her phone, and a man in a plain lime zip hoodie and navy joggers giving a thumbs up",
  },
  {
    src: heroCargo,
    srcSet: set(heroCargo640, heroCargo960, heroCargo),
    small: heroCargo640,
    sizes: HERO_SIZES,
    width: 1344,
    height: 1008,
    alt: "Three smiling friends in Enski gear: a woman in a lime hoodie and sky-blue baggy cargo pants, a man in a lime Enski hoodie and navy cargo pants holding a laptop, and a waving woman in a navy hoodie and lime joggers",
  },
];

export const firstHeroSlide = heroSlides[0]!;
