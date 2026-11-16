import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bold, Check, ChevronDown, ChevronsUpDown, ExternalLink, Eye, FileText, Heading2, ImagePlus, Italic,
  Link2, List, ListOrdered, Loader2, Pencil, Pilcrow, Plus, RefreshCw, Rocket, Save, Trash2, UploadCloud, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { Switch } from "@/components/dashboard-ui/switch";
import { Checkbox } from "@/components/dashboard-ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/dashboard-ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/dashboard-ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/dashboard-ui/select";
import { BrandIcon } from "@/components/affiliate/BrandIcon";
import { COURSE_CATEGORIES, skillOptions } from "@/lib/creator/courseMeta";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { uniqueSlug, type CreatorItem } from "@/lib/creator/rules";
import { courseOf, newId, type CourseConfig } from "@/lib/creator/products";
import { readCoverFile } from "@/lib/creator/cover";
import { deleteMedia, putMedia } from "@/lib/creator/mediaVault";
import { useMediaUrl } from "@/lib/creator/useMediaUrl";
import { fileSize } from "@/lib/creator/mediaRules";
import { CURRENCIES, CURRENCY_CODES, currencySymbol, formatMoney, type CurrencyCode } from "@/lib/shared/finance/currencies";
import {
  COMMUNITY_LABEL, COMMUNITY_PLATFORMS, LEVELS, MAX_SKILLS, RESOURCE_LABEL, SUMMARY_MAX, activeLevels, addCurrency, addSkill, allIssues, allLessons, builderSchema,
  currenciesOf, emptyBuilder, htmlText, imageProblem, levelLessons, levelPrice, primaryPrice, removeCurrency, resourceKindOf, resourceProblem, sanitizeHtml,
  step1Issues, step2Issues, step3Issues, type Builder, type BuilderLesson, type BuilderModule, type Issue, type Level, type LevelKey, type Resource,
} from "@/lib/creator/courseBuilder";
import { cn } from "@/lib/utils";
import { CreateField, CreateSection } from "./CreateKit";
import { kindArt } from "./ProductChrome";

const STEPS = ["Basic information", "More information", "Pricing"] as const;
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const focusField = (id: string) => {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
  (el as HTMLElement | null)?.focus?.({ preventScroll: true });
};
const money = (n: number | null, c: CurrencyCode) => (n === null || !Number.isFinite(n) ? "—" : n === 0 ? "Free" : formatMoney(n, c));

/** Turns the builder answers into the course config older screens read (modules, lessons, outcomes). */
function toCourse(prev: CourseConfig, b: Builder): CourseConfig {
  const free = new Set(b.payg.enabled ? levelLessons(b, "free") : []);
  return {
    ...prev,
    objectives: b.outcomes.map((o) => o.trim()).filter(Boolean),
    skill: b.skills[0] ?? prev.skill,
    modules: b.hosting === "external" ? [] : b.modules.map((m, i) => ({
      id: m.id, title: m.title.trim() || `Module ${i + 1}`, unlockDay: 0,
      lessons: m.lessons.filter((l) => l.title.trim()).map((l) => {
        const video = l.resources.find((r) => r.kind === "video");
        return {
          id: l.id, title: l.title.trim(), minutes: 10, preview: free.has(l.id),
          type: l.videoUrl || video ? "video" as const : l.resources.length ? "download" as const : "text" as const,
          mediaId: video?.id ?? l.resources[0]?.id ?? "",
        };
      }),
    })),
  };
}

