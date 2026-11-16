import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { useMemo, useState } from "react";
import { Plus, Percent, BadgePercent, Pencil, Trash2, Globe2, Power, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { Field } from "@/components/affiliate/Field";
import { PageHeader, Panel, FilterSelect, SearchInput, EmptyState, StatusBadge, StatCard } from "@/components/affiliate/ui";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { type Promotion } from "@/lib/creator/rules";
import { COUPON_TZ_LABEL, couponPhase, discountLabel, promotionProblems, type CouponField, type CouponPhase } from "@/lib/creator/coupons";
import { ItemLink } from "./shared";

const PHASE: Record<CouponPhase, { label: string; tone: "success" | "info" | "pending" | "neutral" }> = {
  active: { label: "Active", tone: "success" },
  scheduled: { label: "Scheduled", tone: "info" },
  expired: { label: "Expired", tone: "neutral" },
  paused: { label: "Deactivated", tone: "pending" },
  draft: { label: "Draft", tone: "neutral" },
  "used up": { label: "Limit reached", tone: "neutral" },
};

const fmt = (date: string, time: string) => {
  const t = Date.parse(`${date}T${time || "00:00"}:00+01:00`);
  return Number.isFinite(t) ? new Date(t).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";
};

function CouponForm({ existing, done }: { existing?: Promotion | undefined; done: () => void }) {
  const { state, update } = useCreator();
  const available = state.items.filter((i) => i.status !== "archived" && !i.binnedAt);
  const today = new Date(Date.now() + 3600e3).toISOString().slice(0, 10);
  const [form, setForm] = useState<Promotion>(
    existing ?? { id: "", name: "", code: "", itemId: "", discount: 10, discountType: "percent", start: today, startTime: "00:00", end: "", endTime: "23:59", status: "active" },
  );
  const [limit, setLimit] = useState(existing?.usageLimit ? String(existing.usageLimit) : "");
  const [errors, setErrors] = useState<Partial<Record<CouponField, string>>>({});
  const set = <K extends keyof Promotion>(k: K, v: Promotion[K]) => setForm((f) => ({ ...f, [k]: v }));
  const percent = form.discountType === "percent";
  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = limit.trim();
        const usageLimit = trimmed ? Number(trimmed) : undefined;
        const entry: Promotion = { ...form, code: form.code.trim().toUpperCase(), name: form.name.trim() || form.code.trim().toUpperCase(), id: existing?.id ?? crypto.randomUUID(), ...(usageLimit !== undefined ? { usageLimit } : {}) };
        if (usageLimit === undefined) delete entry.usageLimit;
        const problems = promotionProblems(entry, state);
        if (trimmed && !/^\d+$/.test(trimmed)) problems.usageLimit = "Usage limit must be a whole number of at least 1.";
        setErrors(problems);
        if (Object.keys(problems).length) return;
        update((s) => ({
          promotions: existing ? s.promotions.map((p) => (p.id === entry.id ? entry : p)) : [...s.promotions, entry],
          activity: [...s.activity, activityEntry(`${existing ? "Updated" : "Created"} coupon: ${entry.code}`)],
        }));
        toast.success(existing ? "Coupon updated" : `Coupon ${entry.code} created`);
        done();
      }}
    >
      <fieldset className="space-y-4">
        <legend className="mb-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Coupon information</legend>
        <Field id="coupon-code" label="Code name *" error={errors.code} hint="Letters, numbers, hyphens or underscores.">
          <Input id="coupon-code" value={form.code} maxLength={40} placeholder="LAUNCH10" onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="coupon-type" label="Discount type *">
            <FilterSelect label="Discount type" value={form.discountType} onChange={(v) => set("discountType", v as Promotion["discountType"])} className="w-full sm:w-full" options={[["percent", "Percentage"], ["fixed", "Fixed amount"]]} />
          </Field>
          <Field id="coupon-discount" label={percent ? "Discount value (%) *" : "Discount value (₦) *"} error={errors.discount}>
            <Input id="coupon-discount" type="number" inputMode="decimal" min={percent ? 1 : 1} max={percent ? 100 : undefined} step={percent ? 1 : 50} placeholder={percent ? "e.g. 10" : "e.g. 2000"} value={Number.isFinite(form.discount) ? form.discount : ""} onChange={(e) => set("discount", e.target.value === "" ? NaN : Number(e.target.value))} />
          </Field>
        </div>
        <Field id="coupon-item" label="Apply to" error={errors.itemId} hint="Pick one product, or keep it on all products.">
          <FilterSelect label="Apply to" value={form.itemId} onChange={(v) => set("itemId", v)} className="w-full sm:w-full" options={[["", "All products"], ...available.map((i) => [i.id, i.title] as [string, string])]} />
        </Field>
        <Field id="coupon-limit" label="Usage limit (optional)" error={errors.usageLimit} hint="Maximum total redemptions. Leave empty for unlimited.">
          <Input id="coupon-limit" type="number" inputMode="numeric" min={1} step={1} placeholder="Unlimited" value={limit} onChange={(e) => setLimit(e.target.value)} />
        </Field>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="mb-1 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Schedule</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field id="coupon-start" label="Start date" error={errors.start}><Input id="coupon-start" type="date" value={form.start} onChange={(e) => set("start", e.target.value)} /></Field>
          <Field id="coupon-start-time" label="Start time"><Input id="coupon-start-time" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} /></Field>
          <Field id="coupon-end" label="End date *" error={errors.end}><Input id="coupon-end" type="date" value={form.end} onChange={(e) => set("end", e.target.value)} /></Field>
          <Field id="coupon-end-time" label="End time *"><Input id="coupon-end-time" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} /></Field>
        </div>
        <p className="flex items-start gap-2 rounded-xl bg-ice p-3 text-xs text-cobalt">
          <Globe2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Times are set in <strong>{COUPON_TZ_LABEL}</strong>. Buyers see the start and end in their own local time.</span>
        </p>
      </fieldset>
      {Object.keys(errors).length > 0 && <p role="alert" className="text-sm font-semibold text-destructive">Please fix the highlighted fields.</p>}
      <DialogActions><Button type="submit">{existing ? "Save changes" : "Create coupon"}</Button></DialogActions>
    </form>
  );
}

