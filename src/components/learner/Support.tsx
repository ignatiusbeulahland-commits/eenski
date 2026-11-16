import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/dashboard-ui/button";
import { learnerGuides } from "@/lib/learner/help";
import { LearnerNotFound } from "./shared";
import { GuideArticleLayout, GuideLibrary, NextGuideBody, nextGuideClass } from "@/components/shared/HelpKit";

export function GuidesPage() {
  return (
    <GuideLibrary
      title="Learner guides"
      description="Short tutorials to help you get the most from Enski."
      guides={learnerGuides.map((g) => ({ id: g.id, title: g.title, summary: g.summary, topic: g.category, minutes: g.minutes }))}
      link={(id, className, children) => <Link to="/learner/guides/$guideId" params={{ guideId: id }} className={className}>{children}</Link>}
    />
  );
}

export function GuideDetails({ id }: { id: string }) {
  const g = learnerGuides.find((x) => x.id === id);
  if (!g) return <LearnerNotFound what="guide" />;
  const i = learnerGuides.indexOf(g);
  const next = learnerGuides[(i + 1) % learnerGuides.length];
  return (
    <GuideArticleLayout
      topic={g.category}
      title={g.title}
      summary={g.summary}
      minutes={g.minutes}
      footer={<Button asChild variant="outline"><Link to="/learner/help">Still stuck? Get help</Link></Button>}
      next={next && next.id !== g.id ? <Link to="/learner/guides/$guideId" params={{ guideId: next.id }} className={nextGuideClass}><NextGuideBody title={next.title} /></Link> : undefined}
    >
      {g.steps.map((s, n) => (
        <section key={s.title}>
          <h2 className="text-xl"><span className="mr-2 text-cobalt">{n + 1}.</span>{s.title}</h2>
          <p className="mt-3 text-[15px] leading-7 text-foreground/80">{s.body}</p>
          {s.to && <Link to={s.to} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-cobalt">Open <ArrowRight className="h-3.5 w-3.5" /></Link>}
        </section>
      ))}
    </GuideArticleLayout>
  );
}