/** Three-step course builder: Basic information → More information (with uploads) → Pricing, then a full preview. */
export function CourseBuilder({ existing, step: urlStep, onStep }: { existing?: CreatorItem | undefined; step?: number | undefined; onStep?: ((n: number, o?: { replace?: boolean }) => void) | undefined }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [summary, setSummary] = useState(existing?.description ?? "");
  const [image, setImage] = useState(existing?.image && existing.image.startsWith("data:") ? existing.image : existing?.image ?? "");
  const [b, setB] = useState<Builder>(() => (existing?.builder ? builderSchema.parse(existing.builder) : emptyBuilder()));
  const [savedId, setSavedId] = useState(existing?.id ?? "");
  const [localStep, setLocalStep] = useState(1);
  const step = Math.min(3, Math.max(1, onStep ? urlStep ?? 1 : localStep));
  const go = (n: number) => (onStep ? onStep(n) : setLocalStep(n));
  const [shown, setShown] = useState<Issue[]>([]);
  const [review, setReview] = useState(false);
  const [dirty, setDirty] = useState(false);
  const patch = (p: Partial<Builder>) => { setB((x) => ({ ...x, ...p })); setDirty(true); };
  const err = (f: string) => shown.find((i) => i.field === f)?.message;

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
  }, [step, review]);
  // Warn before leaving with unsaved answers.
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const issuesFor = (n: number) => (n === 1 ? step1Issues({ title, description: summary, image }) : n === 2 ? step2Issues(b) : step3Issues(b));
  const showIssues = (list: Issue[]) => {
    setShown(list);
    const firstIssue = list[0];
    if (!firstIssue) return;
    if (firstIssue.step !== step) { go(firstIssue.step); setReview(false); setTimeout(() => focusField(firstIssue.field), 250); }
    else focusField(firstIssue.field);
    toast.error(`Check ${STEPS[firstIssue.step - 1]}`, { description: firstIssue.message });
  };
  const next = () => {
    const list = issuesFor(step);
    if (list.length) return showIssues(list);
    setShown([]);
    if (step < 3) go(step + 1); else setReview(true);
  };

  const build = (status: "draft" | "published"): CreatorItem => {
    const ids = state.items.filter((i) => i.id !== savedId).map((i) => i.id);
    const id = savedId || uniqueSlug(title || "untitled-course", ids);
    const prev = state.items.find((i) => i.id === id);
    const clean: Builder = { ...b, descriptionHtml: sanitizeHtml(b.descriptionHtml) };
    const course = toCourse(prev ? courseOf(prev) : courseOf({ lessons: [] } as unknown as CreatorItem), clean);
    return {
      ...(prev ?? {}),
      id, kind: "course", title: title.trim() || "Untitled course", description: summary.trim(),
      category: b.programme.trim() || "General", price: primaryPrice(b), status, image,
      lessons: course.modules.flatMap((m) => m.lessons.map((l) => l.title)), date: prev?.date ?? "", capacity: prev?.capacity ?? 0, duration: prev?.duration ?? 0,
      createdAt: prev?.createdAt || new Date().toISOString(), course, builder: clean,
    } as CreatorItem;
  };
  const persist = (item: CreatorItem, log: string) => {
    update((s) => ({
      items: s.items.some((i) => i.id === item.id) ? s.items.map((i) => (i.id === item.id ? item : i)) : [...s.items, item],
      activity: [...s.activity, activityEntry(log)],
    }));
    setSavedId(item.id);
    setDirty(false);
  };
  const saveDraft = () => {
    const item = build("draft");
    persist(item, `Saved course draft: ${item.title}`);
    toast.success("Draft saved", { description: "Find it under Courses and pick up where you left off." });
  };
  const publish = () => {
    const list = allIssues({ title, description: summary, image }, b);
    if (list.length) return showIssues(list);
    const item = build("published");
    persist(item, `Course published: ${item.title}`);
    window.__lovableEvents?.track?.("project.product_published", { product_kind: "course", price_type: item.price > 0 ? "paid" : "free" });
    navigate({ to: "/creator/products/result/$itemId", params: { itemId: item.id }, search: { fresh: true } });
  };

  return (
    <div className="create-flow">
      <section data-surface="dark" className="bg-brand-panel relative mb-4 overflow-hidden rounded-2xl p-5 text-primary-foreground sm:p-7">
        <span className="hero-dots" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime"><span className="neon-dot" aria-hidden="true" />{existing ? "Course draft" : "New course"}</p>
            <h1 className="mt-2 text-2xl sm:text-[32px]">{review ? "Preview your course" : existing ? "Finish your course" : "Create a course"}</h1>
            <p className="mt-2 max-w-xl text-sm text-on-dark-muted sm:text-[15px]">
              {review ? "Check everything learners will see. Use Edit to change any part, then publish." : "Three steps: the basics, the details and lessons, then pricing. Save as draft at any time."}
            </p>
          </div>
          <BrandIcon src={kindArt.course} className="product-hero-art h-16 w-16 shrink-0 sm:h-28 sm:w-28" />
        </div>
      </section>

      <nav aria-label="Course steps" className="surface mb-5 px-3 py-3 sm:px-4">
        <ol className="grid grid-cols-3 gap-2">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const on = n === step && !review;
            const done = n < step || review;
            return (
              <li key={s}>
                <button type="button" onClick={() => { if (n < step || review) { setReview(false); go(n); } else if (n > step) next(); }} aria-current={on ? "step" : undefined}
                  className={cn("flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-soft", on && "bg-soft")}>
                  <span className={cn("create-badge grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold", done && "is-done")}>{done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}</span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Step {n}</span>
                    <span className={cn("block truncate text-[13px] font-extrabold", on && "text-cobalt")}>{s}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div id="create-stage" tabIndex={-1} className="space-y-5 outline-none">
        {review ? (
          <Review title={title} summary={summary} image={image} b={b} onEdit={(n) => { setReview(false); go(n); }} />
        ) : step === 1 ? (
          <StepBasics title={title} setTitle={(v) => { setTitle(v); setDirty(true); }} summary={summary} setSummary={(v) => { setSummary(v); setDirty(true); }}
            image={image} setImage={(v) => { setImage(v); setDirty(true); }} b={b} patch={patch} err={err}
            programmes={[...new Set([...COURSE_CATEGORIES, ...state.items.filter((i) => i.kind === "course").map((i) => i.category)].filter((x) => x && x !== "General"))]} />
        ) : step === 2 ? (
          <StepMore b={b} patch={patch} err={err} />
        ) : (
          <StepPricing b={b} setB={(f) => { setB(f); setDirty(true); }} err={err} />
        )}
      </div>

      <div className="sticky bottom-0 z-(--z-sticky) mt-6 rounded-t-2xl border border-b-0 border-line bg-card/95 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Button variant="outline" disabled={step === 1 && !review} onClick={() => (review ? setReview(false) : go(step - 1))}><ArrowLeft />Previous</Button>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={saveDraft}><Save />Save as draft</Button>
            {review
              ? <Button onClick={publish}><Rocket />Publish course</Button>
              : <Button onClick={next}>{step === 3 ? <>Preview course<Eye /></> : <>Next<ArrowRight /></>}</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Step 1 ----------------
function StepBasics({ title, setTitle, summary, setSummary, image, setImage, b, patch, err, programmes }: {
  title: string; setTitle: (v: string) => void; summary: string; setSummary: (v: string) => void; image: string; setImage: (v: string) => void;
  b: Builder; patch: (p: Partial<Builder>) => void; err: (f: string) => string | undefined; programmes: string[];
}) {
  return (
    <CreateSection n={1} id="cb-basics" title="Basic information" text="What learners see first on your course card and page.">
      <CreateField id="cb-title" label="Course title" required error={err("cb-title")}>
        <Input id="cb-title" value={title} maxLength={120} placeholder="Enter your course title" onChange={(e) => setTitle(e.target.value)} aria-invalid={!!err("cb-title")} />
      </CreateField>
      <CreateField id="cb-summary" label="Short description / summary" required count={`${summary.length}/${SUMMARY_MAX}`} hint="One or two sentences about the result learners get." error={err("cb-summary")}>
        <Textarea id="cb-summary" rows={3} value={summary} maxLength={SUMMARY_MAX} placeholder="e.g. Learn the exact scripts and follow-ups that turn conversations into paying clients." onChange={(e) => setSummary(e.target.value)} aria-invalid={!!err("cb-summary")} />
      </CreateField>
      <ImageField value={image} onChange={setImage} error={err("cb-image")} />
      <CreateField id="cb-programme" label="Programme" hint="Group this course with a programme. Search or type a new one.">
        <SearchPick id="cb-programme" value={b.programme} options={programmes} onPick={(v) => patch({ programme: v })} placeholder="Choose a programme" />
      </CreateField>
      <CreateField id="cb-skills" label="Skill set" count={`${b.skills.length}/${MAX_SKILLS}`} hint="Up to 5 skills learners will build.">
        <SkillPicker value={b.skills} onChange={(skills) => patch({ skills })} options={skillOptions(b.programme)} />
      </CreateField>
      <label className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-soft/50 p-4">
        <span>
          <span className="block text-[14px] font-extrabold">Turn on prelaunch</span>
          <span className="mt-0.5 block text-[13px] text-muted-foreground">Prelaunch lets you prepare and promote your course before its official release. People can see it and join the waitlist, but can't start learning yet.</span>
        </span>
        <Switch checked={b.prelaunch} onCheckedChange={(v) => patch({ prelaunch: v })} aria-label="Turn on prelaunch" />
      </label>
    </CreateSection>
  );
}

function ImageField({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: string | undefined }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const pick = async (file: File | undefined) => {
    if (!file) return;
    const p = imageProblem(file);
    if (p) { setProblem(p); return; }
    setProblem(""); setBusy(true);
    try { onChange(await readCoverFile(file)); } catch { setProblem("We couldn't read that image. Try another PNG or JPG."); } finally { setBusy(false); }
  };
  const msg = problem || error;
  return (
    <CreateField id="cb-image" label="Primary course image" required hint="PNG or JPG, up to 10 MB. Landscape works best." error={msg}>
      <input ref={ref} type="file" accept="image/png,image/jpeg" className="sr-only" tabIndex={-1} onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ""; }} />
      {value ? (
        <div className="overflow-hidden rounded-2xl border border-line">
          <img src={value} alt="Course image preview" className="aspect-[16/9] w-full object-cover" />
          <div className="flex flex-wrap gap-2 p-3">
            <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={busy}><RefreshCw />Replace</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => onChange("")}><Trash2 />Remove</Button>
          </div>
        </div>
      ) : (
        <button id="cb-image" type="button" onClick={() => ref.current?.click()} disabled={busy}
          className={cn("flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-soft/40 px-4 py-10 text-center transition-colors hover:border-cobalt", msg && "border-destructive")}>
          {busy ? <Loader2 className="h-7 w-7 animate-spin text-cobalt" /> : <ImagePlus className="h-7 w-7 text-cobalt" />}
          <span className="text-sm font-extrabold">{busy ? "Preparing image…" : "Upload course image"}</span>
          <span className="text-xs text-muted-foreground">PNG or JPG · max 10 MB</span>
        </button>
      )}
    </CreateField>
  );
}

