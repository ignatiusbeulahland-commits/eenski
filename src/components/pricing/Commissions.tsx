import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal } from "@/components/site/motion";
import { links } from "@/components/site/data";
import { fees, noFees } from "./content";

const pillTilts = [-4, 3, -2, 4];

export function Commissions() {
  return (
    <section id="commissions" className="bg-soft py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow text-brand">What you pay (only when you earn)</p>
          <h2 className="text-h2 mt-4 text-ink">
            Simple, fair and <span className="text-brand">predictable commissions.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Private sales: the creator's own traffic */}
          <Reveal className="relative rounded-[32px] border border-line bg-card p-7 pt-12 shadow-card md:p-10 md:pt-14">
            <Icon3D name="wallet" className="absolute -top-9 left-7 size-20 -rotate-6 md:left-10" />
            <h3 className="text-2xl font-extrabold text-ink">Private sales (your own traffic)</h3>
            <p className="mt-2 text-[15px] font-semibold text-muted-foreground">We only charge a transaction fee here</p>

            <dl className="mt-8 space-y-6">
              {[fees.privateLocal, fees.privateInternational].map((f) => (
                <div key={f.rate} className="border-t border-line pt-6">
                  <dt className="sr-only">{f.label}</dt>
                  <dd className="text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] text-brand lg:text-5xl">
                    {f.rate}
                  </dd>
                  <dd className="mt-2 text-[15px] font-semibold text-ink">{f.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Marketplace sales: Dreamverse brings the buyers */}
          <Reveal
            delay={120}
            className="relative rounded-[32px] bg-cobalt-light p-7 pt-12 text-primary-foreground shadow-float md:p-10 md:pt-14"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
              <div className="absolute inset-0 bg-dots opacity-50" />
              <div className="absolute -right-24 -top-24 aspect-square w-[360px] rounded-full bg-glow-behind" />
            </div>
            <Icon3D name="storefront" className="absolute -top-9 left-7 size-20 rotate-6 md:left-10" />
            <div className="relative">
              <h3 className="text-2xl font-extrabold">Marketplace sales (Dreamverse-driven sales)</h3>
              <p className="mt-2 text-[15px] font-semibold text-on-blue">No transaction fee charge, just commission</p>
              <div className="mt-8 border-t border-primary-foreground/15 pt-6">
                <p className="flex items-baseline gap-3">
                  <span className="text-[4.5rem] font-extrabold leading-none tracking-[-0.04em] text-lime lg:text-[6rem]">
                    {fees.marketplace.rate}
                  </span>
                  <span className="text-xl font-extrabold">{fees.marketplace.label}</span>
                </p>
                <p className="mt-4 max-w-md text-[15px] font-semibold leading-relaxed text-on-blue">
                  {fees.marketplace.note}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12 flex flex-col items-center gap-8">
          <ul className="flex flex-wrap justify-center gap-3">
            {noFees.map((t, i) => (
              <li
                key={t}
                className="rounded-full bg-card px-5 py-2.5 text-[15px] font-extrabold text-ink shadow-float"
                style={{ rotate: `${pillTilts[i]}deg` }}
              >
                {t}
              </li>
            ))}
          </ul>
          <Button asChild size="lg">
            <a href={links.register}>
              Start earning <ArrowRight />
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
