import type { Post } from "./types";

export const SITE_NAME = "Enski Blog";

/** Path of an article page. */
export function articlePath(slug: string): string {
  return `/blog/${slug}`;
}

/** Share-sized (1200x630) copy of an article cover, served from /public/og. */
export function shareImagePath(slug: string): string {
  return `/og/${slug}.jpg`;
}

/** Everything a search engine or chat app needs to preview one article. */
export function articleHead(post: Post, origin: string) {
  const url = `${origin}${articlePath(post.slug)}`;
  const image = `${origin}${shareImagePath(post.slug)}`;
  const title = `${post.title} | ${SITE_NAME}`;

  return {
    meta: [
      { title },
      { name: "description", content: post.excerpt },
      { name: "author", content: post.author.name },
      { property: "og:type", content: "article" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.excerpt },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: post.imageAlt },
      { property: "article:published_time", content: post.date },
      { property: "article:author", content: post.author.name },
      { property: "article:section", content: post.category },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: post.title },
      { name: "twitter:description", content: post.excerpt },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: post.imageAlt },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: [image],
          datePublished: post.date,
          author: { "@type": "Person", name: post.author.name },
          publisher: { "@type": "Organization", name: "Enski" },
          mainEntityOfPage: url,
          articleSection: post.category,
        }),
      },
    ],
  };
}
