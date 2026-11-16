import { useState } from "react";
import { Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/dashboard-ui/dialog";
import { Logo } from "@/components/affiliate/Logo";
import logo from "@/assets/dashboard/brand/enski-logo-white.webp";
import { useUniverse } from "@/lib/creator/universe/use-universe";
import { MILESTONES, isAchieved } from "@/lib/creator/universe/rules";
import { characterSource } from "@/lib/creator/universe/art";
import { Character, Emblem } from "./Character";
export function AchievementShare({
  level,
  open,
  onOpenChange,
}: {
  level: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { universe: u, profile } = useUniverse();
  const [busy, setBusy] = useState(false);
  const milestone = MILESTONES.find((m) => m.level === level);
  const achievement = u.achievements.find((a) => a.level === level);
  const allowed = isAchieved(u, level);
  const name = `${profile.firstName} ${profile.lastName}`;
  const date = achievement
    ? new Date(achievement.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const download = async () => {
    if (!allowed || !milestone || !achievement) return;
    setBusy(true);
    try {
      await document.fonts.ready;
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Image export unavailable");
      const tokens = getComputedStyle(document.documentElement);
      const color = (key: string) => tokens.getPropertyValue(key).trim();
      ctx.fillStyle = color("--midnight");
      ctx.fillRect(0, 0, 1080, 1350);
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      const [art, brand] = await Promise.all([load(characterSource(u.style, level)), load(logo)]);
      ctx.drawImage(brand, 64, 55, 155, 57);
      ctx.strokeStyle = color("--sky");
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 1020, 1290);
      ctx.fillStyle = color("--lime");
      ctx.font = 'bold 22px "Plus Jakarta Sans Variable"';
      ctx.fillText("CREATOR UNIVERSE · ACHIEVEMENT", 64, 170);
      ctx.drawImage(art, 190, 200, 700, 700);
      ctx.fillStyle = color("--on-dark");
      ctx.textAlign = "center";
      ctx.font = '800 82px "Plus Jakarta Sans Variable"';
      ctx.fillText(milestone.title, 540, 1010);
      ctx.fillStyle = color("--lime");
      ctx.font = 'bold 26px "Plus Jakarta Sans Variable"';
      ctx.fillText(`LEVEL ${level} · ENSKI CREATOR`, 540, 1060);
      ctx.fillStyle = color("--on-dark");
      let size = 38;
      ctx.font = `bold ${size}px "Plus Jakarta Sans Variable"`;
      while (ctx.measureText(name).width > 920 && size > 14) {
        size -= 2;
        ctx.font = `bold ${size}px "Plus Jakarta Sans Variable"`;
      }
      ctx.fillText(name, 540, 1140);
      ctx.fillStyle = color("--on-dark-muted");
      ctx.font = '22px "Plus Jakarta Sans Variable"';
      ctx.fillText(date, 540, 1200);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png"),
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enski-${milestone.title.toLowerCase()}-achievement.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Achievement card downloaded");
    } catch {
      toast.error("Could not create the image. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share your achievement</DialogTitle>
          <DialogDescription>Enski-branded achievement card</DialogDescription>
        </DialogHeader>
        {allowed && milestone && achievement ? (
          <>
            <div className="universe-share">
              <Logo className="h-7 w-auto" />
              <p className="mt-4 text-xs font-bold uppercase text-lime">
                Creator Universe · Achievement
              </p>
              <Character style={u.style} level={level} className="mx-auto h-56 w-56" />
              <div className="flex items-center justify-center gap-3">
                <Emblem level={level} />
                <h2 className="text-3xl">{milestone.title}</h2>
              </div>
              <p className="mt-2 text-xs font-bold text-lime">LEVEL {level} · ENSKI CREATOR</p>
              <p className="mt-5 break-words text-lg font-bold">{name}</p>
              <p className="mt-2 text-xs text-on-dark-muted">{date}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={download} disabled={busy}>
                <Download />
                {busy ? "Creating image…" : "Download PNG"}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${name} unlocked ${milestone.title}, Level ${level}, in the Enski Creator Universe on ${date}.`,
                    );
                    toast.success("Achievement text copied");
                  } catch {
                    toast.error("Clipboard unavailable. Download your card instead.");
                  }
                }}
              >
                <Share2 />
                Copy share text
              </Button>
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Reach this milestone before sharing an achievement.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
