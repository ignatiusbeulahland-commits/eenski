import { Link } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Gift,
  Globe,
  Laptop,
  Lock,
  PlayCircle,
  ShieldCheck,
  Signal,
  Target,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { ProductCover } from "@/components/dreamverse/ProductCover";
import { ProductLayout } from "@/components/product/ProductLayout";
import { BuyCard, InfoList, Instructor, Learn, PanelHeading } from "@/components/product/parts";
import { ProductReviews } from "@/components/product/ProductReviews";
import { reviewKey } from "@/lib/reviews/reviews";
import { percentOff } from "@/components/product/share";
import { Newsletter } from "@/components/site/Newsletter";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { BuyButton } from "@/components/site/checkout/BuyGate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PricePicker, priceNote, RatesCredit, useLocalPrice } from "@/components/product/PricePicker";
import type { CurrencyCode } from "@/lib/dreamverse/catalog";
import { findCreator } from "@/lib/dreamverse/creators";
import { formatMoney } from "@/lib/dreamverse/normalize";
import type { Money } from "@/lib/dreamverse/types";
import { coursePrice } from "@/lib/marketplace/filter";
import { courseLength, formatDuration } from "@/lib/marketplace/normalize";
import { courseUrl } from "@/lib/marketplace/seo";
import type { CourseDetail, CoursePageData } from "@/lib/marketplace/types";
import { cn } from "@/lib/utils";

import { fromCourse } from "@/components/shop/adapters";
import { ShopGrid } from "@/components/shop/ShopGrid";
import { useTrackView } from "@/components/shop/useTrackView";
import { useShop } from "@/lib/shop/store";

const dateLabel = (iso: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};

/** Opens the demo checkout for this course (simulated: nothing is charged). */
function EnrollButton({
  course,
  price,
  className,
  size = "lg",
  tabIndex,
}: {
  course: CourseDetail;
  price?: Money | null;
  className?: string;
  size?: "lg" | "md" | "sm";
  tabIndex?: number;
}) {
  const free = course.listing.prices.length > 0 && course.listing.prices.every((m) => m.current === 0);
  return (
    <BuyButton
      label={free ? "Enroll for free" : "Enroll now"}
      price={price ? formatMoney(price.current, price) : null}
      item={fromCourse(course, price?.currency === "USD" ? "USD" : "NGN")}
      charge={price ?? null}
      size={size}
      className={className}
      testId="enroll-now"
      {...(tabIndex === undefined ? {} : { tabIndex })}
    />
  );
}

