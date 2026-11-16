import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/features/button";
import { cutouts } from "./cutouts";
import { links } from "./links";
import { Icon3D } from "./icons3d";
import { CountUp } from "./CountUp";
import { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

const line1 = ["Build.", "Sell.", "Teach."];

export function Hero() {
  // Replay the headline and intro each time the visitor scrolls back up to the top.
  const [ref, inView] = useInView<HTMLElement>(0.35, false);
  const [run, setRun] = useState(0);
  const left = useRef(false);
  useEffect(() => {
    if (!inView) {
      left.current = true;
    } else if (left.current) {
      left.current = false;
      setRun((r) => r + 1);
    }
  }, [inView]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-cobalt-light pt-[72px]">
      <div aria-hidden className="dot-grid-on-blue absolute inset-0 opacity-60" />
      {/* Big studio glow behind the subject */}
      <div
        aria-hidden
        className="halo-sky absolute -right-40 top-10 h-[620px] w-[620px] rounded-full opacity-80 md:right-[-60px] md:h-[820px] md:w-[820px] lg:right-0"
      />

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 px-5 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <div key={run} className="relative z-10 pb-10 pt-12 md:pt-20 lg:pb-32 lg:pt-28">
          <p className="type-eyebrow animate-rise text-lime">Features for creators</p>
          {/* Real spaces between words so the headline reads and copies as "Build. Sell. Teach. Earn. Repeat." */}
          <h1 className="type-display mt-5 text-on-blue">
            {line1.map((w, i) => (
              <span key={w}>
                <span className="word-rise" style={{ ["--i" as string]: i }}>
                  {w}
                </span>{" "}
              </span>
            ))}
            <br />
            <span className="word-rise" style={{ ["--i" as string]: 3 }}>
              Earn.
            </span>{" "}
            <span className="word-rise word-pop text-lime" style={{ ["--i" as string]: 4 }}>
              Repeat.
            </span>
          </h1>
          <p className="type-body-lg mt-6 max-w-[520px] text-on-blue/85 animate-rise [animation-delay:160ms]">
            The single platform where African creators turn their knowledge into income, influence
            and impact, with zero complexity and zero limits.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row animate-rise [animation-delay:240ms]">
            <Button asChild variant="lime" size="lg">
              <a href={links.register}>
                Start creating free <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline-blue" size="lg">
              <a href="#create">See every feature</a>
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 animate-rise [animation-delay:320ms]">
            {["Free to start", "Split payments", "20+ currencies"].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm font-bold text-on-blue/90">
                <span className="grid size-5 place-items-center rounded-full bg-lime text-midnight">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Person + floating props */}
        <div className="relative z-0 -mt-4 [--ts:1] h-[440px] sm:h-[520px] lg:mt-0 lg:h-auto">
          <img
            src={cutouts.hero.src}
            srcSet={cutouts.hero.srcSet}
            sizes={cutouts.hero.sizes}
            alt="Smiling Enski creator celebrating a sale on her phone"
            width={1024}
            height={1280}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 object-contain object-bottom lg:h-[640px]"
          />

          <FloatChip className="left-0 top-10 sm:left-6 lg:left-[-24px] lg:top-36" tilt="-4deg">
            <Icon3D name="wallet" eager className="-my-2 size-11" />
            <span>
              <span className="block fs-12 font-semibold text-on-blue/75">New payout</span>
              <span className="block fs-15 font-extrabold text-on-blue">
                <CountUp value="₦248,500" duration={1800} />
              </span>
            </span>
          </FloatChip>

          <FloatChip
            className="right-0 top-24 sm:right-4 lg:right-[-12px] lg:top-52"
            tilt="3deg"
            fast
          >
            <Icon3D name="profile" eager className="-my-2 size-11" />
            <span>
              <span className="block fs-15 font-extrabold text-on-blue">
                <CountUp value="780" duration={1800} />
              </span>
              <span className="block fs-12 font-semibold text-on-blue/75">Active learners</span>
            </span>
          </FloatChip>

          <FloatChip solid className="bottom-24 left-0 sm:left-10 lg:bottom-40 lg:left-0" tilt="2deg" fast>
            <Icon3D name="ebook" eager className="-my-2 size-10" />
            <span className="text-sm font-extrabold text-ink">E-courses</span>
          </FloatChip>

          <FloatChip solid className="bottom-8 right-0 sm:right-12 lg:bottom-12 lg:right-0" tilt="-3deg">
            <Icon3D name="video" eager className="-my-2 size-10" />
            <span className="text-sm font-extrabold text-ink">Live sessions</span>
          </FloatChip>

          <Icon3D
            name="analytics"
            eager
            className="absolute right-6 top-0 size-16 animate-bob sm:right-14 lg:right-20 lg:top-16 lg:size-20"
          />
        </div>
      </div>

      {/* soft curve into the page */}
      <div aria-hidden className="relative h-10 rounded-t-[40px] bg-background md:h-14 md:rounded-t-[56px]" />
    </section>
  );
}

function FloatChip({
  children,
  className,
  tilt = "0deg",
  fast = false,
  solid = false,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: string;
  fast?: boolean;
  solid?: boolean;
}) {
  return (
    <div
      className={
        (solid ? "bg-card shadow-lift " : "glass-on-blue shadow-float ") +
        "absolute z-10 flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 " +
        (fast ? "animate-float-fast " : "animate-float-slow ") +
        (className ?? "")
      }
      style={{ ["--tilt" as string]: tilt }}
    >
      {children}
    </div>
  );
}
