/** Prototype rules for switching between the Learner, Affiliate and Creator profiles. */
export type Profile = "Learner" | "Affiliate" | "Creator";
export const PROFILES: readonly Profile[] = ["Learner", "Affiliate", "Creator"];
export const PROFILE_TRUST_KEY = "enski.profile-switch.trusted-until";
export const TRUST_MS = 30 * 60 * 1000;
export const MIN_PASSWORD_LENGTH = 8;

/**
 * There is no real account in this prototype, so any password of 8+ characters passes.
 * The password is only checked in memory and never saved.
 */
export function checkSwitchPassword(password: string): string | null {
  if (!password.trim()) return "Enter your password to continue.";
  if (password.length < MIN_PASSWORD_LENGTH) return `That password doesn't look right. It needs at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

/** Only an expiry time is stored for "Don't ask again for 30 minutes", never the password. */
export const trustExpiry = (now = Date.now()) => now + TRUST_MS;
export function isTrusted(stored: string | null, now = Date.now()) {
  const until = Number(stored);
  return Number.isFinite(until) && until > now && until - now <= TRUST_MS;
}
export function readTrust() {
  try {
    return localStorage.getItem(PROFILE_TRUST_KEY);
  } catch {
    return null;
  }
}
export function rememberTrust(now = Date.now()) {
  try {
    localStorage.setItem(PROFILE_TRUST_KEY, String(trustExpiry(now)));
  } catch {
    /* storage unavailable: the next switch simply asks again */
  }
}
