import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { DialogActions } from "@/components/shared/DialogActions";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, BadgePercent, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { Field } from "@/components/affiliate/Field";
import { PageHeader, Panel, FilterSelect, SearchInput, EmptyState } from "@/components/affiliate/ui";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { validatePromotion, type Promotion } from "@/lib/creator/rules";
import { ItemStatus, ItemLink } from "./shared";
function CouponForm({ existing, done }: { existing?: Promotion | undefined; done: () => void }) {
  const { state, update } = useCreator();
  const available = state.items.filter((i) => i.status !== "archived");
  const [form, setForm] = useState<Promotion>(
    existing ?? { id: "", name: "", code: "", itemId: available[0]?.id ?? "", discount: 10, start: "", end: "", status: "draft" },
  );
  const [error, setError] = useState("");
  if (!available.length && !existing)
    return (
      <div>
        <p className="text-sm text-muted-foreground">Create a product first, then add a coupon for it.</p>
        <Button asChild className="mt-4" onClick={done}>
          <Link to="/creator/courses/create">Create a course</Link>
        </Button>
      </div>
    );
  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const err = validatePromotion(form, state);
        if (err) return setError(err);
        const entry = { ...form, id: existing?.id ?? crypto.randomUUID(), name: form.name.trim(), code: form.code.trim().toUpperCase() };
        update((s) => ({
          promotions: existing ? s.promotions.map((p) => (p.id === entry.id ? entry : p)) : [...s.promotions, entry],
          activity: [...s.activity, activityEntry(`${existing ? "Updated" : "Created"} coupon: ${entry.code}`)],
        }));
        toast.success("Coupon saved");
        done();
      }}
    >
      <Field id="promotion-name" label="Coupon name">
        <Input id="promotion-name" value={form.name} maxLength={120} placeholder="e.g. Launch week" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field id="promotion-code" label="Code">
        <Input id="promotion-code" value={form.code} maxLength={40} placeholder="LAUNCH10" onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
      </Field>
      <Field id="promotion-item" label="Product">
        <FilterSelect label="Product"
          value={form.itemId}
          onChange={(v) => setForm({ ...form, itemId: v })}
          className="w-full sm:w-full"
          options={available.map((i) => [i.id, i.title] as [string, string])}
        />
      </Field>
      <Field id="promotion-discount" label="Discount (%)">
        <Input id="promotion-discount" type="number" min="1" max="100" step="0.01" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="promotion-start" label="Start date">
          <Input id="promotion-start" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
        </Field>
        <Field id="promotion-end" label="End date">
          <Input id="promotion-end" type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
        </Field>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <DialogActions><Button type="submit">{existing ? "Save changes" : "Create coupon"}</Button></DialogActions>
    </form>
  );
}
export function CouponsPage() {
  const { state, update } = useCreator();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Promotion | "new" | null>(null);
  const [remove, setRemove] = useState<Promotion | null>(null);
  const list = state.promotions.filter(
    (p) => (p.name + p.code).toLowerCase().includes(q.toLowerCase()) && (status === "all" || p.status === status),
  );
  const toggle = (p: Promotion) => {
    if (p.status !== "active") {
      const err = validatePromotion(p, state);
      if (err) return void toast.error(err);
    }
    const next = p.status === "active" ? "paused" : "active";
    update((s) => ({
      promotions: s.promotions.map((v) => (v.id === p.id ? { ...v, status: next } : v)),
      activity: [...s.activity, activityEntry(`Coupon ${next}: ${p.code}`)],
    }));
    toast.success(`Coupon ${next}`);
  };
  const create = (
    <Button onClick={() => setEditing("new")}>
      <Plus />
      Create coupon
    </Button>
  );
  return (
    <div>
      <PageHeader eyebrow="Marketing" title="Coupons / discounts" description="Create discount codes for your products." actions={create} />
      {state.promotions.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <SearchInput value={q} onChange={setQ} placeholder="Search coupons" />
          <FilterSelect
            value={status}
            onChange={setStatus}
            options={[
              ["all", "All statuses"],
              ["draft", "Draft"],
              ["active", "Active"],
              ["paused", "Paused"],
            ]}
          />
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((p) => {
          const item = state.items.find((i) => i.id === p.itemId);
          const uses = state.orders.filter((o) => o.promotionId === p.id && o.status === "paid").length;
          return (
            <div key={p.id} className="surface p-5">
              <div className="flex items-center justify-between">
                <BadgePercent className="h-6 w-6 text-cobalt" />
                <ItemStatus status={p.status} />
              </div>
              <h2 className="mt-4 text-lg">{p.name}</h2>
              <p className="mt-2 text-sm font-bold text-cobalt">
                {p.code} · {p.discount}% off
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {p.start} – {p.end} · {uses} use{uses === 1 ? "" : "s"}
              </p>
              {item && (
                <ItemLink item={item} className="mt-2 block text-xs text-cobalt">
                  {item.title}
                </ItemLink>
              )}
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                <Button size="sm" variant="soft" onClick={() => toggle(p)}>
                  {p.status === "active" ? "Pause" : "Activate"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                  <Pencil />
                  Edit
                </Button>
                <Button size="sm" variant="ghost" aria-label={`Delete ${p.code}`} onClick={() => setRemove(p)}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {!list.length && (
        <Panel>
          <EmptyState
            icon={BadgePercent}
            title={state.promotions.length ? "No matching coupons" : "No coupons yet"}
            description={state.promotions.length ? "Try another search or filter." : "Create a discount code to reward your audience."}
            action={!state.promotions.length && create}
          />
        </Panel>
      )}
      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing === "new" ? "Create coupon" : "Edit coupon"}</DialogTitle>
            <DialogDescription>Coupons apply to one product between the dates you choose.</DialogDescription>
          </DialogHeader>
          {editing && (
            <CouponForm key={editing === "new" ? "new" : editing.id} existing={editing === "new" ? undefined : editing} done={() => setEditing(null)} />
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
}
