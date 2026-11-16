import { useState } from "react";
import { Camera, Check, ImagePlus, Loader2, PenLine, Trash2, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Field } from "@/components/affiliate/Field";
import { useCropPicker } from "./CropPicker";
import { CreatorAvatar } from "./Header";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { BANNER_STYLES, HEADLINE_MAX, SUBLINE_MAX, renderBanner, tidyBannerWords, type BannerStyle } from "@/lib/creator/banner";
import { cn } from "@/lib/utils";

/** Profile photo picker shared by the storefront preview and the branding panel; checks 1080 × 1080, crops square, saves to the Creator profile. */
export function usePhotoPicker() {
  const { update } = useCreator();
  const picker = useCropPicker({
    aspect: 1,
    outWidth: 480,
    round: true,
    title: "Crop your profile photo",
    onDone: (photo) => {
      update((s) => ({ profile: { ...s.profile, photo }, activity: [...s.activity, activityEntry("Profile photo updated")] }));
      toast.success("Profile photo updated");
    },
  });
  return { open: picker.open, busy: picker.busy, input: picker.element };
}

/** Storefront avatar: the uploaded photo when there is one, otherwise the Creator avatar. */
export function StoreAvatar() {
  const { state } = useCreator();
  return state.profile.photo ? <img src={state.profile.photo} alt="Profile" className="rounded-full object-cover" /> : <CreatorAvatar />;
}

