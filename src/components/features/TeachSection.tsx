import { Check, MessagesSquare, MonitorPlay, Play, Target, Zap, type LucideIcon } from "lucide-react";
import { SiTelegram, SiWhatsapp } from "react-icons/si";
import { cutouts } from "./cutouts";
import { Container, Reveal, SectionHeading } from "./primitives";
import { DuoIcon } from "./DuoIcon";

const features: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MonitorPlay,
    title: "Smooth, reliable playback",
    body: "Fast, stable video streaming that works well on every device.",
  },
  {
    icon: MessagesSquare,
    title: "Community integration",
    body: "Connect your WhatsApp or Telegram community for discussions, Q&As and updates.",
  },
  {
    icon: Target,
    title: "Progress tracking",
    body: "See how far your learners have gone and help them stay motivated to finish.",
  },
  {
    icon: Zap,
    title: "Automated enrolments",
    body: "Once learners pay, access, emails, reminders and updates are sent automatically.",
  },
];

export function TeachSection() {
  return (
    <section id="teach" className="relative overflow-hidden bg-soft py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-10">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Teach"
              title="Deliver a first-class"
              highlight="learning experience."
              subtitle="Teach with confidence, in a classroom that works as hard as you do."
            />
            <div className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 80}>
                  <DuoIcon icon={f.icon} size="lg" className="bg-card shadow-soft" />
                  <h3 className="mt-4 fs-17 font-extrabold text-ink">{f.title}</h3>
                  <p className="mt-1.5 fs-15 lh-24 text-muted-foreground">{f.body}</p>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Person breaking out of a light pool — no frames */}
          <Reveal className="relative mx-auto [--ts:1] h-[460px] w-full max-w-[520px] md:h-[580px]">
            <div aria-hidden className="absolute inset-x-0 bottom-0 top-10 rounded-[40px] bg-sky-light-glow" />
            <div aria-hidden className="halo-white absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2" />
            <img
              src={cutouts.learner.src}
              srcSet={cutouts.learner.srcSet}
              sizes={cutouts.learner.sizes}
              alt="Student learning an Enski course on his laptop"
              width={1024}
              height={1280}
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 left-1/2 h-[108%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom"
            />

            <div
              className="glass-on-light absolute -left-1 top-48 w-[200px] md:top-24 md:w-[210px] rounded-[20px] p-3.5 shadow-float animate-float-slow md:-left-10"
              style={{ ["--tilt" as string]: "-3deg" }}
            >
              <p className="fs-11 font-bold text-muted-foreground">Lesson 8 of 12</p>
              <p className="fs-13 font-extrabold text-ink">Pitching to clients</p>
              <div className="mt-2 h-1.5 rounded-full bg-ice">
                <div className="h-full w-[68%] rounded-full bg-cobalt" />
              </div>
              <p className="mt-1.5 fs-11 font-extrabold text-brand">68% complete</p>
            </div>

            <div
              className="glass-on-light absolute -right-1 top-1/2 flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 shadow-float animate-float-fast md:-right-8"
              style={{ ["--tilt" as string]: "3deg" }}
            >
              <span className="flex -space-x-1.5">
                <span className="grid size-8 place-items-center rounded-full border-2 border-card bg-ice text-brand">
                  <SiWhatsapp aria-hidden className="size-4" />
                </span>
                <span className="grid size-8 place-items-center rounded-full border-2 border-card bg-ice text-brand">
                  <SiTelegram aria-hidden className="size-4" />
                </span>
              </span>
              <span>
                <span className="block fs-13 font-extrabold text-ink">Community</span>
                <span className="block fs-12 font-semibold text-muted-foreground">WhatsApp or Telegram</span>
              </span>
            </div>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-midnight py-2 pl-2 pr-4 shadow-float">
              <span className="grid size-7 place-items-center rounded-full bg-lime text-midnight">
                <Check className="size-4" />
              </span>
              <span className="fs-13 font-extrabold text-on-blue">Enrolled · access sent instantly</span>
            </div>

            <span className="absolute right-10 top-14 grid size-12 place-items-center rounded-full bg-card text-brand shadow-float animate-float-slow">
              <Play className="ml-0.5 size-5 fill-current" />
            </span>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
