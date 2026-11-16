import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { testimonials } from "./data";
import { Reveal } from "./motion";

export function Testimonials() {
  const [i, setI] = useState(0);
  const t = testimonials[i] ?? testimonials[0]!;

  useEffect(() => {
    const id = window.setTimeout(() => setI((v) => (v + 1) % testimonials.length), 7000);
    return () => window.clearTimeout(id);
  }, [i]);

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-sky-text">Stories</p>
          <h2 className="text-h2 mt-3 text-ink">
            The Enski experience, told by the <span className="text-brand">people who use it.</span>
          </h2>
          <p className="mt-4 text-[17px] text-muted-foreground">
            Their skills grew. Their income grew. Their confidence grew.
          </p>
        </Reveal>

        <Reveal className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-[32px] bg-midnight px-6 py-12 text-primary-foreground lg:px-16 lg:py-16">
          <div
            className="absolute -top-1/2 left-1/2 aspect-square w-[90%] -translate-x-1/2 rounded-full bg-glow-behind opacity-60"
            aria-hidden="true"
          />
          <Quote className="relative size-12 fill-lime text-lime" aria-hidden="true" />
          <blockquote
            key={i}
            aria-live="polite"
            className="relative mt-6 text-2xl font-extrabold leading-snug animate-in fade-in slide-in-from-bottom-2 duration-500 lg:text-[34px] lg:leading-[1.25]"
          >
            “{t.quote}”
          </blockquote>
          <div className="relative mt-8 flex items-center gap-4">
            <img src={t.avatar} alt="" width={240} height={240} decoding="async" className="size-14 rounded-full object-cover ring-2 ring-lime" />
            <div>
              <p className="text-lg font-extrabold">{t.name}</p>
              <p className="text-sm font-semibold text-sky-light">{t.role}</p>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap justify-center gap-3" role="tablist" aria-label="Choose a story">
          {testimonials.map((p, idx) => (
            <button
              key={p.name}
              role="tab"
              aria-selected={idx === i}
              aria-label={`Read ${p.name}'s story`}
              onClick={() => setI(idx)}
              className={cn(
                "rounded-full p-1 transition-all",
                idx === i ? "bg-cobalt" : "bg-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img src={p.avatar} alt="" width={240} height={240} loading="lazy" decoding="async" className="size-12 rounded-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
