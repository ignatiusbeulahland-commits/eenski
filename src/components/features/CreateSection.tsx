import {
  Check,
  ChevronDown,
  FileText,
  GripVertical,
  Link2,
  Lock,
  Mail,
  Package,
  Play,
  Plus,
  Rocket,
  ShieldCheck,
  Tag,
  User,
  Video,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container, Reveal, SectionHeading } from "./primitives";
import { photos } from "./photos";
import { Icon3D } from "./icons3d";

export function CreateSection() {
  return (
    <section id="create" className="py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Create"
          title="Create"
          highlight="effortlessly."
          subtitle="Build courses and digital products, launch faster and teach freely. We handle the rest."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <BentoCard
            className="md:col-span-2"
            title="Powerful course-building tools"
            body="Structure video lessons, upload resources, define curriculum flow and control how learners progress, all in a builder made for speed."
            visual={<CurriculumMock />}
          />
          <BentoCard
            title="Self-paced video courses"
            body="Host high-quality lessons with unlimited modules, downloadable resources, lesson previews and more."
            visual={<VideoMock />}
            delay={80}
          />
          <BentoCard
            title="Digital downloads"
            body="Ebooks, templates, PDFs and tools. Upload, price and deliver them instantly and securely."
            visual={<DownloadsMock />}
          />
          <BentoCard
            title="Seamless product onboarding"
            body="Add your product, set your price and go live. No complicated setup."
            visual={<OnboardingMock />}
            delay={80}
          />
          <BentoCard
            title="Affiliate support"
            body="Recruit affiliates, track their sales and grow conversions with built-in analytics."
            visual={<AffiliateMock />}
            delay={160}
          />
          <BentoCard
            className="md:col-span-2 lg:col-span-3"
            wide
            title="Custom checkout forms"
            body="Add extra fields, collect the data you need and boost conversions with checkouts that feel effortless."
            visual={<CheckoutMock />}
          />
        </div>
      </Container>
    </section>
  );
}

function BentoCard({
  title,
  body,
  visual,
  className,
  wide = false,
  delay = 0,
}: {
  title: string;
  body: string;
  visual: ReactNode;
  className?: string;
  wide?: boolean;
  delay?: number;
}) {
  return (
    <Reveal
      delay={delay}
      className={cn(
        "group relative flex overflow-hidden rounded-[28px] bg-soft transition-shadow duration-500 hover:shadow-lift",
        wide ? "flex-col lg:flex-row lg:items-center" : "flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden px-6 pt-8 [--ts:1]",
          wide ? "lg:order-2 lg:w-[56%] lg:py-10 lg:pr-10" : "min-h-[240px]",
        )}
      >
        <div aria-hidden className="dot-grid absolute inset-0 opacity-70" />
        <div className="relative w-full min-w-0 transition-transform duration-500 group-hover:-translate-y-1">
          {visual}
        </div>
      </div>
      <div className={cn("p-7 md:p-8", wide && "lg:w-[44%] lg:p-12")}>
        <h3 className={cn(wide ? "type-h2" : "type-h3", "text-ink")}>
          {title}
        </h3>
        <p className="mt-2.5 fs-15 lh-24 text-muted-foreground">{body}</p>
      </div>
    </Reveal>
  );
}

/* ---------- mocks (product UI, rounded rectangles allowed) ---------- */

function MockCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-[20px] border border-line bg-card p-4 shadow-soft", className)}>
      {children}
    </div>
  );
}

