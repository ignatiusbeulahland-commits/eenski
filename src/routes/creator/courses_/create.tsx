import { createFileRoute } from "@tanstack/react-router";
import { ItemEditor } from "@/components/creator/Items";
import { parseCreateStep } from "@/lib/creator/createGuide";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/courses_/create")({
  head: () => creatorMeta("Create Course", "Create a new course on Enski."),
  validateSearch: parseCreateStep,
  component: Page,
});
function Page() {
  const { step } = Route.useSearch();
  const navigate = Route.useNavigate();
  return <ItemEditor kind="course" step={step ?? 1} onStep={(n, o) => navigate({ search: n > 1 ? { step: n } : {}, replace: !!o?.replace })} />;
}
