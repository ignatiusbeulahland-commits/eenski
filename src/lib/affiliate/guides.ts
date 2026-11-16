export type Guide = { slug: string; title: string; summary: string; minutes: number; topic: string; body: { h: string; p: string[] }[] };

/** Sample guide content written for this prototype (not yet official Enski documentation). */
export const guides: Guide[] = [
  { slug: "getting-started", topic: "Basics", minutes: 3, title: "Getting started as an Enski affiliate", summary: "Set up your account and make your first share in a few minutes.", body: [
    { h: "Accept the affiliate terms", p: ["Before your affiliate account is fully active, review and accept the Affiliate Terms and Conditions from your Overview page."] },
    { h: "Complete your profile", p: ["Add your phone number and location under Settings → Manage Profile, then add a bank account so payouts can reach you."] },
    { h: "Pick your first product", p: ["Head to the Market, choose a product your audience will value, and start promoting it to get your referral link."] },
  ]},
  { slug: "how-it-works", topic: "Basics", minutes: 4, title: "How affiliate marketing works on Enski", summary: "From a shared link to an earned commission, step by step.", body: [
    { h: "The short version", p: ["You share a unique referral link for a course or ebook. When someone buys through your link, the sale is attributed to you and you earn a commission set for that product."] },
    { h: "Clicks, referrals and conversions", p: ["A click is recorded when someone opens your link. A referral is a person who arrived through your link. A conversion is a referral who completed a purchase."] },
  ]},
  { slug: "finding-products", topic: "Market", minutes: 3, title: "How to find products to promote", summary: "Use search and categories to match products to your audience.", body: [
    { h: "Start with your audience", p: ["Think about what the people who follow you are trying to achieve. A career-focused audience may respond to LinkedIn or CV courses; creatives to design or podcasting."] },
    { h: "Use filters", p: ["Filter the Market by category and type, then open a product to read its full description before you promote it."] },
  ]},
  { slug: "referral-links", topic: "Links", minutes: 3, title: "Generating and sharing referral links", summary: "Where to find your links and how to share them well.", body: [
    { h: "Get your link", p: ["Promote a product from the Market. Its unique link appears on the product and in My Affiliations, ready to copy."] },
    { h: "Share with context", p: ["Links perform better when you explain why you recommend the product. Share in posts, newsletters, community groups and direct messages."] },
  ]},
  { slug: "commissions", topic: "Earnings", minutes: 2, title: "Understanding commissions", summary: "How commission is calculated and when it becomes available.", body: [
    { h: "Commission per product", p: ["Each product shows its commission rate. Courses usually pay 20% and eBooks 30%; some products carry their own rate between 15% and 30%. The estimate per sale is the rate applied to the full price."] },
    { h: "Pending vs available", p: ["New commissions start as pending while the purchase clears. Once cleared, they move to your available balance."] },
  ]},
  { slug: "tracking-referrals", topic: "Tracking", minutes: 2, title: "Tracking your referrals", summary: "Read your Performance and Referrals pages with confidence.", body: [
    { h: "Where to look", p: ["Performance shows clicks and conversions over time. Referrals lists each referral and their status."] },
  ]},
  { slug: "payouts", topic: "Earnings", minutes: 3, title: "Understanding payouts", summary: "Bank details, verification and how withdrawals work.", body: [
    { h: "Before your first payout", p: ["Add a bank account and complete verification. Payouts can only be requested from your available balance."] },
    { h: "Payout status", p: ["Requests move from processing to paid. Each one appears in your payout history with its reference."] },
  ]},
];
