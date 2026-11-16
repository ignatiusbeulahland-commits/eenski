// Plain DTOs describing Dreamverse marketplace data as read from Enski.

export type ResourceType = "course" | "ebook" | "live_training" | "coaching" | "gig" | "digital_product";

export interface Money {
  currency: string;
  sign: string;
  /** Listed (original) price. */
  amount: number;
  /** Price the learner actually pays on the product page. */
  current: number;
  /** True when `current` is lower than `amount`. */
  onSale: boolean;
}

/** Where a listing is in its life: only `published` listings can be bought or booked. */
export type PublicationStatus = "published" | "draft" | "coming_soon";

/** Where a creator is based, when they've said so. */
export type CreatorRegion = "nigeria" | "international";

export interface Product {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: ResourceType;
  /** Product page on Enski (cart, wishlist and checkout live there); demo listings point at their creator's profile. */
  url: string;
  thumbnail: string | null;
  creator: { name: string; avatar: string | null; slug: string; region: CreatorRegion | null } | null;
  /** Skills the listing teaches (Enski's skill set, or the creator's own tags). */
  skills: string[];
  status: PublicationStatus;
  /** Sample listing from the demonstration catalogue — not something on sale on Enski. */
  demo: boolean;
  /** Default price shown outside the marketplace (see `pickPrice`). */
  price: Money | null;
  /** Every currency the creator priced this resource in. Never converted. */
  prices: Money[];
  rating: { average: number; count: number } | null;
  canAddToCart: boolean;
}

export interface Coach {
  id: string;
  name: string;
  avatar: string | null;
  /** Transparent cut-out photo for the featured spotlight. */
  cutout?: string | null;
  headline?: string | null;
  bio: string | null;
  /** On-site creator profile, when there is one. */
  slug?: string | null;
  /** What they coach on, shown as chips. */
  topics?: string[];
  /** Shown in the spotlight above the list when no filters are on. */
  featured?: boolean;
  url: string;
  sessionCount: number;
  expertise: string | null;
  session: {
    title: string;
    url: string;
    price: Money | null;
    /** Every currency the programme is priced in. Never converted. */
    prices: Money[];
  } | null;
}

export interface DreamverseData {
  products: Product[];
  trending: Product[];
  recommended: Product[];
  coaches: Coach[];
  /** ISO timestamp of when the data was read from Enski. */
  fetchedAt: string;
  error: string | null;
}
