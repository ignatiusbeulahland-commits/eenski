import { createFileRoute, redirect } from "@tanstack/react-router";

import { enskiTarget } from "@/components/product/share";

// Enski's own coaching links (`/coaching/<creator>/<slug>`) open the same programme here.
export const Route = createFileRoute("/coaching/$creator/$slug")({
  beforeLoad: ({ params }) => {
    const t = enskiTarget("coaching", params.slug);
    throw redirect({ to: t.to, params: { slug: t.slug }, statusCode: 301 });
  },
});
