import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { SectionDropdown } from "@/components/shared/SectionDropdown";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CircleDashed, Gift, Lightbulb, Rocket, Save, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Textarea } from "@/components/dashboard-ui/textarea";
import { BrandIcon } from "@/components/affiliate/BrandIcon";
import { naira } from "@/lib/affiliate/products";
import { creatorCovers, kindInfo } from "@/lib/creator/data";
import { useCreator, activityEntry } from "@/lib/creator/store";
import { uniqueSlug, validateItem, type CreatorItem, type ItemKind } from "@/lib/creator/rules";
import { typeIssue } from "@/lib/creator/products";
import { CREATE_STEPS, createGuide, createIssue, createProgress, createStepOf, defaultExtras, draftAnswers, earliestIssue, stepIssue, withCreateDetails, type CreateExtras, type CreateIssue } from "@/lib/creator/createGuide";
import { cn } from "@/lib/utils";
import { ImageUpload } from "../ImageUpload";
import { itemPaths } from "../shared";
import { setupTab } from "./registry";
import { kindArt } from "./ProductChrome";
import { CreateField, CreateSection, OptionCards, PriceInput } from "./CreateKit";
import { CreatePreview } from "./CreatePreview";
import { CoursePresentationEditor, CourseTopicFields, ProductTopicFields } from "./CourseFields";
import {
  CoachingRules, CoachingSessions, CourseCurriculum, CourseOutcomes, DownloadDelivery, DownloadFiles, LiveSchedule, LiveVenue, ServiceBrief, ServicePackages, type DetailProps,
} from "./CreateDetails";

const detailSections: Record<ItemKind, [(p: DetailProps) => React.ReactNode, (p: DetailProps) => React.ReactNode]> = {
  course: [CourseOutcomes, CourseCurriculum],
  ebook: [DownloadFiles, DownloadDelivery],
  live: [LiveSchedule, LiveVenue],
  service: [ServicePackages, ServiceBrief],
  coaching: [CoachingSessions, CoachingRules],
};
/** Type-specific sections that are optional on the create form. */
const optionalSection: Record<ItemKind, [boolean, boolean]> = {
  course: [true, false],
  ebook: [false, true],
  live: [false, false],
  service: [false, true],
  coaching: [false, true],
};
const QUICK_PRICES = [5000, 10000, 25000, 50000];
const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const focusField = (field: string) => {
  const el = document.getElementById(field);
  el?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "center" });
  el?.focus({ preventScroll: true });
};

/**
 * Guided, type-specific create flow, one step per page (step 1 at the create URL, steps 2–5 at ?step=n).
 * Next checks only the current step; saving sends the creator back to the earliest unfinished step.
 * Editing an existing product keeps the standard editor.
 */