function CurriculumMock() {
  const lessons = [
    { t: "Welcome to the course", d: "04:12", done: true },
    { t: "Pricing your first product", d: "12:40", done: true },
    { t: "Recording on your phone", d: "09:05", done: false },
  ];
  return (
    <div className="mx-auto grid max-w-[620px] grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
      <MockCard>
        <div className="flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-sky-text">Module 1</p>
          <span className="rounded-full bg-ice px-2.5 py-1 fs-11 font-bold text-brand">
            3 lessons
          </span>
        </div>
        <p className="mt-1 fs-15 font-extrabold text-ink">Getting started</p>
        <ul className="mt-3 space-y-2">
          {lessons.map((l) => (
            <li
              key={l.t}
              className="flex items-center gap-2.5 rounded-[12px] bg-soft px-2.5 py-2 fs-13 font-semibold text-ink"
            >
              <GripVertical className="size-4 text-muted-foreground" />
              <Video className="size-4 text-brand" />
              <span className="flex-1 truncate">{l.t}</span>
              <span className="fs-12 text-muted-foreground">{l.d}</span>
            </li>
          ))}
        </ul>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ice px-3 py-1.5 fs-13 font-extrabold text-brand">
          <Plus className="size-3.5" /> Add lesson
        </span>
      </MockCard>
      <div className="hidden flex-col gap-3 sm:flex">
        <MockCard className="p-3.5">
          <p className="fs-12 font-bold text-muted-foreground">Learner flow</p>
          {["Drip content", "Lock next lesson", "Certificates"].map((s, i) => (
            <div key={s} className="mt-2.5 flex items-center justify-between fs-13 font-semibold text-ink">
              {s}
              <span
                className={cn(
                  "flex h-5 w-9 items-center rounded-full p-0.5",
                  i !== 1 ? "justify-end bg-cobalt" : "bg-line",
                )}
              >
                <span className="size-4 rounded-full bg-card" />
              </span>
            </div>
          ))}
        </MockCard>
        <MockCard className="flex items-center gap-2.5 p-3.5">
          <span className="grid size-9 place-items-center rounded-[10px] bg-ice text-brand">
            <FileText className="size-4" />
          </span>
          <span className="fs-13 font-bold text-ink">
            Workbook.pdf
            <span className="block fs-11 font-semibold text-muted-foreground">Resource · 2.4 MB</span>
          </span>
        </MockCard>
      </div>
    </div>
  );
}

function VideoMock() {
  return (
    <MockCard className="mx-auto max-w-[340px] p-2.5">
      <div className="group/video relative aspect-video overflow-hidden rounded-[14px] bg-sky-light-glow">
        <img
          src={photos.tech}
          alt="Creator recording a coding lesson"
          width={768}
          height={960}
          loading="lazy"
          className="absolute inset-0 size-full object-cover object-[50%_30%] transition-transform duration-700 group-hover/video:scale-105"
        />
        <span className="absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-card text-brand shadow-float transition-transform duration-300 group-hover/video:scale-110">
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-card/50 [animation-duration:2.4s]" />
          <Play className="relative ml-0.5 size-6 fill-current" />
        </span>
        <span className="absolute left-2.5 top-2.5 rounded-full bg-midnight/70 px-2 py-0.5 fs-11 font-bold text-on-blue">
          HD · 1080p
        </span>
      </div>
      <div className="px-1.5 pb-1 pt-3">
        <p className="fs-12 font-bold text-muted-foreground">Module 3 · Lesson 2</p>
        <p className="fs-14 font-extrabold text-ink">Build your first API</p>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ice">
          <div className="h-full w-[62%] rounded-full bg-sky" />
        </div>
      </div>
    </MockCard>
  );
}

