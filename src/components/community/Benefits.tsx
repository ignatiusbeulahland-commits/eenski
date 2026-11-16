import memberImg from "@/assets/community/member-wave.webp";
import { cn } from "@/lib/utils";
import { FloatChip } from "@/components/site/FloatChip";
import { Icon3D } from "@/components/site/Icon3D";
import { benefits } from "./data";
import { CountUp, Reveal } from "@/components/site/motion";

export function Benefits() {
  return (
    <section id="why-join" className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div
        className="absolute left-1/2 top-[30%] aspect-square w-[900px] max-w-[140%] -translate-x-1/2 rounded-full bg-glow-behind opacity-40"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1200px] px-5">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow-pill bg-ice text-brand">
            <span className="size-2 rounded-full bg-sky" aria-hidden="true" />
            Why join?
          </p>
          <h2 className="text-h2 mt-4 text-ink">
            Everything you <span className="text-brand">gain.</span>
          </h2>
          <p className="mt-4 text-[17px] text-muted-foreground">
            Be part of a thriving space built to help you learn, teach and earn.
          </p>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[1fr_400px_1fr] lg:gap-8">
          <ul className="grid gap-5 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:gap-8">
            {benefits.slice(0, 2).map((b, i) => (
              <BenefitItem key={b.title} {...b} delay={i * 100} align="right" />
            ))}
          </ul>

          {/* Member waving from the sky glow, inside an orbit of 3D props */}
          <Reveal
            delay={80}
            className="relative order-first mx-auto h-[420px] w-full max-w-[360px] lg:order-2 lg:h-[560px] lg:max-w-none"
          >
            <div
              className="absolute bottom-0 left-1/2 aspect-square w-[92%] -translate-x-1/2 rounded-full bg-sky-light-glow"
              aria-hidden="true"
            />
            <div
              className="orbit-ring-ink animate-orbit-slow absolute bottom-[-6%] left-1/2 aspect-square w-[112%] -translate-x-1/2"
              aria-hidden="true"
            />
            <img
              src={memberImg}
              alt="Smiling young man in a sky blue Enski hoodie and cobalt cargo trousers, waving and holding a phone"
              width={468}
              height={1080}
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 left-1/2 z-10 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />
            <FloatChip
              className="left-[-4%] top-[34%]"
              tilt={-4}
              tone="light"
              icon="profile"
              subtitle="This week"
              title={<CountUp value="+240 members" />}
            />
            <FloatChip
              className="bottom-[12%] right-[-4%]"
              tilt={5}
              delay={1}
              tone="light"
              icon="flame"
              title="12-day streak"
            />
            <Icon3D
              name="followup"
              className="absolute right-[4%] top-[8%] z-20 size-16 rotate-6 animate-bob lg:size-20"
            />
            <Icon3D
              name="mail"
              className="absolute bottom-[38%] left-[2%] z-0 size-12 -rotate-12 animate-bob [animation-delay:1.2s]"
            />
          </Reveal>

          <ul className="grid gap-5 sm:grid-cols-2 lg:order-3 lg:grid-cols-1 lg:gap-8">
            {benefits.slice(2).map((b, i) => (
              <BenefitItem key={b.title} {...b} delay={150 + i * 100} align="left" />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function BenefitItem({
  title,
  body,
  icon,
  delay,
  align,
}: (typeof benefits)[number] & { delay: number; align: "left" | "right" }) {
  return (
    <Reveal
      as="li"
      delay={delay}
      className={cn(
        "lift group relative rounded-[24px] border border-line bg-card/80 p-5 pt-6 shadow-card backdrop-blur-sm lg:p-6",
        align === "right" && "lg:text-right",
      )}
    >
      {/* Icon breaks out of the card's top edge */}
      <Icon3D
        name={icon}
        className={cn(
          "absolute -top-7 size-16 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 lg:size-[72px]",
          align === "right" ? "left-5 lg:left-auto lg:right-5" : "left-5",
        )}
      />
      <h3 className="mt-8 text-xl font-extrabold text-ink lg:text-[22px]">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{body}</p>
    </Reveal>
  );
}
