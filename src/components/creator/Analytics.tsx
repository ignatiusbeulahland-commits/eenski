import { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { LineChart, ShoppingBag, Users, Eye, Package } from "lucide-react";
import { PageHeader, Panel, StatCard, FilterSelect, EmptyState } from "@/components/affiliate/ui";
import { BrandIcon, brandArtwork } from "@/components/affiliate/BrandIcon";
import { useCreator } from "@/lib/creator/store";
import { totalEarnings, type Order } from "@/lib/creator/rules";
import { naira } from "@/lib/affiliate/products";
import { ItemLink } from "./shared";
export function SalesChart({ orders }: { orders: Order[] }) {
  const paid = orders.filter((o) => o.status === "paid");
  if (!paid.length)
    return (
      <EmptyState icon={LineChart} title="No sales data yet" description="Your sales chart fills in after your first sale." compact />
    );
  const dates = [...new Set(paid.map((o) => o.date.slice(0, 10)))].sort();
  const data = dates.map((date) => ({
    date,
    earnings: paid.filter((o) => o.date.startsWith(date)).reduce((n, o) => n + o.amount, 0),
  }));
  return (
    <div className="h-64 w-full min-w-0" aria-label="Sales chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <YAxis width={55} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(v) => `${Number(v) / 1000}k`} />
          <Tooltip
            formatter={(v) => [naira(Number(v)), "Earnings"]}
            contentStyle={{ background: "var(--card)", borderColor: "var(--line)", borderRadius: 8, color: "var(--foreground)" }}
            cursor={{ fill: "var(--ice)" }}
          />
          <Bar dataKey="earnings" fill="var(--cobalt)" radius={[4, 4, 0, 0]} maxBarSize={56} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function CreatorPerformance() {
  const { state } = useCreator();
  const [range, setRange] = useState("all");
  const orders = state.orders.filter((o) => range === "all" || Date.parse(o.date) >= Date.now() - Number(range) * 86400000);
  const paid = orders.filter((o) => o.status === "paid");
  const items = state.items.filter((i) => i.status !== "archived");
  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Performance"
        description="How your products and sales are doing."
        actions={
          <FilterSelect label="Date range"
            value={range}
            onChange={setRange}
            options={[
              ["all", "All time"],
              ["7", "Last 7 days"],
              ["30", "Last 30 days"],
              ["90", "Last 90 days"],
            ]}
          />
        }
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Sales" value={String(paid.length)} />
        <StatCard icon={LineChart} label="Revenue" value={naira(totalEarnings({ orders }))} tone="sky" />
        <StatCard icon={Users} label="Buyers" value={String(new Set(paid.map((o) => o.customerId)).size)} tone="lime" />
        <StatCard icon={Eye} label="Published products" value={String(state.items.filter((i) => i.status === "published").length)} />
      </div>
      <Panel title="Sales" actions={<BrandIcon src={brandArtwork.analytics} className="h-10 w-10" />}>
        <SalesChart orders={orders} />
      </Panel>
      <Panel title="Product performance" className="mt-6">
        {items.length ? (
          <div className="divide-y">
            {items.map((i) => {
              const sales = paid.filter((o) => o.itemId === i.id);
              return (
                <div key={i.id} className="flex flex-wrap justify-between gap-3 py-4 text-sm">
                  <div>
                    <ItemLink item={i} className="font-bold hover:text-cobalt">
                      {i.title}
                    </ItemLink>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sales.length} sale{sales.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="font-bold tabular-nums">{naira(totalEarnings({ orders: sales }))}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon={Package} title="No products yet" description="Create a product under Manage Products to track its performance." compact />
        )}
      </Panel>
    </div>
  );
}
