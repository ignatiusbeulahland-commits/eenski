import { accountHandle } from "@/lib/dashboard/account";
import linkedin from "@/assets/dashboard/products/linkedin-visibility.webp";
import gigs from "@/assets/dashboard/products/get-gigs.webp";
import creator from "@/assets/dashboard/products/creator-economy.webp";
import canva from "@/assets/dashboard/products/canva-design.webp";
import hired from "@/assets/dashboard/products/personal-brand-jobs.webp";
import react from "@/assets/dashboard/products/react.webp";
import design from "@/assets/dashboard/products/product-design.webp";
import podcast from "@/assets/dashboard/products/podcast.webp";
import freelance from "@/assets/dashboard/products/freelancing.webp";
import vibe from "@/assets/dashboard/products/vibe-coding-course.webp";

export type Category = "Tech" | "Business" | "Career" | "Design" | "Creativity";
export const categories: Category[] = ["Tech", "Business", "Career", "Design", "Creativity"];

/** Demonstration products drawn from the public Enski website catalogue. Commission comes from
 * the product type (`TYPE_RATE`) unless a product carries its own `commissionRate`. */
export type Product = {
  id: string;
  title: string;
  creator: string;
  creatorRole?: string;
  promise: string;
  type: "Course" | "Ebook";
  category: Category;
  price: number;
  image: string;
  imageAlt: string;
  /** This product's own commission (percent, 15–30); overrides the rate for its type. */
  commissionRate?: number;
};

export const products: Product[] = [
  { id: "linkedin-visibility", title: "LinkedIn visibility: get seen, get chosen, get paid", creator: "Blossom Affia", creatorRole: "LinkedIn visibility strategist", promise: "Turn your profile and posts into a magnet for recruiters, clients and paid opportunities, without posting every day.", type: "Course", category: "Career", price: 30000, image: linkedin, imageAlt: "Phone showing the LinkedIn logo on a desk" },
  { id: "get-gigs", title: "How to get gigs: the Sales Doctor's client playbook", creator: "Dr Dann Odotukpono", creatorRole: "The Sales Doctor", promise: "Find, pitch and close paying clients for your skill with proven outreach scripts and follow-ups.", type: "Course", category: "Business", price: 32000, commissionRate: 25, image: gigs, imageAlt: "Two people shaking hands to close a deal" },
  { id: "vibe-coding", title: "Vibe coding: ship a real app in 7 days, no code needed", creator: "Beulahland Ignatius", creatorRole: "UI/UX product manager & AI builder", promise: "Go from idea to a live app you can show employers, clients or customers in one week, building with AI tools.", type: "Course", category: "Tech", price: 35000, image: vibe, imageAlt: "Laptop showing code beside a lime plant pot" },
  { id: "creator-economy", title: "The creator economy: turn what you know into income", creator: "Salem King", creatorRole: "The creator's creator", promise: "Package your knowledge into products people pay for, and build the audience that keeps buying.", type: "Course", category: "Creativity", price: 35000, image: creator, imageAlt: "Camera and microphone set up for filming" },
  { id: "canva-design", title: "Canva design that sells", creator: "Jasmine Gathoga", creatorRole: "The Canva Girl", promise: "Design scroll-stopping posts, brand kits and sales pages in Canva, even if you've never designed before.", type: "Course", category: "Design", price: 20000, commissionRate: 25, image: canva, imageAlt: "Tablet and stylus ready for design work" },
  { id: "storytelling-hired", title: "Storytelling that gets you hired", creator: "Precious Obo", creatorRole: "Storytelling & personal brand coach", promise: "Rewrite your CV, profile and interview answers as stories that make employers say yes.", type: "Ebook", category: "Career", price: 8000, image: hired, imageAlt: "Clipboard with a résumé checklist" },
  { id: "react-patterns", title: "Advanced React patterns & architecture", creator: "Tunde Bakare", promise: "Write React apps that stay fast and clean as they grow, the way senior engineers do.", type: "Course", category: "Tech", price: 45000, commissionRate: 15, image: react, imageAlt: "Laptop screen full of code" },
  { id: "figma-design", title: "Product design with Figma, from zero", creator: "Ada Nwosu", promise: "Design your first three portfolio-ready app screens and learn the workflow studios hire for.", type: "Course", category: "Design", price: 38000, image: design, imageAlt: "Hands typing on a laptop" },
  { id: "podcast", title: "Start a podcast people actually finish", creator: "Seun Akande", promise: "Plan, record and launch a show listeners stay for, with gear you can afford.", type: "Course", category: "Creativity", price: 25000, image: podcast, imageAlt: "Podcaster at his microphone" },
  { id: "freelancing", title: "Freelancing: land your first five clients", creator: "Zainab Musa", promise: "Set your rates, build a simple offer and win your first five paying clients.", type: "Ebook", category: "Business", price: 7500, commissionRate: 25, image: freelance, imageAlt: "Woman working on her laptop" },
];

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

/** Standard commission per product type, in percent. */
export const TYPE_RATE: Record<Product["type"], number> = { Course: 20, Ebook: 30 };
export const RATE_MIN = 15;
export const RATE_MAX = 30;

/** The commission an affiliate earns on this product: its own rate, else its type's, kept within 15–30%. */
export function rateFor(p: Pick<Product, "type" | "commissionRate">): number {
  const r = p.commissionRate ?? TYPE_RATE[p.type];
  return Math.min(RATE_MAX, Math.max(RATE_MIN, r));
}
/** Where the rate comes from, for the small label under it. */
export const rateSource = (p: Pick<Product, "type" | "commissionRate">) =>
  p.commissionRate != null ? "Set for this product" : `Standard ${p.type === "Ebook" ? "eBook" : "course"} rate`;
/** Estimated commission on one qualifying sale at the full price, rounded to the naira. An estimate, never an earning. */
export const estCommission = (p: Pick<Product, "type" | "commissionRate" | "price">) => Math.round((p.price * rateFor(p)) / 100);
/** Highest rate in the catalogue, for "up to" copy. */
export const topRate = () => Math.max(...products.map(rateFor));

/**
 * The affiliate's referral link for a product. The same affiliate and product always get the same
 * link; it only changes when they choose to regenerate it (version 2, 3…).
 */
export const referralLink = (id: string, handle = accountHandle(), version = 1) =>
  `https://tryenski.com/r/${handle}-${id}${version > 1 ? `-${version}` : ""}`;

/** Short, stable tracking ID shown with the link (same inputs → same ID). */
export function trackingId(id: string, handle = accountHandle(), version = 1): string {
  let h = 2166136261;
  for (const ch of `${handle}|${id}|${version}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const code = h.toString(36).toUpperCase().padStart(7, "0").slice(-7);
  return `ENK-${code.slice(0, 3)}-${code.slice(3)}`;
}
