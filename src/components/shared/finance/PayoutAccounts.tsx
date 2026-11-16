import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { MoreHorizontal, Pencil, Plus, ShieldAlert, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, phoneSheetClass } from "@/components/dashboard-ui/dialog";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/dashboard-ui/dropdown-menu";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { countryByCode, METHOD_LABEL, PROVIDERS } from "@/lib/shared/finance/coverage";
import { addBeneficiary, beneficiaryLabel, maskedLast4, removeBeneficiary, renameBeneficiary, setPreferred, type Beneficiary } from "@/lib/shared/finance/beneficiaries";
import { BankLogo, CurrencyTag, Flag } from "./Marks";
import { AddPayoutAccount } from "./AddAccount";

export function VerifyStatus({ b, onDark }: { b: Beneficiary; onDark?: boolean }) {
  return (
    <span className={`inline-flex max-w-full items-start gap-1.5 rounded-[12px] px-2.5 py-1 text-left text-[11px] font-bold ${onDark ? "bg-on-dark/10 text-on-dark ring-1 ring-on-dark/20" : "bg-warning-soft text-warning-foreground"}`}>
      <ShieldAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{b.status === "format_checked" ? "Details checked · owner confirmed before first payout" : "Owner not confirmed yet"}</span>
    </span>
  );
}

