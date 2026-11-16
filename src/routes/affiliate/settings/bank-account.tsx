import { createFileRoute } from "@tanstack/react-router";
import { Landmark, ShieldCheck } from "lucide-react";
import { SettingsGrid, SettingsPage, SettingsTip, StatusPill } from "@/components/shared/SettingsKit";
import { PayoutAccounts } from "@/components/shared/finance/PayoutAccounts";
import { useAffiliate } from "@/lib/affiliate/store";
import { settingsTabs } from "@/lib/affiliate/nav";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/settings/bank-account")({
  head: () => meta("Bank Account Details", "The bank and mobile money accounts your affiliate payouts are sent to."),
  component: Bank,
});

function Bank() {
  const { state, commit } = useAffiliate();
  const n = state.beneficiaries.length;
  return (
    <SettingsPage icon={Landmark} title="Bank account details" description="Bank and mobile money accounts your payouts can be sent to." tabs={settingsTabs}
      status={n ? <StatusPill tone="success">{n} payout account{n === 1 ? "" : "s"}</StatusPill> : <StatusPill tone="neutral">No account yet</StatusPill>}>
      <SettingsGrid
        main={<PayoutAccounts list={state.beneficiaries} onChange={(beneficiaries) => commit({ beneficiaries })} defaultHolder={`${state.profile.firstName} ${state.profile.lastName}`.trim()} defaultCountry={state.finance.residence || "NG"} />}
        side={<SettingsTip icon={ShieldCheck} title="Safe payouts" items={["Use an account in your own name.", "Only the last four digits are kept.", "The provider confirms the account owner before your first payout.", "Your accounts are visible only to you."]} />}
      />
    </SettingsPage>
  );
}
