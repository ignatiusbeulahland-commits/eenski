import { Lightbulb, Quote } from "lucide-react";
import { slugify, type Block } from "@/content/blog";
import { RichText } from "./RichText";

export function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="article-body">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2
                key={i}
                id={slugify(b.text)}
                className="mt-12 scroll-mt-28 text-[1.6rem] font-extrabold leading-tight text-ink first:mt-0 md:text-[1.9rem]"
              >
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-8 text-xl font-extrabold text-ink">
                {b.text}
              </h3>
            );
          case "p":
            return (
              <p key={i} className="mt-5 text-[17px] leading-[1.8] text-slate md:text-[18px]">
                <RichText text={b.text} />
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="mt-5 space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-[17px] leading-[1.75] text-slate">
                    <span aria-hidden className="mt-[0.7em] size-2 shrink-0 rounded-full bg-sky" />
                    <span>
                      <RichText text={it} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="mt-5 space-y-4">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-4 text-[17px] leading-[1.75] text-slate">
                    <span
                      aria-hidden
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-ice text-sm font-extrabold text-brand"
                    >
                      {j + 1}
                    </span>
                    <span className="pt-0.5">
                      <RichText text={it} />
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <figure
                key={i}
                className="relative my-10 overflow-hidden rounded-3xl bg-cobalt-light px-7 py-8 md:px-10"
              >
                <Quote aria-hidden className="size-8 text-lime" />
                <blockquote className="mt-3 text-xl font-extrabold leading-snug text-primary-foreground md:text-2xl">
                  {b.text}
                </blockquote>
              </figure>
            );
          case "callout":
            return (
              <aside
                key={i}
                className="my-8 flex gap-4 rounded-3xl border border-line bg-soft p-6"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-[14px] bg-lime text-midnight">
                  <Lightbulb className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-extrabold text-ink">{b.title}</p>
                  <p className="mt-1 text-[16px] leading-relaxed text-slate">
                    <RichText text={b.text} />
                  </p>
                </div>
              </aside>
            );
          case "pairs":
            return (
              <div key={i} className="my-8 overflow-hidden rounded-3xl border border-line">
                <div className="grid grid-cols-2 bg-ice text-[13px] font-extrabold uppercase tracking-[0.12em] text-brand">
                  <p className="px-4 py-3 md:px-6">{b.left}</p>
                  <p className="border-l border-line px-4 py-3 md:px-6">{b.right}</p>
                </div>
                {b.items.map(([l, r], j) => (
                  <div
                    key={j}
                    className="grid grid-cols-2 border-t border-line text-[15px] leading-snug md:text-[16px]"
                  >
                    <p className="px-4 py-3.5 font-bold text-ink md:px-6">{l}</p>
                    <p className="border-l border-line px-4 py-3.5 text-slate md:px-6">{r}</p>
                  </div>
                ))}
              </div>
            );
        }
      })}
    </div>
  );
}
