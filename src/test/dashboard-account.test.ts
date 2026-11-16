import { beforeEach, describe, expect, it } from "vitest";

import { accountHandle, accountPerson, accountStorageKey, DASHBOARD_HOME, savedAccountValues } from "@/lib/dashboard/account";
import { currentDemoProfile, demoSession, nameFromEmail } from "@/lib/demo/profile";

describe("dashboards follow the demo sign-in", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("sends each account type to its own dashboard", () => {
    expect(DASHBOARD_HOME).toEqual({
      learner: "/learner/dashboard",
      creator: "/creator/dashboard",
      affiliate: "/affiliate/dashboard",
    });
  });

  it("uses the registered person's name, never a built-in one", () => {
    demoSession.signIn("creator", { name: "Ada  Obi", email: "Ada@Mail.com" });
    expect(accountPerson()).toEqual({ fullName: "Ada Obi", firstName: "Ada", lastName: "Obi", email: "ada@mail.com" });
  });

  it("gives every person their own saved dashboard", () => {
    demoSession.signIn("learner", { name: "Ada Obi", email: "ada@mail.com" });
    const ada = accountStorageKey("enski-learner-prototype-v1");
    demoSession.signIn("learner", { name: "Tunde Bello", email: "tunde@mail.com" });
    const tunde = accountStorageKey("enski-learner-prototype-v1");
    expect(ada).toBe("enski-learner-prototype-v1:ada@mail.com");
    expect(tunde).not.toBe(ada);
  });

  it("greets a returning person by the name they registered with", () => {
    demoSession.signIn("affiliate", { name: "Chioma Eze", email: "chioma@mail.com" });
    demoSession.signOut();
    demoSession.signIn("affiliate", { email: "chioma@mail.com" });
    expect(currentDemoProfile()?.name).toBe("Chioma Eze");
  });

  it("builds a name from the email when none was registered on this device", () => {
    expect(nameFromEmail("kemi.adeyemi92@mail.com")).toBe("Kemi Adeyemi");
  });

  it("puts the affiliate's own handle in referral links", () => {
    demoSession.signIn("affiliate", { name: "Chioma Eze", email: "chioma@mail.com" });
    expect(accountHandle()).toBe("chioma");
  });

  it("lets the certificate check read every saved account on the device", () => {
    localStorage.setItem("enski-learner-prototype-v1:ada@mail.com", "{\"a\":1}");
    localStorage.setItem("enski-learner-prototype-v1:tunde@mail.com", "{\"b\":2}");
    localStorage.setItem("enski-creator-prototype-v2:ada@mail.com", "{\"c\":3}");
    expect(savedAccountValues("enski-learner-prototype-v1").sort()).toEqual(["{\"a\":1}", "{\"b\":2}"]);
  });
});
