import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { backTarget } from "@/lib/shared/back";

const TOP_SLOT_ID = "page-top-actions";

/**
 * Puts page controls (e.g. a section dropdown) at the top-right of the page, on the back-button row.
 * Phones only: from `md` the slot is hidden and pages show their own wrapped pill rows.
 */
export function PageTopRight({ children }: { children: ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => { setEl(document.getElementById(TOP_SLOT_ID)); }, []);
  return el ? createPortal(children, el) : null;
}

/**
 * One back control for every inner page, placed above the page content in each role shell.
 * Returns to the previous page when it was the parent (keeping filters and scroll), otherwise opens the parent.
 */
export function BackBar({ home, links }: { home: string; links: readonly { to: string; label: string }[] }) {
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = useMemo(() => new Map(links.map((l) => [l.to, l.label])), [links]);
  const prev = useRef<string | null>(null);
  const cur = useRef(path);
  useEffect(() => {
    if (cur.current !== path) { prev.current = cur.current; cur.current = path; }
  }, [path]);
  const target = useMemo(() => backTarget(path, nav, home, (p) => {
    try {
      const m = router.matchRoutes(p, {});
      const last = m[m.length - 1];
      return Boolean(last && last.pathname.replace(/\/+$/, "") === p);
    } catch { return false; }
  }), [path, nav, home, router]);
  return (
    <div className="page-topbar mb-4 flex min-w-0 items-center gap-3 sm:mb-5">
      {target && <Link
        to={target.to as "/"}
        search={target.search as never}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          if (prev.current === target.to && router.history.canGoBack()) { e.preventDefault(); router.history.back(); }
        }}
        className="back-button group inline-flex h-10 min-w-0 shrink items-center gap-2 rounded-full border-[1.5px] border-line bg-card py-1 pl-1 pr-4 text-[13px] font-extrabold text-foreground transition-colors hover:border-cobalt-100 hover:text-cobalt"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ice text-cobalt transition-transform group-hover:-translate-x-0.5" aria-hidden="true"><ArrowLeft className="h-4 w-4" /></span>
        <span className="truncate">{target.label}</span>
      </Link>}
      <div id={TOP_SLOT_ID} className="page-top-actions ml-auto flex min-w-0 justify-end md:hidden" />
    </div>
  );
}
