import {
  Check,
  Flame,
  MessageCircleHeart,
  NotebookPen,
  Rocket,
  Target,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ddMark from "@/assets/dreamers-diary-mark.webp";
import { Container, Reveal } from "./primitives";
import { DuoIcon } from "./DuoIcon";

const points: { icon: LucideIcon; t: string }[] = [
  { icon: NotebookPen, t: "Write down your dreams" },
  { icon: Target, t: "Set goals and build daily habits" },
  { icon: UsersRound, t: "Stay accountable with a supportive community" },
];

/** Spotlight for The Dreamers Diary, its own band right after the Grow section. */
export function DreamersDiary() {
  return (
    <section id="dreamers-diary" aria-label="The Dreamers Diary" className="pb-20 md:pb-28">
      <Container>
    <Reveal className="relative">
      <div className="relative overflow-hidden rounded-[32px] bg-cobalt-light px-6 py-10 text-on-blue md:rounded-[40px] md:px-12 md:py-14">
        <div aria-hidden className="dot-grid-on-blue absolute inset-0 opacity-50" />
        <div
          aria-hidden
          className="halo-white absolute -right-24 -top-24 size-[360px] md:-right-10 md:-top-32 md:size-[480px]"
        />

        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-14 place-items-center rounded-[18px] bg-card shadow-float">
                <img src={ddMark} alt="" width={160} height={160} loading="lazy" decoding="async" className="size-11" />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 fs-12 font-extrabold text-midnight">
                Coming soon
              </span>
            </div>

            <h3 className="type-h1 mt-6">
              The Dreamers <span className="text-lime">Diary.</span>
            </h3>
            <p className="type-body-lg mt-4 max-w-[520px] text-on-blue/85">
              A social accountability space where you track your dreams, goals and habits, and keep
              moving with a community of dreamers cheering you on.
            </p>

            <ul className="mt-7 space-y-3">
              {points.map((p) => (
                <li key={p.t} className="flex items-center gap-3 fs-15 font-bold">
                  <DuoIcon icon={p.icon} tone="blue" size="sm" />
                  {p.t}
                </li>
              ))}
            </ul>
          </div>

          <DiaryMock />
        </div>
      </div>
    </Reveal>
      </Container>
    </section>
  );
}

function DiaryMock() {
  const entries: { tag: string; icon: LucideIcon; t: string; done: boolean }[] = [
    { tag: "Dream", icon: Rocket, t: "Your big dream goes here", done: false },
    { tag: "Goal", icon: Target, t: "A goal that moves you closer", done: true },
    { tag: "Habit", icon: Flame, t: "A small daily habit", done: true },
  ];
  const week = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <div className="relative mx-auto w-full max-w-[420px] [--ts:1]">
      <div className="rounded-[24px] border border-line bg-card p-5 pt-7 text-ink shadow-lift">
        <div className="flex items-center justify-between">
          <div>
            <p className="fs-12 font-bold text-muted-foreground">My diary</p>
            <p className="fs-17 font-extrabold">Today</p>
          </div>
          <img src={ddMark} alt="" width={160} height={160} loading="lazy" decoding="async" className="size-9" />
        </div>

        <ul className="mt-4 space-y-2">
          {entries.map((e) => (
            <li key={e.tag} className="flex items-center gap-3 rounded-[16px] bg-soft p-2.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-ice text-brand">
                <e.icon className="size-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block fs-11 font-extrabold uppercase tracking-[0.08em] text-brand">
                  {e.tag}
                </span>
                <span className="block fs-13 font-bold lh-18">{e.t}</span>
              </span>
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full",
                  e.done ? "bg-cobalt text-primary-foreground" : "border-2 border-line",
                )}
              >
                {e.done && <Check className="size-3.5" strokeWidth={3} />}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <p className="fs-12 font-bold text-muted-foreground">This week</p>
          <div className="mt-2 flex gap-1.5">
            {week.map((d, i) => (
              <span key={i} className="flex flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-8 w-full rounded-[10px]",
                    i < 4 ? "bg-cobalt" : i === 4 ? "bg-sky-light-glow" : "bg-ice",
                  )}
                />
                <span className="fs-11 font-bold text-muted-foreground">{d}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <span
        className="glass-on-light absolute -right-2 -top-6 inline-flex whitespace-nowrap items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 fs-13 font-extrabold text-ink shadow-float animate-float-slow md:-right-8"
        style={{ ["--tilt" as string]: "4deg" }}
      >
        <span className="grid size-8 place-items-center rounded-full bg-ice text-brand">
          <MessageCircleHeart className="size-4" strokeWidth={2} />
        </span>
        Your circle cheered you on
      </span>
    </div>
  );
}
