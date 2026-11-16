import { Check, Lock } from "lucide-react";
import { InfoTip } from "./InfoTip";
import { Button } from "@/components/dashboard-ui/button";
import { Label } from "@/components/dashboard-ui/label";
import { Switch } from "@/components/dashboard-ui/switch";
import { cn } from "@/lib/utils";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import { CAST, COLOURWAYS, REACTIONS, WORLDS, worldUnlockLevel, type ColourwayId, type WorldId } from "@/lib/creator/universe/cast";
import { MILESTONES, type CharacterStyle } from "@/lib/creator/universe/rules";
import { achievedLevel, customFor } from "@/lib/creator/universe/showroom";
import { CharacterViewer, REACTION_ICONS } from "./Viewer";

const req = (lvl: number) => `${MILESTONES[lvl - 1]?.title ?? "Spark"} · level ${lvl}`;

/** Presentation-only customisation. Never touches earnings, milestones or achievements. */
export function Customiser({ style }: { style: CharacterStyle }) {
  const { universe: u, change } = useUniverse();
  const level = achievedLevel(u);
  const cast = CAST[style];
  const look = customFor(u, style);
  const sr = u.showroom;
  const save = (patch: Partial<typeof look>) =>
    change({ showroom: { ...sr, custom: { ...sr.custom, [style]: { ...look, ...patch } } } });
  const toggle = (id: string) =>
    save({ hidden: look.hidden.includes(id) ? look.hidden.filter((h) => h !== id) : [...look.hidden, id] });
  const preview = level === 0;
  return (
    <section className="mt-10 border-t pt-8" aria-labelledby="customise-title">
      <p className="text-xs font-bold uppercase text-cobalt">Customise</p>
      <h2 id="customise-title" className="mt-1 text-2xl">Make {cast.name} yours</h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        Saves instantly
        <InfoTip label="About customising">Display only. Your milestones, earnings and achievements never change.</InfoTip>
      </p>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <CharacterViewer style={style} form={Math.max(1, level)} look={look} preview={preview} compact onWorld={(w) => !preview && save({ world: w })} label={u.alias || cast.name} />
        <div className="space-y-6">
          <fieldset>
            <legend className="text-sm font-bold">Outfit</legend>
            <div className="mt-2 grid grid-cols-3 gap-2 lg:grid-cols-1 xl:grid-cols-3">
              {cast.outfits.map((o) => {
                const ok = level >= o.unlockLevel;
                const on = look.outfit === o.id;
                return (
                  <Button key={o.id} variant={on ? "soft" : "quiet"} aria-pressed={on} disabled={!ok} className="h-auto min-w-0 flex-col items-start gap-0.5 px-3 py-2.5 text-left whitespace-normal sm:px-4" onClick={() => save({ outfit: o.id })}>
                    <span className="flex items-center gap-1.5">{on ? <Check className="h-3.5 w-3.5" /> : !ok && <Lock className="h-3.5 w-3.5" />}{o.label}</span>
                    <span className="text-xs font-semibold text-muted-foreground">{o.unlockLevel ? (ok ? "Unlocked" : req(o.unlockLevel)) : "Starter"}</span>
                  </Button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold">Colour variation</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOURWAYS.map((c) => {
                const ok = level >= c.unlockLevel;
                const on = look.colourway === c.id;
                return (
                  <Button key={c.id} size="sm" variant={on ? "soft" : "quiet"} aria-pressed={on} disabled={!ok} title={ok ? c.label : `Unlocks at ${req(c.unlockLevel)}`} onClick={() => save({ colourway: c.id as ColourwayId })}>
                    <span className="flex" aria-hidden="true">
                      {[c.primary, c.metal, c.glow].map((h, i) => <span key={i} className="-ml-1 h-4 w-4 rounded-full border-2 border-card first:ml-0" style={{ background: h }} />)}
                    </span>
                    {c.label}
                    {!ok && <Lock />}
                  </Button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold">Accessories</legend>
            <ul className="mt-2 divide-y rounded-2xl border">
              {cast.accessories.map((a) => {
                const ok = level >= a.unlockLevel;
                const shown = ok && !look.hidden.includes(a.id);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <Label htmlFor={`acc-${a.id}`} className={cn("text-sm font-semibold", !ok && "text-muted-foreground")}>{a.label}</Label>
                      <p className="text-xs text-muted-foreground">{ok ? (a.unlockLevel ? `Unlocked at ${req(a.unlockLevel)}` : "Starter") : `Unlocks at ${req(a.unlockLevel)}`}</p>
                    </div>
                    {ok ? <Switch id={`acc-${a.id}`} checked={shown} onCheckedChange={() => toggle(a.id)} /> : <Lock className="h-4 w-4 text-muted-foreground" aria-label="Locked" />}
                  </li>
                );
              })}
            </ul>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold">Background</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {WORLDS.map((w) => {
                const need = worldUnlockLevel(style, w.id);
                const ok = level >= need;
                const on = look.world === w.id;
                return (
                  <Button key={w.id} size="sm" variant={on ? "soft" : "quiet"} aria-pressed={on} disabled={!ok} title={ok ? w.mood : `Unlocks at ${req(need)}`} onClick={() => save({ world: w.id as WorldId })}>
                    {!ok && <Lock />}{w.name}
                  </Button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-bold">Favourite reaction</legend>
            <p className="text-xs text-muted-foreground">Double-click or press Space</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REACTIONS.map((r) => {
                const Icon = REACTION_ICONS[r.id];
                const on = sr.reaction === r.id;
                return (
                  <Button key={r.id} size="sm" variant={on ? "soft" : "quiet"} aria-pressed={on} onClick={() => change({ showroom: { ...sr, reaction: r.id } })}>
                    <Icon /> {r.label}
                  </Button>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-sm font-bold">Display preferences</legend>
            {([
              ["autoRotate", "Auto-rotate when idle", sr.autoRotate],
              ["reduced", "Reduce motion and effects", sr.effects === "reduced"],
              ["showName", "Show name and level on the stage", sr.showName],
            ] as const).map(([key, label, value]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <Label htmlFor={`pref-${key}`} className="text-sm">{label}</Label>
                <Switch
                  id={`pref-${key}`}
                  checked={value}
                  onCheckedChange={(v) => change({ showroom: key === "reduced" ? { ...sr, effects: v ? "reduced" : "full" } : { ...sr, [key]: v } })}
                />
              </div>
            ))}
          </fieldset>
          {preview && <p className="rounded-2xl bg-ice px-4 py-3 text-xs text-cobalt">More looks unlock with milestones.</p>}
        </div>
      </div>
    </section>
  );
}
