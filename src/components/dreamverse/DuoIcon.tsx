import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number | string }>;

const sizes = {
  sm: { tile: "size-10 rounded-[12px]", icon: "size-5" },
  md: { tile: "size-12 rounded-[14px]", icon: "size-6" },
  lg: { tile: "size-14 rounded-[16px]", icon: "size-7" },
} as const;

/**
 * Duotone feature icon: one Lucide outline glyph (1.75 stroke) over a soft tinted fill,
 * inside a rounded tile. Used for every feature list so similar items share one style.
 * Brand logos (WhatsApp, Telegram) can be passed as `brand` to sit in the same tile.
 */
export function DuoIcon({
  icon: Icon,
  brand: Brand,
  tone = "light",
  size = "md",
  className,
}: {
  icon?: IconComponent | undefined;
  brand?: ComponentType<{ className?: string; "aria-hidden"?: boolean }> | undefined;
  tone?: "light" | "blue";
  size?: keyof typeof sizes;
  className?: string;
}) {
  const s = sizes[size];
  const blue = tone === "blue";
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center",
        s.tile,
        blue ? "bg-on-blue/10 text-lime ring-1 ring-inset ring-on-blue/15" : "bg-ice text-brand",
        className,
      )}
    >
      {Icon ? (
        <Icon
          className={s.icon}
          strokeWidth={1.75}
          fill={blue ? "var(--on-blue)" : "var(--sky)"}
          fillOpacity={blue ? 0.16 : 0.22}
        />
      ) : Brand ? (
        <Brand aria-hidden className={cn(s.icon, "p-px")} />
      ) : null}
    </span>
  );
}
