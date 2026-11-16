import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Award, BookOpen, FileBadge2, Receipt, ShieldCheck, Undo2, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { EmptyState, PageHeader } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, phoneSheetClass } from "@/components/dashboard-ui/dialog";
import { Label } from "@/components/dashboard-ui/label";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { BadgeEmblem } from "@/components/shared/badges/BadgeEmblem";
import { ConfirmDialog } from "@/components/shared/BrandDialog";
import { OutcomeDetails, OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import type { AdminOrder, AdminPayout } from "@/lib/admin/data";
import { marketplaceQueryOptions } from "@/lib/marketplace/data";
import { revokeAsEnski, useCredentials } from "@/lib/shared/credentials";
import { formatMoney, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { cn } from "@/lib/utils";
import { fmtDate, useDeviceData } from "./data";
import { AccountLink, AdminList, Chips, Pill, SearchBox, statusTone } from "./ui";

const money = (n: number, c: string) => { try { return formatMoney(n, c as CurrencyCode); } catch { return `${c} ${n.toLocaleString()}`; } };
const KIND_LABEL: Record<string, string> = { course: "Course", ebook: "Digital download", live: "Live training", service: "Service", coaching: "Coaching" };

export function AdminCourses() {
  const data = useDeviceData();
  const market = useQuery(marketplaceQueryOptions());
  const [tab, setTab] = useState<"device" | "catalogue">("device");
  const [q, setQ] = useState("");
  const match = (t: string) => !q.trim() || t.toLowerCase().includes(q.trim().toLowerCase());
  const products = (data?.products ?? []).filter((p) => match(`${p.title} ${p.ownerName}`));
  const catalogue = (market.data?.courses ?? []).filter((c) => match(`${c.listing.title} ${c.listing.creator?.name ?? ""}`));
  return (
    <div>
      <PageHeader eyebrow="Catalogue" title="Courses & products" description="What creators made here, and the live Enski marketplace." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Chips label="Show" value={tab} onChange={setTab} options={[{ id: "device", label: `Made by creators (${data?.products.length ?? 0})` }, { id: "catalogue", label: `Marketplace (${market.data?.courses.length ?? 0})` }]} />
        <SearchBox value={q} onChange={setQ} placeholder="Search title or creator" />
      </div>
      {tab === "device" ? (
        <AdminList
          rows={products}
          rowKey={(p) => `${p.ownerEmail}-${p.id}`}
          columns={[
            { label: "Title", cell: (p) => <span className="font-extrabold">{p.title}</span> },
            { label: "Type", cell: (p) => KIND_LABEL[p.kind] ?? p.kind },
            { label: "Creator", cell: (p) => <AccountLink email={p.ownerEmail}>{p.ownerName}</AccountLink> },
            { label: "Price", cell: (p) => (p.price > 0 ? money(p.price, "NGN") : "Free"), className: "text-right" },
            { label: "Status", cell: (p) => <Pill tone={statusTone(p.status)}>{p.status === "published" ? "Live" : p.status}</Pill> },
          ]}
          empty={<div className="surface"><EmptyState icon={BookOpen} title="No products yet" description="Courses, eBooks and sessions creators make on this device show here." /></div>}
        />
      ) : (
        <AdminList
          rows={catalogue}
          rowKey={(c) => c.slug}
          columns={[
            { label: "Course", cell: (c) => <Link to="/courses/$slug" params={{ slug: c.slug }} className="font-extrabold text-brand underline-offset-4 hover:underline">{c.listing.title}</Link> },
            { label: "Creator", cell: (c) => c.listing.creator?.name ?? "—" },
            { label: "Lessons", cell: (c) => c.lessonCount, className: "text-right" },
            { label: "Category", cell: (c) => c.category ?? "—" },
            { label: "Status", cell: () => <Pill tone="good">Live</Pill> },
          ]}
          empty={<div className="surface"><EmptyState icon={BookOpen} title={market.isLoading ? "Loading the marketplace…" : "No courses match"} description="Try a different search." /></div>}
        />
      )}
    </div>
  );
}

type Revoked = { kind: "certificate" | "badge"; id: string; label: string; holder: string; reason: string };

function RevokedScreen({ r, onBack }: { r: Revoked; onBack: () => void }) {
  return (
    <OutcomeScreen
      tone="cancelled"
      eyebrow={r.kind === "badge" ? "Badge revoked" : "Certificate revoked"}
      title={r.kind === "badge" ? "Badge revoked" : "Certificate revoked"}
      message="It stays on record, and anyone checking the ID now sees it was revoked by Enski, with your reason."
      details={[{ label: r.kind === "badge" ? "Badge" : "Course", value: r.label }, { label: "Holder", value: r.holder }, { label: "ID", value: r.id, mono: true, copy: r.id }, { label: "Reason", value: r.reason }]}
      actions={<>
        <button type="button" className={outcomeButton.primary} onClick={onBack}>Back to {r.kind === "badge" ? "badges" : "certificates"}</button>
        <Link to="/verify" search={{ id: r.id }} className={outcomeButton.secondary}><ShieldCheck aria-hidden="true" />Check verification page</Link>
      </>}
    />
  );
}

function RevokeConfirm({ target, onClose, onDone }: { target: Omit<Revoked, "reason"> | null; onClose: () => void; onDone: (r: Revoked) => void }) {
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  return (
    <ConfirmDialog
      open={!!target}
      onOpenChange={(v) => { if (!v) { onClose(); setErr(""); } }}
      art={brandArtwork.shield}
      eyebrow={target?.kind === "badge" ? "Revoke badge" : "Revoke certificate"}
      title={`Revoke this ${target?.kind ?? "credential"}?`}
      description={`${target?.label ?? ""} · ${target?.holder ?? ""}. It stays on record as revoked. This can't be undone.`}
      confirmLabel="Revoke"
      onConfirm={() => {
        if (!target) return false;
        if (reason.trim().length < 5) { setErr("Give a reason (5+ characters)"); return false; }
        if (!revokeAsEnski(target.kind, target.id, reason)) { setErr("Couldn't save. Free up space on this device and try again."); return false; }
        onDone({ ...target, reason: reason.trim() });
        setReason("");
        return true;
      }}
    >
      <div className="grid gap-1.5 text-left">
        <Label htmlFor="adm-revoke">Reason</Label>
        <Textarea id="adm-revoke" rows={2} maxLength={180} value={reason} onChange={(e) => { setReason(e.target.value); setErr(""); }} placeholder="e.g. Issued for a course the learner didn't take" />
        {err && <p className="text-xs font-semibold text-destructive">{err}</p>}
      </div>
    </ConfirmDialog>
  );
}

export function AdminCertificates() {
  const creds = useCredentials();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Omit<Revoked, "reason"> | null>(null);
  const [done, setDone] = useState<Revoked | null>(null);
  if (done) return <RevokedScreen r={done} onBack={() => setDone(null)} />;
  const rows = creds.certificates.filter((c) => !q.trim() || `${c.recipientName} ${c.recipientEmail} ${c.courseTitle} ${c.code} ${c.issuer}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <PageHeader eyebrow="Credentials" title="Certificates" description="Certificates creators issued by hand. Revoked ones stay on record." />
      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Search name, course or ID" /></div>
      <AdminList
        rows={rows}
        rowKey={(c) => c.code}
        columns={[
          { label: "Certificate ID", cell: (c) => <span className="font-mono text-xs font-bold">{c.code}</span> },
          { label: "Learner", cell: (c) => <AccountLink email={c.recipientEmail}>{c.recipientName}</AccountLink> },
          { label: "Course", cell: (c) => c.courseTitle },
          { label: "Issued by", cell: (c) => c.issuer },
          { label: "Issued", cell: (c) => fmtDate(c.issuedAt) },
          { label: "Status", cell: (c) => <Pill tone={statusTone(c.status)}>{c.status === "active" ? "Valid" : "Revoked"}</Pill> },
          { label: "", cell: (c) => (
            <span className="inline-flex gap-1.5">
              <Button asChild size="sm" variant="outline"><Link to="/verify" search={{ id: c.code }}>Verify</Link></Button>
              {c.status === "active" && <Button size="sm" variant="ghost" onClick={() => setTarget({ kind: "certificate", id: c.code, label: c.courseTitle, holder: c.recipientName })}><Undo2 aria-hidden="true" />Revoke</Button>}
            </span>
          ), className: "text-right" },
        ]}
        empty={<div className="surface"><EmptyState icon={FileBadge2} title="No certificates issued yet" description="When creators issue certificates, you can check and revoke them here." /></div>}
      />
      <RevokeConfirm target={target} onClose={() => setTarget(null)} onDone={(r) => { setTarget(null); setDone(r); }} />
    </div>
  );
}

export function AdminBadges() {
  const creds = useCredentials();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Omit<Revoked, "reason"> | null>(null);
  const [done, setDone] = useState<Revoked | null>(null);
  if (done) return <RevokedScreen r={done} onBack={() => setDone(null)} />;
  const rows = creds.badgeAwards.filter((a) => !q.trim() || `${a.recipientName} ${a.recipientEmail} ${a.badge.name} ${a.id} ${a.issuer}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <PageHeader eyebrow="Credentials" title="Badges" description={`Badges creators awarded, plus ${creds.customBadges.length} custom badge${creds.customBadges.length === 1 ? "" : "s"} they designed.`} />
      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Search name, badge or ID" /></div>
      <AdminList
        rows={rows}
        rowKey={(a) => a.id}
        columns={[
          { label: "Badge", cell: (a) => <span className="inline-flex items-center gap-2"><BadgeEmblem badge={a.badge} size={32} locked={a.status !== "active"} /><span className="font-extrabold">{a.badge.name}</span></span> },
          { label: "Learner", cell: (a) => <AccountLink email={a.recipientEmail}>{a.recipientName}</AccountLink> },
          { label: "Awarded by", cell: (a) => a.issuer },
          { label: "Date", cell: (a) => fmtDate(a.issuedAt) },
          { label: "Status", cell: (a) => <Pill tone={statusTone(a.status)}>{a.status}</Pill> },
          { label: "", cell: (a) => (
            <span className="inline-flex gap-1.5">
              <Button asChild size="sm" variant="outline"><Link to="/verify" search={{ id: a.id }}>Verify</Link></Button>
              {a.status === "active" && <Button size="sm" variant="ghost" onClick={() => setTarget({ kind: "badge", id: a.id, label: a.badge.name, holder: a.recipientName })}><Undo2 aria-hidden="true" />Revoke</Button>}
            </span>
          ), className: "text-right" },
        ]}
        empty={<div className="surface"><EmptyState icon={Award} title="No badges awarded yet" description="When creators award badges, you can check and revoke them here." /></div>}
      />
      <RevokeConfirm target={target} onClose={() => setTarget(null)} onDone={(r) => { setTarget(null); setDone(r); }} />
    </div>
  );
}

export function AdminTransactions() {
  const data = useDeviceData();
  const [source, setSource] = useState<"all" | AdminOrder["source"]>("all");
  const [open, setOpen] = useState<AdminOrder | null>(null);
  const rows = useMemo(() => (data?.orders ?? []).filter((o) => source === "all" || o.source === source), [data, source]);
  return (
    <div>
      <PageHeader eyebrow="Money" title="Transactions" description="Every payment, sale and checkout recorded on this device." />
      <div className="mb-4"><Chips label="Source" value={source} onChange={setSource} options={[{ id: "all", label: "All" }, { id: "checkout", label: "Checkout" }, { id: "creator sale", label: "Creator sales" }, { id: "learner purchase", label: "Learner purchases" }]} /></div>
      <AdminList
        rows={rows}
        rowKey={(o) => o.id}
        onRow={setOpen}
        columns={[
          { label: "Reference", cell: (o) => <span className="font-mono text-xs font-bold">{o.ref}</span> },
          { label: "What", cell: (o) => <span className="line-clamp-1">{o.title}</span> },
          { label: "Who", cell: (o) => o.party },
          { label: "Date", cell: (o) => fmtDate(o.date) },
          { label: "Amount", cell: (o) => <span className="font-extrabold tabular-nums">{money(o.amount, o.currency)}</span>, className: "text-right" },
          { label: "Status", cell: (o) => <Pill tone={statusTone(o.status)}>{o.status}</Pill> },
        ]}
        empty={<div className="surface"><EmptyState icon={Receipt} title="No transactions yet" description="Payments appear here once someone checks out." /></div>}
      />
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className={cn("max-h-[92dvh] overflow-y-auto sm:max-w-lg", phoneSheetClass)}>
          <DialogHeader><DialogTitle>Transaction details</DialogTitle></DialogHeader>
          {open && <OutcomeDetails details={[{ label: "Reference", value: open.ref, mono: true, copy: open.ref }, { label: "Amount", value: money(open.amount, open.currency), strong: true }, { label: "Status", value: <Pill tone={statusTone(open.status)}>{open.status}</Pill> }, { label: "What", value: open.title }, { label: "Who", value: open.party }, { label: "Source", value: <span className="capitalize">{open.source}</span> }, { label: "Date", value: fmtDate(open.date) }]} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AdminPayouts() {
  const data = useDeviceData();
  const [status, setStatus] = useState<"all" | "processing" | "successful" | "failed">("all");
  const [open, setOpen] = useState<AdminPayout | null>(null);
  const rows = (data?.payouts ?? []).filter((p) => status === "all" || p.status === status);
  return (
    <div>
      <PageHeader eyebrow="Money" title="Payouts" description="Withdrawals creators requested, with where the money went." />
      <div className="mb-4"><Chips label="Status" value={status} onChange={setStatus} options={[{ id: "all", label: "All" }, { id: "processing", label: "Processing" }, { id: "successful", label: "Successful" }, { id: "failed", label: "Failed" }]} /></div>
      <AdminList
        rows={rows}
        rowKey={(p) => `${p.ownerEmail}-${p.id}`}
        onRow={setOpen}
        columns={[
          { label: "Reference", cell: (p) => <span className="font-mono text-xs font-bold">{p.ref}</span> },
          { label: "Creator", cell: (p) => <AccountLink email={p.ownerEmail}>{p.ownerName}</AccountLink> },
          { label: "To", cell: (p) => p.to },
          { label: "Date", cell: (p) => fmtDate(p.date) },
          { label: "Amount", cell: (p) => <span className="font-extrabold tabular-nums">{money(p.amount, p.currency)}</span>, className: "text-right" },
          { label: "Status", cell: (p) => <Pill tone={statusTone(p.status)}>{p.status}</Pill> },
        ]}
        empty={<div className="surface"><EmptyState icon={Wallet} title="No withdrawals yet" description="Creator withdrawals show here as soon as they're requested." /></div>}
      />
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className={cn("max-h-[92dvh] overflow-y-auto sm:max-w-lg", phoneSheetClass)}>
          <DialogHeader><DialogTitle>Withdrawal details</DialogTitle></DialogHeader>
          {open && <OutcomeDetails details={[{ label: "Reference", value: open.ref, mono: true, copy: open.ref }, { label: "Amount", value: money(open.amount, open.currency), strong: true }, { label: "Fee", value: money(open.fee, open.currency) }, { label: "Creator receives", value: money(Math.max(0, open.amount - open.fee), open.currency) }, { label: "Status", value: <Pill tone={statusTone(open.status)}>{open.status}</Pill> }, { label: "Creator", value: open.ownerName }, { label: "Sent to", value: open.to }, { label: "Date", value: fmtDate(open.date) }]} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
