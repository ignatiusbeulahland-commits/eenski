import { createFileRoute } from "@tanstack/react-router";
import { Globe2 } from "lucide-react";
import { SettingsPage, StatusPill } from "@/components/shared/SettingsKit";
import { CurrencySettings } from "@/components/shared/finance/CurrencySettings";
import { preferredBeneficiary } from "@/lib/shared/finance/beneficiaries";
import { useAffiliate } from "@/lib/affiliate/store";
import { settingsTabs } from "@/lib/affiliate/nav";
import { meta } from "@/lib/affiliate/meta";

export const Route = createFileRoute("/affiliate/settings/currency")({
  head: () => meta("Country & Currency", "Your country, earnings currencies and payout currency."),
  component: AffiliateCurrency,
});

function AffiliateCurrency() {
  const { state, update } = useAffiliate();
  const preferred = preferredBeneficiary(state.beneficiaries);
  return (
    <SettingsPage icon={Globe2} title="Country & currency" description="Where you live, what you earn in and how you're paid." tabs={settingsTabs}
      status={<StatusPill tone="neutral">Payouts in {state.finance.payoutCurrency ?? preferred?.currency ?? "NGN"}</StatusPill>}>
      <CurrencySettings prefs={state.finance} onChange={(finance) => update({ finance })} preferred={preferred} earning={["NGN"]}
        selling={{ currency: "NGN", note: "Commission is earned in the currency the product sells in." }} accountsLink="/affiliate/settings/bank-account" />
    </SettingsPage>
  );
}
