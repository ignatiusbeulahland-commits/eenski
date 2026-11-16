import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Info, Mail, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Reveal } from "@/components/site/motion";
import { highlights, legalPages, policies, SUPPORT_EMAIL, type LegalBlock, type LegalKey } from "@/lib/legal/policies";

const slug = (n: string | null, t: string) => `${n ? `s${n}-` : ""}${t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

/** Renders **bold** and [text](url) from the source wording. */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**")) return <strong key={i} className="font-bold text-ink">{p.slice(2, -2)}</strong>;
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) {
          const ext = /^https?:/.test(m[2]);
          return (
            <a key={i} href={m[2]} className="font-semibold text-brand underline underline-offset-2 hover:no-underline" {...(ext ? { target: "_blank", rel: "noreferrer" } : {})}>
              {m[1]}
            </a>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <div className="space-y-4 text-[15.5px] leading-relaxed text-muted-foreground sm:text-base">
      {blocks.map((b, i) =>
        Array.isArray(b) ? (
          <ul key={i} className="space-y-2.5">
            {b.map((li, j) => (
              <li key={j} className="flex gap-3">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                <span><Inline text={li} /></span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}><Inline text={b} /></p>
        ),
      )}
    </div>
  );
}

export function LegalPage({ page, children }: { page: LegalKey; children?: ReactNode }) {
  const p = policies[page];
  const others = legalPages.filter((l) => l.key !== page);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-cobalt-light text-primary-foreground">
          <div className="absolute inset-0 bg-dots opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-[1200px] px-5 pb-14 pt-28 lg:pb-20 lg:pt-36">
            <nav aria-label="Legal pages" className="flex animate-rise flex-wrap gap-2">
              {legalPages.map((l) => (
                <Link
                  key={l.key}
                  to={l.path}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    l.key === page ? "border-lime bg-lime text-midnight" : "border-primary-foreground/25 text-on-blue hover:border-lime hover:text-lime"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <p className="eyebrow mt-8 animate-rise text-lime">Legal · Enski</p>
            <h1 className="text-display mt-4 animate-rise text-primary-foreground">{p.title}</h1>
            <p className="mt-5 max-w-[38rem] animate-rise text-[17px] leading-relaxed text-on-blue [animation-delay:200ms]">
              {legalPages.find((l) => l.key === page)?.blurb} Written in plain language for learners, creators and affiliates across Africa and beyond.
            </p>
            <div className="mt-6 flex animate-rise flex-wrap gap-3 text-sm text-on-blue [animation-delay:300ms]">
              {p.effective && (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3.5 py-1.5">
                  <CalendarDays className="size-4 text-lime" /> Effective {p.effective}
                </span>
              )}
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3.5 py-1.5">
                <ShieldCheck className="size-4 text-lime" /> {p.sections.length} sections
              </span>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 lg:grid-cols-[260px_1fr] lg:gap-14 lg:py-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <details className="group rounded-2xl border border-border bg-card p-4 lg:open:p-5" open>
              <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                On this page
              </summary>
              <ol className="mt-3 space-y-1">
                {p.sections.map((s) => (
                  <li key={s.title}>
                    <a href={`#${slug(s.n, s.title)}`} className="flex gap-2 rounded-lg px-2 py-1.5 text-sm text-ink transition-colors hover:bg-muted hover:text-brand">
                      {s.n && <span className="w-5 shrink-0 font-bold text-brand">{s.n}</span>}
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          </aside>

          <article className="min-w-0">
            {p.notice && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-lime bg-lime-100 p-4 text-sm leading-relaxed text-midnight">
                <Info className="mt-0.5 size-4 shrink-0" />
                <p>{p.notice}</p>
              </div>
            )}

            <Reveal>
              <div className="rounded-3xl bg-muted p-6 sm:p-8">
                <h2 className="text-lg font-extrabold text-ink">At a glance</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {highlights[page].map((h) => (
                    <li key={h} className="flex gap-3 text-[15px] leading-snug text-ink">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" /> {h}
                    </li>
                  ))}
                </ul>
                {p.intro.length > 0 && <div className="mt-5"><Blocks blocks={p.intro} /></div>}
              </div>
            </Reveal>

            {children}

            <div className="mt-10 divide-y divide-border">
              {p.sections.map((s) => (
                <section key={s.title} id={slug(s.n, s.title)} className="scroll-mt-28 py-8 first:pt-0">
                  <h2 className="flex items-baseline gap-3 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                    {s.n && <span className="text-base font-bold text-brand">{s.n.padStart(2, "0")}</span>}
                    {s.title}
                  </h2>
                  <div className="mt-4"><Blocks blocks={s.blocks} /></div>
                </section>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-midnight p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="text-lg font-extrabold">Questions about this policy?</h2>
                <p className="mt-1 text-sm text-on-blue">Our support team usually replies within one working day.</p>
              </div>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-bold text-midnight transition-colors hover:bg-lime-hover">
                <Mail className="size-4" /> {SUPPORT_EMAIL}
              </a>
            </div>
          </article>
        </div>

        <section className="border-t border-border bg-muted/50">
          <div className="mx-auto max-w-[1200px] px-5 py-12">
            <h2 className="text-xl font-extrabold text-ink">Related policies</h2>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {others.map((o) => (
                <Link key={o.key} to={o.path} className="group rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md sm:p-5">
                  <span className="flex items-center justify-between font-bold text-ink">
                    {o.label} <ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{o.blurb}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export const legalHead = (key: LegalKey, description: string) => {
  const t = `${policies[key].title} — Enski`;
  const path = legalPages.find((l) => l.key === key)!.path;
  return {
    meta: [
      { title: t },
      { name: "description", content: description },
      { property: "og:title", content: t },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: path },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: path }],
  };
};
