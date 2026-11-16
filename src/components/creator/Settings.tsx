import { Link } from "@tanstack/react-router";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import { canConfirmDemoVerification } from "@/lib/creator/universe/rules";
import { useState } from "react";
import { toast } from "sonner";
import { PasswordUpdated, ProfileUpdated, changedLabels } from "@/components/shared/outcome";
import { NameSettings } from "@/components/shared/NameSettings";
import { splitName, useIdentity } from "@/lib/shared/identity";
import { Globe2, Bell, CalendarClock, ChevronRight, Copy, Globe, KeyRound, Landmark, Laptop, LockKeyhole, Mail, MessageSquareText, Palette, PenLine, Phone, Plug, ShieldCheck, ShoppingBag, Megaphone, UserRound } from "lucide-react";
import { ProfileChecklist, ProfileHero, ProfileLayout, ProfileSaveBar, ProfileSection } from "@/components/shared/ProfileStudio";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Switch } from "@/components/dashboard-ui/switch";
import { Label } from "@/components/dashboard-ui/label";
import { PageHeader, Panel, FilterSelect } from "@/components/affiliate/ui";
import { Field } from "@/components/affiliate/Field";
import { useCreator } from "@/lib/creator/store";
import { validPhone } from "@/lib/affiliate/rules";
import { DAYS, validateAvailability } from "@/lib/creator/rules";
import { creatorSettings } from "@/lib/creator/nav";
import { DocumentDrop, PasswordInput, PasswordStrength, PreferenceSummary, SessionRow, SettingsCard, SettingsGrid, SettingsPage, SettingsTip, StatusPill, ToggleGroupCard, ToggleRow, currentBrowser, validateDocument } from "@/components/shared/SettingsKit";
import { CaptureTips, DocumentTypePicker, VerificationPerks, VerificationProgress, VerificationStatusCard } from "@/components/shared/VerificationKit";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { IntegrationsHub, type IntegrationItem } from "@/components/shared/Integrations";
import { cn } from "@/lib/utils";
import { PayoutAccounts } from "@/components/shared/finance/PayoutAccounts";
import { CurrencySettings } from "@/components/shared/finance/CurrencySettings";
import { preferredBeneficiary } from "@/lib/shared/finance/beneficiaries";

const tabs = creatorSettings.filter((t) => t.to !== "/creator/settings/character");

