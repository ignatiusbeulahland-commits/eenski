import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { Link } from "@tanstack/react-router";
import { Bell, BellOff, Calendar, CheckCheck, Mail, PenLine, Phone, UserRound, Cloud, Eye, EyeOff, KeyRound, Laptop, MessageCircle, ShieldCheck, Trash2, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PasswordUpdated, ProfileUpdated, changedLabels } from "@/components/shared/outcome";
import { NameSettings } from "@/components/shared/NameSettings";
import { firstWord } from "@/lib/shared/greeting";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Switch } from "@/components/dashboard-ui/switch";
import { EmptyState, PageHeader, Panel, StatusBadge } from "@/components/affiliate/ui";
import { Field, FormActions } from "@/components/affiliate/Field";
import { passwordSchema, profileSchema, type LearnerState } from "@/lib/learner/rules";
import { useLearner } from "@/lib/learner/store";
import { cn } from "@/lib/utils";
import { ProfileChecklist, ProfileHero, ProfileLayout, ProfileSaveBar, ProfileSection } from "@/components/shared/ProfileStudio";
import { shortDate } from "./shared";
import { PasswordInput as KitPasswordInput, PasswordStrength, PreferenceSummary, SessionRow, SettingsCard, SettingsGrid, SettingsPage, SettingsTip, StatusPill, ToggleGroupCard, ToggleRow, currentBrowser } from "@/components/shared/SettingsKit";
import { IntegrationsHub, type IntegrationItem } from "@/components/shared/Integrations";
import { learnerSettings } from "@/lib/learner/nav";
import { CurrencySettings } from "@/components/shared/finance/CurrencySettings";
import { Globe2 } from "lucide-react";
import { Plug as PlugIcon, LockKeyhole, ShoppingBag, CalendarDays, Package, Megaphone, Smartphone } from "lucide-react";

const tabs = learnerSettings.map(({ label, to }) => ({ label, to }));

type Errors<K extends string> = Partial<Record<K, string>>;
const issues = <K extends string>(e: { issues: { path: (string | number)[]; message: string }[] }) => Object.fromEntries([...e.issues].reverse().map((i) => [String(i.path[0]), i.message])) as Errors<K>; // first issue per field wins

export function ProfileSettings() {
  const { state, update } = useLearner();
  const [form, setForm] = useState(state.profile);
  const [updated, setUpdated] = useState<string[] | null>(null);
  const [errors, setErrors] = useState<Errors<"fullName" | "displayName" | "certificateName" | "email" | "phone" | "bio">>({});
  // Names are saved by their own cards; the rest of the form is saved with the Save bar.
  const withSavedNames = (f: typeof form) => ({ ...f, fullName: state.profile.fullName, displayName: state.profile.displayName, certificateName: state.profile.certificateName });
  const dirty = JSON.stringify(withSavedNames(form)) !== JSON.stringify(state.profile);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const p = state.profile;
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const r = profileSchema.safeParse(withSavedNames(form));
    if (!r.success) { setErrors(issues(r.error)); return; }
    setErrors({});
    const next = { ...withSavedNames(form), ...r.data };
    update({ profile: next });
    setForm(next);
    setUpdated(changedLabels(state.profile, next, { email: "Email", phone: "Phone", bio: "Bio" }));
    window.scrollTo({ top: 0 });
  };
  const pick = (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Choose an image file"); return; }
    if (f.size > 1.5 * 1024 * 1024) { toast.error("Choose an image under 1.5 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { const photo = String(reader.result); setForm((v) => ({ ...v, photo })); update((s) => ({ profile: { ...s.profile, photo } })); toast.success("Photo updated"); };
    reader.readAsDataURL(f);
  };
  const removePhoto = () => { setForm({ ...form, photo: "" }); update((s) => ({ profile: { ...s.profile, photo: "" } })); toast.success("Photo removed"); };
  const checks = [
    { label: "Add a profile photo", done: !!p.photo },
    { label: "Choose a display name", done: !!p.displayName.trim() },
    { label: "Add your email address", done: !!p.email.trim() },
    { label: "Add a phone number", done: !!p.phone.trim() },
    { label: "Write a short bio", done: !!p.bio.trim() },
  ];
  if (updated) return <ProfileUpdated name={p.fullName} email={p.email} changes={updated} dashboard="/learner/dashboard" onKeepEditing={() => setUpdated(null)} />;
  const initialsOf = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
  return (
    <div>
      <PageHeader eyebrow="Settings" title="Manage profile" description="How you appear to creators and other learners." />
      <form onSubmit={save} noValidate>
        <ProfileLayout
          hero={
            <ProfileHero
              name={p.displayName.trim() || p.fullName}
              role="Learner"
              tagline={p.bio.trim() ? (p.bio.length > 120 ? `${p.bio.slice(0, 117)}…` : p.bio) : "Keep learning, one course and event at a time."}
              photo={p.photo || undefined}
              initials={initialsOf(p.fullName)}
              chips={[...(p.fullName && p.displayName && p.fullName !== p.displayName ? [{ icon: UserRound, label: p.fullName }] : []), ...(p.email ? [{ icon: Mail, label: p.email }] : [])]}
              checks={checks}
              onPhoto={pick}
              onRemovePhoto={removePhoto}
              photoHint="JPG, PNG or WebP, up to 1.5 MB."
            />
          }
          main={
            <>
              <ProfileSection icon={UserRound} title="Your names" description="Three names, each used in its own place. Changing one never changes the others.">
                <NameSettings
                  certificatesLink="/learner/certificates"
                  onSaved={(n) => {
                    const names = { fullName: n.fullName, displayName: n.displayName || firstWord(n.fullName), certificateName: n.certificateName };
                    update((s) => ({ profile: { ...s.profile, ...names } }));
                    setForm((f) => ({ ...f, ...names }));
                  }}
                />
              </ProfileSection>
              <ProfileSection icon={Phone} title="Contact" description="Your email address and phone number.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="email" label="Email" error={errors.email}><Input id="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} /></Field>
                  <Field id="phone" label="Phone number" error={errors.phone} hint="Optional"><Input id="phone" type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+234 801 234 5678" aria-invalid={!!errors.phone} /></Field>
                </div>
              </ProfileSection>
              <ProfileSection icon={PenLine} title="About you" description="Tell creators what you are learning and why.">
                <Field id="bio" label="Bio" error={errors.bio} hint={`${form.bio.length}/280`}><Textarea id="bio" rows={4} value={form.bio} onChange={set("bio")} placeholder="What are you learning, and why?" aria-invalid={!!errors.bio} /></Field>
              </ProfileSection>
              <ProfileSaveBar dirty={dirty} discardLabel="Cancel" saveLabel="Save" onDiscard={() => { setForm(state.profile); setErrors({}); }} />
            </>
          }
          side={<ProfileChecklist checks={checks} />}
        />
      </form>
    </div>
  );
}

