import { describe, expect, it } from "vitest";
import { getPost } from "@/content/blog";
import { posts } from "@/components/site/data";

// Every Resources card on the homepage opens a real blog article.
describe("homepage Resources cards", () => {
  it("each links to an existing article", () => {
    for (const p of posts) expect(getPost(p.slug)?.title).toBe(p.title);
  });
});
