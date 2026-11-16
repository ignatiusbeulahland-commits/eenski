import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/dashboard-ui/dialog";
import logo from "@/assets/dashboard/brand/enski-logo-white.webp";
import { useCreator } from "@/lib/creator/store";
import { characterSource } from "@/lib/creator/universe/art";
import { showcaseCardDetails, type ShowcaseCardDetails } from "@/lib/creator/universe/showroom";
import { deliverFile } from "@/lib/download";

const W = 1080;
const H = 1350;
const FONT = '"Plus Jakarta Sans Variable", "Plus Jakarta Sans", sans-serif';

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Shrinks the font until the text fits on one line. */
function fit(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, max: number, min = 16) {
  let s = size;
  ctx.font = `${weight} ${s}px ${FONT}`;
  while (ctx.measureText(text).width > max && s > min) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${FONT}`;
  }
  return s;
}

/** Word-wraps into at most `lines` lines, ending with an ellipsis when cut. */
function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines: number) {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width <= max) line = next;
    else {
      out.push(line);
      line = w;
      if (out.length === lines) break;
    }
  }
  if (out.length < lines && line) out.push(line);
  if (out.length === lines && out.join(" ").length < text.length) {
    let last = out[lines - 1]!;
    while (last && ctx.measureText(`${last}…`).width > max) last = last.slice(0, -1);
    out[lines - 1] = `${last.trimEnd()}…`;
  }
  return out;
}

function panel(
  ctx: CanvasRenderingContext2D,
  c: (k: string) => string,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  title: string,
  text: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 26);
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = c("--on-dark");
  ctx.fill();
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = c("--universe-gold");
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
  ctx.textAlign = "left";
  ctx.fillStyle = c("--lime");
  ctx.beginPath();
  ctx.arc(x + 32, y + 40, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `800 17px ${FONT}`;
  ctx.fillText(label, x + 46, y + 46);
  ctx.fillStyle = c("--on-dark");
  fit(ctx, title, 800, 32, w - 56);
  ctx.fillText(title, x + 28, y + 92);
  ctx.fillStyle = c("--on-dark-muted");
  ctx.font = `500 19px ${FONT}`;
  wrap(ctx, text, w - 56, 2).forEach((l, i) => ctx.fillText(l, x + 28, y + 128 + i * 27));
}

/** Draws the Enski character showcase card (1080×1350) and returns it as a PNG. */
export async function renderShowcaseCard(d: ShowcaseCardDetails, name: string): Promise<Blob> {
  await Promise.all([document.fonts.load(`800 72px ${FONT}`), document.fonts.load(`500 20px ${FONT}`)]).catch(() => undefined);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export unavailable");
  const tokens = getComputedStyle(document.documentElement);
  const c = (k: string) => tokens.getPropertyValue(k).trim();
  const [art, brand] = await Promise.all([load(characterSource(d.style, d.form)), load(logo)]);

  // Deep cobalt-to-midnight stage.
  const bg = ctx.createRadialGradient(560, 560, 40, 540, 620, 820);
  bg.addColorStop(0, c("--cobalt"));
  bg.addColorStop(0.5, c("--cobalt-press"));
  bg.addColorStop(1, c("--midnight"));
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Fine diagonal light lines.
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = c("--universe-silver");
  ctx.lineWidth = 1;
  for (let x = -H; x < W; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, H);
    ctx.lineTo(x + H * 0.47, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Scattered lime and white sparks (deterministic, so the card is stable).
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  ctx.save();
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.2 + rand() * 0.5;
    ctx.fillStyle = i % 3 ? c("--on-dark") : c("--lime");
    ctx.beginPath();
    ctx.arc(60 + rand() * (W - 120), 60 + rand() * 840, 0.8 + rand() * 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Gold double frame.
  ctx.save();
  ctx.strokeStyle = c("--universe-gold");
  ctx.globalAlpha = 0.75;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(34, 34, W - 68, H - 68, 40);
  ctx.stroke();
  ctx.globalAlpha = 0.25;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(48, 48, W - 96, H - 96, 30);
  ctx.stroke();
  ctx.restore();

  // Header.
  ctx.drawImage(brand, 84, 84, 150, 55);
  ctx.textAlign = "right";
  ctx.fillStyle = c("--lime");
  ctx.font = `800 20px ${FONT}`;
  ctx.fillText("CHARACTER SHOWCASE", W - 84, 112);
  ctx.fillStyle = c("--on-dark-muted");
  ctx.font = `600 18px ${FONT}`;
  ctx.fillText("Enski Creator Universe", W - 84, 140);

  // Pedestal: gold ring with a halo of lime dots.
  ctx.save();
  ctx.strokeStyle = c("--universe-gold");
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(540, 786, 260, 34, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(a));
    ctx.fillStyle = c("--lime");
    ctx.beginPath();
    ctx.arc(540 + Math.cos(a) * 320, 786 + Math.sin(a) * 50, i % 2 ? 3 : 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.shadowColor = c("--midnight");
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.drawImage(art, 240, 170, 600, 600);
  ctx.restore();

  if (d.preview) {
    ctx.save();
    ctx.font = `800 17px ${FONT}`;
    const t = "PREVIEW";
    const w = ctx.measureText(t).width + 40;
    ctx.beginPath();
    ctx.roundRect(540 - w / 2, 186, w, 38, 19);
    ctx.fillStyle = c("--midnight");
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = c("--lime");
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = c("--lime");
    ctx.textAlign = "center";
    ctx.fillText(t, 540, 211);
    ctx.restore();
  }

  // Character identity.
  ctx.textAlign = "center";
  ctx.fillStyle = c("--on-dark");
  fit(ctx, d.characterName, 800, 74, 900, 30);
  ctx.fillText(d.characterName, 540, 958);
  ctx.fillStyle = c("--universe-gold");
  const sub = `${d.persona} · ${d.rank}`.toUpperCase();
  fit(ctx, sub, 800, 22, 900, 14);
  ctx.fillText(sub, 540, 1002);

  panel(ctx, c, 84, 1040, 446, 180, "WORLD", d.world.name, d.world.mood);
  panel(ctx, c, 550, 1040, 446, 180, "SIGNATURE MOVE", d.move.name, d.move.description);

  // Creator.
  ctx.textAlign = "left";
  ctx.fillStyle = c("--on-dark");
  fit(ctx, name, 800, 32, d.handle ? 560 : 900, 16);
  ctx.fillText(name, 84, 1278);
  if (d.handle) {
    ctx.textAlign = "right";
    ctx.fillStyle = c("--lime");
    fit(ctx, d.handle, 700, 22, 320, 14);
    ctx.fillText(d.handle, W - 84, 1276);
  }

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png"),
  );
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character";

export function ShowcaseCardDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { state } = useCreator();
  const u = state.universe;
  const defaultName = `${state.profile.firstName} ${state.profile.lastName}`.trim();
  const [name, setName] = useState(defaultName);
  const [png, setPng] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputId = useId();
  const details = useMemo(
    () => showcaseCardDetails(u, { ...state.profile, handle: state.storefront.handle }),
    [u, state.profile, state.storefront.handle],
  );
  const clean = name.trim().slice(0, 60);

  useEffect(() => {
    if (open) setName((n) => n || defaultName);
  }, [open, defaultName]);

  // Draw the card ahead of the click so Download can save it immediately.
  useEffect(() => {
    if (!open || !clean) {
      setPng(null);
      return;
    }
    let live = true;
    setBusy(true);
    setFailed(false);
    const t = setTimeout(() => {
      renderShowcaseCard(details, clean)
        .then((blob) => {
          if (!live) return;
          setPng((old) => {
            if (old) URL.revokeObjectURL(old.url);
            return { blob, url: URL.createObjectURL(blob) };
          });
        })
        .catch(() => live && setFailed(true))
        .finally(() => live && setBusy(false));
    }, 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [open, clean, details]);

  const lastUrl = useRef("");
  useEffect(() => {
    lastUrl.current = png?.url ?? "";
  }, [png]);
  useEffect(() => () => {
    if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
  }, []);

  const download = () => {
    if (!png) return;
    void deliverFile(png.blob, `enski-${slug(details.characterName)}-showcase.png`);
    window.__lovableEvents?.track?.("project.showcase_card_downloaded", {
      character_style: details.style,
      is_preview: details.preview,
    });
    toast.success("Showcase card ready");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Character showcase card</DialogTitle>
          <DialogDescription>
            Your {details.preview ? "starter preview" : "character"}, world and signature move on one card.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor={inputId} className="text-[13px] font-bold">
            Name on card
          </Label>
          <Input
            id={inputId}
            value={name}
            maxLength={60}
            placeholder="Your name"
            onChange={(e) => setName(e.target.value)}
            aria-describedby={`${inputId}-hint`}
          />
          <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
            {clean ? (details.handle ? `Shown with ${details.handle}.` : "Shown at the bottom of the card.") : "Add your name to create the card."}
          </p>
        </div>
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-midnight ring-1 ring-universe-metal/40">
          {png ? (
            <img src={png.url} alt={`Showcase card for ${details.characterName}`} className="h-full w-full object-contain" />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-on-dark-muted">
              {failed ? "We couldn't create the card. Please try again." : clean ? "Creating your card…" : "Add your name to see your card."}
            </div>
          )}
          {busy && png && (
            <span className="absolute right-3 top-3 rounded-full bg-midnight/80 px-3 py-1 text-xs font-bold text-on-dark">Updating…</span>
          )}
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase text-muted-foreground">World</dt>
            <dd className="mt-0.5 font-bold">{details.world.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-muted-foreground">Signature move</dt>
            <dd className="mt-0.5 font-bold">{details.move.name}</dd>
          </div>
        </dl>
        <Button onClick={download} disabled={!png || busy}>
          <Download />
          {busy ? "Creating card…" : "Download PNG"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
