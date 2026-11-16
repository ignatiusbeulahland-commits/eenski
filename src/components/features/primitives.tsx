import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Logo({ onBlue = false, className }: { onBlue?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "fs-26 font-extrabold leading-none tracking-[-0.04em]",
        onBlue ? "text-on-blue" : "text-brand",
        className,
      )}
    >
      enski<span className={onBlue ? "text-lime" : "text-sky"}>.</span>
    </span>
  );
}

/**
 * Animates content in every time it enters the viewport, in both scroll directions:
 * rises from below when scrolling down, drops in from above when scrolling up.
 * It resets only once fully off screen, so nothing flickers while visible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [from, setFrom] = useState<"top" | "bottom">("bottom");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (!entry.isIntersecting) {
          // Off screen: remember which side it left from so the next entry comes from there.
          const rootTop = entry.rootBounds?.top ?? 0;
          setFrom(entry.boundingClientRect.top < rootTop ? "top" : "bottom");
          setVisible(false);
        } else if (entry.intersectionRatio >= 0.1 || entry.intersectionRect.height >= 120) {
          setVisible(true);
        }
      },
      { threshold: [0, 0.1, 0.25] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-from={from}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  after,
  subtitle,
  onBlue = false,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  after?: string;
  subtitle?: string;
  onBlue?: boolean;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p className={cn("type-eyebrow mb-4", onBlue ? "text-lime" : "text-sky-text")}>{eyebrow}</p>
      )}
      <h2 className={cn("type-h1", onBlue ? "text-on-blue" : "text-ink")}>
        {title}
        {highlight && (
          <>
            {" "}
            <span className={onBlue ? "text-lime" : "text-brand"}>{highlight}</span>
          </>
        )}
        {after && <> {after}</>}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "type-body-lg mt-5",
            onBlue ? "text-on-blue/80" : "text-muted-foreground",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 md:px-8", className)}>{children}</div>;
}
