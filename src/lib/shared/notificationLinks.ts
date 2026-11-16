/**
 * Where each notification opens. Notifications are stored as plain text, so the
 * destination is worked out from their type or wording. Pure.
 */
type Rule = [RegExp, string];

const first = (rules: Rule[], text: string, fallback: string) => rules.find(([re]) => re.test(text))?.[1] ?? fallback;

export function learnerNotificationLink(n: { type: string; title: string; body?: string | undefined }): string {
  const text = `${n.title} ${n.body ?? ""}`;
  switch (n.type) {
    case "purchase":
      return "/learner/purchases";
    case "event":
      return "/learner/events";
    case "achievement":
      return /certificate/i.test(text) ? "/learner/certificates" : "/learner/certificates?tab=badges";
    case "product":
      return "/learner/resources";
    case "support":
      return "/learner/help/requests";
    default:
      return /password|security/i.test(text) ? "/learner/settings/security" : "/learner/settings/profile";
  }
}

const CREATOR: Rule[] = [
  [/withdraw|payout/i, "/creator/wallet"],
  [/refund|order|sale|sold|bought/i, "/creator/wallet"],
  [/review/i, "/creator/reviews"],
  [/subscriber|dreamer/i, "/creator/subscribers"],
  [/coupon|discount|promo code/i, "/creator/coupons"],
  [/commission|rule/i, "/creator/commission-rules"],
  [/promotion/i, "/creator/affiliations"],
  [/affiliate|invitation/i, "/creator/affiliates"],
  [/landing page|lead/i, "/creator/landing-pages"],
  [/media|file|upload/i, "/creator/media-library"],
  [/storefront|banner|store photo|profile photo/i, "/creator/storefront"],
  [/certificate|badge/i, "/creator/badges"],
  [/booking|session|coaching/i, "/creator/bookings"],
  [/bin|restored|deleted/i, "/creator/courses"],
];
export const creatorNotificationLink = (text: string) => first(CREATOR, text, "/creator/courses");

const AFFILIATE: Rule[] = [
  [/terms/i, "/affiliate/dashboard"],
  [/referral link|link copied/i, "/affiliate/my-affiliations"],
  [/bank|payout|withdraw/i, "/affiliate/wallet"],
  [/verification/i, "/affiliate/settings/verification"],
  [/profile/i, "/affiliate/settings/profile"],
  [/commission|conversion|sale/i, "/affiliate/transactions"],
  [/referral|click/i, "/affiliate/referrals"],
];
export const affiliateNotificationLink = (text: string) => first(AFFILIATE, text, "/affiliate/dashboard");
