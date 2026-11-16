# Roadmap — Batch 4: connected journeys, outcomes & animations (Nov 13 2026)

## Rules carried over
- Frontend-only, no disclaimers; facilitators inside Creator; no admin work; Charm artwork unchanged; ChatGPT course ₦5,000 everywhere

## Batch 10 — final QA (Nov 13 2026)
- [x] Link crawl: every internal link on every page resolves
- [x] Accessibility scan (names, labels, contrast, focus, targets)
- [x] Journeys: buy → purchases, lessons → certificate, beneficiary → withdraw, publish → status, badge → collection
- [x] Fix findings, tests, commit

## Batch 9 — visual consistency (Nov 13 2026)
- [x] Overflow/clipping sweep: public, auth, learner, creator, affiliate, support at phone/tablet/laptop
- [x] Static sweep: raw colours, z-index, off-system buttons
- [x] Fix findings (sentence case, hero labels, menus, support stats); tests; commit

## Batch 8 — app-wide microcopy (Nov 13 2026)
- [x] Sweep robotic/corporate/vague phrases, developer words, generic errors
- [x] Toasts: what happened + next step; errors say how to fix
- [x] Form labels, placeholders, helper text, validation
- [x] Empty/loading states that repeat or say nothing
- [x] Tests + commit

## Batch 7 — certificates, designer & badges (Nov 13 2026)
- [x] Audit learner certificates, designer, badges, badge management, verify (phone + desktop)
- [x] Learner certificate gallery/details/preview/name edit/download/share/credential/verify
- [x] Certificate designer: templates, orientation, branding, logo/signature, colours, type, borders, date, ID, QR, live preview, print/PDF
- [x] Badges: visuals per category, criteria, issuer/recipient/date, collection, details, share
- [x] Badge management: create/edit/preview/assign/issued/revoke with reason, reflected both sides
- [x] Certificate download/generate congratulations screen
- [x] Verification accuracy check
- [x] QA + tests + commit

## Batch 6 — learner course & learning experience (Nov 13 2026)
- [x] Audit course details, lesson player, progress, quiz, completion (phone + desktop)
- [x] Course details: overview, instructor, outcomes, curriculum, duration, requirements, previews, price, actions
- [x] Learning interface: content, media, curriculum nav, prev/next, complete, progress, resources, quiz, lesson states
- [x] Progress consistency: current lesson, completed modules, completion feedback
- [x] Assessments: questions, selection, submit, results, correct/incorrect, retry
- [x] Course completion screen: summary, certificate, next learning
- [x] QA + tests + commit

## Batch 5 — payments, banking, transactions & payouts (Nov 13 2026)
- [x] Audit financial screens (overview, beneficiaries, withdraw, transactions, checkout) on phone + desktop
- [x] Financial overview: balances, earnings, pending, summaries, empty/loading states
- [x] Beneficiaries: add (country, bank + icons, account number, account name, validation), edit, remove, select in withdrawal
- [x] Withdrawals: amount, currency, beneficiary, summary, review/confirm, processing, success/failure, history, details
- [x] Transactions: history, search/filters, details, status, refunds, amounts/dates/currencies
- [x] Checkout consistency: summaries, amounts, currencies, confirmation screens
- [x] QA + tests + commit

## Batch 4
- [x] Audit gaps (auth/onboarding/profile, learning + marketplace + checkout, payouts, creator publishing, certificates, badges, notifications)
- [x] Checkout: order summary → method → details → review → processing → result; pending/cancelled states; success/failure fields
- [x] Payouts (creator): sales from public storefronts now fill the wallet; failed withdrawal links to details + payout account
- [ ] Payouts (affiliate): blocked — needs the commission rate and how referral sales count (user decision)
- [x] Learning: lesson complete → progress → course completion → certificate available
- [x] Certificate download completion screen ("Congratulations! Your certificate is ready.")
- [x] Badges: award flow, learner badge details, revocation journey with reason + confirmation screen
- [x] Creator publishing: course / digital product / service publish confirmation, unpublish, delete confirm
- [x] Profile: save → confirmation; password change; notification preferences
- [x] Notifications: every type leads to its destination; read/unread, mark all, clear, empty state
- [x] QA: buy → learn → complete → certificate; storefront sale → creator wallet (desktop); tests; commit
- [x] QA on phone and tablet sizes, dark mode on new screens

## Earlier (done)
- [x] Batch 3: support centre, Charm shortcut, dashboards, bookings, support desk
- [x] Batch 2: auth, onboarding, names

## Mascot & affiliate promotion (Nov 13 2026)
- [ ] Charm new expressions for all 4 looks: blink, wink, smile/laugh, surprised (face-only, aligned), thumbs-up, clap, proud
- [ ] Charm expression engine: natural blinking, wink/laugh/clap/dance motions, reduced motion
- [ ] Contextual reactions: login wave, success wink, empty-state encourage, error concerned, progress thumbs-up
- [ ] Victory curtain: big theatrical one for course completion; small one for onboarding/setup steps
- [ ] Commission: rate by type + per-product rates (15–30%), estimated earnings
- [ ] Promote page redesign (hero, search/filters, product cards with commission)
- [ ] Promotion flow: details → generate link → copy screen (Charm reacts) → share (simulated) → success
- [ ] Promoted products: list with stable link, recopy, status, simulated stats
- [ ] Mobile/tablet/desktop QA, tests, commit
