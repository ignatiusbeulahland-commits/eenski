import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, CheckCircle2, Clock, Link2 } from "lucide-react";
import { SiWhatsapp, SiX } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { AuthorAvatar } from "@/components/blog/AuthorAvatar";
import { PostCard } from "@/components/blog/PostCard";
import { Newsletter } from "@/components/site/Newsletter";
import { Reveal } from "@/components/site/motion";
import { PageSkeleton } from "@/components/site/PageSkeleton";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { links } from "@/components/site/data";
import { Button } from "@/components/ui/button";
import { formatDate, getPost, relatedPosts, slugify, type Post } from "@/content/blog";
import { articleHead } from "@/content/blog/seo";
import { SITE_ORIGIN } from "@/lib/marketplace/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { post, origin: SITE_ORIGIN };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {
        meta: [
          { title: "Article not found | Enski Blog" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return articleHead(loaderData.post, loaderData.origin);
  },
  notFoundComponent: ArticleNotFound,
  pendingComponent: () => <PageSkeleton variant="article" />,
  component: ArticlePage,
});

function ReadingProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-(--z-skip) h-1">
      <div className="h-full origin-left bg-lime" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function ShareRow({ post }: { post: Post }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.href), []);
  const text = encodeURIComponent(post.title);
  const u = encodeURIComponent(url);
  const items = [
    { label: "Share on X", href: `https://twitter.com/intent/tweet?text=${text}&url=${u}`, Icon: SiX },
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: FaLinkedinIn },
    { label: "Share on WhatsApp", href: `https://wa.me/?text=${text}%20${u}`, Icon: SiWhatsapp },
  ];
  return (
    <div className="flex items-center gap-2">
      {items.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="grid size-10 place-items-center rounded-full border border-line bg-card text-brand transition-colors hover:border-brand hover:bg-ice"
        >
          <Icon className="size-4" />
        </a>
      ))}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard blocked */
          }
        }}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Link copied" : "Copy link"}
        className="grid size-10 place-items-center rounded-full border border-line bg-card text-brand transition-colors hover:border-brand hover:bg-ice"
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}

function ArticlePage() {
  const { post } = Route.useLoaderData();
  const headings = post.body.filter((b) => b.type === "h2").map((b) => b.text);
  const ids = headings.map(slugify);
  const active = useActiveHeading(ids);
  const related = relatedPosts(post);

  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <ReadingProgress />
      <SiteHeader />

      <main>
        <article>
          {/* Header band */}
          <header className="relative overflow-hidden bg-cobalt-light pb-40 pt-32 md:pb-56 md:pt-40">
            <div className="bg-dots absolute inset-0" aria-hidden />
            <div className="relative mx-auto max-w-[900px] px-5 text-center">
              <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-2 text-sm font-semibold text-on-blue">
                <Link to="/blog" className="hover:text-lime">
                  Blog
                </Link>
                <span aria-hidden>/</span>
                <Link to="/blog" search={{ category: post.category }} className="hover:text-lime">
                  {post.category}
                </Link>
              </nav>
              <h1 className="mt-5 text-[2.1rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-primary-foreground md:text-[3.25rem]">
                {post.title}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-on-blue">{post.excerpt}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-3 text-left">
                  <AuthorAvatar name={post.author.name} photo={post.author.photo} className="size-11" />
                  <span>
                    <span className="block font-bold text-primary-foreground">{post.author.name}</span>
                    <span className="block text-[13px] text-on-blue">{post.author.role}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-on-blue">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-4" aria-hidden /> {post.readMinutes} min read
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Cover */}
          <div className="relative mx-auto -mt-28 max-w-[1100px] px-5 md:-mt-44">
            <img
              src={post.image}
              alt={post.imageAlt}
              width={1536}
              height={1024}
              className="aspect-[16/9] w-full rounded-[28px] border border-line object-cover shadow-float md:rounded-[36px]"
            />
          </div>

          {/* Body */}
          <div className="mx-auto mt-12 grid max-w-[1100px] gap-10 px-5 md:mt-16 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="eyebrow text-sky-text">On this page</p>
                <ol className="mt-4 space-y-1 border-l border-line">
                  {headings.map((h, i) => (
                    <li key={ids[i]}>
                      <a
                        href={`#${ids[i]}`}
                        className={cn(
                          "-ml-px block border-l-2 py-1.5 pl-4 text-[14px] font-semibold leading-snug transition-colors",
                          active === ids[i]
                            ? "border-brand text-brand"
                            : "border-transparent text-muted-foreground hover:text-ink",
                        )}
                      >
                        {h}
                      </a>
                    </li>
                  ))}
                </ol>
                <div className="mt-8">
                  <p className="eyebrow text-sky-text">Share</p>
                  <div className="mt-3">
                    <ShareRow post={post} />
                  </div>
                </div>
              </div>
            </aside>

            <div className="min-w-0 max-w-[720px]">
              <section
                aria-labelledby="takeaways"
                className="rounded-3xl border border-line bg-soft p-6 md:p-8"
              >
                <h2 id="takeaways" className="eyebrow text-brand">
                  Key takeaways
                </h2>
                <ul className="mt-4 space-y-3">
                  {post.takeaways.map((t) => (
                    <li key={t} className="flex gap-3 text-[16px] font-semibold leading-relaxed text-ink">
                      <CheckCircle2 className="mt-1 size-5 shrink-0 text-sky" aria-hidden />
                      {t}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-10">
                <ArticleBody blocks={post.body} />
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 lg:hidden">
                <p className="font-bold text-ink">Share this article</p>
                <ShareRow post={post} />
              </div>

              {/* Author */}
              <section className="mt-12 flex flex-col gap-5 rounded-3xl bg-cobalt-light p-6 sm:flex-row sm:items-center md:p-8">
                <AuthorAvatar name={post.author.name} photo={post.author.photo} className="size-16 text-lg" />
                <div className="flex-1">
                  <p className="eyebrow text-lime">Written by</p>
                  <p className="mt-1 text-xl font-extrabold text-primary-foreground">{post.author.name}</p>
                  <p className="text-on-blue">{post.author.role}</p>
                </div>
                <Button asChild variant="lime">
                  <a href={links.register}>Join Enski free</a>
                </Button>
              </section>
            </div>
          </div>
        </article>

        {/* Related */}
        <section className="pb-16 pt-20 lg:pt-24" aria-labelledby="related-title">
          <div className="mx-auto max-w-[1200px] px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-sky-text">Keep reading</p>
                <h2 id="related-title" className="text-h2 mt-3 text-ink">
                  More from the <span className="text-brand">blog.</span>
                </h2>
              </div>
              <Button asChild variant="link" className="h-auto self-start sm:self-end">
                <Link to="/blog">
                  <ArrowLeft /> All articles
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80} className="h-full">
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <Newsletter source="blog-article" />
      </main>

      <SiteFooter />
    </div>
  );
}

function ArticleNotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-cobalt-light pb-24 pt-40 text-center">
        <div className="mx-auto max-w-xl px-5">
          <p className="eyebrow text-lime">404</p>
          <h1 className="text-h2 mt-4 text-primary-foreground">We couldn't find that article.</h1>
          <p className="mt-4 text-on-blue">It may have moved. Browse the latest articles instead.</p>
          <Button asChild variant="lime" className="mt-8">
            <Link to="/blog">Back to the blog</Link>
          </Button>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
