import { createFileRoute } from "@tanstack/react-router";
import { Banknote, Bell, BookOpen, Coins, Megaphone, Store, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PreferenceSummary, SettingsGrid, SettingsPage, SettingsTip, ToggleGroupCard, ToggleRow } from "@/components/shared/SettingsKit";
import { useAffiliate } from "@/lib/affiliate/store";
import { settingsTabs } from "@/lib/affiliate/nav";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/settings/notifications")({
  head: () => meta("Notifications", "Choose which affiliate updates you receive by email."),
  component: Notifications,
});

const groups = [
  { icon: Coins, title: "Earnings & payouts", description: "Money moving in and out.", rows: [["conversions", "Conversions and commission", "When a referral completes a purchase and you earn commission.", Coins], ["payouts", "Payout updates", "When a payout is requested, processed or fails.", Banknote]] },
  { icon: UserPlus, title: "Referrals", description: "People joining through your links.", rows: [["referrals", "New referrals", "When someone signs up through one of your links.", UserPlus]] },
  { icon: Megaphone, title: "From Enski", description: "Products to promote and advice.", rows: [["products", "New products in the Market", "A weekly roundup of new products you can promote.", Store], ["tips", "Tips and guides", "Occasional advice on promoting products well.", BookOpen]] },
] as const;

function Notifications() {
  const { state, update } = useAffiliate();
  const keys = groups.flatMap((g) => g.rows.map((r) => r[0]));
  const on = keys.filter((k) => state.notifyPrefs[k]).length;
  return (
    <SettingsPage icon={Bell} title="Notifications" description={`Email updates go to ${state.profile.email}.`} tabs={settingsTabs}>
      <SettingsGrid
        main={groups.map((g) => (
          <ToggleGroupCard key={g.title} icon={g.icon} title={g.title} description={g.description}>
            {g.rows.map(([k, l, d, icon]) => <ToggleRow key={k} id={k} icon={icon} title={l} description={d} checked={!!state.notifyPrefs[k]} onChange={(v) => { update((s) => ({ notifyPrefs: { ...s.notifyPrefs, [k]: v } })); toast(`${l} ${v ? "on" : "off"}`); }} />)}
          </ToggleGroupCard>
        ))}
        side={<><PreferenceSummary on={on} total={keys.length} label="Notifications on" /><SettingsTip title="Good to know" items={["Changes save instantly.", "Payout receipts are always sent."]} /></>}
      />
    </SettingsPage>
  );
}
