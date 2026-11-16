import { Link } from "@tanstack/react-router";
import { Copy, Download, Linkedin, Loader2, Lock, Share2, ShieldCheck } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { StatusBadge } from "@/components/affiliate/ui";
import { BadgeEmblem } from "@/components/shared/badges/BadgeEmblem";
import { renderCertificateImage } from "@/components/shared/certificate/exportCertificate";
import { downloadBlob } from "@/lib/download";
import { badgeDefs, badgeProgress, type LearnerState } from "@/lib/learner/rules";
import { BADGE_CATEGORIES, PLATFORM_BADGES, awardedByLabel, badgeCredentialId, categoryInfo, type BadgeCategory, type BadgeIcon } from "@/lib/shared/badges";
import type { BadgeAward } from "@/lib/shared/credentials";
import { cn } from "@/lib/utils";
import { shortDate } from "./shared";
import { linkedInAddUrl } from "@/lib/learner/certificateShare";

export type BadgeItem = {
  key: string;
  name: string; category: BadgeCategory; icon: BadgeIcon; artwork?: string | undefined; description: string; criteria: string;
  howAwarded: string;
  status: "earned" | "revoked" | "locked";
  earnedAt?: string | undefined; credentialId?: string | undefined; issuer?: string | undefined; evidence?: string | undefined; revokeReason?: string | undefined; courseTitle?: string | undefined; recipient?: string | undefined;
  progress?: { cur: number; target: number } | undefined;
};

/** Every badge the learner holds or can work towards, grouped by category. */
export function useBadgeItems(state: LearnerState, awards: BadgeAward[]): BadgeItem[] {
  return useMemo(() => {
    const prog = badgeProgress(state);
    const email = state.profile.email.trim().toLowerCase();
    const auto: BadgeItem[] = badgeDefs.map((b) => {
      const def = PLATFORM_BADGES.find((p) => p.id === b.id);
      const at = state.badges[b.id];
      return {
        key: b.id, name: def?.name ?? b.title, category: def?.category ?? "learning", icon: def?.icon ?? "award", description: b.description, criteria: def?.criteria ?? b.how,
        howAwarded: awardedByLabel.auto, status: at ? "earned" : "locked", earnedAt: at, issuer: at ? "Enski" : undefined, recipient: at ? (state.profile.certificateName || state.profile.fullName || undefined) : undefined,
        credentialId: at && email ? badgeCredentialId(`${email}|${b.id}`) : undefined, progress: at ? undefined : { cur: prog[b.id] ?? 0, target: b.target },
      };
    });
    const held: BadgeItem[] = awards.map((a) => ({
      key: a.id, name: a.badge.name, category: a.badge.category, icon: a.badge.icon, artwork: a.badge.artwork || undefined, description: a.badge.description, criteria: a.badge.criteria,
      howAwarded: awardedByLabel.issuer, status: a.status === "active" ? "earned" : "revoked", earnedAt: a.issuedAt, credentialId: a.id, issuer: a.issuer, evidence: a.evidence,
      revokeReason: a.revokeReason, courseTitle: a.courseTitle || undefined, recipient: a.recipientName,
    }));
    const heldIds = new Set(awards.filter((a) => a.status === "active").map((a) => a.badgeId));
    const locked: BadgeItem[] = PLATFORM_BADGES.filter((b) => b.awardedBy !== "auto" && !heldIds.has(b.id)).map((b) => ({
      key: `locked-${b.id}`, name: b.name, category: b.category, icon: b.icon, description: b.description, criteria: b.criteria, howAwarded: awardedByLabel[b.awardedBy], status: "locked",
    }));
    return [...auto, ...held, ...locked];
  }, [state, awards]);
}

