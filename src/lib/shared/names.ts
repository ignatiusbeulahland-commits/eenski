/** Name rules shared by sign-up and profile settings. One full-name box; no first/last split is forced. */

/** Trims and collapses repeated spaces; keeps hyphens, apostrophes, accents and any script as typed. */
export function cleanFullName(raw: string): string {
  return raw.normalize("NFC").replace(/\s+/g, " ").trim();
}

/** Why a full name can't be used, or null when it's fine. Accepts any language's letters, hyphens, apostrophes and dots. */
export function fullNameProblem(name: string): string | null {
  const n = cleanFullName(name);
  if (!n) return "Enter your full name";
  if (n.length < 2) return "Enter at least 2 characters";
  if (n.length > 80) return "Keep your name under 80 characters";
  if (!/\p{L}/u.test(n)) return "Your name needs at least one letter";
  if (/[^\p{L}\p{M}\s'’.\-]/u.test(n)) return "Use letters, spaces, hyphens, apostrophes or dots only";
  return null;
}

/** The name printed on new certificates: the chosen certificate name, else the full account name. */
export function certificateNameOf(p: { fullName: string; certificateName?: string }): string {
  return cleanFullName(p.certificateName ?? "") || cleanFullName(p.fullName);
}
