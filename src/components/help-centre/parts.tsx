import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Headset, MessageCircleMore, Send } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { MissingScreen } from "@/components/shared/StatusScreen";
import { outcomeButton } from "@/components/shared/outcome";
import { cn } from "@/lib/utils";
import { useDemoProfile } from "@/lib/demo/profile";
import { useIdentity } from "@/lib/shared/identity";
import { kbStore, myTickets, settingsStore, supportAvailability, threadStore, ticketStore } from "@/lib/assistant/store";
import { openCharm } from "@/lib/assistant/open";
import { articlesFor, type HelpRole, type TopicId } from "@/lib/help-centre/content";

/** Typed links into one role's support centre. */
export function helpPaths(role: HelpRole) {
  return {
    home: `/${role}/help` as const,
    topic: `/${role}/help/topics/$topicId` as const,
    article: `/${role}/help/$articleId` as const,
    contact: `/${role}/help/contact` as const,
    request: `/${role}/help/new` as const,
    requests: `/${role}/help/requests` as const,
    ticket: `/${role}/help/requests/$ticketId` as const,
    sent: `/${role}/help/requests/$ticketId/sent` as const,
    conversation: `/${role}/help/conversations/$threadId` as const,
    dashboard: `/${role}/dashboard` as const,
  };
}

/** Each topic gets its own 3D artwork from the brand set. */
const TOPIC_ART: Record<TopicId, keyof typeof brandArtwork> = {
  account: "profile",
  learning: "video",
  payments: "payout",
  services: "calendar",
  marketplace: "market",
  certificates: "graduate",
  technical: "plug",
  general: "globe",
};
export function topicArtwork(id: TopicId) {
  return brandArtwork[TOPIC_ART[id]];
}

export function useHelpArticles(role: HelpRole) {
  const kb = kbStore.use();
  return useMemo(() => articlesFor(role, kb), [role, kb]);
}

/** The signed-in person and their own requests and conversations on this device. */
export function useSupportPerson(role: HelpRole) {
  const profile = useDemoProfile();
  const me = useIdentity();
  const tickets = ticketStore.use();
  const { threads } = threadStore.use();
  const email = (profile?.email ?? "").trim().toLowerCase();
  const mine = useMemo(() => myTickets(tickets).filter((t) => !email || t.userEmail === email || !t.userEmail), [tickets, email]);
  const conversations = useMemo(
    () => threads.filter((t) => (t.audience === role || t.audience === "public") && t.messages.some((m) => m.from === "user")).sort((a, b) => b.updatedAt - a.updatedAt),
    [threads, role],
  );
  return {
    name: profile?.name ?? "",
    first: me?.greet || profile?.name.trim().split(/\s+/)[0] || "",
    email: profile?.email ?? "",
    tickets: mine,
    conversations,
  };
}

export function useTeamStatus() {
  const settings = settingsStore.use();
  const a = supportAvailability(settings);
  return { available: a.available, online: a.online.length, hours: settings.hours };
}

export function AvailabilityPill({ dark = false, className }: { dark?: boolean; className?: string }) {
  const team = useTeamStatus();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
        dark ? "bg-on-dark/10 text-on-dark ring-1 ring-on-dark/20" : "bg-soft text-ink ring-1 ring-line",
        className,
      )}
    >
      <span className={cn("relative size-2 rounded-full", team.available ? "bg-lime" : "bg-warning")} aria-hidden="true">
        {team.available && <span className="absolute inset-0 animate-ping rounded-full bg-lime/70 motion-reduce:hidden" />}
      </span>
      {team.available ? "Support team online · replies in minutes" : "Team away right now · leave us a message"}
    </span>
  );
}

/** The three ways to reach us, as one row of cards. */
export function ContactChannels({ role, topic, compact = false }: { role: HelpRole; topic?: TopicId | undefined; compact?: boolean }) {
  const paths = helpPaths(role);
  const team = useTeamStatus();
  const card = "hc-card surface group flex min-w-0 flex-col items-start gap-3 p-4 text-left sm:p-5";
  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-1" : "md:grid-cols-3")}>
      <button type="button" className={card} onClick={() => openCharm({ fresh: false })}>
        <ChannelIcon icon={MessageCircleMore} tone="cobalt" />
        <span>
          <span className="block font-extrabold text-ink group-hover:text-brand">Chat with Charm</span>
          <span className="mt-0.5 block text-[13px] text-muted-foreground">Instant answers, any time of day.</span>
        </span>
        <ChannelFoot>Open chat</ChannelFoot>
      </button>
      <button type="button" className={card} onClick={() => openCharm({ human: true })}>
        <ChannelIcon icon={Headset} tone="lime" />
        <span>
          <span className="block font-extrabold text-ink group-hover:text-brand">Talk to a person</span>
          <span className="mt-0.5 block text-[13px] text-muted-foreground">
            {team.available ? `${team.online} ${team.online === 1 ? "agent" : "agents"} online now.` : `Live chat opens at ${team.hours.open}. Leave a message meanwhile.`}
          </span>
        </span>
        <ChannelFoot>{team.available ? "Start live chat" : "Leave a message"}</ChannelFoot>
      </button>
      <Link to={paths.request} search={{ about: topic }} className={card}>
        <ChannelIcon icon={Send} tone="sky" />
        <span>
          <span className="block font-extrabold text-ink group-hover:text-brand">Send a request</span>
          <span className="mt-0.5 block text-[13px] text-muted-foreground">We reply by email within one working day.</span>
        </span>
        <ChannelFoot>Create request</ChannelFoot>
      </Link>
    </div>
  );
}

function ChannelIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: "cobalt" | "lime" | "sky" }) {
  const t = { cobalt: "bg-cobalt text-primary-foreground", lime: "bg-midnight text-lime", sky: "bg-ice text-brand ring-1 ring-line" }[tone];
  return (
    <span className={cn("grid size-11 place-items-center rounded-2xl transition-transform duration-300 group-hover:-translate-y-0.5", t)}>
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

function ChannelFoot({ children }: { children: ReactNode }) {
  return (
    <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-extrabold text-brand">
      {children}
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </span>
  );
}

export function TopicArt({ id, className }: { id: TopicId; className?: string }) {
  return <BrandIcon src={topicArtwork(id)} className={cn("kc-art", className)} />;
}

/** Breadcrumb trail for support pages (the role shell adds its own back button). */
export function Crumbs({ role, trail }: { role: HelpRole; trail: { label: string; to?: ReactNode }[] }) {
  const paths = helpPaths(role);
  return (
    <nav aria-label="Breadcrumb" className="mb-4 hidden text-[13px] font-semibold text-muted-foreground sm:block">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to={paths.home} className="hover:text-brand">
            Support centre
          </Link>
        </li>
        {trail.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {c.to ?? <span className={cn(i === trail.length - 1 && "text-ink")} aria-current={i === trail.length - 1 ? "page" : undefined}>{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Not-found state for any support page, always with a way back. */
export function HelpMissing({ role, kind = "page" }: { role: HelpRole; kind?: "page" | "article" }) {
  const paths = helpPaths(role);
  return (
    <MissingScreen
      kind={kind}
      actions={
        <>
          <Link to={paths.home} className={outcomeButton.primary}>
            Back to support centre
          </Link>
          <Link to={paths.requests} className={outcomeButton.secondary}>
            My requests and chats
          </Link>
        </>
      }
    />
  );
}
