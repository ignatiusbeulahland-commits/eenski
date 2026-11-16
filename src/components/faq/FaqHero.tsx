import { BadgeCheck, BookOpenCheck, Search, X } from "lucide-react";

import heroPerson from "@/assets/help/faq-hero-person.webp";

const POPULAR = ["Payouts", "Certificates", "Mobile money", "Reset password"];

interface FaqHeroProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSubmit: () => void;
  totalAnswers: number;
}

export function FaqHero({ query, onQueryChange, onSubmit, totalAnswers }: FaqHeroProps) {
  return (
    <section className="relative overflow-hidden bg-cobalt-light text-on-blue">
      {/* Ghost question mark, echoes the brand guide's ghost wordmark */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-[4%] bottom-[-0.18em] hidden select-none text-[720px] leading-none font-extrabold tracking-[-0.06em] text-on-blue/[0.05] lg:block"
      >
        ?
      </span>

      <div className="relative mx-auto grid max-w-[1200px] px-5 pt-[72px] lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:px-8">
        <div className="relative z-10 pt-6 pb-4 lg:pt-14 lg:pb-24">
          <p className="type-eyebrow text-lime">Help centre</p>
          <h1 className="type-display mt-4">
            Got questions?
            <br />
            <span className="text-lime">We&rsquo;ve got answers.</span>
          </h1>
          <p className="mt-5 max-w-[30rem] text-[17px] leading-[26px] text-on-blue/90 lg:text-lg lg:leading-7">
            Everything you need to learn, create and get paid on Enski. Search below or browse by
            topic.
          </p>

          <form
            role="search"
            className="mt-8 max-w-[34rem]"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            <label htmlFor="faq-search" className="type-caption mb-2 block text-on-blue/90">
              Search for an answer
            </label>
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-[22px] -translate-y-1/2 text-brand"
              />
              <input
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Try “payout” or “certificate”"
                autoComplete="off"
                className="h-14 w-full rounded-[14px] border-[1.5px] border-transparent bg-card pr-12 pl-12 text-base font-medium text-ink shadow-float placeholder:text-muted-foreground focus:border-cobalt focus:ring-4 focus:ring-ice focus:outline-none [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => onQueryChange("")}
                  className="absolute top-1/2 right-2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-ice hover:text-brand"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="type-caption mr-1 text-on-blue/75">Popular:</span>
            {POPULAR.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onQueryChange(p);
                  onSubmit();
                }}
                className="cursor-pointer rounded-full border border-on-blue/25 bg-on-blue/10 px-4 py-2 text-sm font-bold backdrop-blur-sm transition-colors hover:border-lime hover:text-lime"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Person rises out of the bottom edge with floating info around her */}
        <div className="relative h-[380px] sm:h-[460px] lg:h-auto">
          <div aria-hidden className="bg-glow-behind absolute inset-x-[-15%] top-[0%] bottom-[-25%]" />
          <img
            src={heroPerson}
            alt="Smiling young woman holding her phone and pointing up"
            width={820}
            height={1025}
            fetchPriority="high"
            className="absolute bottom-0 left-1/2 h-full max-h-[560px] w-auto max-w-none -translate-x-1/2 object-contain object-bottom lg:h-[108%]"
          />

          <div
            className="animate-float absolute top-[8%] left-[2%] rounded-[14px] bg-lime px-4 py-3 text-midnight shadow-chip sm:left-[10%] lg:top-[16%] lg:left-[-6%]"
            style={{ ["--tilt" as string]: "-7deg" }}
          >
            <p className="text-[28px] leading-none font-extrabold tracking-[-0.03em]">
              {totalAnswers}
            </p>
            <p className="type-caption mt-1">answers inside</p>
          </div>

          <div
            className="animate-float absolute top-[42%] right-[0%] flex items-center gap-2 rounded-full border border-on-blue/25 bg-on-blue/15 px-4 py-2.5 text-sm font-bold shadow-chip backdrop-blur-md sm:right-[6%] lg:right-[-4%]"
            style={{ ["--tilt" as string]: "5deg", animationDelay: "-1.5s" }}
          >
            <BadgeCheck className="size-[18px] text-lime" />
            Mobile money accepted
          </div>

          <div
            className="animate-float absolute bottom-[12%] left-[0%] flex items-center gap-2 rounded-full bg-midnight px-4 py-2.5 text-sm font-bold shadow-chip sm:left-[6%] lg:bottom-[18%] lg:left-[-2%]"
            style={{ ["--tilt" as string]: "-3deg", animationDelay: "-3s" }}
          >
            <BookOpenCheck className="size-[18px] text-lime" />
            Lifetime course access
          </div>
        </div>
      </div>
    </section>
  );
}
