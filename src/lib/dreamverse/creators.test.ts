import { coachProgrammes } from "./coaches";
import { describe, expect, it } from "vitest";

import { CATEGORY_TABS, TYPE_LABELS, ctaFor, filterCatalog, inCollection } from "./catalog";
import {
  BEULAHLAND_CHATGPT,
  BEULAHLAND_COURSES,
  PINNED_TRENDING,
  BEULAHLAND_EBOOKS,
  BEULAHLAND_SLUG,
  BEULAHLAND_COACH,
  BEULAHLAND_COACHING,
  DEMO_PRODUCTS,
  coachDirectory,
  INTERNATIONAL_EDUCATORS,
  NIGERIAN_CREATORS,
  creatorResources,
  creatorDirectory,
  findCreator,
} from "./creators";
import type { Product } from "./types";

const live = (over: Partial<Product>): Product => ({
  id: "p1",
  slug: "p1",
  title: "Live product",
  summary: "",
  type: "course",
  url: "https://staging.tryenski.com/p1",
  thumbnail: null,
  creator: { name: "Facilitator Test", avatar: null, slug: "facilitator-test", region: null },
  skills: [],
  status: "published",
  demo: false,
  price: { currency: "NGN", sign: "₦", amount: 15000, current: 15000, onSale: false },
  prices: [{ currency: "NGN", sign: "₦", amount: 15000, current: 15000, onSale: false }],
  rating: null,
  canAddToCart: true,
  ...over,
});

describe("marketplace categories", () => {
  it("shows the six tabs in the client's order", () => {
    expect(["All", ...CATEGORY_TABS.map((t) => TYPE_LABELS[t].plural)]).toEqual([
      "All",
      "Courses",
      "eBooks",
      "Live sessions",
      "Coaching",
      "Services",
    ]);
  });
});

describe("card calls to action", () => {
  it("uses the client's wording per category", () => {
    expect(ctaFor(live({ type: "course" }))).toBe("View course");
    expect(ctaFor(live({ type: "ebook" }))).toBe("Buy eBook");
    expect(ctaFor(live({ type: "live_training" }))).toBe("Register now");
    expect(ctaFor(live({ type: "coaching" }))).toBe("Book a session");
    expect(ctaFor(live({ type: "gig" }))).toBe("View service");
  });

  it("never offers to buy an unpublished listing", () => {
    expect(ctaFor(BEULAHLAND_EBOOKS[5]!)).toBe("View details");
    expect(ctaFor(BEULAHLAND_COURSES[6]!)).toBe("View details");
  });
});

describe("Beulahland Ignatius storefront", () => {
  it("sits among the 14 Nigerian creators, not first or apart", () => {
    expect(NIGERIAN_CREATORS).toHaveLength(14);
    expect(NIGERIAN_CREATORS.findIndex((c) => c.slug === BEULAHLAND_SLUG)).toBe(4);
    expect(NIGERIAN_CREATORS.every((c) => c.status === "demo" && c.country === "Nigeria")).toBe(true);
  });

  it("sells five of her seven courses; the last two are Coming soon", () => {
    expect(BEULAHLAND_COURSES).toHaveLength(7);
    expect(BEULAHLAND_COURSES.every((c) => c.type === "course" && c.demo)).toBe(true);
    expect(BEULAHLAND_COURSES.map((c) => c.status)).toEqual(["published", "published", "published", "published", "published", "coming_soon", "coming_soon"]);
  });

  it("lists all six eBooks; only the beginner's guide is free and the last two are Coming soon", () => {
    expect(BEULAHLAND_EBOOKS).toHaveLength(6);
    expect(BEULAHLAND_EBOOKS.filter((e) => e.price?.current === 0).map((e) => e.title)).toEqual([
      "The Beginner's Guide to Product Management",
    ]);
    expect(BEULAHLAND_EBOOKS.find((e) => e.title === "Nigerian Soup Cookbook")?.status).toBe("coming_soon");
    expect(BEULAHLAND_EBOOKS.map((e) => e.status)).toEqual(["published", "published", "published", "published", "coming_soon", "coming_soon"]);
  });

  it("opens her profile with all 17 listings (8 courses, 6 eBooks, 3 coaching programmes)", () => {
    expect(findCreator(BEULAHLAND_SLUG, [])?.name).toBe("Beulahland Ignatius");
    expect(creatorResources(BEULAHLAND_SLUG, DEMO_PRODUCTS)).toHaveLength(17);
  });

  it("lists her first among coaches and mentors, featured, booking through her three programmes", () => {
    const enski = { ...BEULAHLAND_COACH, id: "enski-alex", name: "Alex Rivera", featured: false, slug: null };
    const list = coachDirectory([enski]);
    expect(list.map((c) => c.name)).toEqual(["Beulahland Ignatius", "Alex Rivera"]);
    expect(list[0]!.featured).toBe(true);
    const programmes = coachProgrammes(list[0]!, DEMO_PRODUCTS);
    expect(programmes.map((p) => p.id)).toEqual(BEULAHLAND_COACHING.map((p) => p.id));
    expect(programmes.every((p) => p.type === "coaching" && p.status === "published" && p.price)).toBe(true);
  });

  it("never lists her twice among coaches", () => {
    expect(coachDirectory([{ ...BEULAHLAND_COACH, id: "dup" }]).filter((c) => c.name === "Beulahland Ignatius")).toHaveLength(1);
  });

  it("sells How to make money using ChatGPT at ₦5,000, first in Trending this week", () => {
    expect(BEULAHLAND_CHATGPT.title).toBe("How to make money using ChatGPT");
    expect(BEULAHLAND_CHATGPT.creator?.name).toBe("Beulahland Ignatius");
    expect(BEULAHLAND_CHATGPT.status).toBe("published");
    expect(BEULAHLAND_CHATGPT.price).toMatchObject({ currency: "NGN", current: 5000 });
    expect(PINNED_TRENDING[0]).toBe(BEULAHLAND_CHATGPT);
  });
});

