import { createFileRoute, redirect } from "@tanstack/react-router";

import { enskiTarget } from "@/components/product/share";

// Enski's own eBook links (`/ebooks/<creator>/<slug>`) open the same eBook here.
export const Route = createFileRoute("/ebooks/$creator/$slug")({
  beforeLoad: ({ params }) => {
    const t = enskiTarget("ebooks", params.slug);
    throw redirect({ to: t.to, params: { slug: t.slug }, statusCode: 301 });
  },
});
