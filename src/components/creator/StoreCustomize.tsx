import { Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Eye, Monitor, Smartphone, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { EmptyState, PageHeader } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import { Switch } from "@/components/dashboard-ui/switch";
import { useCreator } from "@/lib/creator/store";
import { cn } from "@/lib/utils";

import { StorePageSettings } from "./StorePageSettings";

const SIZES = { phone: { w: 390, h: 780 }, desktop: { w: 1280, h: 860 } } as const;
type Device = keyof typeof SIZES;

/** The whole public page in a real browser frame, scaled to fit; updates as the creator edits. */
function PreviewFrame({ handle, device, tall }: { handle: string; device: Device; tall?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e?.contentRect.width ?? 0));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const size = SIZES[device];
  const scale = width ? Math.min(1, width / size.w) : 0;
  const h = tall && device === "phone" ? size.h : size.h;
  return (
    <div ref={box} className="w-full">
      <div className={cn("mx-auto overflow-hidden bg-background shadow-lift ring-1 ring-line", device === "phone" ? "rounded-[28px] ring-[6px] ring-midnight" : "rounded-xl")} style={{ width: size.w * scale, height: h * scale }}>
        {scale > 0 && (
          <iframe
            title={`Storefront preview on a ${device}`}
            src={`/store/${handle}?preview=1`}
            className="origin-top-left border-0"
            style={{ width: size.w, height: h, transform: `scale(${scale})` }}
          />
        )}
      </div>
    </div>
  );
}

function DeviceToggle({ device, onChange }: { device: Device; onChange: (d: Device) => void }) {
  return (
    <div role="radiogroup" aria-label="Preview size" className="grid grid-cols-2 gap-1 rounded-full border bg-soft p-1">
      {([["phone", "Phone", Smartphone], ["desktop", "Desktop", Monitor]] as const).map(([id, label, I]) => (
        <button key={id} type="button" role="radio" aria-checked={device === id} onClick={() => onChange(id)} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-bold transition-colors", device === id ? "bg-card text-cobalt shadow-sm ring-1 ring-line" : "text-muted-foreground hover:text-foreground")}>
          <I className="h-4 w-4" aria-hidden="true" />{label}
        </button>
      ))}
    </div>
  );
}

export function StoreCustomizePage() {
  const { state } = useCreator();
  const handle = state.storefront.handle.toLowerCase();
  const [sample, setSample] = useState(false);
  const [device, setDevice] = useState<Device>("phone");
  const [open, setOpen] = useState(false);

  const back = <Button asChild variant="quiet" size="sm"><Link to="/creator/storefront"><ArrowLeft />Storefront</Link></Button>;

  if (!handle) {
    return (
      <div>
        <div className="mb-3">{back}</div>
        <PageHeader eyebrow="Your store" title="Customise your page" description="Choose how your public creator page looks." />
        <div className="surface"><EmptyState icon={Store} title="Add your store name and link first" description="Your page needs a name and a link before you can design and preview it." action={<Button asChild><Link to="/creator/storefront">Set up storefront</Link></Button>} /></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">{back}</div>
      <PageHeader
        eyebrow="Your store"
        title="Customise your page"
        description="Colour, story, video, links and which products show first. The preview shows your full page as visitors will see it."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex h-11 items-center gap-2 rounded-full border bg-card px-4 text-[13px] font-bold">Sample data <Switch checked={sample} onCheckedChange={setSample} aria-label="Show sample data in the preview" /></label>
            <Button asChild variant="outline"><a href={`/store/${handle}?preview=1`} target="_blank" rel="noopener noreferrer"><ExternalLink />Open full preview</a></Button>
          </div>
        }
      />
      {sample && <p className="mb-4 rounded-2xl bg-ice px-4 py-3 text-[13px] font-semibold text-ink dark:bg-soft">Sample data is on: the preview fills empty sections with sample products, achievements and testimonials so you can see the whole page. Nothing sample is saved or shown to visitors.</p>}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0"><StorePageSettings sample={sample} /></div>
        <aside className="hidden xl:block" aria-label="Live preview">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-extrabold"><Eye className="h-4 w-4 text-cobalt" aria-hidden="true" />Live preview</p>
              <DeviceToggle device={device} onChange={setDevice} />
            </div>
            <PreviewFrame handle={handle} device={device} />
          </div>
        </aside>
      </div>

      <div className="sticky bottom-4 z-(--z-sticky) mt-6 flex justify-center xl:hidden">
        <Button type="button" size="lg" className="shadow-lift" onClick={() => setOpen(true)}><Eye />Preview page</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
            <DialogDescription>Your full page, including changes you haven't saved yet.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center"><DeviceToggle device={device} onChange={setDevice} /></div>
          <PreviewFrame handle={handle} device={device} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
