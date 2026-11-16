import learner from "@/assets/about/vision-founder.webp";
import { FloatChip } from "@/components/site/FloatChip";
import { Reveal } from "@/components/site/motion";

/** Serious mode: Midnight grounds the long-term vision for partners and investors. */
export function Vision() {
  return (
    <section id="vision" className="bg-background px-5 pb-16 pt-6 lg:pb-28">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] bg-midnight text-primary-foreground lg:rounded-[48px]">
        <div className="absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
        <div
          className="absolute -right-24 -top-32 aspect-square w-[520px] rounded-full bg-glow-behind opacity-70"
          aria-hidden="true"
        />

        <div className="relative grid items-end gap-6 lg:grid-cols-[1.25fr_1fr]">
          <Reveal className="px-6 pb-2 pt-12 lg:px-14 lg:py-20">
            <p className="eyebrow text-lime">Our vision</p>
            <p
              className="mt-4 text-[88px] font-extrabold leading-none tracking-[-0.05em] text-transparent [-webkit-text-stroke:2px_var(--sky)] sm:text-[120px] lg:text-[148px]"
              aria-hidden="true"
            >
              2030
            </p>
            <h2 className="text-h2 mt-4 max-w-[22ch] text-primary-foreground">
              The operating system for Africa's{" "}
              <span className="text-lime">creator economy.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-on-blue">
              By 2030, we see millions of verified creators across the continent earning a
              sustainable living from what they know, powered by Enski.
            </p>
          </Reveal>

          <Reveal delay={120} className="relative mx-auto h-[340px] w-full max-w-[420px] lg:h-[500px]">
            <div
              className="absolute left-1/2 top-[10%] aspect-square w-[90%] -translate-x-1/2 rounded-full border border-primary-foreground/10"
              aria-hidden="true"
            />
            <img
              src={learner}
              alt="Smiling young woman in a sky blue Enski sweatshirt holding a tablet"
              width={733}
              height={1100}
              loading="lazy"
              className="absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />
            <FloatChip
              className="left-0 top-[18%] lg:left-[-8%]"
              tilt={-5}
              tone="lime"
              icon="profile"
              subtitle="The goal"
              title="Millions of creators"
            />
            <FloatChip
              className="bottom-[14%] right-0 lg:right-[2%]"
              tilt={4}
              delay={1}
              tone="dark"
              icon="globe"
              subtitle="Across the continent"
              title="One platform"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