export function CouponsPage() {
  const { state, update } = useCreator();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<Promotion | "new" | null>(null);
  const [viewing, setViewing] = useState<Promotion | null>(null);
  const [remove, setRemove] = useState<Promotion | null>(null);
  const uses = (p: Promotion) => state.orders.filter((o) => o.promotionId === p.id && o.status === "paid").length;
  const rows = useMemo(() => state.promotions.map((p) => ({ p, used: uses(p), phase: couponPhase(p, uses(p)) })), [state.promotions, state.orders]);
  const inTab = rows.filter((r) => (tab === "active" ? r.phase === "active" : r.phase !== "active"));
  const needle = q.trim().toLowerCase();
  const list = inTab.filter(({ p, phase }) =>
    (!needle || [p.code, p.name, discountLabel(p), String(p.discount)].some((t) => t.toLowerCase().includes(needle))) &&
    (filter === "all" || (filter === "percent" || filter === "fixed" ? p.discountType === filter : phase === filter)),
  );
  const toggle = (p: Promotion) => {
    const next = p.status === "active" ? "paused" : "active";
    if (next === "active") {
      const err = Object.values(promotionProblems(p, state))[0];
      if (err) return void toast.error(err);
    }
    update((s) => ({ promotions: s.promotions.map((v) => (v.id === p.id ? { ...v, status: next } : v)), activity: [...s.activity, activityEntry(`Coupon ${next === "active" ? "activated" : "deactivated"}: ${p.code}`)] }));
    toast.success(next === "active" ? `${p.code} activated` : `${p.code} deactivated`);
  };
  const create = <Button onClick={() => setEditing("new")}><Plus />Add new coupon</Button>;
  const filters: [string, string][] = tab === "active"
    ? [["all", "All coupons"], ["percent", "Percentage"], ["fixed", "Fixed amount"]]
    : [["all", "All coupons"], ["percent", "Percentage"], ["fixed", "Fixed amount"], ["scheduled", "Scheduled"], ["expired", "Expired"], ["paused", "Deactivated"], ["used up", "Limit reached"], ["draft", "Draft"]];
  const itemOf = (p: Promotion) => state.items.find((i) => i.id === p.itemId);
  const itemLabel = (p: Promotion) => (p.itemId ? (itemOf(p)?.title ?? "Removed product") : "All products");

  return (
    <div className="min-w-0">
      <PageHeader eyebrow="Marketing" title="Coupons" description="Create and manage discount codes for your products." actions={create} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard featured icon={BadgePercent} art={brandArtwork.conversion} label="Active coupons" value={String(rows.filter((r) => r.phase === "active").length)} />
        <StatCard icon={BadgePercent} art={brandArtwork.calendar} label="Scheduled" value={String(rows.filter((r) => r.phase === "scheduled").length)} />
        <StatCard icon={BadgePercent} art={brandArtwork.receipt} label="Times used" value={rows.reduce((n, r) => n + r.used, 0).toLocaleString()} />
        <StatCard icon={BadgePercent} art={brandArtwork.pending} label="Ended or paused" value={String(rows.filter((r) => r.phase !== "active" && r.phase !== "scheduled").length)} />
      </div>
      <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setFilter("all"); }}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active coupons ({rows.filter((r) => r.phase === "active").length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive coupons ({rows.filter((r) => r.phase !== "active").length})</TabsTrigger>
        </TabsList>
      </Tabs>
      {inTab.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <SearchInput value={q} onChange={setQ} placeholder="Search by code or discount" />
          <FilterSelect label="Filter coupons" value={filter} onChange={setFilter} options={filters} className="sm:w-44" />
        </div>
      )}
      {list.length > 0 && (
        <>
          <div className="surface hidden overflow-x-auto lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                <tr>{["Code", "Discount", "Product", "Usage", "Schedule", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-extrabold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {list.map(({ p, used, phase }) => {
                  const item = itemOf(p);
                  return (
                    <tr key={p.id} className="border-b last:border-0 align-top">
                      <td className="px-4 py-3 font-extrabold text-cobalt">{p.code}</td>
                      <td className="px-4 py-3">{discountLabel(p)}<span className="block text-xs text-muted-foreground">{p.discountType === "fixed" ? "Fixed" : "Percentage"}</span></td>
                      <td className="max-w-[14rem] px-4 py-3">{item ? <ItemLink item={item} className="line-clamp-2 text-cobalt">{item.title}</ItemLink> : itemLabel(p)}</td>
                      <td className="px-4 py-3 tabular-nums">{used} / {p.usageLimit ?? "∞"}</td>
                      <td className="px-4 py-3 text-xs">{fmt(p.start, p.startTime)}<span className="block text-muted-foreground">to {fmt(p.end, p.endTime)}</span></td>
                      <td className="px-4 py-3"><StatusBadge tone={PHASE[phase].tone}>{PHASE[phase].label}</StatusBadge></td>
                      <td className="px-4 py-3"><Actions p={p} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
            {list.map(({ p, used, phase }) => {
              const item = itemOf(p);
              return (
                <div key={p.id} className="surface min-w-0 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-lg font-extrabold text-cobalt">{p.code}</span>
                    <StatusBadge tone={PHASE[phase].tone}>{PHASE[phase].label}</StatusBadge>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Discount</dt><dd className="font-bold">{discountLabel(p)}</dd>
                    <dt className="text-muted-foreground">Usage</dt><dd className="tabular-nums">{used} / {p.usageLimit ?? "Unlimited"}</dd>
                    <dt className="text-muted-foreground">Starts</dt><dd className="text-xs">{fmt(p.start, p.startTime)}</dd>
                    <dt className="text-muted-foreground">Ends</dt><dd className="text-xs">{fmt(p.end, p.endTime)}</dd>
                  </dl>
                  {item ? <ItemLink item={item} className="mt-3 block truncate text-xs text-cobalt">{item.title}</ItemLink> : <span className="mt-3 block truncate text-xs text-muted-foreground">{itemLabel(p)}</span>}
                  <div className="mt-4 border-t pt-4"><Actions p={p} /></div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {!list.length && (
        <Panel>
          <EmptyState
            icon={Percent}
            title={inTab.length ? "No matching coupons" : tab === "active" ? "No active coupons" : "No inactive coupons"}
            description={inTab.length ? "Try another search or filter." : tab === "active" ? "Create a coupon to reward your audience. It shows here while it's running." : "Scheduled, expired and deactivated coupons will show here."}
            action={inTab.length ? <Button variant="outline" onClick={() => { setQ(""); setFilter("all"); }}>Clear filters</Button> : tab === "active" ? create : undefined}
          />
        </Panel>
      )}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Create new coupon" : "Edit coupon"}</DialogTitle>
            <DialogDescription>Coupons apply during the schedule you set, to one product or all of them.</DialogDescription>
          </DialogHeader>
          {editing && <CouponForm key={editing === "new" ? "new" : editing.id} existing={editing === "new" ? undefined : editing} done={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent>
          {viewing && (
            <>
              <DialogHeader><DialogTitle>{viewing.code}</DialogTitle><DialogDescription>{discountLabel(viewing)} · {itemLabel(viewing)}</DialogDescription></DialogHeader>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Status</dt><dd>{PHASE[couponPhase(viewing, uses(viewing))].label}</dd>
                <dt className="text-muted-foreground">Used</dt><dd>{uses(viewing)} of {viewing.usageLimit ?? "unlimited"}</dd>
                <dt className="text-muted-foreground">Starts</dt><dd>{fmt(viewing.start, viewing.startTime)}</dd>
                <dt className="text-muted-foreground">Ends</dt><dd>{fmt(viewing.end, viewing.endTime)}</dd>
              </dl>
              <p className="text-xs text-muted-foreground">Shown in your local time. Set in {COUPON_TZ_LABEL}.</p>
            </>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!remove}
        onOpenChange={(v) => !v && setRemove(null)}
        art={brandArtwork.bin}
        eyebrow="Coupons"
        title="Delete this coupon?"
        description={remove ? `Buyers can no longer use ${remove.code}.` : ""}
        confirmLabel="Delete coupon"
        confirmIcon={<Trash2 />}
        onConfirm={() => {
          if (remove) update((s) => ({ promotions: s.promotions.filter((p) => p.id !== remove.id) }));
          setRemove(null);
          toast.success("Coupon deleted");
        }}
      >
        <ConfirmNote>Past orders that used it are kept.</ConfirmNote>
      </ConfirmDialog>
    </div>
  );

  function Actions({ p }: { p: Promotion }) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Button size="sm" variant="ghost" aria-label={`View ${p.code}`} onClick={() => setViewing(p)}><Eye /></Button>
        <Button size="sm" variant="ghost" aria-label={`Edit ${p.code}`} onClick={() => setEditing(p)}><Pencil /></Button>
        <Button size="sm" variant="soft" onClick={() => toggle(p)}><Power />{p.status === "active" ? "Deactivate" : "Activate"}</Button>
        <Button size="sm" variant="ghost" aria-label={`Delete ${p.code}`} onClick={() => setRemove(p)}><Trash2 /></Button>
      </div>
    );
  }
}
