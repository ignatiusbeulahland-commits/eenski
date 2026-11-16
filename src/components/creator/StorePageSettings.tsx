import { ArrowDown, ArrowUp, Eye, EyeOff, Film, Link2, Loader2, Plus, Sparkles, Star, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Field } from "@/components/affiliate/Field";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { ACCENT, safeUrl } from "@/components/storefront/parts";
import { kindInfo } from "@/lib/creator/data";
import { draftKey, orderedItems } from "@/lib/creator/publicStore";
import { deleteMedia, putMedia } from "@/lib/creator/mediaVault";
import { MEDIA_LIMITS, fileSize } from "@/lib/creator/mediaRules";
import { STORE_ACCENTS, type CreatorState } from "@/lib/creator/rules";
import { activityEntry, useCreator } from "@/lib/creator/store";
import { cn } from "@/lib/utils";

type Page = CreatorState["storePage"];
const uid = () => Math.random().toString(36).slice(2, 10);
const SOCIALS: { key: keyof Page["socials"]; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "instagram.com/yourname" },
  { key: "youtube", label: "YouTube", placeholder: "youtube.com/@yourname" },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/yourname" },
  { key: "tiktok", label: "TikTok", placeholder: "tiktok.com/@yourname" },
  { key: "x", label: "X", placeholder: "x.com/yourname" },
];