export function StorefrontBranding({ photo }: { photo: ReturnType<typeof usePhotoPicker> }) {
  const { state, update } = useCreator();
  const sf = state.storefront;
  const [mode, setMode] = useState<"design" | "upload">(sf.bannerSource === "upload" ? "upload" : "design");
  const [words, setWords] = useState(sf.bannerWords);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tidied, setTidied] = useState<null | { headline: string; subline: string }>(null);

  const saveBanner = (banner: string, bannerSource: "none" | "upload" | "designed", extra: Partial<typeof sf> = {}, note = "Storefront banner updated") =>
    update((s) => ({ storefront: { ...s.storefront, ...extra, banner, bannerSource }, activity: [...s.activity, activityEntry(note)] }));
  const bannerPicker = useCropPicker({ aspect: 3, outWidth: 1500, title: "Crop your banner", onDone: (v) => { saveBanner(v, "upload", {}, "Storefront banner uploaded"); toast.success("Banner uploaded"); } });

  const design = async () => {
    const t = tidyBannerWords(words.headline, words.subline);
    if (!t.headline) { setError("Add the main words for your banner."); return; }
    setError(""); setBusy(true);
    try {
      const banner = await renderBanner({ ...t, style: words.style, storeName: sf.name });
      const next = { ...words, ...t };
      setTidied(t.headline !== words.headline.trim() || t.subline !== words.subline.trim() ? t : null);
      setWords(next);
      saveBanner(banner, "designed", { bannerWords: next }, "Storefront banner designed");
      toast.success("Your banner is ready");
    } catch { setError("We couldn't design the banner. Try again."); }
    finally { setBusy(false); }
  };

  const hasPhoto = Boolean(state.profile.photo);

  return (
    <section id="store-branding" aria-labelledby="store-branding-title" className="surface mb-6 scroll-mt-24 overflow-hidden">
      <header className="flex items-center gap-3 border-b px-5 py-4 sm:px-6">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-ice text-cobalt ring-1 ring-line" aria-hidden="true"><ImagePlus className="h-[18px] w-[18px]" /></span>
        <div><h2 id="store-branding-title" className="text-[15px] font-extrabold">Banner and photo</h2><p className="text-[13px] text-muted-foreground">Upload your own banner, or type your words and Enski designs it.</p></div>
      </header>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[220px_1fr]">
        {/* Profile photo */}
        <div className="flex items-center gap-4 lg:flex-col lg:items-start">
          <div className="relative shrink-0">
            <div className="rounded-full bg-card p-1 shadow-sm ring-1 ring-line [&>*]:h-20 [&>*]:w-20 [&>*]:text-xl"><StoreAvatar /></div>
            {photo.busy && <span className="absolute inset-0 grid place-items-center rounded-full bg-card/70"><Loader2 className="h-5 w-5 animate-spin text-cobalt" /></span>}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold">Profile photo</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Square images work best. Also shows on your profile.</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={photo.open} disabled={photo.busy}><Camera />{hasPhoto ? "Change photo" : "Upload photo"}</Button>
              {hasPhoto && (
                <Button type="button" size="sm" variant="quiet" className="text-destructive" onClick={() => { update((s) => ({ profile: { ...s.profile, photo: "" } })); toast.success("Profile photo removed"); }}><Trash2 />Remove</Button>
              )}
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] font-bold">Banner</p>
            <div role="radiogroup" aria-label="How to add your banner" className="grid grid-cols-2 gap-1 rounded-full border bg-soft p-1">
              {([["design", "Design it for me", Wand2], ["upload", "Upload my own", Upload]] as const).map(([id, label, I]) => (
                <button key={id} type="button" role="radio" aria-checked={mode === id} onClick={() => setMode(id)} className={cn("inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-bold transition-colors", mode === id ? "bg-card text-cobalt shadow-sm ring-1 ring-line" : "text-muted-foreground hover:text-foreground")}>
                  <I className="h-4 w-4" aria-hidden="true" />{label}
                </button>
              ))}
            </div>
          </div>

          {mode === "upload" ? (
            <div className="space-y-3">
              <div data-surface="dark" className="bg-brand-panel relative aspect-[3/1] w-full overflow-hidden rounded-[16px] ring-1 ring-line">
                {sf.bannerSource === "upload" && sf.banner ? <img src={sf.banner} alt="Your banner" className="h-full w-full object-cover" /> : <span className="absolute inset-0 grid place-items-center text-sm font-bold text-on-dark-muted">No banner uploaded yet</span>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={bannerPicker.open} disabled={bannerPicker.busy}><Upload />{sf.bannerSource === "upload" && sf.banner ? "Replace banner" : "Upload banner"}</Button>
                {sf.bannerSource === "upload" && sf.banner && <Button type="button" variant="quiet" size="sm" onClick={() => { saveBanner("", "none", {}, "Storefront banner removed"); toast.success("Banner removed"); }}><Trash2 />Remove</Button>}
              </div>
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP · up to 5 MB · at least 1080 × 1080 px. You'll crop it to a wide banner before it's saved.</p>
              {bannerPicker.element}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="banner-headline" label="Main words" hint={`${words.headline.length}/${HEADLINE_MAX}`} error={error || undefined}>
                  <Input id="banner-headline" value={words.headline} maxLength={HEADLINE_MAX + 20} placeholder="e.g. Learn design the practical way" onChange={(e) => { setWords({ ...words, headline: e.target.value }); setError(""); }} />
                </Field>
                <Field id="banner-subline" label="Supporting line (optional, one line)" hint={`${words.subline.length}/${SUBLINE_MAX}`}>
                  <Input id="banner-subline" value={words.subline} maxLength={SUBLINE_MAX + 20} placeholder="e.g. Courses, templates and live classes" onChange={(e) => setWords({ ...words, subline: e.target.value })} />
                </Field>
              </div>
              <div>
                <p id="banner-style-label" className="mb-1.5 text-[13px] font-bold">Style</p>
                <div role="radiogroup" aria-labelledby="banner-style-label" className="grid grid-cols-3 gap-2">
                  {BANNER_STYLES.map((st) => (
                    <button key={st.id} type="button" role="radio" aria-checked={words.style === st.id} onClick={() => setWords({ ...words, style: st.id as BannerStyle })} className={cn("group rounded-[16px] border-[1.5px] p-1.5 text-left transition-colors", words.style === st.id ? "border-cobalt bg-ice/50" : "hover:border-cobalt-100")}>
                      <span className={cn("relative block h-10 overflow-hidden rounded-[11px] sm:h-12", st.id === "cobalt" ? "bg-brand-panel" : st.id === "midnight" ? "bg-midnight" : "bg-ice ring-1 ring-line")} aria-hidden="true">
                        <span className={cn("absolute left-2 top-2.5 h-1.5 w-8 rounded-full", st.id === "ice" ? "bg-midnight/70" : "bg-primary-foreground/85")} />
                        <span className="absolute left-2 top-5 h-1 w-5 rounded-full bg-lime" />
                        {words.style === st.id && <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-lime text-midnight"><Check className="h-3 w-3" strokeWidth={3} /></span>}
                      </span>
                      <span className="mt-1.5 block truncate px-0.5 text-xs font-extrabold">{st.label}</span>
                      <span className="hidden truncate px-0.5 text-[11px] text-muted-foreground sm:block">{st.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="button" onClick={() => void design()} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <PenLine />}{sf.bannerSource === "designed" ? "Redesign my banner" : "Design my banner"}</Button>
                <p className="text-xs text-muted-foreground">Enski tidies spacing, capitals and punctuation, then lays out your words in brand colours.</p>
              </div>
              {tidied && (
                <p role="status" className="rounded-[14px] bg-success-soft px-3.5 py-2.5 text-xs font-semibold text-success">
                  We tidied your words to “{tidied.headline}”{tidied.subline && <> · “{tidied.subline}”</>}.
                </p>
              )}
              {sf.bannerSource === "designed" && sf.banner && (
                <div className="relative overflow-hidden rounded-[18px] border-[1.5px] border-line">
                  <img src={sf.banner} alt="Designed banner preview" className="aspect-[16/5] w-full object-cover" />
                  <button type="button" onClick={() => { saveBanner("", "none", {}, "Storefront banner removed"); toast.success("Banner removed"); }} className="absolute bottom-2 right-2 inline-flex h-9 items-center gap-1.5 rounded-full bg-card/95 px-3 text-xs font-extrabold text-destructive shadow-sm backdrop-blur"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {photo.input}
    </section>
  );
}