describe("international educators", () => {
  it("are marked as not on Dreamverse and have no listings", () => {
    expect(INTERNATIONAL_EDUCATORS.every((e) => e.status === "not_joined")).toBe(true);
    expect(INTERNATIONAL_EDUCATORS.every((e) => creatorResources(e.slug, DEMO_PRODUCTS).length === 0)).toBe(true);
  });
});

describe("Enski creators", () => {
  it("get a profile built from the live catalogue", () => {
    const profile = findCreator("facilitator-test", [live({})]);
    expect(profile?.status).toBe("enski");
  });

  it("includes internal creators before Nigerian previews", () => {
    const directory = creatorDirectory([live({})]);
    expect(directory[0]?.slug).toBe("facilitator-test");
    expect(directory[0]?.status).toBe("enski");
    expect(directory).toHaveLength(15);
  });

  it("shows a live creator once when a Nigerian preview has the same slug", () => {
    const product = live({ creator: { name: "Blossom Affia", slug: "blossom-affia", avatar: null, region: "nigeria" } });
    expect(creatorDirectory([product]).filter((c) => c.slug === "blossom-affia")).toHaveLength(1);
    expect(findCreator("blossom-affia", [product])?.status).toBe("enski");
    expect(creatorDirectory(DEMO_PRODUCTS).some((c) => c.status === "enski")).toBe(false);
  });
});

describe("new filters", () => {
  const free = live({ id: "free", prices: [{ currency: "USD", sign: "$", amount: 0, current: 0, onSale: false }] });
  const paid = live({ id: "paid" });
  const coaching = live({ id: "coach", type: "coaching" });
  const all = [free, paid, coaching, ...DEMO_PRODUCTS];

  it("free shows only free listings, paid only priced ones", () => {
    const freeIds = filterCatalog(all, { access: "free" }).map((p) => p.id);
    expect(freeIds).toContain("free");
    expect(freeIds).not.toContain("paid");
    expect(filterCatalog(all, { access: "paid" }).map((p) => p.id)).toEqual([
      "paid",
      "coach",
      BEULAHLAND_CHATGPT.id,
      ...BEULAHLAND_COURSES.slice(0, 5).map((c) => c.id),
      ...BEULAHLAND_EBOOKS.slice(1, 4).map((e) => e.id),
      ...BEULAHLAND_COACHING.map((c) => c.id),
    ]);
  });

  it("live format keeps live sessions and coaching only", () => {
    expect(filterCatalog(all, { format: "live" }).map((p) => p.id)).toEqual(["coach", ...BEULAHLAND_COACHING.map((c) => c.id)]);
  });

  it("Nigeria keeps only creators who said they're in Nigeria", () => {
    const list = filterCatalog(all, { region: "nigeria" });
    expect(list.length).toBe(17);
    expect(list.every((p) => p.creator?.region === "nigeria")).toBe(true);
  });

  it("most popular puts Enski's trending listings first, in trending order", () => {
    expect(filterCatalog([free, paid, coaching], { sort: "popular" }, ["coach", "paid"]).map((p) => p.id)).toEqual([
      "coach",
      "paid",
      "free",
    ]);
  });
});

describe("skill collections", () => {
  it("matches AI as a whole word, not inside other words", () => {
    expect(inCollection(live({ title: "Build with AI" }), "ai")).toBe(true);
    expect(inCollection(live({ title: "Aim higher" }), "ai")).toBe(false);
  });
});
