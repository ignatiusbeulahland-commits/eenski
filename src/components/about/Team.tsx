import danOdotukpono from "@/assets/about/team-dan-odotukpono.webp";
import danielAkhile from "@/assets/about/team-daniel-akhile.webp";
import beulahlandIgnatius from "@/assets/about/team-beulahland-ignatius.webp";
import { Reveal } from "@/components/site/motion";
import { cn } from "@/lib/utils";

type Member = {
  name: string;
  role: string;
  tone: keyof typeof tones;
  /** Transparent cut-out; members without one show their initials. */
  photo?: { src: string; width: number; height: number };
};

// Dan, Daniel and Beulahland are real team members (Beulahland's cut-out is from her own photo, background
// removed only); the last two are placeholders until real details arrive.
const team: Member[] = [
  {
    name: "Dr. Dan Odotukpono",
    role: "Founder & CEO",
    tone: "cobalt",
    photo: { src: danOdotukpono, width: 400, height: 390 },
  },
  {
    name: "Daniel Akhile",
    role: "Co-founder & CTO",
    tone: "sky",
    photo: { src: danielAkhile, width: 400, height: 377 },
  },
  {
    name: "Beulahland Ignatius",
    role: "UI/UX Product Manager",
    tone: "lime",
    photo: { src: beulahlandIgnatius, width: 400, height: 469 },
  },
  { name: "Ngozi Eze", role: "Lead Engineer", tone: "midnight" },
  { name: "Chidi Nwosu", role: "Marketing Director", tone: "cobalt" },
];

const tones = {
  cobalt: "bg-cobalt-light text-primary-foreground",
  sky: "bg-sky-light-glow text-midnight",
  lime: "bg-lime text-midnight",
  midnight: "bg-midnight text-lime",
} as const;

function initials(name: string) {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export { team };

export function Team() {
  return (
    <section id="team" className="bg-background py-16 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-5">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-sky-text">Our team</p>
          <h2 className="text-h2 mt-4 text-ink">
            Meet the <span className="text-brand">builders.</span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
            Engineers, designers and strategists working every day to power the creator economy.
          </p>
        </Reveal>

        <ul className="mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
          {team.map((m, i) => (
            <Reveal
              as="li"
              key={m.name}
              delay={i * 80}
              className="group w-[calc(50%-0.5rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(20%-1.2rem)]"
            >
              {/* Colour pool sits low so the cut-out's head breaks its top edge */}
              <div className="lift relative aspect-[4/5]">
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 top-[22%] overflow-hidden rounded-[24px]",
                    tones[m.tone],
                  )}
                  aria-hidden="true"
                >
                  <div className="absolute inset-0 bg-dots opacity-40" />
                </div>
                {m.photo ? (
                  <img
                    src={m.photo.src}
                    alt={`${m.name}, ${m.role} at Enski`}
                    width={m.photo.width}
                    height={m.photo.height}
                    loading="lazy"
                    className="absolute bottom-0 left-1/2 z-10 h-[96%] w-auto max-w-full -translate-x-1/2 rounded-b-[24px] object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 top-[22%] grid place-items-center text-6xl font-extrabold tracking-[-0.04em] transition-transform duration-500 group-hover:scale-110 sm:text-7xl",
                      tones[m.tone],
                      "bg-transparent",
                    )}
                    aria-hidden="true"
                  >
                    {initials(m.name)}
                  </span>
                )}
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-ink sm:text-xl">{m.name}</h3>
              <p className="mt-0.5 text-sm font-semibold text-muted-foreground">{m.role}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
