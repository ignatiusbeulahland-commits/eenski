import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, Bell, BookOpen, FileBadge2, LifeBuoy, Receipt, ShieldOff, UserCheck, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { EmptyState, PageHeader, Panel, StatCard } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { Label } from "@/components/dashboard-ui/label";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { ConfirmDialog } from "@/components/shared/BrandDialog";
import { OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { adminStore, reinstateAccount, suspendAccount, suspensionOf } from "@/lib/admin/store";
import { useAdminSession } from "@/lib/admin/session";
import { ticketStore } from "@/lib/assistant/store";
import { useCredentials } from "@/lib/shared/credentials";
import { formatMoney, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { fmtDate, useDeviceData, useNotifications } from "./data";
import { AccountLink, AdminList, Pill, SearchBox, statusTone } from "./ui";

const ROLE_LABEL = { learner: "Learner", creator: "Creator", affiliate: "Affiliate" } as const;
const money = (n: number, c: string) => { try { return formatMoney(n, c as CurrencyCode); } catch { return `${c} ${n.toLocaleString()}`; } };

export function AdminOverview() {
  const me = useAdminSession();
  const data = useDeviceData();
  const creds = useCredentials();
  const tickets = ticketStore.use().filter((t) => !t.seed);
  const notes = useNotifications(data);
  const admin = adminStore.use();
  const paid = (data?.orders ?? []).filter((o) => ["paid", "successful"].includes(o.status));
  const ngn = paid.filter((o) => o.currency === "NGN").reduce((s, o) => s + o.amount, 0);
  return (
    <div>
      <PageHeader eyebrow="Enski admin" title={`Welcome, ${me?.name.split(" ")[0] ?? "admin"}`} description="Everything happening across Enski on this device, from sign-ups to payouts." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Accounts" value={String(data?.accounts.length ?? 0)} tone="cobalt" art={brandArtwork.people} featured />
        <StatCard icon={BookOpen} label="Live products" value={String(data?.products.filter((p) => p.status === "published").length ?? 0)} tone="sky" />
        <StatCard icon={Receipt} label="Paid (NGN)" value={money(ngn, "NGN")} hint={`${paid.length} payments`} tone="lime" />
        <StatCard icon={Wallet} label="Payouts processing" value={String(data?.payouts.filter((p) => p.status === "processing").length ?? 0)} tone="midnight" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Latest activity" actions={<Button asChild size="sm" variant="ghost"><Link to="/admin/notifications">All notifications</Link></Button>} bodyClassName="p-0">
          {notes.list.length ? (
            <ul className="divide-y">
              {notes.list.slice(0, 6).map((n) => (
                <li key={n.id}><Link to={n.to} className="flex items-center gap-3 p-4 text-sm hover:bg-ice"><Bell className="size-4 shrink-0 text-cobalt" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block font-extrabold">{n.title}</span><span className="block truncate text-xs text-muted-foreground">{n.text} · {fmtDate(n.at)}</span></span><ArrowRight className="size-4 text-cobalt" aria-hidden="true" /></Link></li>
              ))}
            </ul>
          ) : <EmptyState compact icon={Bell} title="Nothing yet" description="Payments, payouts, credentials and support tickets show here as they happen." />}
        </Panel>
        <Panel title="At a glance">
          <ul className="grid gap-2 text-sm">
            {[
              { icon: FileBadge2, label: "Certificates issued by creators", value: creds.certificates.length, to: "/admin/certificates" as const },
              { icon: Award, label: "Badges awarded", value: creds.badgeAwards.length, to: "/admin/badges" as const },
              { icon: LifeBuoy, label: "Open support tickets", value: tickets.filter((t) => t.status !== "Resolved").length, to: "/admin/support" as const },
              { icon: ShieldOff, label: "Suspended accounts", value: Object.keys(admin.suspended).length, to: "/admin/accounts" as const },
            ].map((r) => (
              <li key={r.label}><Link to={r.to} className="flex items-center gap-3 rounded-[14px] border-[1.5px] border-line p-3 hover:border-sky hover:bg-ice"><r.icon className="size-4 text-cobalt" aria-hidden="true" /><span className="flex-1 font-semibold">{r.label}</span><span className="font-extrabold tabular-nums">{r.value}</span></Link></li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

export function AdminAccounts() {
  const data = useDeviceData();
  const admin = adminStore.use();
  const [q, setQ] = useState("");
  const rows = useMemo(() => (data?.accounts ?? []).filter((a) => !q.trim() || `${a.name} ${a.email}`.toLowerCase().includes(q.trim().toLowerCase())), [data, q]);
  return (
    <div>
      <PageHeader eyebrow="People" title="Accounts" description="Everyone who has an Enski dashboard on this device." />
      <div className="mb-4"><SearchBox value={q} onChange={setQ} placeholder="Search name or email" /></div>
      <AdminList
        rows={rows}
        rowKey={(a) => a.email}
        columns={[
          { label: "Name", cell: (a) => <AccountLink email={a.email}>{a.name}</AccountLink> },
          { label: "Email", cell: (a) => a.email },
          { label: "Roles", cell: (a) => <span className="inline-flex flex-wrap justify-end gap-1 md:justify-start">{a.roles.length ? a.roles.map((r) => <Pill key={r} tone="plain">{ROLE_LABEL[r]}</Pill>) : <Pill tone="wait">New</Pill>}</span> },
          { label: "Sign-ins", cell: (a) => <span className="tabular-nums">{a.signIns}</span>, className: "text-right" },
          { label: "Status", cell: (a) => (suspensionOf(admin, a.email) ? <Pill tone="bad">Suspended</Pill> : <Pill tone="good">Active</Pill>) },
        ]}
        empty={<div className="surface"><EmptyState icon={Users} title={q ? "No matching accounts" : "No accounts yet"} description={q ? "Try another name or email." : "Accounts appear here once someone signs up on this device."} /></div>}
      />
    </div>
  );
}

type Done = { kind: "suspended" | "reinstated"; reason?: string | undefined; at: string };

export function AdminAccountDetails({ email }: { email: string }) {
  const me = useAdminSession();
  const data = useDeviceData();
  const admin = adminStore.use();
  const creds = useCredentials();
  const tickets = ticketStore.use();
  const [confirm, setConfirm] = useState<"suspend" | "reinstate" | null>(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const key = email.toLowerCase();
  const a = data?.accounts.find((x) => x.email === key);
  const suspended = suspensionOf(admin, key);
  if (!data) return <div className="surface h-64 dash-shimmer" />;
  if (!a) {
    return <OutcomeScreen tone="info" eyebrow="Accounts" title="We couldn't find that account" message="It may have been removed from this device, or the link is wrong." actions={<Link to="/admin/accounts" className={outcomeButton.primary}>Back to accounts</Link>} />;
  }
  if (done) {
    return (
      <OutcomeScreen
        tone={done.kind === "suspended" ? "warning" : "success"}
        eyebrow={done.kind === "suspended" ? "Account suspended" : "Account reinstated"}
        title={done.kind === "suspended" ? `${a.name} is suspended` : `${a.name} can sign in again`}
        message={done.kind === "suspended" ? "They can't sign in to any Enski dashboard until you reinstate them. Their records stay as they are." : "Their dashboards, purchases and credentials are exactly as they left them."}
        details={[{ label: "Account", value: a.email }, ...(a.roles.length ? [{ label: "Roles", value: a.roles.map((r) => ROLE_LABEL[r]).join(", ") }] : []), ...(done.reason ? [{ label: "Reason", value: done.reason }] : []), { label: "Date", value: fmtDate(done.at) }, { label: "By", value: me?.name ?? "Enski admin" }]}
        actions={<>
          <Link to="/admin/accounts" className={outcomeButton.primary}>Back to accounts</Link>
          <button type="button" className={outcomeButton.secondary} onClick={() => setDone(null)}>View account</button>
        </>}
      />
    );
  }
  const myCerts = creds.certificates.filter((c) => c.recipientEmail === key || c.issuerEmail === key);
  const myBadges = creds.badgeAwards.filter((b) => b.recipientEmail === key || b.issuerEmail === key);
  const myTickets = tickets.filter((t) => t.userEmail.toLowerCase() === key && !t.seed);
  const myOrders = data.orders.filter((o) => o.party === a.name);
  const myPayouts = data.payouts.filter((p) => p.ownerEmail === key);
  const fact = (k: string, v: string | number) => <div className="flex justify-between gap-3 py-2 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="font-extrabold tabular-nums">{v}</dd></div>;
  return (
    <div>
      <Button asChild variant="ghost" className="mb-3"><Link to="/admin/accounts">← Accounts</Link></Button>
      <div className="surface mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-cobalt text-xl font-extrabold text-primary-foreground" aria-hidden="true">{a.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}</span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold">{a.name}</h1>
          <p className="truncate text-sm text-muted-foreground">{a.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{a.roles.map((r) => <Pill key={r} tone="plain">{ROLE_LABEL[r]}</Pill>)}{suspended ? <Pill tone="bad">Suspended</Pill> : <Pill tone="good">Active</Pill>}</div>
        </div>
        {suspended
          ? <Button onClick={() => setConfirm("reinstate")}><UserCheck aria-hidden="true" />Reinstate</Button>
          : <Button variant="outline" onClick={() => setConfirm("suspend")}><ShieldOff aria-hidden="true" />Suspend account</Button>}
      </div>
      {suspended && <p role="status" className="mb-6 rounded-[16px] border border-destructive/40 bg-destructive/10 p-4 text-sm"><b>Suspended {fmtDate(suspended.at)}</b> by {suspended.by}: {suspended.reason}</p>}
      <div className="grid gap-6 lg:grid-cols-3">
        {a.learner && <Panel title="As a learner"><dl className="divide-y">{fact("Purchases", a.learner.purchases)}{fact("Certificates earned", a.learner.certificates)}{fact("Badges earned", a.learner.badges)}{fact("Support requests", a.learner.support)}</dl></Panel>}
        {a.creator && <Panel title="As a creator"><dl className="divide-y">{fact("Products", a.creator.products)}{fact("Live", a.creator.published)}{fact("Sales", a.creator.orders)}{fact("Withdrawals", a.creator.payouts)}{fact("Identity", a.creator.verified ? "Submitted" : "Not submitted")}</dl></Panel>}
        {a.affiliate && <Panel title="As an affiliate"><dl className="divide-y">{fact("Programmes", a.affiliate.programmes)}</dl></Panel>}
        <Panel title="Account"><dl className="divide-y">{fact("Sign-ins on this device", a.signIns)}{fact("Credentials", myCerts.length + myBadges.length)}{fact("Support tickets", myTickets.length)}</dl></Panel>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Money" bodyClassName="p-0">
          {myOrders.length + myPayouts.length ? (
            <ul className="divide-y text-sm">
              {myOrders.slice(0, 6).map((o) => <li key={o.id} className="flex items-center justify-between gap-3 p-4"><span className="min-w-0"><span className="block truncate font-semibold">{o.title}</span><span className="text-xs text-muted-foreground">{o.ref} · {fmtDate(o.date)}</span></span><span className="text-right"><span className="block font-extrabold">{money(o.amount, o.currency)}</span><Pill tone={statusTone(o.status)}>{o.status}</Pill></span></li>)}
              {myPayouts.slice(0, 6).map((p) => <li key={p.id} className="flex items-center justify-between gap-3 p-4"><span className="min-w-0"><span className="block truncate font-semibold">Withdrawal to {p.to}</span><span className="text-xs text-muted-foreground">{p.ref} · {fmtDate(p.date)}</span></span><span className="text-right"><span className="block font-extrabold">{money(p.amount, p.currency)}</span><Pill tone={statusTone(p.status)}>{p.status}</Pill></span></li>)}
            </ul>
          ) : <EmptyState compact icon={Receipt} title="No money movements" description="Payments and withdrawals for this account show here." />}
        </Panel>
        <Panel title="Credentials" bodyClassName="p-0">
          {myCerts.length + myBadges.length ? (
            <ul className="divide-y text-sm">
              {myCerts.map((c) => <li key={c.code} className="flex items-center justify-between gap-3 p-4"><span className="min-w-0"><span className="block truncate font-semibold">{c.courseTitle}</span><span className="text-xs text-muted-foreground">Certificate {c.code} · {c.recipientEmail === key ? `from ${c.issuer}` : `to ${c.recipientName}`}</span></span><Pill tone={statusTone(c.status)}>{c.status}</Pill></li>)}
              {myBadges.map((b) => <li key={b.id} className="flex items-center justify-between gap-3 p-4"><span className="min-w-0"><span className="block truncate font-semibold">{b.badge.name}</span><span className="text-xs text-muted-foreground">Badge {b.id} · {b.recipientEmail === key ? `from ${b.issuer}` : `to ${b.recipientName}`}</span></span><Pill tone={statusTone(b.status)}>{b.status}</Pill></li>)}
            </ul>
          ) : <EmptyState compact icon={FileBadge2} title="No credentials" description="Certificates and badges issued to or by this account show here." />}
        </Panel>
      </div>

      <ConfirmDialog
        open={confirm === "suspend"}
        onOpenChange={(v) => { if (!v) { setConfirm(null); setErr(""); } }}
        art={brandArtwork.shield}
        eyebrow="Suspend account"
        title={`Suspend ${a.name}?`}
        description="They won't be able to sign in until you reinstate them. Nothing is deleted."
        confirmLabel="Suspend"
        onConfirm={() => {
          if (reason.trim().length < 5) { setErr("Give a reason (5+ characters)"); return false; }
          suspendAccount(key, reason, me?.name ?? "Enski admin");
          setDone({ kind: "suspended", reason: reason.trim(), at: new Date().toISOString() });
          setReason(""); setConfirm(null);
          return true;
        }}
      >
        <div className="grid gap-1.5 text-left">
          <Label htmlFor="sus-reason">Reason</Label>
          <Textarea id="sus-reason" rows={2} maxLength={200} value={reason} onChange={(e) => { setReason(e.target.value); setErr(""); }} placeholder="e.g. Chargebacks under review" />
          {err && <p className="text-xs font-semibold text-destructive">{err}</p>}
        </div>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === "reinstate"}
        onOpenChange={(v) => { if (!v) setConfirm(null); }}
        art={brandArtwork.success}
        eyebrow="Reinstate account"
        title={`Reinstate ${a.name}?`}
        description="They'll be able to sign in to their dashboards again straight away."
        tone="default"
        confirmLabel="Reinstate"
        onConfirm={() => { reinstateAccount(key); setDone({ kind: "reinstated", at: new Date().toISOString() }); setConfirm(null); return true; }}
      />
    </div>
  );
}
