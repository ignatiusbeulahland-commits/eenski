import { createFileRoute, notFound } from "@tanstack/react-router";
import { PromoteFlow, type PromoteStep } from "@/components/affiliate/promote/PromoteFlow";
import { AffiliateError, ResourceNotFound } from "@/components/affiliate/RouteBoundary";
import { products } from "@/lib/affiliate/products";
import { meta } from "@/lib/affiliate/meta";

const STEPS: PromoteStep[] = ["generating", "link", "share", "done"];

export const Route = createFileRoute("/affiliate/promote/$productId")({
  validateSearch: (s: Record<string, unknown>): { step: PromoteStep; renewed?: boolean } => ({
    step: STEPS.includes(s["step"] as PromoteStep) ? (s["step"] as PromoteStep) : "link",
    ...(s["renewed"] === true || s["renewed"] === "1" || s["renewed"] === 1 ? { renewed: true } : {}),
  }),
  loader: ({ params }) => { const product = products.find((p) => p.id === params.productId); if (!product) throw notFound(); return product; },
  head: ({ loaderData }) => meta(loaderData ? `Your link for ${loaderData.title}` : "Product unavailable", "Your personal referral link, ready to copy and share."),
  errorComponent: AffiliateError,
  notFoundComponent: () => <ResourceNotFound kind="Product" />,
  component: PromotePage,
});

function PromotePage() {
  const product = Route.useLoaderData();
  const { step, renewed } = Route.useSearch();
  return <PromoteFlow product={product} step={step} renewed={renewed} />;
}
