import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

import { ApplyDialog, type ApplyResult } from "@/components/ambassador/ApplyDialog";
import { Choice, Field, SelectBox, SkillPicker, inputClass, useApplyRequests } from "@/components/ambassador/kit";
import { Button } from "@/components/ui/button";
import {
  CAMPUS_ROLES,
  checkCampusApplication,
  roleLabel,
  saveApplication,
  type FieldErrors,
  type FormValues,
} from "@/lib/ambassador/applications";
import { readLocal, writeLocal } from "@/lib/demo/local";

import { EXEC_ROLES, LEVEL_OPTIONS, MOTIVATIONS } from "./data";
import { DEPARTMENTS, FACULTIES, SCHOOLS } from "./schools";
import { SKILL_CATEGORIES } from "./skills";

const DRAFT_KEY = "enski:demo:campus-application-draft";
const EMPTY: FormValues = {
  role: "", executive_role: "", full_name: "", phone: "", email: "", school: "", level: "", faculty: "", department: "",
  motivation: "", leadership_experience: "", available_to_lead: "", online_meetings: "", social_link: "",
  has_skill: "", skill_name: "", skill_level: "", skill_to_learn: "",
};
const SKILL_GROUPS = Object.entries(SKILL_CATEGORIES);
const ALL_SCHOOLS = Object.values(SCHOOLS).flat();

