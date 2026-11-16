import type { CSSProperties } from "react";
import mark from "@/assets/dashboard/brand/enski-mark.webp";
import { cn } from "@/lib/utils";

/**
 * The Enski symbol cut from the official logo. "mono" takes the surrounding text colour
 * (via a mask) so it can sit where a small accent icon is needed; "color" shows the logo as-is.
 */
export function BrandMark({ className, style, tone = "mono" }: { className?: string; style?: CSSProperties; tone?: "mono" | "color" }) {
  if (tone === "color") {
    return <img src={mark} alt="" aria-hidden="true" width={24} height={24} className={cn("inline-block h-4 w-4 shrink-0 object-contain", className)} style={style} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block h-4 w-4 shrink-0 bg-current", className)}
      style={{ WebkitMask: `url(${mark}) center / contain no-repeat`, mask: `url(${mark}) center / contain no-repeat`, ...style }}
    />
  );
}
