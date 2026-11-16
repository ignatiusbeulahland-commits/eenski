import { z } from "zod";

import { demoId, readLocal, simulateDelay, writeLocal } from "@/lib/demo/local";

/**
 * Simulated applications for the two ambassador programmes (Dreamers Campus
 * Initiative and Enski NYSC Initiative). Nothing is sent: each application is
 * saved on this device only, one per email per programme.
 */

export type Programme = "campus" | "nysc";
export type FormValues = Record<string, string>;
export type FieldErrors = Record<string, string>;

export const APPLICATIONS_KEY = "enski:demo:ambassador-applications";

export type SavedApplication = {
  id: string;
  programme: Programme;
  role: string;
  email: string;
  fullName: string;
  details: FormValues;
  savedAt: string;
};

const text = (max: number) => z.string().trim().max(max).default("");
const phone = z.string().trim().regex(/^[+\d][\d\s-]{6,20}$/, "Enter a valid phone number");
const email = z.string().trim().email("Enter a valid email").max(255);
const fullName = z.string().trim().min(2, "Enter your full name").max(120);
const socialLink = z
  .union([z.literal(""), z.string().trim().url("Enter a full link, e.g. https://…").max(300)])
  .default("");

export const CAMPUS_ROLES = {
  campus_director: "Campus director",
  executive_team: "Campus executive team",
  campus_ambassador: "Campus ambassador",
} as const;
export type CampusRole = keyof typeof CAMPUS_ROLES;

export const NYSC_ROLES = {
  nysc_ambassador: "NYSC ambassador",
  nysc_executive: "NYSC executive team",
} as const;
export type NyscRole = keyof typeof NYSC_ROLES;

const campusSchema = z
  .object({
    role: z.enum(["campus_director", "executive_team", "campus_ambassador"], { message: "Choose a role" }),
    executive_role: text(80),
    full_name: fullName,
    phone,
    email,
    school: z.string().trim().min(2, "Enter your school or university").max(160),
    level: z.string().trim().min(1, "Choose your level").max(40),
    faculty: z.string().trim().min(1, "Enter your faculty").max(120),
    department: z.string().trim().min(1, "Enter your department").max(120),
    motivation: z.string().trim().min(1, "Tell us why you want to join").max(80),
    leadership_experience: text(3),
    available_to_lead: text(3),
    online_meetings: text(3),
    social_link: socialLink,
    has_skill: z.enum(["Yes", "No"], { message: "Tell us if you have a skill" }),
    skill_name: text(160),
    skill_level: text(20),
    skill_to_learn: text(160),
  })
  .superRefine((d, ctx) => {
    if (d.role === "executive_team" && !d.executive_role)
      ctx.addIssue({ code: "custom", path: ["executive_role"], message: "Choose an executive role" });
    if (d.role === "campus_director") {
      for (const k of ["leadership_experience", "available_to_lead", "online_meetings"] as const)
        if (!d[k]) ctx.addIssue({ code: "custom", path: [k], message: "Answer this question" });
    }
    if (d.has_skill === "Yes") {
      if (!d.skill_name) ctx.addIssue({ code: "custom", path: ["skill_name"], message: "Tell us your skill" });
      if (!d.skill_level) ctx.addIssue({ code: "custom", path: ["skill_level"], message: "Choose your skill level" });
    }
  });

const nyscSchema = z
  .object({
    role: z.enum(["nysc_ambassador", "nysc_executive"], { message: "Choose a role" }),
    executive_role: text(80),
    full_name: fullName,
    phone,
    email,
    state: z.string().trim().min(1, "Choose your state of service"),
    batch: text(80),
    cds_group: text(120),
    course: text(120),
    reason: z.string().trim().min(1, "Tell us why you want to join"),
    has_skill: z.enum(["yes", "no"], { message: "Let us know if you have a skill" }),
    skill: text(160),
    skill_level: text(20),
    desired_skill: text(160),
    social_link: socialLink,
  })
  .superRefine((d, ctx) => {
    if (d.role === "nysc_executive" && !d.executive_role)
      ctx.addIssue({ code: "custom", path: ["executive_role"], message: "Choose your executive team role" });
  });

export type Checked = { ok: true; values: FormValues } | { ok: false; errors: FieldErrors };

function check(schema: z.ZodTypeAny, form: FormValues): Checked {
  const r = schema.safeParse(form);
  if (!r.success) {
    const errors: FieldErrors = {};
    for (const issue of r.error.issues) {
      const k = String(issue.path[0] ?? "form");
      errors[k] ??= issue.message;
    }
    return { ok: false, errors };
  }
  return { ok: true, values: clean(r.data as FormValues) };
}

/** Drops answers to questions that don't apply to the chosen role or skill answer. */
function clean(v: FormValues): FormValues {
  const out: FormValues = { ...v, email: (v["email"] ?? "").toLowerCase() };
  const role = out["role"];
  if (role !== "executive_team" && role !== "nysc_executive") out["executive_role"] = "";
  if ("leadership_experience" in out && role !== "campus_director") {
    for (const k of ["leadership_experience", "available_to_lead", "online_meetings", "social_link"]) out[k] = "";
  }
  const hasSkill = out["has_skill"] === "Yes" || out["has_skill"] === "yes";
  for (const k of hasSkill ? ["skill_to_learn", "desired_skill"] : ["skill_name", "skill", "skill_level"]) {
    if (k in out) out[k] = "";
  }
  return out;
}

export const checkCampusApplication = (form: FormValues) => check(campusSchema, form);
export const checkNyscApplication = (form: FormValues) => check(nyscSchema, form);

export function readApplications(): SavedApplication[] {
  return readLocal<SavedApplication[]>(APPLICATIONS_KEY, []);
}

export function roleLabel(programme: Programme, role: string): string {
  const map: Record<string, string> = programme === "campus" ? CAMPUS_ROLES : NYSC_ROLES;
  return map[role] ?? role;
}

/**
 * Saves a checked application on this device. Applying again with the same
 * email for the same programme replaces the earlier one ("updated").
 */
export async function saveApplication(
  programme: Programme,
  values: FormValues,
): Promise<{ status: "saved" | "updated"; application: SavedApplication }> {
  await simulateDelay();
  const email = (values["email"] ?? "").trim().toLowerCase();
  const all = readApplications();
  const index = all.findIndex((a) => a.programme === programme && a.email === email);
  const application: SavedApplication = {
    id: index >= 0 ? all[index]!.id : demoId(),
    programme,
    role: values["role"] ?? "",
    email,
    fullName: (values["full_name"] ?? "").trim(),
    details: { ...values, email },
    savedAt: new Date().toISOString(),
  };
  const next = index >= 0 ? all.map((a, i) => (i === index ? application : a)) : [...all, application];
  writeLocal(APPLICATIONS_KEY, next);
  return { status: index >= 0 ? "updated" : "saved", application };
}
