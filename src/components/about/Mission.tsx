import { BookOpen, Globe2, Radio } from "lucide-react";
import celebrate from "@/assets/about/mission-celebrate.webp";
import { DuoIcon } from "@/components/site/DuoIcon";
import { FloatChip } from "@/components/site/FloatChip";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal } from "@/components/site/motion";

const powers = [
  { icon: BookOpen, title: "Launch courses", body: "Turn what you know into courses and digital products." },
  { icon: Radio, title: "Host live streams", body: "Teach thousands at once with live sessions." },
  { icon: Globe2, title: "Get paid globally", body: "Collect payments from anywhere, in one checkout." },
];

export function Mission() {
  return (
    <section id="mission" className="bg-background py-16 lg:py-28">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-5 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Reveal>
          <p className="eyebrow text-sky-text">Our mission</p>
          <h2 className="text-h2 mt-4 text-ink">
            Breaking barriers for <span className="text-brand">knowledge commerce.</span>
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">
            Enski was founded with one clear goal: to tear down the technical and payment barriers
            that stop African creators from earning from their expertise. Knowledge is power, and
            the tools to share it should be simple.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Creators, schools and organisations use Enski to launch courses, host massive streams
            and get paid from anywhere, giving them real leverage in the creator economy.
          </p>

          <ul className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-5">
            {powers.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 90} className="flex gap-4 sm:flex-col sm:gap-3">
                <DuoIcon icon={p.icon} />
                <div>
                  <h3 className="text-base font-extrabold text-ink">{p.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Reveal>

        {/* Creator celebrating in a soft sky pool, props floating around */}
        <Reveal delay={120} className="relative mx-auto h-[360px] w-full max-w-[520px] sm:h-[440px] lg:h-[520px]">
          <div
            className="absolute inset-x-[4%] bottom-0 top-[8%] rounded-t-full bg-ice"
            aria-hidden="true"
          />
          <div
            className="absolute left-1/2 top-[14%] aspect-square w-[70%] -translate-x-1/2 rounded-full bg-glow-behind"
            aria-hidden="true"
          />
          <img
            src={celebrate}
            alt="Excited young woman in a cobalt Enski hoodie celebrating with both fists raised"
            width={1090}
            height={1004}
            loading="lazy"
            className="absolute bottom-0 left-1/2 z-10 h-auto w-[108%] max-w-none -translate-x-1/2 object-contain object-bottom"
          />
          <Icon3D name="megaphone" className="parallax-y absolute left-[2%] top-[6%] z-20 size-16 -rotate-12 animate-bob sm:size-20" />
          <Icon3D name="ebook" className="parallax-y absolute right-[4%] top-[2%] z-20 size-14 rotate-6 animate-bob [animation-delay:1.4s] sm:size-16" />
          <FloatChip
            className="bottom-[10%] left-[-2%] sm:left-[-6%]"
            tilt={-4}
            tone="lime"
            icon="salespage"
            subtitle="Your knowledge"
            title="Now for sale"
          />
        </Reveal>
      </div>
    </section>
  );
}
