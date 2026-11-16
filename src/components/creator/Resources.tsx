import { Link } from "@tanstack/react-router";
import { Button } from "@/components/dashboard-ui/button";
import { GuideArticleLayout, GuideLibrary, GuideSection, NextGuideBody, nextGuideClass, readMinutes } from "@/components/shared/HelpKit";
import { creatorGuides } from "@/lib/creator/data";

const guideCards = creatorGuides.map((g) => ({ id: g.id, title: g.title, summary: g.summary, topic: g.category, minutes: readMinutes(g.sections.join(" ")) }));

export function CreatorGuides() {
  return (
    <GuideLibrary
      title="Creator guides"
      description="Short, practical reads on launching, selling and getting paid."
      guides={guideCards}
      link={(id, className, children) => <Link to="/creator/guides/$guideId" params={{ guideId: id }} className={className}>{children}</Link>}
    />
  );
}

export function GuideArticle({ guide }: { guide: (typeof creatorGuides)[number] }) {
  const i = creatorGuides.findIndex((g) => g.id === guide.id);
  const next = creatorGuides[(i + 1) % creatorGuides.length];
  return (
    <GuideArticleLayout
      topic={guide.category}
      title={guide.title}
      summary={guide.summary}
      minutes={readMinutes(guide.sections.join(" "))}
      footer={<Button asChild variant="outline"><Link to="/creator/help">Still stuck? Get help</Link></Button>}
      next={next && next.id !== guide.id ? <Link to="/creator/guides/$guideId" params={{ guideId: next.id }} className={nextGuideClass}><NextGuideBody title={next.title} /></Link> : undefined}
    >
      {guide.sections.map((s, n) => <GuideSection key={s} heading={`Step ${n + 1}`} paragraphs={[s]} />)}
    </GuideArticleLayout>
  );
}
