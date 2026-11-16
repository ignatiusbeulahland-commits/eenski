import {
  ArrowRight,
  Check,
  Handshake,
  LayoutTemplate,
  MailCheck,
  ShoppingCart,
  Store,
  type LucideIcon,
} from "lucide-react";
import {
  AE, AU, CA, CM, EG, ET, EU, GB, GH, IN, KE, MA, NG, RW, SN, TZ, UG, US, ZA, ZM,
} from "country-flag-icons/react/3x2";
import { Button } from "@/components/features/button";

type FlagComponent = typeof NG;
import { Container, Reveal, SectionHeading } from "./primitives";
import { links } from "./links";
import { AutoCarousel } from "./AutoCarousel";
import { FeatureSlide } from "./FeatureSlide";
import { Icon3D } from "./icons3d";

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Store,
    title: "Marketplace visibility",
    body: "Get discovered by thousands of African learners actively searching for courses and digital solutions.",
  },
  {
    icon: Handshake,
    title: "Affiliate sales engine",
    body: "Grow your revenue with affiliate partners who promote your course for a commission.",
  },
  {
    icon: MailCheck,
    title: "Automated follow-ups",
    body: "Turn abandoned carts into paying customers with automatic follow-up sequences.",
  },
  {
    icon: ShoppingCart,
    title: "Custom checkout and upsells",
    body: "Make the most of every sale with checkout flows designed to reduce drop-offs.",
  },
  {
    icon: LayoutTemplate,
    title: "Sales pages that convert",
    body: "Ready-made, mobile-friendly product pages designed to help you sell more.",
  },
];

/** Currency code, full name and the flag shown beside it (CFA francs use a member country's flag). */
const currencies: { code: string; name: string; Flag: FlagComponent }[] = [
  { code: "NGN", name: "Nigerian naira", Flag: NG },
  { code: "USD", name: "US dollar", Flag: US },
  { code: "GBP", name: "British pound", Flag: GB },
  { code: "EUR", name: "Euro", Flag: EU },
  { code: "CAD", name: "Canadian dollar", Flag: CA },
  { code: "GHS", name: "Ghanaian cedi", Flag: GH },
  { code: "KES", name: "Kenyan shilling", Flag: KE },
  { code: "ZAR", name: "South African rand", Flag: ZA },
  { code: "UGX", name: "Ugandan shilling", Flag: UG },
  { code: "TZS", name: "Tanzanian shilling", Flag: TZ },
  { code: "RWF", name: "Rwandan franc", Flag: RW },
  { code: "XOF", name: "West African CFA franc", Flag: SN },
  { code: "XAF", name: "Central African CFA franc", Flag: CM },
  { code: "EGP", name: "Egyptian pound", Flag: EG },
  { code: "MAD", name: "Moroccan dirham", Flag: MA },
  { code: "ZMW", name: "Zambian kwacha", Flag: ZM },
  { code: "ETB", name: "Ethiopian birr", Flag: ET },
  { code: "AED", name: "UAE dirham", Flag: AE },
  { code: "INR", name: "Indian rupee", Flag: IN },
  { code: "AUD", name: "Australian dollar", Flag: AU },
];

export function SellSection() {
  return (
    <section id="sell" className="px-3 md:px-5">
      <div className="relative overflow-hidden rounded-[36px] bg-cobalt-light py-20 md:rounded-[56px] md:py-28">
        <div aria-hidden className="dot-grid-on-blue absolute inset-0 opacity-50" />
        <Container className="relative">
          <SectionHeading
            onBlue
            eyebrow="Sell"
            title="Boost your sales and"
            highlight="earnings."
            subtitle="Every tool is carefully designed to help you earn more with less effort."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
            {/* Pay-as-you-go: hero feature */}
            <Reveal className="relative overflow-hidden rounded-[28px] bg-card p-7 md:p-10">
              <Icon3D
                name="wallet"
                className="absolute right-4 top-4 size-20 animate-bob md:right-8 md:top-8 md:size-28"
              />
              <span className="inline-flex rounded-full bg-midnight px-3 py-1 fs-12 font-extrabold uppercase tracking-[0.14em] text-lime">
                Only on Enski
              </span>
              <h3 className="type-h2 mt-5 pr-20 text-ink md:pr-28">
                Pay-as-you-go <span className="text-brand">learning.</span>
              </h3>
              <p className="mt-3 max-w-md fs-15 lh-24 text-muted-foreground">
                Sell premium courses without scaring learners away with high upfront costs. They
                start with a small split payment, and you still get paid progressively.
              </p>

              <div className="mt-8 rounded-[20px] bg-soft p-5 [--ts:1]">
                <div className="flex items-center justify-between fs-13 font-bold text-slate">
                  <span>Product design bootcamp</span>
                  <span className="text-ink">₦90,000</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { l: "Today", s: "Paid", on: true },
                    { l: "Week 4", s: "Paid", on: true },
                    { l: "Week 8", s: "Upcoming", on: false },
                  ].map((p) => (
                    <div key={p.l} className="rounded-[14px] bg-card p-2.5 shadow-soft sm:p-3">
                      <div className={p.on ? "h-1.5 rounded-full bg-cobalt" : "h-1.5 rounded-full bg-line"} />
                      <p className="mt-3 fs-13 font-extrabold text-ink sm:fs-15">₦30,000</p>
                      <p className="fs-11 font-semibold text-muted-foreground">
                        {p.l} · {p.s}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 fs-15 font-extrabold lh-24 text-brand">
                More affordable learning. More enrolments. More revenue.
              </p>
            </Reveal>

            {/* Payment flexibility */}
            <Reveal delay={100} className="glass-on-blue relative flex flex-col overflow-hidden rounded-[28px] p-7 md:p-10">
              <Icon3D
                name="globe"
                className="absolute right-4 top-4 size-20 animate-bob md:right-8 md:top-8 md:size-24"
              />
              <h3 className="type-h2 pr-20 text-on-blue">Payment flexibility</h3>
              <p className="mt-3 fs-15 lh-24 text-on-blue/80">
                You focus on teaching. We handle the money.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "One-time payments",
                  "20+ currencies supported",
                  "Local and international gateways",
                  "Automatic payouts",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3 fs-15 font-bold text-on-blue">
                    <span className="grid size-6 place-items-center rounded-full bg-lime text-midnight">
                      <Check className="size-3.5" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <ul aria-label="Supported currencies" className="mt-auto flex flex-wrap gap-2 pt-8">
                {currencies.map(({ code, name, Flag }, i) => (
                  <li
                    key={code}
                    title={name}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full py-1.5 pr-3 pl-2 fs-12 font-extrabold " +
                      (i === 0 ? "bg-lime text-midnight" : "bg-on-blue/12 text-on-blue")
                    }
                  >
                    <Flag aria-hidden className="h-3 w-[18px] shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgb(0_0_0/0.12)]" />
                    <span>{code}</span>
                    <span className="sr-only">{name}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Supporting features — auto-swiping carousel */}
          <Reveal className="mt-16">
            <p className="mb-6 fs-13 font-extrabold uppercase tracking-[0.15em] text-on-blue/70">
              More ways to sell
            </p>
            <AutoCarousel label="Sales features" tone="blue">
              {features.map((f, i) => (
                <FeatureSlide key={f.title} {...f} tone="blue" index={i} />
              ))}
            </AutoCarousel>
          </Reveal>

          <Reveal className="mt-14 flex justify-center">
            <Button asChild variant="lime" size="lg">
              <a href={links.register}>
                Start earning without limits <ArrowRight />
              </a>
            </Button>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
