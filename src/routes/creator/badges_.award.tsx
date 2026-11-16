import { createFileRoute } from "@tanstack/react-router";
import { AwardBadgeFlow, type AwardStart } from "@/components/creator/certificates/AwardFlow";
import { creatorMeta } from "@/lib/creator/meta";

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.slice(0, 200) : undefined);
export const Route = createFileRoute("/creator/badges_/award")({
  validateSearch: (s: Record<string, unknown>): AwardStart => ({ badge: str(s["badge"]), email: str(s["email"]), name: str(s["name"]), course: str(s["course"]), cert: str(s["cert"]) }),
  head: () => creatorMeta("Award a badge", "Choose a learner and a badge, confirm the criteria, add evidence and award it."),
  component: function AwardRoute() {
    const start = Route.useSearch();
    return <AwardBadgeFlow start={start} />;
  },
});
