import { createFileRoute, Link } from "@tanstack/react-router";
import { GuideLibrary } from "@/components/shared/HelpKit";
import { guides } from "@/lib/affiliate/guides";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/guides/")({
  head: () => meta("Guides", "Learn how to promote Enski products, track referrals and get paid."),
  component: Guides,
});

const cards = guides.map((g) => ({ id: g.slug, title: g.title, summary: g.summary, topic: g.topic, minutes: g.minutes }));

function Guides() {
  return (
    <GuideLibrary
      title="Affiliate guides"
      description="Short, practical reads on promoting products and getting paid."
      guides={cards}
      link={(id, className, children) => <Link to="/affiliate/guides/$slug" params={{ slug: id }} className={className}>{children}</Link>}
    />
  );
}
