import { beforeEach, describe, expect, it } from "vitest";

import { links } from "@/components/site/data";
import {
  checkCampusApplication,
  checkNyscApplication,
  readApplications,
  saveApplication,
  type FormValues,
} from "@/lib/ambassador/applications";
import { OFFLINE_PAGES } from "@/lib/offline/register";

const campus = (over: FormValues = {}): FormValues => ({
  role: "campus_ambassador",
  full_name: "Ada Obi",
  phone: "0803 123 4567",
  email: "  Ada.Obi@Mail.com ",
  school: "University of Lagos",
  level: "300 level",
  faculty: "Social Sciences",
  department: "Economics",
  motivation: "Build my CV",
  has_skill: "No",
  ...over,
});

const nysc = (over: FormValues = {}): FormValues => ({
  role: "nysc_ambassador",
  full_name: "Tunde Bello",
  phone: "08031234567",
  email: "tunde@mail.com",
  state: "Lagos",
  reason: "Build my network",
  has_skill: "no",
  ...over,
});

describe("the ambassador programme is for campus and NYSC", () => {
  it("each programme has its own page under Become an ambassador", () => {
    expect(links.campusAmbassador).toBe("/become-an-ambassador/campus");
    expect(links.nyscInitiative).toBe("/become-an-ambassador/nysc");
  });
  it("both programme pages open offline", () => {
    expect(OFFLINE_PAGES).toContain("/become-an-ambassador/campus");
    expect(OFFLINE_PAGES).toContain("/become-an-ambassador/nysc");
  });
});

describe("campus applications", () => {
  it("the executive team needs an executive role", () => {
    const r = checkCampusApplication(campus({ role: "executive_team" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors["executive_role"]).toBe("Choose an executive role");
  });
  it("campus directors must answer the three director questions", () => {
    const r = checkCampusApplication(campus({ role: "campus_director" }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(["available_to_lead", "leadership_experience", "online_meetings"]);
    }
  });
  it("someone with a skill must name it and its level", () => {
    const r = checkCampusApplication(campus({ has_skill: "Yes" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["skill_level", "skill_name"]);
  });
  it("director-only answers are dropped for other roles", () => {
    const r = checkCampusApplication(campus({ leadership_experience: "Yes", social_link: "https://x.com/ada" }));
    expect(r.ok && r.values["leadership_experience"]).toBe("");
    expect(r.ok && r.values["social_link"]).toBe("");
  });
});

describe("NYSC applications", () => {
  it("the NYSC executive team needs an executive role", () => {
    const r = checkNyscApplication(nysc({ role: "nysc_executive" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors["executive_role"]).toBe("Choose your executive team role");
  });
  it("a state of service is required", () => {
    const r = checkNyscApplication(nysc({ state: "" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors["state"]).toBe("Choose your state of service");
  });
});

describe("saving applications on this device", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the email trimmed and lower-cased", async () => {
    const r = checkCampusApplication(campus());
    if (!r.ok) throw new Error("expected a valid form");
    const { application } = await saveApplication("campus", r.values);
    expect(application.email).toBe("ada.obi@mail.com");
  });

  it("one application per email per programme; applying again updates it", async () => {
    const first = checkCampusApplication(campus());
    const again = checkCampusApplication(campus({ email: "ADA.OBI@mail.com", role: "executive_team", executive_role: "Graphics designer" }));
    if (!first.ok || !again.ok) throw new Error("expected valid forms");
    expect((await saveApplication("campus", first.values)).status).toBe("saved");
    expect((await saveApplication("campus", again.values)).status).toBe("updated");
    const saved = readApplications();
    expect(saved).toHaveLength(1);
    expect(saved[0]?.role).toBe("executive_team");
  });

  it("the same email can apply to both programmes", async () => {
    const c = checkCampusApplication(campus({ email: "same@mail.com" }));
    const n = checkNyscApplication(nysc({ email: "same@mail.com" }));
    if (!c.ok || !n.ok) throw new Error("expected valid forms");
    await saveApplication("campus", c.values);
    expect((await saveApplication("nysc", n.values)).status).toBe("saved");
    expect(readApplications()).toHaveLength(2);
  });
});
