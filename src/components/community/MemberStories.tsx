import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon3D } from "@/components/site/Icon3D";
import { memberStories } from "./data";
import { Reveal } from "@/components/site/motion";

export function MemberStories() {
  return (
    <section className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal className="relative mx-auto max-w-2xl text-center">
          <Icon3D name="chat" className="absolute -left-2 top-0 hidden size-16 -rotate-12 animate-bob md:block lg:-left-16 lg:size-20" />
          <Icon3D name="followup" className="absolute -right-2 top-10 hidden size-14 rotate-12 animate-bob [animation-delay:1.2s] md:block lg:-right-16 lg:size-16" />
          <p className="eyebrow-pill bg-ice text-brand">
            <span className="size-2 rounded-full bg-sky" aria-hidden="true" />
            Member stories
          </p>
          <h2 className="text-h2 mt-4 text-ink">
            What our <span className="text-brand">members say.</span>
          </h2>
          <p className="mt-4 text-[17px] text-muted-foreground">Real stories from real community members.</p>
        </Reveal>

        <ul className="mt-12 grid gap-6 md:grid-cols-3 lg:mt-16 lg:items-start">
          {memberStories.map((m, i) => {
            const featured = i === 0;
            return (
              <Reveal
                as="li"
                key={m.name}
                delay={i * 120}
                className={cn(
                  "lift relative flex flex-col overflow-hidden rounded-[24px] p-7 lg:p-8",
                  featured
                    ? "bg-cobalt-light text-primary-foreground shadow-float md:row-span-2"
                    : "bg-card text-card-foreground shadow-card",
                  i === 1 && "md:mt-10",
                  i === 2 && "md:mt-20",
                )}
              >
                <Quote
                  aria-hidden="true"
                  className={cn("size-9", featured ? "fill-lime text-lime" : "fill-sky/20 text-sky")}
                />
                <blockquote
                  className={cn(
                    "mt-5 font-extrabold leading-snug",
                    featured ? "text-2xl" : "text-lg text-ink",
                  )}
                >
                  “{m.quote}”
                </blockquote>
                <div className="mt-8 flex items-center gap-3">
                  <img
                    src={m.avatar}
                    alt=""
                    width={240}
                    height={240}
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "size-12 rounded-full object-cover ring-2",
                      featured ? "ring-lime" : "ring-sky-200",
                    )}
                  />
                  <div>
                    <p className={cn("font-extrabold", !featured && "text-ink")}>{m.name}</p>
                    <p
                      className={cn(
                        "text-[13px] font-semibold",
                        featured ? "text-sky-light" : "text-muted-foreground",
                      )}
                    >
                      {m.role}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
