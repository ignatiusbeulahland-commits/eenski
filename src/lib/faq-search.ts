import type { Faq, FaqCategoryId } from "@/components/faq/faqs";

export type FaqFilter = FaqCategoryId | "all";

const normalise = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Every word of the query must appear in the question or answer. */
export function filterFaqs(faqs: Faq[], category: FaqFilter, query: string): Faq[] {
  const words = normalise(query).split(" ").filter(Boolean);
  return faqs.filter((faq) => {
    if (category !== "all" && faq.category !== category) return false;
    if (words.length === 0) return true;
    const haystack = normalise(`${faq.question} ${faq.answer}`);
    return words.every((w) => haystack.includes(w));
  });
}

/** Split text into parts, flagging the ones that match a query word. */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const words = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (words.length === 0) return [{ text, match: false }];
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${escaped.join("|")})`, "gi");
  return text
    .split(re)
    .filter((part) => part !== "")
    .map((part) => ({ text: part, match: words.includes(part.toLowerCase()) }));
}
