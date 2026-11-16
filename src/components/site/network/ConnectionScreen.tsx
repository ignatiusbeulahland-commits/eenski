import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw, ServerOff, WifiOff } from "lucide-react";

import logoLime from "@/assets/enski-logo-lime.webp";
import logoWhite from "@/assets/enski-logo-white.webp";
import { Button } from "@/components/ui/button";
import type { NetworkState } from "@/lib/network/store";

const COPY = {
  offline: {
    title: "You're offline",
    body: "We can't connect to the internet right now. Please check your network connection and try again.",
    waiting: "We'll reconnect automatically as soon as you're back online.",
    stillDown: "Still offline. Check your Wi-Fi or mobile data. We'll reconnect as soon as we can.",
  },
  unreachable: {
    title: "We can't reach Enski",
    body: "Your device is connected, but Enski isn't responding right now. This is usually brief.",
    waiting: "We'll keep trying in the background.",
    stillDown: "Still can't reach Enski. We'll keep trying in the background.",
  },
} as const;

function useSecondsUntil(at: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!at) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [at]);
  return at ? Math.max(0, Math.ceil((at - now) / 1000)) : null;
}

type Props = {
  state: NetworkState;
  onRetry: () => void;
  onDismiss: () => void;
  onBack: () => void;
};

/** Full-screen notice shown when the connection drops or Enski's server stops answering. */
export function ConnectionScreen({ state, onRetry, onDismiss, onBack }: Props) {
  const kind = state.status === "unreachable" ? "unreachable" : "offline";
  const copy = COPY[kind];
  const titleId = useId();
  const bodyId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const seconds = useSecondsUntil(state.nextRetryAt);

  // Move focus into the screen, keep Tab inside it, and give focus back when it closes.
  useEffect(() => {
    const before = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCanGoBack(window.history.length > 1);
    retryRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDismiss();
        return;
      }
      if (e.key !== "Tab" || !boxRef.current) return;
      const items = Array.from(boxRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      before?.focus({ preventScroll: true });
    };
  }, [onDismiss]);

  let status: string = copy.waiting;
  if (state.checking) status = "Checking your connection…";
  else if (state.failedTries > 0) status = copy.stillDown;
  if (!state.checking && seconds !== null && seconds > 0) status = `${status} Next try in ${seconds}s.`;

  const Icon = kind === "offline" ? WifiOff : ServerOff;

  return (
    <div
      ref={boxRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      className="net-screen fixed inset-0 z-(--z-offline) overflow-y-auto overscroll-contain bg-cobalt text-primary-foreground dark:bg-background"
    >
      <div className="pointer-events-none absolute -left-32 -top-32 size-[420px] rounded-full bg-primary-foreground/[0.06]" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 size-[480px] rounded-full bg-primary-foreground/[0.05]" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-full max-w-[460px] flex-col items-center justify-center px-6 py-14 text-center">
        <img src={logoWhite} alt="Enski" width={288} height={106} className="h-11 w-auto dark:hidden" />
        <img src={logoLime} alt="Enski" width={288} height={106} className="hidden h-11 w-auto dark:block" />

        <div className="relative mt-12 grid size-24 place-items-center" aria-hidden="true">
          <span className="net-ring absolute inset-0 rounded-full border-2 border-lime/60" />
          <span className="net-ring net-ring-late absolute inset-0 rounded-full border-2 border-lime/40" />
          <span className="grid size-20 place-items-center rounded-full bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <Icon className="size-9 text-lime" strokeWidth={2.2} />
          </span>
        </div>

        <h1 id={titleId} className="mt-9 text-[30px] font-extrabold leading-tight tracking-tight sm:text-[34px]">
          {copy.title}
        </h1>
        <p id={bodyId} className="mt-3 text-[17px] leading-relaxed text-on-blue">
          {copy.body}
        </p>

        <p role="status" aria-live="polite" className="mt-5 min-h-[44px] text-sm font-semibold text-on-blue-muted">
          {status}
        </p>

        <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
          <Button
            ref={retryRef}
            variant="lime"
            size="lg"
            onClick={onRetry}
            disabled={state.checking}
            aria-busy={state.checking}
            className="min-w-[180px]"
          >
            {state.checking ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            {state.checking ? "Checking…" : "Try again"}
          </Button>
          {canGoBack ? (
            <Button variant="outline-light" size="lg" onClick={onBack} className="min-w-[160px]">
              <ArrowLeft /> Go back
            </Button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 rounded-full px-3 py-2 text-sm font-bold text-on-blue underline underline-offset-4 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-light"
        >
          Keep browsing this page
        </button>
      </div>
    </div>
  );
}

/** Small notice that stays on screen after the visitor chooses to keep browsing during an outage. */
export function ConnectionNotice({ state, onRetry, onOpen }: { state: NetworkState; onRetry: () => void; onOpen: () => void }) {
  const offline = state.status === "offline";
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[78px] z-(--z-status) flex justify-center px-4 lg:top-[84px]">
      <div
        role="status"
        className="net-notice pointer-events-auto flex items-center gap-2 rounded-full bg-midnight py-1.5 pl-4 pr-1.5 text-[13px] font-bold sm:text-sm text-primary-foreground shadow-lg ring-1 ring-primary-foreground/15"
      >
        <button type="button" onClick={onOpen} className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-light">
          {offline ? <WifiOff className="size-4 text-lime" /> : <ServerOff className="size-4 text-lime" />}
          {offline ? "You're offline" : "Can't reach Enski"}
          <span className="hidden font-semibold text-on-blue-muted sm:inline">· reconnecting automatically</span>
        </button>
        <Button size="sm" variant="lime" onClick={onRetry} disabled={state.checking} className="h-8 px-3.5 text-[13px]">
          {state.checking ? <Loader2 className="animate-spin" /> : null}
          {state.checking ? "Checking" : "Retry"}
        </Button>
      </div>
    </div>
  );
}
