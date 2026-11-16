import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const sections = [
  { id: "create", label: "Create" },
  { id: "sell", label: "Sell" },
  { id: "discover", label: "Get discovered" },
  { id: "teach", label: "Teach" },
  { id: "grow", label: "Grow" },
  { id: "store", label: "Your store" },
];

/** Google-style sticky in-page navigation with scroll spy. */
export function SectionNav() {
  const [active, setActive] = useState("create");
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Keep the active pill visible when the bar scrolls sideways on phones
  useEffect(() => {
    const nav = navRef.current;
    const pill = nav?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!nav || !pill) return;
    const left = pill.offsetLeft - nav.clientWidth / 2 + pill.clientWidth / 2;
    nav.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <div className="sticky top-[84px] z-40 -mt-px">
      <div className="mx-auto flex max-w-[1200px] justify-center px-5 md:px-8">
        <nav
          ref={navRef}
          aria-label="Feature sections"
          className="glass-on-light flex max-w-full gap-1 overflow-x-auto rounded-full p-1.5 shadow-soft ring-2 ring-lime ring-offset-2 ring-offset-transparent [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              data-id={s.id}
              href={`#${s.id}`}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300",
                active === s.id
                  ? "bg-cobalt text-primary-foreground"
                  : "text-slate hover:bg-ice hover:text-brand",
              )}
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
