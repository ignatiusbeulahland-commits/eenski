import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Icon3D } from "./Icon3D";
import { Reveal } from "./motion";
import { subscribeToNewsletter } from "./newsletter";

type State = { kind: "idle" | "loading" | "done" | "error"; message?: string };

export function Newsletter({ source = "homepage" }: { source?: string } = {}) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState({ kind: "loading" });
    const r = await subscribeToNewsletter(email, source, firstName);
    if (r.status === "subscribed") {
      setState({ kind: "done", message: "You're in. Welcome to The Becoming." });
      setEmail("");
      setFirstName("");
    } else if (r.status === "already") {
      setState({ kind: "done", message: "You're already on the list. Thanks for growing with us." });
    } else {
      setState({ kind: "error", message: r.message });
    }
  }

  const inputClass =
    "mt-2 h-14 w-full min-w-0 rounded-full border border-line bg-card px-6 text-[16px] font-semibold text-ink placeholder:text-muted-foreground focus-visible:border-brand focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-light aria-[invalid=true]:border-destructive";

  return (
    <section id="newsletter" className="bg-background pb-20 pt-4 lg:pb-24">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal className="relative overflow-hidden rounded-[32px] border border-line bg-soft px-6 py-10 md:px-12 md:py-14">
          <div className="parallax-y absolute -left-20 -top-24 aspect-square w-[320px] rounded-full bg-ice" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
            <div>
              <div className="flex items-center gap-4 border-b border-line pb-6">
                <Icon3D name="mail" className="-ml-2 size-16 shrink-0 animate-bob" />
                <div>
                  <p className="text-2xl font-extrabold uppercase tracking-[0.04em] text-ink md:text-[28px]">
                    The Becoming
                  </p>
                  <p className="mt-1 text-sm italic text-muted-foreground">For everything you're becoming.</p>
                </div>
              </div>
              <h2 className="text-h2 mt-6 text-ink">
                A little something for <span className="text-brand">the person you're becoming.</span>
              </h2>
              <p className="mt-4 text-lg font-bold text-muted-foreground">Straight to your inbox.</p>
              <p className="mt-3 max-w-md text-[17px] leading-relaxed text-ink">
                Get stories, ideas, opportunities and resources to help you learn, grow, earn and discover
                new possibilities.
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="w-full">
              <label htmlFor="newsletter-first-name" className="text-sm font-bold text-ink">
                First name
              </label>
              <input
                id="newsletter-first-name"
                type="text"
                autoComplete="given-name"
                placeholder="What should we call you?"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={80}
                className={inputClass}
              />
              <label htmlFor="newsletter-email" className="mt-5 block text-sm font-bold text-ink">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state.kind === "error") setState({ kind: "idle" });
                }}
                aria-invalid={state.kind === "error"}
                aria-describedby="newsletter-status"
                maxLength={254}
                className={inputClass}
              />
              <Button
                type="submit"
                size="lg"
                disabled={state.kind === "loading"}
                aria-busy={state.kind === "loading"}
                className="mt-5 w-full"
              >
                {state.kind === "loading" ? (
                  <>
                    <Loader2 className="animate-spin" /> Subscribing…
                  </>
                ) : (
                  <>
                    Subscribe <ArrowRight />
                  </>
                )}
              </Button>
              <p
                id="newsletter-status"
                role="status"
                aria-live="polite"
                className={
                  state.kind === "error"
                    ? "mt-3 text-center text-sm font-semibold text-destructive"
                    : state.kind === "done"
                      ? "mt-3 flex items-center justify-center gap-2 text-sm font-bold text-brand"
                      : "mt-3 text-center text-sm text-muted-foreground"
                }
              >
                {state.kind === "done" && <CheckCircle2 className="size-4" />}
                {state.message ?? "Unsubscribe whenever you like."}
              </p>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