function DownloadsMock() {
  const files = [
    { n: "Brand kit templates", meta: ["PDF", "ZIP"], size: "Template", p: "₦7,500", icon: "categories" as const, rot: "-rotate-3" },
    { n: "Freelance pricing ebook", meta: ["PDF"], size: "Ebook", p: "₦4,000", icon: "ebook" as const, rot: "rotate-2" },
  ];
  return (
    <div className="relative mx-auto flex max-w-[300px] flex-col gap-3">
      {files.map((f) => (
        <MockCard
          key={f.n}
          className={cn(
            "flex items-center gap-3 p-3 transition-transform duration-500 group-hover:rotate-0",
            f.rot,
          )}
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-[14px] bg-ice">
            <Icon3D name={f.icon} className="size-10" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block fs-13 font-extrabold lh-17 text-ink">{f.n}</span>
            <span className="mt-1 flex items-center gap-1">
              {f.meta.map((m) => (
                <span key={m} className="rounded-[6px] bg-soft px-1.5 py-px fs-11 font-bold text-slate">
                  {m}
                </span>
              ))}
              <span className="fs-11 font-semibold text-muted-foreground">· {f.size}</span>
            </span>
          </span>
          <span className="fs-14 font-extrabold text-brand">{f.p}</span>
        </MockCard>
      ))}
      <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-midnight py-1.5 pl-1.5 pr-3.5 fs-12 font-bold text-on-blue shadow-float">
        <span className="grid size-5 place-items-center rounded-full bg-lime text-midnight">
          <Check className="size-3" strokeWidth={3} />
        </span>
        Delivered instantly
      </span>
    </div>
  );
}

function OnboardingMock() {
  const steps = [
    { t: "Add your product", sub: "Course, ebook or template", icon: Package, done: true },
    { t: "Set your price", sub: "One-time or split payments", icon: Tag, done: true },
    { t: "Go live", sub: "Ready to publish", icon: Rocket, done: false },
  ];
  return (
    <MockCard className="mx-auto max-w-[300px]">
      <div className="flex items-center justify-between">
        <p className="fs-12 font-bold text-muted-foreground">Launch checklist</p>
        <p className="fs-12 font-extrabold text-brand">2 of 3</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ice">
        <div className="h-full w-2/3 rounded-full bg-cobalt" />
      </div>
      <ol className="mt-3 space-y-1">
        {steps.map((s, i) => (
          <li
            key={s.t}
            className={cn(
              "relative flex items-center gap-3 rounded-[14px] px-2 py-2",
              !s.done && "bg-ice",
            )}
          >
            {i < steps.length - 1 && (
              <span aria-hidden className="absolute left-[25px] top-[44px] h-3 w-0.5 rounded-full bg-cobalt" />
            )}
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full",
                s.done ? "bg-cobalt text-primary-foreground" : "bg-card text-brand shadow-soft",
              )}
            >
              {s.done ? <Check className="size-4" strokeWidth={3} /> : <s.icon className="size-4" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block fs-14 font-bold text-ink">{s.t}</span>
              <span className="block truncate fs-11 font-semibold text-muted-foreground">{s.sub}</span>
            </span>
            {!s.done && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-midnight px-2.5 py-1 fs-11 font-extrabold text-lime">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-lime" />
                </span>
                Live
              </span>
            )}
          </li>
        ))}
      </ol>
    </MockCard>
  );
}

