import { useState } from "react";
import { ArrowRight } from "lucide-react";
import creatorCelebrate from "@/assets/people/creator-celebrate.webp";
import learnerSweatshirt from "@/assets/people/learner-sweatshirt.webp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FloatChip } from "./FloatChip";
import type { Icon3DName } from "./Icon3D";
import { links } from "./data";
import { Reveal } from "./motion";

const content = {
  creators: {
    image: creatorCelebrate,
    alt: "Excited creator in a navy Enski sweatshirt celebrating with both hands up",
    size: { w: 1120, h: 960 },
    imgClass: "h-[80%] w-auto lg:h-[76%]",
    chipPos: "left-0 top-[24%] lg:top-[34%]",
    cta: { label: "Start creating", href: links.register },
    chip: { icon: "analytics" as Icon3DName, subtitle: "Revenue", title: "+32% this month" },
    badge: { icon: "salespage" as Icon3DName, title: "Published" },
    items: [
      { title: "Reach more people", body: "Get discovered by thousands of active learners in the Dreamverse marketplace." },
      { title: "Create fast, publish instantly", body: "Build courses, ebooks and live sessions in minutes. No tech background needed." },
      { title: "Built to help you sell more", body: "From automated follow-ups to affiliates, everything grows your audience and revenue." },
      { title: "Total product control", body: "Set your price, your format, and whether it's in the marketplace or private." },
      { title: "Keep more of what you earn", body: "Get paid faster, in more currencies, with lower fees." },
    ],
  },
  learners: {
    image: learnerSweatshirt,
    alt: "Smiling learner in a cobalt Enski sweatshirt",
    size: { w: 789, h: 1100 },
    imgClass: "h-[88%] w-auto",
    chipPos: "bottom-[16%] left-0",
    cta: { label: "Start learning", href: links.dreamverse },
    chip: { icon: "trophy" as Icon3DName, subtitle: "Unlocked", title: "Certificate earned" },
    badge: { icon: "flame" as Icon3DName, title: "Day 12 streak" },
    items: [
      { title: "Learn from people like you", body: "Practical skills taught by African creators who've done the work." },
      { title: "Pay small, learn big", body: "Split payments let you start a premium course without a big upfront cost." },
      { title: "Low data, mobile first", body: "Lessons that load fast on any phone and any network." },
      { title: "Earn proof of your skills", body: "Finish lessons, keep your streak and earn certificates you can share." },
      { title: "Never learn alone", body: "Join the Dreamers Trybe for events, discussions and support." },
    ],
  },
};

type Tab = keyof typeof content;

export function WhyEnski() {
  const [tab, setTab] = useState<Tab>("creators");
  const c = content[tab];

  return (
    <section className="relative overflow-hidden bg-soft pt-16 lg:pt-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="max-w-2xl">
            <p className="eyebrow text-sky-text">Why Enski</p>
            <h2 className="text-h2 mt-3 text-ink">
              Why creators &amp; learners choose <span className="text-brand">Enski.</span>
            </h2>
            <p className="mt-4 text-[17px] text-muted-foreground">
              The all-in-one platform to learn new skills or monetise your knowledge.
            </p>
          </Reveal>
          <div role="tablist" aria-label="Audience" className="flex rounded-full bg-background p-1.5 shadow-card">
            {(["creators", "learners"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "h-11 rounded-full px-6 text-[15px] font-extrabold transition-colors",
                  tab === t ? "bg-cobalt text-primary-foreground" : "text-brand hover:bg-ice",
                )}
              >
                For {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-end">
          <div className="relative order-2 mx-auto h-[400px] w-full max-w-[480px] lg:order-1 lg:h-[580px]">
            <div
              className="absolute left-1/2 top-[6%] aspect-square w-[92%] -translate-x-1/2 rounded-full bg-glow-behind"
              aria-hidden="true"
            />
            <img
              key={tab}
              src={c.image}
              alt={c.alt}
              width={c.size.w}
              height={c.size.h}
              loading="lazy" decoding="async"
              className={cn(
                "absolute bottom-0 left-1/2 z-10 max-w-none -translate-x-1/2 object-contain object-bottom animate-in fade-in slide-in-from-bottom-4 duration-500",
                c.imgClass,
              )}
            />
            <FloatChip
              className={c.chipPos}
              tilt={-4}
              icon={c.chip.icon}
              subtitle={c.chip.subtitle}
              title={c.chip.title}
            />
            <FloatChip
              className="right-0 top-[14%] lg:top-[20%]"
              tilt={5}
              delay={1}
              tone="lime"
              icon={c.badge.icon}
              title={c.badge.title}
            />
          </div>

          <div className="order-1 lg:order-2 lg:pb-24">
            <ol className="space-y-6">
              {c.items.map((item, i) => (
                <Reveal
                  as="li"
                  key={`${tab}-${item.title}`}
                  delay={i * 80}
                  className="flex gap-5 border-b border-line pb-6 last:border-0"
                >
                  <span className="text-2xl font-extrabold text-sky">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-xl font-extrabold text-ink">{item.title}</h3>
                    <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Button asChild size="lg" className="mt-4">
              <a href={c.cta.href}>
                {c.cta.label} <ArrowRight />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
