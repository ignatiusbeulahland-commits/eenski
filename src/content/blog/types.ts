import beulahlandPhoto from "@/assets/creators/beulahland-ignatius.webp";
export type Category = "Careers" | "Creators" | "Learning" | "Design & Product";

export const categories: Category[] = ["Design & Product", "Careers", "Creators", "Learning"];

/** Article body blocks. Inline `**bold**` is supported inside text. */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "callout"; title: string; text: string }
  | { type: "pairs"; left: string; right: string; items: [string, string][] };

/** `photo` only when the author supplied their own picture; otherwise initials show. */
export type Author = { name: string; role: string; photo?: string };

export type PostSource = {
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  author: Author;
  /** ISO date, e.g. 2026-08-25 */
  date: string;
  image: string;
  imageAlt: string;
  featured?: boolean;
  takeaways: string[];
  body: Block[];
};

export type Post = PostSource & { readMinutes: number };

export const beulahland: Author = {
  name: "Beulahland Ignatius",
  role: "UI/UX product manager & AI builder",
  photo: beulahlandPhoto,
};

export const editorial: Author = {
  name: "Enski Editorial",
  role: "Guides and stories for African dreamers",
};
