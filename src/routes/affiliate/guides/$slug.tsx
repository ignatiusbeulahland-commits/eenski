import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { GuideArticleLayout, GuideSection, NextGuideBody, nextGuideClass } from "@/components/shared/HelpKit";
import { guides } from "@/lib/affiliate/guides";
import { meta } from "@/lib/affiliate/meta";
import { AffiliateError, ResourceNotFound } from "@/components/affiliate/RouteBoundary";

export const Route = createFileRoute("/affiliate/guides/$slug")({
  loader: ({ params }) => {
    const g = guides.find((x) => x.slug === params.slug);
    if (!g) throw notFound();
    return g;
  },
  head: ({ loaderData }) => loaderData ? meta(loaderData.title, loaderData.summary) : { meta: [...meta("Guide unavailable", "This Enski guide could not be found.").meta, { name: "robots", content: "noindex" }] },
  errorComponent: AffiliateError,
  notFoundComponent: () => <ResourceNotFound kind="Guide" />,
  component: Article,
});

function Article() {
  const g = Route.useLoaderData();
  const i = guides.findIndex((x) => x.slug === g.slug);
  const next = guides[(i + 1) % guides.length];
  return (
    <GuideArticleLayout
      topic={g.topic}
      title={g.title}
      summary={g.summary}
      minutes={g.minutes}
      next={next && <Link to="/affiliate/guides/$slug" params={{ slug: next.slug }} className={nextGuideClass}><NextGuideBody title={next.title} /></Link>}
    >
      {g.body.map((sec) => <GuideSection key={sec.h} heading={sec.h} paragraphs={sec.p} />)}
    </GuideArticleLayout>
  );
}
