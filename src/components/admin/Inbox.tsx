import { Link } from "@tanstack/react-router";
import { ArrowRight, Bell, CheckCheck, LifeBuoy, Save } from "lucide-react";
import { useState } from "react";
import { EmptyState, PageHeader, Panel } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Switch } from "@/components/dashboard-ui/switch";
import { OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { adminStore, DEFAULT_ADMIN_SETTINGS, markRead, saveAdminSettings, type AdminSettings } from "@/lib/admin/store";
import { ticketStore } from "@/lib/assistant/store";
import { validEmail } from "@/lib/shared/credentials";
import { cn } from "@/lib/utils";
import { fmtDate, useDeviceData, useNotifications } from "./data";
import { AdminList, Chips, Pill, statusTone } from "./ui";

export function AdminNotifications() {
  const data = useDeviceData();
  const notes = useNotifications(data);
  const [show, setShow] = useState<"all" | "unread">("all");
  const list = show === "unread" ? notes.list.filter((n) => !notes.read.includes(n.id)) : notes.list;
  return (
    <div>
      <PageHeader eyebrow="Inbox" title="Notifications" description="Built from what actually happened: payouts, failed payments, credentials and support tickets." actions={<Button variant="outline" disabled={!notes.unread} onClick={() => markRead(notes.list.map((n) => n.id))}><CheckCheck aria-hidden="true" />Mark all as read</Button>} />
      <div className="mb-4"><Chips label="Show" value={show} onChange={setShow} options={[{ id: "all", label: `All (${notes.list.length})` }, { id: "unread", label: `Unread (${notes.unread})` }]} /></div>
      {list.length ? (
        <ul className="surface divide-y overflow-hidden">
          {list.map((n) => {
            const unread = !notes.read.includes(n.id);
            return (
              <li key={n.id}>
                <Link to={n.to} onClick={() => markRead([n.id])} className="flex items-center gap-3 p-4 text-sm transition-colors hover:bg-ice">
                  <span className={cn("size-2 shrink-0 rounded-full", unread ? "bg-cobalt" : "bg-line")} aria-hidden="true" />
                  <span className="min-w-0 flex-1"><span className={cn("block", unread ? "font-extrabold" : "font-semibold")}>{n.title}</span><span className="block truncate text-xs text-muted-foreground">{n.text} · {fmtDate(n.at)}</span></span>
                  {unread && <span className="sr-only">Unread</span>}
                  <ArrowRight className="size-4 shrink-0 text-cobalt" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : <div className="surface"><EmptyState icon={Bell} title={show === "unread" ? "You're all caught up" : "No notifications yet"} description="New activity shows here as it happens." /></div>}
    </div>
  );
}

export function AdminSupport() {
  const tickets = ticketStore.use().filter((t) => !t.seed);
  const [status, setStatus] = useState<"open" | "all">("open");
  const rows = tickets.filter((t) => status === "all" || t.status !== "Resolved").sort((a, b) => b.updatedAt - a.updatedAt);
  return (
    <div>
      <PageHeader eyebrow="Help" title="Support requests" description="Tickets people opened with Charm or the support desk." actions={<Button asChild variant="outline"><Link to="/support/dashboard"><LifeBuoy aria-hidden="true" />Open support desk</Link></Button>} />
      <div className="mb-4"><Chips label="Show" value={status} onChange={setStatus} options={[{ id: "open", label: "Not resolved" }, { id: "all", label: "All" }]} /></div>
      <AdminList
        rows={rows}
        rowKey={(t) => t.id}
        columns={[
          { label: "Ticket", cell: (t) => <Link to="/support/tickets/$ticketId" params={{ ticketId: t.id }} className="font-mono text-xs font-bold text-brand underline-offset-4 hover:underline">{t.ref}</Link> },
          { label: "Subject", cell: (t) => <span className="line-clamp-1 font-semibold">{t.subject}</span> },
          { label: "From", cell: (t) => t.userName || t.userEmail },
          { label: "Updated", cell: (t) => fmtDate(new Date(t.updatedAt).toISOString()) },
          { label: "Priority", cell: (t) => <Pill tone={t.priority === "urgent" ? "bad" : "plain"}>{t.priority}</Pill> },
          { label: "Status", cell: (t) => <Pill tone={statusTone(t.status)}>{t.status}</Pill> },
        ]}
        empty={<div className="surface"><EmptyState icon={LifeBuoy} title={status === "open" ? "No open requests" : "No support requests yet"} description="When someone opens a ticket, it shows here and in the support desk." /></div>}
      />
    </div>
  );
}

export function AdminSettingsPage() {
  const saved = adminStore.use().settings;
  const [form, setForm] = useState<AdminSettings>({ ...DEFAULT_ADMIN_SETTINGS, ...saved });
  const [err, setErr] = useState<Partial<Record<keyof AdminSettings, string>>>({});
  const [done, setDone] = useState<string[] | null>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify({ ...DEFAULT_ADMIN_SETTINGS, ...saved });
  if (done) {
    return (
      <OutcomeScreen
        tone="success"
        eyebrow="Changes saved"
        title="Settings saved"
        message="Your platform settings are updated."
        details={[{ label: "Updated", value: done.length ? done.join(", ") : "Settings" }, { label: "Support email", value: form.supportEmail }, { label: "Marketplace", value: form.marketplaceOpen ? "Open" : "Paused" }]}
        actions={<>
          <Link to="/admin" className={outcomeButton.primary}>Back to overview</Link>
          <button type="button" className={outcomeButton.secondary} onClick={() => setDone(null)}>Keep editing</button>
        </>}
      />
    );
  }
  const labels: Record<keyof AdminSettings, string> = { platformName: "Platform name", supportEmail: "Support email", marketplaceOpen: "Marketplace", newSignups: "New sign-ups", payoutReview: "Payout review", minPayout: "Minimum payout" };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: typeof err = {};
    if (!form.platformName.trim()) er.platformName = "Enter the platform name";
    if (!validEmail(form.supportEmail)) er.supportEmail = "Enter a valid email address";
    if (!Number.isFinite(form.minPayout) || form.minPayout < 0) er.minPayout = "Enter an amount of 0 or more";
    setErr(er);
    if (Object.keys(er).length) return;
    const before = { ...DEFAULT_ADMIN_SETTINGS, ...saved };
    saveAdminSettings(form);
    setDone((Object.keys(labels) as (keyof AdminSettings)[]).filter((k) => before[k] !== form[k]).map((k) => labels[k]));
  };
  const toggle = (k: "marketplaceOpen" | "newSignups" | "payoutReview", title: string, text: string) => (
    <label className="flex items-start justify-between gap-4 rounded-[16px] border-[1.5px] border-line p-4">
      <span><span className="block font-extrabold">{title}</span><span className="block text-sm text-muted-foreground">{text}</span></span>
      <Switch checked={form[k]} onCheckedChange={(v) => setForm({ ...form, [k]: v })} aria-label={title} />
    </label>
  );
  return (
    <form onSubmit={submit} noValidate>
      <PageHeader eyebrow="Platform" title="Settings" description="How Enski runs for everyone." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="General">
          <div className="grid gap-4">
            <div className="grid gap-1.5"><Label htmlFor="st-name">Platform name</Label><Input id="st-name" value={form.platformName} maxLength={40} onChange={(e) => setForm({ ...form, platformName: e.target.value })} aria-invalid={!!err.platformName} />{err.platformName && <p className="text-xs font-semibold text-destructive">{err.platformName}</p>}</div>
            <div className="grid gap-1.5"><Label htmlFor="st-email">Support email</Label><Input id="st-email" type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} aria-invalid={!!err.supportEmail} />{err.supportEmail && <p className="text-xs font-semibold text-destructive">{err.supportEmail}</p>}</div>
            <div className="grid gap-1.5"><Label htmlFor="st-min">Minimum payout (₦)</Label><Input id="st-min" inputMode="numeric" value={String(form.minPayout)} onChange={(e) => setForm({ ...form, minPayout: Number(e.target.value.replace(/[^\d]/g, "")) || 0 })} aria-invalid={!!err.minPayout} />{err.minPayout && <p className="text-xs font-semibold text-destructive">{err.minPayout}</p>}</div>
          </div>
        </Panel>
        <Panel title="Controls">
          <div className="grid gap-3">
            {toggle("marketplaceOpen", "Marketplace open", "Learners can browse and buy courses.")}
            {toggle("newSignups", "New sign-ups", "People can create new Enski accounts.")}
            {toggle("payoutReview", "Review large payouts", "Hold withdrawals above ₦500,000 for a quick check.")}
          </div>
        </Panel>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={!dirty} onClick={() => { setForm({ ...DEFAULT_ADMIN_SETTINGS, ...saved }); setErr({}); }}>Discard</Button>
        <Button type="submit" disabled={!dirty}><Save aria-hidden="true" />Save settings</Button>
      </div>
    </form>
  );
}
