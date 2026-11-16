import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/site/Icon3D";
import { steps, links } from "./data";
import { Reveal } from "@/components/site/motion";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-16 overflow-hidden bg-midnight py-16 text-primary-foreground lg:py-24"
    >
      <div className="absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
      <div
        className="parallax-y absolute left-[-15%] top-[-30%] aspect-square w-[60%] rounded-full bg-glow-behind opacity-40"
        aria-hidden="true"
      />
      <div
        className="parallax-y absolute bottom-[-40%] right-[-20%] aspect-square w-[55%] rounded-full bg-glow-behind opacity-30"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-[1200px] px-5">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <Reveal className="max-w-xl">
            <p className="eyebrow-pill glass-dark text-lime">
              <span className="size-2 rounded-full bg-lime" aria-hidden="true" />
              How it works
            </p>
            <h2 className="text-h2 mt-4">
              Get started in <span className="text-lime">4 simple steps.</span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <span className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-on-blue">
              <Clock className="size-4 text-lime" aria-hidden="true" />
              Joining takes just a few minutes
            </span>
          </Reveal>
        </div>

        <ol className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i * 120}
              className="lift glass-dark group relative rounded-[24px] p-6 pt-8"
            >
              <Icon3D
                name={s.icon}
                className="absolute -top-8 right-5 size-[72px] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
              />
              <span
                className={
                  i === 0
                    ? "grid size-12 place-items-center rounded-full bg-lime text-lg font-extrabold text-midnight"
                    : "grid size-12 place-items-center rounded-full bg-cobalt text-lg font-extrabold text-primary-foreground"
                }
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-xl font-extrabold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-on-blue">{s.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:mt-14">
          <Button asChild variant="lime" size="lg" className="w-full sm:w-auto">
            <a href={links.register}>
              Create your free account <ArrowRight />
            </a>
          </Button>
          <span className="text-sm font-semibold text-on-blue">Free to join. No card needed.</span>
        </Reveal>
      </div>
    </section>
  );
}
