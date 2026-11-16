import { Compass, FileDown, MonitorPlay, UsersRound, Video, Wallet, type LucideIcon } from "lucide-react";
import { DuoIcon } from "./DuoIcon";

const items: { icon: LucideIcon; t: string }[] = [
  { icon: MonitorPlay, t: "Create courses" },
  { icon: FileDown, t: "Sell downloads" },
  { icon: Video, t: "Host live sessions" },
  { icon: Wallet, t: "Get paid in 20+ currencies" },
  { icon: Compass, t: "Get discovered" },
  { icon: UsersRound, t: "Grow your community" },
];

/** Tilted brand band that scrolls endlessly. Clipped so it can never cause sideways scroll. */
export function Ticker() {
  const loop = [...items, ...items];
  return (
    <div aria-hidden className="relative overflow-hidden py-6 md:py-8">
      <div className="-mx-6 -rotate-2 bg-cobalt py-3 shadow-float md:py-4">
        <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
          {loop.map((it, i) => (
            <span key={i} className="flex items-center gap-3 whitespace-nowrap pr-8 md:pr-12">
              <DuoIcon icon={it.icon} tone="blue" size="sm" className="rounded-full" />
              <span className="fs-17 font-extrabold text-on-blue md:fs-22">{it.t}</span>
              <span className="ml-5 size-2.5 shrink-0 rounded-full bg-lime md:ml-9" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
