import {
  Briefcase,
  GraduationCap,
  Laptop,
  Megaphone,
  Palette,
  PenTool,
  PiggyBank,
  Rocket,
  Salad,
} from "lucide-react";

import type { TopicId } from "@/lib/dreamverse/catalog";

// One literal, real-world object per topic, drawn as a Lucide outline glyph — the same icon
// family the Enski sites use in their duotone tiles (see DuoIcon).
export const TOPIC_ICONS: Record<TopicId, typeof Laptop> = {
  technology: Laptop,
  business: Briefcase,
  design: PenTool,
  marketing: Megaphone,
  finance: PiggyBank,
  "creative-arts": Palette,
  "personal-development": Rocket,
  lifestyle: Salad,
  education: GraduationCap,
};
