import { DialogActions } from "@/components/shared/DialogActions";
import { undoToast } from "@/lib/shared/undo";
import { useState } from "react";
import { ClipboardList, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Label } from "@/components/dashboard-ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/dashboard-ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Field } from "@/components/affiliate/Field";
import { EmptyState, Panel } from "@/components/affiliate/ui";
import { naira } from "@/lib/affiliate/products";
import { STAGES, newId, nextStage, serviceDue, serviceOf, stageLabel, validatePackage, type ServiceConfig, type ServicePackage, type Stage } from "@/lib/creator/products";
import type { Order } from "@/lib/creator/rules";
import { shortDate } from "../shared";
import { Metric, MetricGrid, Pill, TextListEditor, useProduct, type ProductProps } from "./common";

const stageOf = (o: Order): Stage => o.stage ?? "requirements";
const isOverdue = (o: Order, pkg: ServicePackage | undefined, now: Date) => {
  const due = serviceDue(o, pkg);
  return !!due && now > due && !["delivered", "completed"].includes(stageOf(o));
};

export function ServiceOverview({ item, orders }: ProductProps) {
  const s = serviceOf(item);
  const paid = orders.filter((o) => o.status === "paid");
  const now = new Date();
  const pkg = (o: Order) => s.packages.find((p) => p.id === o.packageId);
  return (
    <MetricGrid>
      <Metric label="Active orders" value={String(paid.filter((o) => stageOf(o) !== "completed").length)} />
      <Metric label="Overdue" value={String(paid.filter((o) => isOverdue(o, pkg(o), now)).length)} />
      <Metric label="Completed" value={String(paid.filter((o) => stageOf(o) === "completed").length)} />
      <Metric label="Packages" value={String(s.packages.length)} hint={s.packages.length ? `From ${naira(Math.min(...s.packages.map((p) => p.price)))}` : "None yet"} />
    </MetricGrid>
  );
}
export const serviceChecklist = (item: ProductProps["item"]) => {
  const s = serviceOf(item);
  return [
    { label: "Create packages with price and delivery time", done: s.packages.length > 0, tab: "packages" },
    { label: "List what you need from buyers", done: s.requirements.length > 0, tab: "requirements" },
    { label: "Set your refund policy", done: true, tab: "policies" },
  ];
};

