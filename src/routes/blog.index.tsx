import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, PenLine, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AuthorAvatar } from "@/components/blog/AuthorAvatar";
import { PostCard } from "@/components/blog/PostCard";
import { Newsletter } from "@/components/site/Newsletter";
import { Reveal, RiseWords } from "@/components/site/motion";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  categories,
  featuredPost,
  filterPosts,
  formatDate,
  posts,
  type Category,
} from "@/content/blog";
import { cn } from "@/lib/utils";

type BlogSearch = { category?: Category | undefined; q?: string | undefined };

export const Route = createFileRoute("/blog/")({
  validateSearch: (s: Record<string, unknown>): BlogSearch => {
    const category = s["category"];
    const q = s["q"];
    return {
      category: categories.includes(category as Category) ? (category as Category) : undefined,
      q: typeof q === "string" && q.trim() ? q.slice(0, 80) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Articles: insights, guides and stories | Enski Blog" },
      {
        name: "description",
        content:
          "Career guides, creator playbooks and learning tips from the Enski community, for African dreamers building their future.",
      },
      { property: "og:title", content: "Enski Blog: insights, guides and stories" },
      {
        property: "og:description",
        content: "Career guides, creator playbooks and learning tips from the Enski community.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { category, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/blog/" });
  const [query, setQuery] = useState(q ?? "");
  const featured = featuredPost();
  const filtering = Boolean(category || q);
  const list = filterPosts(
    filtering ? posts : posts.filter((p) => p.slug !== featured.slug),
    category,
    q,
  );

  useEffect(() => setQuery(q ?? ""), [q]);

  // Search updates the address as you type (lightly debounced) so results are shareable.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = query.trim() || undefined;
      if (next !== q) navigate({ search: (s) => ({ ...s, q: next }), replace: true, resetScroll: false });
    }, 250);
    return () => window.clearTimeout(t);
  }, [query, q, navigate]);

  const setCategory = (c?: Category) =>
    navigate({ search: (s) => ({ ...s, category: c }), resetScroll: false });

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-cobalt-light pb-28 pt-32 md:pb-36 md:pt-40">
          <div className="bg-dots absolute inset-0" aria-hidden />
          <div
            aria-hidden
            className="parallax-y absolute -right-24 top-16 aspect-square w-[340px] rounded-full bg-sky-light-glow opacity-40 blur-2xl md:w-[460px]"
          />
          <div className="relative mx-auto max-w-[1200px] px-5">
            <p className="eyebrow text-lime">Articles</p>
            <h1 className="text-display mt-4 max-w-3xl text-primary-foreground">
              <RiseWords text="Ideas that move" /> <span className="text-lime"><RiseWords text="dreamers forward." start={3} popLast /></span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-on-blue">
              Insights, guides, and stories from the Enski community. Learn faster, build smarter
              and grow what you know.
            </p>

            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-background p-1.5 pl-5 shadow-float"
            >
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <label htmlFor="blog-search" className="sr-only">
                Search articles
              </label>
              <input
                id="blog-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, topics or authors"
                maxLength={80}
                className="h-11 min-w-0 flex-1 bg-transparent text-[16px] font-semibold text-ink placeholder:text-muted-foreground focus:outline-none"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="size-10 rounded-full"
                >
                  <X />
                </Button>
              )}
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild variant="lime" size="lg">
                <Link to="/blog/write">
                  <PenLine aria-hidden /> Write an article
                </Link>
              </Button>
              <span className="text-sm font-semibold text-on-blue">Become a blogger. Every article is reviewed by our editors.</span>
            </div>
          </div>
        </section>

        {/* Featured */}
        {!filtering && (
          <section className="relative -mt-16 md:-mt-20" aria-labelledby="featured-title">
            <div className="mx-auto max-w-[1200px] px-5">
              <Reveal>
                <Link
                  to="/blog/$slug"
                  params={{ slug: featured.slug }}
                  className="group grid overflow-hidden rounded-[32px] border border-line bg-card shadow-float lg:grid-cols-[1.15fr_1fr]"
                >
                  <div className="relative aspect-[3/2] overflow-hidden bg-ice lg:aspect-auto lg:min-h-[440px]">
                    <img
                      src={featured.image}
                      alt={featured.imageAlt}
                      width={1536}
                      height={1024}
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-5 top-5 rounded-full bg-lime px-3.5 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.12em] text-midnight">
                      Featured
                    </span>
                  </div>
                  <div className="flex flex-col justify-center p-6 md:p-10">
                    <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-muted-foreground">
                      <span className="rounded-md bg-ice px-2 py-0.5 font-bold text-brand">
                        {featured.category}
                      </span>
                      <span>{formatDate(featured.date)}</span>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden /> {featured.readMinutes} min read
                      </span>
                    </div>
                    <h2
                      id="featured-title"
                      className="mt-4 text-[1.7rem] font-extrabold leading-tight text-ink group-hover:text-brand md:text-[2.2rem]"
                    >
                      {featured.title}
                    </h2>
                    <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
                      {featured.excerpt}
                    </p>
                    <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <AuthorAvatar name={featured.author.name} photo={featured.author.photo} className="size-11" />
                        <span>
                          <span className="block font-bold text-ink">{featured.author.name}</span>
                          <span className="block text-[13px] text-muted-foreground">
                            {featured.author.role}
                          </span>
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-2 font-extrabold text-brand">
                        Read article
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            </div>
          </section>
        )}

        {/* All articles */}
        <section
          className={cn("bg-background pb-20", filtering ? "pt-12" : "pt-16 lg:pt-20")}
          aria-labelledby="all-title"
        >
          <div className="mx-auto max-w-[1200px] px-5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="eyebrow text-sky-text">{filtering ? "Results" : "Latest"}</p>
                <h2 id="all-title" className="text-h2 mt-3 text-ink">
                  {filtering ? (
                    <>
                      {list.length} {list.length === 1 ? "article" : "articles"}
                      {category && <span className="text-brand"> in {category}</span>}
                    </>
                  ) : (
                    <>
                      Fresh from the <span className="text-brand">community.</span>
                    </>
                  )}
                </h2>
              </div>

              <div
                role="group"
                aria-label="Filter by topic"
                className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0"
              >
                {[undefined, ...categories].map((c) => {
                  const active = category === c;
                  return (
                    <button
                      key={c ?? "all"}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "h-10 shrink-0 rounded-full border px-4 text-sm font-bold transition-colors",
                        active
                          ? "border-cobalt bg-cobalt text-primary-foreground"
                          : "border-line bg-card text-ink hover:border-brand hover:text-brand",
                      )}
                    >
                      {c ?? "All topics"}
                    </button>
                  );
                })}
              </div>
            </div>

            {list.length > 0 ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p, i) => (
                  <Reveal key={p.slug} delay={(i % 3) * 80} className="h-full">
                    <PostCard post={p} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-3xl border border-dashed border-line bg-soft px-6 py-14 text-center">
                <p className="text-lg font-extrabold text-ink">No articles match that yet.</p>
                <p className="mt-2 text-muted-foreground">Try another word or browse all topics.</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setQuery("");
                    navigate({ search: {} });
                  }}
                >
                  Show all articles
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="bg-background pb-20" aria-labelledby="write-cta-title">
          <div className="mx-auto max-w-[1200px] px-5">
            <Reveal>
              <div className="relative overflow-hidden rounded-[32px] bg-cobalt px-6 py-10 md:px-12 md:py-14">
                <div className="bg-dots absolute inset-0 opacity-60" aria-hidden />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl">
                    <p className="eyebrow text-lime">Become a blogger</p>
                    <h2 id="write-cta-title" className="text-h2 mt-3 text-primary-foreground">
                      Got a story, guide or lesson to share?
                    </h2>
                    <p className="mt-3 text-[17px] leading-relaxed text-on-blue">
                      Send us your article with a cover image and your socials. Our editors review every piece and
                      reply within 5 working days.
                    </p>
                  </div>
                  <Button asChild variant="lime" size="lg" className="shrink-0">
                    <Link to="/blog/write">
                      Write an article <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Newsletter source="blog" />
      </main>

      <SiteFooter />
    </div>
  );
}
