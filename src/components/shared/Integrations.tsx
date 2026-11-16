import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { Loader2, Plug, Search, Unplug, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import googleCalendar from "@/assets/dashboard/integrations/google-calendar.svg";
import googleDrive from "@/assets/dashboard/integrations/google-drive.svg";
import googleMeet from "@/assets/dashboard/integrations/google-meet.svg";
import outlook from "@/assets/dashboard/integrations/outlook.svg";
import whatsapp from "@/assets/dashboard/integrations/whatsapp.svg";
import zoom from "@/assets/dashboard/integrations/zoom.svg";
import mailchimp from "@/assets/dashboard/integrations/mailchimp.svg";
import youtubeLogo from "@/assets/dashboard/integrations/youtube.svg";
import vimeoLogo from "@/assets/dashboard/integrations/vimeo.svg";
import slackLogo from "@/assets/dashboard/integrations/slack.svg";
import discordLogo from "@/assets/dashboard/integrations/discord.svg";
import telegramLogo from "@/assets/dashboard/integrations/telegram.svg";
import instagramLogo from "@/assets/dashboard/integrations/instagram.svg";
import tiktokLogo from "@/assets/dashboard/integrations/tiktok.svg";
import facebookLogo from "@/assets/dashboard/integrations/facebook.svg";
import linkedinLogo from "@/assets/dashboard/integrations/linkedin.svg";
import xLogo from "@/assets/dashboard/integrations/x.svg";
import microsoftTeamsLogo from "@/assets/dashboard/integrations/microsoft-teams.svg";
import dropboxLogo from "@/assets/dashboard/integrations/dropbox.svg";
import onedriveLogo from "@/assets/dashboard/integrations/onedrive.svg";
import notionLogo from "@/assets/dashboard/integrations/notion.svg";
import googleAnalyticsLogo from "@/assets/dashboard/integrations/google-analytics.svg";
import googleTagManagerLogo from "@/assets/dashboard/integrations/google-tag-manager.svg";
import metaLogo from "@/assets/dashboard/integrations/meta.svg";
import pinterestLogo from "@/assets/dashboard/integrations/pinterest.svg";
import calendlyLogo from "@/assets/dashboard/integrations/calendly.svg";
import zapierLogo from "@/assets/dashboard/integrations/zapier.svg";
import googleSheetsLogo from "@/assets/dashboard/integrations/google-sheets.svg";
import bitlyLogo from "@/assets/dashboard/integrations/bitly.svg";
import { cn } from "@/lib/utils";

/** Official third-party marks, shown unaltered on a white tile so brand colours stay true in both themes. */
export const integrationLogos = {
  "google-calendar": googleCalendar,
  "google-drive": googleDrive,
  "google-meet": googleMeet,
  "outlook-calendar": outlook,
  whatsapp,
  zoom,
  mailchimp,
  "youtube": youtubeLogo,
  "vimeo": vimeoLogo,
  "slack": slackLogo,
  "discord": discordLogo,
  "telegram": telegramLogo,
  "instagram": instagramLogo,
  "tiktok": tiktokLogo,
  "facebook": facebookLogo,
  "linkedin": linkedinLogo,
  "x": xLogo,
  "microsoft-teams": microsoftTeamsLogo,
  "dropbox": dropboxLogo,
  "onedrive": onedriveLogo,
  "notion": notionLogo,
  "google-analytics": googleAnalyticsLogo,
  "google-tag-manager": googleTagManagerLogo,
  "meta-pixel": metaLogo,
  "pinterest": pinterestLogo,
  "calendly": calendlyLogo,
  "zapier": zapierLogo,
  "google-sheets": googleSheetsLogo,
  "bitly": bitlyLogo,
} as const;
export type IntegrationLogoId = keyof typeof integrationLogos;

export function IntegrationLogo({ id, name, className }: { id: IntegrationLogoId; name: string; className?: string }) {
  return (
    <span className={cn("integration-logo grid h-12 w-12 shrink-0 place-items-center rounded-[14px] p-2.5 ring-1 ring-line transition-shadow", className)}>
      <img src={integrationLogos[id]} alt={`${name} logo`} className="max-h-full max-w-full object-contain" width={28} height={28} loading="lazy" />
    </span>
  );
}

export function IntegrationCard({ logo, name, category, description, connectedLabel, busy, onConnect, onDisconnect }: {
  logo: IntegrationLogoId;
  name: string;
  category: string;
  description: string;
  /** e.g. "Connected 12 Nov 2026"; undefined when not connected. */
  connectedLabel?: string | undefined;
  busy?: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const connected = Boolean(connectedLabel);
  return (
    <article className={cn("integration-card surface relative flex min-w-0 flex-col p-5 transition-[border-color,box-shadow,transform] duration-200", connected && "is-connected")} data-connected={connected || undefined} aria-label={`${name}, ${connected ? "connected" : "not connected"}`}>
      <div className="flex items-start gap-3.5">
        <IntegrationLogo id={logo} name={name} className="h-14 w-14 rounded-[16px] p-3" />
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="truncate text-[15px] font-extrabold">{name}</h3>
          <p className="mt-0.5 truncate text-xs font-bold text-muted-foreground">{category}</p>
        </div>
      </div>
      <p className="mt-3.5 flex-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
        <div className="min-w-0">
          {connected ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-2.5 py-1 text-xs font-extrabold text-lime-text"><span className="neon-dot is-live" aria-hidden="true" />Connected</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-xs font-bold text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />Not connected</span>
          )}
          {connectedLabel && <p className="mt-1 truncate text-xs text-muted-foreground">{connectedLabel}</p>}
        </div>
        {connected ? (
          <button type="button" onClick={onDisconnect} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-line bg-card px-4 text-[13px] font-extrabold hover:border-destructive/40 hover:text-destructive"><Unplug className="h-3.5 w-3.5" />Disconnect</button>
        ) : (
          <button type="button" onClick={onConnect} disabled={busy} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-[13px] font-extrabold text-primary-foreground transition-colors hover:bg-cobalt-hover disabled:bg-cobalt-100 disabled:text-cobalt-300">
            {busy ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Connecting…</> : <><Plug className="h-3.5 w-3.5" />Connect</>}
          </button>
        )}
      </div>
    </article>
  );
}

export function IntegrationSection({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{title}{count !== undefined && <span className="rounded-full bg-soft px-1.5 tabular-nums">{count}</span>}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

export type IntegrationItem = { id: IntegrationLogoId; name: string; category: string; description: string };

/** The one integrations experience every role uses: overview, filters, grouped cards and a disconnect confirmation. */
export function IntegrationsHub({ items, connectedLabel, onConnect, onDisconnect }: {
  items: IntegrationItem[];
  /** Label for a connected integration (e.g. "Connected 12 Nov"), or undefined when not connected. */
  connectedLabel: (id: IntegrationLogoId) => string | undefined;
  onConnect: (id: IntegrationLogoId) => void;
  onDisconnect: (id: IntegrationLogoId) => void;
}) {
  const [busy, setBusy] = useState<IntegrationLogoId | null>(null);
  const [confirm, setConfirm] = useState<IntegrationItem | null>(null);
  const [filter, setFilter] = useState<"all" | "connected" | "available">("all");
  const [query, setQuery] = useState("");
  const on = items.filter((i) => connectedLabel(i.id));
  const q = query.trim().toLowerCase();
  const visible = items.filter((i) =>
    (filter === "all" || (filter === "connected") === Boolean(connectedLabel(i.id))) &&
    (!q || `${i.name} ${i.category} ${i.description}`.toLowerCase().includes(q)));
  const categories = [...new Set(visible.map((i) => i.category))];
  const connect = (i: IntegrationItem) => {
    setBusy(i.id);
    setTimeout(() => { onConnect(i.id); setBusy(null); toast.success(`${i.name} connected`); }, 800);
  };
  return (
    <div className="space-y-6">
      <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex shrink-0 -space-x-3" aria-hidden="true">
            {items.slice(0, 4).map((i) => <IntegrationLogo key={i.id} id={i.id} name={i.name} className={cn("h-11 w-11 rounded-full p-2 ring-2 ring-card", !connectedLabel(i.id) && "opacity-60 grayscale")} />)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold"><span className="tabular-nums">{on.length}</span> of <span className="tabular-nums">{items.length}</span> connected</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft" role="progressbar" aria-label="Integrations connected" aria-valuenow={on.length} aria-valuemin={0} aria-valuemax={items.length}>
              <div className="integration-meter h-full rounded-full transition-[width] duration-500" style={{ width: `${(on.length / items.length) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="inline-flex shrink-0 self-start rounded-full border bg-card p-1 sm:self-auto" role="group" aria-label="Show integrations">
          {([["all", "All", items.length], ["connected", "Connected", on.length], ["available", "Available", items.length - on.length]] as const).map(([v, l, n]) => (
            <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)} className={cn("h-8 rounded-full px-3 text-xs font-extrabold transition-colors", filter === v ? "bg-midnight text-primary-foreground" : "text-muted-foreground hover:text-cobalt")}>{l} <span className="tabular-nums">{n}</span></button>
          ))}
        </div>
      </section>
      {items.length > 6 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${items.length} tools`} aria-label="Search integrations" className="h-12 w-full rounded-full border-[1.5px] border-line bg-card pl-11 pr-11 text-sm font-semibold outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-cobalt [&::-webkit-search-cancel-button]:hidden" />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-soft hover:text-foreground"><X className="h-4 w-4" /></button>}
        </div>
      )}
      {visible.length === 0 ? (
        <div className="surface flex flex-col items-center px-5 py-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-ice text-cobalt"><Plug className="h-5 w-5" /></span>
          <p className="mt-3 font-bold">{q ? `No tools match "${query.trim()}"` : filter === "connected" ? "Nothing connected yet" : "Everything is connected"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{q ? "Try another name or category." : filter === "connected" ? "Connect a tool below to see it here." : "You've connected every available tool."}</p>
          <button type="button" onClick={() => { setFilter("all"); setQuery(""); }} className="mt-4 text-sm font-extrabold text-cobalt hover:underline">Show all</button>
        </div>
      ) : (
        categories.every((c) => visible.filter((i) => i.category === c).length === 1) ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((i) => <IntegrationCard key={i.id} logo={i.id} name={i.name} category={i.category} description={i.description} connectedLabel={connectedLabel(i.id)} busy={busy === i.id} onConnect={() => connect(i)} onDisconnect={() => setConfirm(i)} />)}
          </div>
        ) : (
        <div className="space-y-8">
          {categories.map((c) => {
            const list = visible.filter((i) => i.category === c);
            return (
              <IntegrationSection key={c} title={c} count={list.length}>
                {list.map((i) => <IntegrationCard key={i.id} logo={i.id} name={i.name} category={i.category} description={i.description} connectedLabel={connectedLabel(i.id)} busy={busy === i.id} onConnect={() => connect(i)} onDisconnect={() => setConfirm(i)} />)}
              </IntegrationSection>
            );
          })}
        </div>
        )
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(v) => !v && setConfirm(null)}
        art={brandArtwork.plug}
        eyebrow="Integrations"
        title={`Disconnect ${confirm?.name ?? "this tool"}?`}
        description="Enski stops sending to and reading from it. You can reconnect at any time."
        confirmLabel="Disconnect"
        confirmIcon={<Unplug />}
        onConfirm={() => { if (!confirm) return; onDisconnect(confirm.id); toast.success(`${confirm.name} disconnected`); }}
      />
    </div>
  );
}
