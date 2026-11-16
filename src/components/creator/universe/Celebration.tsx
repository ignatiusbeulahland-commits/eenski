import { useEffect, useState } from "react";
import { Share2, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/dashboard-ui/dialog";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import { CAST } from "@/lib/creator/universe/cast";
import { MILESTONES, isAchieved, usd } from "@/lib/creator/universe/rules";
import { customFor } from "@/lib/creator/universe/showroom";
import { Emblem } from "./Character";
import { CharacterViewer, useReducedMotion } from "./Viewer";
import { AchievementShare } from "./Share";

/** Milestone reveal: world transition, animated entrance, signature move, then victory pose. */
export function UniverseCelebration() {
  const { universe: u, change } = useUniverse();
  const [share, setShare] = useState(false);
  const [take, setTake] = useState(0);
  const [lit, setLit] = useState(false);
  const reduced = useReducedMotion();
  const pending = u.achievements.filter((a) => !a.celebrated && isAchieved(u, a.level)).at(-1);
  const milestone = MILESTONES.find((m) => m.level === pending?.level);
  const cast = CAST[u.style];
  const look = customFor(u, u.style);
  useEffect(() => {
    if (!milestone) return;
    setLit(false);
    const id = window.setTimeout(() => setLit(true), reduced ? 0 : 700);
    return () => window.clearTimeout(id);
  }, [milestone, take, reduced]);
  const finish = (collect: boolean) => {
    const levels = u.achievements.filter((a) => isAchieved(u, a.level)).map((a) => a.level);
    change({
      achievements: u.achievements.map((a) => (isAchieved(u, a.level) ? { ...a, celebrated: true } : a)),
      showroom: collect ? { ...u.showroom, collected: Array.from(new Set([...u.showroom.collected, ...levels])) } : u.showroom,
    });
    if (collect) toast.success("Added to your collection", { description: `${cast.name} · ${milestone?.title}` });
  };
  return (
    <Dialog open={Boolean(milestone)} onOpenChange={(v) => { if (!v) finish(false); }}>
      <DialogContent className="universe-celebration max-h-[96dvh] max-w-3xl grid-cols-[minmax(0,1fr)] overflow-y-auto border-on-dark/20 p-0 text-on-dark sm:p-0">
        {milestone && (
          <>
            <div className="relative">
              <CharacterViewer
                key={take}
                style={u.style}
                form={milestone.level}
                look={{ ...look, world: lit ? (look.world === "studio" ? cast.world : look.world) : "studio" }}
                intro={["entrance", "signature", "victory"]}
                compact
                hideControls
                label={u.alias || cast.name}
                className="rounded-none border-0"
              />
              {lit && !reduced && <div key={`f${take}`} className="universe-reveal-flash" aria-hidden="true" />}
            </div>
            <div className="relative space-y-4 px-5 pb-6 pt-4 text-center sm:px-8">
              <DialogHeader className="text-center sm:text-center">
                <p className="text-xs font-bold uppercase text-lime">New character unlocked</p>
                <DialogTitle className="mt-1 text-3xl">Congratulations, Creator.</DialogTitle>
                <DialogDescription className="text-on-dark-muted">
                  {cast.name} evolved into its {milestone.title} form. {milestone.upgrade}.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center gap-3">
                <Emblem level={milestone.level} />
                <div className="text-left">
                  <p className="text-xs text-on-dark-muted">Level {milestone.level} · {usd(milestone.threshold)} eligible earnings</p>
                  <h2 className="text-2xl">{milestone.title}</h2>
                </div>
              </div>
              <p className="text-sm text-on-dark-muted">{milestone.identity}. Signature move: {cast.moves.signature.name}.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="lime" onClick={() => finish(true)}><Plus /> Add to collection</Button>
                <Button variant="outline" className="border-sidebar-border bg-sidebar-accent text-on-dark hover:bg-sidebar-accent hover:text-lime" onClick={() => setTake((t) => t + 1)}>
                  <RotateCcw /> Replay
                </Button>
                <Button variant="outline" className="border-sidebar-border bg-sidebar-accent text-on-dark hover:bg-sidebar-accent hover:text-lime" onClick={() => setShare(true)}>
                  <Share2 /> Share achievement
                </Button>
              </div>
              <Button variant="ghost" className="text-on-dark-muted hover:bg-sidebar-accent hover:text-on-dark" onClick={() => finish(false)}>
                Continue exploring
              </Button>
              <AchievementShare level={milestone.level} open={share} onOpenChange={setShare} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
