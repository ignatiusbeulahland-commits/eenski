import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, ReceiptText, Scale } from "lucide-react";
import { useState } from "react";
import { EmptyState, EmptyTable, FilterSelect, PageHeader, SearchInput, StatCard, Toolbar, dateRanges } from "@/components/affiliate/ui";
import { meta } from "@/lib/affiliate/meta";
import { brandArtwork } from "@/components/affiliate/BrandIcon";

export const Route = createFileRoute("/affiliate/transactions")({
  head: () => meta("Transactions", "Commission and payout records for your affiliate account."),
  component: Transactions,
});

function Transactions() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  return (
    <div>
      <PageHeader eyebrow="Transactions" title="Transaction history" description="Every commission credited and payout made on your affiliate account." />
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={ArrowDownLeft} label="Money in" value="₦0" tone="lime" art={brandArtwork.cash} />
        <StatCard icon={ArrowUpRight} label="Money out" value="₦0" tone="sky" art={brandArtwork.payout} />
        <StatCard icon={Scale} label="Net" value="₦0" art={brandArtwork.analytics} featured />
      </div>
      <section className="surface mt-6 overflow-hidden">
        <Toolbar>
          <SearchInput value={q} onChange={setQ} placeholder="Search by reference or description" />
          <div className="grid grid-cols-3 gap-2 sm:ml-auto sm:flex">
            <FilterSelect value={type} onChange={setType} options={[["all", "All types"], ["commission", "Commission"], ["payout", "Payout"]]} className="sm:w-36" />
            <FilterSelect value={status} onChange={setStatus} options={[["all", "Any status"], ["completed", "Completed"], ["pending", "Pending"], ["failed", "Failed"]]} className="sm:w-36" />
            <FilterSelect value={range} onChange={setRange} options={dateRanges} className="sm:w-36" />
          </div>
        </Toolbar>
        <EmptyTable columns={["Reference", "Date", "Description", "Amount", "Status"]} empty={
          <EmptyState icon={ReceiptText} title={q || type !== "all" || status !== "all" || range !== "all" ? "No transactions match these filters" : "No transactions yet"} description="Eligible commissions and payouts will be recorded here, each with its own reference." />
        } />
      </section>
    </div>
  );
}
