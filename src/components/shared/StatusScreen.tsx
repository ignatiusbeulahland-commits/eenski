import { RotateCcw } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { Button } from "@/components/dashboard-ui/button";
import { loadErrorCopy, missingCopy, type MissingKind, type StatusCopy } from "@/lib/shared/statusCopy";

const missingArt: Record<MissingKind, string> = {
  page: brandArtwork.globe, event: brandArtwork.calendar, resource: brandArtwork.book, purchase: brandArtwork.receipt,
  certificate: brandArtwork.graduate, article: brandArtwork.help, guide: brandArtwork.help, product: brandArtwork.package,
  marketProduct: brandArtwork.market, programme: brandArtwork.affiliations, affiliate: brandArtwork.people,
  media: brandArtwork.video, landingPage: brandArtwork.megaphone,
};

/** Branded full-card state for "not found" and "didn't load" moments. Actions are passed in by each role. */
export function StatusScreen({ copy, art, actions, fullPage = false }: {
  copy: StatusCopy;
  art: string;
  actions: ReactNode;
  fullPage?: boolean | undefined;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  // Move focus to the message so keyboard and screen-reader users land on it.
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  return (
    <div className={fullPage ? "flex min-h-screen items-center justify-center bg-background px-4 py-10" : "py-8 sm:py-14"}>
      <section aria-labelledby="status-title" className="mx-auto w-full max-w-xl overflow-hidden rounded-[24px] border bg-card shadow-sm animate-rise">
        <div data-surface="dark" className="bg-brand-panel relative isolate overflow-hidden px-6 pb-7 pt-8 text-center text-on-dark sm:px-10 sm:pt-10">
          <span className="hero-dots" aria-hidden="true" />
          <span className="brand-dialog-art mx-auto grid h-20 w-20 place-items-center rounded-[24px] border border-on-dark/20 bg-on-dark/10 backdrop-blur-sm sm:h-24 sm:w-24" aria-hidden="true">
            <img src={art} alt="" width={72} height={72} className="h-14 w-14 object-contain sm:h-[72px] sm:w-[72px]" />
          </span>
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-on-dark-muted"><span className="neon-dot" aria-hidden="true" />{copy.eyebrow}</p>
          <h1 id="status-title" ref={heading} tabIndex={-1} className="mt-2 text-2xl font-extrabold leading-tight text-on-dark outline-none sm:text-[28px]">{copy.title}</h1>
          <span className="neon-rule mx-auto mt-3 block w-12" aria-hidden="true" />
        </div>
        <div className="px-6 pb-7 pt-6 text-center sm:px-10">
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{copy.body}</p>
          <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">{actions}</div>
        </div>
      </section>
    </div>
  );
}

export function MissingScreen({ kind = "page", actions, fullPage }: { kind?: MissingKind; actions: ReactNode; fullPage?: boolean | undefined }) {
  return <StatusScreen copy={missingCopy[kind]} art={missingArt[kind]} actions={actions} fullPage={fullPage} />;
}

/** "Didn't load" state with a Try again button; extra actions (e.g. Help) sit beside it. */
export function LoadErrorScreen({ onRetry, actions, fullPage }: { onRetry: () => void; actions?: ReactNode; fullPage?: boolean | undefined }) {
  return (
    <StatusScreen
      copy={loadErrorCopy}
      art={brandArtwork.pending}
      fullPage={fullPage}
      actions={<>{actions}<Button onClick={onRetry}><RotateCcw />Try again</Button></>}
    />
  );
}
