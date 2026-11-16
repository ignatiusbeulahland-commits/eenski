import { createFileRoute } from "@tanstack/react-router";
import { BadgeAwardResult } from "@/components/creator/certificates/AwardFlow";
import { creatorMeta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/badges_/awards/$awardId")({
  head: () => creatorMeta("Badge awarded", "The badge you awarded, with its ID and verification link."),
  component: function AwardResultRoute() {
    const { awardId } = Route.useParams();
    return <BadgeAwardResult id={awardId} />;
  },
});
