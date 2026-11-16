import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarClock, CalendarDays, Phone, MapPin, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/dashboard-ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Field } from "@/components/affiliate/Field";
import { EmptyState, FilterSelect, Panel } from "@/components/affiliate/ui";
import { DAYS, type Order } from "@/lib/creator/rules";
import { changeAllowed, coachingOf, coachingSlots, isUrl, type CoachingConfig } from "@/lib/creator/products";
import { Metric, MetricGrid, Pill, TextListEditor, ToggleRow, useProduct, when, type ProductProps } from "./common";

const bookingOf = (o: Order) => o.booking ?? "scheduled";
const bookingTone = { scheduled: "info", completed: "success", cancelled: "muted", no_show: "warn" } as const;
const bookingLabel = { scheduled: "Scheduled", completed: "Completed", cancelled: "Cancelled", no_show: "No-show" };

/** Open slots for this coaching offer, given every booked session across the studio. */
export function useSlots(item: ProductProps["item"], excludeOrder?: string) {
  const { state } = useProduct(item);
  const booked = state.orders
    .filter((o) => o.id !== excludeOrder && o.sessionAt && o.status === "paid" && bookingOf(o) === "scheduled")
    .map((o) => o.sessionAt!);
  return coachingSlots(state.availability.days, state.availability.buffer, item.duration, coachingOf(item), booked, new Date());
}

export function CoachingOverview({ item, orders }: ProductProps) {
  const paid = orders.filter((o) => o.status === "paid" || o.booking === "cancelled");
  const upcoming = paid.filter((o) => bookingOf(o) === "scheduled" && o.sessionAt && Date.parse(o.sessionAt) > Date.now());
  const next = upcoming.map((o) => o.sessionAt!).sort()[0];
  const open = useSlots(item).length;
  return (
    <MetricGrid>
      <Metric label="Upcoming sessions" value={String(upcoming.length)} hint={next ? `Next ${when(next)}` : undefined} />
      <Metric label="Completed" value={String(paid.filter((o) => bookingOf(o) === "completed").length)} />
      <Metric label="Open slots" value={String(open)} hint={`Next ${coachingOf(item).windowDays} days`} />
      <Metric label="Session length" value={`${item.duration} min`} />
    </MetricGrid>
  );
}
export const coachingChecklist = (item: ProductProps["item"], availableDays: number) => {
  const c = coachingOf(item);
  return [
    { label: "Set session length and location", done: c.location !== "video" || isUrl(c.meetingLink), tab: "sessions" },
    { label: "Turn on weekly availability", done: availableDays > 0, tab: "sessions" },
    { label: "Add intake questions", done: c.intake.length > 0, tab: "intake" },
    { label: "Set reschedule and cancellation rules", done: true, tab: "policies" },
  ];
};

