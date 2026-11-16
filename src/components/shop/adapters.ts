import { COVER_PHOTOS } from "@/components/dreamverse/coverPhotos";
import { productSlug, type Product as ShowcaseProduct } from "@/components/site/data";
import { TYPE_LABELS, isMarketCourse, productKey, type CurrencyCode } from "@/lib/dreamverse/catalog";
import { coverFor } from "@/lib/dreamverse/covers";
import type { Money, Product } from "@/lib/dreamverse/types";
import { coursePrice, popularity } from "@/lib/marketplace/filter";
import type { MarketCourse } from "@/lib/marketplace/types";
import { reviewKey } from "@/lib/reviews/reviews";
import type { ShopItem } from "@/lib/shop/types";

/** Creator artwork shown whole; otherwise one of our own subject photos. */
function imageOf(p: Pick<Product, "id" | "title" | "summary" | "skills" | "thumbnail">): ShopItem["image"] {
  const { id, variant } = coverFor(p);
  const photo = COVER_PHOTOS[id][variant] ?? COVER_PHOTOS.general[0]!;
  if (p.thumbnail) return { src: p.thumbnail, fit: "contain", fallback: photo.small };
  return { src: photo.small, srcSet: `${photo.small} 480w, ${photo.src} 800w`, fit: "cover" };
}

const paid = (m: Money | null) => !!m && m.current > 0;

/** Any Dreamverse listing (live Enski resources and labelled demo listings). */
export function fromDreamverse(p: Product, price?: Money | null): ShopItem {
  const shown = price === undefined ? p.price : price;
  const course = isMarketCourse(p);
  return {
    key: course ? `course:${p.slug}` : `dv:${productKey(p)}`,
    route: course ? { kind: "course", slug: p.slug } : { kind: "dreamverse", slug: productKey(p) },
    title: p.title,
    summary: p.summary,
    typeLabel: TYPE_LABELS[p.type].label,
    creator: p.creator ? { name: p.creator.name, slug: p.creator.slug, avatar: p.creator.avatar } : null,
    image: imageOf(p),
    price: shown,
    rating: p.rating && p.rating.count > 0 ? p.rating : null,
    reviewKey: course ? reviewKey("course", p.slug) : reviewKey("dreamverse", p.slug),
    status: p.status,
    canCart: p.status === "published" && paid(shown),
    category: p.skills[0] ?? null,
    demo: p.demo,
    popularity: 0,
    students: null,
    publishedAt: null,
  };
}

/** A live Enski course from the course marketplace. */
export function fromCourse(c: MarketCourse, currency: CurrencyCode): ShopItem {
  const base = fromDreamverse(c.listing, coursePrice(c, currency));
  return {
    ...base,
    key: `course:${c.slug}`,
    route: { kind: "course", slug: c.slug },
    reviewKey: reviewKey("course", c.slug),
    category: c.category,
    popularity: popularity(c),
    students: c.students,
    publishedAt: c.publishedAt,
  };
}

/** Homepage catalogue items (Enski creators' courses and eBooks priced in naira). */
export function fromShowcase(p: ShowcaseProduct): ShopItem {
  const slug = productSlug(p);
  const naira: Money = { currency: "NGN", sign: "₦", amount: p.price, current: p.price, onSale: false };
  return {
    key: `showcase:${slug}`,
    route: { kind: "course", slug },
    title: p.title,
    summary: p.promise,
    typeLabel: p.type === "Ebook" ? "eBook" : "Course",
    creator: { name: p.creator, slug: null, avatar: p.creatorPhoto ?? null },
    image: { src: p.image, fit: "cover" },
    price: naira,
    // The homepage list's star figures were placeholders, so only real reviews from this site are shown.
    rating: null,
    reviewKey: reviewKey("showcase", slug),
    status: "published",
    canCart: p.price > 0,
    category: p.category,
    demo: false,
    popularity: 0,
    students: null,
    publishedAt: null,
  };
}