export function BeneficiaryCard({ b, onPrefer, onRename, onRemove }: { b: Beneficiary; onPrefer?: () => void; onRename?: () => void; onRemove?: () => void }) {
  const country = countryByCode(b.country);
  return (
    <article className={`finance-account surface relative flex min-w-0 flex-col p-4 sm:p-5 ${b.preferred ? "is-preferred" : ""}`} aria-label={`${beneficiaryLabel(b)} ${maskedLast4(b)}`}>
      <div className="flex items-start gap-3">
        <BankLogo name={b.institution.name} logo={b.institution.logo} className="h-12 w-12 rounded-[14px]" />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2"><span className="truncate text-[15px] font-extrabold">{beneficiaryLabel(b)}</span>{b.preferred && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cobalt px-2 py-0.5 text-[11px] font-extrabold text-lime"><Star className="h-3 w-3 fill-current" />Primary</span>}</p>
          <p className="truncate text-xs text-muted-foreground">{b.nickname ? `${b.institution.name} · ` : ""}{b.holder}</p>
        </div>
        {(onPrefer || onRename || onRemove) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label={`Options for ${beneficiaryLabel(b)}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {!b.preferred && onPrefer && <DropdownMenuItem onSelect={onPrefer}><Star />Make primary</DropdownMenuItem>}
              {onRename && <DropdownMenuItem onSelect={onRename}><Pencil />Edit nickname</DropdownMenuItem>}
              {onRemove && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={onRemove} className="text-destructive focus:text-destructive"><Trash2 />Remove</DropdownMenuItem></>}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <p className="mt-4 text-lg font-extrabold tabular-nums tracking-[0.08em]">{maskedLast4(b)}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Flag code={b.country} className="h-3.5 w-5" />{country?.name ?? b.country}</span>
        <CurrencyTag code={b.currency} className="text-xs text-foreground" />
        <span>{METHOD_LABEL[b.method]} · {PROVIDERS[b.provider].name}</span>
        {b.details.map((x) => <span key={x}>{x}</span>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <VerifyStatus b={b} />
        {!b.preferred && onPrefer && <Button size="sm" variant="soft" onClick={onPrefer}><Star />Make primary</Button>}
      </div>
    </article>
  );
}

/** The primary payout account, presented as the account card withdrawals default to. */
function PrimaryCard({ b, onRename, onRemove }: { b: Beneficiary; onRename: () => void; onRemove: () => void }) {
  const country = countryByCode(b.country);
  return (
    <article data-surface="dark" className="bg-brand-panel finance-primary-card relative overflow-hidden rounded-[24px] p-5 text-on-dark sm:p-6" aria-label={`Primary payout account: ${beneficiaryLabel(b)} ${maskedLast4(b)}`}>
      <div className="relative flex items-start gap-3">
        <BankLogo name={b.institution.name} logo={b.institution.logo} className="h-12 w-12 rounded-[14px] ring-2 ring-on-dark/20" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold">{b.institution.name}</p>
          <p className="text-xs text-on-dark-muted">{b.nickname ? `${b.nickname} · ` : ""}{METHOD_LABEL[b.method]} via {PROVIDERS[b.provider].name}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-[11px] font-extrabold text-midnight"><Star className="h-3 w-3 fill-current" />Primary</span>
      </div>
      <p className="relative mt-6 text-2xl font-extrabold tabular-nums tracking-[0.16em] sm:text-[28px]" aria-label={`Account ending ${b.last4}`}>•••• •••• {b.last4}</p>
      <div className="relative mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-dark-muted">Account holder</p>
          <p className="truncate text-sm font-extrabold">{b.holder}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-bold"><Flag code={b.country} className="h-3.5 w-5 ring-on-dark/30" />{country?.name ?? b.country} · {b.currency}</span>
      </div>
      <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-on-dark/15 pt-4">
        <VerifyStatus b={b} onDark />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-on-dark/30 bg-transparent text-on-dark hover:bg-on-dark/10 hover:text-lime" onClick={onRename}><Pencil />Nickname</Button>
          <Button size="sm" variant="outline" className="border-on-dark/30 bg-transparent text-on-dark hover:bg-on-dark/10 hover:text-lime" onClick={onRemove} aria-label={`Remove ${beneficiaryLabel(b)}`}><Trash2 /><span className="max-[379px]:sr-only">Remove</span></Button>
        </div>
      </div>
    </article>
  );
}

const FAIL = { description: "Nothing was changed. Your browser may be out of space or blocking saves. Fix that, then try again." };

/** Saved payout accounts (beneficiaries). `onChange` must persist and return false if it couldn't. */
export function PayoutAccounts({ list, onChange, defaultHolder, defaultCountry }: { list: Beneficiary[]; onChange: (next: Beneficiary[]) => boolean; defaultHolder: string; defaultCountry?: string }) {
  const [adding, setAdding] = useState(false);
  const [rename, setRename] = useState<Beneficiary | null>(null);
  const [nick, setNick] = useState("");
  const [remove, setRemove] = useState<Beneficiary | null>(null);
  const [makePrimary, setMakePrimary] = useState<Beneficiary | null>(null);
  const primary = list.find((b) => b.preferred) ?? list[0] ?? null;
  const others = list.filter((b) => b.id !== primary?.id);
  return (
    <section aria-labelledby="payout-accounts-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="payout-accounts-title" className="flex items-center gap-2.5 text-[17px] font-extrabold"><span className="lime-tick" aria-hidden="true" />Payout accounts</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{list.length ? `${list.length} saved · withdrawals go to your primary account unless you choose another` : "Where your withdrawals are sent."}</p>
        </div>
        <Button onClick={() => setAdding(true)}><Plus />Add bank account</Button>
      </div>
      {primary ? (
        <div className="space-y-4">
          <div className="max-w-2xl"><PrimaryCard b={primary} onRename={() => { setRename(primary); setNick(primary.nickname); }} onRemove={() => setRemove(primary)} /></div>
          {others.length > 0 && (
            <div>
              <h3 className="mb-2.5 text-[13px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">Other accounts · {others.length}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {others.map((b) => (
                  <BeneficiaryCard key={b.id} b={b} onPrefer={() => setMakePrimary(b)} onRename={() => { setRename(b); setNick(b.nickname); }} onRemove={() => setRemove(b)} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="surface flex flex-col items-center px-5 py-10 text-center">
          <div className="relative"><BrandIcon src={brandArtwork.bank} className="h-16 w-16" /><span className="lime-pedestal" aria-hidden="true" /></div>
          <h3 className="mt-5 text-base font-bold">No payout account yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">Add the bank account you want withdrawals sent to. Nigerian banks, microfinance banks and digital banks are supported, plus accounts in other supported countries.</p>
          <Button className="mt-5" onClick={() => setAdding(true)}><Plus />Add bank account</Button>
        </div>
      )}

      <ConfirmDialog
        open={!!makePrimary}
        onOpenChange={(v) => !v && setMakePrimary(null)}
        art={brandArtwork.bank}
        eyebrow="Payout account"
        tone="default"
        title="Make this your primary account?"
        description={makePrimary ? `Withdrawals will default to ${beneficiaryLabel(makePrimary)} ${maskedLast4(makePrimary)} (${makePrimary.holder}).` : ""}
        confirmLabel="Make primary"
        confirmIcon={<Star />}
        onConfirm={() => {
          if (!makePrimary) return false;
          if (onChange(setPreferred(list, makePrimary.id))) {
            toast.success("Primary account updated", { description: `${beneficiaryLabel(makePrimary)} ${maskedLast4(makePrimary)}` });
            setMakePrimary(null);
          } else {
            toast.error("Couldn't change your primary account", FAIL);
            return false;
          }
          return true;
        }}
      />

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className={cn("max-h-[94dvh] max-w-2xl grid-cols-[minmax(0,1fr)] overflow-y-auto", phoneSheetClass)}>
          <DialogHeader><DialogTitle>Add bank account</DialogTitle><DialogDescription>Choose your bank, enter your account number and check the details. Full account numbers are never stored.</DialogDescription></DialogHeader>
          {adding && (
            <AddPayoutAccount defaultHolder={defaultHolder} {...(defaultCountry ? { defaultCountry } : {})} existing={list}
              onSave={(b) => { const next = addBeneficiary(list, b); if (!next) { toast.error("This account is already saved"); return false; } const ok = onChange(next); if (ok) toast.success("Payout account saved", { description: `${b.institution.name} ${maskedLast4(b)}` }); return ok; }}
              onDone={() => setAdding(false)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!rename} onOpenChange={(v) => !v && setRename(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit nickname</DialogTitle><DialogDescription>{rename && `${rename.institution.name} ${maskedLast4(rename)}`}</DialogDescription></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); if (rename) { if (onChange(renameBeneficiary(list, rename.id, nick))) { toast.success(nick.trim() ? "Nickname saved" : "Nickname removed"); setRename(null); } else toast.error("Couldn't save the nickname", FAIL); } }}>
            <label htmlFor="ben-nick" className="text-[13px] font-bold">Nickname</label>
            <Input id="ben-nick" className="mt-1.5" value={nick} maxLength={40} onChange={(e) => setNick(e.target.value)} placeholder="e.g. Savings in Accra" />
            <DialogFooter className="mt-5"><Button type="button" variant="outline" onClick={() => setRename(null)}>Cancel</Button><Button type="submit">Save nickname</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!remove}
        onOpenChange={(v) => !v && setRemove(null)}
        art={brandArtwork.bank}
        eyebrow="Payout account"
        title="Remove this account?"
        description={remove ? `${beneficiaryLabel(remove)} ${maskedLast4(remove)} will no longer receive payouts.` : ""}
        cancelLabel="Keep account"
        confirmLabel="Remove account"
        confirmIcon={<Trash2 />}
        onConfirm={() => {
          if (!remove) return false;
          if (onChange(removeBeneficiary(list, remove.id))) {
            toast.success("Payout account removed", { description: `${beneficiaryLabel(remove)} ${maskedLast4(remove)}` });
            setRemove(null);
          } else {
            toast.error("Couldn't remove the account", FAIL);
            return false;
          }
          return true;
        }}
      >
        <ConfirmNote>Past payouts to this account keep their records. You can add it again later.</ConfirmNote>
      </ConfirmDialog>
    </section>
  );
}

