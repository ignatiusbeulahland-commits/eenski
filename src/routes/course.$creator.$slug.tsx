import { createFileRoute, redirect } from "@tanstack/react-router";

import { enskiTarget } from "@/components/product/share";

// Enski's own course links (`/course/<creator>/<slug>`) open the same course here.
export const Route = createFileRoute("/course/$creator/$slug")({
  beforeLoad: ({ params }) => {
    const t = enskiTarget("course", params.slug);
    throw redirect({ to: t.to, params: { slug: t.slug }, statusCode: 301 });
  },
});
