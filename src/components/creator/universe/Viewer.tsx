import { lazy, Suspense, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ClientOnly } from "@tanstack/react-router";
import {
  Hand, Music, Laugh, SmilePlus, HandHeart, Dumbbell, PartyPopper, BadgeCheck, CircleAlert, Zap,
  RotateCcw, RotateCw, Repeat, ZoomIn, ZoomOut, Maximize2, Minimize2, LocateFixed, ScanFace,
  ArrowLeftRight, FlipHorizontal2, LoaderCircle, Lock, Mountain, Play, ChevronDown, Check, Sparkles, Camera, Smile,
  type LucideIcon,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/dashboard-ui/dropdown-menu";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dashboard-ui/tooltip";
import { Button } from "@/components/dashboard-ui/button";
import { cn } from "@/lib/utils";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import {
  CAST, COLOURWAYS, MOVE_SLOTS, REACTIONS, WORLDS, reactionMove, visibleAccessories, worldUnlockLevel,
  type MoveSlot, type ReactionId, type WorldId, type ColourwayId,
} from "@/lib/creator/universe/cast";
import type { MoveDef } from "@/lib/creator/universe/motion";
import { MILESTONES, usd, type CharacterStyle } from "@/lib/creator/universe/rules";
import { achievedLevel } from "@/lib/creator/universe/showroom";
import type { StageApi } from "./stage/Stage";

const Stage = lazy(() => import("./stage/Stage"));

/** All eight worlds, grouped so the scene picker stays short. */
export const SCENE_GROUPS: { label: string; ids: WorldId[] }[] = [
  { label: "Studio & royal", ids: ["studio", "palace", "legend"] },
  { label: "Action", ids: ["battlefield", "arena", "citadel"] },
  { label: "Night & space", ids: ["neon", "cosmos"] },
];
const PANELS = [{ id: "moves", label: "Moves" }, { id: "reactions", label: "Reactions" }, { id: "camera", label: "Camera" }] as const;

export const REACTION_ICONS: Record<ReactionId, LucideIcon> = {
  wave: Hand, dance: Music, laugh: Laugh, wink: SmilePlus, bow: HandHeart, flex: Dumbbell,
  celebrate: PartyPopper, confidence: BadgeCheck, surprise: CircleAlert, signature: Zap,
};
const SLOT_LABEL: Record<MoveSlot, string> = {
  idle: "Idle", signature: "Signature", celebration: "Celebration", victory: "Victory pose", reaction: "Reaction", entrance: "Entrance",
};

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export type ViewerLook = { outfit: string; colourway: ColourwayId; hidden: string[]; world: WorldId };
export function CharacterViewer({
  style, form, look, preview = false, intro, compact = false, onWorld, className, label,
  hideControls = false, playRef, previewLabel,
}: {
  previewLabel?: string | undefined;
  style: CharacterStyle;
  /** Evolution level shown (1–9). Accessories at or below it are worn. */
  form: number;
  look: ViewerLook;
  /** Preview of a locked form: everything can be explored, nothing is claimed. */
  preview?: boolean;
  intro?: MoveSlot[] | undefined;
  compact?: boolean;
  onWorld?: ((w: WorldId) => void) | undefined;
  className?: string | undefined;
  label?: string | undefined;
  hideControls?: boolean;
  playRef?: React.MutableRefObject<((m: MoveDef, then?: MoveDef[]) => void) | null>;
}) {
  const { universe: u, change } = useUniverse();
  const prefersReduced = useReducedMotion();
  const reduced = prefersReduced || u.showroom.effects === "reduced";
  const level = achievedLevel(u);
  const cast = CAST[style];
  const outfit = cast.outfits.find((o) => o.id === look.outfit) ?? cast.outfits[0]!;
  const colour = COLOURWAYS.find((c) => c.id === look.colourway) ?? COLOURWAYS[0];
  const accessories = useMemo(() => visibleAccessories(style, Math.max(1, form), look.hidden).map((a) => a.id), [style, form, look.hidden]);
  const [world, setWorld] = useState<WorldId>(look.world);
  useEffect(() => setWorld(look.world), [look.world]);
  const [fading, setFading] = useState(false);
  const api = useRef<StageApi | null>(null);
  const [playing, setPlaying] = useState<MoveDef | null>(null);
  const [ready, setReady] = useState(false);
  const [immersive, setImmersive] = useState(false);
  const [visible, setVisible] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const stageBox = useRef<HTMLDivElement>(null);
  const idle = cast.moves.idle;
  const introMoves = useMemo(() => intro?.map((s) => cast.moves[s]), [intro, cast]);
  const formTitle = MILESTONES.find((m) => m.level === form)?.title;

  useEffect(() => { setReady(false); }, [outfit.body]);
  useEffect(() => {
    if (playRef) playRef.current = (m, then) => api.current?.play(m, then);
  });
  useEffect(() => {
    const el = stageBox.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setVisible(Boolean(en?.isIntersecting)), { threshold: 0.05 });
    io.observe(el);
    const vis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", vis); };
  }, []);
  useEffect(() => {
    const onFs = () => { if (!document.fullscreenElement && immersive) setImmersive(false); };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [immersive]);
  useEffect(() => {
    if (!immersive) return;
    const esc = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") exitImmersive(); };
    window.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  });
  const opener = useRef<HTMLElement | null>(null);
  const enterImmersive = () => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setImmersive(true);
    wrap.current?.requestFullscreen?.().catch(() => undefined);
  };
  const exitImmersive = () => {
    setImmersive(false);
    const back = opener.current;
    opener.current = null;
    if (back?.isConnected) window.setTimeout(() => back.focus({ preventScroll: true }), 0);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
  };
  const play = (m: MoveDef) => api.current?.play(m);
  const react = (id: ReactionId) => play(reactionMove(style, id));
  const pickWorld = (w: WorldId) => {
    if (w === world) return;
    setFading(true);
    window.setTimeout(() => { setWorld(w); onWorld?.(w); window.setTimeout(() => setFading(false), 120); }, reduced ? 0 : 260);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, () => void> = {
      ArrowLeft: () => api.current?.rotate(-30), ArrowRight: () => api.current?.rotate(30),
      "+": () => api.current?.zoom(1), "=": () => api.current?.zoom(1), "-": () => api.current?.zoom(-1),
      Enter: () => react("signature"), " ": () => react(u.showroom.reaction as ReactionId),
    };
    const fn = map[e.key];
    if (fn) { e.preventDefault(); fn(); }
  };
  const setAuto = (v: boolean) => change({ showroom: { ...u.showroom, autoRotate: v } });
  const ctl = "shrink-0 gap-1.5";
  const [panel, setPanel] = useState<(typeof PANELS)[number]["id"]>("moves");
  const [lastMove, setLastMove] = useState<MoveSlot | null>(null);
  const [lastReaction, setLastReaction] = useState<ReactionId | null>(null);
  const cameraActions = [
    ["Rotate left", RotateCcw, () => api.current?.rotate(-45)],
    ["Rotate right", RotateCw, () => api.current?.rotate(45)],
    ["Zoom in", ZoomIn, () => api.current?.zoom(1)],
    ["Zoom out", ZoomOut, () => api.current?.zoom(-1)],
    ["Front", ScanFace, () => api.current?.view("front")],
    ["Side", ArrowLeftRight, () => api.current?.view("side")],
    ["Back", FlipHorizontal2, () => api.current?.view("back")],
    ["Reset view", LocateFixed, () => api.current?.reset()],
  ] as const;

  return (
    <div ref={wrap} className={cn("universe-viewer", immersive && "is-immersive", className)}>
      <div
        ref={stageBox}
        className={cn("universe-viewer-stage", compact && "is-compact")}
        data-scene-ready={ready ? "true" : undefined}
        role="group"
        tabIndex={0}
        aria-label={`${label ?? cast.name} 3D viewer. Drag to rotate. Arrow keys rotate, plus and minus zoom, Enter plays the signature move.`}
        onKeyDown={onKey}
        onDoubleClick={() => react((u.showroom.reaction as ReactionId) || "wave")}
      >
        <ClientOnly fallback={<div className="universe-viewer-loading"><LoaderCircle className="h-6 w-6 animate-spin" /></div>}>
          <Suspense fallback={<div className="universe-viewer-loading"><LoaderCircle className="h-6 w-6 animate-spin" /><span>Loading character</span></div>}>
            <Stage
              body={outfit.body}
              accessories={accessories}
              palette={colour}
              world={world}
              fxColors={cast.fx}
              idle={idle}
              intro={introMoves}
              autoRotate={u.showroom.autoRotate}
              reduced={reduced}
              immersive={immersive}
              paused={!visible}
              apiRef={api}
              onPlaying={setPlaying}
              onReady={() => setReady(true)}
            />
          </Suspense>
        </ClientOnly>
        {!ready && <div className="universe-viewer-loading" aria-hidden="true"><LoaderCircle className="h-6 w-6 animate-spin" /><span>Loading character</span></div>}
        <div className={cn("universe-viewer-fade", fading && "is-on")} aria-hidden="true" />
        <div className="universe-viewer-hud">
          <div className="min-w-0">
            {u.showroom.showName && (
              <>
                <p className="text-xs font-bold uppercase text-lime">{formTitle ? `Level ${form} · ${formTitle}` : "Starter"}</p>
                <p className="truncate text-lg font-extrabold text-on-dark">{label ?? cast.name}</p>
              </>
            )}
            {preview && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-lg bg-midnight/70 px-2 py-1 text-xs font-bold text-on-dark">
                <Lock className="h-3 w-3" /> {previewLabel ?? `Preview · unlocks at ${usd(MILESTONES.find((m) => m.level === form)?.threshold ?? 1000)}`}
              </span>
            )}
          </div>
          <div className={cn("flex gap-2", hideControls && "hidden")}>
            <Button size="icon" variant="quiet" className="universe-hud-btn" aria-label="Reset view" onClick={() => api.current?.reset()}><LocateFixed /></Button>
            <Button size="icon" variant="quiet" className="universe-hud-btn" aria-label={immersive ? "Exit full screen" : "Full screen"} onClick={immersive ? exitImmersive : enterImmersive}>
              {immersive ? <Minimize2 /> : <Maximize2 />}
            </Button>
          </div>
        </div>
        <p className="universe-viewer-now" aria-live="polite">
          {playing ? <><Play className="h-3 w-3" /> {playing.name}</> : <span className="text-on-dark-muted">{idle.name} · drag to rotate</span>}
        </p>
      </div>

      {!hideControls && (
        <div className="universe-viewer-panel" data-surface="dark">
          <div className="flex flex-wrap items-center gap-2.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="lime" onClick={() => react("signature")} className="gap-2">
                  <Zap /> {cast.moves.signature.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-60">{cast.moves.signature.description}</TooltipContent>
            </Tooltip>
            <div className="min-w-0 flex-1 sm:max-w-xs sm:flex-none">
              <Select value={world} onValueChange={(v) => pickWorld(v as WorldId)}>
                <SelectTrigger aria-label="Scene" className="universe-scene-trigger h-11">
                  <span className="!flex min-w-0 items-center gap-2"><Mountain className="h-4 w-4 shrink-0 text-lime" /><SelectValue /></span>
                </SelectTrigger>
                <SelectContent>
                  {SCENE_GROUPS.map((g, gi) => (
                    <SelectGroup key={g.label}>
                      {gi > 0 && <SelectSeparator />}
                      <SelectLabel>{g.label}</SelectLabel>
                      {g.ids.map((id) => {
                        const w = WORLDS.find((x) => x.id === id);
                        if (!w) return null;
                        const need = worldUnlockLevel(style, w.id);
                        const open = preview || level >= need;
                        return (
                          <SelectItem key={w.id} value={w.id} disabled={!open} textValue={w.name}>
                            <span className="flex items-center gap-2">{!open && <Lock className="h-3.5 w-3.5" />}{w.name}{!open && <span className="text-xs text-muted-foreground">· {MILESTONES[need - 1]?.title}</span>}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 grid gap-2 md:hidden">
            <PlayMenu
              heading="Moves"
              icon={Sparkles}
              value={lastMove ? `${SLOT_LABEL[lastMove]} · ${cast.moves[lastMove].name}` : "Choose a move"}
              items={MOVE_SLOTS.filter((sl) => sl !== "signature").map((sl) => ({ id: sl, label: cast.moves[sl].name, hint: SLOT_LABEL[sl], active: lastMove === sl }))}
              onPick={(id) => { setLastMove(id as MoveSlot); play(cast.moves[id as MoveSlot]); }}
            />
            <PlayMenu
              heading="Reactions"
              icon={Smile}
              value={lastReaction ? (REACTIONS.find((r) => r.id === lastReaction)?.label ?? "Choose a reaction") : "Choose a reaction"}
              items={REACTIONS.map((r) => ({ id: r.id, label: r.label, icon: REACTION_ICONS[r.id], active: lastReaction === r.id }))}
              onPick={(id) => { setLastReaction(id as ReactionId); react(id as ReactionId); }}
            />
            <PlayMenu
              heading="Camera"
              icon={Camera}
              value={u.showroom.autoRotate && !reduced ? "Auto-rotate on" : "Rotate, zoom and views"}
              items={[
                ...cameraActions.map(([l, I]) => ({ id: l, label: l, icon: I })),
                { id: "auto", label: u.showroom.autoRotate ? "Turn auto-rotate off" : "Turn auto-rotate on", icon: Repeat, active: u.showroom.autoRotate, disabled: reduced, divider: true },
                { id: "full", label: immersive ? "Exit full screen" : "Full screen", icon: immersive ? Minimize2 : Maximize2 },
              ]}
              onPick={(id) => {
                if (id === "auto") setAuto(!u.showroom.autoRotate);
                else if (id === "full") (immersive ? exitImmersive : enterImmersive)();
                else cameraActions.find(([l]) => l === id)?.[2]();
              }}
            />
          </div>
          <div className="mt-4 hidden rounded-full border border-on-dark/15 bg-on-dark/5 p-1 md:inline-flex" role="tablist" aria-label="Showroom controls">
            {PANELS.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={panel === t.id} onClick={() => setPanel(t.id)} className={cn("rounded-full px-3.5 py-1.5 text-[13px] font-bold transition-colors", panel === t.id ? "bg-lime text-midnight" : "text-on-dark-muted hover:text-on-dark")}>{t.label}</button>
            ))}
          </div>
          <div className="mt-3 max-md:hidden" role="tabpanel" aria-label={PANELS.find((t) => t.id === panel)?.label}>
            {panel === "moves" && (
              <div className="universe-viewer-row">
                {MOVE_SLOTS.filter((sl) => sl !== "signature").map((sl) => (
                  <Button key={sl} size="sm" variant="glass" className="shrink-0" onClick={() => play(cast.moves[sl])}>
                    {SLOT_LABEL[sl]} · {cast.moves[sl].name}
                  </Button>
                ))}
              </div>
            )}
            {panel === "reactions" && (
              <div className="universe-reactions">
                {REACTIONS.map((r) => {
                  const Icon = REACTION_ICONS[r.id];
                  return (
                    <Button key={r.id} size="sm" variant={r.id === "signature" ? "glass-active" : "glass"} className="universe-reaction" onClick={() => react(r.id)}>
                      <Icon /> {r.label}
                    </Button>
                  );
                })}
              </div>
            )}
            {panel === "camera" && (
              <div className="universe-viewer-row" role="toolbar" aria-label="View controls">
                {cameraActions.map(([l, I, fn]) => (
                  <Tooltip key={l}>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="glass" className="shrink-0" aria-label={l} onClick={fn}><I /></Button>
                    </TooltipTrigger>
                    <TooltipContent>{l}</TooltipContent>
                  </Tooltip>
                ))}
                <Button size="sm" variant={u.showroom.autoRotate ? "glass-active" : "glass"} className={ctl} aria-pressed={u.showroom.autoRotate} onClick={() => setAuto(!u.showroom.autoRotate)} disabled={reduced}>
                  <Repeat /> Auto-rotate
                </Button>
                <Button size="sm" variant="glass" className={ctl} onClick={immersive ? exitImmersive : enterImmersive}>{immersive ? <Minimize2 /> : <Maximize2 />} {immersive ? "Exit full screen" : "Full screen"}</Button>
              </div>
            )}
          </div>
          {reduced && <p className="mt-3 text-xs text-on-dark-muted">Reduced motion on</p>}
        </div>
      )}
    </div>
  );
}

type PlayItem = { id: string; label: string; hint?: string; icon?: LucideIcon; active?: boolean; disabled?: boolean; divider?: boolean };

/** Phone showroom controls: one tidy dropdown per group instead of rows of pills. */
function PlayMenu({ heading, icon: Icon, value, items, onPick }: {
  heading: string;
  icon: LucideIcon;
  value: string;
  items: PlayItem[];
  onPick: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex h-12 w-full min-w-0 items-center gap-3 rounded-full border-[1.5px] border-on-dark/20 bg-midnight/40 pl-1.5 pr-4 text-left text-on-dark backdrop-blur-sm transition-colors hover:border-lime/60 data-[state=open]:border-lime/70">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime/15 text-lime" aria-hidden="true"><Icon className="h-4 w-4" /></span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-on-dark-muted"><span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />{heading}</span>
          <span className="block truncate text-sm font-extrabold">{value}</span>
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-lime transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="max-h-[min(60vh,380px)] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-2xl p-1.5">
        <DropdownMenuLabel className="px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{heading}</DropdownMenuLabel>
        {items.map((it) => {
          const I = it.icon;
          return (
            <div key={it.id}>
              {it.divider && <DropdownMenuSeparator />}
              <DropdownMenuItem disabled={Boolean(it.disabled)} onSelect={() => onPick(it.id)} className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm font-semibold">
                {I ? <I className={cn("h-4 w-4 shrink-0", it.active ? "text-cobalt" : "text-muted-foreground")} aria-hidden="true" /> : <Play className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate", it.active && "font-extrabold text-cobalt")}>{it.label}</span>
                  {it.hint && <span className="block truncate text-xs font-medium text-muted-foreground">{it.hint}</span>}
                </span>
                <Check className={cn("h-4 w-4 shrink-0 text-cobalt", !it.active && "invisible")} aria-hidden="true" />
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
