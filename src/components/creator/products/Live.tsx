import { useState } from "react";
import { undoToast } from "@/lib/shared/undo";
import { Bell, CheckCircle2, MapPin, Pencil, Plus, Ticket as TicketIcon, Trash2, Users, Video } from "lucide-react";
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
import { attendanceRate, isUrl, liveOf, newId, reminderTimes, seatsLeft, ticketsSold, validateTickets, type LiveConfig, type Ticket } from "@/lib/creator/products";
import { Metric, MetricGrid, Pill, ToggleRow, useProduct, when, type ProductProps } from "./common";

export function LiveOverview({ item, orders }: ProductProps) {
  const paid = orders.filter((o) => o.status === "paid");
  return (
    <MetricGrid>
      <Metric label="Registered" value={String(paid.length)} hint={`of ${item.capacity} seats`} />
      <Metric label="Seats left" value={String(seatsLeft(item, orders))} />
      <Metric label="Attendance" value={paid.length ? `${attendanceRate(orders)}%` : "—"} hint={`${paid.filter((o) => o.checkedIn).length} checked in`} />
      <Metric label="Starts" value={item.date ? when(item.date) : "Not scheduled"} />
    </MetricGrid>
  );
}
export const liveChecklist = (item: ProductProps["item"]) => {
  const l = liveOf(item);
  return [
    { label: "Set the date, time and seats", done: !!item.date && item.capacity > 0, tab: "schedule" },
    { label: l.venue === "online" ? "Add the meeting link" : "Add the venue address", done: l.venue === "online" ? isUrl(l.link) : !!l.address.trim(), tab: "schedule" },
    { label: "Create ticket types (optional)", done: l.tickets.length > 0, tab: "tickets" },
    { label: "Turn on reminders", done: l.reminders.day || l.reminders.hour || l.reminders.week, tab: "reminders" },
  ];
};

export function Schedule({ item }: ProductProps) {
  const { patchItem } = useProduct(item);
  const l = liveOf(item);
  const [f, setF] = useState({ date: item.date, capacity: String(item.capacity), duration: String(l.durationMins), venue: l.venue, link: l.link, address: l.address });
  const [error, setError] = useState("");
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const capacity = Number(f.capacity);
    const duration = Number(f.duration);
    if (!f.date || !Number.isFinite(Date.parse(f.date))) return setError("Choose a date and start time.");
    if (!Number.isInteger(capacity) || capacity < 1) return setError("Seats must be a whole number of at least 1.");
    if (!Number.isInteger(duration) || duration < 15) return setError("Length must be at least 15 minutes.");
    if (f.venue === "online" && f.link && !isUrl(f.link)) return setError("Enter a meeting link that starts with https://");
    const tErr = validateTickets(l.tickets, capacity);
    if (tErr) return setError(tErr);
    setError("");
    patchItem({ date: f.date, capacity, live: { ...l, durationMins: duration, venue: f.venue, link: f.link.trim(), address: f.address.trim() } }, "Schedule updated");
    toast.success("Schedule saved");
  };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Panel title="Date, time and seats">
        <form id="schedule-form" onSubmit={save} className="space-y-4" noValidate>
          <Field id="live-date" label="Starts (your local time)">
            <Input id="live-date" type="datetime-local" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id="live-duration" label="Length (minutes)">
              <Input id="live-duration" type="number" min="15" step="5" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} />
            </Field>
            <Field id="live-capacity" label="Total seats">
              <Input id="live-capacity" type="number" min="1" value={f.capacity} onChange={(e) => setF({ ...f, capacity: e.target.value })} />
            </Field>
          </div>
        </form>
      </Panel>
      <Panel title="Venue">
        <div className="space-y-4">
          <RadioGroup value={f.venue} onValueChange={(v) => setF({ ...f, venue: v as LiveConfig["venue"] })} className="grid grid-cols-2 gap-2">
            {([["online", "Online", Video], ["in_person", "In person", MapPin]] as const).map(([v, label, Icon]) => (
              <Label key={v} htmlFor={`venue-${v}`} className="flex cursor-pointer items-center gap-2 rounded-[14px] border p-3 has-[[data-state=checked]]:border-cobalt has-[[data-state=checked]]:bg-ice">
                <RadioGroupItem id={`venue-${v}`} value={v} />
                <Icon className="h-4 w-4 text-cobalt" />
                <span className="text-sm font-bold">{label}</span>
              </Label>
            ))}
          </RadioGroup>
          {f.venue === "online" ? (
            <Field id="live-link" label="Meeting link" hint="Shared with registered attendees only.">
              <Input id="live-link" form="schedule-form" type="url" placeholder="https://meet.example.com/your-room" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} />
            </Field>
          ) : (
            <Field id="live-address" label="Venue address">
              <Textarea id="live-address" form="schedule-form" rows={3} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
            </Field>
          )}
        </div>
      </Panel>
      <div className="lg:col-span-2">
        {error && <p role="alert" className="mb-3 text-sm text-destructive">{error}</p>}
        <Button type="submit" form="schedule-form">Save schedule</Button>
      </div>
    </div>
  );
}