/** The campus application pop-up, opened by any "apply" button on the page. */
export function CampusApply() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setF({ ...EMPTY, ...readLocal<FormValues>(DRAFT_KEY, {}) });
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) writeLocal(DRAFT_KEY, f);
  }, [f, loaded]);

  useApplyRequests((role) => {
    if (role && role in CAMPUS_ROLES) setF((p) => ({ ...p, role }));
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
    const checked = checkCampusApplication(f);
    if (!checked.ok) {
      setErrors(checked.errors);
      const first = Object.keys(checked.errors)[0];
      if (first) document.getElementById(first)?.focus();
      return;
    }
    setErrors({});
    setBusy(true);
    const { status, application } = await saveApplication("campus", checked.values);
    setBusy(false);
    setResult({
      firstName: application.fullName.split(" ")[0] ?? "",
      updated: status === "updated",
      rows: [
        ["Role", roleLabel("campus", application.role)],
        ["School", application.details["school"] ?? ""],
        ["Email", application.email],
      ],
      next: ["We review your application", "Shortlisted applicants get a call or WhatsApp message", "We help you get started and introduce you to your campus team"],
    });
  }

  const role = v("role");
  return (
    <ApplyDialog
      open={open}
      onOpenChange={setOpen}
      eyebrow="Application"
      title={`${role ? roleLabel("campus", role) : "Dreamers Crew"} application`}
      intro="Choose your role first so we only ask the questions that apply to you."
      result={result}
      onAgain={() => setResult(null)}
    >
      <form onSubmit={submit} noValidate className="grid gap-4">
        <Field id="role" label="Role you're applying for" error={err("role")}>
          <SelectBox id="role" value={role} onChange={set("role")} placeholder="Choose a role" invalid={!!err("role")}
            options={Object.entries(CAMPUS_ROLES) as [string, string][]} />
        </Field>
        {role === "executive_team" ? (
          <Field id="executive_role" label="Which executive role interests you?" error={err("executive_role")}>
            <SelectBox id="executive_role" value={v("executive_role")} onChange={set("executive_role")} placeholder="Choose an executive role"
              invalid={!!err("executive_role")} options={EXEC_ROLES} />
          </Field>
        ) : null}

        <p className="eyebrow mt-2 text-sky-text">About you</p>
        <Field id="full_name" label="Full name" error={err("full_name")}>
          <input id="full_name" className={inputClass} placeholder="Your full name" autoComplete="name" maxLength={120} value={v("full_name")} onChange={on("full_name")} {...inv("full_name")} />
        </Field>
        <Field id="phone" label="Phone number / WhatsApp" error={err("phone")}>
          <input id="phone" className={inputClass} type="tel" placeholder="0800 000 0000" autoComplete="tel" maxLength={22} value={v("phone")} onChange={on("phone")} {...inv("phone")} />
        </Field>
        <Field id="email" label="Email" error={err("email")}>
          <input id="email" className={inputClass} type="email" placeholder="you@example.com" autoComplete="email" maxLength={255} value={v("email")} onChange={on("email")} {...inv("email")} />
        </Field>
        <Field id="school" label="School / university" error={err("school")} hint="Start typing to pick from the list, or type your own.">
          <input id="school" list="campus-schools" className={inputClass} placeholder="Name of your university" maxLength={160} value={v("school")} onChange={on("school")} {...inv("school")} />
          <datalist id="campus-schools">{ALL_SCHOOLS.map((s) => <option key={s} value={s} />)}</datalist>
        </Field>
        <Field id="level" label="Level" error={err("level")}>
          <SelectBox id="level" value={v("level")} onChange={set("level")} placeholder="Choose your level" invalid={!!err("level")} options={LEVEL_OPTIONS} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="faculty" label="Faculty" error={err("faculty")}>
            <input id="faculty" list="campus-faculties" className={inputClass} placeholder="e.g. Management Sciences" maxLength={120} value={v("faculty")} onChange={on("faculty")} {...inv("faculty")} />
            <datalist id="campus-faculties">{FACULTIES.map((s) => <option key={s} value={s} />)}</datalist>
          </Field>
          <Field id="department" label="Department" error={err("department")}>
            <input id="department" list="campus-departments" className={inputClass} placeholder="e.g. Economics" maxLength={120} value={v("department")} onChange={on("department")} {...inv("department")} />
            <datalist id="campus-departments">{DEPARTMENTS.map((s) => <option key={s} value={s} />)}</datalist>
          </Field>
        </div>
        <Field id="motivation" label="Why do you want to be part of the initiative?" error={err("motivation")}>
          <SelectBox id="motivation" value={v("motivation")} onChange={set("motivation")} placeholder="Choose one" invalid={!!err("motivation")} options={MOTIVATIONS} />
        </Field>

        {role === "campus_director" ? (
          <>
            <p className="eyebrow mt-2 text-sky-text">Campus director questions</p>
            <Choice name="leadership_experience" legend="Do you have any leadership experience?" options={["Yes", "No"]} value={v("leadership_experience")} onChange={set("leadership_experience")} error={err("leadership_experience")} />
            <Choice name="available_to_lead" legend="Are you available to lead your school?" options={["Yes", "No"]} value={v("available_to_lead")} onChange={set("available_to_lead")} error={err("available_to_lead")} />
            <Choice name="online_meetings" legend="Are you available for online meetings from time to time?" options={["Yes", "No"]} value={v("online_meetings")} onChange={set("online_meetings")} error={err("online_meetings")} />
            <Field id="social_link" label="A link to one of your social media profiles" optional error={err("social_link")}>
              <input id="social_link" type="url" className={inputClass} placeholder="https://instagram.com/yourname" maxLength={300} value={v("social_link")} onChange={on("social_link")} {...inv("social_link")} />
            </Field>
          </>
        ) : null}

        <p className="eyebrow mt-2 text-sky-text">Skills</p>
        <Choice name="has_skill" legend="Do you have a skill?" options={["Yes", "No"]} value={v("has_skill")} onChange={set("has_skill")} error={err("has_skill")} />
        {v("has_skill") === "Yes" ? (
          <>
            <Field id="skill_name" label="What skill do you have?" error={err("skill_name")}>
              <SkillPicker id="skill_name" groups={SKILL_GROUPS} value={v("skill_name")} onChange={set("skill_name")} invalid={!!err("skill_name")} />
            </Field>
            <Field id="skill_level" label="How good are you at it?" error={err("skill_level")}>
              <SelectBox id="skill_level" value={v("skill_level")} onChange={set("skill_level")} placeholder="Choose your skill level" invalid={!!err("skill_level")} options={["Beginner", "Intermediate", "Advanced"]} />
            </Field>
          </>
        ) : v("has_skill") === "No" ? (
          <Field id="skill_to_learn" label="What skill would you like to learn?" optional>
            <SkillPicker id="skill_to_learn" groups={SKILL_GROUPS} value={v("skill_to_learn")} onChange={set("skill_to_learn")} />
          </Field>
        ) : null}

        {Object.keys(errors).length ? (
          <p role="alert" className="text-[13px] font-semibold text-destructive">Please check the highlighted answers.</p>
        ) : null}
        <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
          {busy ? "Submitting…" : "Submit application"} {!busy && <ArrowRight />}
        </Button>
        <p className="text-center text-xs text-muted-foreground">Your answers are kept on this device while you fill them in.</p>
      </form>
    </ApplyDialog>
  );
}
