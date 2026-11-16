import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Clock, Headset, MessageCircleMore, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { CharmTip } from "@/components/assistant/CharmStage";
import { RichText } from "@/components/assistant/RichText";
import { openCharm } from "@/lib/assistant/open";
import type { QuickAction } from "@/lib/assistant/types";
import { askFor, topicById, type HelpArticle, type HelpRole, type TopicId } from "@/lib/help-centre/content";
import { cn } from "@/lib/utils";
import { ContactChannels, Crumbs, HelpMissing, TopicArt, helpPaths, useHelpArticles } from "./parts";

const minutesFor = (text: string) => Math.max(1, Math.round(text.split(/\s+/).length / 180));

function ArticleRows({ role, list }: { role: HelpRole; list: HelpArticle[] }) {
  const paths = helpPaths(role);
  return (
    <ul className="surface divide-y overflow-hidden">
      {list.map((a) => (
        <li key={a.id}>
          <Link to={paths.article} params={{ articleId: a.id }} className="group flex items-center gap-4 p-4 transition-colors hover:bg-soft sm:px-5">
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-ink group-hover:text-brand">{a.title}</span>
              <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{a.body.replace(/\*\*/g, "").split("\n")[0]}</span>
            </span>
            <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground sm:flex">
              <Clock className="size-3" aria-hidden="true" />
              {minutesFor(a.body)} min
            </span>
            <ChevronRight className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** One support category: its answers, quick questions for Charm and ways to reach us. */
export function TopicPage({ role, topicId }: { role: HelpRole; topicId: string }) {
  const topic = topicById(topicId);
  const articles = useHelpArticles(role);
  const paths = helpPaths(role);
  if (!topic) return <HelpMissing role={role} />;
  const list = articles.filter((a) => a.topic === topic.id);
  return (
    <div className="hc-page mx-auto max-w-5xl">
      <Crumbs role={role} trail={[{ label: topic.label }]} />
      <header className="settings-hero surface relative mb-6 overflow-hidden p-5 sm:p-7">
        <div className="flex items-start gap-4 sm:items-center sm:gap-5">
          <TopicArt id={topic.id} className="size-14 shrink-0 sm:size-20" />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              <span className="size-1.5 rounded-sm bg-lime" aria-hidden="true" />
              Support topic
            </p>
            <h1 className="mt-1 text-2xl leading-tight sm:text-3xl">{topic.label}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground sm:text-[15px]">{topic.blurb}.</p>
          </div>
        </div>
        <div className="neon-rule absolute inset-x-0 bottom-0 opacity-70" aria-hidden="true" />
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section aria-labelledby="topic-answers">
          <h2 id="topic-answers" className="mb-3 text-lg font-extrabold">
            {list.length} {list.length === 1 ? "answer" : "answers"}
          </h2>
          {list.length ? (
            <ArticleRows role={role} list={list} />
          ) : (
            <CharmTip pose="surprised" then="think" title="No written answers here yet" eyebrow="Charm can still help">
              Ask me about it, or send the team a request and they'll reply by email.
            </CharmTip>
          )}
        </section>
        <aside className="space-y-4">
          <section className="surface p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-bold">
              <MessageCircleMore className="size-4 text-brand" aria-hidden="true" />
              Ask Charm straight away
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {askFor(topic, role).map((q) => (
                <button key={q} type="button" onClick={() => openCharm({ fresh: true, prompt: q })} className="rounded-full border-[1.5px] border-line bg-card px-3 py-1.5 text-[13px] font-bold text-brand transition-colors hover:border-sky hover:bg-ice">
                  {q}
                </button>
              ))}
            </div>
          </section>
          <section className="surface p-5">
            <h2 className="text-[15px] font-bold">Can't see your question?</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Tell us what happened. Your request goes straight to the {topic.label.toLowerCase()} team.</p>
            <Link to={paths.request} search={{ about: topic.id }} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cobalt px-5 text-sm font-extrabold text-primary-foreground transition-colors hover:bg-cobalt-hover">
              Send a request about this <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <button type="button" onClick={() => openCharm({ human: true })} className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-extrabold text-brand hover:bg-ice">
              <Headset className="size-4" aria-hidden="true" /> Talk to a person
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ActionButton({ role, action, topic }: { role: HelpRole; action: QuickAction; topic: TopicId }) {
  const navigate = useNavigate();
  const paths = helpPaths(role);
  const cls = "inline-flex h-10 items-center gap-2 rounded-full border-[1.5px] border-line bg-card px-4 text-sm font-extrabold text-brand transition-colors hover:border-sky hover:bg-ice";
  if (action.href) {
    const href = action.href;
    return (
      <button type="button" className={cls} onClick={() => void navigate({ href })}>
        {action.label} <ArrowRight className="size-3.5" aria-hidden="true" />
      </button>
    );
  }
  if (action.action === "ticket")
    return (
      <Link to={paths.request} search={{ about: topic }} className={cls}>
        {action.label}
      </Link>
    );
  return (
    <button type="button" className={cls} onClick={() => openCharm(action.action === "human" ? { human: true } : { fresh: true, prompt: action.prompt ?? action.label })}>
      {action.label}
    </button>
  );
}

/** A full help answer with next steps, feedback and related answers. */
export function ArticlePage({ role, articleId }: { role: HelpRole; articleId: string }) {
  const articles = useHelpArticles(role);
  const paths = helpPaths(role);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const a = articles.find((x) => x.id === articleId);
  if (!a) return <HelpMissing role={role} kind="article" />;
  const topic = topicById(a.topic)!;
  const related = articles.filter((x) => x.topic === a.topic && x.id !== a.id).slice(0, 4);
  return (
    <div className="hc-page mx-auto max-w-5xl">
      <Crumbs role={role} trail={[{ label: topic.label, to: <Link to={paths.topic} params={{ topicId: topic.id }} className="hover:text-brand">{topic.label}</Link> }, { label: "Answer" }]} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <article className="surface overflow-hidden">
          <header className="settings-hero relative border-b p-5 sm:p-7">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">
              <span className="size-1.5 rounded-sm bg-lime" aria-hidden="true" />
              {topic.label}
            </p>
            <h1 className="mt-2 text-2xl leading-tight sm:text-[30px]">{a.title}</h1>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-bold text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" />
              {minutesFor(a.body)} min read
            </p>
          </header>
          <div className="hc-prose space-y-3 p-5 text-[15px] leading-7 text-foreground/85 sm:p-7">
            <RichText text={a.body} />
          </div>
          {a.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 px-5 pb-5 sm:px-7 sm:pb-7">
              {a.actions.map((x) => (
                <ActionButton key={x.label} role={role} action={x} topic={a.topic} />
              ))}
            </div>
          )}
          <footer className="flex flex-wrap items-center gap-3 border-t bg-soft/60 px-5 py-4 sm:px-7" aria-live="polite">
            {vote ? (
              <p className="text-sm font-bold text-ink">
                {vote === "up" ? "Thanks, glad that helped." : "Thanks for telling us. Want a person to take a look?"}
                {vote === "down" && (
                  <button type="button" onClick={() => openCharm({ human: true })} className="ml-2 font-extrabold text-brand hover:underline">
                    Talk to a person
                  </button>
                )}
              </p>
            ) : (
              <>
                <span className="text-sm font-bold text-ink">Did this answer your question?</span>
                <div className="flex gap-2">
                  {(["up", "down"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => setVote(v)} className={cn("inline-flex h-9 items-center gap-1.5 rounded-full border-[1.5px] border-line bg-card px-3.5 text-sm font-bold transition-colors hover:border-sky", v === "up" ? "text-success" : "text-ink")}>
                      {v === "up" ? <ThumbsUp className="size-4" aria-hidden="true" /> : <ThumbsDown className="size-4" aria-hidden="true" />}
                      {v === "up" ? "Yes" : "Not really"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </footer>
        </article>
        <aside className="space-y-4">
          {related.length > 0 && (
            <section>
              <h2 className="mb-2 text-[15px] font-extrabold">More on {topic.label.toLowerCase()}</h2>
              <ArticleRows role={role} list={related} />
            </section>
          )}
          <CharmTip pose="point" title="Still unsure?" actions={<button type="button" onClick={() => openCharm({ fresh: true, prompt: a.title })} className="inline-flex h-9 items-center rounded-full bg-cobalt px-4 text-sm font-extrabold text-primary-foreground hover:bg-cobalt-hover">Ask Charm about this</button>}>
            I can walk you through it step by step.
          </CharmTip>
        </aside>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-extrabold">Reach the support team</h2>
        <ContactChannels role={role} topic={a.topic} />
      </section>
    </div>
  );
}
