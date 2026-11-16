import { Link } from "@tanstack/react-router";

import type { Product } from "@/lib/dreamverse/types";

import { ProductShelf } from "./ProductRail";
import { SectionHeading } from "./SectionHeading";

/** Live sessions, workshops and events, bookable ones first, in the shared shop grid. */
export function EventsSection({ products }: { products: Product[] }) {
  const events = products
    .filter((p) => p.type === "live_training")
    .sort((a, b) => Number(a.status !== "published") - Number(b.status !== "published"));
  if (events.length === 0) return null;
  return (
    <section id="events" aria-labelledby="events-title" className="container-page scroll-mt-20 pt-16 lg:pt-24">
      <SectionHeading
        id="events-title"
        eyebrow="Events and workshops"
        title={
          <>
            Learn live, <span className="text-brand">together.</span>
          </>
        }
        action={
          <Link
            to="/dreamverse"
            search={(prev) => ({ ...prev, type: "live_training" as const })}
            hash="marketplace"
            resetScroll={false}
            className="inline-flex min-h-11 items-center text-sm font-extrabold text-brand underline-offset-4 hover:underline"
          >
            See all live sessions
          </Link>
        }
      >
        Live sessions, workshops and launch events from Dreamverse creators. Save a seat or keep one on your wishlist.
      </SectionHeading>
      <div className="mt-8">
        <ProductShelf label="Events and workshops" products={events} />
      </div>
    </section>
  );
}
