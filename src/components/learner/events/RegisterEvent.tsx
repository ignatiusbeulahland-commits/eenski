import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock, MapPin, Minus, Plus, Ticket, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@/components/affiliate/Field";
import { Button } from "@/components/dashboard-ui/button";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { FlowSteps } from "@/components/shared/outcome";
import { findEvent, isPast, type LearnerEvent } from "@/lib/learner/catalog";
import { MAX_EVENT_TICKETS, blankDraft, clampTickets, draftProblems, nextRegStep, prevRegStep, regStepLabels, registrationTotal, type AttendeeDraft, type DraftProblems, type RegStep } from "@/lib/learner/eventRegistration";
import { canRegister, registerFree, saveEventDraft, startPaidRegistration } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { dayIn, timeIn, useViewerTimeZone, zoneLabel } from "@/lib/learner/timezone";
import { cn } from "@/lib/utils";
import { LearnerNotFound, price } from "../shared";

/** Standalone registration journey for one event: tickets → your details → review, then payment or confirmation. */
export function RegisterEvent({ id }: { id: string }) {
  const e = findEvent(id);
  if (!e) return <LearnerNotFound what="event" />;
  return <RegisterForm e={e} />;
}

function RegisterForm({ e }: { e: LearnerEvent }) {
  const { state, update } = useLearner();
  const navigate = useNavigate();
  const tz = useViewerTimeZone();
  const free = e.price === 0;
  const labels = regStepLabels(e);
  const [step, setStep] = useState<RegStep>(free ? "details" : "tickets");
  const [draft, setDraft] = useState<AttendeeDraft>(() => state.eventDrafts[e.id] ?? blankDraft(state.profile));
  const [errors, setErrors] = useState<DraftProblems>({});
  const set = <K extends keyof AttendeeDraft>(k: K, v: AttendeeDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const check = canRegister(state, e.id);
  const current = labels.indexOf(step === "tickets" ? "Tickets" : step === "details" ? "Your details" : "Review");
  const total = registrationTotal(e, draft.qty);
  const backToEvent = { to: "/learner/events/$eventId", params: { eventId: e.id } } as const;

  const saveDraft = () => update((s) => saveEventDraft(s, e.id, draft));
  const goNext = () => {
    if (step === "details") {
      const problems = draftProblems(draft);
      setErrors(problems);
      if (Object.keys(problems).length) return;
      saveDraft();
    }
    const next = nextRegStep(e, step);
    if (next) setStep(next);
  };
  const confirm = () => {
    if (free) {
      update((s) => {
        const withDraft = { ...s, ...saveEventDraft(s, e.id, draft) };
        return registerFree(withDraft, e.id);
      });
      toast.success("You're registered", { description: e.title });
      void navigate(backToEvent);
      return;
    }
    update((s) => {
      const withDraft = { ...s, ...saveEventDraft(s, e.id, draft) };
      return startPaidRegistration(withDraft, e.id);
    });
    void navigate({ to: "/learner/checkout", search: { step: "pay", method: "card" } });
  };

  if (!check.ok)
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <p className="surface p-6">
          <span className="text-lg font-extrabold">{check.reason}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{isPast(e) ? "Browse other upcoming events instead." : "Your ticket is on the event page."}</span>
          <Button asChild className="mt-4"><Link {...backToEvent}>Back to the event</Link></Button>
        </p>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <Link {...backToEvent} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-cobalt hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the event
      </Link>

      <section className="surface mb-5 flex min-w-0 items-center gap-3 p-3 sm:gap-4 sm:p-4" aria-label="Event summary">
        <img src={e.image} alt="" width={160} height={120} className="h-20 w-24 shrink-0 rounded-xl object-cover sm:h-24 sm:w-32" />
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-sky-text">{e.category} · {free ? "Free" : `${price(e.price)} / ticket`}</p>
          <h1 className="line-clamp-2 text-base font-extrabold leading-snug sm:text-lg">{e.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" />{dayIn(e.start, tz)} · {timeIn(e.start, tz)} {zoneLabel(e.start, tz)}</span>
            <span className="inline-flex items-center gap-1">{e.mode === "Online" ? <Video className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" /> : <MapPin className="h-3.5 w-3.5 text-cobalt" aria-hidden="true" />}{e.mode === "Online" ? "Online" : e.venue}</span>
          </p>
        </div>
      </section>

      <FlowSteps steps={labels} current={current} className="mb-6" />

      {step === "tickets" && (
        <section className="surface p-5 sm:p-6" aria-labelledby="tickets-title">
          <h2 id="tickets-title" className="text-lg font-extrabold">How many tickets?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Up to {MAX_EVENT_TICKETS} tickets per order. Everyone gets in with the same confirmation.</p>
          <div className="mt-5 flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" aria-label="One fewer ticket" disabled={draft.qty <= 1} onClick={() => set("qty", clampTickets(e, draft.qty - 1))}><Minus /></Button>
            <span className="w-16 text-center text-4xl font-extrabold tabular-nums" aria-live="polite">{draft.qty}</span>
            <Button variant="outline" size="icon" aria-label="One more ticket" disabled={draft.qty >= MAX_EVENT_TICKETS} onClick={() => set("qty", clampTickets(e, draft.qty + 1))}><Plus /></Button>
          </div>
          <p className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
            <span className="font-semibold text-muted-foreground">{draft.qty} × {price(e.price)}</span>
            <span className="text-xl font-extrabold tabular-nums text-brand">{price(total)}</span>
          </p>
          <Button size="lg" className="mt-5 w-full" onClick={goNext}>Continue <ArrowRight /></Button>
        </section>
      )}

      {step === "details" && (
        <form
          className="surface space-y-4 p-5 sm:p-6"
          aria-labelledby="details-title"
          noValidate
          onSubmit={(ev) => { ev.preventDefault(); goNext(); }}
        >
          <div>
            <h2 id="details-title" className="text-lg font-extrabold">Your details</h2>
            <p className="mt-1 text-sm text-muted-foreground">The host uses these to welcome you and send joining information.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="reg-name" label="Full name *" error={errors.name}>
              <Input id="reg-name" value={draft.name} autoComplete="name" onChange={(ev) => set("name", ev.target.value)} />
            </Field>
            <Field id="reg-email" label="Email address *" error={errors.email}>
              <Input id="reg-email" type="email" value={draft.email} autoComplete="email" onChange={(ev) => set("email", ev.target.value)} />
            </Field>
          </div>
          <Field id="reg-phone" label="Phone number (optional)" error={errors.phone} hint="For day-of-event updates only.">
            <Input id="reg-phone" type="tel" value={draft.phone} autoComplete="tel" onChange={(ev) => set("phone", ev.target.value)} />
          </Field>
          <Field id="reg-goal" label="What do you want to get out of it? (optional)">
            <Textarea id="reg-goal" value={draft.goal} rows={2} maxLength={280} placeholder="e.g. Meet other designers and get feedback on my portfolio" onChange={(ev) => set("goal", ev.target.value)} />
          </Field>
          <Field id="reg-access" label="Access needs (optional)" hint="Anything the host should know so you can take part comfortably.">
            <Textarea id="reg-access" value={draft.access} rows={2} maxLength={280} onChange={(ev) => set("access", ev.target.value)} />
          </Field>
          <div>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-soft p-3.5">
              <Checkbox checked={draft.agree} onCheckedChange={(v) => set("agree", v === true)} aria-describedby={errors.agree ? "reg-agree-error" : undefined} className="mt-0.5" />
              <span className="text-sm leading-relaxed">I'll follow the event guidelines: be on time, be kind to other attendees, and keep any shared materials to myself.</span>
            </label>
            {errors.agree && <p id="reg-agree-error" className="mt-1.5 text-sm font-semibold text-destructive">{errors.agree}</p>}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            {prevRegStep(e, step) ? <Button type="button" variant="outline" onClick={() => setStep(prevRegStep(e, step)!)}><ArrowLeft /> Back</Button> : <span />}
            <Button type="submit" size="lg">Review registration <ArrowRight /></Button>
          </div>
        </form>
      )}

      {step === "review" && (
        <section className="surface p-5 sm:p-6" aria-labelledby="review-title">
          <h2 id="review-title" className="text-lg font-extrabold">Review your registration</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Event</dt><dd className="text-right font-bold">{e.title}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">When</dt><dd className="text-right font-semibold">{dayIn(e.start, tz)} · {timeIn(e.start, tz)} {zoneLabel(e.start, tz)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Attendee</dt><dd className="text-right font-semibold">{draft.name.trim()}<span className="block text-xs font-normal text-muted-foreground">{draft.email.trim()}</span></dd></div>
            {!free && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Tickets</dt><dd className="font-semibold tabular-nums">{draft.qty} × {price(e.price)}</dd></div>}
            <div className="flex items-center justify-between gap-3 border-t border-line pt-3"><dt className="font-semibold text-muted-foreground">Total</dt><dd className="text-xl font-extrabold tabular-nums text-brand">{free ? "Free" : price(total)}</dd></div>
          </dl>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-ice p-3 text-xs text-cobalt">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {free ? "Your seat is saved as soon as you confirm. You can cancel any time before the event starts." : "Next you'll pay securely at checkout. Your ticket is confirmed straight after payment."}
          </p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => setStep(prevRegStep(e, step)!)}><ArrowLeft /> Back</Button>
            <Button size="lg" onClick={confirm}>{free ? <CheckCircle2 /> : <Ticket />} {free ? "Confirm my seat" : `Continue to payment · ${price(total)}`}</Button>
          </div>
        </section>
      )}
    </div>
  );
}
