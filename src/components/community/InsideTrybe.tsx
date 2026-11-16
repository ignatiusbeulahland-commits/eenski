import { Radio } from "lucide-react";
import { Icon3D } from "@/components/site/Icon3D";
import { communityLearners, spaces } from "./data";
import { Reveal } from "@/components/site/motion";

/** Bento of the spaces members join. Every tile has a 3D prop breaking out of its edge. */
export function InsideTrybe() {
  const { live, cohorts, discussions, showcase } = spaces;
  return (
    <section className="relative bg-soft py-16 lg:py-24">
      <div className="absolute inset-0 bg-dots opacity-70 [--dot:color-mix(in_oklab,var(--sky)_14%,transparent)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-5">
        <Reveal className="max-w-2xl">
          <p className="eyebrow-pill bg-ice text-brand">
            <span className="size-2 rounded-full bg-sky" aria-hidden="true" />
            Inside the Trybe
          </p>
          <h2 className="text-h2 mt-4 text-ink">
            Spaces built for <span className="text-brand">growing together.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-6 lg:mt-16">
          {/* Live workshops: the lead tile */}
          <Reveal className="relative rounded-[24px] bg-cobalt-light p-7 text-primary-foreground shadow-float md:col-span-4 lg:p-9">
            <Icon3D name="video" className="absolute -top-9 right-6 size-20 rotate-6 animate-bob lg:size-24" />
            <Icon3D
              name="mic"
              className="absolute -bottom-6 right-[28%] hidden size-16 -rotate-12 animate-bob [animation-delay:1s] md:block"
            />
            <h3 className="text-2xl font-extrabold lg:text-[28px]">{live.title}</h3>
            <p className="mt-2 max-w-sm text-[15px] text-on-blue">{live.body}</p>

            <div className="glass-dark mt-7 max-w-md rounded-[20px] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-lime px-2 py-1 text-[12px] font-extrabold uppercase tracking-[0.12em] text-midnight">
                  <Radio className="size-3.5" aria-hidden="true" /> Live
                </span>
                <span className="text-[13px] font-semibold text-on-blue">{live.time}</span>
              </div>
              <p className="mt-3 text-lg font-extrabold">{live.session}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {communityLearners.slice(0, 4).map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      width={192}
                      height={192}
                      loading="lazy"
                      decoding="async"
                      className="size-7 rounded-full object-cover ring-2 ring-cobalt"
                    />
                  ))}
                </div>
                <span className="text-[13px] font-semibold text-on-blue">Members joining</span>
              </div>
            </div>
          </Reveal>

          {/* Cohorts */}
          <Reveal delay={100} className="relative rounded-[24px] bg-sky-light-glow p-7 text-midnight shadow-float md:col-span-2">
            <Icon3D name="analytics" className="absolute -top-8 right-5 size-[72px] -rotate-6 animate-bob [animation-delay:0.6s]" />
            <h3 className="mt-6 text-2xl font-extrabold">{cohorts.title}</h3>
            <p className="mt-2 text-[15px] font-semibold text-midnight/80">{cohorts.body}</p>
            <div className="mt-6 rounded-[16px] bg-primary-foreground/85 p-4">
              <div className="flex justify-between text-[13px] font-bold">
                <span>Week 3 of 6</span>
                <span>50%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-sky-200">
                <div className="h-full w-1/2 rounded-full bg-cobalt" />
              </div>
            </div>
          </Reveal>

          {/* Discussion groups */}
          <Reveal delay={60} className="relative rounded-[24px] border border-line bg-card p-7 shadow-card md:col-span-3">
            <Icon3D name="chat" className="absolute -top-8 left-6 size-[72px] rotate-6 animate-bob [animation-delay:1.4s]" />
            <h3 className="mt-6 text-2xl font-extrabold text-ink">{discussions.title}</h3>
            <p className="mt-2 text-[15px] text-muted-foreground">{discussions.body}</p>
            <ul className="mt-6 space-y-3">
              {discussions.messages.map((m, i) => (
                <li
                  key={m.who}
                  className={
                    i === 0
                      ? "max-w-[85%] rounded-[18px] rounded-tl-[6px] bg-ice px-4 py-3 text-[15px] text-ink"
                      : "ml-auto max-w-[85%] rounded-[18px] rounded-tr-[6px] bg-cobalt px-4 py-3 text-[15px] text-primary-foreground"
                  }
                >
                  <span className="block text-[13px] font-extrabold opacity-80">{m.who}</span>
                  {m.text}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Share your work */}
          <Reveal delay={140} className="relative overflow-visible rounded-[24px] bg-midnight p-7 text-primary-foreground shadow-float md:col-span-3">
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
              aria-hidden="true"
            >
              <div className="absolute -right-16 -top-16 aspect-square w-64 rounded-full bg-glow-behind opacity-70" />
            </div>
            <Icon3D name="megaphone" className="absolute -top-8 right-6 size-[72px] -rotate-6 animate-bob [animation-delay:0.3s]" />
            <h3 className="relative mt-6 text-2xl font-extrabold">{showcase.title}</h3>
            <p className="relative mt-2 text-[15px] text-on-blue">{showcase.body}</p>
            <div className="relative mt-6 flex flex-wrap gap-2">
              {["Portfolio", "First client", "New course", "Certificate"].map((tag, i) => (
                <span
                  key={tag}
                  className={
                    i === 0
                      ? "rounded-full bg-lime px-3.5 py-1.5 text-[13px] font-extrabold text-midnight"
                      : "glass-dark rounded-full px-3.5 py-1.5 text-[13px] font-bold"
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="relative mt-5 flex items-center gap-3">
              <Icon3D name="share" className="size-10" />
              <Icon3D name="storefront" className="size-10" />
              <Icon3D name="globe" className="size-10" />
              <span className="text-[13px] font-semibold text-on-blue">Share anywhere</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
