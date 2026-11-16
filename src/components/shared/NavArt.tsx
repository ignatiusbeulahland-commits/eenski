import { BadgePercent, ChartColumn, Compass, Database, Globe, Handshake, LayoutDashboard, ListChecks, Medal, Palette, Shapes, Stamp } from "lucide-react";
import type { ComponentType } from "react";
import { BrandIcon, brandArtwork, iconArtwork } from "@/components/affiliate/BrandIcon";
import { BrandMark } from "@/components/shared/BrandMark";
import { cn } from "@/lib/utils";

/** Sidebar-only artwork for Creator/Learner icons that have no general 3D match. Same art set as the Affiliate sidebar. */
const navOnly = new Map<unknown, string>([
  [LayoutDashboard, brandArtwork.overview],
  [Compass, brandArtwork.market],
  [Shapes, brandArtwork.package],
  [Database, brandArtwork.video],
  [BadgePercent, brandArtwork.conversion],
  [Handshake, brandArtwork.affiliations],
  [ChartColumn, brandArtwork.analytics],
  [ListChecks, brandArtwork.target],
  [Palette, brandArtwork.profile],
  [Globe, brandArtwork.globe],
  [BrandMark, brandArtwork.trophy],
  [Medal, brandArtwork.graduate],
  [Stamp, brandArtwork.success],
]);

export const navArtFor = (icon: unknown) => iconArtwork.get(icon as never) ?? navOnly.get(icon);

/** One sidebar icon for every role: glossy 3D art with the Affiliate sizing and lime active glow, line icon as fallback. */
export function NavArt({ icon: Icon, active, sub, fallbackClassName }: { icon: ComponentType<{ className?: string }>; active?: boolean | undefined; sub?: boolean | undefined; fallbackClassName?: string | undefined }) {
  const src = navArtFor(Icon);
  return src
    ? <BrandIcon src={src} className={cn("nav-art", sub ? "h-5 w-5" : "h-6 w-6", active && "is-active")} />
    : <Icon {...(fallbackClassName ? { className: fallbackClassName } : {})} />;
}
