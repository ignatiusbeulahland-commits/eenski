import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArchiveRestore, Trash2, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { ConfirmDialog, ConfirmNote } from "@/components/shared/BrandDialog";
import { brandArtwork } from "@/components/affiliate/BrandIcon";
import { undoToast } from "@/lib/shared/undo";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { kindInfo } from "@/lib/creator/data";
import { deleteForever, deleteForeverBlock, moveToBin, ownFileIds, restoreFromBin } from "@/lib/creator/bin";
import { deleteMedia } from "@/lib/creator/mediaVault";
import type { CreatorItem, ItemKind } from "@/lib/creator/rules";
import { itemPaths } from "../shared";
import { ProductCover } from "./ProductChrome";
import { priceLabel } from "./registry";

const binDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";

/** Move to Bin / Restore / Delete forever, shared by the product list and product page. */
export function useBinActions() {
  const { update } = useCreator();
  const restore = (item: CreatorItem, quiet = false) => {
    update((s) => ({
      items: restoreFromBin(s, item.id),
      activity: [...s.activity, activityEntry(`${kindInfo[item.kind].label} restored from Bin: ${item.title}`)],
    }));
    if (!quiet) toast.success(`${kindInfo[item.kind].label} restored`);
  };
  const bin = (item: CreatorItem) => {
    update((s) => ({
      items: moveToBin(s, item.id),
      activity: [...s.activity, activityEntry(`${kindInfo[item.kind].label} moved to Bin: ${item.title}`)],
    }));
    undoToast(`${kindInfo[item.kind].label} moved to Bin`, () => restore(item, true), {
      description: "Restore it any time from the Bin.",
    });
  };
  const remove = (item: CreatorItem) => {
    let ok = false;
    update((s) => {
      const next = deleteForever(s, item.id);
      ok = Boolean(next);
      return next ? { ...next, activity: [...s.activity, activityEntry(`${kindInfo[item.kind].label} deleted: ${item.title}`)] } : {};
    });
    if (ok) {
      ownFileIds(item).forEach((fid) => void deleteMedia(fid));
      toast.success(`${kindInfo[item.kind].label} deleted for good`);
    }
    return ok;
  };
  return { bin, restore, remove };
}

/** Confirms moving a product to the Bin. Published products go offline first. */
export function MoveToBinDialog({ item, onOpenChange, onDone }: { item: CreatorItem | null; onOpenChange: (open: boolean) => void; onDone?: () => void }) {
  const { bin } = useBinActions();
  const info = kindInfo[item?.kind ?? "course"];
  return (
    <ConfirmDialog
      open={Boolean(item)}
      onOpenChange={onOpenChange}
      art={brandArtwork.bin}
      eyebrow={info.label}
      title={`Move this ${info.noun} to the Bin?`}
      description={
        item?.status === "published"
          ? `“${item.title}” is live. It comes off your storefront straight away and buyers can no longer find it.`
          : `“${item?.title ?? ""}” moves out of your ${info.nouns} list.`
      }
      confirmLabel="Move to Bin"
      confirmIcon={<Trash2 />}
      onConfirm={() => {
        if (item) bin(item);
        onDone?.();
      }}
    >
      <ConfirmNote icon={<ArchiveRestore />}>Past orders stay safe, and you can restore it from the Bin any time.</ConfirmNote>
    </ConfirmDialog>
  );
}

/** Confirms deleting a product for good. Blocked when anyone has bought it. */
export function DeleteForeverDialog({ item, onOpenChange, onDone }: { item: CreatorItem | null; onOpenChange: (open: boolean) => void; onDone?: () => void }) {
  const { state } = useCreator();
  const { remove } = useBinActions();
  const info = kindInfo[item?.kind ?? "course"];
  const linked = item ? state.landingPages.filter((l) => l.itemId === item.id).length : 0;
  const coupons = item ? state.promotions.filter((p) => p.itemId === item.id).length : 0;
  return (
    <ConfirmDialog
      open={Boolean(item)}
      onOpenChange={onOpenChange}
      art={brandArtwork.bin}
      eyebrow="Bin"
      title={`Delete this ${info.noun} for good?`}
      description={`“${item?.title ?? ""}” and its content will be removed. This can't be undone.`}
      confirmLabel="Delete for good"
      confirmIcon={<Trash2 />}
      onConfirm={() => {
        if (item && remove(item)) onDone?.();
      }}
    >
      {(linked > 0 || coupons > 0) && (
        <ConfirmNote icon={<Info />}>
          {coupons > 0 && `${coupons} ${coupons === 1 ? "coupon" : "coupons"} for it will be deleted too. `}
          {linked > 0 && `${linked} landing ${linked === 1 ? "page goes" : "pages go"} back to draft with no product.`}
        </ConfirmNote>
      )}
    </ConfirmDialog>
  );
}

