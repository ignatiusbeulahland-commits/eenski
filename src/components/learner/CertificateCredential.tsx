import { Link } from "@tanstack/react-router";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Panel, StatusBadge } from "@/components/affiliate/ui";
import type { CertificateContent } from "@/components/shared/certificate/CertificateArt";
import { cn } from "@/lib/utils";
import { shortDate } from "./shared";

/**
 * The credential record behind a certificate: exactly what was issued (the name as printed on
 * the day, never the learner's later preference) and where its verification record can be checked.
 */
export function CertificateCredential({ content, status = "active", revoked }: {
  content: CertificateContent;
  status?: "active" | "revoked";
  revoked?: { at?: string | undefined; reason?: string | undefined; by: string } | undefined;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(content.code); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { toast.error("Couldn't copy the ID", { description: `Copy it by hand: ${content.code}` }); }
  };
  const rows: [string, React.ReactNode, boolean?][] = [
    ["Awarded to", content.learnerName],
    ["Course", content.courseTitle],
    ["Certificate", content.title],
    ["Issued by", content.creatorName],
    ["Issued on", shortDate(content.issuedAt)],
  ];
  return (
    <Panel
      title="Credential details"
      description="The details saved when this certificate was issued."
      actions={status === "revoked" ? <StatusBadge tone="pending">Revoked</StatusBadge> : <StatusBadge tone="success">Issued</StatusBadge>}
      bodyClassName="p-0"
    >
      <dl className="divide-y divide-dashed divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 px-5 py-3">
            <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">{k}</dt>
            <dd className="min-w-0 break-words text-right text-sm font-extrabold">{v}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">Certificate ID</dt>
          <dd className="flex min-w-0 items-center gap-2">
            <span className="font-mono text-xs font-extrabold tracking-wider">{content.code}</span>
            <button type="button" onClick={() => void copy()} aria-label={copied ? "ID copied" : "Copy certificate ID"} className="grid h-8 w-8 shrink-0 place-items-center rounded-full border bg-card text-cobalt hover:border-cobalt-300">
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </dd>
        </div>
        {status === "revoked" && revoked && (
          <div className="flex items-start justify-between gap-4 px-5 py-3">
            <dt className="shrink-0 text-[13px] font-semibold text-muted-foreground">Revoked</dt>
            <dd className="min-w-0 break-words text-right text-sm font-extrabold text-destructive">{revoked.by}{revoked.at ? ` · ${shortDate(revoked.at)}` : ""}{revoked.reason ? <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">{revoked.reason}</span> : null}</dd>
          </div>
        )}
      </dl>
      <div className={cn("flex flex-wrap items-center gap-3 border-t px-5 py-4", status === "revoked" ? "bg-destructive/5" : "bg-soft")}>
        <ShieldCheck className={cn("h-5 w-5 shrink-0", status === "revoked" ? "text-destructive" : "text-cobalt")} aria-hidden="true" />
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">
          {status === "revoked"
            ? "Its verification page shows it as revoked, with the reason."
            : "Enski keeps an issue record for this ID. Its verification page shows the details above, nothing more."}
        </p>
        <Link to="/verify" search={{ id: content.code }} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-cobalt px-3.5 text-[13px] font-extrabold text-cobalt hover:bg-ice">
          Check verification
        </Link>
      </div>
    </Panel>
  );
}
