import { Award, BarChart3, CalendarDays, Film, Images, Presentation, Check, Clock, Download, FileText, Layers, MapPin, Package, Phone, Users, Video } from "lucide-react";
import type { ReactNode } from "react";
import { BrandIcon } from "@/components/affiliate/BrandIcon";
import { naira } from "@/lib/affiliate/products";
import { kindInfo } from "@/lib/creator/data";
import { createGuide, type CreateExtras } from "@/lib/creator/createGuide";
import { LEVEL_LABEL } from "@/lib/creator/courseMeta";
import type { CreatorItem, ItemKind } from "@/lib/creator/rules";
import { ProductCover, kindArt } from "./ProductChrome";

const cta: Record<ItemKind, string> = { course: "Buy course", ebook: "Buy eBook", live: "Register now", service: "Order now", coaching: "Book a session" };
const licence = { personal: "Personal use", commercial: "Commercial use", extended: "Extended licence" };
const Chip = ({ icon: Icon, children }: { icon: typeof Clock; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-soft px-2 py-0.5 text-[11px] font-bold text-muted-foreground"><Icon className="h-3 w-3 text-cobalt" />{children}</span>
);

/** Storefront card that updates as the creator types; content differs per product type. */
export function CreatePreview({ kind, form, x }: { kind: ItemKind; form: CreatorItem; x: CreateExtras }) {
  const g = createGuide[kind];
  const info = kindInfo[kind];
  const pkgs = x.packages.filter((p) => Number.isFinite(p.price));
  const price = kind === "service" && pkgs.length ? Math.min(...pkgs.map((p) => p.price)) : form.price;
  const priceText = Number.isFinite(price) && price > 0 ? `${kind === "service" && pkgs.length ? "From " : ""}${naira(price)}` : Number.isFinite(price) ? "Free" : "—";
  const lessons = x.modules.flatMap((m) => m.lessons).filter((l) => l.title.trim());
  const mins = lessons.reduce((n, l) => n + (Number.isFinite(l.minutes) ? l.minutes : 0), 0);
  const start = Date.parse(form.date);
  return (
    <article className="create-preview surface overflow-hidden">
      <div className="relative">
        <ProductCover src={form.image} alt="Cover preview" kind={kind} className="aspect-[16/10] w-full" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-midnight/80 px-2.5 py-1 text-[11px] font-extrabold text-on-dark backdrop-blur"><span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />{info.label}</span>
        <span className="absolute bottom-3 right-3 rounded-full bg-card/95 px-3 py-1 text-sm font-extrabold tabular-nums text-foreground shadow-sm">{priceText}</span>
      </div>
      <div className="space-y-3 p-5">
        <p className="flex items-center gap-2 text-xs font-bold text-cobalt"><BrandIcon src={kindArt[kind]} className="h-6 w-6" /><span className="truncate">{form.category.trim() || "General"}{(kind === "course" ? x.skill : x.subtype).trim() ? ` · ${(kind === "course" ? x.skill : x.subtype).trim()}` : ""}</span></p>
        <h3 className="break-words text-base leading-snug">{form.title.trim() || g.titlePlaceholder.replace(/^e\.g\. /, "")}</h3>
        <p className="line-clamp-3 text-sm text-muted-foreground">{form.description.trim() || g.descPlaceholder}</p>

        {kind === "course" && (
          <>
            <div className="flex flex-wrap gap-1.5">
              <Chip icon={Layers}>{x.modules.length} module{x.modules.length === 1 ? "" : "s"}</Chip>
              <Chip icon={FileText}>{lessons.length} lesson{lessons.length === 1 ? "" : "s"}</Chip>
              {mins > 0 && <Chip icon={Clock}>{mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`}</Chip>}
              <Chip icon={BarChart3}>{LEVEL_LABEL[x.level]}</Chip>
              {x.certificate && <Chip icon={Award}>Certificate</Chip>}
              {x.presentation.video && <Chip icon={Film}>Intro video</Chip>}
              {x.presentation.images.length > 0 && <Chip icon={Images}>{x.presentation.images.length} image{x.presentation.images.length === 1 ? "" : "s"}</Chip>}
              {x.presentation.slides && <Chip icon={Presentation}>Slides</Chip>}
            </div>
            {x.objectives.some((o) => o.trim()) && (
              <ul className="space-y-1.5 border-t border-line/70 pt-3">
                {x.objectives.filter((o) => o.trim()).slice(0, 3).map((o) => <li key={o} className="flex gap-2 text-[13px]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cobalt" strokeWidth={3} /><span className="min-w-0 break-words">{o}</span></li>)}
              </ul>
            )}
          </>
        )}
        {kind === "ebook" && (
          <div className="flex flex-wrap gap-1.5">
            <Chip icon={Download}>{x.files.length ? `${x.files.length} file${x.files.length === 1 ? "" : "s"}` : "No files yet"}</Chip>
            {[...new Set(x.files.map((f) => (f.name.split(".").pop() ?? "").toUpperCase()).filter(Boolean))].slice(0, 3).map((e) => <Chip key={e} icon={FileText}>{e}</Chip>)}
            <Chip icon={Check}>{licence[x.license]}</Chip>
          </div>
        )}
        {kind === "live" && (
          <div className="flex items-center gap-3 rounded-[14px] bg-soft/70 p-2.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-cobalt text-center leading-none text-primary-foreground">
              {Number.isFinite(start) ? <span><span className="block text-[9px] font-extrabold uppercase text-lime">{new Date(start).toLocaleDateString("en-GB", { month: "short" })}</span><span className="block text-base font-extrabold">{new Date(start).getDate()}</span></span> : <CalendarDays className="h-5 w-5" />}
            </span>
            <span className="min-w-0 text-xs">
              <span className="block font-extrabold">{Number.isFinite(start) ? new Date(start).toLocaleString("en-GB", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true }) : "Date to be set"}</span>
              <span className="flex items-center gap-1 text-muted-foreground">{x.venue === "online" ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}{x.venue === "online" ? "Online" : x.address.trim() || "In person"} · {x.durationMins} min · {LEVEL_LABEL[x.level]}</span>
            </span>
            <span className="ml-auto shrink-0 text-right text-[11px] font-bold text-muted-foreground"><Users className="mx-auto mb-0.5 h-3.5 w-3.5 text-cobalt" />{Number.isFinite(form.capacity) ? form.capacity : 0} seats</span>
          </div>
        )}
        {kind === "service" && (
          x.packages.length ? (
            <ul className="grid gap-1.5">
              {x.packages.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2 rounded-[12px] border border-line px-2.5 py-2 text-xs">
                  <Package className="h-3.5 w-3.5 shrink-0 text-cobalt" />
                  <span className="min-w-0 flex-1 truncate font-bold">{p.name.trim() || `Tier ${i + 1}`}</span>
                  <span className="shrink-0 text-muted-foreground">{Number.isFinite(p.days) ? `${p.days}d` : ""}</span>
                  <span className="shrink-0 font-extrabold tabular-nums">{Number.isFinite(p.price) ? (p.price ? naira(p.price) : "Free") : "—"}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-wrap gap-1.5"><Chip icon={Clock}>Delivered in {form.duration} day{form.duration === 1 ? "" : "s"}</Chip></div>
          )
        )}
        {kind === "coaching" && (
          <div className="flex flex-wrap gap-1.5">
            <Chip icon={Clock}>{form.duration} min</Chip>
            <Chip icon={x.location === "video" ? Video : x.location === "phone" ? Phone : MapPin}>{x.location === "video" ? "Video call" : x.location === "phone" ? "Phone" : "In person"}</Chip>
            <Chip icon={CalendarDays}>Book up to {x.windowDays} days ahead</Chip>
          </div>
        )}
        <div className="create-preview-cta mt-1 flex h-10 items-center justify-center rounded-full bg-cobalt text-sm font-extrabold text-primary-foreground" aria-hidden="true">{cta[kind]}</div>
      </div>
    </article>
  );
}
