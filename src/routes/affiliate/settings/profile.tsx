import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProfileUpdated, changedLabels } from "@/components/shared/outcome";
import { NameSettings } from "@/components/shared/NameSettings";
import { splitName, useIdentity } from "@/lib/shared/identity";
import { Input } from "@/components/dashboard-ui/input";
import { Field } from "@/components/affiliate/Field";
import { PageHeader } from "@/components/affiliate/ui";
import { ProfileChecklist, ProfileHero, ProfileLayout, ProfileSaveBar, ProfileSection } from "@/components/shared/ProfileStudio";
import { useAffiliate } from "@/lib/affiliate/store";
import { meta } from "@/lib/affiliate/meta";
import { validPhone } from "@/lib/affiliate/rules";

export const Route = createFileRoute("/affiliate/settings/profile")({
  head: () => meta("Manage Profile", "Update your name, contact details and profile photo."),
  component: Profile,
});

function Profile() {
  const { state, update } = useAffiliate();
  const me = useIdentity();
  const [f, setF] = useState(state.profile);
  const [updated, setUpdated] = useState<string[] | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  // Names are saved by their own cards; the Save bar covers contact details and location.
  const withSavedNames = (v: typeof f) => ({ ...v, firstName: state.profile.firstName, lastName: state.profile.lastName });
  const dirty = JSON.stringify(withSavedNames(f)) !== JSON.stringify(state.profile);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const p = state.profile;
  const name = me?.fullName || `${p.firstName} ${p.lastName}`.trim();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email)) er["email"] = "Enter a valid email address";
    if (!validPhone(f.phone)) er["phone"] = "Enter a valid phone number, e.g. +234 801 234 5678";
    setErr(er);
    if (Object.keys(er).length) return;
    const next = withSavedNames(f);
    update({ profile: next });
    setUpdated(changedLabels(state.profile, next, { email: "Email", phone: "Phone", location: "Location" }));
    window.scrollTo({ top: 0 });
  };
  const onPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Choose an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2 MB"); return; }
    const r = new FileReader();
    r.onload = () => { const photo = String(r.result); setF((v) => ({ ...v, photo })); update({ profile: { ...state.profile, photo } }); toast.success("Profile photo updated"); };
    r.readAsDataURL(file);
  };
  const removePhoto = () => { setF({ ...f, photo: undefined }); update({ profile: { ...state.profile, photo: undefined } }); toast.success("Photo removed"); };
  const checks = [
    { label: "Add a profile photo", done: !!p.photo },
    { label: "Add your full name", done: !!name },
    { label: "Add your email address", done: !!p.email.trim() },
    { label: "Add a phone number", done: !!p.phone.trim() },
    { label: "Add your location", done: !!p.location.trim() },
  ];

  if (updated) return <ProfileUpdated name={name} email={p.email} changes={updated} dashboard="/affiliate/dashboard" onKeepEditing={() => setUpdated(null)} />;
  return (
    <div>
      <PageHeader eyebrow="Settings" title="Manage profile" description="This is how you appear across Enski." />
      <form onSubmit={save} noValidate>
        <ProfileLayout
          hero={
            <ProfileHero
              name={me?.displayName || name}
              role="Affiliate"
              tagline="Share products you love and earn when people buy."
              photo={p.photo}
              initials={name.split(" ").filter((_, i, all) => i === 0 || i === all.length - 1).map((w) => w[0]?.toUpperCase() ?? "").join("")}
              chips={[...(p.email ? [{ icon: Mail, label: p.email }] : []), ...(p.location ? [{ icon: MapPin, label: p.location }] : [])]}
              checks={checks}
              onPhoto={onPhoto}
              onRemovePhoto={removePhoto}
              photoHint="JPG or PNG, up to 2 MB."
            />
          }
          main={
            <>
              <ProfileSection icon={UserRound} title="Your names" description="Your account, display and certificate names. Change any one without touching the others.">
                <NameSettings
                  onSaved={(n) => {
                    const names = splitName(n.fullName);
                    update((s) => ({ profile: { ...s.profile, ...names } }));
                    setF((v) => ({ ...v, ...names }));
                  }}
                />
              </ProfileSection>
              <ProfileSection icon={Phone} title="Contact" description="Your email address and phone number.">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="em" label="Email address" error={err["email"]}><Input id="em" type="email" value={f.email} onChange={set("email")} aria-invalid={!!err["email"]} autoComplete="email" /></Field>
                  <Field id="ph" label="Phone number" error={err["phone"]} hint="Optional"><Input id="ph" type="tel" placeholder="+234 801 234 5678" value={f.phone} onChange={set("phone")} autoComplete="tel" /></Field>
                </div>
              </ProfileSection>
              <ProfileSection icon={MapPin} title="Location" description="The city and country you are based in.">
                <Field id="loc" label="Location" hint="City and country"><Input id="loc" placeholder="Lagos, Nigeria" value={f.location} onChange={set("location")} autoComplete="address-level2" /></Field>
              </ProfileSection>
              <ProfileSaveBar dirty={dirty} onDiscard={() => { setF(state.profile); setErr({}); }} discardLabel="Cancel" />
            </>
          }
          side={<ProfileChecklist checks={checks} />}
        />
      </form>
    </div>
  );
}
