import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { BadgesPage } from "@/components/creator/certificates/BadgesPage";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/badges")({
  validateSearch: z.object({ tab: z.enum(["library", "badges", "certificates"]).optional() }),
  head: () => creatorMeta("Badges & certificates", "Award achievement badges, issue certificates and manage what you've issued."),
  component: function BadgesRoute() {
    const { tab } = Route.useSearch();
    return <BadgesPage tab={tab ?? "library"} />;
  },
});
