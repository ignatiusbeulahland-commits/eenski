import { useEffect, useMemo, useState } from "react";
import { buildDeviceData, deviceEntries, type DeviceData } from "@/lib/admin/data";
import { adminStore } from "@/lib/admin/store";
import { ticketStore } from "@/lib/assistant/store";
import { useCredentials } from "@/lib/shared/credentials";

/** Everything saved on this device, refreshed when another tab changes it or the window regains focus. Null until mounted. */
export function useDeviceData(): DeviceData | null {
  const [data, setData] = useState<DeviceData | null>(null);
  useEffect(() => {
    const load = () => setData(buildDeviceData(deviceEntries()));
    load();
    window.addEventListener("storage", load);
    window.addEventListener("focus", load);
    return () => { window.removeEventListener("storage", load); window.removeEventListener("focus", load); };
  }, []);
  return data;
}

export type AdminNote = { id: string; at: string; title: string; text: string; kind: "account" | "payout" | "payment" | "credential" | "support"; to: "/admin/accounts" | "/admin/payouts" | "/admin/transactions" | "/admin/certificates" | "/admin/badges" | "/admin/support" };

/** Notifications derived from real records only (newest first), with the admin's read marks. */
export function useNotifications(data: DeviceData | null) {
  const creds = useCredentials();
  const tickets = ticketStore.use();
  const admin = adminStore.use();
  return useMemo(() => {
    const list: AdminNote[] = [];
    for (const p of data?.payouts ?? []) {
      if (p.status === "processing") list.push({ id: `payout-${p.id}`, at: p.date, title: "Withdrawal processing", text: `${p.ownerName} · ${p.ref}`, kind: "payout", to: "/admin/payouts" });
      if (p.status === "failed") list.push({ id: `payout-f-${p.id}`, at: p.date, title: "Withdrawal failed", text: `${p.ownerName} · ${p.ref}`, kind: "payout", to: "/admin/payouts" });
    }
    for (const o of data?.orders ?? []) if (o.status === "failed") list.push({ id: `pay-${o.id}`, at: o.date, title: "Payment failed", text: `${o.party} · ${o.ref}`, kind: "payment", to: "/admin/transactions" });
    for (const c of creds.certificates) list.push({ id: `cert-${c.code}`, at: c.status === "revoked" && c.revokedAt ? c.revokedAt : c.issuedAt, title: c.status === "revoked" ? "Certificate revoked" : "Certificate issued", text: `${c.recipientName} · ${c.courseTitle}`, kind: "credential", to: "/admin/certificates" });
    for (const a of creds.badgeAwards) list.push({ id: `badge-${a.id}`, at: a.issuedAt, title: "Badge awarded", text: `${a.badge.name} to ${a.recipientName}`, kind: "credential", to: "/admin/badges" });
    for (const t of tickets.filter((x) => !x.seed && x.status !== "Resolved")) list.push({ id: `ticket-${t.id}`, at: new Date(t.createdAt).toISOString(), title: t.priority === "urgent" ? "Urgent support ticket" : "New support ticket", text: `${t.ref} · ${t.subject}`, kind: "support", to: "/admin/support" });
    list.sort((a, b) => b.at.localeCompare(a.at));
    return { list, unread: list.filter((n) => !admin.read.includes(n.id)).length, read: admin.read };
  }, [data, creds, tickets, admin.read]);
}

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};
