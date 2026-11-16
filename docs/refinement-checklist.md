# Enski refinement checklist — Batch 1 audit (Nov 13 2026)

Source of truth: the Enski brand guide and the current app. This file records what to keep, the design
foundation, and the work queued for Batches 2–5. Tick items as later batches finish them.

## 1. What exists (keep it)

| Area | Routes | Keep |
| --- | --- | --- |
| Public site | `/`, `/courses`, `/dreamverse`, `/creators/$slug`, `/about`, `/pricing`, `/blog`, `/features`, `/community`, `/faq`, `/become-an-ambassador` (+ campus, nysc), `/dreamers-trybe`, `/wishlist`, `/verify` | Header with dropdowns, footer, hero people slides, scroll motion (`Reveal`, `RiseWords`, `CountUp`), two-per-row shop grid, newsletter, price picker |
| Sign-in | `/auth` (`?s=register|forgot`, `?as=creator|affiliate`), support staff log in | One Full name field, role picker, greetings, password rules |
| Learner dashboard | `/learner/*` (dashboard, resources, events, purchases, cart, wishlist, certificates, guides, help, settings) | Hero card, stat tiles, certificate studio, badges, "Name & personalisation" |
| Creator dashboard | `/creator/*` (products by type, storefront, landing pages, customers, orders, coupons, affiliates, wallet/payouts, badges & certificates, universe/milestones, settings) | Guided product create, media library, bin, certificate branding, payout bank picker |
| Affiliate dashboard | `/affiliate/*` (dashboard, market, referrals, performance, wallet, payouts, settings) | Milestones, market, payout flow |
| Support desk | `/support/*` (overview, live chat, tickets, conversations, knowledge base, settings) | Queue, ticket details, internal notes, cross-tab live chat |
| Charm | floating widget on every page except `/support` | Four looks, look picker, threads, hand-off to support |
| Shared | checkout sheet, cart/wishlist/orders panel, theme toggle, splash, offline + slow-page states | One checkout for every buy button |

Not in the app yet: a **Facilitator** dashboard and an **Admin** dashboard (no such roles exist). Decide in Batch 2
whether facilitators are a creator sub-role and what admins manage (issuer permissions, correction requests,
badge standards).

## 2. Demo language (done in Batch 1)

