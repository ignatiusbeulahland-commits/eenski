import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  FileDown,
  MessagesSquare,
  MonitorPlay,
  Radio,
} from "lucide-react";
import creatorHoodie from "@/assets/people/creator-hoodie.webp";
import creatorLime from "@/assets/people/creator-lime-seated.webp";
import creatorCobalt from "@/assets/people/creator-cobalt-seated.webp";
import courseShot from "@/assets/offerings/courses.webp";
import liveShot from "@/assets/offerings/live.webp";
import digitalShot from "@/assets/offerings/digital.webp";
import coachingShot from "@/assets/offerings/coaching.webp";
import servicesShot from "@/assets/offerings/services.webp";
import communityShot from "@/assets/offerings/community.webp";
import { Button } from "@/components/ui/button";
import { DuoIcon } from "./DuoIcon";
import { FloatChip } from "./FloatChip";
import { Icon3D } from "./Icon3D";
import { links } from "./data";
import { CountUp, Reveal } from "./motion";
import { PeopleSlides } from "./PeopleSlides";

export const creatorSlides = [
  { src: creatorHoodie, width: 780, height: 1241, alt: "Creator in a sky-blue Enski hoodie sitting on a navy floor cushion and giving a peace sign" },
  { src: creatorLime, width: 912, height: 1396, alt: "Creator in a lime Enski hoodie and navy joggers seated on a navy cushion with his laptop" },
  { src: creatorCobalt, width: 888, height: 1400, alt: "Creator in a cobalt Enski jacket and lime joggers seated on a navy cushion with her tablet" },
];

const offerings = [
  {
    icon: MonitorPlay,
    title: "Courses",
    image: courseShot,
    imageAlt: "Laptop playing a video lesson on a wooden table",
    body: "Structured, step-by-step video lessons your learners can take anytime, at their own pace.",
  },
  {
    icon: Radio,
    title: "Live sessions & events",
    image: liveShot,
    imageAlt: "Camera, microphone and tablet set up to host a live session",
    body: "Host real-time sessions. Enski handles payments, access, reminders and onboarding.",
    note: "Direct live streaming coming soon",
  },
  {
    icon: FileDown,
    title: "Digital products",
    image: digitalShot,
    imageAlt: "Hand browsing a digital guide on a tablet",
    body: "Sell ebooks, guides, templates, checklists and any resource learners can use instantly.",
  },
  {
    icon: CalendarClock,
    title: "Coaching & mentorship",
    image: coachingShot,
    imageAlt: "Two people talking over coffee in a one-to-one session",
    body: "Offer 1:1 or group coaching with built-in scheduling, bookings and payments.",
    soon: true,
  },
  {
    icon: Briefcase,
    title: "Services",
    image: servicesShot,
    imageAlt: "Consultant reviewing charts on a laptop for a client",
    body: "Get paid for consulting, audits, strategy or done-for-you help, directly on Enski.",
  },
  {
    icon: MessagesSquare,
    title: "Communities",
    image: communityShot,
    imageAlt: "Group of people working together around a shared table of laptops",
    body: "Run a private learning community to post content and engage members long-term.",
    soon: true,
  },
];

export function ForCreators() {
  return (
    <section id="creators" className="relative overflow-hidden bg-cobalt-light text-primary-foreground">
      <div className="absolute inset-0 bg-dots opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-[1200px] px-5 pt-16 lg:pt-24">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-lime">For creators</p>
          <h2 className="text-h2 mt-3">
            One platform. <span className="text-lime">Unlimited ways</span> to create and sell
            your knowledge.
          </h2>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-on-blue">
            Turn your expertise into digital products that reach learners across Africa and
            beyond.
          </p>
        </Reveal>

        <div className="mt-12 grid items-end gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Person rises out of the bottom edge */}
          <Reveal className="relative order-2 mx-auto h-[420px] w-full max-w-[460px] lg:order-1 lg:h-[600px]">
            <div
              className="absolute bottom-0 left-1/2 aspect-square w-[110%] -translate-x-1/2 translate-y-[20%] rounded-full bg-glow-behind"
              aria-hidden="true"
            />
            <PeopleSlides slides={creatorSlides} label="Enski creators" />
            <Icon3D
              name="megaphone"
              className="absolute bottom-[14%] right-[2%] z-20 size-16 -rotate-6 animate-bob lg:size-20"
            />
            <FloatChip
              className="left-0 top-[10%]"
              tilt={-4}
              icon="cart"
              subtitle="New sale"
              title={<CountUp value="₦45,000" />}
            />
            <FloatChip
              className="right-0 top-[28%]"
              tilt={5}
              delay={1}
              tone="lime"
              icon="profile"
              subtitle="This week"
              title={<CountUp value="+24 learners" />}
            />
          </Reveal>

          <div className="order-1 grid gap-x-8 gap-y-7 pb-4 sm:grid-cols-2 lg:order-2 lg:pb-24">
            {offerings.map(({ icon: Icon, title, body, soon, note, image, imageAlt }, i) => (
              <Reveal key={title} delay={(i % 2) * 80} className="flex flex-col gap-4">
                <div className="group relative aspect-[16/9] overflow-hidden rounded-[20px] ring-1 ring-primary-foreground/15">
                  <img
                    src={image}
                    alt={imageAlt}
                    width={720}
                    height={405}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transform-none"
                  />
                </div>
                <div className="flex gap-4">
                <DuoIcon icon={Icon} tone="blue" />
                <div>
                  <h3 className="flex flex-wrap items-center gap-2 text-lg font-extrabold">
                    {title}
                    {soon && (
                      <span className="eyebrow rounded-md bg-lime px-2 py-0.5 text-[10px] text-midnight">
                        Soon
                      </span>
                    )}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-on-blue">{body}</p>
                  {note && <p className="mt-1.5 text-[13px] font-semibold text-sky-light">{note}</p>}
                </div>
                </div>
              </Reveal>
            ))}
            <Reveal className="sm:col-span-2">
              <Button asChild variant="lime" size="lg">
                <a href={links.register}>
                  Start creating <ArrowRight />
                </a>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
