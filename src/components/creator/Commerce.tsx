import { DialogActions } from "@/components/shared/DialogActions";
import { removeWhere, restoreAt, sameId } from "@/lib/shared/listUndo";
import { undoToast } from "@/lib/shared/undo";
import { useState } from "react";
import { Receipt, UserCheck, UserPlus, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { PageHeader, Panel, EmptyState, SearchInput, FilterSelect, StatCard } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { naira } from "@/lib/affiliate/products";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { isEmail, type Order } from "@/lib/creator/rules";
import { ItemStatus, downloadCsv, shortDate } from "./shared";
import { RefundButton, RefundSaleDialog } from "./Finance";
export function OrderRows({ orders, refundable = false }: { orders: Order[]; refundable?: boolean }) {
  const { state } = useCreator();
  const [refund, setRefund] = useState<Order | null>(null);
  return (
    <div className="divide-y">
      {orders.map((o) => (
        <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
          <div className="min-w-0">
            <p className="break-words font-bold">{o.itemTitle}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {state.customers.find((c) => c.id === o.customerId)?.name ?? "Buyer"} · {shortDate(o.date)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold tabular-nums">{naira(o.amount)}</span>
            <ItemStatus status={o.status} />
            {refundable && o.status === "paid" && <RefundButton onClick={() => setRefund(o)} className="h-8 gap-1 rounded-full px-3 text-xs" />}
          </div>
        </div>
      ))}
      {!orders.length && (
        <EmptyState icon={Receipt} title="No sales yet" description="Your orders will appear here once people buy your products." compact />
      )}
      <RefundSaleDialog order={refund} onClose={() => setRefund(null)} />
    </div>
  );
}
export function SubscribersPage() {
  const { state, update } = useCreator();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [add, setAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const paidCount = (id: string) => state.orders.filter((o) => o.customerId === id && o.status === "paid").length;
  const list = state.customers.filter(
    (c) =>
      (c.name + c.email).toLowerCase().includes(q.toLowerCase()) &&
      (type === "all" || (type === "buyers" ? paidCount(c.id) > 0 : c.source === "manual")),
  );
  return (
    <div>
      <PageHeader
        eyebrow="Your audience"
        title="Dreamers / subscribers"
        description="Everyone who has bought from you or joined your list."
        actions={
          <>
            <Button
              variant="outline"
              disabled={!state.customers.length}
              onClick={() =>
                downloadCsv("enski-subscribers.csv", [
                  ["Name", "Email", "Purchases", "Joined"],
                  ...state.customers.map((c) => [c.name, c.email, String(paidCount(c.id)), shortDate(c.date)]),
                ])
              }
            >
              <Download />
              Export CSV
            </Button>
            <Button
              onClick={() => {
                setError("");
                setAdd(true);
              }}
            >
              <UserPlus />
              Add subscriber
            </Button>
          </>
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard icon={UserCheck} label="Total subscribers" value={String(state.customers.length)} />
        <StatCard
          icon={Receipt}
          label="Buyers"
          value={String(state.customers.filter((c) => paidCount(c.id) > 0).length)}
          tone="sky"
        />
      </div>
      {state.customers.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <SearchInput value={q} onChange={setQ} placeholder="Search by name or email" />
          <FilterSelect label="Show"
            value={type}
            onChange={setType}
            options={[
              ["all", "Everyone"],
              ["buyers", "Buyers"],
              ["manual", "Added manually"],
            ]}
          />
        </div>
      )}
      <Panel title="Subscribers">
        <div className="divide-y">
          {list.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
              <div className="min-w-0">
                <p className="font-bold">{c.name}</p>
                <p className="mt-1 break-all text-xs text-muted-foreground">{c.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-cobalt">
                  {paidCount(c.id)} purchase{paidCount(c.id) === 1 ? "" : "s"}
                </span>
                {c.source === "manual" && paidCount(c.id) === 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${c.name}`}
                    onClick={() => {
                      const { removed } = removeWhere(state.customers, (x) => x.id === c.id);
                      update((s) => ({ customers: s.customers.filter((x) => x.id !== c.id) }));
                      if (removed) undoToast(`${c.name} removed`, () => update((s) => ({ customers: restoreAt(s.customers, removed, sameId) })));
                    }}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        {!list.length && (
          <EmptyState
            icon={UserCheck}
            title={state.customers.length ? "No matching subscribers" : "No subscribers yet"}
            description={
              state.customers.length
                ? "Try another search or filter."
                : "People who buy your products or join your list will appear here."
            }
            compact
          />
        )}
      </Panel>
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add subscriber</DialogTitle>
            <DialogDescription>Add someone who asked to join your list. No email is sent.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !isEmail(email)) return setError("Enter a name and a valid email.");
              if (state.customers.some((c) => c.email.toLowerCase() === email.trim().toLowerCase()))
                return setError("This email is already on your list.");
              update((s) => ({
                customers: [
                  ...s.customers,
                  { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), source: "manual", date: new Date().toISOString() },
                ],
                activity: [...s.activity, activityEntry(`New subscriber: ${name.trim()}`)],
              }));
              setAdd(false);
              setName("");
              setEmail("");
              toast.success("Subscriber added");
            }}
          >
            <Field id="sub-name" label="Name">
              <Input id="sub-name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field id="sub-email" label="Email">
              <Input id="sub-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <DialogActions><Button type="submit">Add subscriber</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
