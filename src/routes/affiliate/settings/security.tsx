import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, Laptop, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Field } from "@/components/affiliate/Field";
import { PasswordInput, PasswordStrength, SessionRow, SettingsCard, SettingsGrid, SettingsPage, SettingsTip, currentBrowser } from "@/components/shared/SettingsKit";
import { settingsTabs } from "@/lib/affiliate/nav";
import { meta } from "@/lib/affiliate/meta";
import { useAffiliate } from "@/lib/affiliate/store";
import { PasswordUpdated } from "@/components/shared/outcome";

export const Route = createFileRoute("/affiliate/settings/security")({
  head: () => meta("Password & Security", "Change your password and review active sessions."),
  component: Security,
});

function Security() {
  const [cur, setCur] = useState(""); const [nw, setNw] = useState(""); const [conf, setConf] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const [changed, setChanged] = useState(false);
  const { state } = useAffiliate();
  const meets = nw.length >= 8 && /\d/.test(nw) && /[A-Z]/.test(nw);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!cur) er["cur"] = "Enter your current password";
    if (!meets) er["nw"] = "Use 8+ characters with a number and an uppercase letter";
    if (nw !== conf) er["conf"] = "Passwords don't match";
    setErr(er);
    if (!Object.keys(er).length) setConfirm(true);
  };
  const dirty = Boolean(cur || nw || conf);
  if (changed) return <PasswordUpdated email={state.profile.email} dashboard="/affiliate/dashboard" onDone={() => setChanged(false)} />;
  return (
    <SettingsPage icon={Lock} title="Password & security" description="Keep your affiliate account secure." tabs={settingsTabs}>
      <SettingsGrid
        main={
          <>
            <form onSubmit={submit} noValidate>
              <SettingsCard icon={KeyRound} title="Change password" description="Use 8+ characters with a number and an uppercase letter." footer={<>{dirty && <Button type="button" variant="ghost" onClick={() => { setCur(""); setNw(""); setConf(""); setErr({}); }}>Cancel</Button>}<Button type="submit">Update password</Button></>}>
                <div className="grid gap-5 sm:max-w-lg">
                  <Field id="c" label="Current password" error={err["cur"]}><PasswordInput id="c" value={cur} onChange={setCur} autoComplete="current-password" invalid={!!err["cur"]} /></Field>
                  <Field id="n" label="New password" error={err["nw"]}><PasswordInput id="n" value={nw} onChange={setNw} autoComplete="new-password" invalid={!!err["nw"]} /></Field>
                  <PasswordStrength value={nw} />
                  <Field id="cf" label="Confirm new password" error={err["conf"]}><PasswordInput id="cf" value={conf} onChange={setConf} autoComplete="new-password" invalid={!!err["conf"]} /></Field>
                </div>
              </SettingsCard>
            </form>
            <SettingsCard icon={Laptop} title="Where you're signed in" description="Devices signed in to your account." bodyClassName="p-0">
              <SessionRow icon={Laptop} title={currentBrowser()} detail="This device · signed in now" current />
            </SettingsCard>
          </>
        }
        side={<SettingsTip icon={ShieldCheck} title="Stay secure" items={["Use a password only for Enski.", "Never share codes or passwords — Enski will never ask.", "Sign out on shared devices."]} />}
      />
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        art={brandArtwork.lock}
        eyebrow="Security"
        tone="default"
        title="Update your password?"
        description="You'll be signed out of other devices."
        confirmLabel="Update password"
        confirmIcon={<KeyRound />}
        onConfirm={() => { setCur(""); setNw(""); setConf(""); setChanged(true); }}
      >
        <ConfirmNote>Use your new password next time you sign in on any device.</ConfirmNote>
      </ConfirmDialog>
    </SettingsPage>
  );
}