/** Products of one kind sitting in the Bin, with Restore and Delete forever. */
export function BinList({ kind, items }: { kind: ItemKind; items: CreatorItem[] }) {
  const { state } = useCreator();
  const { restore } = useBinActions();
  const [del, setDel] = useState<CreatorItem | null>(null);
  const info = kindInfo[kind];
  return (
    <section aria-labelledby="bin-heading">
      <div className="mb-4 flex items-start gap-3 rounded-2xl bg-ice p-4 ring-1 ring-cobalt-100">
        <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-cobalt" aria-hidden="true" />
        <div className="min-w-0">
          <h2 id="bin-heading" className="text-base">Bin · {items.length} {items.length === 1 ? info.noun : info.nouns}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {info.plural} here are off your storefront. Restore puts one back as it was. Delete for good removes it completely.
          </p>
        </div>
      </div>
      {!items.length ? (
        <div className="surface p-8 text-center">
          <Trash2 className="mx-auto h-9 w-9 text-cobalt-300" aria-hidden="true" />
          <h3 className="mt-3 text-base">The Bin is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">{info.plural} you move to the Bin will show up here.</p>
        </div>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {items.map((i) => {
            const block = deleteForeverBlock(state, i.id);
            return (
              <li key={i.id} className="surface flex min-w-0 items-start gap-3 p-3 sm:items-center">
                <ProductCover src={i.image} alt={`${i.title} cover`} kind={kind} className="aspect-[4/3] w-20 shrink-0 rounded-xl opacity-80 grayscale-[35%] sm:w-32" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">{i.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {priceLabel(i)} · Was {i.binnedFrom ?? "draft"} · Binned {binDate(i.binnedAt)}
                  </p>
                  {block && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info className="mt-px h-3.5 w-3.5 shrink-0 text-cobalt" aria-hidden="true" />
                      {block}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="soft" onClick={() => restore(i)}>
                      <ArchiveRestore />
                      Restore
                    </Button>
                    {!block && (
                      <Button size="sm" variant="quiet" className="text-destructive hover:text-destructive" onClick={() => setDel(i)}>
                        <Trash2 />
                        Delete for good
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <DeleteForeverDialog item={del} onOpenChange={(o) => !o && setDel(null)} />
    </section>
  );
}

/** Shown at the top of a product page while that product is in the Bin. */
export function BinnedNotice({ item }: { item: CreatorItem }) {
  const { state } = useCreator();
  const { restore } = useBinActions();
  const navigate = useNavigate();
  const [del, setDel] = useState<CreatorItem | null>(null);
  const block = deleteForeverBlock(state, item.id);
  const info = kindInfo[item.kind];
  return (
    <div role="status" className="mb-4 flex flex-col gap-3 rounded-2xl bg-ice p-4 ring-1 ring-cobalt-100 sm:flex-row sm:items-center">
      <Trash2 className="h-5 w-5 shrink-0 text-cobalt" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold">This {info.noun} is in the Bin</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          It's off your storefront. {block || "Restore it to keep working on it, or delete it for good."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => restore(item)}>
          <ArchiveRestore />
          Restore
        </Button>
        {!block && (
          <Button size="sm" variant="quiet" className="text-destructive hover:text-destructive" onClick={() => setDel(item)}>
            <Trash2 />
            Delete for good
          </Button>
        )}
      </div>
      <DeleteForeverDialog
        item={del}
        onOpenChange={(o) => !o && setDel(null)}
        onDone={() => navigate({ to: itemPaths[item.kind].list })}
      />
    </div>
  );
}