Removed from everything visitors see: the "Demo prototype: any email and password…" note, demo/prototype/simulated
chips and notes in checkout, orders, reviews, newsletter, blog submission, ambassador and Dreamers Trybe forms,
Charm tickets and live chat, the support desk banner, "Demo"/"Sample" tags, "(demo)" stats, and creator test
tools (now "Add an order", "Add a buyer's review", "Mark next lesson done", "Record quiz score", "Mark as
accepted", "Add a sign-up", "Preview milestones"). Starter profiles are "Enski Learner/Creator/Affiliate" with
reserved `example.com` emails. Copy stays neutral: it never claims an email was sent or money was charged.

Still worth a second look (kept on purpose, not demo language):
- [x] Learner checkout "Payment outcome" (Successful / Declined) choice — removed; the result follows the payment, declines only via standard test card numbers. Full checkout refinement in a later batch.
- [ ] Unlisted creator previews are labelled "Preview profile" / "Preview listing" so they don't read as real partnerships.
- [ ] "Saved on this device" lines on cart, wishlist and support pages — fine as feature copy; keep them short.

## 3. Design system audit

**Solid already:** brand colours are oklch tokens (cobalt, sky, lime, midnight, ink, soft, line, success,
warning, destructive) with light/dark values; no hex or off-palette colour classes in pages (only `bg-black/80`
overlays inside base UI parts); Plus Jakarta Sans self-hosted; pill buttons through `Button` variants;
shadows mostly use `shadow-float`, `shadow-card`, `shadow-soft`, `shadow-lift`, `shadow-chip`.

**Inconsistencies found:**
- Corners: ~20 one-off sizes (`rounded-[14px]` ×107, `[24px]` ×52, `[18px]`, `[16px]`, `[12px]`, `[32px]`, `[20px]`, `[28px]`, `[10px]`, `[22px]`, `[48px]`…) beside the scale. Canonical mapping (base radius 16px): 12 → `rounded-sm`, 14 → `rounded-md` / `rounded-field`, 16 → `rounded-lg`, 20 → `rounded-xl`, 24 → `rounded-2xl` / `rounded-card`, 28 → `rounded-3xl`, 32 → `rounded-4xl`, 8 → `rounded-tag`. Migrate page by page; imported pages (`data-skin`) remap these, so check them visually.
- Type: three headline families (`text-display`/`text-h2`/`eyebrow` on the homepage, `type-*` on Features/Pricing, `dv-*` on Dreamverse) plus many fixed sizes (`text-[13px]` ×222, `[15px]` ×145, `[11px]` ×133, `[17px]` ×60). Rule for new work: headlines use `text-display`/`text-h2`/`eyebrow` (site) or the dashboard scale; body sizes 13/15/17 only; 10–11px only for chips.
- Widths: `container-page` (1240px) and `max-w-[1200px]` (×84) both exist. New sections use `container-page`.
- Section spacing: mostly `py-20 md:py-28`, with `py-16 lg:py-24` and others mixed in.
- Shadows: some plain `shadow`, `shadow-sm`, `shadow-lg`, `shadow-xl` (from base UI parts) next to brand shadows.
- Three button sets (`ui`, `features`, `dreamverse`, plus `dashboard-ui`) — intentional for imported pages; don't add a fourth.
- Stacking: floating parts used ad-hoc z-index values (40–200). **Fixed in Batch 1** with named layers.

**Foundation added in Batch 1:** stacking-layer tokens in `src/styles.css` (`--z-sticky`, `--z-float`,
`--z-overlay`, `--z-float-top`, `--z-skip`, `--z-picker`, `--z-immersive`, `--z-takeover`, `--z-status`,
`--z-offline`, `--z-progress`, `--z-splash`), used as `z-(--z-float)` by Charm, sticky bars, splash, offline and
progress states. Order: sticky bars < Charm < dialogs < Charm phone panel < skip links < look picker < full-screen flows < status chips < offline < progress < splash.

## 4. Refinement checklist for Batches 2–5

### UX microcopy
- [ ] Empty states: give every empty list one next step (learner purchases, creator orders, affiliate referrals, support queues).
- [x] Forgot password: success copy is neutral; add a "Back to log in" button inside the message.
- [ ] Error copy: unify "Your browser blocked saving…" messages into one friendly pattern.
- [ ] Support desk headings: some descriptions still mention "this device"; tighten.

### Dashboards
- [ ] Creator dashboard uses far more motion and richer cards than Learner and Affiliate; bring the other two up to the same patterns.
- [x] Creator and Affiliate settings still use first/last name boxes; learner uses one Full name. Align. (Batch 2: shared name cards in every role)
- [x] Facilitator and Admin dashboards: decided (Nov 13) — facilitators are creators, no separate role or dashboard; admin console exists at /admin and further admin work is paused until the user says so.
- [ ] Greeting card and stat tiles differ between the three dashboards; share one hero + tile pattern.

### Support interface (basic today)
- [ ] Overview is a plain stat grid ("465 min" average reads oddly); add trend, SLA colouring and a friendlier time format.
- [ ] Live chat: canned replies, typing indicator, customer context side panel.
- [ ] Tickets: filters as chips, bulk actions, clearer priority colours.
- [ ] Support desk has no light/dark switch or Enski motion yet.

### Mascot (Charm) placement
- [ ] Charm only appears as the floating launcher; use poses in empty states, the auth page, 404/offline screens and onboarding.
- [x] On phones the launcher bubble and sign-in toast stack on the dashboard's first screen.

### Floating shortcut visibility
- [x] On `/auth` (phone) the Charm launcher covers the password "Show" button.
- [ ] Check the launcher against bottom sheets, the certificate studio bar and the checkout sheet on phones.
- [ ] Toasts and the Charm bubble overlap at the bottom right; offset one of them.

### Missing interactions
- [ ] Dashboard search (top bar) — confirm results cover every section.
- [ ] Notifications: mark one as read, deep-link to the item.
- [ ] Support desk: keyboard shortcuts for accept/close.

### Animation opportunities
- [ ] Learner/Affiliate dashboards: stat `CountUp`, card reveal on scroll, progress bar fill.
- [x] Badge earned and certificate issued moments: a short celebration (reduced-motion safe).
- [ ] Support desk: new-chat arrival pulse.

### Responsive
- [ ] All main pages and dashboards checked at 390px in Batch 1: no sideways scrolling found.
- [ ] `/courses` logs a hydration mismatch warning in the console; find the server/client difference.
- [ ] Re-check data tables (creator orders, support tickets) at 360px.
