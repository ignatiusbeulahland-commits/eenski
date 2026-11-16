import { Bell, ChartPie, Compass, Share2, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./primitives";
import { AutoCarousel } from "./AutoCarousel";
import { FeatureSlide } from "./FeatureSlide";
import { CountUp } from "./CountUp";
import { Icon3D } from "./icons3d";
import { useInView } from "./useInView";

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Compass,
    title: "Listed on Dreamverse",
    body: "Your products appear on Dreamverse, the Enski marketplace, where learners already search for skills to build their careers.",
  },
  {
    icon: SlidersHorizontal,
    title: "Full control. Zero stress.",
    body: "Your pricing, your content and your data stay yours. We simply make managing them easier.",
  },
  {
    icon: Share2,
    title: "Social sharing tools",
    body: "Share your course to WhatsApp, Instagram, X, Facebook and LinkedIn in one tap.",
  },
  {
    icon: ChartPie,
    title: "Deep analytics",
    body: "See what is working, where learners drop off and how to improve your product.",
  },
  {
    icon: Bell,
    title: "Email notifications",
    body: "Keep learners engaged with automatic lesson reminders, updates and announcements.",
  },
];

// Smooth revenue curve for the dashboard mock
const points = [12, 18, 15, 26, 22, 34, 31, 42, 39, 52, 58, 72];
const W = 640;
const H = 200;
const step = W / (points.length - 1);
const max = 80;
const coords = points.map((p, i) => [i * step, H - (p / max) * H] as const);
const last = coords[coords.length - 1]!;
const line = coords
  .map(([x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = coords[i - 1]!;
    const cx = (px + x) / 2;
    return `C${cx},${py} ${cx},${y} ${x},${y}`;
  })
  .join(" ");
const area = `${line} L${W},${H} L0,${H} Z`;

export function GrowSection() {
  return (
    <section id="grow" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Grow"
          title="Grow your audience"
          highlight="faster."
          subtitle="Reach thousands of learners and understand exactly what keeps them coming back."
        />

        <Reveal className="relative mx-auto mt-14 max-w-[1000px]">
          <div aria-hidden className="absolute inset-x-3 -bottom-4 top-16 rounded-[32px] bg-ice md:-inset-x-6 md:-bottom-6 md:rounded-[40px]" />
          <div className="relative overflow-hidden rounded-[28px] border border-line bg-card p-5 shadow-lift [--ts:1] md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="fs-13 font-bold text-muted-foreground">Creator dashboard</p>
                <p className="fs-20 font-extrabold text-ink">Good morning, Ada</p>
              </div>
              <div className="flex gap-1 rounded-full bg-soft p-1 fs-13 font-bold">
                {["7d", "30d", "12m"].map((t, i) => (
                  <span
                    key={t}
                    className={
                      "rounded-full px-3 py-1.5 " +
                      (i === 2 ? "bg-card text-brand shadow-soft" : "text-muted-foreground")
                    }
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { l: "Revenue", v: "₦4.8M", d: "+32%" },
                { l: "Learners", v: "2,184", d: "+18%" },
                { l: "Completion", v: "74%", d: "+6%" },
                { l: "Affiliate sales", v: "₦920k", d: "+41%" },
              ].map((k, i) => (
                <div
                  key={k.l}
                  className={
                    "rounded-[18px] p-4 " + (i === 0 ? "bg-cobalt text-primary-foreground" : "bg-soft")
                  }
                >
                  <p className={"fs-12 font-bold " + (i === 0 ? "text-on-blue/75" : "text-muted-foreground")}>
                    {k.l}
                  </p>
                  <p className={"mt-1 fs-22 font-extrabold tracking-tight " + (i === 0 ? "" : "text-ink")}>
                    <CountUp value={k.v} />
                  </p>
                  <p className={"fs-12 font-extrabold " + (i === 0 ? "text-lime" : "text-brand")}>{k.d}</p>
                </div>
              ))}
            </div>

            <RevenueChart />
          </div>
          <Icon3D
            name="analytics"
            className="parallax-y absolute -bottom-10 right-2 size-24 md:-bottom-12 md:-right-12 md:size-32"
          />
        </Reveal>

        <Reveal className="mt-20">
          <AutoCarousel label="Growth features">
            {features.map((f, i) => (
              <FeatureSlide key={f.title} {...f} index={i} />
            ))}
          </AutoCarousel>
        </Reveal>
      </Container>
    </section>
  );
}

/** Revenue line draws itself in each time the dashboard scrolls into view. */
function RevenueChart() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4, false);
  return (
    <div ref={ref} className="mt-6 rounded-[20px] bg-soft p-4 md:p-6">
      <div className="flex items-center justify-between">
        <p className="fs-14 font-extrabold text-ink">Revenue over time</p>
        <span className="inline-flex items-center gap-1.5 fs-12 font-bold text-muted-foreground">
          <span className="size-2 rounded-full bg-cobalt" /> This year
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H + 10}`}
        className="mt-4 h-[160px] w-full overflow-visible md:h-[210px]"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--sky)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--sky)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} stroke="var(--line)" strokeDasharray="4 6" />
        ))}
        <path
          d={area}
          fill="url(#rev)"
          className={cn("chart-fade", inView && "is-in")}
        />
        <path
          d={line}
          pathLength={1}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="3.5"
          strokeLinecap="round"
          className={cn("chart-draw", inView && "is-in")}
        />
        <circle
          cx={last[0] - 2}
          cy={last[1]}
          r="7"
          fill="var(--brand)"
          stroke="var(--card)"
          strokeWidth="3"
          className={cn("chart-dot", inView && "is-in")}
        />
      </svg>
    </div>
  );
}
