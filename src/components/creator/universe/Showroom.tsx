import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Palette, LayoutGrid, ImageDown, Lock } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import { CAST, type WorldId } from "@/lib/creator/universe/cast";
import { MILESTONES, usd, type CharacterStyle } from "@/lib/creator/universe/rules";
import { customFor, showroomSubject } from "@/lib/creator/universe/showroom";
import { CharacterViewer } from "./Viewer";
import { Eyebrow } from "./Character";
import { ShowcaseCardDialog } from "./ShowcaseCard";

/** Saves a world choice only when it belongs to an unlocked, owned view. */
export function useSaveWorld(style: CharacterStyle, preview: boolean) {
  const { universe: u, change } = useUniverse();
  return (w: WorldId) => {
    if (preview) return;
    const look = customFor(u, style);
    change({ showroom: { ...u.showroom, custom: { ...u.showroom.custom, [style]: { ...look, world: w } } } });
  };
}

export function Showroom() {
  const { universe: u } = useUniverse();
  const { style, form, preview, look } = showroomSubject(u);
  const cast = CAST[style];
  const [card, setCard] = useState(false);
  const saveWorld = useSaveWorld(style, preview);
  return (
    <section className="mt-6 sm:mt-8" aria-labelledby="showroom-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 max-w-full">
          <Eyebrow>Character showroom</Eyebrow>
          <h2 id="showroom-title" className="mt-2 text-xl sm:text-2xl">{u.alias || cast.name}</h2>
          <p className="mt-1 line-clamp-2 max-w-xl text-sm text-muted-foreground">{cast.personality}</p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Button size="sm" className="px-3 sm:px-4" onClick={() => setCard(true)}>
            <ImageDown /> <span className="sm:hidden">Card</span><span className="max-sm:hidden">Showcase card</span>
          </Button>
          <Button asChild variant="outline" size="sm" className="px-3 sm:px-4">
            <Link to="/creator/settings/character"><Palette /> Customise</Link>
          </Button>
          <Button asChild variant="quiet" size="sm" className="px-3 sm:px-4">
            <Link to="/creator/milestones/collection"><LayoutGrid /> Collection</Link>
          </Button>
        </div>
      </div>
      {preview && (
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-ice max-sm:hidden px-3.5 py-1.5 text-[13px] font-bold text-cobalt">
          <Lock className="h-3.5 w-3.5" /> Preview · unlocks at Spark ({usd(MILESTONES[0].threshold)})
        </p>
      )}
      <CharacterViewer style={style} form={form} look={look} preview={preview} onWorld={saveWorld} label={u.alias || cast.name} />
      <ShowcaseCardDialog open={card} onOpenChange={setCard} />
    </section>
  );
}