export function BadgeCollection({ items }: { items: BadgeItem[] }) {
  const [filter, setFilter] = useState<"all" | "earned">("all");
  const shown = filter === "earned" ? items.filter((i) => i.status === "earned") : items;
  const earned = items.filter((i) => i.status === "earned").length;
  const shelf = items.filter((i) => i.status === "earned").sort((a, b) => (b.earnedAt ?? "").localeCompare(a.earnedAt ?? ""));
  return (
    <div className="space-y-8">
      {shelf.length > 0 && (
        <section aria-labelledby="badge-shelf" className="bg-brand-panel relative overflow-hidden rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-lime">Your badge shelf</p>
              <h2 id="badge-shelf" className="mt-1 text-xl font-extrabold text-on-dark">{shelf.length} {shelf.length === 1 ? "badge" : "badges"} earned</h2>
            </div>
            <p className="max-w-xs text-xs text-on-dark-muted">Open a badge to download it, share its link or add it to LinkedIn.</p>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            {shelf.slice(0, 8).map((b) => (
              <li key={b.key}>
                <Link to="/learner/badges/$badgeKey" params={{ badgeKey: b.key }} className="group flex w-[92px] flex-col items-center rounded-2xl p-2 text-center transition-colors hover:bg-on-dark/10 sm:w-[104px]">
                  <BadgeEmblem badge={b} size={68} className="transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5" />
                  <span className="mt-1.5 line-clamp-2 text-[12px] font-bold leading-tight text-on-dark">{b.name}</span>
                  {b.earnedAt && <span className="mt-0.5 text-[11px] text-on-dark-muted">{shortDate(b.earnedAt)}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Show badges">
        {([["all", `All badges (${items.length})`], ["earned", `Earned (${earned})`]] as const).map(([v, l]) => (
          <button key={v} type="button" aria-pressed={filter === v} onClick={() => setFilter(v)} className={cn("min-h-10 rounded-full border px-4 text-sm font-bold", filter === v ? "border-cobalt bg-cobalt text-primary-foreground" : "bg-card hover:border-cobalt-300")}>{l}</button>
        ))}
      </div>
      {BADGE_CATEGORIES.map((c) => {
        const list = shown.filter((i) => i.category === c);
        if (!list.length) return null;
        return (
          <section key={c} aria-labelledby={`cat-${c}`}>
            <h2 id={`cat-${c}`} className="flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />{categoryInfo[c].label}</h2>
            <p className="mb-3 text-sm text-muted-foreground">{categoryInfo[c].blurb}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((b) => (
                <Link key={b.key} to="/learner/badges/$badgeKey" params={{ badgeKey: b.key }} className={cn("surface flex min-w-0 flex-col items-center p-4 text-center transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lift", b.status === "earned" && "border-lime")}>
                  <span className="relative">
                    <BadgeEmblem badge={b} size={84} locked={b.status !== "earned"} />
                    {b.status === "locked" && <span className="absolute -right-1 bottom-1 grid h-6 w-6 place-items-center rounded-full border border-line bg-card text-muted-foreground shadow-sm" aria-hidden="true"><Lock className="h-3 w-3" /></span>}
                  </span>
                  <span className="mt-3 text-sm font-bold">{b.name}</span>
                  {b.status === "earned" ? <span className="mt-2 flex flex-col items-center gap-1"><StatusBadge tone="success">Earned</StatusBadge>{b.earnedAt && <span className="text-[11px] text-muted-foreground">{shortDate(b.earnedAt)}</span>}</span>
                    : b.status === "revoked" ? <span className="mt-2"><StatusBadge tone="pending">Revoked</StatusBadge></span>
                    : b.progress ? (
                      <span className="mt-2 w-full"><span className="block h-1.5 overflow-hidden rounded-full bg-ice"><span className="block h-full rounded-full bg-cobalt" style={{ width: `${(b.progress.cur / b.progress.target) * 100}%` }} /></span><span className="mt-1 block text-xs tabular-nums text-muted-foreground">{b.progress.cur} / {b.progress.target}</span></span>
                    ) : <span className="mt-1 text-xs text-muted-foreground">{b.howAwarded.startsWith("Awarded only") ? "Enski team only" : "Awarded by creators"}</span>}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Full badge details: emblem, criteria, how it was awarded, evidence, and download / share / verify. */
export function BadgeDetails({ item }: { item: BadgeItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const link = item.credentialId && typeof window !== "undefined" ? `${window.location.origin}/verify?id=${item.credentialId}` : "";
  const copy = async () => { try { await navigator.clipboard.writeText(link); toast.success("Badge link copied"); } catch { toast.error("Couldn't copy the link", { description: `Copy it by hand: ${link}` }); } };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: `${item.name} badge on Enski`, text: `I earned the ${item.name} badge on Enski.`, url: link }); return; } catch (e) { if ((e as DOMException).name === "AbortError") return; } }
    await copy();
  };
  const download = async () => {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    setBusy(true);
    try { downloadBlob(await renderCertificateImage(svg, { scale: 6 }), `enski-badge-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`); toast.success("Badge image saved"); }
    catch { toast.error("Couldn't save the badge image. Try again."); }
    finally { setBusy(false); }
  };
  const earned = item.status === "earned";
  const row = (k: string, v: React.ReactNode, mono?: boolean) => <div className="flex items-start justify-between gap-4 px-4 py-3"><dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">{k}</dt><dd className={cn("min-w-0 break-words text-right text-sm font-extrabold", mono && "font-mono text-xs")}>{v}</dd></div>;
  return (
    <div className="screen-in mx-auto max-w-4xl">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="bg-brand-panel relative grid place-items-center overflow-hidden rounded-[28px] px-6 py-10 text-center">
          <div ref={ref} className={cn("outcome-emblem relative", earned && "outcome-pop")}>
            {earned && <span className="outcome-burst" aria-hidden="true" />}
            <BadgeEmblem badge={item} size={180} locked={!earned} label={`${item.name} badge`} />
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.14em] text-lime">{categoryInfo[item.category].label}</p>
          <h1 className="mt-1 text-2xl font-extrabold text-on-dark sm:text-3xl">{item.name}</h1>
          <p className="mt-2 max-w-sm text-sm text-on-dark-muted">{item.description}</p>
          <span className="mt-4">{earned ? <StatusBadge tone="success">Earned</StatusBadge> : item.status === "revoked" ? <StatusBadge tone="pending">Revoked</StatusBadge> : <StatusBadge tone="neutral">Not earned yet</StatusBadge>}</span>
        </div>
        <div className="grid gap-5">
          <section className="surface p-5 sm:p-6">
            <h2 className="flex items-center gap-2.5 text-lg font-extrabold"><span className="lime-tick" aria-hidden="true" />Criteria</h2>
            <p className="mt-2 text-[15px]">{item.criteria}</p>
            <p className="mt-3 text-xs text-muted-foreground">{item.howAwarded}</p>
            {item.status === "locked" && item.progress && (
              <div className="mt-4"><div className="h-2 overflow-hidden rounded-full bg-ice"><div className="h-full rounded-full bg-cobalt transition-[width] duration-700" style={{ width: `${(item.progress.cur / item.progress.target) * 100}%` }} /></div><p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{item.progress.cur} of {item.progress.target} done</p></div>
            )}
          </section>
          {item.status !== "locked" && (
            <dl className="surface divide-y divide-dashed divide-line overflow-hidden">
              {item.recipient && row("Awarded to", item.recipient)}
              {row("Category", categoryInfo[item.category].label)}
              {row("Issued by", item.issuer)}
              {item.courseTitle && row("For", item.courseTitle)}
              {row("Issued", item.earnedAt ? shortDate(item.earnedAt) : "")}
              {item.credentialId && row("Badge ID", item.credentialId, true)}
              {item.evidence && row("Evidence", item.evidence)}
              {item.status === "revoked" && row("Revoked", item.revokeReason ?? "")}
              {item.credentialId && row("Status", item.status === "revoked" ? <span className="text-destructive">Revoked by the issuer</span> : <span className="text-lime-text">Active</span>)}
            </dl>
          )}
          {earned && item.credentialId && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              <Button asChild size="lg"><Link to="/verify" search={{ id: item.credentialId }}><ShieldCheck aria-hidden="true" />Verification page</Link></Button>
              <Button size="lg" variant="outline" onClick={() => void download()} disabled={busy}>{busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}Download image</Button>
              <Button size="lg" variant="outline" onClick={() => void share()}><Share2 aria-hidden="true" />Share</Button>
              <Button size="lg" variant="outline" onClick={() => void copy()}><Copy aria-hidden="true" />Copy link</Button>
              <Button asChild size="lg" variant="outline" className="sm:col-span-2"><a href={linkedInAddUrl({ title: `${item.name} badge`, issuedAt: item.earnedAt ?? new Date().toISOString(), code: item.credentialId, url: link })} target="_blank" rel="noopener noreferrer"><Linkedin aria-hidden="true" />Add to LinkedIn profile</a></Button>
            </div>
          )}
          {item.status === "revoked" && item.credentialId && <Button asChild size="lg" variant="outline"><Link to="/verify" search={{ id: item.credentialId }}><ShieldCheck aria-hidden="true" />See verification status</Link></Button>}
          {item.status === "locked" && <Button asChild size="lg" variant="outline"><Link to="/learner/resources">Keep learning</Link></Button>}
        </div>
      </div>
    </div>
  );
}
