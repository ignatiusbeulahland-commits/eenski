import { describe, expect, it } from "vitest";
import { mainNav } from "@/components/site/data";
import { existsSync } from "node:fs";
import path from "node:path";
import { featuredPost, filterPosts, getPost, posts } from "@/content/blog";
import { articleHead, shareImagePath } from "@/content/blog/seo";

describe("main navigation", () => {
  it("keeps the live Enski site words, with Home first and Dreamers Diary 4th", () => {
    expect(mainNav.map((n) => n.label)).toEqual([
      "Home",
      "Dreamverse",
      "For Creators",
      "Dreamers Diary",
      "Resources",
      "Become An Ambassador",
    ]);
  });

  it("keeps the For Creators dropdown items", () => {
    expect(mainNav.find((n) => n.label === "For Creators")?.children?.map((c) => c.label)).toEqual([
      "Features",
      "Pricing",
    ]);
  });

  it("keeps the Resources dropdown items", () => {
    expect(mainNav.find((n) => n.label === "Resources")?.children?.map((c) => c.label)).toEqual([
      "Community",
      "Blog",
      "About Us",
      "FAQ",
    ]);
  });
});

describe("blog content", () => {
  it("includes Beulahland Ignatius's fashion design and product management article", () => {
    const post = getPost("fashion-design-is-product-management");
    expect(post?.author.name).toBe("Beulahland Ignatius");
  });

  it("gives every article a unique address", () => {
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length);
  });

  it("finds articles by author name in search", () => {
    expect(filterPosts(posts, undefined, "beulahland").map((p) => p.slug)).toContain(
      "fashion-design-is-product-management",
    );
  });

  it("does not feature a Beulahland Ignatius article", () => {
    expect(featuredPost().author.name).not.toBe("Beulahland Ignatius");
  });

  it("never lists two Beulahland Ignatius articles back to back", () => {
    const authors = posts.map((p) => p.author.name);
    const backToBack = authors.some(
      (a, i) => a === "Beulahland Ignatius" && authors[i + 1] === "Beulahland Ignatius",
    );
    expect(backToBack).toBe(false);
  });

  it("has more than one article written by Beulahland Ignatius", () => {
    expect(posts.filter((p) => p.author.name === "Beulahland Ignatius").length).toBeGreaterThan(1);
  });
});

describe("article share previews", () => {
  const origin = "https://blog.example.com";
  const post = getPost("fashion-design-is-product-management")!;
  const head = articleHead(post, origin);
  const meta = (key: string) =>
    head.meta.find((m) => ("property" in m && m.property === key) || ("name" in m && m.name === key)) as
      | { content: string }
      | undefined;

  it("points the canonical link and og:url at the article itself", () => {
    const url = `${origin}/blog/fashion-design-is-product-management`;
    expect(head.links).toEqual([{ rel: "canonical", href: url }]);
    expect(meta("og:url")?.content).toBe(url);
  });

  it("uses the article's own title, description and cover", () => {
    expect(meta("og:title")?.content).toBe(post.title);
    expect(meta("og:description")?.content).toBe(post.excerpt);
    expect(meta("og:image")?.content).toBe(`${origin}/og/fashion-design-is-product-management.jpg`);
    expect(meta("twitter:image")?.content).toBe(meta("og:image")?.content);
  });

  it("has a share-sized cover image file for every article", () => {
    const missing = posts.filter((p) => !existsSync(path.join("public", shareImagePath(p.slug))));
    expect(missing.map((p) => p.slug)).toEqual([]);
  });
});
