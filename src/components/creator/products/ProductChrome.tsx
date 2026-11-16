import { useState, type ReactNode } from "react";
import {
  Award,
  BellRing,
  CalendarClock,
  ClipboardList,
  FileStack,
  GraduationCap,
  Layers,
  ListChecks,
  MailCheck,
  Package,
  ScrollText,
  ShieldCheck,
  Ticket,
  Timer,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { brandArtwork, BrandIcon } from "@/components/affiliate/BrandIcon";
import type { ItemKind } from "@/lib/creator/rules";
import { cn } from "@/lib/utils";

/** Glossy 3D artwork that represents each product type. */
export const kindArt: Record<ItemKind, string> = {
  course: brandArtwork.video,
  ebook: brandArtwork.book,
  live: brandArtwork.calendar,
  service: brandArtwork.package,
  coaching: brandArtwork.chat,
};

/** What a creator can set up for each type — mirrors that type's management tabs. */
export const kindFeatures: Record<ItemKind, { icon: LucideIcon; title: string; text: string }[]> = {
  course: [
    { icon: Layers, title: "Curriculum", text: "Modules, lessons and learning objectives." },
    { icon: ListChecks, title: "Assessments", text: "Quizzes with a pass mark." },
    { icon: Award, title: "Certificates", text: "Awarded when students finish." },
    { icon: CalendarClock, title: "Drip schedule", text: "Release lessons over time." },
  ],
  ebook: [
    { icon: FileStack, title: "Files & versions", text: "Upload and update what buyers get." },
    { icon: MailCheck, title: "Delivery", text: "Instant access and download limits." },
    { icon: UsersRound, title: "Buyers", text: "See who bought and downloaded." },
  ],
  live: [
    { icon: CalendarClock, title: "Schedule & venue", text: "Date, seats, online or in person." },
    { icon: Ticket, title: "Tickets", text: "Early bird, VIP and more." },
    { icon: ClipboardList, title: "Registrations", text: "Track sign-ups and check-ins." },
    { icon: BellRing, title: "Reminders", text: "Automatic nudges before you start." },
  ],
  service: [
    { icon: Package, title: "Packages", text: "Tiers with their own price and timeline." },
    { icon: ClipboardList, title: "Requirements", text: "Collect what you need to begin." },
    { icon: Timer, title: "Order pipeline", text: "Move work from brief to delivered." },
    { icon: ShieldCheck, title: "Policies", text: "Revisions and refund terms." },
  ],
  coaching: [
    { icon: CalendarClock, title: "Sessions", text: "Length, buffer and booking window." },
    { icon: UsersRound, title: "Bookings", text: "Upcoming, completed and no-shows." },
    { icon: ScrollText, title: "Intake form", text: "Questions clients answer first." },
    { icon: GraduationCap, title: "Policies", text: "Rescheduling and cancellations." },
  ],
};

/** Product cover that falls back to branded artwork when no image is set or it fails to load. */
export function ProductCover({
  src,
  alt,
  kind,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  kind: ItemKind;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div role="img" aria-label={alt} data-surface="dark" className={cn("bg-brand-panel grid place-items-center", className)}>
        <BrandIcon src={kindArt[kind]} className="h-16 w-16 drop-shadow-lg sm:h-20 sm:w-20" />
      </div>
    );
  }
  return (
    <div className={cn("overflow-hidden bg-muted", className)}>
      <img src={src} alt={alt} onError={() => setFailed(true)} className={cn("h-full w-full object-cover", imgClassName)} />
    </div>
  );
}

/** Translucent stat chip for use on the signature blue panel. */
export function GlassStat({ label, value, hint }: { label: string; value: ReactNode; hint?: string | undefined }) {
  return (
    <div className="min-w-0 rounded-2xl border border-on-dark/15 bg-on-dark/10 px-4 py-3 backdrop-blur-sm">
      <p className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-on-dark-muted">{label}</p>
      <p className="mt-1 truncate text-lg font-extrabold tabular-nums text-on-dark sm:text-xl">{value}</p>
      {hint && <p className="mt-0.5 truncate text-xs text-on-dark-muted">{hint}</p>}
    </div>
  );
}

/** Lists the tools each product type comes with. */
export function FeatureTiles({ kind, className }: { kind: ItemKind; className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {kindFeatures[kind].map(({ icon: Icon, title, text }) => (
        <li key={title} className="product-feature flex items-start gap-3 rounded-2xl border bg-card p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ice text-cobalt ring-1 ring-line">
            <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold">{title}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Circular progress used by the setup checklist. */
export function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={6} className="stroke-ice" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className={cn("transition-[stroke-dashoffset] duration-700", pct === 100 ? "stroke-lime" : "stroke-cobalt")}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xs font-extrabold tabular-nums">{Math.round(pct)}%</span>
    </div>
  );
}
