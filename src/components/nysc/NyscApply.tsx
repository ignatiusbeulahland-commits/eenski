import { useState } from "react";
import { ArrowRight } from "lucide-react";

import { ApplyDialog, type ApplyResult } from "@/components/ambassador/ApplyDialog";
import { Field, SelectBox, SkillPicker, inputClass, useApplyRequests } from "@/components/ambassador/kit";
import { Button } from "@/components/ui/button";
import {
  NYSC_ROLES,
  checkNyscApplication,
  roleLabel,
  saveApplication,
  type FieldErrors,
  type FormValues,
} from "@/lib/ambassador/applications";
import { cn } from "@/lib/utils";

import { NYSC_EXEC_ROLES, REASONS, SKILL_LEVELS, STATES } from "./data";
import { SKILL_GROUPS } from "./skills";

const EMPTY: FormValues = {
  role: "", executive_role: "", full_name: "", phone: "", email: "", state: "", batch: "", cds_group: "", course: "",
  reason: "", has_skill: "", skill: "", skill_level: "", desired_skill: "", social_link: "",
};

/** The NYSC application pop-up, opened by any "apply" or "join" button on the page. */
export function NyscApply() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApplyResult | null>(null);

  useApplyRequests((role) => {
    if (role && role in NYSC_ROLES) setF((p) => ({ ...p, role }));
    setResult(null);
    setOpen(true);
  });

  const v = (k: string) => f[k] ?? "";
  const set = (k: string) => (v: string) => setF((p) => ({ ...p, [k]: v }));
  const on = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => set(k)(e.target.value);
  const err = (k: string) => errors[k];
  const inv = (k: string) => (errors[k] ? { "aria-invalid": true, "aria-describedby": `${k}-error` } : {});

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const checked = checkNyscApplication(f);
    if (!checked.ok) {
      setErrors(checked.errors);
      const first = Object.keys(checked.errors)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    setBusy(true);
    const { status, application } = await saveApplication("nysc", checked.values);
    setBusy(false);
    setResult({
      firstName: application.fullName.split(" ")[0] ?? "",
      updated: status === "updated",
      rows: [
        ["Role", roleLabel("nysc", application.role)],
        ["State of service", application.details["state"] ?? ""],
        ["Email", application.email],
      ],
      next: ["We review your application", "We reach you by WhatsApp or email", "You meet your corps community and get started"],
    });
  }

  const role = v("role");
  return (
    <ApplyDialog
      open={open}
      onOpenChange={setOpen}
      eyebrow="Application"
      title="Let's do this."
      intro="One short form for the Enski NYSC Initiative. It takes about two minutes."
      result={result}
      onAgain={() => setResult(null)}
    >
      <form onSubmit={submit} noValidate className="grid gap-4">
        <Field id="role" label="Role you're applying for" error={err("role")}>
          <SelectBox id="role" value={role} onChange={set("role")} placeholder="Choose a role" invalid={!!err("role")}
            options={Object.entries(NYSC_ROLES) as [string, string][]} />
        </Field>
        {role === "nysc_executive" ? (
          <fieldset>
            <legend className="mb-1.5 text-sm font-bold text-ink">Choose your executive team role</legend>
            <div className="grid gap-2">
              {NYSC_EXEC_ROLES.map((r) => (
                <label
                  key={r}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 text-[15px] font-semibold transition-colors focus-within:ring-[3px] focus-within:ring-sky-200",
                    v("executive_role") === r ? "border-brand bg-ice text-brand dark:bg-cobalt/30" : "border-line text-ink hover:border-brand",
                  )}
                >
                  <input type="radio" name="executive_role" value={r} checked={v("executive_role") === r} onChange={() => set("executive_role")(r)} className="size-4 accent-[var(--brand)]" />
                  {r}
                </label>
              ))}
            </div>
            {err("executive_role") ? <p className="mt-1 text-[13px] font-semibold text-destructive">{err("executive_role")}</p> : null}
          </fieldset>
        ) : null}

        <Field id="full_name" label="Full name" error={err("full_name")}>
          <input id="full_name" className={inputClass} placeholder="Your full name" autoComplete="name" maxLength={120} value={v("full_name")} onChange={on("full_name")} {...inv("full_name")} />
        </Field>
        <Field id="phone" label="Phone number / WhatsApp" error={err("phone")}>
          <input id="phone" className={inputClass} type="tel" placeholder="0800 000 0000" autoComplete="tel" maxLength={22} value={v("phone")} onChange={on("phone")} {...inv("phone")} />
        </Field>
        <Field id="email" label="Email" error={err("email")}>
          <input id="email" className={inputClass} type="email" placeholder="you@example.com" autoComplete="email" maxLength={255} value={v("email")} onChange={on("email")} {...inv("email")} />
        </Field>
        <Field id="state" label="State of service" error={err("state")}>
          <SelectBox id="state" value={v("state")} onChange={set("state")} placeholder="Choose your state" invalid={!!err("state")} options={STATES} />
        </Field>
        <Field id="batch" label="NYSC batch / stream" optional>
          <input id="batch" className={inputClass} placeholder="e.g. 2026 Batch B Stream I" maxLength={80} value={v("batch")} onChange={on("batch")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="cds_group" label="CDS group" optional>
            <input id="cds_group" className={inputClass} placeholder="e.g. Environmental" maxLength={120} value={v("cds_group")} onChange={on("cds_group")} />
          </Field>
          <Field id="course" label="Course / discipline" optional>
            <input id="course" className={inputClass} placeholder="e.g. Computer Science" maxLength={120} value={v("course")} onChange={on("course")} />
          </Field>
        </div>
        <Field id="reason" label="Why do you want to be part of the initiative?" error={err("reason")}>
          <SelectBox id="reason" value={v("reason")} onChange={set("reason")} placeholder="Choose one" invalid={!!err("reason")} options={REASONS} />
        </Field>

        <fieldset>
          <legend className="mb-1.5 text-sm font-bold text-ink">Do you have a skill?</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["yes", "no"] as const).map((o) => (
              <Button key={o} type="button" variant={v("has_skill") === o ? "default" : "outline"} aria-pressed={v("has_skill") === o}
                className="capitalize" onClick={() => set("has_skill")(o)}>
                {o}
              </Button>
            ))}
          </div>
          {err("has_skill") ? <p className="mt-1 text-[13px] font-semibold text-destructive">{err("has_skill")}</p> : null}
        </fieldset>
        {v("has_skill") === "yes" ? (
          <>
            <Field id="skill" label="What skill?" optional>
              <SkillPicker id="skill" groups={SKILL_GROUPS} value={v("skill")} onChange={set("skill")} />
            </Field>
            <Field id="skill_level" label="Skill level" optional>
              <SelectBox id="skill_level" value={v("skill_level")} onChange={set("skill_level")} placeholder="Choose your level" options={SKILL_LEVELS} />
            </Field>
          </>
        ) : v("has_skill") === "no" ? (
          <Field id="desired_skill" label="What skill do you want to learn?" optional>
            <SkillPicker id="desired_skill" groups={SKILL_GROUPS} value={v("desired_skill")} onChange={set("desired_skill")} />
          </Field>
        ) : null}
        <Field id="social_link" label="A link to one of your social media profiles" optional error={err("social_link")}>
          <input id="social_link" className={inputClass} type="url" placeholder="https://instagram.com/yourname" maxLength={300} value={v("social_link")} onChange={on("social_link")} {...inv("social_link")} />
        </Field>

        {Object.keys(errors).length ? (
          <p role="alert" className="text-[13px] font-semibold text-destructive">Please check the highlighted answers.</p>
        ) : null}
        <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
          {busy ? "Submitting…" : "Submit application"} {!busy && <ArrowRight />}
        </Button>
      </form>
    </ApplyDialog>
  );
}
