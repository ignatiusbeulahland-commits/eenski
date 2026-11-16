import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { submitLead, type FieldErrors, type LeadKind } from "./leadForms";

const copy: Record<LeadKind, { title: string; description: string; submit: string; done: (n: string, e: string) => string }> = {
  waitlist: {
    title: "Join the Pro waitlist",
    description: "Be first to know when Enski Ultra opens.",
    submit: "Join the waitlist",
    done: (n, e) => `Thanks, ${n}. ${e} is on the Pro waitlist.`,
  },
  contact: {
    title: "Contact us",
    description: "Tell us what you need and we'll get back to you about custom pricing.",
    submit: "Send message",
    done: (n, e) => `Thanks, ${n}. We'll reply to ${e}.`,
  },
};

type Status = { kind: "idle" | "sending" } | { kind: "done"; message: string };

const inputClass =
  "w-full min-w-0 rounded-2xl border border-line bg-card px-4 text-[16px] font-semibold text-ink placeholder:text-muted-foreground focus-visible:border-brand focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-light aria-[invalid=true]:border-destructive";

export function LeadFormDialog({ kind, children }: { kind: LeadKind; children: ReactNode }) {
  const c = copy[kind];
  const id = useId();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  // Start fresh each time the dialog closes.
  useEffect(() => {
    if (open) return undefined;
    const t = setTimeout(() => {
      setValues({ name: "", email: "", message: "" });
      setErrors({});
      setStatus({ kind: "idle" });
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (status.kind === "done") doneRef.current?.focus();
  }, [status.kind]);

  const fields: { key: "name" | "email" | "message"; label: string }[] = [
    { key: "name", label: "Full name" },
    { key: "email", label: "Email address" },
    ...(kind === "contact" ? [{ key: "message" as const, label: "Message" }] : []),
  ];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus({ kind: "sending" });
    const payload = kind === "contact" ? values : { name: values.name, email: values.email };
    const r = await submitLead(kind, payload);
    if (!r.ok) {
      setErrors(r.errors);
      setStatus({ kind: "idle" });
      const first = fields.find((f) => r.errors[f.key]);
      if (first) formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${id}-${first.key}`)}`)?.focus();
      return;
    }
    setErrors({});
    setStatus({ kind: "done", message: c.done(r.data.name.split(" ")[0] ?? r.data.name, r.data.email) });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[28px] border-line bg-card p-6 text-ink shadow-float sm:rounded-[28px] md:p-8">
        {status.kind === "done" ? (
          <div className="flex flex-col items-center py-4 text-center" role="status" aria-live="polite">
            <span className="grid size-16 place-items-center rounded-full bg-lime text-midnight">
              <CheckCircle2 className="size-8" strokeWidth={2.5} />
            </span>
            <DialogTitle ref={doneRef} tabIndex={-1} className="mt-5 text-2xl font-extrabold text-ink outline-none">
              {kind === "waitlist" ? "You're on the list!" : "Message received!"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {status.message}
            </DialogDescription>
            <Button className="mt-7 w-full" size="lg" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="pr-6">
              <DialogTitle className="text-2xl font-extrabold leading-tight text-ink">{c.title}</DialogTitle>
              <DialogDescription className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {c.description}
              </DialogDescription>
            </div>
            <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-2 space-y-4">
              {fields.map((f) => {
                const fid = `${id}-${f.key}`;
                const err = errors[f.key];
                const common = {
                  id: fid,
                  name: f.key,
                  value: values[f.key],
                  "aria-invalid": !!err,
                  "aria-describedby": err ? `${fid}-error` : undefined,
                  onChange: (ev: { target: { value: string } }) => {
                    setValues((v) => ({ ...v, [f.key]: ev.target.value }));
                    if (err) setErrors((x) => ({ ...x, [f.key]: undefined }));
                  },
                };
                return (
                  <div key={f.key}>
                    <label htmlFor={fid} className="text-sm font-bold text-ink">
                      {f.label}
                    </label>
                    {f.key === "message" ? (
                      <textarea {...common} rows={4} maxLength={1000} className={cn(inputClass, "mt-1.5 resize-none py-3")} />
                    ) : (
                      <input
                        {...common}
                        type={f.key === "email" ? "email" : "text"}
                        inputMode={f.key === "email" ? "email" : undefined}
                        autoComplete={f.key === "email" ? "email" : "name"}
                        maxLength={f.key === "email" ? 254 : 100}
                        placeholder={f.key === "email" ? "you@example.com" : undefined}
                        className={cn(inputClass, "mt-1.5 h-12")}
                      />
                    )}
                    {err && (
                      <p id={`${fid}-error`} className="mt-1.5 text-sm font-semibold text-destructive">
                        {err}
                      </p>
                    )}
                  </div>
                );
              })}
              <Button type="submit" size="lg" className="mt-2 w-full" disabled={status.kind === "sending"}>
                {status.kind === "sending" ? (
                  <>
                    <Loader2 className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    {c.submit} <ArrowRight />
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
