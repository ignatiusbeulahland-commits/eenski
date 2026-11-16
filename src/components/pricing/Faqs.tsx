import { Mail } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Icon3D } from "@/components/site/Icon3D";
import { Reveal } from "@/components/site/motion";
import { faqs } from "./content";
import { LeadFormDialog } from "./LeadFormDialog";

export function Faqs() {
  return (
    <section id="faqs" className="bg-background pb-8 pt-20 lg:pb-12 lg:pt-28">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-h2 text-ink">FAQs</h2>

          <div className="relative mt-8 rounded-[24px] bg-ice p-6 md:p-7">
            <Icon3D name="chat" className="absolute -right-3 -top-8 size-16 rotate-6 animate-bob" />
            <h3 className="text-xl font-extrabold text-ink">Still have questions?</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Contact us for custom pricing tailored to your needs.
            </p>
            <LeadFormDialog kind="contact">
              <Button variant="outline" className="mt-5">
                <Mail /> Contact us
              </Button>
            </LeadFormDialog>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Accordion type="single" collapsible defaultValue="faq-0" className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`faq-${i}`}
                className="rounded-[20px] border border-line bg-card px-5 transition-colors data-[state=open]:border-sky-200 data-[state=open]:bg-soft md:px-6"
              >
                <AccordionTrigger className="py-5 text-left text-[16px] font-extrabold text-ink hover:no-underline md:text-[17px] [&>svg]:size-5 [&>svg]:text-brand">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  {f.a.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