export function CourseDetailsPage({ data }: { data: CoursePageData }) {
  const course = data.course!;
  const l = course.listing;
  const defaultCurrency: CurrencyCode = l.price?.currency === "USD" ? "USD" : "NGN";
  const listed = coursePrice(course, defaultCurrency);
  const local = useLocalPrice(l.prices, listed ? { shown: listed, exact: true, charge: listed } : null);
  const price = local.price?.shown ?? null;
  const charge = local.price?.charge ?? null;
  const estimate = local.price ? !local.price.exact : false;
  // Course cards below only know the creator's own currencies.
  const currency: CurrencyCode = price?.currency === "USD" || price?.currency === "NGN" ? price.currency : defaultCurrency;
  const profile = l.creator ? findCreator(l.creator.slug, [l]) : null;
  const length = courseLength(course);
  useTrackView(useMemo(() => fromCourse(course, currency), [course, currency]));
  const lessons = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const previews = course.modules.flatMap((m) => m.lessons).filter((x) => x.preview).length;
  const published = dateLabel(course.publishedAt);
  const itemKey = `course:${course.slug}`;
  // Bought on this device: the buy card turns into the way back into the course.
  const owned = useShop((s) => s.payments.some((p) => p.status === "successful" && p.items.some((i) => i.key === itemKey)));

  // The phone enroll bar appears once the buy card's own button scrolls away.
  const buyCta = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  useEffect(() => {
    const el = buyCta.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e?.isIntersecting && e!.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const info = [
    ...(length ? [{ icon: Clock3, label: "Duration", value: course.durationSeconds ? `${length} of video` : length }] : []),
    ...(lessons > 0 ? [{ icon: PlayCircle, label: "Lessons", value: `${lessons} in ${course.modules.length} ${course.modules.length === 1 ? "module" : "modules"}` }] : []),
    ...(course.level ? [{ icon: Signal, label: "Level", value: course.level }] : []),
    ...(course.language ? [{ icon: Globe, label: "Language", value: course.language }] : []),
    { icon: Laptop, label: "Format", value: "Online, self-paced video lessons" },
    ...(course.certificate !== null
      ? [{ icon: Award, label: "Certificate", value: course.certificate ? "Certificate of completion" : "No certificate" }]
      : []),
    ...(course.category ? [{ icon: BookOpen, label: "Category", value: course.category }] : []),
    ...(published ? [{ icon: CalendarDays, label: "Published", value: published }] : []),
  ];

  const details = [
    ...(course.category ? [{ label: "Skill set", value: course.category }] : []),
    ...(course.level ? [{ label: "Level", value: course.level }] : []),
    ...(lessons > 0 ? [{ label: "Lessons", value: String(lessons) }] : []),
    ...(length ? [{ label: course.durationSeconds ? "Total length" : "Length", value: length }] : []),
    ...(course.students ? [{ label: "Students", value: course.students.toLocaleString("en-US") }] : []),
  ];

  const description = (
    <>
      <div>
        {l.summary && <p className="text-lg font-semibold text-ink">{l.summary}</p>}
        <div className="mt-3 max-w-[68ch] space-y-4 leading-relaxed text-muted-foreground">
          {course.description.split(/\n{2,}/).map((para) => <p key={para} className="whitespace-pre-line">{para}</p>)}
        </div>
      </div>
      {course.outcomes.length > 0 && (
        <div>
          <PanelHeading>What you'll learn</PanelHeading>
          <Learn items={course.outcomes} />
        </div>
      )}
      {course.audience.length > 0 && (
        <div>
          <PanelHeading>Who this course is for</PanelHeading>
          <Learn items={course.audience} icon={Target} />
        </div>
      )}
      {course.requirements.length > 0 && (
        <div>
          <PanelHeading>Requirements</PanelHeading>
          <Learn items={course.requirements} icon={CheckCircle2} />
        </div>
      )}
      {l.creator && (
        <div>
          <PanelHeading>About the instructor</PanelHeading>
          <Instructor
            name={l.creator.name}
            avatar={l.creator.avatar}
            slug={l.creator.slug}
            headline={profile?.headline}
            bio={profile?.bio}
            expertise={profile?.expertise}
            extra={`${data.more.length + 1} ${data.more.length === 0 ? "course" : "courses"} on Enski`}
          />
        </div>
      )}
    </>
  );

  const curriculum = (
    <div>
      <p className="text-sm font-semibold text-muted-foreground">
        {course.modules.length} {course.modules.length === 1 ? "module" : "modules"} · {lessons} {lessons === 1 ? "lesson" : "lessons"}
        {formatDuration(course.durationSeconds) ? ` · ${formatDuration(course.durationSeconds)}` : ""}
        {previews > 0 ? ` · ${previews} free ${previews === 1 ? "preview" : "previews"} on Enski` : ""}
      </p>
      <Accordion type="multiple" defaultValue={["module-0"]} className="mt-4 space-y-4">
        {course.modules.map((m, i) => (
          <AccordionItem key={`${m.title}-${i}`} value={`module-${i}`} className="overflow-hidden rounded-card border border-line last:border-b">
            <AccordionTrigger className="gap-4 bg-soft p-5 text-left hover:no-underline">
              <span className="flex items-center gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cobalt font-extrabold text-primary-foreground">{i + 1}</span>
                <span>
                  <span className="block font-extrabold text-ink">{m.title}</span>
                  <span className="mt-0.5 block text-[13px] font-semibold text-muted-foreground">
                    {m.lessons.length} {m.lessons.length === 1 ? "lesson" : "lessons"}
                    {m.lessons.length > 0 && m.lessons.every((x) => x.durationSeconds) && formatDuration(m.lessons.reduce((n, x) => n + (x.durationSeconds ?? 0), 0))
                      ? ` · ${formatDuration(m.lessons.reduce((n, x) => n + (x.durationSeconds ?? 0), 0))}`
                      : ""}
                  </span>
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              {m.description && <p className="px-5 pt-4 text-sm leading-relaxed text-muted-foreground">{m.description}</p>}
              <ol className="divide-y divide-line">
                {m.lessons.map((lesson, j) => (
                  <li key={`${lesson.title}-${j}`} className="flex items-start gap-3 px-5 py-3.5 text-sm">
                    <PlayCircle className={cn("mt-0.5 size-4 shrink-0", lesson.preview ? "text-brand" : "text-muted-foreground")} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">{lesson.title}</span>
                      {lesson.description && <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">{lesson.description}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-xs font-extrabold text-muted-foreground">
                      {formatDuration(lesson.durationSeconds)}
                      {lesson.preview ? (
                        <span className="text-brand">Preview</span>
                      ) : (
                        <>
                          <Lock className="size-3.5" aria-hidden />
                          <span className="sr-only">Unlocks after enrolling</span>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-muted-foreground">
        {owned ? (
          <><CheckCircle2 className="size-3.5 text-brand" aria-hidden /> You're enrolled: every lesson is open in your learner library.</>
        ) : (
          <><Lock className="size-3.5" aria-hidden /> Lesson videos and downloads unlock on Enski after you enroll.</>
        )}
      </p>
    </div>
  );

  const highlights = (
    <>
      {course.bonuses.length > 0 && (
        <div>
          <PanelHeading>Bonuses included</PanelHeading>
          <Learn items={course.bonuses} icon={Gift} />
        </div>
      )}
      <div>
        <PanelHeading>Course information</PanelHeading>
        <InfoList rows={info} />
      </div>
    </>
  );

  const reviews = (
    <ProductReviews
      reviewKey={reviewKey("course", course.slug)}
      verified={l.rating}
      verifiedBreakdown={course.ratingBreakdown}
      noun="Course"
      canReview
    />
  );

  const picker =
    l.prices.length > 0 && !l.prices.every((m) => m.current === 0) ? (
      <>
        <PricePicker value={local.country?.code ?? null} onChange={local.choose} creatorCurrencies={l.prices.map((m) => m.currency)} />
        {estimate && <RatesCredit />}
      </>
    ) : null;
  const shownPrice = price ? `${estimate ? "≈ " : ""}${formatMoney(price.current, price)}` : null;

  const off = price?.onSale ? percentOff(price.amount, price.current) : 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SiteHeader />
      <main id="main">
        <ProductLayout
          kindLabel="Course"
          crumbs={[
            <Link key="c" to="/courses" className="hover:text-primary-foreground">Courses</Link>,
            ...(course.category
              ? [<Link key="cat" to="/courses" search={{ category: course.category }} className="hover:text-primary-foreground">{course.category}</Link>]
              : []),
          ]}
          title={l.title}
          summary={l.summary}
          creator={l.creator ? { name: l.creator.name, avatar: l.creator.avatar, slug: l.creator.slug } : null}
          rating={l.rating}
          reviewKey={reviewKey("course", course.slug)}
          meta={
            course.students ? (
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-lime" aria-hidden /> {course.students.toLocaleString("en-US")} enrolled
              </span>
            ) : !l.rating ? (
              <span className="text-on-blue">New course</span>
            ) : null
          }
          tags={course.tags}
          cover={<ProductCover product={l} />}
          buyCard={
            <BuyCard
              now={owned ? "Enrolled" : shownPrice}
              was={!owned && price?.onSale ? `${estimate ? "≈ " : ""}${formatMoney(price.amount, price)}` : null}
              off={owned ? 0 : off}
              note={
                owned
                  ? "This course is in your learner library."
                  : priceNote(local.price, local.unavailable, local.hasRates) ??
                    (off > 0 && price ? `Unlock everything now — save ${formatMoney(price.amount - price.current, price)}` : "One-time payment")
              }
              picker={owned ? null : picker}
              details={details}
              actions={
                <div ref={buyCta}>
                  {owned ? (
                    <Button asChild size="lg" className="w-full">
                      <Link to="/learner/resources/$resourceId" params={{ resourceId: itemKey }} search={{}}><PlayCircle aria-hidden /> Continue learning</Link>
                    </Button>
                  ) : (
                    <EnrollButton course={course} price={charge} className="w-full" />
                  )}
                </div>
              }
              footnote={
                owned ? (
                  <>
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    <span>You're enrolled. Your lessons, progress and certificate are in your learner library.</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    <span>Quick checkout: no account needed. Your order appears under Orders in the top bar.</span>
                  </>
                )
              }
              share={{ url: courseUrl(course.slug), title: l.title, noun: "course" }}
            />
          }
          tabs={[
            { id: "description", label: "Description", content: description },
            ...(course.modules.length > 0 ? [{ id: "curriculum", label: "Curriculum", content: curriculum }] : []),
            { id: "highlights", label: "Highlights", content: highlights },
            { id: "reviews", label: "Reviews", content: reviews },
          ]}
          after={
            (data.more.length > 0 || data.related.length > 0) && (
              <section className="mb-16 bg-soft py-14 lg:py-20" aria-labelledby="related-title">
                <div className="mx-auto max-w-[1200px] space-y-14 px-5">
                  {data.more.length > 0 && l.creator && (
                    <div>
                      <h2 id="related-title" className="text-h2 text-ink">More from <span className="text-brand">{l.creator.name}</span></h2>
                      <div className="mt-8">
                        <ShopGrid items={data.more.slice(0, 4).map((c) => fromCourse(c, currency))} />
                      </div>
                    </div>
                  )}
                  {data.related.length > 0 && (
                    <div>
                      <h2 {...(data.more.length ? {} : { id: "related-title" })} className="text-h2 text-ink">
                        You might <span className="text-brand">also like</span>
                      </h2>
                      <div className="mt-8">
                        <ShopGrid items={data.related.slice(0, 4).map((c) => fromCourse(c, currency))} />
                      </div>
                    </div>
                  )}
                  <Button asChild variant="outline"><Link to="/courses">Browse all courses</Link></Button>
                </div>
              </section>
            )
          }
        />
        <Newsletter />
      </main>
      <SiteFooter />

      {/* Phone/tablet: keep Enroll within reach while reading. */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-(--z-sticky) border-t border-line bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 motion-reduce:transition-none lg:hidden",
          showBar ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
        aria-hidden={!showBar}
        data-sticky-bottom={showBar ? "on" : "off"}
      >
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-ink">{l.title}</p>
            <p className="text-sm font-bold text-brand">{owned ? "In your library" : (shownPrice ?? "Price on request")}</p>
          </div>
          {owned ? (
            <Button asChild size="sm" className="shrink-0">
              <Link to="/learner/resources/$resourceId" params={{ resourceId: itemKey }} search={{}} tabIndex={showBar ? 0 : -1}>Continue learning</Link>
            </Button>
          ) : (
            <EnrollButton course={course} size="sm" className="shrink-0" tabIndex={showBar ? 0 : -1} />
          )}
        </div>
      </div>
    </div>
  );
}
