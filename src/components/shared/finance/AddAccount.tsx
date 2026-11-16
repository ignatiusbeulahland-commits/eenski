import { ArrowLeft, ArrowRight, Building2, Check, Clock, History, Info, Loader2, Search, SearchX, ShieldCheck, Smartphone, Landmark, Store, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Switch } from "@/components/dashboard-ui/switch";
import { availableRails, countryByCode, institutionKind, isCountryAvailable, KIND_LABEL, METHOD_LABEL, PROVIDERS, type Country, type FieldId, type Institution, type InstitutionKind, type Rail } from "@/lib/shared/finance/coverage";
import { CURRENCIES, type CurrencyCode } from "@/lib/shared/finance/currencies";
import { accountHint, accountKey, compact, digits, mobileHint, routingValid, ibanValid, validateAccount, type AccountDraft } from "@/lib/shared/finance/validate";
import { fingerprintOf, isDuplicate, type Beneficiary } from "@/lib/shared/finance/beneficiaries";
import { cn } from "@/lib/utils";
import { BankLogo, CurrencyTag, Flag } from "./Marks";
import { CountryPicker } from "./CountryPicker";

const STEPS = ["Country", "Currency", "Method", "Bank", "Details", "Verify", "Review", "Saved"] as const;

const FIELD_LABEL: Record<FieldId, string> = {
  accountNumber: "Account number", mobileNumber: "Mobile money number", sortCode: "Sort code", routingNumber: "ABA routing number",
  accountType: "Account type", iban: "IBAN", bic: "SWIFT/BIC (optional)", address: "Street address", city: "City", state: "State", postCode: "ZIP code",
};
const ACCOUNT_TYPES: Record<string, string[]> = { ZA: ["Personal", "Business"], US: ["Checking", "Savings"] };

const formatSort = (v: string) => digits(v).slice(0, 6).replace(/(\d{2})(?=\d)/g, "$1-");
const formatIban = (v: string) => compact(v).slice(0, 34).replace(/(.{4})/g, "$1 ").trim();

function Choice({ on, onClick, children, disabled }: { on: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" aria-pressed={on} disabled={disabled} onClick={onClick}
      className={cn("finance-choice flex w-full min-w-0 items-center gap-3 rounded-[18px] border-[1.5px] bg-card p-3.5 text-left transition-[border-color,box-shadow,background-color] hover:border-cobalt-100 disabled:cursor-not-allowed disabled:opacity-55", on ? "border-cobalt bg-ice/60 shadow-[inset_0_-3px_0_var(--lime)]" : "border-line")}>
      {children}
      <span className={cn("ml-auto grid h-5 w-5 shrink-0 place-items-center rounded-full", on ? "bg-cobalt text-lime" : "ring-[1.5px] ring-line")}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
    </button>
  );
}

