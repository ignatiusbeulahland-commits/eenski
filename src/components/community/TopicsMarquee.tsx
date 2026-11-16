import { Icon3D } from "@/components/site/Icon3D";
import { topics } from "./data";

/** Topics members learn together, scrolling under the hero. Still under reduced motion. */
export function TopicsMarquee() {
  const row = [...topics, ...topics];
  return (
    <section aria-label="Topics in the community" className="relative overflow-hidden border-b border-line bg-background py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />
      <ul className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
        {row.map((t, i) => (
          <li
            key={`${t.label}-${i}`}
            aria-hidden={i >= topics.length ? true : undefined}
            className="flex shrink-0 items-center gap-2 rounded-full bg-ice py-1.5 pl-1.5 pr-5 text-[15px] font-bold text-brand"
          >
            <Icon3D name={t.icon} className="size-9" />
            {t.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
