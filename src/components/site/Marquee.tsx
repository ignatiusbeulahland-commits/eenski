import { BookOpen, Download, Globe2, Radio, Users, Wallet } from "lucide-react";
import { DuoIcon } from "./DuoIcon";

const items = [
  { icon: BookOpen, label: "Learn at your pace" },
  { icon: Download, label: "Sell downloads" },
  { icon: Radio, label: "Host live sessions" },
  { icon: Wallet, label: "Get paid in 20+ currencies" },
  { icon: Globe2, label: "Get discovered" },
  { icon: Users, label: "Join the Dreamers Trybe" },
];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative -mt-2 overflow-hidden bg-background py-6" aria-hidden="true">
      <div className="-rotate-2 scale-105 bg-cobalt py-4 shadow-float">
        <div className="flex w-max animate-marquee items-center gap-8">
          {row.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="flex items-center gap-3 text-lg font-extrabold text-primary-foreground lg:text-2xl">
                <DuoIcon icon={Icon} tone="blue" size="sm" className="rounded-full lg:size-11" />
                {label}
              </span>
              <span className="size-2.5 rounded-full bg-lime" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
