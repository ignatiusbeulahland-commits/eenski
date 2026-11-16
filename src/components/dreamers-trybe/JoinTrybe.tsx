import { useEffect, useId, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";

import enskiLogo from "@/assets/dashboard/brand/enski-logo.webp";
import { checkTrybeJoin, saveTrybeJoin, TRYBE_GOALS } from "@/lib/dreamers-trybe/join";

/** The Trybe's WhatsApp group from the Enski Dreamers Trybe project. */
export const WHATSAPP_URL = "https://chat.whatsapp.com/F7XEB1WVUKlFaJoIbhkcRY";

export const JOIN_EVENT = "enski:join-trybe";
export const openJoin = () => window.dispatchEvent(new Event(JOIN_EVENT));

type Fields = "full_name" | "email" | "whatsapp" | "dream" | "goal";

export function TrybeForm() {
  const [f, setF] = useState({ full_name: "", email: "", whatsapp: "", dream: "", goal: "", consent: true });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pick, setPick] = useState("");
  const [done, setDone] = useState<{ first: string; updated: boolean } | null>(null);
  // The form shows on the page and in the pop-up, so each copy needs its own field ids.
  const uid = useId();
  const set = (k: Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pick === "other" && !f.goal.trim()) { setErr("Tell us what you're working toward"); return; }
    const r = checkTrybeJoin(f);
    if (!r.ok) { setErr(r.error); return; }
    setErr(null);
    setBusy(true);
    try {
      const saved = await saveTrybeJoin(r.values);
      setDone({ first: r.values.full_name.split(/\s+/)[0] ?? r.values.full_name, updated: saved.status === "updated" });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-4 text-center" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-lime text-midnight">
          <Check className="size-7" strokeWidth={3} aria-hidden />
        </span>
        <p className="text-[24px] font-extrabold leading-tight text-primary-foreground">You're in, {done.first}.</p>
        <p className="text-[15px] text-primary-foreground/80">
          {done.updated ? "We've updated your details." : "Welcome to the Dreamers Trybe."} Say hi in the WhatsApp group and tell the Trybe what you're working toward.
        </p>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-lime px-8 text-[17px] font-extrabold text-midnight transition-[colors,transform] hover:bg-lime-hover active:scale-[0.98] active:bg-lime-press"
        >
          Open the WhatsApp group
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    );
  }

  const input = "h-[52px] w-full rounded-[14px] border-[1.5px] border-primary-foreground/20 bg-primary-foreground/5 px-4 text-[16px] font-medium text-primary-foreground placeholder:text-primary-foreground/50 outline-none transition-shadow focus:border-sky focus:ring-4 focus:ring-sky/25";
  const label = "mb-1.5 block text-[14px] font-semibold text-primary-foreground/90";

  return (
    <form onSubmit={submit} noValidate className="space-y-3.5">
      <ol aria-label="How it works" className="grid grid-cols-3 gap-2 rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 p-2.5 text-center">
        {["Sign up", "Share your dream", "Learn, build and earn"].map((t, k) => (
          <li key={t} className="flex flex-col items-center gap-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-sky/15 text-[12px] font-extrabold text-sky-light">{k + 1}</span>
            <span className="text-[11.5px] font-semibold leading-tight text-primary-foreground/80">{t}</span>
          </li>
        ))}
      </ol>
      <div>
        <label htmlFor={`${uid}-t-fn`} className={label}>Full name</label>
        <input id={`${uid}-t-fn`} className={input} placeholder="Your full name" autoComplete="name" value={f.full_name} onChange={set("full_name")} maxLength={120} />
      </div>
      <div>
        <label htmlFor={`${uid}-t-em`} className={label}>Email address</label>
        <input id={`${uid}-t-em`} type="email" className={input} placeholder="you@example.com" autoComplete="email" value={f.email} onChange={set("email")} maxLength={255} />
      </div>
      <div>
        <label htmlFor={`${uid}-t-wa`} className={label}>WhatsApp number</label>
        <input id={`${uid}-t-wa`} type="tel" className={input} placeholder="+234..." autoComplete="tel" value={f.whatsapp} onChange={set("whatsapp")} maxLength={20} />
      </div>
      <div>
        <label htmlFor={`${uid}-t-gl`} className={label}>What are you trying to achieve? <span className="font-normal text-primary-foreground/50">(Optional)</span></label>
        <select
          id={`${uid}-t-gl`}
          className={input}
          value={pick}
          onChange={(e) => { const v = e.target.value; setPick(v); setF((p) => ({ ...p, goal: v === "other" ? "" : v })); }}
        >
          <option value="" className="text-midnight">Pick one</option>
          {TRYBE_GOALS.map((g) => <option key={g} value={g} className="text-midnight">{g}</option>)}
          <option value="other" className="text-midnight">Other</option>
        </select>
        {pick === "other" ? (
          <input aria-label="Tell us what you're working toward" className={input + " mt-2"} placeholder="Tell us what you're working toward" value={f.goal} onChange={set("goal")} maxLength={200} autoFocus onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} enterKeyHint="done" />
        ) : null}
      </div>
      <label className="flex items-start gap-2.5 text-[13px] text-primary-foreground/75">
        <input type="checkbox" checked={f.consent} onChange={(e) => setF((p) => ({ ...p, consent: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-lime" />
        <span>Send me updates, trainings and opportunities by email, WhatsApp or SMS.</span>
      </label>
      {err ? <p className="rounded-[14px] bg-destructive/25 px-3 py-2 text-[14px] font-semibold text-primary-foreground" role="alert">{err}</p> : null}
      <button type="submit" disabled={busy || (pick === "other" && !f.goal.trim())} className="group flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-lime px-8 text-[17px] font-extrabold text-midnight transition-[colors,transform] hover:bg-lime-hover active:scale-[0.98] active:bg-lime-press disabled:bg-primary-foreground/15 disabled:text-primary-foreground/60">
        {busy ? "Joining…" : "Join the Trybe"}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
      <p className="text-center text-[13px] text-primary-foreground/60">Free. Takes 30 seconds.</p>
    </form>
  );
}

export function JoinDreamersModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener(JOIN_EVENT, on);
    if (window.location.hash === "#join") {
      setOpen(true);
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    return () => window.removeEventListener(JOIN_EVENT, on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-(--z-takeover) flex items-center justify-center bg-midnight/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[calc(100svh-2rem)] w-full max-w-sm overflow-y-auto rounded-3xl border border-cobalt/40 bg-midnight p-6 text-primary-foreground shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      >
        <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-48 -translate-x-1/2 rounded-full bg-cobalt/40 blur-3xl" />
        <button aria-label="Close" onClick={() => setOpen(false)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground">
          <X className="h-5 w-5" />
        </button>
        <div className="relative">
          <div className="mb-5 flex justify-center">
            {/* The full-colour logo is drawn for white, so the tile stays white in both themes. */}
            <span className="rounded-2xl bg-on-dark px-5 py-3 shadow-lg">
              <img src={enskiLogo} alt="Enski" className="h-10 w-auto" />
            </span>
          </div>
          <p className="text-[12px] font-extrabold tracking-[0.15em] text-lime">JOIN HERE · FREE</p>
          <h2 id="join-title" className="mt-2 text-[28px] font-extrabold leading-none">Join the Dreamers Trybe.</h2>
          <div className="mt-5">
            <TrybeForm />
          </div>
        </div>
      </div>
    </div>
  );
}
