// Creator cut-outs in three widths so phones download a fraction of the desktop file.
import hero480 from "@/assets/pricing/hero-creator-480.webp";
import hero720 from "@/assets/pricing/hero-creator-720.webp";
import hero960 from "@/assets/pricing/hero-creator.webp";
import ultra480 from "@/assets/pricing/ultra-creator-480.webp";
import ultra720 from "@/assets/pricing/ultra-creator-720.webp";
import ultra944 from "@/assets/pricing/ultra-creator.webp";
import cta480 from "@/assets/pricing/cta-creator-480.webp";
import cta720 from "@/assets/pricing/cta-creator-720.webp";
import cta960 from "@/assets/pricing/cta-creator.webp";

export type CreatorImage = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
};

const set = (a: string, b: string, c: string, full: number) =>
  `${a} 480w, ${b} 720w, ${c} ${full}w`;

// `sizes` mirror each stage's rendered width (stage height × 0.75 aspect).
export const heroImage: CreatorImage = {
  src: hero720,
  srcSet: set(hero480, hero720, hero960, 960),
  sizes: "(min-width: 1024px) 450px, (min-width: 640px) 375px, 300px",
  width: 960,
  height: 1280,
};

export const ultraImage: CreatorImage = {
  src: ultra720,
  srcSet: set(ultra480, ultra720, ultra944, 944),
  sizes: "(min-width: 1024px) 450px, (min-width: 640px) 390px, 315px",
  width: 944,
  height: 1264,
};

export const ctaImage: CreatorImage = {
  src: cta720,
  srcSet: set(cta480, cta720, cta960, 960),
  sizes: "(min-width: 1024px) 405px, 285px",
  width: 960,
  height: 1280,
};
