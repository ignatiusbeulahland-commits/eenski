import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { connectionCopy } from "@/lib/shared/statusCopy";

/** Opens global search with Ctrl/⌘ + K, or "/" when the user isn't typing. */
export function useSearchHotkey(open: () => void) {
  const ref = useRef(open);
  ref.current = open;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current();
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        ref.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

/** Real browser connectivity. Data is kept on the device, so pages keep working offline. */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  const [back, setBack] = useState(false);
  const wasOffline = useRef(false);
  useEffect(() => {
    if (!online) wasOffline.current = true;
    else if (wasOffline.current) {
      wasOffline.current = false;
      setBack(true);
      const t = setTimeout(() => setBack(false), 3000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [online]);
  if (online && !back) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        online
          ? "mb-4 flex items-center gap-3 rounded-[14px] bg-success-soft px-4 py-3 text-sm font-semibold text-success animate-rise"
          : "mb-4 flex items-center gap-3 rounded-[14px] bg-warning-soft px-4 py-3 text-sm font-semibold text-warning-foreground animate-rise"
      }
    >
      {online ? <Wifi className="h-4 w-4 shrink-0" /> : <WifiOff className="h-4 w-4 shrink-0" />}
      <span>
        <span className="font-bold">{online ? connectionCopy.online.title : connectionCopy.offline.title}</span>{" "}
        <span className="font-medium">{online ? connectionCopy.online.body : connectionCopy.offline.body}</span>
      </span>
    </div>
  );
}

export function Kbd({ children }: { children: string }) {
  return (
    <kbd className="hidden rounded-md border bg-card px-1.5 py-0.5 font-sans text-xs font-bold text-muted-foreground lg:inline">
      {children}
    </kbd>
  );
}

/** First focusable item on every dashboard: jumps keyboard users past the sidebar and header. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      onClick={(e) => {
        e.preventDefault();
        const main = document.getElementById("main-content");
        main?.focus();
        main?.scrollIntoView({ block: "start" });
      }}
      className="fixed left-4 top-3 z-(--z-skip) -translate-y-24 rounded-full bg-card px-5 py-3 text-sm font-extrabold text-cobalt shadow-float transition-transform focus-visible:translate-y-0"
    >
      Skip to main content
    </a>
  );
}
