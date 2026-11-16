import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  action,
  onBlue = false,
  className,
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  onBlue?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className={cn("dv-eyebrow", onBlue ? "text-lime" : "text-sky-text")}>{eyebrow}</p>}
        <h2 id={id} className={cn("dv-h2 mt-2", onBlue ? "text-on-blue" : "text-ink")}>
          {title}
        </h2>
        {children && (
          <p className={cn("mt-3 text-base leading-relaxed sm:text-[17px]", onBlue ? "text-on-blue-muted" : "text-muted-foreground")}>
            {children}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
