import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { readCookiePrefs, saveCookiePrefs, type CookieChoice } from "@/lib/legal/cookies";

const rows: { key: CookieChoice | "essential"; label: string; text: string }[] = [
  { key: "essential", label: "Essential", text: "Security, network management and account access. Always on." },
  { key: "analytics", label: "Analytics", text: "Anonymous reports on how visitors use Enski." },
  { key: "preference", label: "Preferences", text: "Remember choices like language, region and currency." },
  { key: "marketing", label: "Marketing", text: "Show relevant Enski offers on other websites." },
];

export function CookiePreferences() {
  const [prefs, setPrefs] = useState({ analytics: false, preference: false, marketing: false });
  const [savedAt, setSavedAt] = useState<string | null>(null);
  useEffect(() => {
    const p = readCookiePrefs();
    setPrefs({ analytics: p.analytics, preference: p.preference, marketing: p.marketing });
    setSavedAt(p.savedAt);
  }, []);

  const save = (next = prefs) => {
    setPrefs(next);
    setSavedAt(saveCookiePrefs(next).savedAt);
    toast.success("Cookie preferences saved");
  };

  return (
    <section id="preferences" aria-labelledby="cookie-prefs" className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
      <h2 id="cookie-prefs" className="text-lg font-extrabold text-ink">Your cookie preferences</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {savedAt ? `Last saved ${new Date(savedAt).toLocaleDateString()} on this device.` : "Choose what Enski may use on this device."}
      </p>
      <ul className="mt-5 divide-y divide-border">
        {rows.map((r) => (
          <li key={r.key} className="flex items-start justify-between gap-4 py-4">
            <div>
              <p className="font-bold text-ink">{r.label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{r.text}</p>
            </div>
            <Switch
              aria-label={`${r.label} cookies`}
              checked={r.key === "essential" ? true : prefs[r.key]}
              disabled={r.key === "essential"}
              onCheckedChange={(v) => r.key !== "essential" && setPrefs((p) => ({ ...p, [r.key]: v }))}
            />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => save()}>Save choices</Button>
        <Button variant="outline" onClick={() => save({ analytics: true, preference: true, marketing: true })}>Accept all</Button>
        <Button variant="ghost" onClick={() => save({ analytics: false, preference: false, marketing: false })}>Essential only</Button>
      </div>
    </section>
  );
}