export function Sessions({ item }: ProductProps) {
  const { patchItem, state } = useProduct(item);
  const c = coachingOf(item);
  const [f, setF] = useState({ duration: String(item.duration), location: c.location, link: c.meetingLink, window: String(c.windowDays), notice: String(c.noticeHours) });
  const [error, setError] = useState("");
  const days = state.availability.days;
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = Number(f.duration), windowDays = Number(f.window), noticeHours = Number(f.notice);
    if (!Number.isInteger(duration) || duration < 15) return setError("Sessions need at least 15 whole minutes.");
    if (!Number.isInteger(windowDays) || windowDays < 1 || windowDays > 180) return setError("Booking window must be 1 to 180 days.");
    if (!Number.isInteger(noticeHours) || noticeHours < 0) return setError("Minimum notice must be 0 hours or more.");
    if (f.location === "video" && f.link && !isUrl(f.link)) return setError("Enter a meeting link that starts with https://");
    setError("");
    patchItem({ duration, coaching: { ...c, location: f.location, meetingLink: f.link.trim(), windowDays, noticeHours } }, "Session settings updated");
    toast.success("Session settings saved");
  };
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Panel title="Session setup">
        <form onSubmit={save} className="space-y-4" noValidate>
          <Field id="c-duration" label="Session length (minutes)">
            <Input id="c-duration" type="number" min="15" step="5" value={f.duration} onChange={(e) => setF({ ...f, duration: e.target.value })} />
          </Field>
          <fieldset>
            <legend className="mb-2 text-[13px] font-bold">Where you meet</legend>
            <RadioGroup value={f.location} onValueChange={(v) => setF({ ...f, location: v as CoachingConfig["location"] })} className="grid grid-cols-3 gap-2">
              {([["video", "Video", Video], ["phone", "Phone", Phone], ["in_person", "In person", MapPin]] as const).map(([v, l, Icon]) => (
                <Label key={v} htmlFor={`loc-${v}`} className="flex cursor-pointer flex-col items-center gap-1 rounded-[14px] border p-3 text-center has-[[data-state=checked]]:border-cobalt has-[[data-state=checked]]:bg-ice">
                  <RadioGroupItem id={`loc-${v}`} value={v} className="sr-only" />
                  <Icon className="h-5 w-5 text-cobalt" />
                  <span className="text-xs font-bold">{l}</span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
          {f.location === "video" && (
            <Field id="c-link" label="Meeting link" hint="Sent to the client after booking.">
              <Input id="c-link" type="url" placeholder="https://meet.example.com/you" value={f.link} onChange={(e) => setF({ ...f, link: e.target.value })} />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field id="c-window" label="Bookable up to (days ahead)">
              <Input id="c-window" type="number" min="1" max="180" value={f.window} onChange={(e) => setF({ ...f, window: e.target.value })} />
            </Field>
            <Field id="c-notice" label="Minimum notice (hours)">
              <Input id="c-notice" type="number" min="0" value={f.notice} onChange={(e) => setF({ ...f, notice: e.target.value })} />
            </Field>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit">Save session setup</Button>
        </form>
      </Panel>
      <Panel title="Weekly availability" description={`${state.availability.buffer} min break between sessions · ${state.availability.timezone}`} actions={<Button asChild size="sm" variant="outline"><Link to="/creator/settings/availability">Edit hours</Link></Button>}>
        <ul className="divide-y text-sm">
          {DAYS.map((d, i) => (
            <li key={d} className="flex justify-between py-2">
              <span className="font-semibold">{d}</span>
              <span className={days[i]?.enabled ? "" : "text-muted-foreground"}>{days[i]?.enabled ? `${days[i]!.start} – ${days[i]!.end}` : "Unavailable"}</span>
            </li>
          ))}
        </ul>
        {!days.some((d) => d.enabled) && <p className="mt-3 rounded-[14px] bg-warning-soft p-3 text-xs text-warning-foreground">Clients can't book until you turn on at least one day.</p>}
      </Panel>
    </div>
  );
}

export function Bookings({ item, orders }: ProductProps) {
  const { patchOrder, customer } = useProduct(item);
  const c = coachingOf(item);
  const [moving, setMoving] = useState<Order | null>(null);
  const [slot, setSlot] = useState("");
  const slots = useSlots(item, moving?.id);
  const list = orders.filter((o) => o.sessionAt).slice().sort((a, b) => a.sessionAt!.localeCompare(b.sessionAt!));
  const now = new Date();
  if (!list.length)
    return <Panel><EmptyState icon={CalendarDays} title="No bookings yet" description="When a client books, the session appears here with reschedule and cancel options." /></Panel>;
  const cancel = (o: Order) => {
    patchOrder(o.id, { booking: "cancelled", ...(c.refundOnCancel ? { status: "refunded" as const, refundedAt: new Date().toISOString() } : {}) });
    toast.success("Session cancelled", { description: c.refundOnCancel ? "The client was refunded." : "No refund under your policy." });
  };
  return (
    <Panel title="Bookings" description={`Reschedule up to ${c.rescheduleHours}h before · cancel up to ${c.cancelHours}h before`} bodyClassName="p-0">
      <ul className="divide-y">
        {list.map((o) => {
          const b = bookingOf(o);
          const cl = customer(o.customerId);
          const canMove = b === "scheduled" && changeAllowed(o.sessionAt!, c.rescheduleHours, now);
          const canCancel = b === "scheduled" && changeAllowed(o.sessionAt!, c.cancelHours, now);
          return (
            <li key={o.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <CalendarClock className="hidden h-5 w-5 shrink-0 text-cobalt sm:block" />
              <div className="min-w-0 flex-1">
                <p className="font-bold">{when(o.sessionAt!)}</p>
                <p className="truncate text-xs text-muted-foreground">{cl?.name ?? "Client"} · {cl?.email} · {item.duration} min</p>
                {o.answers?.some(Boolean) && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">Intake: {o.answers.filter(Boolean).join(" · ")}</p>}
              </div>
              <Pill tone={bookingTone[b]}>{bookingLabel[b]}</Pill>
              {b === "scheduled" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="soft" disabled={!canMove} title={canMove ? undefined : "Too close to the session"} onClick={() => { setSlot(""); setMoving(o); }}>Reschedule</Button>
                  <Button size="sm" variant="outline" disabled={!canCancel} title={canCancel ? undefined : "Too close to the session"} onClick={() => cancel(o)}>Cancel</Button>
                  <Button size="sm" variant="ghost" onClick={() => patchOrder(o.id, { booking: "completed" })}>Mark done</Button>
                  <Button size="sm" variant="ghost" onClick={() => patchOrder(o.id, { booking: "no_show" })}>No-show</Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Dialog open={!!moving} onOpenChange={(o) => !o && setMoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule session</DialogTitle>
            <DialogDescription>{moving?.sessionAt ? `Currently ${when(moving.sessionAt)}` : ""}</DialogDescription>
          </DialogHeader>
          {slots.length ? (
            <div className="space-y-1.5">
              <Label className="text-[13px] font-bold">New time</Label>
              <FilterSelect label="Session time" className="w-full sm:w-full" value={slot || "none"} onChange={(v) => setSlot(v === "none" ? "" : v)} options={[["none", "Choose a time"], ...slots.map((s) => [s, when(s)] as [string, string])]} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No open times. Add more hours in Availability.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoving(null)}>Keep current time</Button>
            <Button disabled={!slot} onClick={() => { if (moving) patchOrder(moving.id, { sessionAt: slot }); setMoving(null); toast.success("Session moved", { description: when(slot) }); }}>Move session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

export function Intake({ item }: ProductProps) {
  const { patchItem } = useProduct(item);
  const c = coachingOf(item);
  return (
    <Panel title="Client intake form" description="Questions clients answer when they book, so you arrive prepared." className="max-w-2xl">
      <TextListEditor id="intake" label="New intake question" placeholder="e.g. What would you like to achieve in this session?" items={c.intake} onChange={(intake) => patchItem({ coaching: { ...c, intake } })} empty="No intake questions. Clients book without filling in a form." />
    </Panel>
  );
}

export function CoachingPolicies({ item }: ProductProps) {
  const { patchItem } = useProduct(item);
  const c = coachingOf(item);
  const [f, setF] = useState({ re: String(c.rescheduleHours), cancel: String(c.cancelHours) });
  return (
    <Panel title="Rescheduling and cancellation" className="max-w-2xl">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const re = Number(f.re), cancel = Number(f.cancel);
          if (![re, cancel].every((n) => Number.isInteger(n) && n >= 0)) { toast.error("Use whole hours, 0 or more."); return; }
          patchItem({ coaching: { ...c, rescheduleHours: re, cancelHours: cancel } });
          toast.success("Policies saved");
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field id="p-re" label="Reschedule notice (hours)">
            <Input id="p-re" type="number" min="0" value={f.re} onChange={(e) => setF({ ...f, re: e.target.value })} />
          </Field>
          <Field id="p-cancel" label="Cancellation notice (hours)">
            <Input id="p-cancel" type="number" min="0" value={f.cancel} onChange={(e) => setF({ ...f, cancel: e.target.value })} />
          </Field>
        </div>
        <Button type="submit">Save policies</Button>
      </form>
      <div className="mt-4 border-t pt-2">
        <ToggleRow id="p-refund" label="Refund when cancelled in time" description="Clients get their money back if they cancel within the notice period." checked={c.refundOnCancel} onChange={(refundOnCancel) => patchItem({ coaching: { ...c, refundOnCancel } })} />
      </div>
    </Panel>
  );
}
