import { SiteHeader } from "@/components/site/SiteHeader";
import { cn } from "@/lib/utils";

type Variant = "page" | "catalogue" | "profile" | "article";

function Block({ className, onBlue }: { className?: string; onBlue?: boolean }) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-[18px]",
        onBlue ? "bg-primary-foreground/10" : "bg-soft",
        className,
      )}
    />
  );
}

/**
 * Lightweight placeholder shown while a page's content loads on a slow connection.
 * The real menu stays in place so nothing jumps when the page arrives.
 */
export function PageSkeleton({ variant = "page" }: { variant?: Variant }) {
  return (
    <>
      <SiteHeader />
      <main aria-busy="true" aria-label="Loading page" className="bg-background">
        <span className="sr-only" role="status">
          Loading…
        </span>
        {/* Blue band like the top of every page, so the menu stays readable and nothing jumps */}
        <div className="bg-cobalt dark:bg-background">
          <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-32">
            {variant === "profile" ? (
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <Block onBlue className="size-28 rounded-full" />
                <div className="w-full max-w-md space-y-3">
                  <Block onBlue className="h-9 w-3/4" />
                  <Block onBlue className="h-5 w-full" />
                  <Block onBlue className="h-5 w-2/3" />
                </div>
              </div>
            ) : (
              <div className={cn("space-y-4", variant === "article" ? "mx-auto max-w-[760px]" : "max-w-2xl")}>
                <Block onBlue className="h-5 w-32 rounded-full" />
                <Block onBlue className="h-12 w-full" />
                <Block onBlue className="h-12 w-4/5" />
                <Block onBlue className="h-5 w-3/5" />
              </div>
            )}
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-12">
          {variant === "article" ? (
            <div className="mx-auto max-w-[760px] space-y-4">
              <Block className="aspect-[16/9] w-full rounded-[28px]" />
              {Array.from({ length: 6 }, (_, i) => (
                <Block key={i} className={cn("h-4", i % 3 === 2 ? "w-2/3" : "w-full")} />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: variant === "page" ? 4 : 8 }, (_, i) => (
                <div key={i} className="space-y-3">
                  <Block className="aspect-[4/3] w-full rounded-[22px]" />
                  <Block className="h-5 w-4/5" />
                  <Block className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