export function AddPayoutAccount({ defaultHolder, defaultCountry, existing, onSave, onDone, onProgress }: {
  defaultHolder: string;
  defaultCountry?: string;
  existing: Beneficiary[];
  /** Return false when the account couldn't be saved; the flow stays on review and says so. */
  onSave: (b: Beneficiary) => boolean;
  onDone: () => void;
  /** Told whether the person has moved past the first step, so the page can tuck the method choice away. */
  onProgress?: (pastFirst: boolean) => void;
}) {
  const start = defaultCountry && countryByCode(defaultCountry) && isCountryAvailable(countryByCode(defaultCountry)!) ? defaultCountry : "";
  // When the home country has one currency and one method (e.g. Nigeria → NGN bank transfer), open on bank selection.
  const [first] = useState(() => {
    const c = countryByCode(start);
    const rs = c ? availableRails(c) : [];
    return rs.length === 1 ? 3 : 0;
  });
  const [step, setStep] = useState(first);
  useEffect(() => { onProgress?.(step > first); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (code: string) => {
    const c = countryByCode(code);
    const cs = c ? [...new Set(availableRails(c).map((r) => r.currency))] : [];
    return { currency: cs.length === 1 ? cs[0]! : c && cs.includes(c.currency) ? c.currency : null };
  };
  const [cc, setCc] = useState(start);
  const country = countryByCode(cc);
  const rails = country ? availableRails(country) : [];
  const currencies = [...new Set(rails.map((r) => r.currency))];
  const [currency, setCurrency] = useState<CurrencyCode | null>(() => pick(start).currency);
  const methodRails = rails.filter((r) => r.currency === currency);
  // Start with the home currency's single method chosen (e.g. Nigeria → NGN bank transfer).
  const [railId, setRailId] = useState(() => { const m = rails.filter((r) => r.currency === pick(start).currency); return m.length === 1 ? m[0]!.id : ""; });
  const rail = rails.find((r) => r.id === railId);
  const [inst, setInst] = useState<Institution | null>(null);
  const [otherName, setOtherName] = useState("");
  const [q, setQ] = useState("");
  const [d, setD] = useState<AccountDraft>({ holder: defaultHolder });
  const [err, setErr] = useState<Partial<Record<FieldId | "holder", string>>>({});
  const [checks, setChecks] = useState<{ running: boolean; duplicate: boolean; fingerprint: string } | null>(null);
  const [nickname, setNickname] = useState("");
  const [preferred, setPreferred] = useState(existing.length === 0);
  const [own, setOwn] = useState(false);
  const [saveError, setSaveError] = useState("");
  const chooseRail = (id: string) => { setRailId(id); setInst(null); setOtherName(""); setQ(""); setChecks(null); };
  const chooseCurrency = (c: CurrencyCode | null) => {
    setCurrency(c);
    const m = rails.filter((r) => r.currency === c);
    chooseRail(m.length === 1 ? m[0]!.id : "");
  };
  const chooseCountry = (code: string) => {
    setCc(code);
    const c = countryByCode(code);
    const rs = c ? availableRails(c) : [];
    const cs = [...new Set(rs.map((r) => r.currency))];
    const cur = cs.length === 1 ? cs[0]! : c && cs.includes(c.currency) ? c.currency : null;
    setCurrency(cur);
    const m = rs.filter((r) => r.currency === cur);
    chooseRail(m.length === 1 ? m[0]!.id : "");
  };

  const [kind, setKind] = useState<InstitutionKind>("commercial");
  const [saving, setSaving] = useState(false);
  const needle = q.trim().toLowerCase();
  const matches = (i: Institution) => !needle || i.name.toLowerCase().includes(needle) || i.code.toLowerCase() === needle;
  const logoFirst = (xs: Institution[]) => [...xs.filter((i) => i.logo), ...xs.filter((i) => !i.logo)];
  /** Categories this rail actually has; tabs only show for bank lists with more than one. */
  const kinds = useMemo(() => {
    if (!rail || rail.method !== "bank") return [] as { k: InstitutionKind; n: number; hits: number }[];
    return (["commercial", "microfinance", "other"] as const)
      .map((k) => { const all = rail.institutions.filter((i) => institutionKind(i) === k); return { k, n: all.length, hits: all.filter(matches).length }; })
      .filter((x) => x.n > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rail, needle]);
  const tabs = kinds.length > 1;
  const activeKind: InstitutionKind | null = tabs ? (kinds.some((x) => x.k === kind) ? kind : kinds[0]!.k) : null;
  const list = useMemo(() => {
    if (!rail) return [];
    return logoFirst(rail.institutions.filter((i) => matches(i) && (!activeKind || institutionKind(i) === activeKind)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rail, needle, activeKind]);
  /** Popular first (when not searching); "Other" keeps the provider's own sub-groups. */
  const sections = useMemo(() => {
    if (!list.length) return [];
    if (activeKind === "other" && list.some((i) => i.group)) {
      const order = [...new Set(list.map((i) => i.group ?? "Other"))];
      return order.map((g) => ({ title: g, items: list.filter((i) => (i.group ?? "Other") === g) }));
    }
    const label = activeKind ? KIND_LABEL[activeKind] : rail?.method === "bank" ? "Banks" : "Networks";
    if (needle) return [{ title: `Results in ${label.toLowerCase()}`, items: list }];
    const pop = list.filter((i) => i.popular);
    if (!pop.length) return [{ title: tabs ? `All ${label.toLowerCase()}` : "", items: list }];
    return [{ title: "Popular", items: pop }, { title: `All ${label.toLowerCase()}`, items: list.filter((i) => !i.popular) }].filter((x) => x.items.length);
  }, [list, needle, activeKind, rail, tabs]);
  /** Banks already used for saved accounts on this rail. */
  const recent = useMemo(() => {
    if (!rail) return [];
    const seen = new Set<string>();
    return existing
      .filter((b) => b.railId === rail.id && b.institution.code)
      .map((b) => rail.institutions.find((i) => i.code === b.institution.code && i.name === b.institution.name))
      .filter((i): i is Institution => Boolean(i) && !seen.has(i!.code + i!.name) && (seen.add(i!.code + i!.name), true))
      .slice(0, 4);
  }, [existing, rail]);
  const elsewhere = tabs && needle && !list.length ? kinds.find((x) => x.k !== activeKind && x.hits > 0) : undefined;
  const chooseInst = (i: Institution) => { setInst(i); setOtherName(""); if (tabs) setKind(institutionKind(i)); };

  const institutionName = inst?.name ?? otherName.trim();
  const canNext = [
    Boolean(country),
    Boolean(currency),
    Boolean(rail),
    Boolean(inst) || Boolean(rail?.institutionOptional && (inst || otherName.trim() || rail.institutions.length === 0)),
    true,
    Boolean(checks && !checks.running && !checks.duplicate),
    own,
  ][step] ?? true;

  const runChecks = async () => {
    if (!country || !rail) return;
    setChecks({ running: true, duplicate: false, fingerprint: "" });
    const key = accountKey(country, rail, d);
    const fp = await fingerprintOf([country.code, rail.id, inst?.code ?? institutionName, key]);
    setChecks({ running: false, duplicate: isDuplicate(existing, fp), fingerprint: fp });
  };

  const next = () => {
    if (step === 4 && country && rail) {
      const e = validateAccount(country, rail, d);
      setErr(e);
      if (Object.keys(e).length) return;
      setStep(5);
      void runChecks();
      return;
    }
    if (step === 6 && country && rail && currency && checks) {
      const key = accountKey(country, rail, d);
      const details: string[] = [];
      if (d.accountType) details.push(d.accountType);
      if (rail.fields.includes("sortCode")) details.push(`Sort code ••-••-${digits(d.sortCode ?? "").slice(-2)}`);
      if (rail.fields.includes("routingNumber")) details.push(`Routing ••••${digits(d.routingNumber ?? "").slice(-4)}`);
      if (d.bic) details.push(`BIC ${compact(d.bic)}`);
      setSaveError("");
      const ok = onSave({
        id: crypto.randomUUID(), country: country.code, currency, railId: rail.id, method: rail.method, provider: rail.provider,
        institution: { code: inst?.code ?? "", name: institutionName || (rail.fields.includes("iban") ? `${country.name} bank (IBAN)` : "Bank account"), logo: inst?.logo ?? null },
        holder: (d.holder ?? "").trim(), nickname: nickname.trim().slice(0, 40), last4: key.slice(-4), details,
        status: "format_checked", preferred, fingerprint: checks.fingerprint, createdAt: new Date().toISOString(),
      });
      if (!ok) { setSaveError("This account wasn't saved. Your browser may be out of space or blocking saves. Fix that, then try again."); return; }
      setStep(7);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const base = step >= first ? first : 0;
  const set = (f: FieldId | "holder", v: string) => { setD((x) => ({ ...x, [f]: v })); setErr((e) => ({ ...e, [f]: undefined })); setChecks(null); setOwn(false); };

  return (
    <div className="finance-wizard min-w-0">
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3 text-xs font-bold">
          <span className="shrink-0 whitespace-nowrap text-cobalt">Step {step - base + 1} of {STEPS.length - base} · {STEPS[step]}</span>
          {country && step > 0 && step < 7 && (
            <button type="button" onClick={() => setStep(0)} className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-soft px-2.5 py-1 text-muted-foreground hover:text-cobalt" aria-label={`Account country ${country.name}${currency ? `, ${currency}` : ""}. Change`}>
              <Flag code={country.code} className="h-3.5 w-5" /><span className="truncate"><span className="max-sm:hidden">{country.name}{currency && " · "}</span>{currency}</span><span className="text-cobalt">Change</span>
            </button>
          )}
        </div>
        <ol className="mt-2.5 grid gap-1" style={{ gridTemplateColumns: `repeat(${STEPS.length - base}, minmax(0, 1fr))` }} aria-label="Progress">
          {STEPS.slice(base).map((s, k) => { const i = k + base; return <li key={s} aria-current={i === step ? "step" : undefined} className={cn("h-1.5 rounded-full", i < step ? "bg-cobalt" : i === step ? "bg-lime shadow-[0_0_8px_var(--lime)]" : "bg-line")}><span className="sr-only">{s}{i < step ? " (done)" : ""}</span></li>; })}
        </ol>
      </div>

      {step === 0 && (
        <section aria-labelledby="fx-country">
          <h3 id="fx-country" className="text-lg font-extrabold">Where is the account held?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose the bank account's country. It can differ from where you live.</p>
          <div className="mt-4"><CountryPicker id="fx-country-picker" label="Bank country" value={cc} onChange={chooseCountry} payoutOnly /></div>
          {country && <ProviderNote rails={rails} />}
        </section>
      )}

      {step === 1 && country && (
        <section aria-labelledby="fx-currency">
          <h3 id="fx-currency" className="text-lg font-extrabold">Which currency will you receive?</h3>
          <p className="mt-1 text-sm text-muted-foreground">The currency the account holds. Payouts in another currency are converted first.</p>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {currencies.map((c) => (
              <Choice key={c} on={currency === c} onClick={() => chooseCurrency(c)}>
                <Flag code={CURRENCIES[c].flag} className="h-6 w-9 rounded-[6px]" />
                <span className="min-w-0"><span className="block text-sm font-extrabold">{c}</span><span className="block truncate text-xs text-muted-foreground">{CURRENCIES[c].name}{c !== country.currency ? " · domiciliary account" : ""}</span></span>
              </Choice>
            ))}
          </div>
        </section>
      )}

      {step === 2 && country && (
        <section aria-labelledby="fx-method">
          <h3 id="fx-method" className="text-lg font-extrabold">How should we pay you?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Methods available in {country.name} for {currency}.</p>
          <div className="mt-4 grid gap-2.5">
            {methodRails.map((r) => (
              <Choice key={r.id} on={railId === r.id} onClick={() => chooseRail(r.id)}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-ice text-cobalt">{r.method === "bank" ? <Landmark className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}</span>
                <span className="min-w-0"><span className="block text-sm font-extrabold">{METHOD_LABEL[r.method]}</span><span className="block text-xs text-muted-foreground">Sent through {PROVIDERS[r.provider].name}{r.institutions.length ? ` · ${r.institutions.length} ${r.method === "bank" ? "banks" : "networks"}` : ""}</span></span>
              </Choice>
            ))}
            {country.rails.filter((r) => r.unavailable && r.currency === currency).map((r) => (
              <p key={r.id} className="flex items-start gap-2 rounded-[14px] bg-soft p-3 text-xs text-muted-foreground"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />{METHOD_LABEL[r.method]}: {r.unavailable}</p>
            ))}
          </div>
        </section>
      )}

      {step === 3 && rail && (
        <section aria-labelledby="fx-bank">
          <h3 id="fx-bank" className="text-lg font-extrabold">{rail.method === "bank" ? "Choose your bank" : "Choose your mobile money network"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{rail.institutionOptional ? "Optional. It only labels this account; payouts use the details on the next step." : `Banks that can receive payouts in ${country?.name}.`}</p>
          {inst && (
            <div className="mt-4 flex items-center gap-3 rounded-[18px] border-[1.5px] border-cobalt bg-ice/60 p-3 shadow-[inset_0_-3px_0_var(--lime)]" aria-live="polite">
              <BankLogo name={inst.name} logo={inst.logo} className="h-11 w-11 rounded-[12px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold">{inst.name}</span>
                <span className="block truncate text-[11px] font-semibold text-muted-foreground">{rail.method === "bank" ? KIND_LABEL[institutionKind(inst)].replace(/s$/, "") : "Mobile money network"}{rail.provider !== "wise" && ` · Code ${inst.code}`}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cobalt px-2.5 py-1 text-[11px] font-extrabold text-primary-foreground"><Check className="h-3 w-3" strokeWidth={3} />Selected</span>
            </div>
          )}
          {recent.length > 0 && !needle && (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground"><History className="h-3.5 w-3.5" aria-hidden="true" />Used before</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {recent.map((i) => {
                  const on = inst?.code === i.code && inst.name === i.name;
                  return (
                    <button key={i.code + i.name} type="button" aria-pressed={on} onClick={() => chooseInst(i)} className={cn("inline-flex h-11 max-w-full items-center gap-2 rounded-full border-[1.5px] bg-card pl-1.5 pr-3.5 text-[13px] font-bold transition-[border-color,background-color] duration-150 hover:border-cobalt-100 active:scale-[0.98]", on ? "border-cobalt bg-ice/60" : "border-line")}>
                      <BankLogo name={i.name} logo={i.logo} className="h-8 w-8 rounded-full" /><span className="truncate">{i.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {tabs && activeKind && (
            <div role="tablist" aria-label="Type of bank" className="mt-4 grid gap-1 rounded-full bg-soft p-1" style={{ gridTemplateColumns: `repeat(${kinds.length}, minmax(0, 1fr))` }}>
              {kinds.map(({ k, n, hits }) => {
                const on = activeKind === k;
                const Icon = k === "commercial" ? Building2 : k === "microfinance" ? Store : Landmark;
                return (
                  <button key={k} type="button" role="tab" aria-selected={on} onClick={() => setKind(k)}
                    className={cn("flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-full px-1.5 text-[12px] font-extrabold sm:px-2 sm:text-[13px] transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out)] active:scale-[0.97]", on ? "bg-card text-cobalt shadow-[0_2px_10px_-4px_color-mix(in_oklab,var(--cobalt)_45%,transparent)]" : "text-muted-foreground hover:text-foreground")}>
                    <Icon className="h-4 w-4 shrink-0 max-sm:hidden" aria-hidden="true" />
                    <span className="truncate"><span className="sm:hidden">{k === "commercial" ? "Commercial" : k === "microfinance" ? "Microfinance" : "Other"}</span><span className="max-sm:hidden">{KIND_LABEL[k]}</span></span>
                    <span className={cn("shrink-0 rounded-full px-1.5 text-[10px] tabular-nums max-sm:hidden", on ? "bg-ice text-cobalt" : "bg-card/70")}>{needle ? hits : n}</span>
                  </button>
                );
              })}
            </div>
          )}
          {rail.institutions.length > 8 && (
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input aria-label={activeKind ? `Search ${KIND_LABEL[activeKind].toLowerCase()}` : "Search banks"} value={q} onChange={(e) => setQ(e.target.value)} placeholder={activeKind ? "Search by name or code" : `Search ${rail.institutions.length} ${rail.method === "bank" ? "banks" : "networks"} by name`} className="pl-10 pr-10" />
              {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-soft hover:text-foreground"><X className="h-4 w-4" /></button>}
            </div>
          )}
          {rail.institutions.length > 0 && (
            <div className="finance-inst-list mt-3 max-h-[min(42dvh,360px)] overflow-y-auto overscroll-contain rounded-[18px] p-0.5" role="group" aria-label={activeKind ? KIND_LABEL[activeKind] : rail.method === "bank" ? "Banks" : "Networks"}>
              {sections.map((sec) => (
                <div key={sec.title || "all"} role="group" aria-label={sec.title || undefined}>
                  {sec.title && <p className="sticky top-0 z-[1] bg-card/95 px-1 pb-1.5 pt-2 text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground backdrop-blur-sm">{sec.title} <span className="tabular-nums">· {sec.items.length}</span></p>}
                  <ul className="grid grid-cols-[minmax(0,1fr)] gap-2 pb-2 sm:grid-cols-2">
                    {sec.items.map((i) => (
                      <li key={`${sec.title}-${i.code}-${i.name}`} className="min-w-0">
                        <Choice on={inst?.code === i.code && inst.name === i.name} onClick={() => chooseInst(i)}>
                          <BankLogo name={i.name} logo={i.logo} />
                          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold" title={i.name}>{i.name}</span>{rail.provider !== "wise" && <span className="block text-[11px] font-semibold tabular-nums text-muted-foreground">Code {i.code}</span>}</span>
                        </Choice>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {!list.length && (
                <div className="grid place-items-center px-4 py-8 text-center" role="status">
                  <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-ice text-cobalt"><SearchX className="h-5 w-5" aria-hidden="true" /></span>
                  <p className="mt-3 text-sm font-extrabold">No {activeKind ? KIND_LABEL[activeKind].toLowerCase().replace(/s$/, "") : "bank"} matches “{q.trim()}”</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">Check the spelling, try a shorter name, or search by bank code.</p>
                  {elsewhere && <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setKind(elsewhere.k)}>Show {elsewhere.hits} in {KIND_LABEL[elsewhere.k].toLowerCase()}</Button>}
                </div>
              )}
            </div>
          )}
          {tabs && <p className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground"><Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />{country?.code === "NG" ? "Grouped by licence type. Can't find your bank? Try the search." : "Only banks named as microfinance banks are under Microfinance; savings & loans and SACCOs are under Other."}</p>}
          {rail.institutionOptional && (
            <div className="mt-4 space-y-1.5">
              <label htmlFor="fx-other-bank" className="text-[13px] font-bold">{rail.institutions.length ? "Bank not listed?" : "Bank name (optional)"}</label>
              <Input id="fx-other-bank" value={otherName} maxLength={60} placeholder="e.g. Deutsche Bank" onChange={(e) => { setOtherName(e.target.value); setInst(null); }} />
            </div>
          )}
        </section>
      )}

      {step === 4 && rail && country && (
        <section aria-labelledby="fx-details">
          <h3 id="fx-details" className="text-lg font-extrabold">Account details</h3>
          <p className="mt-1 text-sm text-muted-foreground">Just what's needed to send payouts to this account.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FieldRow id="fx-holder" label="Account holder name" error={err.holder} hint="Exactly as the bank or network shows it." wide>
              <Input id="fx-holder" autoComplete="name" value={d.holder ?? ""} aria-invalid={!!err.holder || undefined} onChange={(e) => set("holder", e.target.value)} />
            </FieldRow>
            {rail.fields.map((f) => (
              <FieldRow key={f} id={`fx-${f}`} label={FIELD_LABEL[f]} error={err[f]} wide={f === "iban" || f === "address" || f === "mobileNumber"}
                hint={f === "accountNumber" ? accountHint(country.code) : f === "mobileNumber" ? mobileHint(country) : f === "sortCode" ? "6 digits, e.g. 20-00-00" : f === "routingNumber" ? "9 digits on your cheque or bank app" : f === "iban" ? `Starts with ${country.code}` : undefined}>
                {f === "accountType" ? (
                  <div className="flex gap-2" role="radiogroup" aria-label="Account type">
                    {(ACCOUNT_TYPES[country.code] ?? ["Personal", "Business"]).map((t) => (
                      <button key={t} type="button" role="radio" aria-checked={d.accountType === t} onClick={() => set("accountType", t)} className={cn("lime-pip h-11 flex-1 rounded-full border-[1.5px] px-3 text-sm font-bold", d.accountType === t ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-cobalt-100")} data-state={d.accountType === t ? "active" : undefined}>{t}</button>
                    ))}
                  </div>
                ) : f === "mobileNumber" ? (
                  <div className="flex">
                    <span className="grid h-12 place-items-center rounded-l-[14px] border-[1.5px] border-r-0 border-input bg-soft px-3 text-sm font-bold tabular-nums">+{country.dial}</span>
                    <Input id={`fx-${f}`} inputMode="tel" autoComplete="off" value={d[f] ?? ""} aria-invalid={!!err[f] || undefined} onChange={(e) => set(f, e.target.value.replace(/[^\d ]/g, ""))} className="rounded-l-none font-mono tracking-wider" />
                  </div>
                ) : (
                  <Input id={`fx-${f}`} autoComplete="off" inputMode={["accountNumber", "sortCode", "routingNumber", "postCode"].includes(f) && country.code !== "CI" ? "numeric" : "text"}
                    value={f === "sortCode" ? formatSort(d[f] ?? "") : f === "iban" ? formatIban(d[f] ?? "") : d[f] ?? ""} aria-invalid={!!err[f] || undefined}
                    maxLength={f === "state" ? 2 : undefined}
                    onChange={(e) => set(f, f === "sortCode" ? digits(e.target.value).slice(0, 6) : f === "state" ? e.target.value.toUpperCase() : e.target.value)}
                    className={cn(["accountNumber", "sortCode", "routingNumber", "iban", "bic"].includes(f) && "font-mono tracking-wider")} />
                )}
              </FieldRow>
            ))}
          </div>
        </section>
      )}

      {step === 5 && rail && country && (
        <section aria-labelledby="fx-verify" aria-live="polite">
          <h3 id="fx-verify" className="text-lg font-extrabold">Checking the details</h3>
          <div className="mt-3 flex items-center gap-3 rounded-[16px] bg-soft p-3">
            <BankLogo name={institutionName || country.name} logo={inst?.logo} className="h-10 w-10 rounded-[12px]" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{institutionName || `${country.name} account`}</p><p className="text-xs tabular-nums text-muted-foreground">•••• {accountKey(country, rail, d).slice(-4)} · {d.holder?.trim()}</p></div>
          </div>
          <ol className="finance-verify mt-4">
            <VerifyStep state="ok" title={rail.fields.includes("iban") ? "IBAN is valid" : rail.fields.includes("mobileNumber") ? "Mobile number looks right" : `Account number matches the ${country.name} format`}
              detail={[rail.fields.includes("routingNumber") && (routingValid(d.routingNumber ?? "") ? "Routing number checksum is valid" : "Routing number checksum failed"), rail.fields.includes("iban") && (ibanValid(d.iban ?? "", country.code) ? `Belongs to ${country.name}` : `Doesn't belong to ${country.name}`)].filter(Boolean).join(" · ") || undefined} />
            <VerifyStep state={!checks || checks.running ? "running" : checks.duplicate ? "fail" : "ok"} title={!checks || checks.running ? "Checking your saved accounts…" : checks.duplicate ? "You've already saved this account" : "Not already saved"}
              detail={checks?.duplicate ? "Go back and enter a different account." : undefined} />
            <VerifyStep state="waiting" title="Account name not confirmed yet" detail={`${rail.verification.label}. The name above is as you entered it; this account is saved as details checked, not verified.`} last />
          </ol>
          {checks?.duplicate && <Button variant="outline" size="sm" className="mt-3" onClick={() => setStep(4)}><ArrowLeft />Edit details</Button>}
        </section>
      )}

      {step === 6 && rail && country && currency && (
        <section aria-labelledby="fx-review">
          <h3 id="fx-review" className="text-lg font-extrabold">Review and save</h3>
          <div className="bg-brand-panel relative mt-4 overflow-hidden rounded-[24px] p-5 text-on-dark" data-surface="dark">
            <div className="flex items-center gap-3">
              <BankLogo name={institutionName || country.name} logo={inst?.logo} className="h-12 w-12 rounded-[14px]" />
              <div className="min-w-0 flex-1"><p className="truncate text-base font-extrabold">{institutionName || `${country.name} bank account`}</p><p className="text-xs text-on-dark-muted">{METHOD_LABEL[rail.method]} · via {PROVIDERS[rail.provider].name}</p></div>
              <CurrencyTag code={currency} className="text-on-dark" />
            </div>
            <p className="mt-5 text-xl font-extrabold tabular-nums tracking-[0.08em]">•••• {accountKey(country, rail, d).slice(-4)}</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-2 text-sm"><div><p className="text-xs text-on-dark-muted">Account holder</p><p className="font-bold">{d.holder?.trim()}</p></div><span className="inline-flex items-center gap-1.5 text-xs font-bold text-on-dark-muted"><Flag code={country.code} className="h-3.5 w-5" />{country.name}</span></div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FieldRow id="fx-nickname" label="Nickname (optional)" hint="e.g. Business account">
              <Input id="fx-nickname" value={nickname} maxLength={40} onChange={(e) => setNickname(e.target.value)} />
            </FieldRow>
            <label className="flex items-center justify-between gap-3 rounded-[14px] border-[1.5px] border-line bg-card px-4 py-3 text-sm font-bold sm:mt-[26px] sm:h-12 sm:py-0">
              Make this my preferred account
              <Switch checked={preferred} onCheckedChange={setPreferred} disabled={existing.length === 0} aria-label="Preferred account" />
            </label>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[13px] font-semibold">
            <input type="checkbox" checked={own} onChange={(e) => setOwn(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--cobalt)]" />
            This account is in my name and the details are correct.
          </label>
          {saveError && <p role="alert" className="mt-3 rounded-[14px] bg-destructive/10 p-3 text-sm font-semibold text-destructive">{saveError}</p>}
        </section>
      )}

      {step === 7 && (
        <section className="py-4 text-center" aria-live="polite">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-cobalt text-lime shadow-[0_0_24px_color-mix(in_oklab,var(--lime)_45%,transparent)]"><Check className="h-7 w-7" strokeWidth={3} /></span>
          <h3 className="mt-4 text-lg font-extrabold">Payout account saved</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Only the last four digits are kept. The account owner is confirmed before the first payout.</p>
          <Button className="mt-5" onClick={onDone}>Done</Button>
        </section>
      )}

      {step < 7 && (
        <div className="finance-actions sticky bottom-[-1.5rem] z-[2] -mx-6 -mb-6 mt-6 flex items-center justify-between gap-2 border-t bg-card/95 px-6 pt-4 backdrop-blur-sm pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Button variant="outline" onClick={() => (step === 0 || step === first ? onDone() : setStep(step === 6 ? 4 : step - 1))}><ArrowLeft />{step === 0 || step === first ? "Cancel" : "Back"}</Button>
          <Button onClick={() => { if (step !== 6) return next(); setSaving(true); window.setTimeout(() => { next(); setSaving(false); }, 450); }} disabled={!canNext || saving} aria-busy={saving || undefined}>{step === 6 ? (saving ? <><Loader2 className="animate-spin" />Saving…</> : <><ShieldCheck />Save account</>) : <>Continue<ArrowRight /></>}</Button>
        </div>
      )}
    </div>
  );
}

function ProviderNote({ rails }: { rails: Rail[] }) {
  const providers = [...new Set(rails.map((r) => r.provider))];
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
      {rails.map((r) => <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1"><CurrencyTag code={r.currency} className="text-xs" />{METHOD_LABEL[r.method]}</span>)}
      <span className="inline-flex items-center gap-1.5">via {providers.map((p) => PROVIDERS[p].name).join(" & ")}</span>
    </div>
  );
}

function VerifyStep({ state, title, detail, last }: { state: "ok" | "fail" | "running" | "waiting"; title: string; detail?: string | undefined; last?: boolean }) {
  const icon = state === "ok" ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : state === "fail" ? <X className="h-3.5 w-3.5" strokeWidth={3} /> : state === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />;
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {!last && <span className="absolute left-[13px] top-7 h-[calc(100%-28px)] w-0.5 rounded-full bg-line" aria-hidden="true" />}
      <span className={cn("relative grid h-7 w-7 shrink-0 place-items-center rounded-full", state === "ok" ? "bg-cobalt text-lime" : state === "fail" ? "bg-destructive text-primary-foreground" : state === "running" ? "bg-ice text-cobalt" : "bg-warning-soft text-warning-foreground")} aria-hidden="true">{icon}</span>
      <div className="min-w-0 pt-0.5">
        <p className={cn("text-sm font-extrabold", state === "fail" && "text-destructive")}>{title}<span className="sr-only"> — {state === "ok" ? "passed" : state === "fail" ? "failed" : state === "running" ? "in progress" : "pending"}</span></p>
        {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
      </div>
    </li>
  );
}


function FieldRow({ id, label, hint, error, wide, children }: { id: string; label: string; hint?: string | undefined; error?: string | undefined; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-1.5", wide && "sm:col-span-2")}>
      <label htmlFor={id} className="text-[13px] font-bold">{label}</label>
      {children}
      {error ? <p className="text-xs font-semibold text-destructive" role="alert">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export type { Country };
