import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { BookOpen, CalendarDays, Clock3, Coins, Heart, Info, Lock, Radio, ShieldCheck, Tag } from "lucide-react";

import { fromDreamverse } from "@/components/shop/adapters";
import { useWishToggle } from "@/components/shop/ShopCard";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { useTrackView } from "@/components/shop/useTrackView";
import { ProductCover } from "@/components/dreamverse/ProductCover";
import { ProductLayout, type ProductTab } from "@/components/product/ProductLayout";
import { BuyCard, Empty, InfoList, Instructor, Learn, PanelHeading } from "@/components/product/parts";
import { ProductReviews } from "@/components/product/ProductReviews";
import { PricePicker, priceNote, RatesCredit, useLocalPrice } from "@/components/product/PricePicker";
import { reviewKey } from "@/lib/reviews/reviews";
import { dreamverseUrl, percentOff } from "@/components/product/share";
import { PageSkeleton } from "@/components/site/PageSkeleton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BuyButton, ComingSoonButton } from "@/components/site/checkout/BuyGate";
import { Button } from "@/components/ui/button";
import { dreamverseQueryOptions } from "@/lib/dreamverse/data";
import { FORMATS, TYPE_LABELS, buyLabel, findProduct, formatOf, isMarketCourse } from "@/lib/dreamverse/catalog";
import { CREATOR_STATUS_LABEL, DEMO_PRODUCTS, STATUS_LABEL, findCreator } from "@/lib/dreamverse/creators";
import { formatMoney } from "@/lib/dreamverse/normalize";
import type { Product } from "@/lib/dreamverse/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dreamverse_/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(dreamverseQueryOptions());
    const product = findProduct(params.slug, [...data.products, ...DEMO_PRODUCTS]);
    if (!product) throw notFound();
    // Live courses have one public page, in the course marketplace.
    if (isMarketCourse(product)) throw redirect({ to: "/courses/$slug", params: { slug: product.slug }, statusCode: 301 });
    return {
      title: product.title,
      summary: product.summary,
      type: TYPE_LABELS[product.type].label,
      creator: product.creator?.name ?? null,
      url: dreamverseUrl(product),
      image: product.thumbnail && /^https:\/\//.test(product.thumbnail) ? product.thumbnail : null,
    };
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "Resource unavailable";
    const by = loaderData?.creator ? ` by ${loaderData.creator}` : "";
    const description =
      loaderData?.summary || `${loaderData?.type ?? "Resource"}${by} on Dreamverse by Enski: what it covers, who it's from and how to get it.`;
    return {
      meta: [
        { title: `${title}${by} | Dreamverse by Enski` },
        { name: "description", content: description },
        { property: "og:title", content: `${title}${by}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:site_name", content: "Enski" },
        ...(loaderData ? [{ property: "og:url", content: loaderData.url }] : [{ name: "robots", content: "noindex" }]),
        { name: "twitter:card", content: loaderData?.image ? "summary_large_image" : "summary" },
        ...(loaderData?.image
          ? [
              { property: "og:image", content: loaderData.image },
              { name: "twitter:image", content: loaderData.image },
            ]
          : []),
      ],
      links: loaderData ? [{ rel: "canonical", href: loaderData.url }] : [],
    };
  },
  pendingComponent: () => <PageSkeleton variant="profile" />,
  component: ProductPage,
  notFoundComponent: ProductNotFound,
});

const STATUS_NOTE: Record<Product["status"], string> = {
  published: "",
  coming_soon: "This resource is coming soon. Save it and we'll keep it here for you until it goes on sale. You won't need an account to buy it.",
  draft: "The creator is still putting this together, so it isn't on sale yet. Save it to come back later.",
};

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(dreamverseQueryOptions());
  const all = [...data.products, ...DEMO_PRODUCTS];
  const product = findProduct(slug, all)!;
  const more = product.creator ? all.filter((p) => p.creator?.slug === product.creator?.slug && p.id !== product.id).slice(0, 3) : [];
  const similar = all.filter((p) => p.type === product.type && p.id !== product.id && !more.includes(p)).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <ProductDetails product={product} catalogue={data.products} more={more} similar={similar} />
      </main>
      <SiteFooter />
    </>
  );
}

function ProductDetails({ product, catalogue, more, similar }: { product: Product; catalogue: Product[]; more: Product[]; similar: Product[] }) {
  const shopItem = useMemo(() => fromDreamverse(product), [product]);
  const wish = useWishToggle(shopItem);
  const saved = wish.wished;
  const ready = true;
  useTrackView(shopItem);
  const type = TYPE_LABELS[product.type];
  const noun = type.label === "eBook" ? "eBook" : type.label.toLowerCase();
  const published = product.status === "published";
  const format = formatOf(product.type);
  const formatLabel = format ? FORMATS.find((f) => f.id === format)!.label : null;
  const creator = product.creator ? findCreator(product.creator.slug, catalogue) : null;
  const local = useLocalPrice(product.prices, product.price ? { shown: product.price, exact: true, charge: product.price } : null);
  const price = local.price?.shown ?? null;
  const charge = local.price?.charge ?? null;
  const estimate = local.price ? !local.price.exact : false;
  const approx = estimate ? "≈ " : "";
  const off = price?.onSale ? percentOff(price.amount, price.current) : 0;
  const canPick = product.prices.length > 0 && !product.prices.every((m) => m.current === 0);

  const save = wish.toggle;

  const buy = (size: "lg" | "md" = "lg", className = "w-full") => (
    <BuyButton
      label={buyLabel(product)}
      price={charge ? formatMoney(charge.current, charge) : null}
      item={shopItem}
      charge={charge}
      size={size}
      className={className}
    />
  );

  const description = (
    <>
      <div>
        <PanelHeading>About this {noun}</PanelHeading>
        <p className="max-w-[68ch] text-lg leading-relaxed text-ink">
          {product.summary || "The creator hasn't added a full description yet. Save it and check back once it's published."}
        </p>
      </div>
      {product.skills.length > 0 && (
        <div>
          <PanelHeading>{product.type === "gig" ? "What's included" : "What you'll learn"}</PanelHeading>
          <Learn items={product.skills} />
        </div>
      )}
      {product.creator && (
        <div>
          <PanelHeading>{product.type === "ebook" ? "About the author" : product.type === "coaching" ? "Your coach" : "About the creator"}</PanelHeading>
          <Instructor
            name={product.creator.name}
            avatar={product.creator.avatar}
            slug={product.creator.slug}
            headline={creator?.headline}
            bio={creator?.bio}
            expertise={creator?.expertise}
            extra={creator ? CREATOR_STATUS_LABEL[creator.status] : null}
          />
        </div>
      )}
    </>
  );

  const infoRows = [
    { icon: Tag, label: "Type", value: type.label },
    ...(formatLabel ? [{ icon: format === "live" ? Radio : Clock3, label: "Format", value: formatLabel }] : []),
    { icon: Info, label: "Status", value: STATUS_LABEL[product.status] },
    ...(product.prices.length > 0
      ? [{ icon: Coins, label: "Prices", value: product.prices.map((m) => `${m.currency} ${formatMoney(m.current, m)}`).join(" · ") }]
      : []),
  ];

  const highlights = (
    <>
      {product.skills.length > 0 && <Learn items={product.skills} />}
      <div>
        <PanelHeading>{type.label} information</PanelHeading>
        <InfoList rows={infoRows} />
        {product.prices.length > 1 && (
          <p className="mt-3 text-[13px] font-semibold text-muted-foreground">These prices are set by the creator. Other currencies in the price picker are estimates at today's rate.</p>
        )}
      </div>
    </>
  );

  const reviews = (
    <ProductReviews
      reviewKey={reviewKey("dreamverse", product.slug)}
      verified={product.rating}
      noun={type.label}
      canReview={published}
      closedNote={`Reviews open once this ${noun} goes on sale.`}
    />
  );

  const tabs: ProductTab[] = [{ id: "description", label: "Description", content: description }];
  if (product.type === "ebook") {
    tabs.push({
      id: "files",
      label: "Files",
      content: (
        <Empty
          icon={published ? Lock : BookOpen}
          title={published ? "Your files unlock after you buy" : "No files yet"}
          body={
            published
              ? "Once checkout is done, the eBook opens in your Enski library, ready to read or download on any device."
              : "The creator hasn't uploaded this eBook yet. Save it and we'll keep it here for you."
          }
        />
      ),
    });
  }
  if (product.type === "coaching") {
    tabs.push({
      id: "calendar",
      label: "Calendar",
      content: (
        <Empty
          icon={CalendarDays}
          title={published ? "Buy first, then book your time" : "Booking opens soon"}
          body={
            published
              ? "Complete checkout, then pick a session time that suits you on Enski. Sessions are 1:1 and live."
              : "This programme isn't taking bookings yet. Save it and come back when it opens."
          }
          action={published ? buy("md", "") : undefined}
        />
      ),
    });
  }
  if (product.type !== "coaching") tabs.push({ id: "highlights", label: "Highlights", content: highlights });
  tabs.push({ id: "reviews", label: "Reviews", content: reviews });

  const statusChip = (
    <span className={cn("rounded-full px-3 py-1 text-xs font-extrabold", published ? "bg-primary-foreground/15" : "bg-midnight text-on-blue")}>
      {STATUS_LABEL[product.status]}
    </span>
  );

  return (
    <ProductLayout
      kindLabel={type.label}
      crumbs={[
        <Link key="d" to="/dreamverse" className="hover:text-primary-foreground">Dreamverse</Link>,
        <Link key="m" to="/dreamverse" hash="marketplace" className="hover:text-primary-foreground">{type.plural}</Link>,
      ]}
      chips={
        <>
          {statusChip}
          {product.demo && <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-extrabold">Preview</span>}
        </>
      }
      title={product.title}
      summary={product.summary}
      creator={product.creator ? { name: product.creator.name, avatar: product.creator.avatar, slug: product.creator.slug } : null}
      rating={product.rating}
      reviewKey={reviewKey("dreamverse", product.slug)}
      meta={
        formatLabel ? (
          <span className="flex items-center gap-1.5">
            {format === "live" ? <Radio className="size-4 text-lime" aria-hidden /> : <Clock3 className="size-4 text-lime" aria-hidden />}
            {formatLabel}
          </span>
        ) : null
      }
      cover={<ProductCover product={product} />}
      buyCard={
        <BuyCard
          now={published || price ? (price ? `${approx}${formatMoney(price.current, price)}` : null) : "Not on sale yet"}
          was={price?.onSale ? `${approx}${formatMoney(price.amount, price)}` : null}
          off={off}
          picker={
            canPick ? (
              <>
                <PricePicker value={local.country?.code ?? null} onChange={local.choose} creatorCurrencies={product.prices.map((m) => m.currency)} />
                {estimate && <RatesCredit />}
              </>
            ) : null
          }
          note={
            priceNote(local.price, local.unavailable, local.hasRates) ??
            (!published
              ? null
              : product.type === "coaching"
                ? "For the full coaching programme"
                : product.type === "ebook"
                  ? "For the whole eBook"
                  : "One-time payment")
          }
          details={[
            ...(product.skills[0] ? [{ label: "Skill set", value: product.skills[0] }] : []),
            ...(formatLabel ? [{ label: "Format", value: product.type === "coaching" ? "1:1 live" : formatLabel }] : []),
            ...(product.type === "coaching" ? [{ label: "Sessions", value: "Booked after purchase" }] : []),
            ...(product.prices.length > 1 ? [{ label: "Currencies", value: String(product.prices.length) }] : []),
          ]}
          actions={
            published ? (
              <>
                {buy()}
                <Button type="button" size="lg" variant="outline" onClick={save} disabled={!ready} aria-pressed={saved}>
                  <Heart className={cn(saved && "fill-brand")} aria-hidden /> {saved ? "Saved" : "Wishlist"}
                </Button>
              </>
            ) : (
              <ComingSoonButton onClick={ready ? save : undefined} saved={saved} className="w-full" />
            )
          }
          footnote={
            <>
              {published ? <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden /> : <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />}
              <span>
                {published
                  ? "Quick checkout: no account needed."
                  : STATUS_NOTE[product.status]}
              </span>
            </>
          }
          share={{ url: dreamverseUrl(product), title: product.title, noun }}
        />
      }
      tabs={tabs}
      after={
        <div data-skin="dreamverse">
          <Related title={product.creator ? `More from ${product.creator.name}` : "More like this"} items={more} />
          <Related title={`More ${type.plural.toLowerCase()} to explore`} items={similar} />
        </div>
      }
    />
  );
}

function Related({ title, items }: { title: string; items: Product[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={title} className="container-page pb-12 lg:pb-16">
      <h2 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
      <div className="mt-5">
        <ShopGrid items={items.map((p) => fromDreamverse(p))} />
      </div>
    </section>
  );
}

function ProductNotFound() {
  return (
    <>
      <SiteHeader solid />
      <main id="main" className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <h1 className="text-h2 text-ink">We couldn't find that resource</h1>
          <p className="mt-2 text-muted-foreground">It may have been removed, or the link is out of date.</p>
          <Button asChild className="mt-6">
            <Link to="/dreamverse" hash="marketplace">Browse the marketplace</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
