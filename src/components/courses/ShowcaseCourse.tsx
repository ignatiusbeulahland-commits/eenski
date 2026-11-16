import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, CreditCard, Heart, Laptop, PlayCircle, ShieldCheck, ShoppingBag, Tag, ArrowRight } from "lucide-react";

import { ProductLayout } from "@/components/product/ProductLayout";
import { BuyCard, InfoList, Instructor, PanelHeading } from "@/components/product/parts";
import { ProductReviews } from "@/components/product/ProductReviews";
import { reviewKey } from "@/lib/reviews/reviews";
import { Newsletter } from "@/components/site/Newsletter";
import { fromShowcase } from "@/components/shop/adapters";
import { useWishToggle } from "@/components/shop/ShopCard";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { useTrackView } from "@/components/shop/useTrackView";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BuyButton } from "@/components/site/checkout/BuyGate";
import { Button } from "@/components/ui/button";
import { findProductBySlug, formatNaira, products, type Product } from "@/components/site/data";
import { findCreator } from "@/lib/dreamverse/creators";
import { formatMoney, slugify } from "@/lib/dreamverse/normalize";
import type { Money } from "@/lib/dreamverse/types";
import { PricePicker, priceNote, RatesCredit, useLocalPrice } from "@/components/product/PricePicker";
import { courseUrl } from "@/lib/marketplace/seo";
import { cn } from "@/lib/utils";

const steps = (p: Product) => [
  { icon: ArrowRight, title: "Tap buy", body: "Go straight to checkout. No account or sign-up needed." },
  { icon: ShoppingBag, title: `Buy the ${p.type.toLowerCase()}`, body: `Pay ${formatNaira(p.price)} once with card or mobile money.` },
  {
    icon: p.type === "Ebook" ? BookOpen : PlayCircle,
    title: p.type === "Ebook" ? "Start reading" : "Start learning",
    body: p.type === "Ebook" ? "Open it on any device, whenever suits you." : "Learn at your own pace, on your phone or laptop.",
  },
];

/** Details page for a homepage course or eBook that isn't on sale on Enski yet. */
export function ShowcaseCourse({ slug }: { slug: string }) {
  const p = findProductBySlug(slug)!;
  const item = useMemo(() => fromShowcase(p), [p]);
  const wish = useWishToggle(item);
  const isSaved = wish.wished;
  useTrackView(item);
  const creator = findCreator(slugify(p.creator), []);
  const more = products.filter((x) => x.creator === p.creator && x.title !== p.title);
  const related = [...more, ...products.filter((x) => x.category === p.category && x.creator !== p.creator && x.title !== p.title)].slice(0, 4);
  const ebook = p.type === "Ebook";
  const noun = ebook ? "eBook" : "course";
  const naira: Money = { currency: "NGN", sign: "₦", amount: p.price, current: p.price, onSale: false };
  const local = useLocalPrice([naira], { shown: naira, exact: true, charge: naira });
  const shown = local.price?.shown ?? naira;
  const estimate = local.price ? !local.price.exact : false;

  const description = (
    <>
      <p className="text-lg font-semibold text-ink">{p.promise}</p>
      <div>
        <PanelHeading>How to get started</PanelHeading>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps(p).map((s, i) => (
            <li key={s.title} className="rounded-card bg-soft p-5">
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-cobalt text-primary-foreground">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-extrabold text-brand">Step {i + 1}</span>
              </span>
              <h3 className="mt-4 font-extrabold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <PanelHeading>About the {ebook ? "author" : "instructor"}</PanelHeading>
        <Instructor
          name={p.creator}
          avatar={p.creatorPhoto ?? creator?.avatar ?? null}
          slug={creator?.slug}
          headline={creator?.headline ?? p.creatorRole}
          bio={creator?.bio}
          expertise={creator?.expertise}
        />
      </div>
    </>
  );

  const highlights = (
    <div>
      <PanelHeading>{ebook ? "eBook" : "Course"} information</PanelHeading>
      <InfoList
        rows={[
          { icon: Tag, label: "Category", value: p.category },
          { icon: Laptop, label: "Format", value: ebook ? "Digital eBook, read on any device" : "Online, at your own pace" },
          { icon: CreditCard, label: "Payment", value: `${formatNaira(p.price)} once, card or mobile money` },
        ]}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main">
        <ProductLayout
          kindLabel={ebook ? "eBook" : "Course"}
          crumbs={[
            <Link key="c" to="/courses" className="hover:text-primary-foreground">Courses</Link>,
            <Link key="cat" to="/courses" search={{ category: p.category }} className="hover:text-primary-foreground">{p.category}</Link>,
          ]}
          chips={p.badge && <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-extrabold">{p.badge}</span>}
          title={p.title}
          summary={p.promise}
          creator={{ name: p.creator, avatar: p.creatorPhoto ?? null, slug: creator?.slug ?? null }}
          rating={{ average: p.rating, count: null }}
          cover={<img src={p.image} alt={p.imageAlt} width={800} height={600} fetchPriority="high" className="size-full object-cover" />}
          buyCard={
            <BuyCard
              now={p.price > 0 ? `${estimate ? "≈ " : ""}${formatMoney(shown.current, shown)}` : formatNaira(p.price)}
              picker={
                p.price > 0 ? (
                  <>
                    <PricePicker value={local.country?.code ?? null} onChange={local.choose} creatorCurrencies={["NGN"]} />
                    {estimate && <RatesCredit />}
                  </>
                ) : null
              }
              note={priceNote(local.price, local.unavailable, local.hasRates) ?? "One-time payment"}
              details={[
                { label: "Type", value: ebook ? "eBook" : "Course" },
                { label: "Skill set", value: p.category },
                ...(p.creatorRole ? [{ label: "By", value: p.creator }] : []),
              ]}
              actions={
                <>
                  <BuyButton label={ebook ? "Buy eBook" : "Buy course"} price={formatNaira(p.price)} item={item} className="w-full" />
                  <Button type="button" variant="outline" size="lg" aria-pressed={isSaved} onClick={wish.toggle}>
                    <Heart className={cn("size-[18px]", isSaved && "fill-brand")} aria-hidden /> {isSaved ? "Saved" : "Add to wishlist"}
                  </Button>
                </>
              }
              footnote={
                <>
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                  <span>Quick checkout: no account needed.</span>
                </>
              }
              share={{ url: courseUrl(slug), title: p.title, noun }}
            />
          }
          tabs={[
            { id: "description", label: "Description", content: description },
            { id: "highlights", label: "Highlights", content: highlights },
            {
              id: "reviews",
              label: "Reviews",
              content: (
                <ProductReviews
                  reviewKey={reviewKey("showcase", slug)}
                  verified={{ average: p.rating, count: null }}
                  noun={ebook ? "eBook" : "Course"}
                  canReview
                />
              ),
            },
          ]}
          after={
            related.length > 0 && (
              <section className="pb-16" aria-labelledby="related-title">
                <div className="mx-auto max-w-[1200px] px-5">
                  <h2 id="related-title" className="text-h2 text-ink">
                    {more.length > 0 ? `More from ${p.creator}` : "You might also like"}
                  </h2>
                  <div className="mt-8">
                    <ShopGrid items={related.map(fromShowcase)} />
                  </div>
                </div>
              </section>
            )
          }
        />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
