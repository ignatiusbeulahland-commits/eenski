import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { settingsStore, updateSettings, setAgentStatus, supportAvailability } from "@/lib/assistant/store";
import { staffSession, useStaffAgentId } from "@/lib/assistant/staff";
import { newId } from "@/lib/assistant/persist";
import type { SupportAgent } from "@/lib/assistant/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Heading, Panel, Pick, field } from "./shared";
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
export function SettingsPage() {
  const s = settingsStore.use(),
    id = useStaffAgentId(),
    navigate = useNavigate();
  const [name, N] = useState(""),
    [role, R] = useState(""),
    [now, Now] = useState<Date | null>(null);
  useEffect(() => {
    Now(new Date());
    const timer = setInterval(() => Now(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const availability = now ? supportAvailability(s, now) : null;
  const me = s.agents.find((a) => a.id === id);
  return (
    <>
      <Heading title="Settings" description="Set your support hours, team and how chats are handed out." />
      <div className="mb-5 rounded-2xl bg-ice p-4 text-sm text-brand" aria-live="polite">
        {availability
          ? `Right now: Live chat is ${availability.available ? "available" : "unavailable"} — ${availability.reason === "closed" ? "outside support hours" : availability.reason === "no-agents" ? "no agents online" : "agents are online"}`
          : "Checking availability…"}
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Panel title="Agent availability">
          {s.agents.map((a) => (
            <div key={a.id} className="grid gap-2 border-b border-line pb-4 sm:grid-cols-2">
              <div>
                <strong className="text-sm">{a.name}</strong>
                <p className="text-xs text-muted-foreground">{a.role}</p>
              </div>
              <Pick
                label={`Status for ${a.name}`}
                value={a.status}
                options={["online", "away", "offline"]}
                onChange={(v) => setAgentStatus(a.id, v as SupportAgent["status"])}
              />
            </div>
          ))}
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !role.trim()) return;
              updateSettings((prev) => ({
                ...prev,
                agents: [...prev.agents, { id: newId("agent"), name: name.trim(), role: role.trim(), status: "offline" }],
              }));
              N("");
              R("");
              toast.success("Agent added");
            }}
          >
            <h3 className="text-sm font-semibold">Add agent</h3>
            <label className="block text-sm">
              Name
              <input required className={field} value={name} onChange={(e) => N(e.target.value)} />
            </label>
            <label className="block text-sm">
              Role
              <input required className={field} value={role} onChange={(e) => R(e.target.value)} />
            </label>
            <Button size="sm" type="submit">
              Add agent
            </Button>
          </form>
        </Panel>
        <div className="space-y-5">
          <Panel title="My profile">{me && <Profile key={`${me.id}:${me.name}:${me.role}`} agent={me} />}</Panel>
          <Panel title="Support hours">
            <Toggle
              label="Enforce support hours"
              checked={s.enforceHours}
              onChange={(v) => updateSettings((p) => ({ ...p, enforceHours: v }))}
            />
            <div className="grid grid-cols-2 gap-3">
              {(["open", "close"] as const).map((k) => (
                <label key={k} className="text-sm capitalize">
                  {k}
                  <input
                    type="time"
                    className={field}
                    value={s.hours[k]}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) updateSettings((p) => ({ ...p, hours: { ...p.hours, [k]: value } }));
                    }}
                  />
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Times use your own time zone. Closing time needs to be after opening time.</p>
            <div className="flex flex-wrap gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                <Button
                  key={day}
                  size="sm"
                  aria-pressed={s.hours.days.includes(i)}
                  variant={s.hours.days.includes(i) ? "default" : "outline"}
                  onClick={() =>
                    updateSettings((p) => ({
                      ...p,
                      hours: { ...p.hours, days: p.hours.days.includes(i) ? p.hours.days.filter((d) => d !== i) : [...p.hours.days, i] },
                    }))
                  }
                >
                  {day}
                </Button>
              ))}
            </div>
          </Panel>
          <Panel title="Routing">
            <Toggle label="Auto-accept chats" checked={s.autoAccept} onChange={(v) => updateSettings((p) => ({ ...p, autoAccept: v }))} />
            <p className="text-sm text-muted-foreground">
              {s.autoAccept ? "Online agents pick up new chats straight away" : "New chats join the waiting queue"}
            </p>
          </Panel>
          <Panel title="Notification preferences">
            {(
              [
                ["sound", "Sound"],
                ["newChat", "New chat"],
                ["newTicket", "New ticket"],
                ["email", "Email"],
              ] as const
            ).map(([key, label]) => (
              <Toggle
                key={key}
                label={label}
                checked={s.notifications[key]}
                onChange={(v) => updateSettings((p) => ({ ...p, notifications: { ...p.notifications, [key]: v } }))}
              />
            ))}
          </Panel>
          <Button
            variant="outline"
            onClick={() => {
              staffSession.signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sign out of support
          </Button>
        </div>
      </div>
    </>
  );
}
function Profile({ agent }: { agent: SupportAgent }) {
  const [name, N] = useState(agent.name),
    [role, R] = useState(agent.role);
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !role.trim()) return;
        updateSettings((p) => ({
          ...p,
          agents: p.agents.map((a) => (a.id === agent.id ? { ...a, name: name.trim(), role: role.trim() } : a)),
        }));
        toast.success("Profile updated");
      }}
    >
      <label className="block text-sm">
        Name
        <input required className={field} value={name} onChange={(e) => N(e.target.value)} />
      </label>
      <label className="block text-sm">
        Role
        <input required className={field} value={role} onChange={(e) => R(e.target.value)} />
      </label>
      <Button type="submit">Save profile</Button>
    </form>
  );
}
