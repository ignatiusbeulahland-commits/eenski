import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/affiliate/Logo";

/**
 * Distraction-free page frame for public journeys (checkout, payment results,
 * receipts): logo, a way back, and the screen centred on a soft background.
 */
export function FocusShell({ children, back, secure = false, wide = false }: {
  children: ReactNode;
  /** Link shown top-right; defaults to the homepage. */
  back?: ReactNode;
  /** Shows the "Secure checkout" chip. */
  secure?: boolean | undefined;
  wide?: boolean | undefined;
}) {
  return (
    <div data-skin="dashboard" className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-line bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" aria-label="Enski home" className="rounded-md">
            <Logo variant="color" className="h-7 w-auto dark:hidden" />
            <Logo className="hidden h-7 w-auto dark:block" />
          </Link>
          <div className="flex items-center gap-2">
            {secure && (
              <span className="hidden items-center gap-1.5 rounded-full bg-success-soft px-3 py-1.5 text-xs font-extrabold text-success sm:inline-flex">
                <Lock className="size-3.5" aria-hidden="true" /> Secure checkout
              </span>
            )}
            {back ?? (
              <Link to="/" className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-extrabold text-brand hover:bg-ice">
                <ArrowLeft className="size-4" aria-hidden="true" /> Back to Enski
              </Link>
            )}
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-12 ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        {children}
      </main>
    </div>
  );
}
