import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";

import { CREATOR_STATUS_LABEL, type CreatorProfile } from "@/lib/dreamverse/creators";
import { cn } from "@/lib/utils";

import { CreatorAvatar } from "./CreatorAvatar";

/** Tag that tells demo, not-yet-joined and real Enski creators apart. */
export function CreatorStatusTag({ status, className }: { status: CreatorProfile["status"]; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold",
        status === "enski" ? "bg-ice text-brand" : "bg-soft text-muted-foreground ring-1 ring-line ring-inset",
        className,
      )}
    >
      {status === "enski" && <BadgeCheck className="size-3.5" aria-hidden />}
      {CREATOR_STATUS_LABEL[status]}
    </span>
  );
}

export function CreatorCard({ creator, resourceCount }: { creator: CreatorProfile; resourceCount: number }) {
  const place = creator.country ?? creator.affiliation;
  return (
    <article className="group relative flex h-full flex-col rounded-[24px] border border-line bg-card p-5 transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-cobalt-100 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <CreatorAvatar name={creator.name} src={creator.avatar} size="lg" className="size-16 text-xl" />
        <CreatorStatusTag status={creator.status} />
      </div>
      <h3 className="mt-4 text-lg leading-snug font-extrabold tracking-tight text-ink">
        <Link
          to="/creators/$slug"
          params={{ slug: creator.slug }}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {creator.name}
        </Link>
      </h3>
      {place && (
        <p className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{place}</span>
        </p>
      )}
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {creator.headline ?? "Profile details coming soon."}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm font-extrabold text-brand">
        <span className="text-[13px] font-semibold text-muted-foreground">
          {resourceCount > 0
            ? `${resourceCount} ${resourceCount === 1 ? "listing" : "listings"}`
            : creator.status === "not_joined"
              ? "No listings"
              : "No listings yet"}
        </span>
        <span className="inline-flex items-center gap-1" aria-hidden>
          View profile <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
