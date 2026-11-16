import { ArrowRight, Check, Search, ShoppingBag, ThumbsUp } from "lucide-react";
import { Button } from "@/components/features/button";
import { Container, Reveal, SectionHeading } from "./primitives";
import { photos } from "./photos";
import { Icon3D } from "./icons3d";
import { links } from "./links";
import storeBanner from "@/assets/features/photos/store-banner.webp";
import storeAvatar from "@/assets/features/photos/store-avatar.webp";

const points = [
  "Customisable store page with your branding",
  "Showcase multiple products, from courses to digital downloads",
  "Track your earnings in real time",
  "Manage your learners easily",
  "Total creative freedom",
];

export function StoreSection() {
  return (
    <section id="store" className="pb-20 md:pb-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <StorefrontMock />
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading
              align="left"
              eyebrow="Your store"
              title="Your store. Your brand."
              highlight="Your rules."
              subtitle="Build a premium storefront that reflects who you are, without writing a line of code."
            />
            <ul className="mt-8 space-y-4">
              {points.map((p, i) => (
                <Reveal as="li" key={p} delay={i * 60} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-cobalt text-primary-foreground">
                    <Check className="size-3.5" />
                  </span>
                  <span className="fs-16 font-semibold text-slate">{p}</span>
                </Reveal>
              ))}
            </ul>
            <Reveal className="mt-10">
              <Button asChild size="lg">
                <a href={links.register}>
                  Build your store <ArrowRight />
                </a>
              </Button>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

function StorefrontMock() {
  const products = [
    { t: "Brand strategy masterclass", p: "₦35,000", k: "Course", img: photos.design },
    { t: "Ankara pattern pack", p: "₦6,500", k: "Template", img: photos.fashion },
    { t: "Pricing playbook", p: "₦4,000", k: "Ebook", img: null },
  ];
  return (
    <div className="relative [--ts:1]">
      <div aria-hidden className="absolute -left-2 -top-3 bottom-10 right-8 rounded-[32px] bg-ice md:-left-6 md:-top-6 md:right-10 md:rounded-[40px]" />
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-card shadow-lift">
        {/* browser chrome */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-line" />
            <span className="size-2.5 rounded-full bg-line" />
            <span className="size-2.5 rounded-full bg-line" />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-soft px-3 py-1.5 fs-12 font-semibold text-muted-foreground">
            <Search className="size-3.5" /> ada.enski.store
          </div>
        </div>
        <div className="relative h-28 overflow-hidden bg-cobalt-light md:h-36">
          <img
            src={storeBanner}
            alt="Ada Designs Studio banner: colour swatches, pens and sketches on a design desk"
            width={1200}
            height={300}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        </div>
        <div className="px-5 pb-6 md:px-7">
          <div className="-mt-10 flex items-end justify-between">
            <img
              src={storeAvatar}
              alt="Ada, owner of Ada Designs Studio"
              width={240}
              height={240}
              loading="lazy"
              decoding="async"
              className="relative size-20 rounded-full border-4 border-card bg-sky object-cover shadow-float"
            />
            <span className="inline-flex h-10 items-center gap-2 rounded-full bg-cobalt px-4 fs-13 font-extrabold text-primary-foreground">
              <ShoppingBag className="size-4" /> Shop all
            </span>
          </div>
          <p className="mt-3 fs-20 font-extrabold text-ink">Ada Designs Studio</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 fs-13 font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-ice px-2 py-0.5 font-extrabold text-brand">
              <ThumbsUp aria-hidden className="size-3.5" strokeWidth={2} />
              4.9 / 5
            </span>
            Design and branding for creatives
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {products.map((p) => (
              <div key={p.t} className="overflow-hidden rounded-[16px] border border-line">
                <div className="h-24 overflow-hidden bg-sky-light-glow">
                  {p.img ? (
                    <img src={p.img} alt={`${p.t} cover`} width={768} height={960} loading="lazy" className="size-full object-cover object-[50%_30%]" />
                  ) : (
                    <div className="grid size-full place-items-center">
                      <Icon3D name="ebook" className="size-16 -rotate-6" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <span className="fs-11 font-extrabold text-sky-text">{p.k}</span>
                  <p className="fs-13 font-extrabold lh-16 text-ink">{p.t}</p>
                  <p className="mt-1.5 fs-13 font-extrabold text-brand">{p.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute -right-2 -top-5 flex items-center gap-2 rounded-full bg-midnight py-2 pl-2 pr-4 shadow-float animate-float-slow md:-right-6"
        style={{ ["--tilt" as string]: "4deg" }}
      >
        <span className="grid size-7 place-items-center rounded-full bg-lime fs-12 font-extrabold text-midnight">
          ₦
        </span>
        <span className="fs-13 font-extrabold text-on-blue">New sale · ₦35,000</span>
      </div>
    </div>
  );
}