function AffiliateMock() {
  const bars = [40, 55, 48, 70, 62, 86, 78];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const peak = bars.length - 2;
  const people = ["bg-cobalt text-primary-foreground", "bg-sky text-midnight", "bg-ice text-brand"];
  return (
    <MockCard className="mx-auto max-w-[300px]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 fs-12 font-bold text-muted-foreground">
          <span className="flex -space-x-1.5">
            {people.map((c) => (
              <span
                key={c}
                className={cn("grid size-7 place-items-center rounded-full border-2 border-card", c)}
              >
                <User className="size-3.5" strokeWidth={2.5} />
              </span>
            ))}
          </span>
          24 affiliates
        </span>
        <span className="rounded-full bg-ice px-2 py-0.5 fs-11 font-extrabold text-brand">+18%</span>
      </div>
      <p className="mt-2 fs-22 font-extrabold tracking-tight text-ink">₦1.2M</p>
      <p className="fs-12 font-semibold text-muted-foreground">Referred sales this month</p>
      <div className="relative mt-4 flex h-16 items-end gap-1.5">
        {bars.map((h, i) => (
          <span key={i} className="relative flex h-full flex-1 items-end">
            {i === peak && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-midnight px-1.5 py-0.5 fs-11 font-extrabold text-on-blue">
                Best day
              </span>
            )}
            <span
              className={cn(
                "w-full rounded-[6px] transition-[height] duration-500",
                i === peak ? "bg-cobalt" : "bg-sky-200 group-hover:bg-sky-light-glow",
              )}
              style={{ height: `${h}%` }}
            />
          </span>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {days.map((d, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 text-center fs-11 font-bold",
              i === peak ? "text-brand" : "text-muted-foreground",
            )}
          >
            {d}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-full bg-soft py-1 pl-3 pr-1 fs-12 font-semibold text-slate">
        <Link2 className="size-3.5 shrink-0 text-brand" />
        <span className="min-w-0 flex-1 truncate">enski.co/r/ada-designs</span>
        <span className="rounded-full bg-cobalt px-2.5 py-1 fs-11 font-extrabold text-primary-foreground">
          Copy
        </span>
      </div>
    </MockCard>
  );
}

function CheckoutMock() {
  return (
    <div className="mx-auto grid max-w-[600px] grid-cols-[minmax(0,1fr)] gap-3 pb-8 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:pb-0">
      <MockCard className="p-0 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <img
            src={photos.design}
            alt=""
            width={768}
            height={960}
            loading="lazy"
            className="size-11 shrink-0 rounded-[12px] object-cover object-[50%_25%]"
          />
          <div className="min-w-0 flex-1">
            <p className="fs-11 font-bold uppercase tracking-[0.08em] text-sky-text">Checkout</p>
            <p className="fs-15 font-extrabold lh-18 text-ink">UI design masterclass</p>
          </div>
          <p className="fs-15 font-extrabold text-ink">₦45,000</p>
        </div>
        <div className="space-y-3 p-4">
          <Field
            label="Email address"
            value="ada@studio.ng"
            leading={<Mail className="size-4 text-slate" />}
            trailing={
              <span className="grid size-5 place-items-center rounded-full bg-ice text-brand">
                <Check className="size-3" strokeWidth={3} />
              </span>
            }
          />
          <Field
            label="What do you do?"
            value="Freelance designer"
            custom
            trailing={<ChevronDown className="size-4 text-brand" />}
          />
          <div className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cobalt fs-14 font-extrabold text-primary-foreground transition-colors hover:bg-midnight"
          >
            <Lock className="size-4" /> Pay ₦45,000
          </div>
          <p className="flex items-center justify-center gap-1.5 fs-11 font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-brand" /> Secure checkout
          </p>
        </div>
      </MockCard>
      <div className="hidden flex-col justify-center gap-3 lg:flex">
        <MockCard className="p-3.5">
          <p className="fs-12 font-bold text-muted-foreground">Custom fields</p>
          {["Phone number", "Company", "How did you hear about us?"].map((f) => (
            <div key={f} className="mt-2 flex items-center gap-2 fs-13 font-semibold text-ink">
              <span className="grid size-5 place-items-center rounded-[6px] bg-cobalt text-primary-foreground">
                <Check className="size-3" />
              </span>
              {f}
            </div>
          ))}
        </MockCard>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  custom,
  leading,
  trailing,
}: {
  label: string;
  value: string;
  custom?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 fs-12 font-bold text-slate">
        {label}
        {custom && (
          <span className="rounded-full bg-ice px-2 py-px fs-11 font-extrabold text-brand">Custom</span>
        )}
      </p>
      <div
        className={cn(
          "flex h-11 items-center gap-2.5 rounded-[14px] border-[1.5px] px-3.5 fs-13 font-semibold text-ink transition-shadow",
          custom ? "border-brand bg-card ring-4 ring-ice" : "border-line bg-soft",
        )}
      >
        {leading}
        <span className="min-w-0 flex-1 truncate">{value}</span>
        {trailing}
      </div>
    </div>
  );
}
