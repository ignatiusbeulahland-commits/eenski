import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useCanGoBack, useRouter } from "@tanstack/react-router";
import logoLime from "@/assets/enski-logo-lime.webp";
import logoWhite from "@/assets/enski-logo-white.webp";
import learnerImg from "@/assets/people/learner-sweatshirt.webp";
import creatorImg from "@/assets/people/creator-celebrate.webp";
import affiliateImg from "@/assets/people/cta-hoodie.webp";
import { authShowcase, communityLearners, type JoinRole } from "../data";
import { FloatChip } from "../FloatChip";
import { ThemeToggle } from "../ThemeToggle";
import { RiseWords } from "../motion";

const people: {
  [K in JoinRole]: { src: string; alt: string; width: number; height: number };
} = {
  learner: {
    src: learnerImg,
    alt: "Smiling young man in glasses holding a laptop, wearing a cobalt Enski sweatshirt",
    width: 789,
    height: 1100,
  },
  creator: {
    src: creatorImg,
    alt: "Excited young man with both hands raised, wearing a navy Enski sweatshirt",
    width: 1120,
    height: 960,
  },
  affiliate: {
    src: affiliateImg,
    alt: "Smiling young man clapping, wearing a navy hoodie",
    width: 730,
    height: 1100,
  },
};

/** Cobalt story panel beside the /auth form: changes person and copy with the account type. */
/** Returns to the page the visitor came from on this site; if they landed here directly, goes home. */
function BackButton() {
  const router = useRouter();
  const inAppHistory = useCanGoBack();
  // Log in / register links are full page loads, so also check whether the previous page was on this site.
  const [cameFromSite, setCameFromSite] = useState(false);
  useEffect(() => {
    try {
      setCameFromSite(
        window.history.length > 1 && !!document.referrer && new URL(document.referrer).origin === window.location.origin,
      );
    } catch {
      setCameFromSite(false);
    }
  }, []);
  const canGoBack = inAppHistory || cameFromSite;
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? router.history.back() : void router.navigate({ to: "/" }))}
      className="inline-flex h-10 items-center gap-1.5 rounded-full border border-primary-foreground/25 px-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-light"
    >
      <ArrowLeft className="size-4" /> {canGoBack ? "Back" : "Back to home"}
    </button>
  );
}

export function AuthShowcase({ type }: { type: JoinRole }) {
  const copy = authShowcase[type];
  const person = people[type];

  return (
    <aside className="relative overflow-hidden bg-cobalt-light text-primary-foreground lg:sticky lg:top-0 lg:h-dvh">
      <div className="absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
      <div className="neon-field absolute inset-0" aria-hidden="true" />

      <div className="relative flex h-full flex-col px-5 pb-12 pt-4 sm:px-8 lg:px-12 lg:pb-0 lg:pt-7">
        <div className="flex items-center justify-between">
          <a href="/" aria-label="Enski home" className="rounded-md">
            <img src={logoWhite} alt="Enski" width={288} height={106} className="h-8 w-auto dark:hidden" />
            <img src={logoLime} alt="Enski" width={288} height={106} className="hidden h-8 w-auto dark:block" />
          </a>
          <div className="flex items-center gap-1">
            <BackButton />
            <ThemeToggle />
          </div>
        </div>

        {/* Copy — keyed so the words rise again when the account type changes */}
        <div key={type} className="mt-8 max-w-[58%] sm:max-w-[60%] lg:mt-14 lg:max-w-[520px]">
          <p className="eyebrow inline-flex animate-rise items-center gap-2 text-lime">
            <span className="neon-dot is-live" aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-[32px] lg:text-[44px] lg:leading-[1.1]">
            <RiseWords text={copy.headline} start={1} />{" "}
            <span className="text-lime">
              <RiseWords text={copy.highlight} start={1 + copy.headline.split(" ").length} popLast />
            </span>
          </h1>
          <span className="neon-rule mt-4 block w-16 animate-rise" style={{ animationDelay: "0.3s" }} aria-hidden="true" />
          <p
            className="mt-4 hidden animate-rise text-[17px] leading-relaxed text-on-blue sm:block"
            style={{ animationDelay: "0.35s" }}
          >
            {copy.body}
          </p>

          <div className="mt-6 hidden items-center gap-3 lg:flex">
            <div className="flex -space-x-2.5">
              {communityLearners.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  width={80}
                  height={80}
                  loading="lazy" decoding="async"
                  className="size-9 rounded-full object-cover ring-2 ring-cobalt"
                  style={{ zIndex: 5 - i }}
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-on-blue">
              <span className="font-extrabold text-lime">5,000+ dreamers</span> learning on
              Enski
            </p>
          </div>
        </div>

        {/* Person rises out of the bottom edge; on phones they sit to the right of the copy */}
        <div className="absolute bottom-0 right-0 h-[76%] w-[46%] max-w-[260px] sm:max-w-[320px] lg:relative lg:mt-6 lg:h-auto lg:w-full lg:max-w-none lg:flex-1">
          <div
            className="absolute bottom-0 left-1/2 aspect-square w-[120%] -translate-x-1/2 translate-y-[25%] rounded-full bg-glow-behind lg:w-[90%]"
            aria-hidden="true"
          />
          <img
            key={person.src}
            src={person.src}
            alt={person.alt}
            width={person.width}
            height={person.height}
            className="absolute inset-0 z-10 h-full w-full animate-rise object-contain object-bottom"
          />
          <FloatChip
            className="left-0 top-[16%] hidden lg:block"
            tilt={-4}
            icon={copy.chips[0].icon}
            subtitle={copy.chips[0].subtitle}
            title={copy.chips[0].title}
          />
          <FloatChip
            className="right-0 top-[46%] hidden lg:block"
            tilt={5}
            delay={1}
            tone="lime"
            icon={copy.chips[1].icon}
            subtitle={copy.chips[1].subtitle}
            title={copy.chips[1].title}
          />
        </div>
      </div>
    </aside>
  );
}
