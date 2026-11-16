import { createFileRoute, Link } from "@tanstack/react-router";
import { LineChart, MousePointerClick, Percent, Target, Users, Package } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/dashboard-ui/tabs";
import { EmptyState, EmptyTable, FilterSelect, PageHeader, Panel, StatCard, dateRanges } from "@/components/affiliate/ui";
import { meta } from "@/lib/affiliate/meta";
import { useAffiliate } from "@/lib/affiliate/store";
import { products } from "@/lib/affiliate/products";
import { ConversionFunnel, ReferralSources } from "@/components/affiliate/Insights";

export const Route = createFileRoute("/affiliate/performance")({
  head: () => meta("Performance", "Clicks, referrals and conversions across the products you promote."),
  component: Performance,
});

function Performance() {
  const { state } = useAffiliate();
  const promoted = products.filter((p) => state.joined.includes(p.id));
  const [range, setRange] = useState("30");
  const [metric, setMetric] = useState("clicks");
  const label = dateRanges.find((d) => d[0] === range)?.[1].toLowerCase();
  return (
    <div>
      <PageHeader eyebrow="Performance" title="How your links are doing" description="Track clicks, referrals and conversions across everything you promote." actions={<FilterSelect value={range} onChange={setRange} options={dateRanges} className="w-40" />} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={MousePointerClick} label="Clicks" value="0" hint={label} />
        <StatCard icon={Users} label="Referrals" value="0" hint={label} tone="sky" />
        <StatCard icon={Target} label="Conversions" value="0" hint={label} tone="lime" />
        <StatCard icon={Percent} label="Conversion rate" value="—" hint="Needs at least one click" tone="midnight" featured />
      </div>
      <Tabs value={metric} onValueChange={setMetric}>
      <Panel className="mt-6" title="Performance over time" description={`Showing ${label}`} actions={
        <TabsList aria-label="Chart metric"><TabsTrigger value="clicks">Clicks</TabsTrigger><TabsTrigger value="referrals">Referrals</TabsTrigger><TabsTrigger value="conversions">Conversions</TabsTrigger></TabsList>
      }>
        <TabsContent value={metric} className="mt-0">
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-2" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="border-t border-dashed" />)}
          </div>
          <div className="relative">
            <EmptyState icon={LineChart} title="No performance data yet" description={`Your daily ${metric} will be charted here once people start opening your referral links.`} action={<Button asChild variant="outline"><Link to="/affiliate/my-affiliations">Get your links</Link></Button>} />
          </div>
        </div>
        </TabsContent>
      </Panel>
      </Tabs>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ConversionFunnel />
        <ReferralSources />
      </div>
      <Panel className="mt-6" title="Product performance" description="Results for each product you promote" bodyClassName="p-0">
        {promoted.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-soft">{["Product", "Clicks", "Referrals", "Conversions", "Earnings"].map((label) => <th key={label} className="px-4 py-2.5 text-left text-xs text-muted-foreground">{label}</th>)}</tr></thead><tbody>{promoted.map((p) => <tr key={p.id} className="border-b last:border-0"><td className="min-w-48 px-4 py-3"><Link to="/affiliate/market/$productId" params={{ productId: p.id }} className="font-semibold text-cobalt">{p.title}</Link></td>{["clicks", "referrals", "conversions", "earnings"].map((key) => <td key={key} className="px-4 py-3 tabular-nums">{key === "earnings" ? "₦0" : "0"}</td>)}</tr>)}</tbody></table></div> : <EmptyTable columns={["Product", "Clicks", "Referrals", "Conversions", "Earnings"]} empty={
          <EmptyState compact icon={Package} title="No product results yet" description="Each product you promote will be listed here with its own clicks and conversions." action={<Button asChild><Link to="/affiliate/market">Browse the market</Link></Button>} />
        } />}
      </Panel>
    </div>
  );
}
