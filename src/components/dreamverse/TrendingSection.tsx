import type { Product } from "@/lib/dreamverse/types";

import { ProductShelf } from "./ProductRail";
import { SectionHeading } from "./SectionHeading";

export function TrendingSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby="trending-title" className="container-page pt-16 lg:pt-24">
      <SectionHeading
        id="trending-title"
        eyebrow="Trending this week"
        title={
          <>
            Worth your <span className="text-brand">attention.</span>
          </>
        }
        action={
          <a href="#marketplace" className="inline-flex min-h-11 items-center text-sm font-extrabold text-brand underline-offset-4 hover:underline">
            View all resources
          </a>
        }
      >
        Explore what the community is learning, buying and loving right now.
      </SectionHeading>
      <div className="mt-8">
        <ProductShelf label="Trending this week" products={products.slice(0, 10)} badge="Trending" />
      </div>
    </section>
  );
}