function SearchPick({ id, value, options, onPick, placeholder }: { id: string; value: string; options: string[]; onPick: (v: string) => void; placeholder: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" className="h-11 w-full justify-between bg-card font-bold" aria-label={value ? `Programme: ${value}` : placeholder}>
          <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span><ChevronsUpDown className="opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search programmes" value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>No match.</CommandEmpty>
            <CommandGroup>
              {q.trim() && !options.some((o) => o.toLowerCase() === q.trim().toLowerCase()) && (
                <CommandItem value={`new:${q}`} onSelect={() => { onPick(q.trim()); setOpen(false); setQ(""); }}><Plus className="h-4 w-4" />Use "{q.trim()}"</CommandItem>
              )}
              {value && <CommandItem value="__clear" onSelect={() => { onPick(""); setOpen(false); }}><X className="h-4 w-4" />No programme</CommandItem>}
              {options.map((o) => (
                <CommandItem key={o} value={o} onSelect={() => { onPick(o); setOpen(false); setQ(""); }}>
                  <Check className={cn("h-4 w-4", value === o ? "opacity-100" : "opacity-0")} />{o}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function SkillPicker({ value, onChange, options }: { value: string[]; onChange: (v: string[]) => void; options: readonly string[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const full = value.length >= MAX_SKILLS;
  const add = (s: string) => { onChange(addSkill(value, s)); setQ(""); };
  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Selected skills">
          {value.map((s) => (
            <li key={s} className="inline-flex items-center gap-1 rounded-full bg-cobalt-50 px-3 py-1 text-[13px] font-bold text-cobalt">
              {s}<button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(value.filter((x) => x !== s))} className="rounded-full p-0.5 hover:bg-card"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id="cb-skills" type="button" variant="outline" disabled={full} className="h-11 w-full justify-between bg-card font-bold">
            <span className="text-muted-foreground">{full ? "Maximum of 5 skills reached" : "Search and add skills"}</span><ChevronsUpDown className="opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search skills" value={q} onValueChange={setQ} />
            <CommandList>
              <CommandEmpty>No match — press the option above to add your own.</CommandEmpty>
              <CommandGroup>
                {q.trim() && !options.some((o) => o.toLowerCase() === q.trim().toLowerCase()) && (
                  <CommandItem value={`new:${q}`} onSelect={() => add(q)}><Plus className="h-4 w-4" />Add "{q.trim()}"</CommandItem>
                )}
                {options.filter((o) => !value.includes(o)).map((o) => <CommandItem key={o} value={o} onSelect={() => add(o)}>{o}</CommandItem>)}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ---------------- Step 2 ----------------
function StepMore({ b, patch, err }: { b: Builder; patch: (p: Partial<Builder>) => void; err: (f: string) => string | undefined }) {
  return (
    <>
      <CreateSection n={1} id="cb-hosting" title="Where is this course hosted?" text="Host lessons on Enski, or promote a course that lives on another site.">
        <div role="radiogroup" aria-label="Course hosting" className="grid gap-2.5 sm:grid-cols-2">
          {([["enski", "Enski-hosted course", "Upload modules, lessons and files here. Learners study on Enski."], ["external", "External / affiliate course", "Send learners to a course on another site. You may earn a commission."]] as const).map(([v, t, d]) => (
            <button key={v} type="button" role="radio" aria-checked={b.hosting === v} onClick={() => patch({ hosting: v })}
              className={cn("rounded-2xl border-2 p-4 text-left transition-colors", b.hosting === v ? "border-cobalt bg-cobalt-50/60" : "border-line hover:border-cobalt-100")}>
              <span className="flex items-center gap-2 text-[14px] font-extrabold">{b.hosting === v && <span className="h-2 w-2 rounded-full bg-lime" />}{t}</span>
              <span className="mt-1 block text-[13px] text-muted-foreground">{d}</span>
            </button>
          ))}
        </div>
        {b.hosting === "external" && (
          <div className="space-y-4 rounded-2xl border border-line bg-soft/40 p-4">
            <p className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[12px] font-extrabold text-sky-text">External affiliate product · not hosted on Enski</p>
            <CreateField id="cb-ext-url" label="External course URL" required error={err("cb-ext-url")}>
              <Input id="cb-ext-url" inputMode="url" placeholder="https://" value={b.external.courseUrl} onChange={(e) => patch({ external: { ...b.external, courseUrl: e.target.value } })} />
            </CreateField>
            <CreateField id="cb-ext-checkout" label="External checkout URL" hint="Only if checkout happens on a different page." error={err("cb-ext-checkout")}>
              <Input id="cb-ext-checkout" inputMode="url" placeholder="https://" value={b.external.checkoutUrl} onChange={(e) => patch({ external: { ...b.external, checkoutUrl: e.target.value } })} />
            </CreateField>
            <CreateField id="cb-ext-disclosure" label="Affiliate disclosure" required hint="Shown to learners next to the buy button." error={err("cb-ext-disclosure")}>
              <Textarea id="cb-ext-disclosure" rows={2} value={b.external.disclosure} onChange={(e) => patch({ external: { ...b.external, disclosure: e.target.value } })} />
            </CreateField>
          </div>
        )}
      </CreateSection>

      <CreateSection n={2} id="cb-audience" title="Who should take this course?" text="Describe the people this course is for." optional>
        <ListField id="cb-audience-list" items={b.audience} onChange={(audience) => patch({ audience })} addLabel="Add audience" placeholder="e.g. Freelancers who struggle to land their first clients" />
      </CreateSection>

      <CreateSection n={3} id="cb-description" title="Course description" text="Tell the full story: what's inside, how it works and why it matters." optional>
        <RichText value={b.descriptionHtml} onChange={(descriptionHtml) => patch({ descriptionHtml })} />
      </CreateSection>

      <CreateSection n={4} id="cb-outcomes" title="What you'll learn" text="Start each outcome with a verb." optional>
        <ListField id="cb-outcome" items={b.outcomes} onChange={(outcomes) => patch({ outcomes })} addLabel="Add learning outcome" placeholder="e.g. Write a pitch that gets replies" />
      </CreateSection>

      <CreateSection n={5} id="cb-requirements" title="Course requirements" text="Prerequisites, skills, tools or materials learners need." optional>
        <ListField id="cb-requirement" items={b.requirements} onChange={(requirements) => patch({ requirements })} addLabel="Add requirement" placeholder="e.g. A phone or laptop with WhatsApp" />
      </CreateSection>

      <CreateSection n={6} id="cb-community" title="Community" text="Invite learners to a group where they can ask questions and connect." optional>
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <CreateField id="cb-community-platform" label="Community platform" error={err("cb-community-platform")}>
            <Select value={b.community.platform} onValueChange={(v) => patch({ community: { ...b.community, platform: v as Builder["community"]["platform"] } })}>
              <SelectTrigger id="cb-community-platform" className="h-11 bg-card font-bold" aria-label="Community platform"><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>{COMMUNITY_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{COMMUNITY_LABEL[p]}</SelectItem>)}</SelectContent>
            </Select>
          </CreateField>
          <CreateField id="cb-community-url" label="Community invitation URL" error={err("cb-community-url")}>
            <Input id="cb-community-url" inputMode="url" placeholder="https://chat.whatsapp.com/…" value={b.community.url} onChange={(e) => patch({ community: { ...b.community, url: e.target.value } })} />
          </CreateField>
        </div>
        <CreateField id="cb-community-desc" label="Community description" hint="Optional.">
          <Textarea id="cb-community-desc" rows={2} value={b.community.description} placeholder="e.g. Weekly Q&A and accountability with other learners." onChange={(e) => patch({ community: { ...b.community, description: e.target.value } })} />
        </CreateField>
      </CreateSection>

      {b.hosting === "enski" ? (
        <CreateSection n={7} id="cb-content" title="Course content & uploads" text="Organise modules and lessons, then add videos, PDFs, presentations, worksheets and other files.">
          {err("cb-content") && <p className="flex items-center gap-1.5 text-[13px] font-bold text-destructive"><AlertCircle className="h-4 w-4" />{err("cb-content")}</p>}
          <ContentEditor b={b} patch={patch} err={err} />
        </CreateSection>
      ) : (
        <div className="surface p-5 text-[13px] text-muted-foreground">Course content and uploads are managed on the external site, so there's nothing to upload here.</div>
      )}
    </>
  );
}

function ListField({ id, items, onChange, addLabel, placeholder }: { id: string; items: string[]; onChange: (v: string[]) => void; addLabel: string; placeholder: string }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusLast, setFocusLast] = useState(false);
  useEffect(() => { if (focusLast) { refs.current[items.length - 1]?.focus(); setFocusLast(false); } }, [focusLast, items.length]);
  const lastEmpty = items.length > 0 && !items[items.length - 1]!.trim();
  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-[13px] text-muted-foreground">Nothing added yet.</p>}
      {items.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-soft text-xs font-extrabold text-muted-foreground">{i + 1}</span>
          <Input id={`${id}-${i}`} ref={(el) => { refs.current[i] = el; }} value={v} placeholder={placeholder} aria-label={`${addLabel.replace(/^Add /, "")} ${i + 1}`}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))}
            onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) { e.preventDefault(); onChange([...items, ""]); setFocusLast(true); } }} />
          <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${i + 1}`} onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 /></Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" disabled={lastEmpty} onClick={() => { onChange([...items, ""]); setFocusLast(true); }}><Plus />{addLabel}</Button>
    </div>
  );
}

function RichText({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const cmd = (c: string, arg?: string) => { ref.current?.focus(); document.execCommand(c, false, arg); onChange(ref.current?.innerHTML ?? ""); };
  const tools: [string, typeof Bold, () => void][] = [
    ["Heading", Heading2, () => cmd("formatBlock", "<h2>")],
    ["Paragraph", Pilcrow, () => cmd("formatBlock", "<p>")],
    ["Bold", Bold, () => cmd("bold")],
    ["Italic", Italic, () => cmd("italic")],
    ["Bullet list", List, () => cmd("insertUnorderedList")],
    ["Numbered list", ListOrdered, () => cmd("insertOrderedList")],
    ["Link", Link2, () => { const u = window.prompt("Link address (https://…)"); if (u) cmd("createLink", u); }],
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-line focus-within:border-cobalt">
      <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-1 border-b border-line bg-soft/60 p-1.5">
        {tools.map(([label, Icon, run]) => (
          <button key={label} type="button" aria-label={label} title={label} onMouseDown={(e) => e.preventDefault()} onClick={run} className="grid h-9 w-9 place-items-center rounded-lg text-foreground hover:bg-card"><Icon className="h-4 w-4" /></button>
        ))}
      </div>
      <div ref={ref} id="cb-description-editor" role="textbox" aria-multiline="true" aria-label="Course description" contentEditable suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="rich-text min-h-48 bg-card px-4 py-3 text-[14px] leading-relaxed outline-none [&_a]:text-cobalt [&_a]:underline [&_h2]:mt-2 [&_h2]:text-lg [&_h2]:font-extrabold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-1.5 [&_ul]:list-disc [&_ul]:pl-6" />
    </div>
  );
}

type Upload = { id: string; name: string; size: number; pct: number; error?: string };
function ContentEditor({ b, patch, err }: { b: Builder; patch: (p: Partial<Builder>) => void; err: (f: string) => string | undefined }) {
  const [uploads, setUploads] = useState<Record<string, Upload[]>>({});
  const setModules = (modules: BuilderModule[]) => patch({ modules });
  const mods = b.modules;
  const move = <T,>(arr: T[], i: number, d: number) => { const j = i + d; if (j < 0 || j >= arr.length) return arr; const c = [...arr]; [c[i], c[j]] = [c[j]!, c[i]!]; return c; };
  const editMod = (mi: number, p: Partial<BuilderModule>) => setModules(mods.map((m, i) => (i === mi ? { ...m, ...p } : m)));
  const editLesson = (mi: number, li: number, p: Partial<BuilderLesson>) => editMod(mi, { lessons: mods[mi]!.lessons.map((l, i) => (i === li ? { ...l, ...p } : l)) });
  const newLesson = (): BuilderLesson => ({ id: newId(), title: "", description: "", videoUrl: "", resources: [] });
  const latest = useRef(b); latest.current = b;

  const uploadFiles = async (lessonId: string, files: FileList, replace?: string) => {
    for (const file of Array.from(files)) {
      const id = newId();
      const problem = resourceProblem(file);
      setUploads((u) => ({ ...u, [lessonId]: [...(u[lessonId] ?? []), { id, name: file.name, size: file.size, pct: problem ? 0 : 5, ...(problem ? { error: problem } : {}) }] }));
      if (problem) continue;
      const tick = setInterval(() => setUploads((u) => ({ ...u, [lessonId]: (u[lessonId] ?? []).map((x) => (x.id === id ? { ...x, pct: Math.min(90, x.pct + 15) } : x)) })), 120);
      try {
        await Promise.all([putMedia(id, file), new Promise((r) => setTimeout(r, 700))]);
        const res: Resource = { id, name: file.name, size: file.size, mime: file.type || "application/octet-stream", kind: resourceKindOf(file) };
        const cur = latest.current;
        patch({ modules: cur.modules.map((m) => ({ ...m, lessons: m.lessons.map((l) => (l.id !== lessonId ? l : { ...l, resources: replace ? l.resources.map((r) => (r.id === replace ? res : r)) : [...l.resources, res] })) })) });
        if (replace) void deleteMedia(replace);
        setUploads((u) => ({ ...u, [lessonId]: (u[lessonId] ?? []).filter((x) => x.id !== id) }));
        toast.success(`${file.name} uploaded`);
      } catch {
        setUploads((u) => ({ ...u, [lessonId]: (u[lessonId] ?? []).map((x) => (x.id === id ? { ...x, pct: 0, error: "Your browser is out of space. Remove some files and try again." } : x)) }));
      } finally { clearInterval(tick); }
    }
  };

  const levels = activeLevels(b);
  const toggleLevel = (key: LevelKey, lessonId: string) => patch({
    payg: { ...b.payg, levels: b.payg.levels.map((l) => (l.key !== key ? l : { ...l, lessonIds: l.lessonIds.includes(lessonId) ? l.lessonIds.filter((x) => x !== lessonId) : [...l.lessonIds, lessonId] })) },
  });

  return (
    <div className="space-y-4">
      {mods.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-line p-6 text-center">
          <p className="text-sm font-extrabold">No modules yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Start with a module, then add lessons and upload your materials.</p>
        </div>
      )}
      {mods.map((m, mi) => (
        <div key={m.id} className="rounded-2xl border border-line">
          <div className="flex flex-wrap items-start gap-2 border-b border-line bg-soft/50 p-3 sm:p-4">
            <span className="mt-2 text-[11px] font-extrabold uppercase tracking-wide text-cobalt">Module {mi + 1}</span>
            <div className="min-w-0 flex-1 space-y-2">
              <Input value={m.title} placeholder="Module title, e.g. Finding the right clients" aria-label={`Module ${mi + 1} title`} onChange={(e) => editMod(mi, { title: e.target.value })} />
              <Input value={m.description} placeholder="Short module description (optional)" aria-label={`Module ${mi + 1} description`} onChange={(e) => editMod(mi, { description: e.target.value })} />
            </div>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" aria-label="Move module up" disabled={mi === 0} onClick={() => setModules(move(mods, mi, -1))}><ArrowUp /></Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Move module down" disabled={mi === mods.length - 1} onClick={() => setModules(move(mods, mi, 1))}><ArrowDown /></Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Remove module" onClick={() => { m.lessons.flatMap((l) => l.resources).forEach((r) => void deleteMedia(r.id)); setModules(mods.filter((_, i) => i !== mi)); }}><Trash2 /></Button>
            </div>
          </div>
          <div className="space-y-3 p-3 sm:p-4">
            {m.lessons.length === 0 && <p className="text-[13px] text-muted-foreground">No lessons in this module yet.</p>}
            {m.lessons.map((l, li) => (
              <div key={l.id} className="space-y-3 rounded-xl border border-line bg-card p-3">
                <div className="flex items-start gap-2">
                  <span className="mt-2.5 text-xs font-extrabold text-muted-foreground">{mi + 1}.{li + 1}</span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input value={l.title} placeholder="Lesson title" aria-label={`Lesson ${mi + 1}.${li + 1} title`} onChange={(e) => editLesson(mi, li, { title: e.target.value })} />
                    <Textarea rows={2} value={l.description} placeholder="Lesson description (optional)" aria-label={`Lesson ${mi + 1}.${li + 1} description`} onChange={(e) => editLesson(mi, li, { description: e.target.value })} />
                    <div>
                      <Input id={`cb-video-${l.id}`} inputMode="url" value={l.videoUrl} placeholder="Video link (YouTube, Vimeo or .mp4) — or upload a video below" aria-label={`Lesson ${mi + 1}.${li + 1} video link`} onChange={(e) => editLesson(mi, li, { videoUrl: e.target.value })} />
                      {err(`cb-video-${l.id}`) && <p className="mt-1 text-xs font-bold text-destructive">{err(`cb-video-${l.id}`)}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row">
                    <Button type="button" variant="ghost" size="icon" aria-label="Move lesson up" disabled={li === 0} onClick={() => editMod(mi, { lessons: move(m.lessons, li, -1) })}><ArrowUp /></Button>
                    <Button type="button" variant="ghost" size="icon" aria-label="Move lesson down" disabled={li === m.lessons.length - 1} onClick={() => editMod(mi, { lessons: move(m.lessons, li, 1) })}><ArrowDown /></Button>
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove lesson" onClick={() => { l.resources.forEach((r) => void deleteMedia(r.id)); editMod(mi, { lessons: m.lessons.filter((_, i) => i !== li) }); }}><Trash2 /></Button>
                  </div>
                </div>
                <ResourceList lesson={l} uploads={uploads[l.id] ?? []} onUpload={(f, replace) => void uploadFiles(l.id, f, replace)}
                  onRemove={(rid) => { void deleteMedia(rid); editLesson(mi, li, { resources: l.resources.filter((r) => r.id !== rid) }); }}
                  onDismiss={(uid) => setUploads((u) => ({ ...u, [l.id]: (u[l.id] ?? []).filter((x) => x.id !== uid) }))} />
                {levels.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-bold text-muted-foreground">Unlocked at:</span>
                    {levels.map((lv) => {
                      const on = lv.lessonIds.includes(l.id);
                      return <button key={lv.key} type="button" aria-pressed={on} onClick={() => toggleLevel(lv.key, l.id)} className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", on ? "border-cobalt bg-cobalt text-primary-foreground" : "border-line hover:border-cobalt")}>{LEVELS[lv.key].name}</button>;
                    })}
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => editMod(mi, { lessons: [...m.lessons, newLesson()] })}><Plus />Add lesson</Button>
          </div>
        </div>
      ))}
      <Button type="button" onClick={() => setModules([...mods, { id: newId(), title: "", description: "", lessons: [newLesson()] }])}><Plus />Add module</Button>
      {b.payg.enabled && !levels.length && <p className="text-xs text-muted-foreground">Activate levels in Pricing to choose which lessons each level unlocks.</p>}
    </div>
  );
}

function ResourceList({ lesson, uploads, onUpload, onRemove, onDismiss }: {
  lesson: BuilderLesson; uploads: Upload[]; onUpload: (f: FileList, replace?: string) => void; onRemove: (id: string) => void; onDismiss: (id: string) => void;
}) {
  const add = useRef<HTMLInputElement>(null);
  const rep = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState("");
  return (
    <div className="space-y-2">
      <input ref={add} type="file" multiple className="sr-only" tabIndex={-1} accept="video/*,.pdf,.ppt,.pptx,.key,.odp,.doc,.docx,.xls,.xlsx,.csv,.zip,.txt,image/*,audio/*" onChange={(e) => { if (e.target.files?.length) onUpload(e.target.files); e.target.value = ""; }} />
      <input ref={rep} type="file" className="sr-only" tabIndex={-1} onChange={(e) => { if (e.target.files?.length) onUpload(e.target.files, replacing); e.target.value = ""; }} />
      {lesson.resources.map((r) => <ResourceRow key={r.id} r={r} onReplace={() => { setReplacing(r.id); rep.current?.click(); }} onRemove={() => onRemove(r.id)} />)}
      {uploads.map((u) => (
        <div key={u.id} className={cn("rounded-xl border p-2.5 text-[13px]", u.error ? "border-destructive/40 bg-destructive/5" : "border-line")}>
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate font-bold">{u.name} <span className="font-normal text-muted-foreground">· {fileSize(u.size)}</span></span>
            {u.error ? <button type="button" aria-label={`Dismiss ${u.name}`} onClick={() => onDismiss(u.id)}><X className="h-4 w-4" /></button> : <span className="tabular-nums text-xs text-muted-foreground">{u.pct}%</span>}
          </div>
          {u.error ? <p className="mt-1 text-xs font-bold text-destructive">{u.error}</p> : <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft"><div className="h-full rounded-full bg-cobalt transition-all" style={{ width: `${u.pct}%` }} /></div>}
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => add.current?.click()}><UploadCloud />Upload files</Button>
      <span className="ml-2 text-xs text-muted-foreground">Videos up to 500 MB, other files up to 100 MB.</span>
    </div>
  );
}

function ResourceRow({ r, onReplace, onRemove }: { r: Resource; onReplace?: () => void; onRemove?: () => void }) {
  const { url, missing } = useMediaUrl(r.id);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line p-2.5 text-[13px]">
      <FileText className="h-4 w-4 shrink-0 text-cobalt" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{r.name}</span>
        <span className="text-xs text-muted-foreground">{RESOURCE_LABEL[r.kind]} · {fileSize(r.size)}{missing ? " · file not on this device" : ""}</span>
      </span>
      {url && <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-cobalt hover:underline"><Eye className="h-3.5 w-3.5" />Preview</a>}
      {onReplace && <Button type="button" variant="ghost" size="sm" onClick={onReplace}><RefreshCw />Replace</Button>}
      {onRemove && <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${r.name}`} onClick={onRemove}><Trash2 /></Button>}
    </div>
  );
}

