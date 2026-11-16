import { localStore } from "@/lib/assistant/persist";

/** Admin decisions kept on this device: suspended accounts, read notifications and platform settings. */
export type AdminSettings = { platformName: string; supportEmail: string; marketplaceOpen: boolean; newSignups: boolean; payoutReview: boolean; minPayout: number };
export const REPORT_REASONS = ["Misleading or false claims", "Copied content", "Scam or fraud", "Offensive content", "Something else"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];
export type PageReport = { id: string; at: string; handle: string; storeName: string; reason: ReportReason; details: string; email: string; status: "open" | "reviewed"; reviewedAt?: string | undefined };
export type AdminState = {
  reports?: PageReport[];
  suspended: Record<string, { at: string; reason: string; by: string }>;
  read: string[];
  settings: AdminSettings;
};
export const DEFAULT_ADMIN_SETTINGS: AdminSettings = { platformName: "Enski", supportEmail: "support@enski.com", marketplaceOpen: true, newSignups: true, payoutReview: false, minPayout: 1000 };
const EMPTY: AdminState = { suspended: {}, read: [], settings: DEFAULT_ADMIN_SETTINGS };
export const adminStore = localStore<AdminState>("enski:admin:v1", () => EMPTY, EMPTY);

const clean = (e: string) => e.trim().toLowerCase();
/** Why sign-in is blocked for this email, or null. */
export function suspensionOf(state: AdminState, email: string) {
  return state.suspended[clean(email)] ?? null;
}
export function isSuspended(email: string) {
  return !!suspensionOf(adminStore.get(), email);
}
export function suspendAccount(email: string, reason: string, by: string, now = new Date()) {
  adminStore.set((s) => ({ ...s, suspended: { ...s.suspended, [clean(email)]: { at: now.toISOString(), reason: reason.trim().slice(0, 200), by } } }));
}
export function reinstateAccount(email: string) {
  adminStore.set((s) => {
    const { [clean(email)]: _gone, ...rest } = s.suspended;
    return { ...s, suspended: rest };
  });
}
export function markRead(ids: string[]) {
  adminStore.set((s) => ({ ...s, read: [...new Set([...s.read, ...ids])] }));
}
export function saveAdminSettings(settings: AdminSettings) {
  adminStore.set((s) => ({ ...s, settings }));
}

/** Saves a visitor's report about a creator page for the Enski team to review. */
export function reportPage(input: { handle: string; storeName: string; reason: ReportReason; details: string; email?: string }, now = new Date()): PageReport {
  const report: PageReport = {
    id: `rep-${now.getTime().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    at: now.toISOString(),
    handle: input.handle.trim().toLowerCase(),
    storeName: input.storeName.trim().slice(0, 120),
    reason: input.reason,
    details: input.details.trim().slice(0, 1000),
    email: (input.email ?? "").trim().toLowerCase(),
    status: "open",
  };
  adminStore.set((s) => ({ ...s, reports: [report, ...(s.reports ?? [])] }));
  return report;
}
export function setReportStatus(id: string, status: PageReport["status"], now = new Date()) {
  adminStore.set((s) => ({ ...s, reports: (s.reports ?? []).map((r) => (r.id === id ? { ...r, status, ...(status === "reviewed" ? { reviewedAt: now.toISOString() } : { reviewedAt: undefined }) } : r)) }));
}