const integrations: IntegrationItem[] = [
  { id: "google-calendar", name: "Google Calendar", category: "Calendars", description: "Add events you register for to your calendar with reminders." },
  { id: "outlook-calendar", name: "Outlook Calendar", category: "Calendars", description: "Keep Enski events alongside your work schedule." },
  { id: "zoom", name: "Zoom", category: "Live sessions", description: "Join online events in one tap from your event page." },
  { id: "google-meet", name: "Google Meet", category: "Live sessions", description: "Open Google Meet sessions and coaching calls from your event page." },
  { id: "microsoft-teams", name: "Microsoft Teams", category: "Live sessions", description: "Join Teams workshops straight from your registrations." },
  { id: "google-drive", name: "Google Drive", category: "Files & notes", description: "Save downloadable resources straight to your Drive." },
  { id: "dropbox", name: "Dropbox", category: "Files & notes", description: "Keep ebooks and templates you own in your Dropbox." },
  { id: "onedrive", name: "OneDrive", category: "Files & notes", description: "Save your resources and certificates to OneDrive." },
  { id: "notion", name: "Notion", category: "Files & notes", description: "Duplicate Notion templates you buy into your own workspace." },
  { id: "linkedin", name: "LinkedIn", category: "Career", description: "Add earned certificates to your LinkedIn profile in a few taps." },
  { id: "whatsapp", name: "WhatsApp", category: "Reminders & communities", description: "Get event reminders as WhatsApp messages." },
  { id: "telegram", name: "Telegram", category: "Reminders & communities", description: "Get event reminders and join creators' Telegram groups." },
  { id: "discord", name: "Discord", category: "Reminders & communities", description: "Join the Discord communities that come with your courses." },
];
export function IntegrationSettings() {
  const { state, update } = useLearner();
  const connected = integrations.filter((i) => state.integrations[i.id]).length;
  return (
    <SettingsPage icon={PlugIcon} title="Integrations" description="Connect the tools you already use for learning." tabs={tabs} status={<StatusPill tone={connected ? "success" : "neutral"}>{connected} connected</StatusPill>}>
      <IntegrationsHub
        items={integrations}
        connectedLabel={(id) => { const at = state.integrations[id]; return at ? `Connected ${shortDate(at)}` : undefined; }}
        onConnect={(id) => update((s) => ({ integrations: { ...s.integrations, [id]: new Date().toISOString() } }))}
        onDisconnect={(id) => update((s) => { const next = { ...s.integrations }; delete next[id]; return { integrations: next }; })}
      />
    </SettingsPage>
  );
}

