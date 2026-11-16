import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

import type { Faq } from "@/components/faq/faqs";
import { highlightParts } from "@/lib/faq-search";

function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightParts(text, query).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-[4px] bg-lime-100 px-0.5 text-midnight">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

interface FaqItemProps {
  faq: Faq;
  query: string;
  categoryLabel?: string | undefined;
}

export function FaqItem({ faq, query, categoryLabel }: FaqItemProps) {
  return (
    <AccordionPrimitive.Item
      value={String(faq.id)}
      id={`faq-${faq.id}`}
      className="group scroll-mt-40 rounded-[20px] border border-line bg-card transition-[border-color,box-shadow] duration-200 hover:border-cobalt-100 data-[state=open]:border-cobalt-100 data-[state=open]:shadow-float"
    >
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger className="flex w-full cursor-pointer items-center gap-4 rounded-[20px] p-5 text-left focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none lg:px-6">
          <span className="flex-1">
            {categoryLabel && (
              <span className="type-caption mb-1 block text-sky-text">{categoryLabel}</span>
            )}
            <span className="block text-base leading-6 font-bold text-ink lg:text-[17px]">
              <Highlight text={faq.question} query={query} />
            </span>
          </span>
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-ice text-brand transition-colors duration-200 group-hover:bg-sky-200 group-data-[state=open]:bg-cobalt group-data-[state=open]:text-lime"
          >
            <Plus className="size-5 transition-transform duration-200 group-data-[state=open]:rotate-45" />
          </span>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <p className="max-w-[64ch] px-5 pb-6 text-base leading-[26px] text-slate lg:px-6">
          <Highlight text={faq.answer} query={query} />
        </p>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
