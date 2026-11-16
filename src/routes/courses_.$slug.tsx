import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";

import { CourseDetailsPage } from "@/components/courses/CourseDetailsPage";
import { ShowcaseCourse } from "@/components/courses/ShowcaseCourse";
import { PageSkeleton } from "@/components/site/PageSkeleton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { findProductBySlug } from "@/components/site/data";
import { courseQueryOptions } from "@/lib/marketplace/data";
import { courseImage, courseJsonLd, courseUrl } from "@/lib/marketplace/seo";

export const Route = createFileRoute("/courses_/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(courseQueryOptions(params.slug));
    if (data.course) {
      const c = data.course;
      return {
        kind: "live" as const,
        title: `${c.listing.title}${c.listing.creator ? ` — course by ${c.listing.creator.name}` : ""}`,
        description: c.listing.summary || c.description.slice(0, 160),
        image: courseImage(c),
        jsonLd: JSON.stringify(courseJsonLd(c)),
      };
    }
    // Homepage courses that aren't on sale on Enski yet keep their preview page.
    const showcase = findProductBySlug(params.slug);
    if (showcase) {
      return {
        kind: "showcase" as const,
        title: `${showcase.title} — ${showcase.type.toLowerCase()} by ${showcase.creator}`,
        description: showcase.promise,
        image: null,
        jsonLd: null,
      };
    }
    if (data.error) throw new Error(data.error);
    throw notFound();
  },
  head: ({ params, loaderData }) => {
    const url = courseUrl(params.slug);
    if (!loaderData) {
      return {
        meta: [
          { title: "Course unavailable | Enski" },
          { name: "description", content: "This course isn't listed on Enski right now." },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: `${loaderData.title} | Enski` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "Enski" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: loaderData.title },
        { name: "twitter:description", content: loaderData.description },
        ...(loaderData.image
          ? [
              { property: "og:image", content: loaderData.image },
              { name: "twitter:image", content: loaderData.image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: loaderData.jsonLd ? [{ type: "application/ld+json", children: loaderData.jsonLd }] : [],
    };
  },
  pendingComponent: () => <PageSkeleton variant="profile" />,
  component: CoursePage,
  errorComponent: CourseError,
  notFoundComponent: CourseNotFound,
});

function CoursePage() {
  const { slug } = Route.useParams();
  const { kind } = Route.useLoaderData();
  return kind === "live" ? <LiveCourse slug={slug} /> : <ShowcaseCourse slug={slug} />;
}

function LiveCourse({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(courseQueryOptions(slug));
  if (!data.course) return <CourseNotFound />;
  return <CourseDetailsPage data={data} />;
}

function CourseError() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader solid />
      <main className="mx-auto grid min-h-[60vh] max-w-[1200px] place-items-center px-5 py-28 text-center">
        <div>
          <h1 className="text-h2 text-ink">This course didn't load</h1>
          <p className="mt-2 text-muted-foreground">Check your connection, then try again.</p>
          <Button className="mt-6" onClick={() => void router.invalidate()}>Try again</Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function CourseNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader solid />
      <main className="mx-auto grid min-h-[60vh] max-w-[1200px] place-items-center px-5 py-28 text-center">
        <div>
          <h1 className="text-h2 text-ink">We couldn't find that course</h1>
          <p className="mt-2 text-muted-foreground">It may not be published yet, or the link is out of date.</p>
          <Button asChild className="mt-6">
            <Link to="/courses">See all courses</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
