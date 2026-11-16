import { createFileRoute, notFound } from "@tanstack/react-router";
import { PromoteDetails } from "@/components/affiliate/promote/PromoteDetails";
import { AffiliateError, ResourceNotFound } from "@/components/affiliate/RouteBoundary";
import { products } from "@/lib/affiliate/products";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/market_/$productId")({
  loader: ({ params }) => { const product = products.find((p) => p.id === params.productId); if (!product) throw notFound(); return product; },
  head: ({ loaderData }) => meta(loaderData ? `Promote ${loaderData.title}` : "Product unavailable", loaderData?.promise ?? "This Enski product could not be found."),
  errorComponent: AffiliateError,
  notFoundComponent: () => <ResourceNotFound kind="Product" />,
  component: ProductPage,
});
function ProductPage() { return <PromoteDetails product={Route.useLoaderData()} />; }