export function Packages({ item, orders }: ProductProps) {
  const { patchItem } = useProduct(item);
  const s = serviceOf(item);
  const [edit, setEdit] = useState<ServicePackage | null>(null);
  const [error, setError] = useState("");
  const commit = (packages: ServicePackage[]) =>
    patchItem(
      {
        service: { ...s, packages },
        ...(packages.length ? { price: Math.min(...packages.map((p) => p.price)), duration: Math.min(...packages.map((p) => p.days)) } : {}),
      },
      "Packages updated",
    );
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const err = validatePackage(edit);
    if (err) return setError(err);
    const p = { ...edit, name: edit.name.trim(), description: edit.description.trim() };
    commit(s.packages.some((x) => x.id === p.id) ? s.packages.map((x) => (x.id === p.id ? p : x)) : [...s.packages, p]);
    setEdit(null);
    toast.success("Package saved", { description: "Your listed price now starts from the cheapest package." });
  };
  const presets = ["Basic", "Standard", "Premium"];
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Offer up to three tiers. Buyers pick one at checkout.</p>
        <Button disabled={s.packages.length >= 3} onClick={() => { setError(""); setEdit({ id: newId(), name: presets[s.packages.length] ?? "", description: "", price: item.price, days: item.duration || 7, revisions: 1 }); }}>
          <Plus />
          Add package
        </Button>
      </div>
      {s.packages.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {s.packages.map((p) => {
            const used = orders.some((o) => o.packageId === p.id);
            return (
              <article key={p.id} className="surface flex flex-col p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-cobalt">{p.name}</p>
                <p className="mt-2 text-2xl font-extrabold">{p.price ? naira(p.price) : "Free"}</p>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.description || "No description"}</p>
                <ul className="mt-4 space-y-1 text-sm">
                  <li>Delivered in {p.days} day{p.days === 1 ? "" : "s"}</li>
                  <li>{p.revisions ? `${p.revisions} revision${p.revisions === 1 ? "" : "s"}` : "No revisions"}</li>
                </ul>
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <Button size="sm" variant="soft" onClick={() => { setError(""); setEdit(p); }}><Pencil />Edit</Button>
                  <Button size="sm" variant="ghost" disabled={used} title={used ? "This package has orders" : undefined} onClick={() => { const before = s.packages; commit(s.packages.filter((x) => x.id !== p.id)); undoToast(`Package "${p.name}" deleted`, () => commit(before)); }}><Trash2 />Delete</Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Panel><EmptyState icon={Package} title="No packages yet" description="Packages set what buyers get, how fast you deliver and how many revisions are included." /></Panel>
      )}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit && s.packages.some((p) => p.id === edit.id) ? "Edit package" : "Add package"}</DialogTitle>
            <DialogDescription>What's included at this tier.</DialogDescription>
          </DialogHeader>
          {edit && (
            <form onSubmit={save} className="space-y-4" noValidate>
              <Field id="pkg-name" label="Package name">
                <Input id="pkg-name" value={edit.name} maxLength={40} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </Field>
              <Field id="pkg-desc" label="What's included">
                <Textarea id="pkg-desc" rows={3} maxLength={400} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field id="pkg-price" label="Price (₦)">
                  <Input id="pkg-price" type="number" min="0" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} />
                </Field>
                <Field id="pkg-days" label="Delivery days">
                  <Input id="pkg-days" type="number" min="1" value={edit.days} onChange={(e) => setEdit({ ...edit, days: Number(e.target.value) })} />
                </Field>
                <Field id="pkg-rev" label="Revisions">
                  <Input id="pkg-rev" type="number" min="0" value={edit.revisions} onChange={(e) => setEdit({ ...edit, revisions: Number(e.target.value) })} />
                </Field>
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
                <Button type="submit">Save package</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function Requirements({ item }: ProductProps) {
  const { patchItem } = useProduct(item);
  const s = serviceOf(item);
  return (
    <Panel title="Buyer requirements" description="Questions buyers answer after paying, so you can start work." className="max-w-2xl">
      <TextListEditor
        id="requirement"
        label="New requirement question"
        placeholder="e.g. Share your brand colours and logo"
        items={s.requirements}
        onChange={(requirements) => patchItem({ service: { ...s, requirements } })}
        empty="No questions yet. Without them, orders start as soon as they're paid."
      />
    </Panel>
  );
}

export function ServiceOrders({ item, orders }: ProductProps) {
  const { patchOrder, customer } = useProduct(item);
  const s = serviceOf(item);
  const [delivering, setDelivering] = useState<Order | null>(null);
  const [note, setNote] = useState("");
  const paid = orders.filter((o) => o.status === "paid");
  const now = new Date();
  const advance = (o: Order) => {
    const next = nextStage(stageOf(o));
    if (!next) return;
    if (next === "delivered") { setNote(""); setDelivering(o); return; }
    patchOrder(o.id, { stage: next });
    toast.success(`Moved to ${stageLabel[next]}`);
  };
  const action: Record<Stage, string> = { requirements: "Start work", in_progress: "Deliver", delivered: "Mark complete", completed: "" };
  if (!paid.length)
    return <Panel><EmptyState icon={ClipboardList} title="No orders yet" description="Orders move from requirements to in progress, delivered and completed." /></Panel>;
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {STAGES.map((stage) => {
        const list = paid.filter((o) => stageOf(o) === stage);
        return (
          <section key={stage} aria-label={stageLabel[stage]} className="rounded-[24px] border bg-ice/40 p-3">
            <h3 className="flex items-center justify-between px-1 pb-2 text-sm font-bold">{stageLabel[stage]}<span className="text-xs text-muted-foreground">{list.length}</span></h3>
            {!list.length && <p className="px-1 py-3 text-xs text-muted-foreground">No orders</p>}
            <ul className="space-y-3">
              {list.map((o) => {
                const pkg = s.packages.find((p) => p.id === o.packageId);
                const due = serviceDue(o, pkg);
                return (
                  <li key={o.id} className="surface p-4 text-sm">
                    <p className="truncate font-bold">{customer(o.customerId)?.name ?? "Buyer"}</p>
                    <p className="text-xs text-muted-foreground">{pkg?.name ?? "Standard"} · {due ? `Due ${shortDate(due.toISOString())}` : `Ordered ${shortDate(o.date)}`}</p>
                    {isOverdue(o, pkg, now) && <div className="mt-2"><Pill tone="warn">Overdue</Pill></div>}
                    {o.answers?.some(Boolean) && (
                      <dl className="mt-2 space-y-1 text-xs">
                        {s.requirements.map((q, n) => o.answers?.[n] ? <div key={n}><dt className="font-semibold">{q}</dt><dd className="text-muted-foreground">{o.answers[n]}</dd></div> : null)}
                      </dl>
                    )}
                    {o.deliveryNote && <p className="mt-2 rounded-lg bg-ice p-2 text-xs text-cobalt">{o.deliveryNote}</p>}
                    {action[stage] && <Button size="sm" variant="soft" className="mt-3 w-full" onClick={() => advance(o)}>{action[stage]}</Button>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <Dialog open={!!delivering} onOpenChange={(o) => !o && setDelivering(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deliver order</DialogTitle>
            <DialogDescription>Tell the buyer what you've delivered and where to find it.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) { toast.error("Add a short delivery message."); return; }
              if (delivering) {
                patchOrder(delivering.id, { stage: "delivered", deliveryNote: note.trim() });
                window.__lovableEvents?.track?.("project.service_delivered", { has_package: !!delivering.packageId });
              }
              setDelivering(null);
              toast.success("Order delivered");
            }}
          >
            <Field id="delivery-note" label="Delivery message">
              <Textarea id="delivery-note" rows={4} maxLength={600} value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <DialogActions><Button type="submit">Deliver</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ServicePolicies({ item }: ProductProps) {
  const { patchItem } = useProduct(item);
  const s = serviceOf(item);
  const opts: [ServiceConfig["refund"], string, string][] = [
    ["before_start", "Refund before work starts", "Buyers can cancel for a full refund until you start work."],
    ["full", "Refund anytime before delivery", "Buyers can cancel for a full refund until you deliver."],
    ["none", "No refunds", "All sales are final once paid."],
  ];
  return (
    <Panel title="Refund policy" description="Revisions are set per package." className="max-w-2xl">
      <RadioGroup value={s.refund} onValueChange={(v) => { patchItem({ service: { ...s, refund: v as ServiceConfig["refund"] } }); toast.success("Refund policy saved"); }} className="space-y-2">
        {opts.map(([v, l, d]) => (
          <Label key={v} htmlFor={`refund-${v}`} className="flex cursor-pointer gap-3 rounded-[14px] border p-4 has-[[data-state=checked]]:border-cobalt has-[[data-state=checked]]:bg-ice">
            <RadioGroupItem id={`refund-${v}`} value={v} className="mt-0.5" />
            <span><span className="block text-sm font-bold">{l}</span><span className="block text-xs font-normal text-muted-foreground">{d}</span></span>
          </Label>
        ))}
      </RadioGroup>
    </Panel>
  );
}
