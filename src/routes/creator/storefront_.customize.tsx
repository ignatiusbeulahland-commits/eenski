import { createFileRoute } from "@tanstack/react-router";
import { StoreCustomizePage } from "@/components/creator/StoreCustomize";
import { creatorMeta } from "@/lib/creator/meta";

export const Route = createFileRoute("/creator/storefront_/customize")({
  head: () => creatorMeta("Customise your page", "Design your public creator page and preview it on phone and desktop."),
  component: () => <StoreCustomizePage />,
});
