import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileText, ImagePlus, Linkedin, Loader2, UserRound, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { categories } from "@/content/blog";
import { cn } from "@/lib/utils";
import {
  ARTICLE_MIN_CHARS,
  checkFile,
  DOCUMENT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  SOCIAL_FIELDS,
  submitArticle,
  validateSubmission,
  type SocialKey,
  type SubmissionField,
} from "./submission";

const inputCls =
  "h-12 w-full rounded-[14px] border border-line bg-card px-4 text-[15px] font-medium text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 focus:border-sky focus:ring-4 focus:ring-sky/15 aria-[invalid=true]:border-destructive";

type Errors = Partial<Record<SubmissionField | "photo" | "document", string>>;

export function WriteArticleForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [socials, setSocials] = useState<Partial<Record<SocialKey, string>>>({});
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string; title: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setFailure(null);
    const result = validateSubmission({
      fullName, email, bio, linkedin, socials, title, category, body,
      hasDocument: Boolean(documentFile), hasCover: Boolean(cover), agreed,
    });
    const fileErrors: Errors = {};
    if (cover) { const m = checkFile(cover, "image"); if (m) fileErrors.cover = m; }
    if (photo) { const m = checkFile(photo, "image"); if (m) fileErrors.photo = m; }
    if (documentFile) { const m = checkFile(documentFile, "document"); if (m) fileErrors.document = m; }
    const all: Errors = { ...(result.ok ? {} : result.errors), ...fileErrors };
    setErrors(all);
    if (!result.ok || Object.keys(fileErrors).length || !cover) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }
    if (website) { setSent({ name: result.data.full_name, title: result.data.title }); return; }

    setSending(true);
    const res = await submitArticle(result.data, { cover, photo, document: documentFile });
    setSending(false);
    if (res.status === "sent") {
      setSent({ name: result.data.full_name.split(" ")[0] ?? result.data.full_name, title: result.data.title });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else setFailure(res.message);
  };

  if (sent) {
    return (
      <div role="status" className="rounded-[28px] border border-line bg-card p-8 text-center shadow-float md:p-12">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-lime text-midnight">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h2 className="text-h2 mt-6 text-ink">Thank you, {sent.name}!</h2>
        <p className="mx-auto mt-3 max-w-md text-[17px] leading-relaxed text-muted-foreground">
          “{sent.title}” is with Enski's editors for review.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="default" size="lg">
            <Link to="/blog">Back to the blog</Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
            Send another article
          </Button>
        </div>
      </div>
    );
  }

  const bodyCount = body.trim().length;

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-8" aria-busy={sending}>
      {/* honeypot: hidden from people, bots tend to fill it */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>

      <Section step="1" title="About you" hint="This shows on your author profile if we publish your article.">
        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
          <ImagePicker
            label="Profile photo"
            file={photo}
            onChange={setPhoto}
            error={errors.photo}
            round
            icon={<UserRound className="size-7" aria-hidden />}
            hint="Optional"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required error={errors.fullName}>
              {(p) => <input {...p} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" maxLength={100} placeholder="Ada Okafor" className={inputCls} />}
            </Field>
            <Field label="Email address" required error={errors.email} hint="Only our editors see this.">
              {(p) => <input {...p} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" maxLength={254} placeholder="you@example.com" className={inputCls} />}
            </Field>
            <Field label="Short bio" error={errors.bio} hint={`${bio.trim().length}/600`} className="sm:col-span-2">
              {(p) => <textarea {...p} value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={600} placeholder="Product designer in Lagos, writing about breaking into tech." className={cn(inputCls, "h-auto py-3 leading-relaxed")} />}
            </Field>
          </div>
        </div>
      </Section>

      <Section step="2" title="Where can readers find you?" hint="Add LinkedIn and any other socials you'd like on your profile.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="LinkedIn" error={errors.linkedin} className="sm:col-span-2">
            {(p) => (
              <div className="relative">
                <Linkedin className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand" aria-hidden />
                <input {...p} type="url" inputMode="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourname" maxLength={300} className={cn(inputCls, "pl-12")} />
              </div>
            )}
          </Field>
          {SOCIAL_FIELDS.map((f) => (
            <Field key={f.key} label={f.label} error={undefined}>
              {(p) => <input {...p} type="url" inputMode="url" value={socials[f.key] ?? ""} onChange={(e) => setSocials((s) => ({ ...s, [f.key]: e.target.value }))} placeholder={f.placeholder} maxLength={300} aria-invalid={errors.socials ? true : undefined} className={inputCls} />}
            </Field>
          ))}
          {errors.socials && <p className="text-sm font-semibold text-destructive sm:col-span-2">{errors.socials}</p>}
        </div>
      </Section>

      <Section step="3" title="Your article" hint="Paste it below or upload a document. We'll handle the formatting.">
        <div className="grid gap-5">
          <ImagePicker
            label="Cover image"
            required
            wide
            file={cover}
            onChange={setCover}
            error={errors.cover}
            icon={<ImagePlus className="size-7" aria-hidden />}
            hint="JPG, PNG or WebP, up to 5 MB. Landscape works best."
          />
          <div className="grid gap-5 sm:grid-cols-[1fr_220px]">
            <Field label="Article title" required error={errors.title}>
              {(p) => <input {...p} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} placeholder="How I landed my first UX role in 90 days" className={inputCls} />}
            </Field>
            <Field label="Topic" required error={errors.category}>
              {(p) => (
                <select {...p} value={category} onChange={(e) => setCategory(e.target.value)} className={cn(inputCls, "appearance-none")}>
                  <option value="">Choose a topic</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </Field>
          </div>
          <Field
            label="Article"
            required={!documentFile}
            error={errors.body}
            hint={documentFile ? "Optional, since you've uploaded a document." : `${bodyCount.toLocaleString()} characters · at least ${ARTICLE_MIN_CHARS}`}
          >
            {(p) => <textarea {...p} value={body} onChange={(e) => setBody(e.target.value)} rows={14} placeholder="Start writing, or paste your article here…" className={cn(inputCls, "h-auto min-h-[280px] py-3.5 leading-relaxed")} />}
          </Field>
          <DocumentPicker file={documentFile} onChange={setDocumentFile} error={errors.document} />
        </div>
      </Section>

      <div className="rounded-[24px] border border-line bg-soft p-5 md:p-6">
        <label className="flex cursor-pointer items-start gap-3 text-[15px] font-semibold leading-relaxed text-ink">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            aria-invalid={errors.agreed ? true : undefined}
            className="mt-1 size-5 shrink-0 accent-[var(--color-cobalt)]"
          />
          <span>
            This is my own original work, and I'm happy for Enski editors to review, lightly edit and publish it with
            credit to me.
          </span>
        </label>
        {errors.agreed && <p className="mt-2 pl-8 text-sm font-semibold text-destructive">{errors.agreed}</p>}
      </div>

      {failure && (
        <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {failure}
        </p>
      )}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Our editors reply within 5 working days.</p>
        <Button type="submit" size="lg" disabled={sending} className="min-w-[220px]">
          {sending ? <><Loader2 className="animate-spin" aria-hidden /> Sending…</> : <>Submit for review <ArrowRight aria-hidden /></>}
        </Button>
      </div>
    </form>
  );
}

function Section({ step, title, hint, children }: { step: string; title: string; hint: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-[28px] border border-line bg-card p-5 shadow-card md:p-8">
      <legend className="sr-only">{title}</legend>
      <div className="mb-6 flex items-start gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cobalt text-[15px] font-extrabold text-primary-foreground" aria-hidden>
          {step}
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-ink">{title}</h2>
          <p className="mt-1 text-[15px] text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </fieldset>
  );
}

type FieldProps = { id: string; "aria-invalid"?: true; "aria-describedby"?: string; required?: boolean };

function Field({
  label, required, error, hint, className, children,
}: {
  label: string;
  required?: boolean;
  error: string | undefined;
  hint?: string;
  className?: string;
  children: (p: FieldProps) => ReactNode;
}) {
  const id = useId();
  const msgId = `${id}-msg`;
  const p: FieldProps = { id };
  if (error) p["aria-invalid"] = true;
  if (error || hint) p["aria-describedby"] = msgId;
  if (required) p.required = true;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children(p)}
      {(error || hint) && (
        <p id={msgId} className={cn("mt-1.5 text-[13px]", error ? "font-semibold text-destructive" : "text-muted-foreground")}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

function usePreview(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

function ImagePicker({
  label, file, onChange, error, icon, hint, required, round, wide,
}: {
  label: string;
  file: File | null;
  onChange: (f: File | null) => void;
  error: string | undefined;
  icon: ReactNode;
  hint: string;
  required?: boolean;
  round?: boolean;
  wide?: boolean;
}) {
  const id = useId();
  const preview = usePreview(file);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className={wide ? "w-full" : "w-fit"}>
      <span className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      <div className="relative">
        <label
          htmlFor={id}
          className={cn(
            "group relative grid cursor-pointer place-items-center overflow-hidden border-2 border-dashed bg-soft text-brand transition-colors hover:border-sky hover:bg-ice focus-within:border-sky focus-within:ring-4 focus-within:ring-sky/15",
            error ? "border-destructive" : "border-line",
            round ? "size-28 rounded-full" : "aspect-[16/7] w-full rounded-[22px]",
          )}
        >
          {preview ? (
            <img src={preview} alt={`${label} preview`} className="absolute inset-0 size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 px-4 text-center">
              {icon}
              <span className="text-sm font-bold">{round ? "Add photo" : "Upload cover image"}</span>
            </span>
          )}
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={IMAGE_EXTENSIONS.map((e) => `.${e}`).join(",")}
            aria-invalid={error ? true : undefined}
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
        {file && (
          <button
            type="button"
            aria-label={`Remove ${label.toLowerCase()}`}
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
            className={cn("absolute grid size-8 place-items-center rounded-full bg-midnight text-primary-foreground shadow-float", round ? "right-0 top-0" : "right-3 top-3")}
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <p className={cn("mt-1.5 text-[13px]", error ? "font-semibold text-destructive" : "text-muted-foreground", round && "text-center")}>
        {error ?? hint}
      </p>
    </div>
  );
}

function DocumentPicker({ file, onChange, error }: { file: File | null; onChange: (f: File | null) => void; error: string | undefined }) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <div className={cn("flex flex-wrap items-center gap-3 rounded-[18px] border border-dashed bg-soft p-4", error ? "border-destructive" : "border-line")}>
        <span className="grid size-11 place-items-center rounded-xl bg-ice text-brand"><FileText className="size-5" aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{file ? file.name : "Prefer to upload your article?"}</p>
          <p className="text-[13px] text-muted-foreground">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : "PDF, Word, text or Markdown, up to 10 MB."}</p>
        </div>
        {file ? (
          <Button type="button" variant="outline" size="sm" onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = ""; }}>
            Remove
          </Button>
        ) : (
          <label htmlFor={id} className="inline-flex h-9 cursor-pointer items-center rounded-full border border-line bg-card px-4 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand focus-within:ring-4 focus-within:ring-sky/15">
            Choose file
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={DOCUMENT_EXTENSIONS.map((e) => `.${e}`).join(",")}
              aria-invalid={error ? true : undefined}
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>
        )}
      </div>
      {error && <p className="mt-1.5 text-[13px] font-semibold text-destructive">{error}</p>}
    </div>
  );
}
