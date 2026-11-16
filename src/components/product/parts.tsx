import { Link } from "@tanstack/react-router";
import { Check, Link2, Mail, Star, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { FaLinkedinIn } from "react-icons/fa6";
import { SiFacebook, SiWhatsapp, SiX } from "react-icons/si";

import { CreatorAvatar } from "@/components/dreamverse/CreatorAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { shareLinks } from "./share";

export interface Detail {
  label: string;
  value: string;
}

interface BuyCardProps {
  /** Price shown big, already formatted ("₦10,000"), or null for "price on request". */
  now: string | null;
  was?: string | null | undefined;
  /** Whole-number discount, shown as a lime chip when above zero. */
  off?: number | undefined;
  note?: ReactNode;
  /** Currency switch, when the creator priced it in more than one. */
  currency?: ReactNode;
  /** Country / currency picker, under the price note. */
  picker?: ReactNode;
  details: Detail[];
  /** Buy / save buttons. */
  actions: ReactNode;
  footnote?: ReactNode;
  share: { url: string; title: string; noun: string };
}

export function BuyCard({ now, was, off = 0, note, currency, picker, details, actions, footnote, share }: BuyCardProps) {
  return (
    <div className="rounded-card border border-line bg-card p-6 text-card-foreground shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-4xl font-extrabold tracking-tight text-ink">{now ?? "Price on request"}</span>
          {was && (
            <s className="text-lg font-semibold text-muted-foreground">
              <span className="sr-only">Was </span>
              {was}
            </s>
          )}
          {off > 0 && <span className="rounded-tag bg-lime px-2 py-0.5 text-xs font-extrabold text-midnight">{off}% off</span>}
        </div>
        {currency}
      </div>
      {note && <p className="mt-1 text-sm font-semibold text-muted-foreground" aria-live="polite">{note}</p>}
      {picker}

      {details.length > 0 && (
        <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
          {details.map((d) => (
            <div key={d.label} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{d.label}</dt>
              <dd className="text-right font-bold text-ink">{d.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 grid gap-3">{actions}</div>
      {footnote && <div className="mt-4 flex gap-2 text-[13px] leading-relaxed text-muted-foreground">{footnote}</div>}

      <ShareRow {...share} />
    </div>
  );
}

const SHARE_ICONS = { facebook: SiFacebook, twitter: SiX, linkedin: FaLinkedinIn, whatsapp: SiWhatsapp, email: Mail } as const;

function ShareRow({ url, title, noun }: { url: string; title: string; noun: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
  };
  return (
    <div className="mt-6 border-t border-line pt-5">
      <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Share this {noun}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {shareLinks(url, title).map((s) => {
          const Icon = SHARE_ICONS[s.id];
          return (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              title={s.label}
              className="grid size-10 place-items-center rounded-full bg-ice text-brand transition-colors hover:bg-sky-200"
            >
              <Icon className="size-4" aria-hidden />
            </a>
          );
        })}
      </div>
      <Button type="button" variant="secondary" size="sm" className="mt-3 w-full" onClick={() => void copy()}>
        <Link2 aria-hidden /> <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </Button>
    </div>
  );
}

export function PanelHeading({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mb-4 text-2xl font-extrabold tracking-tight text-ink">
      {children}
    </h2>
  );
}

/** Lime-tick grid used for "What you'll learn" and highlights. */
export function Learn({ items, icon: Icon = Check }: { items: string[]; icon?: LucideIcon }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-3 rounded-field bg-soft p-4 font-semibold text-ink">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-lime text-midnight">
            <Icon className="size-3.5" strokeWidth={3} aria-hidden />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function Empty({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-soft p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-ice text-brand">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-lg font-extrabold text-ink">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Icon + label + value rows, e.g. course information. */
export function InfoList({ rows }: { rows: { icon: LucideIcon; label: string; value: string }[] }) {
  return (
    <dl className="divide-y divide-line rounded-card border border-line px-5">
      {rows.map((row) => (
        <div key={row.label} className="flex items-start gap-3 py-3.5">
          <row.icon className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
          <dt className="w-28 shrink-0 text-sm font-semibold text-muted-foreground">{row.label}</dt>
          <dd className="min-w-0 flex-1 text-sm font-bold text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Instructor({
  name,
  avatar,
  slug,
  headline,
  bio,
  expertise = [],
  extra,
}: {
  name: string;
  avatar?: string | null | undefined;
  slug?: string | null | undefined;
  headline?: string | null | undefined;
  bio?: string | null | undefined;
  expertise?: string[] | undefined;
  extra?: string | null | undefined;
}) {
  return (
    <div className="rounded-card bg-ice p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <CreatorAvatar name={name} src={avatar ?? null} size="lg" className="size-16 ring-4 ring-background" />
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold text-ink">{name}</p>
          {headline && <p className="text-sm text-muted-foreground">{headline}</p>}
          {extra && <p className="mt-0.5 text-sm font-semibold text-muted-foreground">{extra}</p>}
        </div>
        {slug && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/creators/$slug" params={{ slug }}>Visit page</Link>
          </Button>
        )}
      </div>
      {bio && <p className="mt-5 max-w-[68ch] leading-relaxed text-ink">{bio}</p>}
      {expertise.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Expertise">
          {expertise.map((e) => (
            <li key={e} className="rounded-full bg-background px-3 py-1 text-xs font-extrabold text-brand">{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Average + star row + optional 5→1 breakdown, or an honest empty state. */
export function Reviews({
  rating,
  breakdown,
  noun,
  emptyBody,
}: {
  rating: { average: number; count: number | null } | null;
  breakdown?: number[] | null | undefined;
  noun: string;
  emptyBody: string;
}) {
  if (!rating) return <Empty icon={Star} title="No reviews yet" body={emptyBody} />;
  const count = rating.count;
  return (
    <div className="flex flex-col gap-8 rounded-card border border-line p-6 sm:flex-row sm:items-center sm:p-8">
      <div className="text-center sm:w-40">
        <p className="text-5xl font-extrabold text-ink">{rating.average.toFixed(1)}</p>
        <p className="mt-2 flex justify-center gap-0.5" aria-label={`${rating.average.toFixed(1)} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={cn("size-4", n <= Math.round(rating.average) ? "fill-sky text-sky" : "text-line")} aria-hidden />
          ))}
        </p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {count !== null ? `${count} verified ${count === 1 ? "rating" : "ratings"}` : `${noun} rating`}
        </p>
      </div>
      {breakdown && count ? (
        <ul className="flex-1 space-y-2">
          {breakdown.map((n, i) => {
            const stars = 5 - i;
            const pct = Math.round((n / count) * 100);
            return (
              <li key={stars} className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                <span className="w-12 shrink-0">{stars} star</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-ice">
                  <span className="block h-full rounded-full bg-sky" style={{ width: `${pct}%` }} />
                </span>
                <span className="w-10 shrink-0 text-right">{pct}%</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          Written reviews from people who bought this {noun.toLowerCase()} will appear here.
        </p>
      )}
    </div>
  );
}
