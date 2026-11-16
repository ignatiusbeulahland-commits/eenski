import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Clock, MessagesSquare, Search, X } from "lucide-react";
import { useId, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/dashboard-ui/accordion";
import { CharmStage, CharmTip } from "@/components/assistant/CharmStage";
import { RichText } from "@/components/assistant/RichText";
import { openCharm } from "@/lib/assistant/open";
import { timeAgo } from "@/lib/assistant/format";
import { TOPICS, searchArticles, type HelpRole } from "@/lib/help-centre/content";
import { cn } from "@/lib/utils";
import { AvailabilityPill, ContactChannels, TopicArt, helpPaths, useHelpArticles, useSupportPerson } from "./parts";
import { STATUS_LABEL, STATUS_TONE } from "./status";

const POPULAR: Record<HelpRole, string[]> = {
  learner: ["Certificate", "Payment", "Password", "Event"],
  creator: ["Payout", "Publish", "Coaching", "Certificate"],
  affiliate: ["Referral link", "Commission", "Withdraw", "Bank account"],
};

/** The support centre landing page shared by Learner, Creator and Affiliate. */
export function SupportHome({ role }: { role: HelpRole }) {
  const paths = helpPaths(role);
  const articles = useHelpArticles(role);
  const person = useSupportPerson(role);
  const [q, setQ] = useState("");
  const searchId = useId();
  const results = q.trim() ? searchArticles(articles, q) : [];
  const faqs = articles.filter((a) => a.faq).slice(0, 6);
  const recent = [
    ...person.tickets.slice(0, 3).map((t) => ({ kind: "ticket" as const, id: t.id, at: t.updatedAt, t })),
    ...person.conversations.slice(0, 3).map((c) => ({ kind: "chat" as const, id: c.id, at: c.updatedAt, c })),
  ]
    .sort((a, b) => b.at - a.at)
    .slice(0, 4);

  return (
    <div className="hc-page">
      {/* Welcome */}
      <section data-surface="dark" className="bg-brand-panel relative mb-6 overflow-visible rounded-3xl text-primary-foreground">
        <span className="hero-dots" aria-hidden="true" />
        <div className="relative grid items-end gap-2 px-5 pt-7 sm:px-8 sm:pt-9 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0 pb-7 sm:pb-9">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime">
              <span className="neon-dot is-live" aria-hidden="true" />
              Support centre
            </p>
            <h1 className="mt-2 text-[28px] leading-tight sm:text-4xl">{person.first ? `Hi ${person.first}, how can we help?` : "How can we help?"}</h1>
            <p className="mt-2 max-w-xl text-sm text-on-dark-muted sm:text-[15px]">
              Search our answers, ask Charm, or reach a real person on the support team. Whatever you're working on, we'll help you get back to it.
            </p>
            <div className="relative mt-5 max-w-2xl" role="search">
              <label htmlFor={searchId} className="sr-only">
                Search the support centre
              </label>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id={searchId}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search for answers, e.g. withdraw, certificate, password"
                className="hc-search h-14 w-full rounded-full border-0 bg-card pl-12 pr-12 text-[15px] font-medium text-ink shadow-lift outline-none placeholder:text-muted-foreground/80 focus:ring-4 focus:ring-lime/50"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-soft" aria-label="Clear search">
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-on-dark-muted">Popular:</span>
              {POPULAR[role].map((t) => (
                <button key={t} type="button" onClick={() => setQ(t)} className="rounded-full bg-on-dark/10 px-3 py-1 font-bold ring-1 ring-on-dark/15 transition-colors hover:bg-on-dark/20">
                  {t}
                </button>
              ))}
            </div>
            <AvailabilityPill dark className="mt-5" />
          </div>
          <CharmStage
            pose={q ? (results.length ? "point" : "think") : "wave"}
            then={q ? undefined : "idle"}
            size="md"
            className="-mt-16 hidden self-end lg:flex"
            bubble={<>I'm Charm. Ask me anything, or pick a topic below.</>}
          />
        </div>
      </section>

      {q.trim() ? (
        <section aria-live="polite" className="mb-8">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-lg font-extrabold">
              {results.length} {results.length === 1 ? "answer" : "answers"} for "{q.trim()}"
            </h2>
            <button type="button" onClick={() => setQ("")} className="text-sm font-bold text-brand hover:underline">
              Clear search
            </button>
          </div>
          {results.length ? (
            <ul className="surface divide-y overflow-hidden">
              {results.slice(0, 12).map((a) => (
                <li key={a.id}>
                  <Link to={paths.article} params={{ articleId: a.id }} className="group flex items-center gap-4 p-4 transition-colors hover:bg-soft sm:px-5">
                    <TopicArt id={a.topic} className="size-10 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink group-hover:text-brand">{a.title}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{a.body.replace(/\*\*/g, "").split("\n")[0]}</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <CharmTip
              pose="think"
              eyebrow="No matching answers"
              title={`I couldn't find an answer for "${q.trim()}"`}
              actions={
                <>
                  <button type="button" onClick={() => openCharm({ fresh: true, prompt: q.trim() })} className="inline-flex h-10 items-center gap-2 rounded-full bg-cobalt px-4 text-sm font-extrabold text-primary-foreground hover:bg-cobalt-hover">
                    Ask Charm instead
                  </button>
                  <Link to={paths.request} search={{ about: undefined }} className="inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] border-line bg-card px-4 text-sm font-extrabold text-brand hover:border-sky">
                    Send us a request
                  </Link>
                </>
              }
            >
              Try fewer or different words, ask me directly, or send the team a request and we'll reply by email.
            </CharmTip>
          )}
        </section>
      ) : (
        <>
          {/* Topics */}
          <section className="mb-8" aria-labelledby="hc-topics">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 id="hc-topics" className="text-lg font-extrabold">
                  Browse by topic
                </h2>
                <p className="text-[13px] text-muted-foreground">Answers grouped the way you'd ask them.</p>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {TOPICS.map((t) => {
                const n = articles.filter((a) => a.topic === t.id).length;
                return (
                  <li key={t.id}>
                    <Link to={paths.topic} params={{ topicId: t.id }} className="hc-card kc-card surface group flex h-full min-w-0 flex-col gap-3 p-4 sm:p-5">
                      <TopicArt id={t.id} className="size-11 sm:size-12" />
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold leading-snug text-ink group-hover:text-brand sm:text-[15px]">{t.label}</span>
                        <span className="mt-1 hidden text-[13px] leading-snug text-muted-foreground sm:block">{t.blurb}</span>
                      </span>
                      <span className="mt-auto flex items-center justify-between pt-1 text-xs font-bold text-muted-foreground">
                        {n} {n === 1 ? "answer" : "answers"}
                        <ArrowRight className="size-4 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="mb-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            {/* FAQs */}
            <section className="surface overflow-hidden" aria-labelledby="hc-faq">
              <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
                <h2 id="hc-faq" className="flex items-center gap-2.5 text-[15px] font-bold">
                  <span className="lime-tick" aria-hidden="true" />
                  Frequently asked questions
                </h2>
              </header>
              <Accordion type="single" collapsible className="px-5 py-1">
                {faqs.map((a) => (
                  <AccordionItem key={a.id} value={a.id}>
                    <AccordionTrigger className="text-left text-sm font-bold hover:no-underline">{a.title}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      <div className="space-y-2 [&_p]:leading-6">
                        <RichText text={a.body} />
                      </div>
                      <Link to={paths.article} params={{ articleId: a.id }} className="mt-3 inline-flex items-center gap-1 font-bold text-brand hover:underline">
                        Read the full answer <ArrowRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* Previous requests and conversations */}
            <section className="surface overflow-hidden" aria-labelledby="hc-recent">
              <header className="flex items-center justify-between gap-3 border-b px-5 py-4">
                <h2 id="hc-recent" className="flex items-center gap-2.5 text-[15px] font-bold">
                  <span className="lime-tick" aria-hidden="true" />
                  Your requests and chats
                </h2>
                <Link to={paths.requests} className="text-xs font-bold text-brand hover:underline">
                  View all
                </Link>
              </header>
              {recent.length ? (
                <ul className="divide-y">
                  {recent.map((r) =>
                    r.kind === "ticket" ? (
                      <li key={r.id}>
                        <Link to={paths.ticket} params={{ ticketId: r.t.id }} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-soft">
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              {r.t.unseenUpdate && <span className="size-2 shrink-0 rounded-full bg-cobalt" aria-label="New update" />}
                              <span className="truncate text-sm font-bold text-ink group-hover:text-brand">{r.t.subject}</span>
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {r.t.ref} · updated {timeAgo(r.t.updatedAt)}
                            </span>
                          </span>
                          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold", STATUS_TONE[r.t.status])}>{STATUS_LABEL[r.t.status]}</span>
                        </Link>
                      </li>
                    ) : (
                      <li key={r.id}>
                        <Link to={paths.conversation} params={{ threadId: r.c.id }} className="group flex items-center gap-3 px-5 py-3.5 hover:bg-soft">
                          <MessagesSquare className="size-4 shrink-0 text-brand" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink group-hover:text-brand">{r.c.title}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">Chat · {timeAgo(r.c.updatedAt)}</span>
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <div className="flex flex-col items-center px-6 py-8 text-center">
                  <CharmStage pose="idle" size="sm" />
                  <p className="mt-3 font-bold text-ink">No chats or requests yet</p>
                  <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">When you chat with us or send a request, you can follow it here and pick up where you left off.</p>
                </div>
              )}
            </section>
          </div>
        </>
      )}

      {/* Contact */}
      <section className="mb-2" aria-labelledby="hc-contact">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="hc-contact" className="text-lg font-extrabold">
              Still need a hand?
            </h2>
            <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              Charm answers any time. People reply in minutes during support hours.
            </p>
          </div>
          <Link to={paths.contact} className="text-sm font-bold text-brand hover:underline">
            All contact options
          </Link>
        </div>
        <ContactChannels role={role} />
      </section>
    </div>
  );
}

