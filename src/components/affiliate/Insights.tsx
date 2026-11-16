import { Link } from "@tanstack/react-router";
import { Link2, Mail, Share2 } from "lucide-react";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { IntegrationLogo } from "@/components/shared/Integrations";
import { Panel } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";

/** Clicks → referrals → conversions, with the conversion rate. Values come from real tracked activity (none yet). */
export function ConversionFunnel({ clicks = 0, referrals = 0, conversions = 0, className }: { clicks?: number; referrals?: number; conversions?: number; className?: string }) {
  const max = Math.max(clicks, 1);
  const rate = clicks ? `${((conversions / clicks) * 100).toFixed(1)}%` : "—";
  const rows = [
    { label: "Clicks", value: clicks, art: brandArtwork.click },
    { label: "Referrals", value: referrals, art: brandArtwork.people },
    { label: "Conversions", value: conversions, art: brandArtwork.target },
  ];
  return (
    <Panel className={className} title="Conversion funnel" description="How link clicks turn into purchases">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_200px] sm:items-center">
        <ol className="space-y-3">
          {rows.map((r, i) => (
            <li key={r.label} className="flex items-center gap-3">
              <BrandIcon src={r.art} className="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-bold">{r.label}</span>
                  <span className="font-extrabold tabular-nums">{r.value}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-soft" style={{ marginRight: `${i * 10}%` }}>
                  <div className="h-full rounded-full bg-gradient-to-r from-cobalt to-sky transition-[width] duration-700" style={{ width: `${(r.value / max) * 100}%` }} />
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="stat-card is-featured surface relative flex items-center gap-3 overflow-hidden p-4 sm:flex-col sm:items-start">
          <BrandIcon src={brandArtwork.conversion} className="stat-art h-12 w-12 sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><span className="neon-dot" aria-hidden="true" />Conversion rate</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{rate}</p>
            <p className="text-xs text-muted-foreground">{clicks ? "Conversions ÷ clicks" : "Needs at least one click"}</p>
          </div>
          <div className="stat-card-bar absolute inset-x-0 bottom-0 h-0.5" aria-hidden="true" />
        </div>
      </div>
    </Panel>
  );
}

const channels = [
  { label: "WhatsApp", logo: "whatsapp" as const },
  { label: "Social posts", icon: Share2 },
  { label: "Email", icon: Mail },
  { label: "Direct link", icon: Link2 },
];

/** Where visitors come from. Shows an honest empty state until links get clicks. */
export function ReferralSources({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Panel className={className} title="Referral sources" description="Channels that send people to your links">
      <div className="flex flex-col items-center text-center">
        <BrandIcon src={brandArtwork.sources} className={compact ? "h-14 w-14" : "h-16 w-16"} />
        <p className="mt-3 text-sm font-bold">No traffic sources yet</p>
        <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">Once your links get clicks, you'll see which channels bring the most visitors.</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Channels we track">
          {channels.map((c) => (
            <li key={c.label} className="inline-flex items-center gap-1.5 rounded-full border bg-card py-1 pl-1 pr-3 text-xs font-bold">
              {"logo" in c && c.logo ? <IntegrationLogo id={c.logo} name={c.label} className="h-6 w-6 rounded-full p-1" /> : c.icon ? <span className="grid h-6 w-6 place-items-center rounded-full bg-ice text-cobalt"><c.icon className="h-3.5 w-3.5" /></span> : null}
              {c.label}
            </li>
          ))}
        </ul>
        {!compact && <Button asChild variant="outline" size="sm" className="mt-5"><Link to="/affiliate/my-affiliations">Share a link</Link></Button>}
      </div>
    </Panel>
  );
}
