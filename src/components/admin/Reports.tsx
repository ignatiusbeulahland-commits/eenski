import { Link } from "@tanstack/react-router";
import { Flag } from "lucide-react";
import { useState } from "react";
import { EmptyState, PageHeader } from "@/components/affiliate/ui";
import { Button } from "@/components/dashboard-ui/button";
import { adminStore, setReportStatus } from "@/lib/admin/store";
import { fmtDate } from "./data";
import { AdminList, Chips, Pill } from "./ui";

/** Reports visitors sent about creator pages, for the Enski team to review. */
export function AdminReports() {
  const reports = adminStore.use().reports ?? [];
  const [show, setShow] = useState<"open" | "all">("open");
  const rows = reports.filter((r) => show === "all" || r.status === "open");
  const open = reports.filter((r) => r.status === "open").length;
  return (
    <div>
      <PageHeader eyebrow="Safety" title="Page reports" description="Reports visitors sent from 'Report this page' on creator storefronts." />
      <div className="mb-4"><Chips label="Show" value={show} onChange={setShow} options={[{ id: "open", label: `Needs review (${open})` }, { id: "all", label: `All (${reports.length})` }]} /></div>
      <AdminList
        rows={rows}
        rowKey={(r) => r.id}
        columns={[
          { label: "Page", cell: (r) => <Link to="/store/$handle" params={{ handle: r.handle }} search={{ item: undefined }} className="font-bold text-brand underline-offset-4 hover:underline">{r.storeName || r.handle}</Link> },
          { label: "Reason", cell: (r) => <span className="font-semibold">{r.reason}</span> },
          { label: "Details", cell: (r) => <span className="line-clamp-2 text-muted-foreground">{r.details || "No details"}</span> },
          { label: "From", cell: (r) => r.email || "Visitor (not signed in)" },
          { label: "Sent", cell: (r) => fmtDate(r.at) },
          { label: "Status", cell: (r) => <Pill tone={r.status === "open" ? "wait" : "good"}>{r.status === "open" ? "Needs review" : "Reviewed"}</Pill> },
          { label: "Action", cell: (r) => <Button size="sm" variant="outline" onClick={() => setReportStatus(r.id, r.status === "open" ? "reviewed" : "open")}>{r.status === "open" ? "Mark reviewed" : "Reopen"}</Button> },
        ]}
        empty={<div className="surface"><EmptyState icon={Flag} title={show === "open" ? "No reports need review" : "No reports yet"} description="When a visitor reports a creator page, it shows here." /></div>}
      />
    </div>
  );
}
