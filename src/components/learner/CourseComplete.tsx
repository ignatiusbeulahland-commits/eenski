import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, BookOpen, CircleHelp, Compass, Star } from "lucide-react";
import { useEffect } from "react";
import { OutcomeScreen, outcomeButton } from "@/components/shared/outcome";
import { VictoryCurtain } from "@/components/assistant/VictoryCurtain";
import { ShopLink } from "@/components/shop/ShopLink";
import { findResource, resources, unitWord } from "@/lib/learner/catalog";
import { courseOutline, totalLength } from "@/lib/learner/learning";
import { ownedResourceIds, printedName, resourceProgress } from "@/lib/learner/rules";
import { certContent } from "./Achievements";
import { useLearner } from "@/lib/learner/store";
import { LearnerNotFound, shortDate } from "./shared";

/** Shown once every lesson (and any required quiz) is done: the summary, the certificate if there is one, and what to learn next. */
export function CourseComplete({ id }: { id: string }) {
  const { state, ready, update } = useLearner();
  const r = findResource(id);
  const cert = state.certificates.find((c) => c.resourceId === id);
  // This screen is the celebration, so the pop-up doesn't repeat it.
  useEffect(() => {
    if (cert && !state.celebrated.includes(`cert:${cert.id}`)) update((s) => ({ celebrated: [...s.celebrated, `cert:${cert.id}`] }));
  }, [cert?.id]);
  if (!ready) return <div className="mx-auto mt-10 h-96 max-w-xl animate-pulse rounded-[28px] bg-soft" />;
  if (!r) return <LearnerNotFound what="resource" />;
  const p = resourceProgress(state, id);
  const word = unitWord(r.type);
  const quiz = state.quizzes?.[id];
  if (p.lessonsDone && p.quizPending) {
    return (
      <OutcomeScreen
        tone="info"
        eyebrow="One step left"
        title="Pass the final quiz"
        message={`Every ${word} of ${r.title} is done. Score ${r.quiz!.passMark}% or more on the final quiz to complete the course${r.certificate ? " and receive your certificate" : ""}.`}
        details={quiz ? [{ label: "Best score so far", value: `${quiz.best}%` }, { label: "Attempts", value: String(quiz.attempts) }] : []}
        actions={<Link to="/learner/resources/$resourceId" params={{ resourceId: id }} search={{ view: "quiz" }} className={outcomeButton.primary}><CircleHelp aria-hidden="true" /> {quiz ? "Try the quiz again" : "Take the final quiz"}</Link>}
        moreActions={<Link to="/learner/resources/$resourceId" params={{ resourceId: id }} search={{}} className="font-bold text-brand hover:underline">Review the lessons</Link>}
      />
    );
  }
  if (!p.complete) {
    const left = p.total - p.done;
    return (
      <OutcomeScreen
        tone="info"
        eyebrow="Keep going"
        title={`${left} ${word}${left === 1 ? "" : "s"} to go`}
        message={`You're ${p.pct}% through ${r.title}. Finish the rest and your completion will be waiting here.`}
        actions={<Link to="/learner/resources/$resourceId" params={{ resourceId: id }} search={{}} className={outcomeButton.primary}><BookOpen aria-hidden="true" /> Continue learning</Link>}
      />
    );
  }
  const finishedAt = state.progress[id]?.lastAccessed;
  const modules = courseOutline(r).filter((m) => m.title).length;
  const name = state.profile.displayName || state.profile.fullName.split(" ")[0] || "";
  const learner = cert ? printedName(cert, state.profile) : state.profile.certificateName || state.profile.fullName;
  // What to do next: unfinished things they already own first, then something new in the same area.
  const owned = ownedResourceIds(state).filter((x) => x !== id);
  const unfinished = owned.map((x) => findResource(x)).filter((x): x is NonNullable<typeof x> => Boolean(x) && !resourceProgress(state, x!.id).complete);
  const fresh = resources.filter((x) => x.id !== id && !owned.includes(x.id) && x.category === r.category);
  const next = [...unfinished.map((x) => ({ r: x, owned: true })), ...fresh.map((x) => ({ r: x, owned: false }))].slice(0, 2);
  return (
    <div className="course-complete relative">
      <span className="complete-glow" aria-hidden="true" />
      <OutcomeScreen
        tone="success"
        emblem={<VictoryCurtain eyebrow={r.type === "Course" ? "Course complete" : `${r.type} complete`} title={r.title} />}
        eyebrow={r.type === "Course" ? "Course complete" : "All done"}
        title={name ? `Congratulations, ${name}!` : r.type === "Course" ? "You finished the course!" : `You finished ${r.title}`}
        message={
          cert
            ? `You finished ${r.title}. ${r.creator} has issued your certificate of completion, and it's ready to download and share.`
            : `You finished ${r.title}. It stays in your library whenever you want a refresher.`
        }
        detailsTitle="Your summary"
        details={[
          { label: r.type === "Course" ? "Course" : "Resource", value: r.title, strong: true },
          { label: "By", value: r.creator },
          ...(learner ? [{ label: "Learner", value: learner }] : []),
          { label: "Completed", value: `${p.total} of ${p.total} ${word}s${modules > 1 ? ` in ${modules} modules` : ""}` },
          { label: "Learning time", value: totalLength(r.units) },
          ...(r.quiz?.questions.length && quiz ? [{ label: "Final quiz", value: `${quiz.passedAt ? "Passed" : "Taken"} · best ${quiz.best}%` }] : []),
          ...(finishedAt ? [{ label: "Finished on", value: shortDate(finishedAt) }] : []),
          ...(cert ? [{ label: "Certificate ID", value: certContent(cert, printedName(cert, state.profile)).code, mono: true, copy: certContent(cert, printedName(cert, state.profile)).code }] : []),
        ]}
        actions={
          <>
            {cert ? (
              <Link to="/learner/certificates/$certificateId" params={{ certificateId: cert.id }} className={outcomeButton.primary}><Award aria-hidden="true" /> View your certificate</Link>
            ) : (
              <Link to="/learner/resources" search={{ view: "discover" }} className={outcomeButton.primary}><Compass aria-hidden="true" /> Find what's next</Link>
            )}
            <Link to="/learner/resources" search={{}} className={outcomeButton.secondary}>Back to my library</Link>
          </>
        }
        moreActions={
          r.publicRoute ? (
            <ShopLink route={r.publicRoute} className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline"><Star className="size-4" aria-hidden="true" /> Rate this {r.type === "Course" ? "course" : "resource"}</ShopLink>
          ) : (
            <Link to="/learner/dashboard" className="font-bold text-brand hover:underline">Go to dashboard</Link>
          )
        }
      >
        {next.length > 0 && (
          <section aria-labelledby="next-title" className="outcome-receipt mt-6 text-left">
            <h2 id="next-title" className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Keep learning</h2>
            <ul className="mt-2 grid gap-2">
              {next.map(({ r: x, owned: mine }) => {
                const xp = resourceProgress(state, x.id);
                return (
                  <li key={x.id}>
                    <Link to="/learner/resources/$resourceId" params={{ resourceId: x.id }} search={{}} className="group flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 pr-4 transition-colors hover:border-sky">
                      <img src={x.image} alt="" width={56} height={56} loading="lazy" className="size-14 shrink-0 rounded-xl object-cover" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">{x.title}</span>
                        <span className="block text-xs text-muted-foreground">{mine ? (xp.done ? `Continue · ${xp.pct}% done` : "In your library · not started") : `${x.type} · by ${x.creator}`}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </OutcomeScreen>
    </div>
  );
}
