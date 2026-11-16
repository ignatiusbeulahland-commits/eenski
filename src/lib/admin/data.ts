/**
 * Read-only views over everything saved on this device, for the Enski admin console.
 * Pure functions take raw storage entries so they can be tested; `readDevice()` gathers them in the browser.
 * Nothing here invents records: an empty device shows empty lists.
 */
export type Role = "learner" | "creator" | "affiliate";
export const ROLE_KEYS: Record<Role, string> = {
  learner: "enski-learner-prototype-v1",
  creator: "enski-creator-prototype-v2",
  affiliate: "enski-affiliate-prototype-v1",
};
export const NAMES_KEY = "enski:demo:names";
export const VISITS_KEY = "enski:demo:visits";
export const SHOP_KEY = "enski:shop:v1";

export type Entry = { key: string; value: string };
type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const arr = (v: unknown): Obj[] => (Array.isArray(v) ? v.map(obj) : []);
const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
function parse(value: string | undefined): Obj {
  if (!value) return {};
  try { return obj(JSON.parse(value)); } catch { return {}; }
}

export type AdminProduct = { id: string; kind: string; title: string; price: number; status: string; createdAt: string; ownerEmail: string; ownerName: string };
export type AdminOrder = { id: string; ref: string; date: string; amount: number; currency: string; status: string; title: string; party: string; source: "creator sale" | "learner purchase" | "checkout" };
export type AdminPayout = { id: string; ref: string; date: string; amount: number; fee: number; currency: string; status: string; to: string; ownerEmail: string; ownerName: string };
export type AdminAccount = {
  email: string;
  name: string;
  roles: Role[];
  signIns: number;
  learner?: { purchases: number; certificates: number; badges: number; support: number } | undefined;
  creator?: { products: number; published: number; orders: number; payouts: number; verified: boolean } | undefined;
  affiliate?: { programmes: number } | undefined;
};
export type DeviceData = {
  accounts: AdminAccount[];
  products: AdminProduct[];
  orders: AdminOrder[];
  payouts: AdminPayout[];
};

const emailOf = (key: string, base: string) => (key.startsWith(`${base}:`) ? key.slice(base.length + 1).trim().toLowerCase() : "");
const creatorName = (s: Obj, fallback: string) => `${str(obj(s["profile"])["firstName"])} ${str(obj(s["profile"])["lastName"])}`.trim() || fallback;

/** Builds the admin view from raw storage entries (one per localStorage key). */
export function buildDeviceData(entries: Entry[]): DeviceData {
  const byKey = new Map(entries.map((e) => [e.key, e.value]));
  const names = obj(parse(byKey.get(NAMES_KEY)));
  const visits = obj(parse(byKey.get(VISITS_KEY)));
  const accounts = new Map<string, AdminAccount>();
  const account = (email: string): AdminAccount => {
    let a = accounts.get(email);
    if (!a) {
      a = { email, name: str(names[email]) || email.split("@")[0] || email, roles: [], signIns: num(visits[email]) };
      accounts.set(email, a);
    }
    return a;
  };
  const products: AdminProduct[] = [];
  const orders: AdminOrder[] = [];
  const payouts: AdminPayout[] = [];

  for (const { key, value } of entries) {
    for (const role of Object.keys(ROLE_KEYS) as Role[]) {
      const email = emailOf(key, ROLE_KEYS[role]);
      if (!email) continue;
      const s = parse(value);
      const a = account(email);
      if (!a.roles.includes(role)) a.roles.push(role);
      if (role === "learner") {
        const p = obj(s["profile"]);
        if (str(p["fullName"])) a.name = str(p["fullName"]);
        const purchases = arr(s["purchases"]);
        a.learner = { purchases: purchases.length, certificates: arr(s["certificates"]).length, badges: Object.keys(obj(s["badges"])).length, support: arr(s["support"]).length };
        for (const pu of purchases) {
          const items = arr(pu["items"]);
          orders.push({ id: `l-${str(pu["id"])}`, ref: str(pu["orderNumber"], str(pu["id"])), date: str(pu["date"]), amount: num(pu["total"]), currency: "NGN", status: str(pu["status"], "paid"), title: items.map((i) => str(i["title"])).filter(Boolean).join(", ") || "Purchase", party: a.name, source: "learner purchase" });
        }
      }
      if (role === "creator") {
        const name = creatorName(s, a.name);
        a.name = name || a.name;
        const items = arr(s["items"]).filter((i) => !i["binnedAt"]);
        const cOrders = arr(s["orders"]);
        const cPayouts = arr(s["payouts"]);
        a.creator = { products: items.length, published: items.filter((i) => i["status"] === "published").length, orders: cOrders.length, payouts: cPayouts.length, verified: s["verification"] === "submitted" };
        for (const i of items) products.push({ id: str(i["id"]), kind: str(i["kind"]), title: str(i["title"], "Untitled"), price: num(i["price"]), status: str(i["status"], "draft"), createdAt: str(i["createdAt"]), ownerEmail: email, ownerName: name });
        for (const o of cOrders) orders.push({ id: `c-${email}-${str(o["id"])}`, ref: `ORD-${str(o["id"]).slice(-6).toUpperCase()}`, date: str(o["date"]), amount: num(o["amount"]), currency: str(o["currency"], "NGN"), status: str(o["status"], "paid"), title: str(o["itemTitle"], "Sale"), party: name, source: "creator sale" });
        for (const p of cPayouts) {
          const status = str(p["status"], "processing");
          payouts.push({ id: str(p["id"]), ref: str(p["reference"], `PAY-${str(p["id"]).slice(-6).toUpperCase()}`), date: str(p["date"]), amount: num(p["amount"]), fee: num(p["fee"]), currency: str(p["currency"], "NGN"), status: status === "simulated" ? "processing" : status, to: str(p["recipient"], `•••• ${str(p["last4"])}`), ownerEmail: email, ownerName: name });
        }
      }
      if (role === "affiliate") {
        const p = obj(s["profile"]);
        const n = `${str(p["firstName"])} ${str(p["lastName"])}`.trim();
        if (n) a.name = n;
        a.affiliate = { programmes: arr(s["affiliations"]).length };
      }
    }
  }

  const shop = parse(byKey.get(SHOP_KEY));
  for (const pay of arr(shop["payments"])) {
    const totals = arr(pay["totals"]);
    const buyer = obj(pay["buyer"]);
    orders.push({
      id: `p-${str(pay["reference"])}`, ref: str(pay["reference"]), date: str(pay["createdAt"]), amount: num(totals[0]?.["total"]), currency: str(totals[0]?.["currency"], "NGN"),
      status: str(pay["status"], "processing"), title: arr(pay["items"]).map((i) => str(i["title"])).filter(Boolean).join(", ") || "Checkout",
      party: str(buyer["name"]) || str(buyer["email"]) || "Guest", source: "checkout",
    });
  }

  const byDate = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date);
  // People who signed up or signed in but haven't opened a dashboard yet still have an account.
  for (const email of new Set([...Object.keys(names), ...Object.keys(visits)])) if (email.includes("@")) account(email.trim().toLowerCase());

  return {
    accounts: [...accounts.values()].sort((a, b) => a.name.localeCompare(b.name)),
    products: products.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    orders: orders.sort(byDate),
    payouts: payouts.sort(byDate),
  };
}

/** Every localStorage entry (browser only). */
export function deviceEntries(): Entry[] {
  const out: Entry[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) out.push({ key, value: localStorage.getItem(key) ?? "" });
    }
  } catch { /* storage blocked: nothing to show */ }
  return out;
}
