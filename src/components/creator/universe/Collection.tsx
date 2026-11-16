import { useState } from "react";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { Link } from "@tanstack/react-router";
import { Check, Heart, LayoutDashboard, Lock, Palette, Play, Box } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { PageHeader } from "@/components/affiliate/ui";
import { cn } from "@/lib/utils";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import { CAST, WORLDS, worldUnlockLevel, type WorldId } from "@/lib/creator/universe/cast";
import { MILESTONES, STYLES, usd, type CharacterStyle } from "@/lib/creator/universe/rules";
import { customFor, isFormUnlocked, isNewlyUnlocked, showcase, achievedLevel } from "@/lib/creator/universe/showroom";
import { Character, Emblem, Eyebrow } from "./Character";
import { CharacterViewer } from "./Viewer";
import { UniverseNav } from "./Pages";

type Open = { style: CharacterStyle; level: number; world?: WorldId } | null;

export function CollectionPage() {
  const { universe: u, change } = useUniverse();
  const [family, setFamily] = useState<CharacterStyle>(u.style);
  const [open, setOpen] = useState<Open>(null);
  const sc = showcase(u);
  const level = achievedLevel(u);
  const cast = CAST[family];
  const unlockedCount = MILESTONES.filter((m) => isFormUnlocked(u, m.level)).length;
  const sr = u.showroom;
  const setShowroom = (patch: Partial<typeof sr>) => change({ showroom: { ...sr, ...patch } });
  const toggleFavourite = (style: CharacterStyle, lvl: number) => {
    if (!isFormUnlocked(u, lvl)) return;
    const same = sc.favourite?.style === style && sc.favourite.level === lvl;
    setShowroom({ favourite: same ? null : { style, level: lvl } });
    toast.success(same ? "Removed from favourite" : "Favourite character set", { description: same ? undefined : "It now leads your Creator Universe showroom." });
  };
  const setDashboard = (style: CharacterStyle, lvl: number) => {
    if (!isFormUnlocked(u, lvl)) return;
    setShowroom({ dashboard: { style, level: lvl } });
    toast.success("Dashboard character updated");
  };
  const collect = (lvl: number) => {
    if (!isFormUnlocked(u, lvl) || sr.collected.includes(lvl)) return;
    setShowroom({ collected: [...sr.collected, lvl] });
    toast.success("Added to your collection");
  };
  const openLook = open ? customFor(u, open.style) : null;
  const openPreview = open ? !isFormUnlocked(u, open.level) : false;

  return (
    <div>
      <PageHeader
        eyebrow="Enski Creator Universe"
        title="Character collection"
        description="Six personalities, nine evolutions each. Unlock them with your milestones."
        actions={
          <Button asChild variant="outline">
            <Link to="/creator/settings/character"><Palette /> Customise</Link>
          </Button>
        }
      />
      <UniverseNav />
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="surface min-w-0 p-3 max-sm:rounded-2xl sm:p-4">
          <p className="text-[11px] font-bold leading-tight text-muted-foreground sm:text-xs">Unlocked forms</p>
          <p className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">{unlockedCount} <span className="text-sm font-semibold text-muted-foreground">of 9</span></p>
        </div>
        <div className="surface min-w-0 p-3 max-sm:rounded-2xl sm:p-4">
          <p className="text-[11px] font-bold leading-tight text-muted-foreground sm:text-xs">Favourite</p>
          <p className="mt-1 text-sm font-bold leading-snug sm:text-base">{sc.favourite ? `${CAST[sc.favourite.style].name} · ${MILESTONES[sc.favourite.level - 1]?.title}` : "None yet"}</p>
        </div>
        <div className="surface min-w-0 p-3 max-sm:rounded-2xl sm:p-4">
          <p className="text-[11px] font-bold leading-tight text-muted-foreground sm:text-xs">On your dashboard</p>
          <p className="mt-1 text-sm font-bold leading-snug sm:text-base">{sc.dashboard ? `${CAST[sc.dashboard.style].name} · ${MILESTONES[sc.dashboard.level - 1]?.title}` : "Starter character"}</p>
        </div>
      </div>

      <SectionDropdown heading="Character family" value={family} onChange={(v) => setFamily(v as typeof family)} options={STYLES.map((s) => ({ value: s.id, label: CAST[s.id].name, count: u.style === s.id ? "Yours" : undefined }))} className="mt-6 md:hidden" />
      <div role="tablist" aria-label="Character families" className="mt-8 hidden flex-wrap gap-2 md:flex">
        {STYLES.map((s) => (
          <Button
            key={s.id}
            role="tab"
            aria-selected={family === s.id}
            variant={family === s.id ? "default" : "quiet"}
            size="sm"
            className="shrink-0"
            onClick={() => setFamily(s.id)}
          >
            {CAST[s.id].name}
            {u.style === s.id && <span className={cn("rounded-md px-1.5 text-xs", family === s.id ? "bg-on-dark/15" : "bg-ice text-cobalt")}>Yours</span>}
          </Button>
        ))}
      </div>

      <section className="surface mt-5 grid gap-4 p-4 sm:gap-5 sm:p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" role="tabpanel" aria-label={cast.name}>
        <div className="min-w-0">
          <Eyebrow>{STYLES.find((s) => s.id === family)?.label} · {STYLES.find((s) => s.id === family)?.persona}</Eyebrow>
          <h2 className="mt-1.5 text-xl sm:text-2xl">{cast.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{cast.personality}</p>
        </div>
        <Button onClick={() => setOpen({ style: family, level: Math.max(1, level) })}>
          <Box /> {level ? "View in 3D" : "Preview in 3D"}
        </Button>
      </section>

      <h2 className="mt-8 flex items-center gap-2.5 text-lg sm:text-xl"><span className="lime-tick" aria-hidden="true" />Evolutions</h2>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 xl:grid-cols-4 2xl:grid-cols-5">
        {MILESTONES.map((m) => {
          const unlocked = isFormUnlocked(u, m.level);
          const fresh = isNewlyUnlocked(u, m.level);
          const fav = sc.favourite?.style === family && sc.favourite.level === m.level;
          const dash = sc.dashboard?.style === family && sc.dashboard.level === m.level && Boolean(u.showroom.dashboard);
          return (
            <article key={m.level} className={cn("universe-form-card", unlocked ? "is-unlocked" : "is-locked")}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-muted-foreground sm:text-xs">{String(m.level).padStart(2, "0")}<span className="max-sm:hidden"> / 09</span></span>
                {fresh ? (
                  <span className="rounded-md bg-lime-100 px-1.5 text-xs font-bold text-lime-text">New</span>
                ) : (
                  <span className={cn("flex items-center gap-1 text-xs font-bold", unlocked ? "text-lime-text" : "text-muted-foreground")}>
                    {unlocked ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}<span className="max-sm:sr-only">{unlocked ? "Unlocked" : "Locked"}</span>
                  </span>
                )}
              </div>
              <button type="button" className="mt-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt" aria-label={`${unlocked ? "View" : "Preview"} ${m.title} in 3D`} onClick={() => setOpen({ style: family, level: m.level })}>
                <Character style={family} level={m.level} />
              </button>
              <div className="mt-2 flex items-center gap-2">
                <Emblem level={m.level} on={unlocked} className="scale-75" />
                <div className="min-w-0">
                  <h3 className="truncate text-[13px] sm:text-base">{m.title}</h3>
                  <p className="text-[11px] font-semibold text-cobalt sm:text-xs">{usd(m.threshold)}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground max-sm:hidden">{unlocked ? m.upgrade : `Requires ${usd(m.threshold)} in eligible earnings`}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                <Button size="sm" variant="soft" className="h-8 px-3 max-sm:w-full max-sm:px-2" onClick={() => setOpen({ style: family, level: m.level })}>
                  <Play /> {unlocked ? "View" : "Preview"}
                </Button>
                {unlocked && (
                  <>
                    <Button size="icon" variant="quiet" className="h-8 w-8" aria-pressed={fav} aria-label={fav ? `Remove ${m.title} as favourite` : `Set ${m.title} as favourite`} onClick={() => toggleFavourite(family, m.level)}>
                      <Heart className={cn(fav && "fill-current text-cobalt")} />
                    </Button>
                    <Button size="icon" variant="quiet" className="h-8 w-8" aria-pressed={dash} aria-label={`Show ${m.title} on dashboard`} onClick={() => setDashboard(family, m.level)}>
                      <LayoutDashboard className={cn(dash && "text-cobalt")} />
                    </Button>
                  </>
                )}
                {fresh && <Button size="sm" variant="outline" className="h-8 px-3" onClick={() => collect(m.level)}>Add to collection</Button>}
              </div>
            </article>
          );
        })}
      </div>

      <h2 className="mt-10 flex items-center gap-2.5 text-lg sm:text-xl"><span className="lime-tick" aria-hidden="true" />Worlds</h2>
      <p className="mt-1 text-sm text-muted-foreground">Unlocked worlds can be your backdrop.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {WORLDS.map((w) => {
          const need = worldUnlockLevel(family, w.id);
          const ok = level >= need;
          return (
            <div key={w.id} className="surface flex min-w-0 flex-col p-3 max-sm:rounded-2xl sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 text-sm font-bold sm:text-base">{w.name}</p>
                {ok ? <Check className="h-4 w-4 text-lime-text" aria-label="Unlocked" /> : <Lock className="h-4 w-4 text-muted-foreground" aria-label="Locked" />}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:line-clamp-none">{w.mood}</p>
              <p className="mt-2 text-[11px] font-semibold text-cobalt sm:text-xs">{need === 0 ? "Always available" : `${ok ? "Unlocked" : "Unlocks"} at ${MILESTONES[need - 1]?.title} · ${usd(MILESTONES[need - 1]?.threshold ?? 0)}`}</p>
              <Button size="sm" variant="quiet" className="mt-auto self-start max-sm:mt-3 max-sm:h-8 max-sm:px-3" onClick={() => setOpen({ style: family, level: Math.max(1, level), world: w.id })}>
                <Play /> <span className="sm:hidden">Preview</span><span className="max-sm:hidden">Preview world</span>
              </Button>
            </div>
          );
        })}
      </div>

      <Dialog open={open !== null} onOpenChange={(v) => { if (!v) setOpen(null); }}>
        <DialogContent className="max-h-[94dvh] max-w-4xl grid-cols-[minmax(0,1fr)] overflow-y-auto p-0 sm:p-0">
          {open && openLook && (
            <>
              <DialogHeader className="px-5 pt-5">
                <DialogTitle>{CAST[open.style].name} · {MILESTONES[open.level - 1]?.title}</DialogTitle>
                <DialogDescription>
                  {openPreview ? `Locked preview. Unlocks at ${usd(MILESTONES[open.level - 1]?.threshold ?? 0)} in eligible earnings.` : MILESTONES[open.level - 1]?.upgrade}
                </DialogDescription>
              </DialogHeader>
              <div className="px-2 pb-2 sm:px-3 sm:pb-3">
                <CharacterViewer
                  style={open.style}
                  form={open.level}
                  preview={openPreview || Boolean(open.world && worldUnlockLevel(open.style, open.world) > level)}
                  look={{ ...openLook, world: open.world ?? (openPreview ? CAST[open.style].world : openLook.world) }}
                  previewLabel={openPreview ? undefined : "World preview"}
                  compact
                  intro={["entrance"]}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
