import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Users, UserPlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { EmptyState, EmptyTable, FilterSelect, PageHeader, SearchInput, StatCard, Toolbar, dateRanges } from "@/components/affiliate/ui";
import { meta } from "@/lib/affiliate/meta";
import { brandArtwork } from "@/components/affiliate/BrandIcon";

export const Route = createFileRoute("/affiliate/referrals")({
  head: () => meta("Referrals", "Everyone who has arrived on Enski through your referral links."),
  component: Referrals,
});

function Referrals() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  return (
    <div>
      <PageHeader eyebrow="Referrals" title="Your referrals" description="People who reached Enski through your links, and whether they've purchased." />
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={Users} label="Total" value="0" />
        <StatCard icon={CheckCircle2} label="Successful" value="0" tone="lime" art={brandArtwork.success} />
        <StatCard icon={Clock} label="Pending" value="0" tone="sky" art={brandArtwork.pending} />
      </div>
      <section className="surface mt-6 overflow-hidden">
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search referrals" />
          <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex">
            <FilterSelect value={status} onChange={setStatus} options={[["all", "All statuses"], ["successful", "Successful"], ["pending", "Pending"]]} />
            <FilterSelect value={range} onChange={setRange} options={dateRanges} />
          </div>
        </Toolbar>
        <EmptyTable columns={["Referral", "Product", "Date", "Status", "Commission"]} empty={
          <EmptyState icon={UserPlus} title={q || status !== "all" || range !== "all" ? "No referrals match these filters" : "No referrals yet"} description="A referral is recorded when someone opens your link and signs up or buys. It becomes successful once their purchase completes." action={<Button asChild><Link to="/affiliate/my-affiliations">View my affiliate links</Link></Button>} />
        } />
      </section>
    </div>
  );
}