type PrefKey = keyof LearnerState["prefs"];
const prefGroups: { icon: typeof Bell; title: string; description: string; rows: { key: PrefKey; label: string; description: string; icon: typeof Bell }[] }[] = [
  { icon: Bell, title: "How we reach you", description: "Where updates appear.", rows: [{ key: "inApp", label: "In-app notifications", description: "Show updates in the bell at the top of your dashboard", icon: Bell }] },
  { icon: CalendarDays, title: "Your learning", description: "Events, purchases and resources.", rows: [
    { key: "eventReminders", label: "Event reminders", description: "Registrations and reminders before events you've joined", icon: CalendarDays },
    { key: "purchaseUpdates", label: "Purchase updates", description: "Order confirmations, pending transfers and receipts", icon: ShoppingBag },
    { key: "productUpdates", label: "Product updates", description: "When creators update resources you own", icon: Package },
  ] },
  { icon: Megaphone, title: "From Enski", description: "News and new features.", rows: [{ key: "announcements", label: "General announcements", description: "News and features from Enski", icon: Megaphone }] },
];
export function NotificationSettings() {
  const { state, update } = useLearner();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const list = state.notifications.filter((n) => filter === "all" || !n.read);
  const unread = state.notifications.filter((n) => !n.read).length;
  const keys = prefGroups.flatMap((g) => g.rows.map((r) => r.key));
  const on = keys.filter((k) => state.prefs[k]).length;
  return (
    <SettingsPage icon={Bell} title="Notifications" description="Your inbox and how you'd like to hear from Enski." tabs={tabs}>
      <SettingsGrid
        main={
          <>
            {prefGroups.map((g) => (
              <ToggleGroupCard key={g.title} icon={g.icon} title={g.title} description={g.description}>
                {g.rows.map((r) => <ToggleRow key={r.key} id={`pref-${r.key}`} icon={r.icon} title={r.label} description={r.description} checked={state.prefs[r.key]} onChange={(v) => { update((s) => ({ prefs: { ...s.prefs, [r.key]: v } })); toast.success(`${r.label} ${v ? "on" : "off"}`); }} />)}
              </ToggleGroupCard>
            ))}
            <SettingsCard icon={Bell} title="Inbox" description={`${unread} unread`} bodyClassName="p-0" actions={
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-full border p-0.5 text-xs font-bold">{(["all", "unread"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={cn("rounded-full px-3 py-1", filter === f ? "bg-cobalt text-primary-foreground" : "text-muted-foreground")}>{f === "all" ? "All" : "Unread"}</button>)}</div>
                {unread > 0 && <Button size="sm" variant="ghost" onClick={() => update((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }))}><CheckCheck /> Mark all read</Button>}
              </div>
            }>
              {list.length ? (
                <ul className="divide-y">
                  {list.map((n) => (
                    <li key={n.id} className={cn("flex gap-3 p-4 sm:px-6", !n.read && "bg-ice/50")}>
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-line" : "bg-cobalt")} aria-hidden="true" />
                      <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="text-xs text-muted-foreground">{n.body}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(n.date).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                      <Button size="sm" variant="ghost" className="shrink-0 text-xs" onClick={() => update((s) => ({ notifications: s.notifications.map((x) => (x.id === n.id ? { ...x, read: !x.read } : x)) }))}>{n.read ? "Mark unread" : "Mark read"}</Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState compact icon={filter === "unread" && state.notifications.length ? Bell : BellOff} title={filter === "unread" && state.notifications.length ? "You're all caught up" : "No notifications yet"} description="Updates about purchases, events and achievements appear here." />
              )}
            </SettingsCard>
          </>
        }
        side={<><PreferenceSummary on={on} total={keys.length} label="Notifications on" /><SettingsTip title="Good to know" items={["Changes save instantly.", "Receipts for purchases are always sent."]} /></>}
      />
    </SettingsPage>
  );
}

export function SecuritySettings() {
  const { state, update, reset } = useLearner();
  // Passwords live only in this component's memory and are cleared after submit.
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Errors<"current" | "next" | "confirm">>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [changed, setChanged] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = passwordSchema.safeParse(pw);
    if (!r.success) { setErrors(issues(r.error)); return; }
    setErrors({});
    setPw({ current: "", next: "", confirm: "" });
    update((s) => ({ security: { ...s.security, passwordUpdatedAt: new Date().toISOString() } }));
    setChanged(true);
  };
  const dirty = Boolean(pw.current || pw.next || pw.confirm);
  if (changed) return <PasswordUpdated email={state.profile.email} dashboard="/learner/dashboard" onDone={() => setChanged(false)} />;
  return (
    <SettingsPage icon={LockKeyhole} title="Password & security" description="Keep your learner account protected." tabs={tabs}>
      <SettingsGrid
        main={
          <>
            <form onSubmit={submit} noValidate>
              <SettingsCard icon={KeyRound} title="Change password" description={state.security.passwordUpdatedAt ? `Last updated ${shortDate(state.security.passwordUpdatedAt)}` : "At least 8 characters with a letter and a number."} footer={<>{dirty && <Button type="button" variant="ghost" onClick={() => { setPw({ current: "", next: "", confirm: "" }); setErrors({}); }}>Cancel</Button>}<Button type="submit">Update password</Button></>}>
                <div className="grid gap-5 sm:max-w-lg">
                  <Field id="pw-current" label="Current password" error={errors.current}><KitPasswordInput id="pw-current" value={pw.current} onChange={(v) => setPw({ ...pw, current: v })} autoComplete="current-password" invalid={!!errors.current} /></Field>
                  <Field id="pw-next" label="New password" error={errors.next}><KitPasswordInput id="pw-next" value={pw.next} onChange={(v) => setPw({ ...pw, next: v })} autoComplete="new-password" invalid={!!errors.next} /></Field>
                  <PasswordStrength value={pw.next} />
                  <Field id="pw-confirm" label="Confirm new password" error={errors.confirm}><KitPasswordInput id="pw-confirm" value={pw.confirm} onChange={(v) => setPw({ ...pw, confirm: v })} autoComplete="new-password" invalid={!!errors.confirm} /></Field>
                </div>
              </SettingsCard>
            </form>
            <ToggleGroupCard icon={ShieldCheck} title="Sign-in protection" description="Extra checks when you sign in.">
              {([["twoFactor", "Two-step verification", "Ask for a code when signing in on a new device", Smartphone], ["loginAlerts", "Sign-in alerts", "Let me know about new sign-ins", Bell]] as const).map(([k, l, d, icon]) => (
                <ToggleRow key={k} id={`sec-${k}`} icon={icon} title={l} description={d} checked={state.security[k]} onChange={(v) => { update((s) => ({ security: { ...s.security, [k]: v } })); toast.success(`${l} ${v ? "on" : "off"}`); }} />
              ))}
            </ToggleGroupCard>
            <SettingsCard icon={Laptop} title="Where you're signed in" description="Devices signed in to your account." bodyClassName="p-0">
              <SessionRow icon={Laptop} title={currentBrowser()} detail="This device · signed in now" current />
            </SettingsCard>
            <SettingsCard icon={Trash2} title="Account controls" description="Reset clears your learner purchases, progress, achievements and settings. Your creator and affiliate workspaces stay as they are.">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild><Link to="/learner/help">Contact support</Link></Button>
                <Button variant="destructive" onClick={() => setConfirmReset(true)}><Trash2 /> Reset learner workspace</Button>
              </div>
            </SettingsCard>
          </>
        }
        side={<SettingsTip icon={ShieldCheck} title="Stay secure" items={["Use a password only for Enski.", "Never share codes or passwords — Enski will never ask.", "Sign out on shared devices."]} />}
      />
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        art={brandArtwork.settings}
        eyebrow="Account data"
        title="Reset your learner workspace?"
        description="This returns your learner account to a brand-new state."
        confirmLabel="Reset data"
        confirmIcon={<Trash2 />}
        onConfirm={() => { reset(); toast.success("Learner workspace reset", { description: "You're starting fresh. Browse courses to begin again." }); }}
      >
        <ConfirmNote>Your purchases, progress, achievements and settings are cleared. Creator and Affiliate data aren't affected. This can't be undone.</ConfirmNote>
      </ConfirmDialog>
    </SettingsPage>
  );
}

export function CurrencyPreferences() {
  const { state, update } = useLearner();
  return (
    <SettingsPage icon={Globe2} title="Country & currency" description="Where you live and the currency estimates are shown in." tabs={tabs} status={<StatusPill tone="neutral">Estimates in {state.finance.displayCurrency}</StatusPill>}>
      <CurrencySettings prefs={state.finance} onChange={(finance) => update({ finance })} preferred={null} earning={[]} payouts={false} />
    </SettingsPage>
  );
}
