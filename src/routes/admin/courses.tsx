import { createFileRoute } from "@tanstack/react-router";
import { AdminCourses } from "@/components/admin/Records";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({
    meta: [
      { title: "Courses & products — Enski admin" },
      { name: "description", content: "Products creators made and the live Enski marketplace." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Courses & products — Enski admin" },
      { property: "og:description", content: "Products creators made and the live Enski marketplace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCourses,
});
