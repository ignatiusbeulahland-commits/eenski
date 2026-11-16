import { localStore } from "@/lib/assistant/persist";

/** Admin decisions kept on this device: suspended accounts, read notifications and platform settings. */
export type AdminSettings = { platformName: string; supportEmail: string; marketplaceOpen: boolean; newSignups: boolean; payoutReview: boolean; minPayout: number };
export type AdminState = {
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
