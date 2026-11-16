import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon3D, type Icon3DName } from "./Icon3D";

type FloatChipProps = {
  icon?: Icon3DName;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  tilt?: number;
  delay?: number;
  tone?: "light" | "lime" | "dark";
};

/** Tilted glass pill that floats around people — brand rule: info floats, it doesn't stack. */
export function FloatChip({
  icon,
  title,
  subtitle,
  className,
  tilt = 0,
  delay = 0,
  tone = "light",
}: FloatChipProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute z-20 animate-float", className)}
      style={{ "--tilt": `${tilt}deg`, animationDelay: `${delay}s` } as React.CSSProperties}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4",
          tone === "light" && "glass-chip text-ink",
          tone === "lime" && "bg-lime text-midnight shadow-float",
          tone === "dark" && "glass-dark text-primary-foreground shadow-float",
        )}
      >
        {icon && <Icon3D name={icon} eager className="-my-2 size-11 shrink-0" />}
        <span className="flex flex-col leading-tight">
          {subtitle && (
            <span
              className={cn(
                "text-[11px] font-semibold",
                tone === "dark" ? "text-on-blue" : tone === "lime" ? "text-midnight/75" : "text-ink/70",
              )}
            >
              {subtitle}
            </span>
          )}
          <span className="whitespace-nowrap text-sm font-extrabold">{title}</span>
        </span>
      </div>
    </div>
  );
}
