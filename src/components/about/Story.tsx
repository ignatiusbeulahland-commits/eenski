import { Quote } from "lucide-react";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal } from "@/components/site/motion";

const chapters = [
  {
    n: "01",
    title: "The idea",
    body: "It began with a simple observation: African brilliance is unmatched, yet the tools to earn from it globally were scattered and broken. Creators spent more time fighting payment gateways than making content. So we built Enski.",
  },
  {
    n: "02",
    title: "The evolution",
    body: "We started with a simple place to host courses. Today Enski is a full ecosystem: digital products, live sessions, community, analytics and a premium checkout that converts.",
  },
];

const today = [
  { label: "Courses", tilt: -4 },
  { label: "Digital products", tilt: 3 },
  { label: "Live sessions", tilt: -2 },
  { label: "Community", tilt: 4 },
  { label: "Analytics", tilt: -3 },
  { label: "Premium checkout", tilt: 2 },
];

export function Story() {
  return (
    <section id="story" className="relative overflow-hidden bg-soft py-16 lg:py-28">
      <Icon3D
        name="flame"
        className="parallax-y absolute right-[6%] top-10 hidden size-24 rotate-12 animate-bob md:block"
      />
      <div className="relative mx-auto grid max-w-[1200px] gap-12 px-5 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow text-sky-text">Our story</p>
          <h2 className="text-h2 mt-4 text-ink">
            Where it all <span className="text-brand">started.</span>
          </h2>
          <p className="mt-5 max-w-sm text-[17px] leading-relaxed text-muted-foreground">
            From one frustrating payment page to a home for Africa's dreamers.
          </p>
        </Reveal>

        <div>
          <ol className="relative space-y-12 border-l-2 border-dashed border-sky-200 pl-8 lg:pl-12">
            {chapters.map((c, i) => (
              <Reveal as="li" key={c.n} delay={i * 100} className="relative">
                <span
                  className="absolute -left-[calc(2rem+9px)] top-1 size-4 rounded-full bg-cobalt ring-4 ring-soft lg:-left-[calc(3rem+9px)]"
                  aria-hidden="true"
                />
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-extrabold tracking-[-0.04em] text-sky lg:text-6xl">{c.n}</span>
                  <h3 className="text-2xl font-extrabold text-ink">{c.title}</h3>
                </div>
                <div className="mt-4 flex gap-3">
                  <Quote className="mt-1 size-6 shrink-0 fill-sky-200 text-brand" strokeWidth={1.75} aria-hidden />
                  <p className="text-[17px] leading-relaxed text-slate lg:text-lg">{c.body}</p>
                </div>
              </Reveal>
            ))}

            <Reveal as="li" delay={200} className="relative">
              <span
                className="absolute -left-[calc(2rem+11px)] top-1 size-5 rounded-full bg-lime ring-4 ring-soft lg:-left-[calc(3rem+11px)]"
                aria-hidden="true"
              />
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-extrabold tracking-[-0.04em] text-brand lg:text-6xl">Now</span>
                <h3 className="text-2xl font-extrabold text-ink">One home for it all</h3>
              </div>
              <ul className="mt-6 flex flex-wrap gap-3" aria-label="What Enski powers today">
                {today.map((t) => (
                  <li
                    key={t.label}
                    style={{ rotate: `${t.tilt}deg` }}
                    className="rounded-full bg-card px-5 py-2.5 text-[15px] font-extrabold text-brand shadow-card"
                  >
                    {t.label}
                  </li>
                ))}
              </ul>
            </Reveal>
          </ol>
        </div>
      </div>
    </section>
  );
}