export function Tickets({ item, orders }: ProductProps) {
  const { patchItem } = useProduct(item);
  const l = liveOf(item);
  const [edit, setEdit] = useState<Ticket | null>(null);
  const [error, setError] = useState("");
  const allocated = l.tickets.reduce((n, t) => n + t.quantity, 0);
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const t = { ...edit, name: edit.name.trim() };
    if (!Number.isFinite(t.price) || t.price < 0) return setError("Enter a price of 0 or more.");
    if (t.quantity < ticketsSold(orders, t.id)) return setError("Seats can't go below tickets already sold.");
    const tickets = l.tickets.some((x) => x.id === t.id) ? l.tickets.map((x) => (x.id === t.id ? t : x)) : [...l.tickets, t];
    const err = validateTickets(tickets, item.capacity);
    if (err) return setError(err);
    patchItem({ live: { ...l, tickets } }, "Tickets updated");
    setEdit(null);
    toast.success("Ticket saved");
  };
  return (
    <Panel
      title="Ticket types"
      description={l.tickets.length ? `${allocated} of ${item.capacity} seats allocated` : `No ticket types: everyone registers at ${item.price ? naira(item.price) : "Free"}.`}
      actions={<Button size="sm" onClick={() => { setError(""); setEdit({ id: newId(), name: "", price: item.price, quantity: Math.max(1, item.capacity - allocated) }); }}><Plus />Add ticket</Button>}
      bodyClassName="p-0"
    >
      {l.tickets.length ? (
        <ul className="divide-y">
          {l.tickets.map((t) => {
            const sold = ticketsSold(orders, t.id);
            return (
              <li key={t.id} className="flex items-center gap-3 p-4 text-sm">
                <TicketIcon className="h-5 w-5 shrink-0 text-cobalt" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.price ? naira(t.price) : "Free"} · {sold}/{t.quantity} sold</p>
                </div>
                {sold >= t.quantity && <Pill tone="warn">Sold out</Pill>}
                <Button size="icon" variant="ghost" className="h-9 w-9" aria-label={`Edit ${t.name}`} onClick={() => { setError(""); setEdit(t); }}><Pencil /></Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" aria-label={`Delete ${t.name}`} disabled={sold > 0} title={sold ? "Tickets already sold" : undefined} onClick={() => { const before = l; patchItem({ live: { ...l, tickets: l.tickets.filter((x) => x.id !== t.id) } }); undoToast(`Ticket "${t.name}" deleted`, () => patchItem({ live: before })); }}><Trash2 /></Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState compact icon={TicketIcon} title="One ticket for everyone" description="Add types like Early bird, Standard or VIP with their own price and seats." />
      )}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{edit && l.tickets.some((t) => t.id === edit.id) ? "Edit ticket" : "Add ticket"}</DialogTitle>
            <DialogDescription>{item.capacity - allocated} unallocated seats.</DialogDescription>
          </DialogHeader>
          {edit && (
            <form onSubmit={save} className="space-y-4" noValidate>
              <Field id="t-name" label="Ticket name">
                <Input id="t-name" placeholder="e.g. Early bird" value={edit.name} maxLength={60} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field id="t-price" label="Price (₦)">
                  <Input id="t-price" type="number" min="0" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} />
                </Field>
                <Field id="t-qty" label="Seats">
                  <Input id="t-qty" type="number" min="1" value={edit.quantity} onChange={(e) => setEdit({ ...edit, quantity: Number(e.target.value) })} />
                </Field>
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
                <Button type="submit">Save ticket</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

export function Registrations({ item, orders }: ProductProps) {
  const { patchOrder, customer } = useProduct(item);
  const l = liveOf(item);
  const paid = orders.filter((o) => o.status === "paid");
  if (!paid.length)
    return <Panel><EmptyState icon={Users} title="No registrations yet" description="Attendees appear here when they register. Check them in on the day to track attendance." /></Panel>;
  return (
    <Panel title="Registrations" description={`${paid.filter((o) => o.checkedIn).length} of ${paid.length} checked in · ${attendanceRate(orders)}% attendance`} bodyClassName="p-0">
      <ul className="divide-y">
        {paid.map((o) => {
          const c = customer(o.customerId);
          const t = l.tickets.find((x) => x.id === o.ticketId);
          return (
            <li key={o.id} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{c?.name ?? "Attendee"}</p>
                <p className="truncate text-xs text-muted-foreground">{c?.email} · {t?.name ?? "General admission"}</p>
              </div>
              <Button size="sm" variant={o.checkedIn ? "soft" : "outline"} aria-pressed={!!o.checkedIn} onClick={() => {
                const checkingIn = !o.checkedIn;
                patchOrder(o.id, { checkedIn: checkingIn });
                if (checkingIn) window.__lovableEvents?.track?.("project.event_checked_in", { has_ticket_type: !!o.ticketId });
              }}>
                <CheckCircle2 />
                {o.checkedIn ? "Checked in" : "Check in"}
              </Button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function Reminders({ item }: ProductProps) {
  const { patchItem } = useProduct(item);
  const l = liveOf(item);
  const set = (patch: Partial<LiveConfig["reminders"]>) => patchItem({ live: { ...l, reminders: { ...l.reminders, ...patch } } });
  const times = reminderTimes(item.date, l.reminders);
  const now = Date.now();
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Panel title="Email reminders to attendees">
        <ToggleRow id="rem-week" label="1 week before" checked={l.reminders.week} onChange={(week) => set({ week })} />
        <ToggleRow id="rem-day" label="1 day before" checked={l.reminders.day} onChange={(day) => set({ day })} />
        <ToggleRow id="rem-hour" label="1 hour before" description="Includes the meeting link or venue address." checked={l.reminders.hour} onChange={(hour) => set({ hour })} />
        <ToggleRow id="rem-replay" label="Send the replay afterwards" description="Attendees get the recording once the session ends." checked={l.replay} onChange={(replay) => patchItem({ live: { ...l, replay } })} />
      </Panel>
      <Panel title="Reminder schedule">
        {!item.date ? (
          <p className="text-sm text-muted-foreground">Set the date under Schedule to see when reminders go out.</p>
        ) : times.length ? (
          <ul className="space-y-3 text-sm">
            {times.map((t) => (
              <li key={t.label} className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-cobalt" />
                <span className="flex-1"><span className="font-bold">{t.label}</span> · {when(t.at.toISOString())}</span>
                <Pill tone={t.at.getTime() < now ? "muted" : "info"}>{t.at.getTime() < now ? "Passed" : "Scheduled"}</Pill>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">All reminders are off.</p>
        )}
      </Panel>
    </div>
  );
}
