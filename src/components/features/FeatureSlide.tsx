import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DuoIcon } from "./DuoIcon";

/** One feature card inside an AutoCarousel, with a duotone feature icon. */
export function FeatureSlide({
  icon,
  title,
  body,
  tone = "light",
  index,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  tone?: "light" | "blue";
  index?: number;
}) {
  const blue = tone === "blue";
  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[28px] p-6 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 md:p-7",
        blue ? "glass-on-blue hover:shadow-float" : "border border-line bg-card hover:shadow-lift",
      )}
    >
      <div className="flex items-start justify-between">
        <DuoIcon icon={icon} tone={tone} size="lg" />
        {typeof index === "number" && (
          <span
            aria-hidden
            className={cn("fs-13 font-extrabold tabular-nums", blue ? "text-on-blue/60" : "text-muted-foreground")}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <h3 className={cn("mt-6 fs-19 font-extrabold leading-tight", blue ? "text-on-blue" : "text-ink")}>
        {title}
      </h3>
      <p className={cn("mt-2 fs-15 lh-24", blue ? "text-on-blue/80" : "text-muted-foreground")}>{body}</p>
    </article>
  );
}
