import type { KbArticle } from "./types";

type Seed = Omit<KbArticle, "published" | "updatedAt">;

/**
 * Starter help articles Charm answers from. Support staff can edit, add or
 * unpublish them in the Support dashboard's knowledge base (saved on this device).
 */
const SEED: Seed[] = [
  // ——— Everyone ———
  {
    id: "what-is-enski",
    audience: "all",
    category: "Platform information",
    title: "What Enski is",
    keywords: ["what is enski", "what does enski do", "about enski", "enski", "what is this", "platform", "who are you", "what can i do here"],
    answer:
      "Enski is Africa's platform for dreamers. You can **learn** practical skills from creators, **create** and sell your own courses, eBooks and coaching, or **earn** by promoting creators' products as an affiliate.\nAre you here to learn, create or earn?",
    actions: [
      { label: "I want to learn", prompt: "I want to learn on Enski" },
      { label: "I want to create", prompt: "I want to sell my knowledge" },
      { label: "I want to earn", prompt: "How do I become an affiliate?" },
    ],
  },
  {
    id: "profiles",
    audience: "all",
    category: "Getting started",
    title: "Learner, Creator and Affiliate profiles",
    keywords: ["profile", "profiles", "learner creator affiliate", "difference", "which profile", "choose", "account type", "role", "which one"],
    answer:
      "Enski has three profiles:\n- **Learner**: buy and take courses, eBooks, coaching and events, and earn certificates.\n- **Creator**: build and sell your own products, track sales and get paid.\n- **Affiliate**: share creators' products with your referral link and earn commission.\nPick the one that fits what you want to do first; you can switch profiles from the top bar later.",
    actions: [
      { label: "Join as a learner", href: "/auth?s=register&as=learner" },
      { label: "Join as a creator", href: "/auth?s=register&as=creator" },
      { label: "Join as an affiliate", href: "/auth?s=register&as=affiliate" },
    ],
  },
  {
    id: "learn",
    audience: "public",
    category: "Getting started",
    title: "Learning on Enski",
    keywords: ["learn", "i want to learn", "courses", "take a course", "find a course", "skills", "study", "catalogue", "classes"],
    answer:
      "Great choice! Browse courses and eBooks from creators across Africa, then buy and start learning from your Learner dashboard.\n1. Explore the course marketplace or Dreamverse.\n2. Open a course to see what's inside and the price.\n3. Create a free Learner account to keep your purchases and progress in one place.",
    actions: [
      { label: "Browse courses", href: "/courses" },
      { label: "Explore Dreamverse", href: "/dreamverse" },
      { label: "Create a learner account", href: "/auth?s=register&as=learner" },
    ],
  },
  {
    id: "create",
    audience: "public",
    category: "Getting started",
    title: "Selling your knowledge",
    keywords: ["create", "sell", "i want to create", "sell my knowledge", "creator", "become a creator", "sell courses", "teach", "monetise", "monetize"],
    answer:
      "Enski gives creators everything to teach and sell: courses, eBooks, coaching, live trainings, a storefront, coupons and affiliates who promote for you.\nCreate a Creator account, add your first product and publish it when it's ready.",
    actions: [
      { label: "See creator features", href: "/features" },
      { label: "See pricing", href: "/pricing" },
      { label: "Join as a creator", href: "/auth?s=register&as=creator" },
    ],
  },
  {
    id: "affiliate-intro",
    audience: "public",
    category: "Getting started",
    title: "Earning as an affiliate",
    keywords: ["affiliate", "earn", "become an affiliate", "promote", "commission", "i want to earn", "make money", "referral"],
    answer:
      "As an Enski affiliate you pick creators' products to promote, share your own referral link, and earn commission on every completed, eligible purchase made through it.\nJoin as an Affiliate to browse the Market and get your first link.",
    actions: [
      { label: "Join as an affiliate", href: "/auth?s=register&as=affiliate" },
      { label: "Ambassador programmes", href: "/become-an-ambassador" },
    ],
  },
  {
    id: "register",
    audience: "all",
    category: "Registration",
    title: "Creating an account",
    keywords: ["register", "sign up", "signup", "create account", "create an account", "join", "get started", "new account", "how do i start"],
    answer:
      "Creating an account takes a minute:\n1. Open **Register**.\n2. Choose Learner, Creator or Affiliate.\n3. Add your full name, email and a strong password, then select **Create account**.\nYou'll land in your new dashboard straight away.",
    actions: [{ label: "Register now", href: "/auth?s=register" }],
  },
  {
    id: "login",
    audience: "all",
    category: "Account issues",
    title: "Logging in and passwords",
    keywords: ["log in", "login", "sign in", "can't log in", "cant login", "password", "forgot password", "reset password", "locked out"],
    answer:
      "To log in, open **Log in**, choose your profile and enter your email and password. If you've forgotten your password, select **Forgot password?** and we'll send a reset link to your email.\nIf you still can't get in, our support team can check your account with you.",
    actions: [
      { label: "Log in", href: "/auth" },
      { label: "Reset my password", href: "/auth?s=forgot" },
      { label: "Talk to a human", action: "human" },
    ],
  },
  {
    id: "pricing",
    audience: "all",
    category: "Platform information",
    title: "Pricing and fees",
    keywords: ["price", "pricing", "fees", "fee", "cost", "how much", "free", "plans", "subscription", "charge"],
    answer:
      "Joining Enski is free. Learners pay only for the products they buy, at the price the creator sets. Creators can start on the free plan and see every plan and fee on the Pricing page.",
    actions: [{ label: "See pricing", href: "/pricing" }],
  },
  {
    id: "dreamverse",
    audience: "all",
    category: "Platform information",
    title: "Dreamverse",
    keywords: ["dreamverse", "creators", "find creators", "marketplace", "shelves", "storefronts"],
    answer:
      "Dreamverse is where you discover Enski creators and everything they sell: courses, eBooks, coaching and more, all in one place.",
    actions: [{ label: "Open Dreamverse", href: "/dreamverse" }],
  },
  {
    id: "community",
    audience: "all",
    category: "Platform information",
    title: "Dreamers Trybe community",
    keywords: ["community", "dreamers trybe", "trybe", "tribe", "whatsapp", "group", "meet people", "network"],
    answer:
      "Dreamers Trybe is the Enski community: thousands of dreamers sharing wins, opportunities and support. Join from the Dreamers Trybe page.",
    actions: [{ label: "Join Dreamers Trybe", href: "/dreamers-trybe" }],
  },
  {
    id: "ambassador",
    audience: "all",
    category: "Platform information",
    title: "Ambassador programmes",
    keywords: ["ambassador", "campus", "nysc", "corper", "student", "campus ambassador", "initiative"],
    answer:
      "Enski runs two ambassador programmes: the **Dreamers Campus Initiative** for students and the **Enski NYSC Initiative** for corps members. Both help you grow, lead and earn.",
    actions: [
      { label: "Campus programme", href: "/become-an-ambassador/campus" },
      { label: "NYSC programme", href: "/become-an-ambassador/nysc" },
    ],
  },
  {
    id: "blog",
    audience: "all",
    category: "Platform information",
    title: "Blog and guides",
    keywords: ["blog", "articles", "read", "stories", "write for enski", "guides", "tips"],
    answer: "The Enski blog has guides, stories and tips for learners and creators. You can also pitch your own article.",
    actions: [
      { label: "Read the blog", href: "/blog" },
      { label: "Write for us", href: "/blog/write" },
    ],
  },
  {
    id: "faq",
    audience: "all",
    category: "General enquiries",
    title: "Help Center",
    keywords: ["help center", "help centre", "faq", "faqs", "questions", "support articles"],
    answer: "The Help Center has answers to the most common questions, grouped by topic and searchable.",
    actions: [{ label: "Open the Help Center", href: "/faq" }],
  },
  {
    id: "buying",
    audience: "all",
    category: "Purchases and payments",
    title: "Buying a course or eBook",
    keywords: ["buy", "purchase", "checkout", "pay", "how do i pay", "payment", "enroll", "enrol", "cart"],
    answer:
      "Open the product, choose **Buy** or **Enroll**, and pay in the checkout. Once payment goes through, the product appears in your Learner dashboard under **My purchases** and **Resources**.",
    actions: [
      { label: "Browse courses", href: "/courses" },
      { label: "My purchases", href: "/learner/purchases" },
    ],
  },
  {
    id: "payment-problem",
    audience: "all",
    category: "Purchases and payments",
    title: "A payment went wrong",
    keywords: ["payment failed", "charged twice", "double charge", "debited", "refund", "money", "charged but", "transaction failed", "didn't go through"],
    answer:
      "Sorry about that. Payment problems need a person to look at your transaction, so the quickest fix is our support team.\nIf your card was charged but nothing appeared in **My purchases**, keep your receipt or bank alert handy.",
    actions: [
      { label: "Talk to a human", action: "human" },
      { label: "Leave a message", action: "ticket" },
    ],
  },
  {
    id: "contact",
    audience: "all",
    category: "General enquiries",
    title: "Contacting support",
    keywords: ["contact", "support", "help me", "email support", "phone", "reach you", "customer care"],
    answer:
      "You can talk to our support team right here: select **Talk to a human**. If nobody's available, you can leave a message and we'll reply as soon as possible.",
    actions: [{ label: "Talk to a human", action: "human" }],
  },
  {
    id: "theme",
    audience: "all",
    category: "General enquiries",
    title: "Dark mode",
    keywords: ["dark mode", "light mode", "theme", "night mode"],
    answer: "Use the sun and moon switch in the top bar to change between light and dark mode. Your choice is remembered on this device.",
    actions: [],
  },
  {
    id: "offline",
    audience: "all",
    category: "General enquiries",
    title: "Slow or no connection",
    keywords: ["offline", "no internet", "slow", "not loading", "page won't load", "connection", "network"],
    answer:
      "If a page won't load, check your connection. Enski retries on its own when you're back online and pages you've already opened keep working.",
    actions: [],
  },

  // ——— Learners ———
  {
    id: "learner-access",
    audience: "learner",
    category: "Course and resource access",
    title: "Opening something you bought",
    keywords: ["access", "purchased", "bought", "open my course", "where is my course", "resource", "can't find", "my course", "ebook", "download", "watch", "start learning"],
    answer:
      "Everything you buy lives in your Learner dashboard:\n1. Open **Resources** to start a course or read an eBook.\n2. Or open **My purchases** and select the item for its details and receipt.\nIf it still won't open, refresh the page and check your connection.",
    actions: [
      { label: "Go to Resources", href: "/learner/resources" },
      { label: "My purchases", href: "/learner/purchases" },
      { label: "It still won't open", prompt: "My purchased course still won't open" },
    ],
  },
  {
    id: "learner-access-trouble",
    audience: "learner",
    category: "Course and resource access",
    title: "A purchase won't open",
    keywords: ["still won't open", "won't open", "not opening", "blank", "error", "not working", "missing purchase", "not showing", "disappeared"],
    answer:
      "Let's troubleshoot:\n1. Check you're signed in with the email you paid with.\n2. Look under **Resources**, including hidden items.\n3. Refresh the page.\nIf it's still missing, our support team can check your purchase.",
    actions: [
      { label: "Go to Resources", href: "/learner/resources" },
      { label: "Talk to a human", action: "human" },
    ],
  },
  {
    id: "learner-events",
    audience: "learner",
    category: "Events",
    title: "Your events",
    keywords: ["event", "events", "webinar", "live class", "session", "calendar", "upcoming", "join event"],
    answer: "Your upcoming events are under **Events** in your Learner dashboard, with dates, a calendar view and the join link when it's time.",
    actions: [{ label: "Go to Events", href: "/learner/events" }],
  },
  {
    id: "learner-certificates",
    audience: "learner",
    category: "Certificates",
    title: "Certificates and badges",
    keywords: ["certificate", "certificates", "badge", "badges", "achievement", "download certificate", "share certificate", "verify"],
    answer:
      "Finish a course to earn its certificate. Open **Certificates** to view, download (PNG or PDF) or share it. Anyone can check it on the Verify page.",
    actions: [
      { label: "My certificates", href: "/learner/certificates" },
      { label: "Verify a certificate", href: "/verify" },
    ],
  },
  {
    id: "learner-progress",
    audience: "learner",
    category: "Course and resource access",
    title: "Tracking your progress",
    keywords: ["progress", "continue", "where i stopped", "resume", "completed", "track learning"],
    answer: "Your dashboard home shows what you're learning and how far you've got. Open **Resources** and pick up where you left off.",
    actions: [
      { label: "My dashboard", href: "/learner/dashboard" },
      { label: "Go to Resources", href: "/learner/resources" },
    ],
  },
  {
    id: "learner-wishlist",
    audience: "learner",
    category: "Purchases and payments",
    title: "Saved items and wishlist",
    keywords: ["wishlist", "saved", "save for later", "favourites", "favorites", "heart"],
    answer: "Tap the heart on any product to save it. Your saved items are in **Wishlist**, ready to buy whenever you are.",
    actions: [{ label: "Open my wishlist", href: "/learner/wishlist" }],
  },
  {
    id: "learner-settings",
    audience: "learner",
    category: "Account issues",
    title: "Profile and account settings",
    keywords: ["settings", "profile", "change name", "photo", "notifications", "currency", "security", "change password", "account settings"],
    answer: "Open **Settings** to update your profile, notifications, currency and security.",
    actions: [{ label: "Open settings", href: "/learner/settings" }],
  },

  // ——— Creators ———
  {
    id: "creator-create",
    audience: "creator",
    category: "Product setup and publishing",
    title: "Creating a product",
    keywords: ["create", "new product", "add product", "create course", "new course", "ebook", "coaching", "upload", "make a course", "add a course"],
    answer:
      "To create a product:\n1. Open **Products** (or Courses, eBooks, Coaching) in your Creator dashboard.\n2. Select **Create** and pick the product type.\n3. Add the title, description, price and cover, then your content.\nIt saves as a draft until you publish.",
    actions: [
      { label: "Go to Products", href: "/creator/products" },
      { label: "How do I publish?", prompt: "How do I publish my product?" },
    ],
  },
  {
    id: "creator-publish",
    audience: "creator",
    category: "Product setup and publishing",
    title: "Publishing checklist",
    keywords: ["publish", "go live", "make available", "launch", "draft", "checklist", "unpublished", "visible"],
    answer:
      "Your product is almost ready! Before you publish, check:\n- A clear title and description\n- A price (or free) and currency\n- A cover image\n- Your content added (lessons, files or sessions)\nThen open the product and select **Publish**. It appears on your storefront straight away.",
    actions: [
      { label: "Go to Products", href: "/creator/products" },
      { label: "View my storefront", href: "/creator/storefront" },
    ],
  },
  {
    id: "creator-orders",
    audience: "creator",
    category: "Sales and orders",
    title: "Orders and customers",
    keywords: ["orders", "order", "customers", "who bought", "buyers", "students", "subscribers"],
    answer: "Every purchase shows in **Orders**, and the people who bought from you are in **Customers**.",
    actions: [
      { label: "Orders", href: "/creator/orders" },
      { label: "Customers", href: "/creator/customers" },
    ],
  },
  {
    id: "creator-sales",
    audience: "creator",
    category: "Sales and orders",
    title: "Sales and analytics",
    keywords: ["sales", "analytics", "revenue", "performance", "how much have i made", "stats", "views", "conversion"],
    answer: "**Sales** shows what you've sold over time, and **Analytics** shows views, conversions and top products.",
    actions: [
      { label: "Sales", href: "/creator/sales" },
      { label: "Analytics", href: "/creator/analytics" },
    ],
  },
  {
    id: "creator-wallet",
    audience: "creator",
    category: "Wallet and payouts",
    title: "Wallet and payouts",
    keywords: ["wallet", "payout", "payouts", "withdraw", "withdrawal", "bank account", "get paid", "balance", "earnings"],
    answer:
      "Your earnings collect in **Wallet**. To get paid, add a bank account in Settings, then request a payout from **Payouts**.\nFor a missing or delayed payout, our support team will check it with you.",
    actions: [
      { label: "Wallet", href: "/creator/wallet" },
      { label: "Payouts", href: "/creator/payouts" },
      { label: "Talk to a human", action: "human" },
    ],
  },
  {
    id: "creator-promo",
    audience: "creator",
    category: "Sales and orders",
    title: "Promotion tools",
    keywords: ["promote", "promotion", "coupon", "discount", "marketing", "landing page", "affiliates for my product", "get more sales"],
    answer:
      "Grow your sales with **Coupons**, **Promotions**, **Landing pages** and **Affiliates** who promote your products for a commission you set.",
    actions: [
      { label: "Coupons", href: "/creator/coupons" },
      { label: "Affiliates", href: "/creator/affiliates" },
      { label: "Landing pages", href: "/creator/landing-pages" },
    ],
  },
  {
    id: "creator-milestones",
    audience: "creator",
    category: "Product setup and publishing",
    title: "Milestones and guides",
    keywords: ["milestone", "milestones", "achievements", "guide", "guides", "tutorial", "how to", "learn the dashboard"],
    answer: "**Milestones** tracks your creator wins, and **Guides** walks you through each dashboard tool step by step.",
    actions: [
      { label: "Milestones", href: "/creator/milestones" },
      { label: "Guides", href: "/creator/guides" },
    ],
  },
  {
    id: "creator-verification",
    audience: "creator",
    category: "Verification",
    title: "Identity verification",
    keywords: ["verification", "verify", "verify my identity", "kyc", "id", "identity", "verified badge"],
    answer:
      "Open **Settings → Verification** to verify your identity. Verification problems need a person, so our support team can help if you get stuck.",
    actions: [
      { label: "Verification", href: "/creator/settings/verification" },
      { label: "Talk to a human", action: "human" },
    ],
  },
  {
    id: "creator-settings",
    audience: "creator",
    category: "Account issues",
    title: "Creator settings",
    keywords: ["settings", "profile", "account", "notifications", "currency", "password", "security", "storefront name"],
    answer: "Open **Settings** to manage your profile, storefront details, bank accounts, notifications and security.",
    actions: [{ label: "Open settings", href: "/creator/settings" }],
  },

  // ——— Affiliates ———
  {
    id: "affiliate-find",
    audience: "affiliate",
    category: "Affiliations",
    title: "Finding products to promote",
    keywords: ["find products", "what to promote", "market", "products to promote", "browse products", "best products"],
    answer: "Open the **Market** to browse products you can promote. Open one to see its commission, then select **Promote** to add it to your affiliations.",
    actions: [{ label: "Open the Market", href: "/affiliate/market" }],
  },
  {
    id: "affiliate-links",
    audience: "affiliate",
    category: "Referral tracking",
    title: "Your referral links",
    keywords: ["referral link", "my link", "share link", "copy link", "link", "where is my link", "share"],
    answer:
      "Your referral link is ready in **My Affiliations**: copy it and share it on WhatsApp, Instagram, Twitter or your own channels. Sales through your link are tracked to you.",
    actions: [
      { label: "My Affiliations", href: "/affiliate/my-affiliations" },
      { label: "Best ways to share", prompt: "What's the best way to share my link?" },
    ],
  },
  {
    id: "affiliate-performance",
    audience: "affiliate",
    category: "Commissions",
    title: "Tracking commissions and performance",
    keywords: ["commission", "commissions", "track", "tracking", "performance", "how much have i earned", "earned", "clicks", "conversions", "referrals"],
    answer:
      "Track how your links are doing:\n- **Performance** shows clicks, sales and conversion.\n- **Referrals** lists the purchases made through your links.\n- **Transactions** shows each commission as it's earned.",
    actions: [
      { label: "Performance", href: "/affiliate/performance" },
      { label: "Referrals", href: "/affiliate/referrals" },
      { label: "Transactions", href: "/affiliate/transactions" },
    ],
  },
  {
    id: "affiliate-wallet",
    audience: "affiliate",
    category: "Wallet and payouts",
    title: "Affiliate wallet and payouts",
    keywords: ["wallet", "payout", "payouts", "withdraw", "get paid", "bank", "balance"],
    answer:
      "Your commissions collect in **Wallet**. Add a bank account in Settings, then request a payout from **Payouts**. For a missing payout, our support team will check it with you.",
    actions: [
      { label: "Wallet", href: "/affiliate/wallet" },
      { label: "Payouts", href: "/affiliate/payouts" },
      { label: "Talk to a human", action: "human" },
    ],
  },
  {
    id: "affiliate-tips",
    audience: "affiliate",
    category: "Affiliations",
    title: "Promotion tips",
    keywords: ["best way to share", "tips", "promote better", "get more sales", "marketing", "advice", "how to promote"],
    answer:
      "A few ideas that work well:\n- Share why *you* like the product, not just the link.\n- Post where your audience already is (WhatsApp status, Instagram stories).\n- Share a quick result or review from the product.\nNever spam people or make promises the creator doesn't.",
    actions: [{ label: "Affiliate guides", href: "/affiliate/guides" }],
  },
  {
    id: "affiliate-settings",
    audience: "affiliate",
    category: "Account issues",
    title: "Affiliate settings",
    keywords: ["settings", "profile", "account", "notifications", "bank account", "verification", "password"],
    answer: "Open **Settings** to update your profile, bank account, verification, notifications and security.",
    actions: [{ label: "Open settings", href: "/affiliate/settings" }],
  },
];

export function seedArticles(now = Date.now()): KbArticle[] {
  return SEED.map((a) => ({ ...a, published: true, updatedAt: now }));
}

export const SEED_ARTICLE_COUNT = SEED.length;
