import type { CreatorState, Promotion } from "./rules";

/** Coupon schedules are set on the Lagos clock (GMT+1, no daylight saving). */
export const COUPON_TZ = "Africa/Lagos";
export const COUPON_TZ_LABEL = "Africa/Lagos (GMT+1)";

/** Instant (ms) for a Lagos date + HH:MM time. */
export function lagosInstant(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return NaN;
  return Date.parse(`${date}T${time}:00+01:00`);
}
export const couponStart = (p: Pick<Promotion, "start" | "startTime">) => lagosInstant(p.start, p.startTime || "00:00");
export const couponEnd = (p: Pick<Promotion, "end" | "endTime">) => lagosInstant(p.end, p.endTime || "23:59");

export type CouponField = "name" | "code" | "discount" | "itemId" | "usageLimit" | "start" | "end";

/** Every problem with a coupon, keyed by field, in form order. */
export function promotionProblems(p: Promotion, state: Pick<CreatorState, "items" | "promotions">): Partial<Record<CouponField, string>> {
  const e: Partial<Record<CouponField, string>> = {};
  if (!p.code.trim()) e.code = "Add a code name.";
  else if (!/^[A-Z0-9_-]{3,40}$/.test(p.code)) e.code = "Use 3–40 letters, numbers, hyphens or underscores.";
  else if (state.promotions.some((i) => i.id !== p.id && i.code.toUpperCase() === p.code.toUpperCase())) e.code = "This coupon code is already in use.";
  if (!Number.isFinite(p.discount) || p.discount <= 0) e.discount = "Enter a discount above zero.";
  else if (p.discountType !== "fixed" && (p.discount < 1 || p.discount > 100)) e.discount = "Percentage must be between 1 and 100.";
  else if (p.discountType === "fixed") {
    const item = state.items.find((i) => i.id === p.itemId);
    if (item && p.discount >= item.price) e.discount = "A fixed discount must be less than the product price.";
  }
  if (p.itemId && !state.items.some((i) => i.id === p.itemId && i.status !== "archived")) e.itemId = "Choose an available product.";
  if (p.usageLimit !== undefined && (!Number.isInteger(p.usageLimit) || p.usageLimit < 1)) e.usageLimit = "Usage limit must be a whole number of at least 1.";
  const s = couponStart(p), en = couponEnd(p);
  if (!Number.isFinite(s)) e.start = "Choose a valid start date and time.";
  if (!Number.isFinite(en)) e.end = "Choose an end date and time.";
  else if (Number.isFinite(s) && en <= s) e.end = "End must be after the start.";
  return e;
}

export type CouponPhase = "active" | "scheduled" | "expired" | "paused" | "draft" | "used up";
/** Where a coupon stands right now. Only "active" counts towards the Active tab. */
export function couponPhase(p: Promotion, uses: number, now = Date.now()): CouponPhase {
  if (p.status === "draft") return "draft";
  if (p.status === "paused") return "paused";
  if (p.usageLimit !== undefined && uses >= p.usageLimit) return "used up";
  if (now > couponEnd(p)) return "expired";
  if (now < couponStart(p)) return "scheduled";
  return "active";
}

export const discountLabel = (p: Pick<Promotion, "discount" | "discountType">) =>
  p.discountType === "fixed" ? `₦${p.discount.toLocaleString("en-NG")} off` : `${p.discount}% off`;
