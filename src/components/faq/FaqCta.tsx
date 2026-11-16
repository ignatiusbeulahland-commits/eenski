import { LifeBuoy, MessageCircleHeart, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ENSKI } from "@/lib/enski-links";
import { Link } from "@tanstack/react-router";

export function FaqCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-5 pb-16 lg:px-8 lg:pb-24">
      <div className="relative overflow-hidden rounded-[32px] bg-cobalt-light px-6 py-10 text-on-blue sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14 lg:py-14">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-8%] size-[420px] bg-glow-behind"
        />
        <div className="relative max-w-xl">
          <p className="type-eyebrow text-lime">Still stuck?</p>
          <h2 className="type-h2 mt-3">
            Ask the people who&rsquo;ve <span className="text-lime">been there.</span>
          </h2>
          <p className="mt-3 text-[17px] leading-[26px] text-on-blue/90">
            Learners and creators share tips, answers and wins in the Enski community.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="lime" size="lg">
              <Link to="/community">
                <Users />
                Join the community
              </Link>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <a href={`mailto:${ENSKI.supportEmail}`}>
                <LifeBuoy />
                Contact support
              </a>
            </Button>
            <Button asChild variant="outline-light" size="lg">
              <Link to="/blog">Read the blog</Link>
            </Button>
          </div>
        </div>

        <div aria-hidden className="relative mt-10 hidden h-48 w-72 shrink-0 lg:mt-0 lg:block">
          <span
            className="animate-float absolute top-0 left-4 rounded-full border border-on-blue/25 bg-on-blue/15 px-4 py-2.5 text-sm font-bold backdrop-blur-md"
            style={{ ["--tilt" as string]: "-6deg" }}
          >
            Ask anything
          </span>
          <span
            className="animate-float absolute top-16 right-0 flex items-center gap-2 rounded-full bg-lime px-4 py-2.5 text-sm font-extrabold text-midnight shadow-chip"
            style={{ ["--tilt" as string]: "5deg", animationDelay: "-2s" }}
          >
            <MessageCircleHeart className="size-[18px]" />
            Share your wins
          </span>
          <span
            className="animate-float absolute bottom-0 left-10 rounded-full bg-midnight px-4 py-2.5 text-sm font-bold shadow-chip"
            style={{ ["--tilt" as string]: "-2deg", animationDelay: "-3.5s" }}
          >
            Find your people
          </span>
        </div>
      </div>
    </section>
  );
}