export function CreatorProfile() {
  const { state, update } = useCreator();
  const me = useIdentity();
  const [form, setForm] = useState(state.profile);
  const [updated, setUpdated] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  // Names are saved by their own cards; the Save bar covers contact details, bio and photo.
  const withSavedNames = (f: typeof form) => ({ ...f, firstName: state.profile.firstName, lastName: state.profile.lastName });
  const dirty = JSON.stringify(withSavedNames(form)) !== JSON.stringify(state.profile);
  const p = form;
  const saved = state.profile;
  const fullName = me?.fullName || `${saved.firstName} ${saved.lastName}`.trim();
  const checks = [
    { label: "Add a profile photo", done: !!saved.photo },
    { label: "Add your full name", done: !!fullName },
    { label: "Add your email address", done: !!saved.email.trim() },
    { label: "Add a phone number", done: !!saved.phone.trim() },
    { label: "Write a short bio", done: !!saved.bio.trim() },
  ];
  const onPhoto = (file?: File) => {
    if (!file) return;
    if (file.size > 1000000 || !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPG or WebP image under 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") { setForm((v) => ({ ...v, photo: String(reader.result) })); setError(""); }
    };
    reader.readAsDataURL(file);
  };
  if (updated) return <ProfileUpdated name={fullName} email={saved.email} changes={updated} dashboard="/creator/dashboard" onKeepEditing={() => setUpdated(null)} />;
  const field = (key: "email" | "phone", label: string, auto: string, hint?: string) => (
    <Field id={key} label={label} hint={hint}>
      <Input
        id={key}
        value={form[key]}
        type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
        maxLength={120}
        autoComplete={auto}
        placeholder={key === "phone" ? "+234 801 234 5678" : undefined}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </Field>
  );
  return (
    <div>
      <PageHeader eyebrow="Settings" title="Manage profile" description="Your name, a little about you and your creator profile." />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const next = withSavedNames(form);
          if ((next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) || !validPhone(next.phone)) {
            setError("Check the email address and phone number. You can leave the email blank.");
            return;
          }
          update({ profile: next });
          setError("");
          setUpdated(changedLabels(state.profile, next, { email: "Email", phone: "Phone", bio: "Bio", photo: "Photo" }));
          window.scrollTo({ top: 0 });
        }}
      >
        <ProfileLayout
          hero={
            <ProfileHero
              name={me?.displayName || fullName}
              role="Creator"
              tagline={p.bio.trim() ? (p.bio.length > 120 ? `${p.bio.slice(0, 117)}…` : p.bio) : "Teach, share and sell what you know on Enski."}
              photo={p.photo || undefined}
              initials={fullName.split(" ").filter((_, i, all) => i === 0 || i === all.length - 1).map((w) => w[0]?.toUpperCase() ?? "").join("")}
              chips={[...(p.email ? [{ icon: Mail, label: p.email }] : []), ...(p.phone ? [{ icon: Phone, label: p.phone }] : [])]}
              checks={checks}
              onPhoto={onPhoto}
              onRemovePhoto={() => setForm({ ...form, photo: "" })}
              photoHint="PNG, JPG or WebP, up to 1 MB. Saved with your profile."
            />
          }
          main={
            <>
              <ProfileSection icon={UserRound} title="Your names" description="Your account name is what buyers see on your storefront and products. Each name saves on its own.">
                <NameSettings
                  onSaved={(n) => {
                    const names = splitName(n.fullName);
                    update((s) => ({ profile: { ...s.profile, ...names } }));
                    setForm((f) => ({ ...f, ...names }));
                  }}
                />
              </ProfileSection>
              <ProfileSection icon={Phone} title="Contact" description="Your email address and phone number.">
                <div className="grid gap-4 sm:grid-cols-2">
                  {field("email", "Email", "email")}
                  {field("phone", "Phone number", "tel", "Optional")}
                </div>
              </ProfileSection>
              <ProfileSection icon={PenLine} title="About you" description="A short introduction for your storefront.">
                <Field id="bio" label="Bio" hint={`${form.bio.length}/500`}>
                  <Textarea id="bio" rows={4} value={form.bio} maxLength={500} placeholder="What do you teach, and who is it for?" onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </Field>
              </ProfileSection>
              {error && <p role="alert" className="rounded-[14px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</p>}
              <ProfileSaveBar dirty={dirty} onDiscard={() => { setForm(state.profile); setError(""); }} discardLabel="Discard changes" saveLabel="Save profile" />
            </>
          }
          side={
            <>
              <ProfileChecklist checks={checks} />
              <Link to="/creator/settings/character" className="surface group flex items-center gap-3 p-4 transition-colors hover:border-cobalt-100">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-brand-panel text-lime" aria-hidden="true"><Palette className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold">Character preferences</span>
                  <span className="block text-xs text-muted-foreground">Choose your Creator Universe character.</span>
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          }
        />
      </form>
    </div>
  );
}
export function CreatorBank() {
  const { state, commit } = useCreator();
  const n = state.beneficiaries.length;
  return (
    <SettingsPage icon={Landmark} title="Bank account details" description="Bank and mobile money accounts your payouts can be sent to." tabs={tabs} status={n ? <StatusPill tone="success">{n} payout account{n === 1 ? "" : "s"}</StatusPill> : <StatusPill tone="neutral">No account yet</StatusPill>}>
      <SettingsGrid
        main={<PayoutAccounts list={state.beneficiaries} onChange={(beneficiaries) => commit({ beneficiaries })} defaultHolder={`${state.profile.firstName} ${state.profile.lastName}`.trim()} defaultCountry={state.finance.residence || "NG"} />}
        side={<SettingsTip icon={ShieldCheck} title="Safe payouts" items={["Use an account in your own name.", "Only the last four digits are kept.", "The provider confirms the account owner before your first payout.", "Your accounts are visible only to you."]} />}
      />
    </SettingsPage>
  );
}
export function CreatorCurrency() {
  const { state, update } = useCreator();
  const preferred = preferredBeneficiary(state.beneficiaries);
  const earning = [...new Set(state.orders.map((o) => o.currency))];
  return (
    <SettingsPage icon={Globe2} title="Country & currency" description="Where you live, what you sell and earn in, and how you're paid." tabs={tabs} status={<StatusPill tone="neutral">Payouts in {state.finance.payoutCurrency ?? preferred?.currency ?? "NGN"}</StatusPill>}>
      <CurrencySettings prefs={state.finance} onChange={(finance) => update({ finance })} preferred={preferred} earning={earning.length ? earning : ["NGN"]}
        selling={{ currency: "NGN", note: "Products are priced in naira. Buyers abroad see an estimate in their own currency." }} accountsLink="/creator/settings/bank-accounts" />
    </SettingsPage>
  );
}
export function CreatorVerification() {
  const { state, update } = useCreator();
  const { universe, change } = useUniverse();
  const [checked, setChecked] = useState(false);
  const [doc, setDoc] = useState("");
  const [num, setNum] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  const approved = universe.demoVerificationConfirmed;
  const pending = state.verification === "submitted" && !approved;
  const named = Boolean(state.profile.firstName.trim() && state.profile.lastName.trim());
  const steps = [
    { label: "Your details", detail: named ? `${state.profile.firstName} ${state.profile.lastName}` : "Add your name in Manage Profile", state: named ? "done" : "current" },
    { label: "Identity document", detail: state.verification === "submitted" ? "Submitted" : "A valid government ID", state: state.verification === "submitted" ? "done" : named ? "current" : "upcoming" },
    { label: "Review", detail: approved ? "Approved" : pending ? "In review" : "Usually within 2 working days", state: approved ? "done" : pending ? "current" : "upcoming" },
  ] as const;
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!doc) er["doc"] = "Choose a document type";
    if (num.trim().length < 6) er["num"] = "Enter the document number";
    const fe = validateDocument(file);
    if (fe) er["file"] = fe;
    if (!checked) er["confirm"] = "Confirm your details are accurate";
    setErr(er);
    if (Object.keys(er).length) return;
    update({ verification: "submitted" });
    setFile(null); setNum("");
    toast.success("Verification submitted");
  };
  return (
    <SettingsPage icon={ShieldCheck} title="Verification" description="Verify your identity to unlock payouts and your official profile character." tabs={tabs} status={approved ? <StatusPill tone="success">Verified</StatusPill> : pending ? <StatusPill tone="pending">In review</StatusPill> : <StatusPill tone="neutral">Not verified</StatusPill>}>
      <div className="mb-6"><VerificationProgress steps={steps} /></div>
      <SettingsGrid
        main={
          approved ? (
            <VerificationStatusCard tone="verified" title="You're verified" description="Payouts and your official character are unlocked.">
              <div className="flex flex-wrap gap-2">
                <Button asChild><Link to="/creator/settings/character">Personalise official character</Link></Button>
                <Button variant="outline" onClick={() => { change({ demoVerificationConfirmed: false }); update({ verification: "not_started" }); setChecked(false); }}>Start over</Button>
              </div>
            </VerificationStatusCard>
          ) : pending ? (
            <VerificationStatusCard tone="review" title="Submission received" description="We're reviewing your document. You'll get a notification when it's done.">
              <p className="mb-4 rounded-[14px] bg-ice/60 p-3 text-[13px] text-cobalt">Complete your first and last name in Manage Profile before confirming.</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => {
                  if (!canConfirmDemoVerification(state.profile, state.verification)) { toast.error("Add your full name in Manage profile first, then try again."); return; }
                  change({ demoVerificationConfirmed: true });
                  toast.success("Verification complete", { description: "Choose how your character looks." });
                }}>Confirm verification</Button>
                <Button variant="outline" onClick={() => { update({ verification: "not_started" }); setChecked(false); }}>Start over</Button>
              </div>
            </VerificationStatusCard>
          ) : (
            <form onSubmit={submit} noValidate>
              <SettingsCard icon={ShieldCheck} title="Identity document" description="Use a valid ID that shows your full name and photo." footer={<Button type="submit">Submit verification</Button>}>
                <div className="grid gap-5">
                  <DocumentTypePicker name="cv-doc" value={doc} onChange={setDoc} error={err["doc"]} />
                  <Field id="cv-num" label="Document number" error={err["num"]} hint="Exactly as printed on your document"><Input id="cv-num" value={num} autoComplete="off" onChange={(e) => setNum(e.target.value)} aria-invalid={!!err["num"] || undefined} /></Field>
                  <div><p className="mb-1.5 text-[13px] font-bold">Upload document</p><DocumentDrop id="cv-file" file={file} onFile={setFile} error={err["file"]} /><div className="mt-3"><CaptureTips /></div></div>
                  <label className={`flex cursor-pointer items-start gap-3 rounded-[16px] border-[1.5px] p-3.5 text-[13px] font-semibold transition-colors ${checked ? "border-cobalt bg-ice/60" : err["confirm"] ? "border-destructive/60" : "border-line hover:bg-soft/60"}`}>
                    <input id="demo-verify" type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--cobalt)]" />
                    I confirm the details I submit are accurate.
                  </label>
                  {err["confirm"] && <p className="-mt-3 text-xs font-semibold text-destructive">{err["confirm"]}</p>}
                </div>
              </SettingsCard>
            </form>
          )
        }
        side={
          <>
            <VerificationPerks items={[
              { art: brandArtwork.payout, title: "Payouts", text: "Withdraw what you earn to your bank." },
              { art: brandArtwork.profile, title: "Official character", text: "Personalise your verified Creator Universe character." },
            ]} />
            <SettingsTip title="What you'll need" items={["A clear photo or scan of your ID.", "Your name matching Manage Profile.", "The document number printed on your ID."]} />
            <Link to="/creator/settings/character" className="surface group flex items-center gap-3 p-4 transition-colors hover:border-cobalt-100">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-brand-panel text-lime" aria-hidden="true"><Palette className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold">{approved ? "Personalise official character" : "Explore character styles"}</span><span className="block text-xs text-muted-foreground">Creator Universe</span></span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </>
        }
      />
    </SettingsPage>
  );
}
const notifyGroups = [
  { icon: Bell, title: "How we reach you", description: "Channels for every update.", rows: [["email", "Email notifications", "Account updates by email.", Mail], ["inApp", "In-app notifications", "Updates in your notification menu.", Bell]] },
  { icon: ShoppingBag, title: "Your business", description: "Sales and bookings activity.", rows: [["sales", "Sales updates", "When someone buys your products.", ShoppingBag], ["events", "Session reminders", "Live sessions and coaching bookings.", CalendarClock]] },
  { icon: Megaphone, title: "From Enski", description: "News and product updates.", rows: [["news", "Creator news", "Product and creator updates.", MessageSquareText]] },
] as const;
export function CreatorNotifications() {
  const { state, update } = useCreator();
  const [prefs, setPrefs] = useState(state.notifications);
  const dirty = JSON.stringify(prefs) !== JSON.stringify(state.notifications);
  const on = Object.values(prefs).filter(Boolean).length;
  return (
    <SettingsPage icon={Bell} title="Notifications" description="Choose which updates matter to you." tabs={tabs}>
      <SettingsGrid
        main={
          <>
            {notifyGroups.map((g) => (
              <ToggleGroupCard key={g.title} icon={g.icon} title={g.title} description={g.description}>
                {g.rows.map(([key, title, desc, icon]) => <ToggleRow key={key} id={key} icon={icon} title={title} description={desc} checked={prefs[key]} onChange={(v) => setPrefs({ ...prefs, [key]: v })} />)}
              </ToggleGroupCard>
            ))}
            <div className="profile-savebar" data-dirty={dirty || undefined}>
              <p className="text-sm font-bold">{dirty ? "You have unsaved changes" : "All changes saved"}</p>
              <div className="flex gap-2">
                {dirty && <Button variant="quiet" onClick={() => setPrefs(state.notifications)}>Discard</Button>}
                <Button disabled={!dirty} onClick={() => { update({ notifications: prefs }); toast.success("Notification preferences saved"); }}>Save preferences</Button>
              </div>
            </div>
          </>
        }
        side={<><PreferenceSummary on={on} total={Object.keys(prefs).length} label="Notifications on" /><SettingsTip title="Good to know" items={["Order and payout receipts are always sent.", "Changes apply after you save."]} /></>}
      />
    </SettingsPage>
  );
}
export function CreatorSecurity() {
  const { state, update } = useCreator();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<Record<string, string>>({});
  const [changed, setChanged] = useState(false);
  const dirty = Boolean(current || password || confirm);
  if (changed) return <PasswordUpdated email={state.profile.email} dashboard="/creator/dashboard" onDone={() => setChanged(false)} />;
  return (
    <SettingsPage icon={LockKeyhole} title="Password & security" description="Keep your account secure." tabs={tabs}>
      <SettingsGrid
        main={
          <>
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const er: Record<string, string> = {};
                if (!current) er["current"] = "Enter your current password";
                if (password.length < 8) er["next"] = "Use at least 8 characters";
                if (password !== confirm) er["confirm"] = "Passwords don't match";
                setError(er);
                if (Object.keys(er).length) return;
                setCurrent(""); setPassword(""); setConfirm("");
                setChanged(true);
              }}
            >
              <SettingsCard icon={KeyRound} title="Change password" description="Choose a strong password you don't use anywhere else." footer={<>{dirty && <Button type="button" variant="ghost" onClick={() => { setCurrent(""); setPassword(""); setConfirm(""); setError({}); }}>Cancel</Button>}<Button type="submit">Update password</Button></>}>
                <div className="grid gap-5 sm:max-w-lg">
                  <Field id="demo-current" label="Current password" error={error["current"]}><PasswordInput id="demo-current" value={current} onChange={setCurrent} autoComplete="current-password" invalid={!!error["current"]} /></Field>
                  <Field id="demo-password" label="New password" error={error["next"]}><PasswordInput id="demo-password" value={password} onChange={setPassword} autoComplete="new-password" invalid={!!error["next"]} /></Field>
                  <PasswordStrength value={password} />
                  <Field id="demo-confirm" label="Confirm new password" error={error["confirm"]}><PasswordInput id="demo-confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" invalid={!!error["confirm"]} /></Field>
                </div>
              </SettingsCard>
            </form>
            <ToggleGroupCard icon={ShieldCheck} title="Security preferences" description="Reminders that keep your account healthy.">
              <ToggleRow id="security-reminder" icon={CalendarClock} title="Security check-ups" description="Remind me to review my security settings." checked={state.security.reminder} onChange={(v) => { update({ security: { reminder: v } }); toast.success("Security preference saved"); }} />
            </ToggleGroupCard>
            <SettingsCard icon={Laptop} title="Where you're signed in" description="Devices signed in to your account." bodyClassName="p-0">
              <SessionRow icon={Laptop} title={currentBrowser()} detail="This device · signed in now" current />
            </SettingsCard>
          </>
        }
        side={<SettingsTip icon={ShieldCheck} title="Stay secure" items={["Use a password only for Enski.", "Never share codes or passwords — Enski will never ask.", "Sign out on shared devices."]} />}
      />
    </SettingsPage>
  );
}
const zones = ["Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Africa/Johannesburg", "Africa/Cairo", "UTC", "Europe/London", "Europe/Paris", "America/New_York", "America/Chicago", "America/Los_Angeles", "Asia/Dubai", "Asia/Kolkata"];
function zoneLabel(tz: string) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(new Date());
    const off = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return `${tz === "UTC" ? "UTC" : tz.split("/")[1]?.replace(/_/g, " ")} (${off.replace("GMT", "UTC") || "UTC"})`;
  } catch { return tz; }
}
const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return (h ?? 0) * 60 + (m ?? 0); };
export function CreatorAvailability() {
  const { state, update } = useCreator();
  const [form, setForm] = useState(state.availability);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(form) !== JSON.stringify(state.availability);
  const hours = form.days.reduce((a, d) => a + (d.enabled ? Math.max(0, toMin(d.end) - toMin(d.start)) : 0), 0) / 60;
  const openDays = form.days.filter((d) => d.enabled).length;
  const setDay = (i: number, patch: Partial<(typeof form.days)[number]>) => setForm({ ...form, days: form.days.map((x, n) => (n === i ? { ...x, ...patch } : x)) });
  const copyToAll = (i: number) => { const src = form.days[i]; if (!src) return; setForm({ ...form, days: form.days.map((x) => (x.enabled ? { ...x, start: src.start, end: src.end } : x)) }); toast.success(`Copied ${DAYS[i]} hours to open days`); };
  return (
    <SettingsPage icon={CalendarClock} title="Availability" description="Set the hours people can book your coaching sessions." tabs={tabs}>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const err = validateAvailability(form.days);
          if (err) { setError(err); return; }
          update({ availability: form });
          setError("");
          toast.success("Availability saved");
        }}
      >
        <SettingsGrid
          main={
            <>
              <SettingsCard icon={CalendarClock} title="Weekly hours" description="Turn on the days you take bookings." bodyClassName="p-0">
                <ul className="divide-y">
                  {DAYS.map((day, i) => {
                    const d = form.days[i] ?? { enabled: false, start: "09:00", end: "17:00" };
                    return (
                      <li key={day} className={cn("flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors sm:px-6", d.enabled ? "bg-card" : "bg-soft/40")}>
                        <Switch id={`day-${i}`} checked={d.enabled} onCheckedChange={(v) => setDay(i, { enabled: v })} />
                        <Label htmlFor={`day-${i}`} className="w-24 font-extrabold">{day}</Label>
                        {d.enabled ? (
                          <div className="flex flex-1 flex-wrap items-center gap-2">
                            <Input aria-label={`${day} start time`} type="time" value={d.start} className="h-10 w-[120px]" onChange={(e) => setDay(i, { start: e.target.value })} />
                            <span className="text-xs font-bold text-muted-foreground">to</span>
                            <Input aria-label={`${day} end time`} type="time" value={d.end} className="h-10 w-[120px]" onChange={(e) => setDay(i, { end: e.target.value })} />
                            <button type="button" onClick={() => copyToAll(i)} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold text-cobalt hover:bg-ice" aria-label={`Copy ${day} hours to all open days`}><Copy className="h-3.5 w-3.5" />Copy to all</button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Unavailable</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </SettingsCard>
              <SettingsCard icon={Globe} title="Booking rules" description="Timezone and breaks between sessions.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="avail-timezone" label="Timezone">
                    <FilterSelect label="Time zone" value={form.timezone} onChange={(v) => setForm({ ...form, timezone: v })} className="w-full sm:w-full" options={zones.map((z) => [z, zoneLabel(z)] as [string, string])} />
                  </Field>
                  <Field id="avail-buffer" label="Break between bookings">
                    <FilterSelect label="Break between sessions" value={String(form.buffer)} onChange={(v) => setForm({ ...form, buffer: Number(v) })} className="w-full sm:w-full" options={[["0", "No break"], ["15", "15 minutes"], ["30", "30 minutes"], ["60", "1 hour"]]} />
                  </Field>
                </div>
              </SettingsCard>
              {error && <p role="alert" className="rounded-[14px] border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive">{error}</p>}
              <div className="profile-savebar" data-dirty={dirty || undefined}>
                <p className="text-sm font-bold">{dirty ? "You have unsaved changes" : "All changes saved"}</p>
                <div className="flex gap-2">
                  {dirty && <Button type="button" variant="quiet" onClick={() => { setForm(state.availability); setError(""); }}>Discard</Button>}
                  <Button type="submit">Save availability</Button>
                </div>
              </div>
            </>
          }
          side={
            <section className="surface p-5" aria-label="Week at a glance">
              <p className="text-[13px] font-semibold text-muted-foreground">Week at a glance</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{Number.isInteger(hours) ? hours : hours.toFixed(1)}<span className="text-base text-muted-foreground"> hrs · {openDays} days</span></p>
              <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden="true">
                {DAYS.map((day, i) => {
                  const d = form.days[i];
                  const top = d?.enabled ? (toMin(d.start) / 1440) * 100 : 0;
                  const h = d?.enabled ? Math.max(0, ((toMin(d.end) - toMin(d.start)) / 1440) * 100) : 0;
                  return (
                    <div key={day} className="text-center">
                      <div className="relative h-28 overflow-hidden rounded-[10px] bg-soft">{h > 0 && <span className="absolute inset-x-1 rounded-[6px] bg-cobalt" style={{ top: `${top}%`, height: `${h}%` }} />}</div>
                      <span className="mt-1 block text-[11px] font-bold text-muted-foreground">{day.slice(0, 1)}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Times shown in {zoneLabel(form.timezone)}.</p>
            </section>
          }
        />
      </form>
    </SettingsPage>
  );
}
const creatorIntegrations: IntegrationItem[] = [
  { id: "zoom", name: "Zoom", category: "Video meetings", description: "Create meeting links for live sessions and coaching automatically." },
  { id: "google-meet", name: "Google Meet", category: "Video meetings", description: "Host live sessions and coaching calls on Google Meet." },
  { id: "microsoft-teams", name: "Microsoft Teams", category: "Video meetings", description: "Run workshops and coaching calls for teams that already use Teams." },
  { id: "google-calendar", name: "Google Calendar", category: "Calendar & scheduling", description: "Block booked coaching and live sessions on your calendar." },
  { id: "outlook-calendar", name: "Outlook Calendar", category: "Calendar & scheduling", description: "Keep bookings in sync with your Outlook schedule." },
  { id: "calendly", name: "Calendly", category: "Calendar & scheduling", description: "Use your Calendly availability for coaching and service bookings." },
  { id: "youtube", name: "YouTube", category: "Video hosting", description: "Add unlisted YouTube videos as course lessons and previews." },
  { id: "vimeo", name: "Vimeo", category: "Video hosting", description: "Stream private Vimeo videos inside your courses." },
  { id: "google-drive", name: "Google Drive", category: "Files & content", description: "Attach ebooks, templates and lesson files straight from your Drive." },
  { id: "dropbox", name: "Dropbox", category: "Files & content", description: "Deliver downloadable products from your Dropbox folders." },
  { id: "notion", name: "Notion", category: "Files & content", description: "Share Notion templates and guides with buyers after purchase." },
  { id: "mailchimp", name: "Mailchimp", category: "Email marketing", description: "Add new buyers and subscribers to your Mailchimp audience." },
  { id: "whatsapp", name: "WhatsApp", category: "Community & messaging", description: "Invite buyers to a WhatsApp group or chat with them about orders." },
  { id: "telegram", name: "Telegram", category: "Community & messaging", description: "Give buyers access to your Telegram channel or group." },
  { id: "discord", name: "Discord", category: "Community & messaging", description: "Invite course students into your Discord community." },
  { id: "slack", name: "Slack", category: "Community & messaging", description: "Get a message in your Slack workspace for every new sale." },
  { id: "google-analytics", name: "Google Analytics", category: "Tracking & ads", description: "See storefront and landing page visits in Google Analytics." },
  { id: "meta-pixel", name: "Meta Pixel", category: "Tracking & ads", description: "Measure Facebook and Instagram ads that bring buyers to your pages." },
  { id: "google-tag-manager", name: "Google Tag Manager", category: "Tracking & ads", description: "Add your own tags to your storefront and landing pages." },
  { id: "google-sheets", name: "Google Sheets", category: "Automation", description: "Send each new order and subscriber to a Google Sheet." },
  { id: "zapier", name: "Zapier", category: "Automation", description: "Connect sales, bookings and subscribers to thousands of other apps." },
];
export function CreatorIntegrations() {
  const { state, update } = useCreator();
  const connected = creatorIntegrations.filter((i) => state.integrations.includes(i.id)).length;
  return (
    <SettingsPage icon={Plug} title="Integrations" description="Connect the tools you use in your Creator studio." tabs={tabs} status={<StatusPill tone={connected ? "success" : "neutral"}>{connected} connected</StatusPill>}>
      <IntegrationsHub
        items={creatorIntegrations}
        connectedLabel={(id) => (state.integrations.includes(id) ? "Connected to your studio" : undefined)}
        onConnect={(id) => update((s) => ({ integrations: [...s.integrations.filter((v) => v !== id), id] }))}
        onDisconnect={(id) => update((s) => ({ integrations: s.integrations.filter((v) => v !== id) }))}
      />
    </SettingsPage>
  );
}
