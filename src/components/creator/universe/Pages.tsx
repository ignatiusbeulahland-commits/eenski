import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { useState } from "react";
import { SectionDropdown, SectionNavDropdown } from "@/components/shared/SectionDropdown";
import { cn } from "@/lib/utils";
import { InfoTip } from "./InfoTip";
import { Link } from "@tanstack/react-router";
import {
  LockKeyhole,
  Check,
  ArrowUpRight,
  SlidersHorizontal,
  Trophy,
  History,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/dashboard-ui/dialog";
import { PageHeader, EmptyState } from "@/components/affiliate/ui";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import {
  MILESTONES,
  STYLES,
  isAchieved,
  usd,
  type CharacterStyle,
} from "@/lib/creator/universe/rules";
import { Character, Emblem, Eyebrow } from "./Character";
import { Journey } from "./Journey";
import { AchievementShare } from "./Share";
import { Showroom } from "./Showroom";
import { Customiser } from "./Customiser";
export function UniverseNav() {
  return (
    <>
    <SectionNavDropdown
      heading="Creator Universe"
      className="mt-6 md:hidden"
      links={[
        { to: "/creator/milestones", label: "Universe", exact: true },
        { to: "/creator/milestones/collection", label: "Collection" },
        { to: "/creator/milestones/history", label: "Achievements" },
        { to: "/creator/settings/character", label: "Character" },
      ]}
    />
    <nav aria-label="Creator Universe sections" className="universe-tabs max-md:hidden">
      <Link
        to="/creator/milestones"
        activeOptions={{ exact: true }}
        activeProps={{ className: "is-active", "aria-current": "page" }}
      >
        Universe
      </Link>
      <Link
        to="/creator/milestones/collection"
        activeProps={{ className: "is-active", "aria-current": "page" }}
      >
        Collection
      </Link>
      <Link
        to="/creator/milestones/history"
        activeProps={{ className: "is-active", "aria-current": "page" }}
      >
        Achievements
      </Link>
      <Link
        to="/creator/settings/character"
        activeProps={{ className: "is-active", "aria-current": "page" }}
      >
        Character
      </Link>
    </nav>
    </>
  );
}
function DemoControls() {
  const { universe: u, change, progress: p } = useUniverse();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [amount, setAmount] = useState(String(u.demoEligibleEarningsUsd));
  const [error, setError] = useState("");
  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-y py-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          Counted in USD
          <InfoTip label="How milestones are counted">Milestones are counted in USD from your eligible earnings.</InfoTip>
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAmount(String(u.demoEligibleEarningsUsd));
            setError("");
            setOpen(true);
          }}
        >
          <SlidersHorizontal />
          Preview milestones
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Preview your milestones</DialogTitle>
            <DialogDescription>
              Enter an eligible earnings amount in USD to see how each level unlocks. Your sales,
              wallet and payouts stay exactly as they are.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(amount);
              if (!amount.trim() || !Number.isFinite(n) || n < 0 || n < u.demoEligibleEarningsUsd) {
                setError(
                  "Enter an amount at or above your current preview earnings. Use Reset to start over.",
                );
                return;
              }
              change({ demoEligibleEarningsUsd: n });
              setOpen(false);
              toast.success("Milestone preview updated", { description: "Your wallet and payouts haven't changed." });
            }}
          >
            <Label htmlFor="demo-eligible">Preview eligible earnings (USD)</Label>
            <Input
              id="demo-eligible"
              type="number"
              min={u.demoEligibleEarningsUsd}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Apply amount</Button>
              <Button
                type="button"
                variant="outline"
                disabled={!p.next}
                onClick={() => {
                  if (p.next) {
                    change({ demoEligibleEarningsUsd: p.next.threshold });
                    setOpen(false);
                  }
                }}
              >
                Jump to next level
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => setConfirmReset(true)}
            >
              Reset milestone preview
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        art={brandArtwork.trophy}
        eyebrow="Creator Universe"
        title="Reset your milestone preview?"
        description="Your preview earnings and milestone history go back to zero."
        confirmLabel="Reset milestones"
        onConfirm={() => {
          change({ demoEligibleEarningsUsd: 0, achievements: [] });
          setOpen(false);
        }}
      >
        <ConfirmNote>Your selected character stays the same.</ConfirmNote>
      </ConfirmDialog>
    </>
  );
}
const FILTERS = [
  { value: "all", label: "All levels" },
  { value: "unlocked", label: "Unlocked" },
  { value: "locked", label: "Locked" },
] as const;
export function MilestoneGallery({ collection = false }: { collection?: boolean }) {
  const { universe: u, progress: p } = useUniverse();
  const [preview, setPreview] = useState<number | null>(null);
  const [share, setShare] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");
  const selected = MILESTONES.find((m) => m.level === preview);
  const unlockedCount = MILESTONES.filter((m) => isAchieved(u, m.level)).length;
  const counts: Record<string, number> = { all: MILESTONES.length, unlocked: unlockedCount, locked: MILESTONES.length - unlockedCount };
  const items = MILESTONES.filter(
    (m) =>
      filter === "all" ||
      (filter === "unlocked" ? isAchieved(u, m.level) : !isAchieved(u, m.level)),
  );
  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
        <div>
          <Eyebrow>Nine chapters · one identity</Eyebrow>
          <h2 className="mt-2 text-xl sm:text-2xl">
            {collection ? "Your evolution collection" : "The path to Legend"}
          </h2>
          <span className="lime-underline" aria-hidden="true" />
        </div>
        <div className="hidden flex-wrap gap-2 md:flex" role="group" aria-label="Show milestones">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "lime-pip inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-[1.5px] px-3.5 text-[13px] font-extrabold transition-colors",
                filter === f.value ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line bg-card hover:border-cobalt-100 hover:text-cobalt",
              )}
            >
              {f.label}
              <span className={cn("chip-count rounded-full px-1.5 text-[11px] tabular-nums", filter === f.value ? "bg-on-dark/20" : "bg-soft text-muted-foreground")}>{counts[f.value]}</span>
            </button>
          ))}
        </div>
      </div>
      <SectionDropdown
        heading="Show milestones"
        value={filter}
        onChange={setFilter}
        options={FILTERS.map((f) => ({ value: f.value, label: f.label, count: counts[f.value] }))}
        className="mb-4 md:hidden"
      />
      <div className="universe-timeline">
        {items.map((m) => {
          const unlocked = isAchieved(u, m.level);
          const date = u.achievements.find((a) => a.level === m.level)?.date;
          return (
            <article
              key={m.level}
              className={`universe-evolution ${unlocked ? "is-unlocked" : ""} ${p.level === m.level ? "is-current" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">
                  {String(m.level).padStart(2, "0")} / 09
                </span>
                <span
                  className={`flex items-center gap-1 text-xs font-bold ${unlocked ? "text-lime-text" : "text-muted-foreground"}`}
                >
                  {unlocked ? <Check className="h-3 w-3" /> : <LockKeyhole className="h-3 w-3" />}
                  <span className="max-sm:sr-only">{unlocked ? "Unlocked" : "Locked"}</span>
                </span>
              </div>
              <Button
                variant="ghost"
                className="universe-preview-button"
                aria-label={`Preview ${m.title} evolution`}
                onClick={() => setPreview(m.level)}
              >
                <Character style={u.style} level={m.level} />
              </Button>
              <div className="universe-evolution-name flex items-center gap-3">
                <Emblem level={m.level} on={unlocked} />
                <div className="min-w-0 flex-1">
                  <h3 className="universe-evolution-title text-lg">{m.title}</h3>
                  <p className="text-xs font-semibold text-cobalt">{usd(m.threshold)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground max-sm:hidden">{m.identity}</p>
              <p className={cn("mt-3 text-xs text-muted-foreground max-sm:mt-1 max-sm:text-[11px]", !(unlocked && date) && "max-sm:hidden")}>
                {unlocked && date
                  ? `Achieved ${new Date(date).toLocaleDateString()}`
                  : "Preview"}
              </p>
            </article>
          );
        })}
      </div>
      {!items.length && (
        <EmptyState
          icon={Trophy}
          title="No evolutions yet"
          description="Reach your first milestone to unlock your first evolution."
        />
      )}
      <Dialog
        open={preview !== null}
        onOpenChange={(v) => {
          if (!v) setPreview(null);
        }}
      >
        <DialogContent className="max-h-[94dvh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selected?.title} · Level {selected?.level}
            </DialogTitle>
            <DialogDescription>{selected?.identity}</DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <div className="universe-preview-stage">
                <Character
                  style={u.style}
                  level={selected.level}
                  priority
                  className="mx-auto h-80 w-80 max-w-full"
                />
              </div>
              <div className="flex items-center gap-3">
                <Emblem level={selected.level} on={isAchieved(u, selected.level)} />
                <div>
                  <p className="font-bold">{usd(selected.threshold)} eligible earnings</p>
                  <p className="mt-1 text-xs text-muted-foreground">{selected.upgrade}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isAchieved(u, selected.level)
                  ? "Unlocked evolution"
                  : "Locked"}
              </p>
              <Button
                disabled={!isAchieved(u, selected.level)}
                onClick={() => setShare(selected.level)}
              >
                Share achievement
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      {share !== null && (
        <AchievementShare
          level={share}
          open
          onOpenChange={(v) => {
            if (!v) setShare(null);
          }}
        />
      )}
    </section>
  );
}
export function UniversePage() {
  return (
    <div>
      <Journey full />
      <UniverseNav />
      <Showroom />
      <MilestoneGallery />
      <section className="surface mt-10 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 text-lg sm:text-xl"><span className="lime-tick" aria-hidden="true" />A character that is yours</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse every family and evolution, and pick your favourite.</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/creator/milestones/collection">
            Explore collection
            <ArrowUpRight />
          </Link>
        </Button>
      </section>
      <DemoControls />
    </div>
  );
}
export function HistoryPage() {
  const { universe: u } = useUniverse();
  const [share, setShare] = useState<number | null>(null);
  const achieved = u.achievements
    .filter((a) => isAchieved(u, a.level))
    .slice()
    .reverse();
  return (
    <div>
      <PageHeader
        eyebrow="Enski Creator Universe"
        title="Achievement history"
        description="Every chapter you have earned so far."
      />
      <UniverseNav />
      {!achieved.length ? (
        <EmptyState
          icon={History}
          title="No milestones yet"
          description="Your first one, Spark, unlocks at $1,000 in eligible earnings."
          action={
            <Button asChild>
              <Link to="/creator/milestones">Explore milestones</Link>
            </Button>
          }
        />
      ) : (
        <ol className="mt-8 space-y-5">
          {achieved.map((a) => {
            const m = MILESTONES.find((m) => m.level === a.level);
            return (
              <li key={a.level} className="flex flex-wrap items-center gap-5 border-b pb-5">
                <Character style={u.style} level={a.level} className="h-28 w-28" />
                <Emblem level={a.level} on />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-cobalt">Level {a.level}</p>
                  <h2 className="mt-1 text-xl">{m?.title}</h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(a.date).toLocaleString()} · {usd(m?.threshold ?? 0)} threshold
                  </p>
                </div>
                <Button variant="outline" onClick={() => setShare(a.level)}>
                  Share achievement
                </Button>
              </li>
            );
          })}
        </ol>
      )}
      {share !== null && (
        <AchievementShare
          level={share}
          open
          onOpenChange={(v) => {
            if (!v) setShare(null);
          }}
        />
      )}
    </div>
  );
}
export function CharacterPreferences() {
  const { universe: u, change, progress: p } = useUniverse();
  const [style, setStyle] = useState<CharacterStyle>(u.style);
  const [alias, setAlias] = useState(u.alias);
  const [accent, setAccent] = useState(u.accent);
  return (
    <div>
      <PageHeader
        eyebrow="Enski Creator Universe"
        title="Character preferences"
        description="Your identity is your choice. Your progress stays with you."
      />
      <UniverseNav />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {STYLES.map((s) => (
              <Button
                key={s.id}
                variant="outline"
                aria-pressed={style === s.id}
                aria-label={`Choose ${s.label}`}
                className={`universe-style-choice ${style === s.id ? "is-selected" : ""}`}
                onClick={() => setStyle(s.id)}
              >
                <Character style={s.id} level={0} />
                <span className="text-xs font-bold sm:text-sm">{s.label}</span>
                <span className="text-[11px] font-normal text-muted-foreground sm:text-xs">{s.persona}</span>
                {style === s.id && <Check className="absolute right-2 top-2 h-4 w-4 text-cobalt" />}
              </Button>
            ))}
          </div>
          <div className="mt-6">
            <Label htmlFor="character-alias">Character nickname (optional)</Label>
            <Input
              id="character-alias"
              value={alias}
              maxLength={40}
              onChange={(e) => setAlias(e.target.value)}
              className="mt-2"
            />
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Stage accent</legend>
            <div className="mt-3 flex gap-3">
              {(["cobalt", "sky", "lime"] as const).map((a) => (
                <Button
                  key={a}
                  variant="quiet"
                  size="icon"
                  aria-label={`${a} accent`}
                  aria-pressed={accent === a}
                  onClick={() => setAccent(a)}
                  className={accent === a ? "ring-2 ring-cobalt" : ""}
                >
                  <span
                    className={`h-5 w-5 rounded-full ${a === "lime" ? "bg-lime" : a === "sky" ? "bg-sky" : "bg-cobalt"}`}
                  />
                </Button>
              ))}
            </div>
          </fieldset>
          <Button
            className="mt-6"
            onClick={() => {
              change({ style, alias: alias.trim(), accent, chosen: true });
              toast.success("Character saved", {
                description: "Your achievements and progress are unchanged.",
              });
            }}
          >
            Save character
          </Button>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            Official character: {u.demoVerificationConfirmed ? "confirmed" : "pending verification"}
            <InfoTip label="About your character">Appearance is never inferred from your name, photo or documents.</InfoTip>
          </p>
          {!u.demoVerificationConfirmed && (
            <Button asChild variant="ghost" className="mt-2">
              <Link to="/creator/settings/verification">
                Review verification
                <ArrowUpRight />
              </Link>
            </Button>
          )}
        </div>
        <div className={`universe-preferences-preview accent-${accent}`}>
          <p className="text-xs font-bold text-lime">Your character preview</p>
          <Character style={style} level={p.level} priority className="mx-auto mt-4 w-full" />
          <h2 className="mt-4 break-words text-xl">
            {alias || STYLES.find((s) => s.id === style)?.persona}
          </h2>
          <p className="mt-2 text-xs text-on-dark-muted">
            {p.current?.title ?? "Starter"} · {STYLES.find((s) => s.id === style)?.label}
          </p>
          <p className="mt-5 text-xs text-on-dark-muted">
            {STYLES.find((s) => s.id === style)?.description}
          </p>
        </div>
      </div>
      <Customiser style={u.style} />
    </div>
  );
}
