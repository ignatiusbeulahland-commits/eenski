import { createFileRoute } from "@tanstack/react-router";
import { ItemEditor } from "@/components/creator/Items";
import { parseCreateStep } from "@/lib/creator/createGuide";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/services_/create")({
  head: () => creatorMeta("Create Service", "Create a new service on Enski."),
  validateSearch: parseCreateStep,
  component: Page,
});
function Page() {
  const { step } = Route.useSearch();
  const navigate = Route.useNavigate();
  return <ItemEditor kind="service" step={step ?? 1} onStep={(n, o) => navigate({ search: n > 1 ? { step: n } : {}, replace: !!o?.replace })} />;
}
