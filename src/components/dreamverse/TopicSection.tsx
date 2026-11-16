import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { TOPICS, matchesTopic } from "@/lib/dreamverse/catalog";
import type { Product } from "@/lib/dreamverse/types";
import { cn } from "@/lib/utils";

import { DuoIcon } from "./DuoIcon";
import { SectionHeading } from "./SectionHeading";
import { TOPIC_ICONS } from "./topicIcons";

export function TopicSection({ products }: { products: Product[] }) {
  const topics = TOPICS.map((t) => ({ ...t, count: products.filter((p) => matchesTopic(p, t.id)).length }));

  return (
    <section aria-labelledby="topics-title" className="pt-16 lg:pt-24">
      <div className="container-page">
        <SectionHeading
          id="topics-title"
          eyebrow="Browse by topic"
          title={
            <>
              Explore what <span className="text-brand">interests you.</span>
            </>
          }
        />
        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {topics.map((t, i) => {
            const Icon = TOPIC_ICONS[t.id];
            const featured = i === 0;
            return (
              <li key={t.id} className={cn(featured && "col-span-2 sm:col-span-2 lg:col-span-1")}>
                <Link
                  to="/dreamverse"
                  search={(prev) => ({ ...prev, topic: t.id, q: undefined })}
                  hash="marketplace"
                  resetScroll={false}
                  className={cn(
                    "group relative flex h-full overflow-hidden rounded-[24px] p-4 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-card sm:p-6",
                    featured
                      ? "min-h-[180px] flex-col justify-between bg-cobalt-light text-on-blue"
                      : "flex-col items-start gap-3 border border-line bg-background text-ink sm:flex-row sm:items-center sm:gap-4",
                  )}
                >
                  {/* Same duotone tile as the Enski sites: blue tone on the cobalt card, light elsewhere. */}
                  {featured ? <DuoIcon icon={Icon} tone="blue" size="lg" /> : <DuoIcon icon={Icon} />}
                  <span className={cn("min-w-0 flex-1", featured && "mt-8 block")}>
                    <span className={cn("block font-extrabold tracking-tight", featured ? "text-2xl" : "text-base sm:text-lg")}>
                      {t.name}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-sm leading-relaxed",
                        featured ? "max-w-xs text-on-blue-muted" : "hidden text-muted-foreground sm:block",
                      )}
                    >
                      {t.blurb}
                    </span>
                    {t.count > 0 ? (
                      <span
                        className={cn(
                          "mt-2 inline-flex items-center gap-1.5 text-[13px] font-extrabold sm:mt-3 sm:text-sm",
                          featured ? "text-lime" : "text-brand",
                        )}
                      >
                        {t.count} {t.count === 1 ? "resource" : "resources"}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </span>
                    ) : (
                      // Upcoming, not available: no arrow, muted pill.
                      <span className="mt-2 inline-flex rounded-full bg-soft px-2.5 py-0.5 text-xs font-extrabold text-muted-foreground sm:mt-3">
                        Coming soon
                      </span>
                    )}
                  </span>
                  {featured && (
                    <Icon
                      aria-hidden
                      className="pointer-events-none absolute -right-8 -bottom-8 size-48 text-on-blue opacity-[0.07]"
                      strokeWidth={1}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
