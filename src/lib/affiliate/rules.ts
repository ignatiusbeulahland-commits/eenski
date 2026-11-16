export const validPhone = (phone: string) => !phone || /^\+?\d{10,15}$/.test(phone.replace(/ /g, ""));
export const joinProduct = (joined: string[], id: string) => [...new Set([...joined, id])];
// Submitting a document is not verification; the prototype performs no identity checks.
export const verificationComplete = (_status: "not_started" | "submitted") => false;
export const prototypeBalances = { earnings: 0, available: 0, pending: 0, clicks: 0, referrals: 0, conversions: 0 };
type MilestoneInput = {
  termsAccepted: boolean;
  joined: string[];
  linkCopied: boolean;
  bank: unknown;
};
export type AffiliateMilestone = { id: string; title: string; description: string; earned: boolean };

/** Affiliate milestones earned only through real local actions or real (zero) balances. */
export function affiliateMilestones(s: MilestoneInput, b = prototypeBalances): AffiliateMilestone[] {
  return [
    { id: "terms", title: "Ready to promote", description: "Agree to the affiliate terms", earned: s.termsAccepted },
    { id: "first-product", title: "First product", description: "Start promoting a product", earned: s.joined.length > 0 },
    { id: "first-share", title: "First share", description: "Copy a referral link to share", earned: s.linkCopied },
    { id: "payout-ready", title: "Payout ready", description: "Add bank account details", earned: s.bank != null },
    { id: "first-referral", title: "First referral", description: "Someone signs up through your link", earned: b.referrals > 0 },
    { id: "first-sale", title: "First sale", description: "A referral completes a purchase", earned: b.conversions > 0 },
  ];
}

type EventInput = MilestoneInput & { verification: string; profile: { firstName: string; lastName: string; phone: string; email: string; location: string; photo?: string | undefined } };
/** Notification titles produced by a local state change (prev → next). */
export function affiliateEvents(prev: EventInput, next: EventInput, productTitle: (id: string) => string = (id) => id) {
  const out: { title: string; body: string }[] = [];
  if (!prev.termsAccepted && next.termsAccepted) out.push({ title: "Affiliate terms accepted", body: "You can now promote products from the Market." });
  for (const id of next.joined.filter((j) => !prev.joined.includes(j)))
    out.push({ title: "Referral link ready", body: `Your link for "${productTitle(id)}" is in My Affiliations.` });
  if (!prev.linkCopied && next.linkCopied) out.push({ title: "First link copied", body: "Share it with your audience to start earning referrals." });
  if (prev.bank == null && next.bank != null) out.push({ title: "Bank account added", body: "Payouts will go to this account once you have an available balance." });
  if (prev.verification !== "submitted" && next.verification === "submitted")
    out.push({ title: "Verification submitted", body: "Your documents are with the Enski team. We'll let you know once they're reviewed." });
  const p = prev.profile, n = next.profile;
  if (p.firstName !== n.firstName || p.lastName !== n.lastName || p.phone !== n.phone || p.email !== n.email || p.location !== n.location || p.photo !== n.photo)
    out.push({ title: "Profile updated", body: "Your affiliate profile details were saved on this device." });
  return out;
}
