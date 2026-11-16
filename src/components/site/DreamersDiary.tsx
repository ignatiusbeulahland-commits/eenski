import { ArrowRight, Check, Flame, NotebookPen, Rocket, Target, UsersRound, type LucideIcon } from "lucide-react";
import ddMark from "@/assets/dreamers-diary-mark.webp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DuoIcon } from "./DuoIcon";
import { Reveal } from "./motion";

const points: { icon: LucideIcon; t: string }[] = [
  { icon: NotebookPen, t: "Write down your dreams" },
  { icon: Target, t: "Set goals and build daily habits" },
  { icon: UsersRound, t: "Stay accountable with a supportive community" },
];

export function DreamersDiary() {
  return (
    <section id="dreamers-diary" className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal className="relative overflow-hidden rounded-[32px] bg-cobalt-light px-6 py-10 text-primary-foreground md:rounded-[40px] md:px-12 md:py-14">
          <div className="absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
          <div
            className="parallax-y absolute -right-24 -top-24 aspect-square w-[360px] rounded-full bg-glow-behind md:w-[480px]"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid size-14 place-items-center rounded-[18px] bg-card shadow-float">
                  <img src={ddMark} alt="" width={128} height={128} loading="lazy" decoding="async" className="size-11" />
                </span>
                <span className="inline-flex items-center rounded-full bg-lime px-3 py-1 text-[12px] font-extrabold text-midnight">
                  Coming soon
                </span>
              </div>

              <h2 className="text-h2 mt-6 text-primary-foreground">
                The Dreamers <span className="text-lime">Diary.</span>
              </h2>
              <p className="mt-4 max-w-[520px] text-[17px] leading-relaxed text-on-blue">
                A social accountability space where you track your dreams, goals and habits, and keep
                moving with a community of dreamers cheering you on.
              </p>

              <ul className="mt-7 space-y-3">
                {points.map(({ icon: Icon, t }) => (
                  <li key={t} className="flex items-center gap-3 text-[15px] font-bold">
                    <DuoIcon icon={Icon} tone="blue" size="sm" />
                    {t}
                  </li>
                ))}
              </ul>

              <Button asChild variant="lime" size="lg" className="mt-8">
                <a href="#newsletter">
                  Get notified at launch <ArrowRight />
                </a>
              </Button>
            </div>

            <DiaryMock />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DiaryMock() {
  const entries: { tag: string; icon: LucideIcon; t: string; done: boolean }[] = [
    { tag: "Dream", icon: Rocket, t: "Launch my design studio", done: false },
    { tag: "Goal", icon: Target, t: "Finish the UX course this month", done: true },
    { tag: "Habit", icon: Flame, t: "Practise 30 minutes daily", done: true },
  ];
  const week = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <div className="rounded-[24px] border border-line bg-card p-5 pt-7 text-foreground shadow-float">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold text-muted-foreground">My diary</p>
            <p className="text-[17px] font-extrabold">Today</p>
          </div>
          <img src={ddMark} alt="" width={128} height={128} loading="lazy" decoding="async" className="size-9" />
        </div>

        <ul className="mt-4 space-y-2">
          {entries.map(({ tag, icon: Icon, t, done }) => (
            <li key={tag} className="flex items-center gap-3 rounded-[16px] bg-soft p-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-ice text-brand">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand">
                  {tag}
                </span>
                <span className="block text-[13px] font-bold leading-[18px]">{t}</span>
              </span>
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full",
                  done ? "bg-cobalt text-primary-foreground" : "border-2 border-line",
                )}
              >
                {done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <p className="text-[12px] font-bold text-muted-foreground">This week</p>
          <div className="mt-2 flex gap-1.5">
            {week.map((d, i) => (
              <span key={i} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-8 w-full rounded-[10px]",
                    i < 4 ? "bg-cobalt" : i === 4 ? "bg-sky-light" : "bg-ice",
                  )}
                />
                <span className="text-[11px] font-bold text-muted-foreground">{d}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <span
        className="glass-chip absolute -right-2 -top-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-4 text-[13px] font-extrabold text-foreground shadow-float animate-float-slow md:-right-8"
        style={{ ["--tilt" as string]: "4deg" }}
      >
        <span className="grid size-8 place-items-center rounded-full bg-lime text-midnight">
          <UsersRound className="size-4" />
        </span>
        Your circle cheered you on
      </span>
    </div>
  );
}
