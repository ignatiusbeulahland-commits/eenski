import { createFileRoute } from "@tanstack/react-router";
import { ItemCollection } from "@/components/creator/Items";
import { creatorMeta } from "@/lib/creator/meta";
export const Route = createFileRoute("/creator/courses")({
  head: () => creatorMeta("Courses", "Create and manage your courses on Enski."),
  component: () => <ItemCollection kind="course" />,
});