export function ItemCreator({ kind, step: urlStep, onStep }: { kind: ItemKind; step?: number | undefined; onStep?: ((step: number, opts?: { replace?: boolean }) => void) | undefined }) {
  const { state, update } = useCreator();
  const navigate = useNavigate();
  const router = useRouter();
  const info = kindInfo[kind];
  const g = createGuide[kind];
  const [form, setForm] = useState<CreatorItem>({
    id: "", kind, title: "", description: "", category: "", price: 0, status: "draft",
    image: creatorCovers[0] ?? "", lessons: [], date: "", capacity: 30,
    duration: kind === "coaching" ? 60 : kind === "service" ? 7 : 0, createdAt: "",
  });
  const [x, setX] = useState<CreateExtras>(defaultExtras);
  const [localStep, setLocalStep] = useState(1);
  const step = Math.min(CREATE_STEPS, Math.max(1, onStep ? urlStep ?? 1 : localStep));
  const go = (n: number, replace = false) => (onStep ? onStep(n, { replace }) : setLocalStep(n));
  /** Steps the creator tried to leave (Next/Save), so errors only appear after an attempt. */
  const [checked, setChecked] = useState<number[]>([]);
  const pendingFocus = useRef<string | null>(null);
  const set = (p: Partial<CreatorItem>) => setForm((f) => ({ ...f, ...p }));
  const setExtra = (p: Partial<CreateExtras>) => setX((v) => ({ ...v, ...p }));

  const issue: CreateIssue | null = checked.includes(step) ? stepIssue(form, x, step) : null;
  const done = createProgress(form, x);
  const doneCount = done.filter(Boolean).length;
  const isCourse = kind === "course";
  const titles = ["The basics", g.sections[0].title, g.sections[1].title, "Pricing", isCourse ? "Cover and presentation" : "Cover image"];
  const short = ["Basics", g.sections[0].title.split(" ")[0] === "What" ? "Outcomes" : g.sections[0].title.split(" ")[0]!, g.sections[1].title.split(" ")[0]!, "Pricing", isCourse ? "Media" : "Cover"];
  const isLast = step === CREATE_STEPS;

  const build = (f: CreatorItem = form, e: CreateExtras = x): CreatorItem => withCreateDetails({
    ...f,
    title: f.title.trim(),
    description: f.description.trim(),
    category: f.category.trim() || "General",
    id: uniqueSlug(f.title || "untitled", state.items.map((i) => i.id)),
    createdAt: new Date().toISOString(),
  }, e);
  const draft = useMemo(() => (createIssue(form, x) ? null : build()), [form, x]); // eslint-disable-line react-hooks/exhaustive-deps
  const publishIssue = draft ? validateItem(draft) || typeIssue(draft) : "Finish the required fields first.";

  // A refreshed or shared link to a later step has no answers yet, so start from the beginning.
  // Only while still on this create page: the router can remount it while leaving after a save.
  useEffect(() => {
    if (router.latestLocation.pathname.replace(/\/$/, "") !== itemPaths[kind].create) return;
    if (step > 1 && !form.title.trim() && !form.description.trim()) go(1, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Each step is its own page: scroll to the top and move focus to it, or to the field that needs fixing.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const field = pendingFocus.current;
    pendingFocus.current = null;
    if (field) { focusField(field); return; }
    window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
    document.getElementById("create-stage")?.focus({ preventScroll: true });
  }, [step]);

  const markChecked = (...steps: number[]) => setChecked((c) => [...new Set([...c, ...steps])]);
  const sendTo = (p: CreateIssue) => {
    const target = createStepOf(p.field);
    markChecked(target);
    if (target === step) focusField(p.field);
    else { pendingFocus.current = p.field; go(target); }
  };
  // Moving between steps never blocks: anything unfinished is checked when publishing.
  const next = () => go(Math.min(CREATE_STEPS, step + 1));
  const jump = (n: number) => { if (n !== step) go(n); };

  const save = (publish: boolean) => {
    const problem = earliestIssue(form, x);
    let item: CreatorItem;
    if (publish) {
      markChecked(1, 2, 3, 4, 5);
      if (problem) {
        sendTo(problem);
        if (createStepOf(problem.field) !== step) toast.error(`Finish "${titles[createStepOf(problem.field) - 1]}"`, { description: problem.message });
        return;
      }
      item = build();
    } else {
      // Drafts always save; unfinished answers get safe defaults and are finished later.
      const d = draftAnswers(form, x, info.noun);
      try { item = build(d.form, d.x); }
      catch { item = build(d.form, { ...defaultExtras, objectives: d.x.objectives, skill: d.x.skill, subtype: d.x.subtype, level: d.x.level, presentation: d.x.presentation }); }
    }
    const blocker = publish ? validateItem(item) || typeIssue(item) : "";
    if (blocker) { toast.error(blocker); return; }
    const saved: CreatorItem = { ...item, status: publish ? "published" : "draft" };
    update((s) => ({
      items: [...s.items, saved],
      activity: [...s.activity, activityEntry(`Created ${info.noun}: ${saved.title}`), ...(publish ? [activityEntry(`${info.label} published: ${saved.title}`)] : [])],
    }));
    if (publish) {
      window.__lovableEvents?.track?.("project.product_published", { product_kind: kind, price_type: saved.price > 0 ? "paid" : "free" });
    }
    navigate({ to: "/creator/products/result/$itemId", params: { itemId: saved.id }, search: { fresh: true } });
  };

  const err = (f: string) => (issue?.field === f ? issue.message : undefined);
  const priceOk = Number.isFinite(form.price) && form.price > 0;
  const pkgs = x.packages.filter((p) => Number.isFinite(p.price));
  const props: DetailProps = { form, x, set, setExtra, issue };
  const [A, B] = detailSections[kind];
  const ready = !publishIssue;
  const eyebrow = `Step ${step} of ${CREATE_STEPS}`;

  return (
    <div className="create-flow">
      <section data-surface="dark" className="bg-brand-panel relative mb-4 overflow-hidden rounded-2xl p-5 text-primary-foreground sm:p-7">
        <span className="hero-dots" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />New {info.noun}</p>
            <h1 className="mt-2 text-2xl sm:text-[32px]">Create a {info.noun}</h1>
            <p className="mt-2 max-w-xl text-sm text-on-dark-muted sm:text-[15px]">{g.what}</p>
          </div>
          <BrandIcon src={kindArt[kind]} className="product-hero-art h-16 w-16 shrink-0 sm:h-28 sm:w-28" />
        </div>
        <div className="mt-5 max-w-lg">
          <div className="flex items-center justify-between gap-3 text-xs font-extrabold">
            <span className="text-on-dark">Your progress</span>
            <span className="tabular-nums text-on-dark-muted">{doneCount}/5 complete</span>
          </div>
          <div className="mt-2 grid grid-cols-5 gap-1.5" role="progressbar" aria-label="Sections complete" aria-valuemin={0} aria-valuemax={5} aria-valuenow={doneCount}>
            {short.map((s, i) => (
              <span key={s} className={cn("create-seg-bar h-1.5 rounded-full", done[i] ? "is-done" : i + 1 === step ? "is-on" : "")} />
            ))}
          </div>
        </div>
      </section>

      <div className="mb-5 md:hidden">
        <SectionDropdown
          heading={eyebrow}
          menuHeading="Go to step"
          value={`create-step-${step}`}
          onChange={(id) => jump(Number(id.replace("create-step-", "")))}
          options={short.map((label, i) => ({ value: `create-step-${i + 1}`, label, done: done[i] }))}
        />
      </div>
      <nav aria-label="Create steps" className="create-rail surface mb-5 hidden px-3 py-4 md:block">
        <ol className="grid grid-cols-5">
          {short.map((s, i) => {
            const n = i + 1;
            const on = step === n;
            return (
              <li key={s} className={cn("create-rail-item", done[i] && "is-done", n < step && "is-past")}>
                <button type="button" onClick={() => jump(n)} aria-current={on ? "step" : undefined} className={cn("create-rail-btn group flex w-full flex-col items-center gap-2 rounded-[14px] px-1 py-1 text-center", on && "is-on", done[i] && "is-done")}>
                  <span className="create-rail-dot relative z-[1] grid h-9 w-9 place-items-center rounded-full text-[13px] font-extrabold">{done[i] && !on ? <Check className="h-4 w-4" strokeWidth={3} /> : n}</span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Step {n}</span>
                    <span className="create-rail-label block truncate text-[13px] font-extrabold">{s}</span>
                  </span>
                  <span className="sr-only">{done[i] ? " (complete)" : ""}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <form onSubmit={(e) => { e.preventDefault(); if (isLast) save(false); else next(); }} className="min-w-0 space-y-5" noValidate aria-label={`Create ${info.label}`}>
          <p className="sr-only" aria-live="polite">{`${eyebrow}: ${titles[step - 1]}`}</p>
          <div id="create-stage" key={step} tabIndex={-1} className="create-stage outline-none" aria-labelledby={`create-step-${step}-title`}>
            {step === 1 && (
              <CreateSection n={1} id="create-step-1" eyebrow={eyebrow} title={titles[0]!} text="What buyers see first on your storefront." done={done[0]}>
                <CreateField id="item-title" label={g.titleLabel} required count={`${form.title.length}/120`} error={err("item-title")} tip="Lead with the result buyers get. Keep it under about 60 characters so it isn't cut off on cards.">
                  <Input id="item-title" value={form.title} maxLength={120} placeholder={g.titlePlaceholder} aria-required="true" aria-invalid={!!err("item-title") || undefined} className="h-12 text-[15px] font-bold" onChange={(e) => set({ title: e.target.value })} />
                </CreateField>
                <CreateField id="item-description" label={g.descLabel} required count={`${form.description.length}/3000`} error={err("item-description")}>
                  <Textarea id="item-description" rows={6} value={form.description} maxLength={3000} placeholder={g.descPlaceholder} aria-required="true" aria-invalid={!!err("item-description") || undefined} onChange={(e) => set({ description: e.target.value })} />
                </CreateField>
                {isCourse ? (
                  <CourseTopicFields category={form.category} skill={x.skill} level={x.level}
                    onChange={(p) => { if (p.category !== undefined) set({ category: p.category }); setExtra({ ...(p.skill !== undefined ? { skill: p.skill } : {}), ...(p.level ? { level: p.level } : {}) }); }} />
                ) : (
                  <ProductTopicFields kind={kind} category={form.category} sub={x.subtype} level={x.level}
                    onChange={(p) => { if (p.category !== undefined) set({ category: p.category }); setExtra({ ...(p.sub !== undefined ? { subtype: p.sub } : {}), ...(p.level ? { level: p.level } : {}) }); }} />
                )}
              </CreateSection>
            )}
            {step === 2 && (
              <CreateSection n={2} id="create-step-2" eyebrow={eyebrow} title={titles[1]!} text={g.sections[0].text} tip={g.sections[0].tip} done={done[1]} optional={optionalSection[kind][0]}>
                <A {...props} />
              </CreateSection>
            )}
            {step === 3 && (
              <CreateSection n={3} id="create-step-3" eyebrow={eyebrow} title={titles[2]!} text={g.sections[1].text} tip={g.sections[1].tip} done={done[2]} optional={optionalSection[kind][1]}>
                <B {...props} />
              </CreateSection>
            )}
            {step === 4 && (
              <CreateSection n={4} id="create-step-4" eyebrow={eyebrow} title="Pricing" text={g.priceHint} done={done[3]}>
                {kind === "service" && x.packages.length > 0 ? (
                  <div className="flex items-center gap-3 rounded-[16px] border border-cobalt-100 bg-ice/50 p-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-cobalt text-primary-foreground"><Tag className="h-5 w-5" /></span>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold">{pkgs.length ? `Starts from ${Math.min(...pkgs.map((p) => p.price)) ? naira(Math.min(...pkgs.map((p) => p.price))) : "Free"}` : "Set a price on each package"}</p>
                      <p className="text-xs text-muted-foreground">Your listed price comes from your cheapest package.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <OptionCards label="How buyers pay" value={priceOk ? "paid" : form.price === 0 ? "free" : "paid"} onChange={(v) => set({ price: v === "free" ? 0 : priceOk ? form.price : NaN })} options={[
                      { value: "paid", title: "Paid", text: kind === "live" ? "Attendees buy a ticket to join." : "Buyers pay once at checkout.", icon: Tag },
                      { value: "free", title: "Free", text: "Great for building an audience.", icon: Gift },
                    ]} />
                    {form.price !== 0 && (
                      <div className="space-y-2.5">
                        <CreateField id="item-price" label={g.priceLabel} required error={err("item-price")} hint={kind === "live" && x.tickets.length ? "Ticket types set their own prices; this is the default." : Number.isFinite(form.price) && form.price > 0 ? `Buyers see ${naira(form.price)}.` : undefined}>
                          <PriceInput id="item-price" value={form.price} onChange={(price) => set({ price })} invalid={!!err("item-price")} />
                        </CreateField>
                        <div className="flex flex-wrap gap-1.5">
                          {QUICK_PRICES.map((p) => (
                            <button key={p} type="button" aria-pressed={form.price === p} onClick={() => set({ price: p })} className={cn("rounded-full border px-3 py-1.5 text-xs font-bold tabular-nums transition-colors", form.price === p ? "border-cobalt bg-ice text-cobalt" : "border-line text-muted-foreground hover:text-cobalt")}>{naira(p)}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CreateSection>
            )}
            {step === 5 && (
              <CreateSection n={5} id="create-step-5" eyebrow={eyebrow} title={titles[4]!} text={isCourse ? "Your cover shows on the storefront. Add an intro video, images or slides to present your course." : "A wide 16:9 image works best on your storefront."} done={done[4]}>
                <ImageUpload id="item-cover" label="Upload your own" hint="JPG, PNG or WebP · up to 5 MB · 1600 × 900 recommended" value={form.image.startsWith("data:") ? form.image : ""} onChange={(image) => set({ image: image || (creatorCovers[0] ?? "") })} />
                <div>
                  <p className="mb-2 text-[13px] font-bold">Or pick a ready-made cover</p>
                  <div className="grid grid-cols-3 gap-2.5">
                    {creatorCovers.slice(0, 6).map((src, n) => (
                      <button key={src} type="button" aria-label={`Choose cover ${n + 1}`} aria-pressed={form.image === src} onClick={() => set({ image: src })} className={cn("create-cover relative overflow-hidden rounded-[12px] p-0.5 ring-2 transition", form.image === src ? "is-on ring-cobalt" : "ring-transparent hover:ring-cobalt-100")}>
                        <img src={src} alt="" className="aspect-video w-full rounded-[10px] object-cover" />
                        {form.image === src && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-lime text-midnight shadow"><Check className="h-3 w-3" strokeWidth={3} /></span>}
                      </button>
                    ))}
                  </div>
                </div>
                {isCourse && (
                  <>
                    <hr className="border-line/70" />
                    <div>
                      <p className="text-[15px] font-extrabold">Course presentation</p>
                      <p className="mt-0.5 text-[13px] text-muted-foreground">Show students what's inside before they enrol. You can change these later from the Presentation tab.</p>
                    </div>
                    <CoursePresentationEditor value={x.presentation} update={(fn) => setX((v) => ({ ...v, presentation: fn(v.presentation) }))} />
                  </>
                )}
              </CreateSection>
            )}
          </div>

          <div className="create-actions surface sticky bottom-3 z-20 p-3 sm:p-4">
            {issue && (
              <p role="alert" className="mb-3 flex items-start gap-2 rounded-[12px] bg-destructive/5 px-3 py-2 text-[13px] font-semibold text-destructive"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{issue.message}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {step > 1 ? (
                <Button type="button" variant="outline" className="max-sm:flex-1" onClick={() => go(step - 1)}><ArrowLeft />Back</Button>
              ) : (
                <Button asChild variant="ghost" className="max-sm:flex-1"><Link to={itemPaths[kind].list}>Cancel</Link></Button>
              )}
              <div className="mx-auto hidden min-w-0 items-center gap-2 text-[13px] sm:flex">
                {isLast ? (
                  ready
                    ? <p className="flex items-center gap-2 font-bold text-foreground"><span className="h-2 w-2 rounded-full bg-lime shadow-[0_0_8px_var(--lime)]" aria-hidden="true" />Ready to publish</p>
                    : <p className="flex min-w-0 items-center gap-2 text-muted-foreground"><CircleDashed className="h-4 w-4 shrink-0" />Saves as a draft. Publish once setup is done.</p>
                ) : (
                  <p className="flex items-center gap-1.5 text-muted-foreground" aria-hidden="true">
                    {short.map((s, i) => <span key={s} className={cn("create-pip h-1.5 rounded-full", i + 1 === step ? "is-on w-5" : done[i] ? "is-done w-1.5" : "w-1.5")} />)}
                  </p>
                )}
              </div>
              {isLast ? (
                ready ? (
                  <>
                    <Button type="submit" variant="outline" className="max-sm:flex-1"><Save />Save draft</Button>
                    <Button type="button" className="max-sm:w-full" onClick={() => save(true)}><Rocket />Publish</Button>
                  </>
                ) : (
                  <Button type="submit" className="max-sm:flex-1">Save and continue</Button>
                )
              ) : (
                <Button type="submit" className="max-sm:flex-1">
                  <span className="sm:hidden">Next</span>
                  <span className="hidden sm:inline">Next: {short[step]}</span>
                  <ArrowRight />
                </Button>
              )}
            </div>
          </div>
        </form>

        <aside id="create-preview" className={cn("space-y-4 lg:sticky lg:top-24", !isLast && "max-lg:hidden")} aria-label="Storefront preview">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cobalt"><span className="h-1.5 w-1.5 rounded-sm bg-lime" aria-hidden="true" />Storefront preview</p>
          <CreatePreview kind={kind} form={form} x={x} />
          <div className="surface p-5">
            <p className="flex items-center justify-between gap-2 text-sm font-extrabold">
              Before you publish
              {ready ? <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] text-midnight">Ready</span> : <span className="text-xs font-bold tabular-nums text-muted-foreground">{doneCount}/5</span>}
            </p>
            <ul className="mt-3 space-y-1">
              {titles.map((t, i) => (
                <li key={t}>
                  <button type="button" onClick={() => jump(i + 1)} aria-current={step === i + 1 ? "step" : undefined} className={cn("flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left text-[13px] transition-colors hover:text-cobalt", step === i + 1 && "bg-ice/70 text-cobalt")}>
                    <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full", done[i] ? "bg-lime text-midnight" : "border-[1.5px] border-line")}>{done[i] && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                    <span className={cn("min-w-0 truncate", done[i] || step === i + 1 ? "font-semibold" : "text-muted-foreground")}>{t}</span>
                  </button>
                </li>
              ))}
            </ul>
            {!ready && draft && <p className="mt-3 rounded-[12px] bg-soft px-3 py-2 text-xs text-muted-foreground">To publish now: {publishIssue}</p>}
          </div>
          <details className="surface group p-5">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-extrabold"><Lightbulb className="h-4 w-4 text-cobalt" />Tips for a great {info.noun}<span className="ml-auto text-xs font-bold text-muted-foreground group-open:hidden">Show</span></summary>
            <ul className="mt-3 space-y-2">
              {g.tips.map((t) => <li key={t} className="flex gap-2 text-[13px] text-muted-foreground"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" aria-hidden="true" />{t}</li>)}
            </ul>
          </details>
        </aside>
      </div>
    </div>
  );
}