/** Controlled customisation for the public creator page (no free styling). */
export function StorePageSettings({ sample = false }: { sample?: boolean }) {
  const { state, update } = useCreator();
  const [p, setP] = useState<Page>(state.storePage);
  const handle = state.storefront.handle;
  const videoInput = useRef<HTMLInputElement>(null);
  const [videoMode, setVideoMode] = useState<"upload" | "link">(state.storePage.video.startsWith("vault:") || !state.storePage.video ? "upload" : "link");
  const [videoBusy, setVideoBusy] = useState(false);
  const uploaded = p.video.startsWith("vault:");

  // Share unsaved changes with the preview window so it updates while editing.
  useEffect(() => {
    if (!handle) return;
    try { localStorage.setItem(draftKey(handle), JSON.stringify({ page: p, sample })); } catch { /* preview just shows the saved page */ }
  }, [p, sample, handle]);
  useEffect(() => () => { if (handle) try { localStorage.removeItem(draftKey(handle)); } catch { /* ignore */ } }, [handle]);

  const takeVideo = async (file?: File) => {
    if (videoInput.current) videoInput.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) { toast.error("Choose a video file", { description: "MP4, MOV or WebM from your files or gallery." }); return; }
    if (file.size > MEDIA_LIMITS.video) { toast.error("That video is too large", { description: `Choose one under ${fileSize(MEDIA_LIMITS.video)}.` }); return; }
    setVideoBusy(true);
    const id = `intro-${Date.now().toString(36)}`;
    try {
      await putMedia(id, file);
      set({ video: `vault:${id}`, videoName: file.name });
      toast.success("Video added", { description: "Save your page to publish it." });
    } catch {
      toast.error("We couldn't keep that video", { description: "Your browser is out of space. Remove some files from Media Library and try again." });
    } finally { setVideoBusy(false); }
  };
  const published = state.items.filter((i) => i.status === "published" && !i.binnedAt);
  const ordered = orderedItems(published, { order: p.order, hiddenIds: [] });
  const dirty = JSON.stringify(p) !== JSON.stringify(state.storePage);
  const set = (patch: Partial<Page>) => setP((cur) => ({ ...cur, ...patch }));

  const move = (id: string, d: -1 | 1) => {
    const ids = ordered.map((i) => i.id);
    const n = ids.indexOf(id);
    const m = n + d;
    if (m < 0 || m >= ids.length) return;
    [ids[n], ids[m]] = [ids[m]!, ids[n]!];
    set({ order: ids });
  };

  const save = () => {
    const bad = [...SOCIALS.map((s) => p.socials[s.key]), p.portfolio, uploaded ? "" : p.video].find((u) => u.trim() && !safeUrl(u));
    if (bad) { toast.error("One of your links isn't a web address", { description: bad }); return; }
    const old = state.storePage.video;
    if (old.startsWith("vault:") && old !== p.video) void deleteMedia(old.slice(6));
    update((s) => ({ storePage: { ...p, achievements: p.achievements.filter((a) => a.title.trim()), testimonials: p.testimonials.filter((t) => t.quote.trim() && t.name.trim()) }, activity: [...s.activity, activityEntry("Creator page updated")] }));
    toast.success("Creator page saved");
  };

  return (
    <section className="surface overflow-hidden" aria-labelledby="page-settings-title">
      <header className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ice text-cobalt ring-1 ring-line" aria-hidden="true"><Sparkles className="h-[18px] w-[18px]" /></span>
        <div><h2 id="page-settings-title" className="text-[15px] font-extrabold">Creator page</h2><p className="text-[13px] text-muted-foreground">Accent colour, links, achievements and which products show first. Empty sections stay hidden.</p></div>
      </header>

      <div className="grid gap-6 p-5 sm:p-6">
        <div>
          <p className="mb-2 text-sm font-bold">Accent colour</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Accent colour">
            {STORE_ACCENTS.map((a) => (
              <button key={a} type="button" role="radio" aria-checked={p.accent === a} onClick={() => set({ accent: a })} className={cn("inline-flex h-11 items-center gap-2 rounded-full border bg-card px-3 text-sm font-bold", p.accent === a && "ring-2 ring-offset-2 ring-offset-card " + ACCENT[a].ring)}>
                <span className={cn("h-5 w-5 rounded-full", ACCENT[a].solid)} aria-hidden="true" />{ACCENT[a].label}
              </button>
            ))}
          </div>
        </div>

        <Field id="banner-y" label="Banner position" hint="Move the banner up or down so the best part shows">
          <input id="banner-y" type="range" min={0} max={100} value={p.bannerY} onChange={(e) => set({ bannerY: Number(e.target.value) })} className="w-full accent-cobalt" />
        </Field>

        <Field id="page-bio" label="Full biography" hint={`${p.bio.length}/2000 · visitors see three lines, then Read more`}>
          <Textarea id="page-bio" rows={5} maxLength={2000} value={p.bio} onChange={(e) => set({ bio: e.target.value })} placeholder="Your story, experience and who you help." />
        </Field>

        <div>
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold">Welcome video <span className="font-semibold text-muted-foreground">· optional</span></p>
            <div role="radiogroup" aria-label="How to add your video" className="grid grid-cols-2 gap-1 rounded-full border bg-soft p-1">
              {([["upload", "Upload video", Upload], ["link", "Paste a link", Link2]] as const).map(([id, label, I]) => (
                <button key={id} type="button" role="radio" aria-checked={videoMode === id} onClick={() => setVideoMode(id)} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-bold transition-colors", videoMode === id ? "bg-card text-cobalt shadow-sm ring-1 ring-line" : "text-muted-foreground hover:text-foreground")}>
                  <I className="h-4 w-4" aria-hidden="true" />{label}
                </button>
              ))}
            </div>
          </div>
          {videoMode === "upload" ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-dashed bg-soft/50 p-4 sm:flex-row sm:items-center">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ice text-cobalt" aria-hidden="true"><Film className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{uploaded ? p.videoName || "Your video" : "Choose a video from your files or gallery"}</p>
                <p className="text-xs text-muted-foreground">MP4, MOV or WebM · up to {fileSize(MEDIA_LIMITS.video)} · a short hello of 30–90 seconds works best</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={videoBusy} onClick={() => videoInput.current?.click()}>{videoBusy ? <Loader2 className="animate-spin" /> : <Upload />}{uploaded ? "Replace" : "Upload"}</Button>
                {uploaded && <Button type="button" variant="quiet" size="sm" onClick={() => set({ video: "", videoName: "" })}><Trash2 />Remove</Button>}
              </div>
              <input ref={videoInput} type="file" accept="video/*" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => void takeVideo(e.target.files?.[0])} />
            </div>
          ) : (
            <Field id="page-video" label="Video link" hint="YouTube, Vimeo or a link to a video file">
              <Input id="page-video" value={uploaded ? "" : p.video} onChange={(e) => set({ video: e.target.value, videoName: "" })} placeholder="youtube.com/watch?v=…" />
            </Field>
          )}
        </div>

        <div>
          <p className="mb-1 text-sm font-bold">Links <span className="font-semibold text-muted-foreground">· all optional, only the ones you fill in show</span></p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="page-portfolio" label="Portfolio (optional)">
              <Input id="page-portfolio" value={p.portfolio} onChange={(e) => set({ portfolio: e.target.value })} placeholder="yourportfolio.com" />
            </Field>
            {SOCIALS.map((s) => (
              <Field key={s.key} id={`social-${s.key}`} label={`${s.label} (optional)`}>
                <Input id={`social-${s.key}`} value={p.socials[s.key]} onChange={(e) => set({ socials: { ...p.socials, [s.key]: e.target.value } })} placeholder={s.placeholder} />
              </Field>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold">Achievements <span className="font-semibold text-muted-foreground">· first three show on your page</span></p>
            <Button type="button" size="sm" variant="outline" disabled={p.achievements.length >= 8} onClick={() => set({ achievements: [...p.achievements, { id: uid(), title: "", detail: "" }] })}><Plus />Add</Button></div>
          <div className="space-y-2">
            {p.achievements.map((a, n) => (
              <div key={a.id} className="flex flex-col gap-2 rounded-2xl bg-soft p-2.5 sm:flex-row">
                <Input aria-label={`Achievement ${n + 1}`} value={a.title} maxLength={40} placeholder="e.g. 2,500+ students trained" onChange={(e) => set({ achievements: p.achievements.map((x) => x.id === a.id ? { ...x, title: e.target.value } : x) })} />
                <Input aria-label={`Achievement ${n + 1} detail`} value={a.detail} maxLength={60} placeholder="Short detail (optional)" onChange={(e) => set({ achievements: p.achievements.map((x) => x.id === a.id ? { ...x, detail: e.target.value } : x) })} />
                <Button type="button" variant="quiet" size="icon" aria-label="Remove achievement" onClick={() => set({ achievements: p.achievements.filter((x) => x.id !== a.id) })}><Trash2 /></Button>
              </div>
            ))}
          </div>
        </div>

        {ordered.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-bold">Products on your page <span className="font-semibold text-muted-foreground">· star one to feature it</span></p>
            <ul className="divide-y rounded-2xl border">
              {ordered.map((i, n) => {
                const hidden = p.hiddenIds.includes(i.id);
                const feat = p.featuredId === i.id;
                return (
                  <li key={i.id} className={cn("flex items-center gap-1 px-3 py-1.5", hidden && "opacity-60")}>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{i.title}</p><p className="text-xs text-muted-foreground">{kindInfo[i.kind].label}{hidden ? " · hidden" : ""}{feat ? " · featured" : ""}</p></div>
                    <Button type="button" variant="quiet" size="icon" aria-pressed={feat} aria-label={feat ? "Stop featuring" : "Feature this product"} onClick={() => set({ featuredId: feat ? "" : i.id, hiddenIds: p.hiddenIds.filter((x) => x !== i.id) })}><Star className={cn(feat && "fill-current text-lime-press")} /></Button>
                    <Button type="button" variant="quiet" size="icon" aria-label={hidden ? "Show on page" : "Hide from page"} onClick={() => set({ hiddenIds: hidden ? p.hiddenIds.filter((x) => x !== i.id) : [...p.hiddenIds, i.id], featuredId: !hidden && feat ? "" : p.featuredId })}>{hidden ? <EyeOff /> : <Eye />}</Button>
                    <Button type="button" variant="quiet" size="icon" aria-label="Move up" disabled={n === 0} onClick={() => move(i.id, -1)}><ArrowUp /></Button>
                    <Button type="button" variant="quiet" size="icon" aria-label="Move down" disabled={n === ordered.length - 1} onClick={() => move(i.id, 1)}><ArrowDown /></Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div>
          <div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold">Testimonials <span className="font-semibold text-muted-foreground">· marked "Shared by creator"</span></p>
            <Button type="button" size="sm" variant="outline" disabled={p.testimonials.length >= 12} onClick={() => set({ testimonials: [...p.testimonials, { id: uid(), name: "", quote: "", itemId: "", rating: 5 }] })}><Plus />Add</Button></div>
          <div className="space-y-2">
            {p.testimonials.map((t, n) => {
              const patch = (v: Partial<typeof t>) => set({ testimonials: p.testimonials.map((x) => x.id === t.id ? { ...x, ...v } : x) });
              return (
                <div key={t.id} className="grid gap-2 rounded-2xl bg-soft p-2.5 sm:grid-cols-[1fr_1fr_auto]">
                  <Input aria-label={`Testimonial ${n + 1} name`} value={t.name} maxLength={60} placeholder="Customer name" onChange={(e) => patch({ name: e.target.value })} />
                  <select aria-label={`Testimonial ${n + 1} product`} value={t.itemId} onChange={(e) => patch({ itemId: e.target.value })} className="h-12 rounded-[14px] border-[1.5px] border-input bg-card px-3 text-sm">
                    <option value="">No product</option>
                    {published.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
                  </select>
                  <Button type="button" variant="quiet" size="icon" aria-label="Remove testimonial" onClick={() => set({ testimonials: p.testimonials.filter((x) => x.id !== t.id) })}><Trash2 /></Button>
                  <Textarea aria-label={`Testimonial ${n + 1}`} rows={2} maxLength={400} value={t.quote} placeholder="What they said" onChange={(e) => patch({ quote: e.target.value })} className="sm:col-span-3" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t bg-soft/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[13px] font-semibold text-muted-foreground">{dirty ? "You have unsaved changes" : "All changes saved"}</p>
        <div className="flex gap-2">
          {dirty && <Button type="button" variant="quiet" onClick={() => setP(state.storePage)}>Discard</Button>}
          <Button type="button" onClick={save}>Save creator page</Button>
        </div>
      </div>
    </section>
  );
}
