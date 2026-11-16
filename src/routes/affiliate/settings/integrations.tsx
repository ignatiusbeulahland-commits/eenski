import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { SettingsPage, StatusPill } from "@/components/shared/SettingsKit";
import { IntegrationsHub, type IntegrationItem } from "@/components/shared/Integrations";
import { useAffiliate } from "@/lib/affiliate/store";
import { settingsTabs } from "@/lib/affiliate/nav";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/settings/integrations")({
  head: () => meta("Integrations", "Connect the tools you use to share referral links and reach your audience."),
  component: AffiliateIntegrations,
});

const items: IntegrationItem[] = [
  { id: "whatsapp", name: "WhatsApp", category: "Sharing", description: "Share referral links to chats, groups and your status in one tap." },
  { id: "telegram", name: "Telegram", category: "Sharing", description: "Post product recommendations to your Telegram channel or groups." },
  { id: "instagram", name: "Instagram", category: "Social media", description: "Add referral links to your bio, stories and posts." },
  { id: "tiktok", name: "TikTok", category: "Social media", description: "Promote products in your videos with a link in your bio." },
  { id: "x", name: "X", category: "Social media", description: "Share products and your referral links in posts and threads." },
  { id: "facebook", name: "Facebook", category: "Social media", description: "Share products to your page and the groups you run." },
  { id: "linkedin", name: "LinkedIn", category: "Social media", description: "Recommend courses and resources to your professional network." },
  { id: "youtube", name: "YouTube", category: "Social media", description: "Add referral links to video descriptions and pinned comments." },
  { id: "pinterest", name: "Pinterest", category: "Social media", description: "Pin product covers that link back with your referral code." },
  { id: "mailchimp", name: "Mailchimp", category: "Email marketing", description: "Send product recommendations with your links to your email list." },
  { id: "bitly", name: "Bitly", category: "Links & tracking", description: "Shorten referral links so they're easy to share and remember." },
  { id: "google-analytics", name: "Google Analytics", category: "Links & tracking", description: "Follow the visits your own pages send to your referral links." },
  { id: "google-drive", name: "Google Drive", category: "Files & reports", description: "Save product images and promo materials to your Drive." },
  { id: "google-sheets", name: "Google Sheets", category: "Files & reports", description: "Keep a copy of your referrals and earnings in a Google Sheet." },
  { id: "zapier", name: "Zapier", category: "Files & reports", description: "Send new referrals and payouts to the other apps you use." },
];

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function AffiliateIntegrations() {
  const { state, update } = useAffiliate();
  const connected = items.filter((i) => state.integrations[i.id]).length;
  return (
    <SettingsPage icon={Plug} title="Integrations" description="Connect the tools you use to share links and reach your audience." tabs={settingsTabs} status={<StatusPill tone={connected ? "success" : "neutral"}>{connected} connected</StatusPill>}>
      <IntegrationsHub
        items={items}
        connectedLabel={(id) => { const at = state.integrations[id]; return at ? `Connected ${shortDate(at)}` : undefined; }}
        onConnect={(id) => update((s) => ({ integrations: { ...s.integrations, [id]: new Date().toISOString() } }))}
        onDisconnect={(id) => update((s) => { const next = { ...s.integrations }; delete next[id]; return { integrations: next }; })}
      />
    </SettingsPage>
  );
}