// ---------------- Step 3 ----------------
function NumberInput({ id, value, onChange, code, label, invalid }: { id: string; value: number | null; onChange: (v: number | null) => void; code: CurrencyCode; label: string; invalid?: boolean }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-muted-foreground">{currencySymbol(code)}</span>
      <Input id={id} inputMode="decimal" aria-label={label} aria-invalid={invalid} className="pl-10 tabular-nums" value={value === null ? "" : String(value)} placeholder="0"
        onChange={(e) => { const t = e.target.value.replace(/[^\d.]/g, ""); onChange(t === "" ? null : Number(t)); }} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-muted-foreground">{code}</span>
    </div>
  );
}

function StepPricing({ b, setB, err }: { b: Builder; setB: (f: Builder) => void; err: (f: string) => string | undefined }) {
  const [adding, setAdding] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const codes = currenciesOf(b);
  const setPrice = (code: CurrencyCode, p: { amount?: number | null; original?: number | null }) =>
    setB({ ...b, pricing: { ...b.pricing, prices: b.pricing.prices.map((x) => (x.currency === code ? { ...x, ...p } : x)) } });
  const setLevel = (key: LevelKey, p: Partial<Level>) => setB({ ...b, payg: { ...b.payg, levels: b.payg.levels.map((l) => (l.key === key ? { ...l, ...p } : l)) } });
  const lessons = allLessons(b);
  const free = b.pricing.free;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <CreateSection n={1} id="cb-pricing" title="Course pricing" text="Learners pay once for lifetime access.">
          <div role="radiogroup" aria-label="Price type" className="grid grid-cols-2 gap-2.5">
            {([[true, "Free course"], [false, "Paid course · one-time payment"]] as const).map(([v, t]) => (
              <button key={t} type="button" role="radio" aria-checked={free === v} onClick={() => setB({ ...b, pricing: { ...b.pricing, free: v } })}
                className={cn("rounded-2xl border-2 p-3 text-left text-[13px] font-extrabold", free === v ? "border-cobalt bg-cobalt-50/60" : "border-line")}>{t}</button>
            ))}
          </div>
          {!free && (
            <>
              <p className="rounded-xl bg-soft px-3 py-2 text-[13px] text-muted-foreground">The first price you enter is in this currency. You can add other currencies with their own exact prices below.</p>
              <label className="flex items-center justify-between gap-3 text-[13px] font-bold">Show strike-out price<Switch checked={b.pricing.strike} onCheckedChange={(v) => setB({ ...b, pricing: { ...b.pricing, strike: v } })} aria-label="Show strike-out price" /></label>
              <div className="space-y-3">
                {b.pricing.prices.map((p, i) => (
                  <div key={p.currency} className="rounded-2xl border border-line p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[13px] font-extrabold">{i === 0 ? "Price currency" : "Another currency"}: {CURRENCIES[p.currency].flag} {p.currency}</span>
                      {i === 0 ? (
                        <Select value={p.currency} onValueChange={(v) => setB({ ...b, pricing: { ...b.pricing, prices: b.pricing.prices.map((x, j) => (j === 0 ? { ...x, currency: v as CurrencyCode } : x)) } })}>
                          <SelectTrigger className="h-9 w-28 bg-card text-xs font-bold" aria-label="Primary price currency"><SelectValue /></SelectTrigger>
                          <SelectContent>{CURRENCY_CODES.filter((c) => c === p.currency || !codes.includes(c)).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : <Button type="button" variant="ghost" size="sm" onClick={() => setB(removeCurrency(b, p.currency))}><X />Remove</Button>}
                    </div>
                    <div className={cn("grid gap-3", b.pricing.strike && "sm:grid-cols-2")}>
                      {b.pricing.strike && (
                        <CreateField id={`cb-original-${p.currency}`} label="Original price" error={err(`cb-original-${p.currency}`)}>
                          <NumberInput id={`cb-original-${p.currency}`} code={p.currency} label={`Original price in ${p.currency}`} value={p.original} onChange={(v) => setPrice(p.currency, { original: v })} />
                        </CreateField>
                      )}
                      <CreateField id={`cb-price-${p.currency}`} label={b.pricing.strike ? "Discounted price" : "Course price"} error={err(`cb-price-${p.currency}`)}>
                        <NumberInput id={`cb-price-${p.currency}`} code={p.currency} label={`${b.pricing.strike ? "Discounted" : "Course"} price in ${p.currency}`} value={p.amount} onChange={(v) => setPrice(p.currency, { amount: v })} invalid={!!err(`cb-price-${p.currency}`)} />
                      </CreateField>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={adding} onValueChange={setAdding}>
                  <SelectTrigger className="h-10 w-40 bg-card text-sm font-bold" aria-label="Currency to add"><SelectValue placeholder="Choose currency" /></SelectTrigger>
                  <SelectContent>{CURRENCY_CODES.filter((c) => !codes.includes(c)).map((c) => <SelectItem key={c} value={c}>{CURRENCIES[c].flag} {c}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="button" variant="outline" disabled={!adding} onClick={() => { setB(addCurrency(b, adding as CurrencyCode)); setAdding(""); }}><Plus />Add another currency</Button>
              </div>
            </>
          )}
        </CreateSection>

        {b.hosting === "enski" && (
          <CreateSection n={2} id="cb-payg" title="Pay-As-You-Go" text="Do you want to give learners the option to unlock your course gradually, instead of paying the full amount upfront?">
            <label className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4 text-[14px] font-extrabold">Activate Pay-As-You-Go
              <Switch checked={b.payg.enabled} onCheckedChange={(v) => setB({ ...b, payg: { ...b.payg, enabled: v } })} aria-label="Activate Pay-As-You-Go" />
            </label>
            {!b.payg.enabled ? (
              <p className="text-[13px] text-muted-foreground">Off: learners pay the full course price.</p>
            ) : (
              <div className="space-y-3">
                <p className="rounded-xl bg-soft px-3 py-2 text-[13px] text-muted-foreground">Currencies added here are automatically applied to all Pay-As-You-Go tiers. Suggested prices are a guide only — enter any amount you like.</p>
                {err("cb-levels") && <p id="cb-levels" tabIndex={-1} className="text-[13px] font-bold text-destructive">{err("cb-levels")}</p>}
                <label className="flex items-start gap-2 text-[13px]"><Checkbox checked={b.payg.cumulative} onCheckedChange={(v) => setB({ ...b, payg: { ...b.payg, cumulative: v === true } })} className="mt-0.5" />
                  <span><b>Higher levels include lower levels' content.</b> <span className="text-muted-foreground">Leave off to choose exactly what each level unlocks.</span></span></label>
                {b.payg.levels.map((l) => {
                  const meta = LEVELS[l.key];
                  const isOpen = open[l.key] ?? l.active;
                  return (
                    <div key={l.key} className={cn("rounded-2xl border", l.active ? "border-cobalt" : "border-line")}>
                      <div className="flex items-center gap-3 p-3 sm:p-4">
                        <Checkbox id={`cb-level-on-${l.key}`} checked={l.active} onCheckedChange={(v) => { setLevel(l.key, { active: v === true, ...(l.key === "free" ? { prices: Object.fromEntries(codes.map((c) => [c, 0])) } : {}) }); setOpen((o) => ({ ...o, [l.key]: v === true })); }} aria-label={`Activate ${meta.name}`} />
                        <button type="button" className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [l.key]: !isOpen }))}>
                          <span>
                            <span className="block text-[14px] font-extrabold uppercase tracking-wide">{meta.name}</span>
                            <span className="block text-xs text-muted-foreground">Suggested price: {meta.suggested}</span>
                          </span>
                          <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
                        </button>
                      </div>
                      {isOpen && (
                        <div className="space-y-3 border-t border-line p-3 sm:p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {codes.map((c) => (
                              <CreateField key={c} id={`cb-level-${l.key}-${c}`} label={`Course price (${c})`} error={err(`cb-level-${l.key}-${c}`)}>
                                {l.key === "free"
                                  ? <Input id={`cb-level-${l.key}-${c}`} value={`${currencySymbol(c)}0`} disabled aria-label={`Free price in ${c}`} />
                                  : <NumberInput id={`cb-level-${l.key}-${c}`} code={c} label={`${meta.name} price in ${c}`} value={l.prices[c] ?? null} onChange={(v) => setLevel(l.key, { prices: { ...l.prices, [c]: v } })} />}
                              </CreateField>
                            ))}
                          </div>
                          <CreateField id={`cb-level-unlocks-${l.key}`} label="What learners unlock">
                            <Textarea id={`cb-level-unlocks-${l.key}`} rows={2} placeholder={`e.g. ${meta.example}`} value={l.unlocks} onChange={(e) => setLevel(l.key, { unlocks: e.target.value })} />
                          </CreateField>
                          <div>
                            <p className="mb-1.5 text-[13px] font-bold">Course modules and lessons</p>
                            {lessons.length === 0 ? <p className="text-xs text-muted-foreground">Add lessons in More information to choose what this level opens.</p> : (
                              <div className="space-y-2">
                                {b.modules.map((m, mi) => {
                                  const ids = m.lessons.map((x) => x.id);
                                  const all = ids.length > 0 && ids.every((id) => l.lessonIds.includes(id));
                                  return (
                                    <div key={m.id} className="rounded-xl bg-soft/60 p-2.5">
                                      <label className="flex items-center gap-2 text-[13px] font-extrabold"><Checkbox checked={all} onCheckedChange={(v) => setLevel(l.key, { lessonIds: v === true ? [...new Set([...l.lessonIds, ...ids])] : l.lessonIds.filter((x) => !ids.includes(x)) })} />{m.title || `Module ${mi + 1}`}</label>
                                      <div className="mt-1.5 space-y-1 pl-6">
                                        {m.lessons.map((x, li) => (
                                          <label key={x.id} className="flex items-center gap-2 text-[13px]"><Checkbox checked={l.lessonIds.includes(x.id)} onCheckedChange={(v) => setLevel(l.key, { lessonIds: v === true ? [...l.lessonIds, x.id] : l.lessonIds.filter((y) => y !== x.id) })} />{x.title || `Lesson ${mi + 1}.${li + 1}`}</label>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CreateSection>
        )}
      </div>
      <aside className="lg:sticky lg:top-24 lg:self-start"><PricingSummary b={b} /></aside>
    </div>
  );
}

function PricingSummary({ b }: { b: Builder }) {
  const lessons = useMemo(() => new Map(allLessons(b).map((l) => [l.id, l.title || "Untitled lesson"])), [b]);
  const [primary, ...others] = b.pricing.prices;
  return (
    <div className="surface p-5" aria-live="polite">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-cobalt">Live pricing summary</p>
      {b.pricing.free ? <p className="mt-2 text-2xl font-extrabold">Free</p> : primary && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground">Primary currency · {primary.currency}</p>
          <p className="text-2xl font-extrabold tabular-nums">{money(primary.amount, primary.currency)}{b.pricing.strike && primary.original !== null && <span className="ml-2 text-sm font-bold text-muted-foreground line-through">{money(primary.original, primary.currency)}</span>}</p>
          {b.pricing.strike && <p className="text-xs text-muted-foreground">Original {money(primary.original, primary.currency)} · discounted {money(primary.amount, primary.currency)}</p>}
          {others.length > 0 && (
            <ul className="mt-3 space-y-1 text-[13px]">
              {others.map((p) => <li key={p.currency} className="flex justify-between"><span>{p.currency}</span><span className="font-bold tabular-nums">{money(p.amount, p.currency)}{b.pricing.strike && p.original !== null && <span className="ml-1 text-muted-foreground line-through">{money(p.original, p.currency)}</span>}</span></li>)}
            </ul>
          )}
        </div>
      )}
      <hr className="my-4 border-line" />
      <p className="text-[13px] font-extrabold">Pay-As-You-Go: <span className={b.payg.enabled ? "text-cobalt" : "text-muted-foreground"}>{b.payg.enabled ? "On" : "Off"}</span></p>
      {b.payg.enabled && (
        activeLevels(b).length === 0 ? <p className="mt-1 text-xs text-muted-foreground">No levels selected yet.</p> : (
          <ul className="mt-2 space-y-2.5">
            {activeLevels(b).map((l) => {
              const opens = levelLessons(b, l.key);
              return (
                <li key={l.key} className="rounded-xl bg-soft/70 p-2.5 text-[13px]">
                  <p className="font-extrabold">{LEVELS[l.key].name}</p>
                  <p className="tabular-nums text-muted-foreground">{currenciesOf(b).map((c) => money(levelPrice(l, c), c)).join(" · ")}</p>
                  {l.unlocks && <p className="mt-0.5">{l.unlocks}</p>}
                  <p className="mt-0.5 text-xs text-muted-foreground">{opens.length ? `${opens.length} lesson${opens.length === 1 ? "" : "s"}: ${opens.map((id) => lessons.get(id)).filter(Boolean).slice(0, 3).join(", ")}${opens.length > 3 ? "…" : ""}` : "No lessons chosen"}</p>
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}

// ---------------- Review ----------------
function Block({ title, step, onEdit, children }: { title: string; step: number; onEdit: (n: number) => void; children: ReactNode }) {
  return (
    <section className="surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[16px]">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => onEdit(step)} aria-label={`Edit ${title}`}><Pencil />Edit</Button>
      </div>
      {children}
    </section>
  );
}
const Bullets = ({ items, empty }: { items: string[]; empty: string }) => {
  const list = items.map((x) => x.trim()).filter(Boolean);
  return list.length ? <ul className="list-disc space-y-1 pl-5 text-[14px]">{list.map((x, i) => <li key={i}>{x}</li>)}</ul> : <p className="text-[13px] text-muted-foreground">{empty}</p>;
};
function Review({ title, summary, image, b, onEdit }: { title: string; summary: string; image: string; b: Builder; onEdit: (n: number) => void }) {
  const resources = allLessons(b).flatMap((l) => l.resources);
  return (
    <div className="space-y-4">
      <Block title="Basic information" step={1} onEdit={onEdit}>
        <div className="grid gap-4 sm:grid-cols-[240px_1fr]">
          {image ? <img src={image} alt="Course image" className="aspect-[16/10] w-full rounded-xl object-cover" /> : <div className="aspect-[16/10] rounded-xl bg-soft" />}
          <div>
            <div className="flex flex-wrap gap-1.5">
              {b.prelaunch && <span className="rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-extrabold text-midnight">Prelaunch</span>}
              {b.hosting === "external" && <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-extrabold text-sky-text">External affiliate course</span>}
              {b.programme && <span className="rounded-full bg-soft px-2.5 py-0.5 text-[11px] font-bold">{b.programme}</span>}
            </div>
            <h3 className="mt-2 text-xl">{title}</h3>
            <p className="mt-1 text-[14px] text-muted-foreground">{summary}</p>
            {b.skills.length > 0 && <p className="mt-2 text-[13px]"><b>Skills:</b> {b.skills.join(", ")}</p>}
          </div>
        </div>
      </Block>
      <Block title="Course description" step={2} onEdit={onEdit}>
        {htmlText(b.descriptionHtml) ? <div className="text-[14px] leading-relaxed [&_a]:text-cobalt [&_a]:underline [&_h2]:text-lg [&_h2]:font-extrabold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6" dangerouslySetInnerHTML={{ __html: sanitizeHtml(b.descriptionHtml) }} /> : <p className="text-[13px] text-muted-foreground">No full description yet.</p>}
      </Block>
      <div className="grid gap-4 md:grid-cols-3">
        <Block title="Who it's for" step={2} onEdit={onEdit}><Bullets items={b.audience} empty="No audience added." /></Block>
        <Block title="What you'll learn" step={2} onEdit={onEdit}><Bullets items={b.outcomes} empty="No outcomes added." /></Block>
        <Block title="Requirements" step={2} onEdit={onEdit}><Bullets items={b.requirements} empty="No requirements." /></Block>
      </div>
      <Block title="Community" step={2} onEdit={onEdit}>
        {b.community.url ? <p className="text-[14px]"><Users className="mr-1 inline h-4 w-4 text-cobalt" /><b>{b.community.platform ? COMMUNITY_LABEL[b.community.platform] : "Community"}</b> · <a className="text-cobalt underline" href={b.community.url} target="_blank" rel="noopener noreferrer">{b.community.url}</a>{b.community.description && <span className="block text-muted-foreground">{b.community.description}</span>}</p> : <p className="text-[13px] text-muted-foreground">No community link.</p>}
      </Block>
      {b.hosting === "external" ? (
        <Block title="External course" step={2} onEdit={onEdit}>
          <p className="text-[14px]"><a className="inline-flex items-center gap-1 text-cobalt underline" href={b.external.courseUrl} target="_blank" rel="noopener noreferrer">{b.external.courseUrl}<ExternalLink className="h-3.5 w-3.5" /></a></p>
          {b.external.checkoutUrl && <p className="text-[13px] text-muted-foreground">Checkout: {b.external.checkoutUrl}</p>}
          <p className="mt-2 rounded-xl bg-soft px-3 py-2 text-[13px] italic">{b.external.disclosure}</p>
        </Block>
      ) : (
        <Block title={`Modules and lessons · ${resources.length} file${resources.length === 1 ? "" : "s"}`} step={2} onEdit={onEdit}>
          <ol className="space-y-3">
            {b.modules.map((m, mi) => (
              <li key={m.id}>
                <p className="font-extrabold">Module {mi + 1}: {m.title || "Untitled module"}</p>
                {m.description && <p className="text-[13px] text-muted-foreground">{m.description}</p>}
                <ul className="mt-1.5 space-y-1.5 pl-4">
                  {m.lessons.map((l, li) => (
                    <li key={l.id} className="text-[14px]">
                      <span className="font-bold">{mi + 1}.{li + 1} {l.title || "Untitled lesson"}</span>
                      {l.videoUrl && <span className="ml-2 text-xs text-cobalt">Video link</span>}
                      {activeLevels(b).filter((lv) => levelLessons(b, lv.key).includes(l.id)).map((lv) => <span key={lv.key} className="ml-1.5 rounded-full bg-cobalt-50 px-2 py-0.5 text-[11px] font-bold text-cobalt">{LEVELS[lv.key].name}</span>)}
                      {l.resources.length > 0 && <div className="mt-1 space-y-1">{l.resources.map((r) => <ResourceRow key={r.id} r={r} />)}</div>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Block>
      )}
      <Block title="Pricing" step={3} onEdit={onEdit}><PricingSummary b={b} /></Block>
      <p className="text-center text-[13px] text-muted-foreground">Happy with it? Tap <b>Publish course</b> below. You can still edit after publishing. <Link to="/creator/courses" className="text-cobalt underline">Back to courses</Link></p>
    </div>
  );
}
