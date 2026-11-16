// Transparent people cut-outs, served as light WebP files in two widths so
// phones download the smaller one and retina laptops the sharper one.
import hero640 from "@/assets/features/hero-creator-640.webp";
import hero1024 from "@/assets/features/hero-creator-1024.webp";
import learner640 from "@/assets/features/learner-640.webp";
import learner1024 from "@/assets/features/learner-1024.webp";
import cta640 from "@/assets/features/cta-creator-640.webp";
import cta1024 from "@/assets/features/cta-creator-1024.webp";

export type Cutout = { src: string; srcSet: string; sizes: string };

const make = (small: string, large: string, sizes: string): Cutout => ({
  src: large,
  srcSet: `${small} 640w, ${large} 1024w`,
  sizes,
});

export const cutouts = {
  hero: make(hero640, hero1024, "(min-width: 1024px) 512px, (min-width: 640px) 416px, 352px"),
  learner: make(learner640, learner1024, "(min-width: 768px) 500px, 400px"),
  cta: make(cta640, cta1024, "(min-width: 1024px) 480px, 400px"),
};
