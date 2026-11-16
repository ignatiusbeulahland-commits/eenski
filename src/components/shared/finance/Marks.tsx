import * as Flags from "country-flag-icons/react/3x2";
import type { ComponentType, SVGProps } from "react";
import { BankMonogram } from "@/components/shared/SettingsKit";
import { CURRENCIES, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { cn } from "@/lib/utils";

const logos = import.meta.glob<{ default: { url: string } }>("/src/assets/dashboard/banks/*.asset.json", { eager: true });
const LOGO_URL: Record<string, string> = Object.fromEntries(
  Object.entries(logos).map(([path, mod]) => [path.split("/").pop()!.replace(/\.webp\.asset\.json$/, ""), mod.default.url]),
);
export const logoUrl = (key: string | null | undefined) => (key ? LOGO_URL[key] ?? null : null);

/** Country flag. Rounded, with a hairline so white flags stay visible. */
export function Flag({ code, className, title }: { code: string; className?: string; title?: string }) {
  const F = (Flags as unknown as Record<string, ComponentType<SVGProps<SVGSVGElement> & { title?: string }>>)[code];
  return (
    <span className={cn("inline-grid h-4 w-6 shrink-0 overflow-hidden rounded-[4px] ring-1 ring-line", className)} aria-hidden={title ? undefined : true}>
      {F ? <F className="h-full w-full object-cover" {...(title ? { title } : {})} /> : <span className="h-full w-full bg-soft" />}
    </span>
  );
}

/** Official logo from the institution's own website, or a lettermark when we don't hold one. */
export function BankLogo({ name, logo, className }: { name: string; logo: string | null | undefined; className?: string }) {
  const url = logoUrl(logo);
  if (!url) return <BankMonogram name={name} className={cn("h-10 w-10 rounded-[12px] text-xs", className)} />;
  return (
    <span className={cn("grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-[12px] bg-card ring-1 ring-line", className)} aria-hidden="true">
      <img src={url} alt="" loading="lazy" decoding="async" className="h-[78%] w-[78%] object-contain" />
    </span>
  );
}

export function CurrencyTag({ code, className, showName }: { code: CurrencyCode; className?: string; showName?: boolean }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 text-[13px] font-extrabold", className)}>
      <Flag code={CURRENCIES[code].flag} className="h-3.5 w-5" />
      <span className="tabular-nums">{code}</span>
      {showName && <span className="truncate font-semibold text-muted-foreground">{CURRENCIES[code].name}</span>}
    </span>
  );
}
