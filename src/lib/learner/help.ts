export type LearnerGuide = { id: string; title: string; category: "Getting started" | "Learning" | "Shopping" | "Account"; minutes: number; summary: string; steps: { title: string; body: string; to?: string }[] };
export const guideCategories = ["Getting started", "Learning", "Shopping", "Account"] as const;
export const learnerGuides: LearnerGuide[] = [
  { id: "getting-started", title: "Getting started with Enski", category: "Getting started", minutes: 3, summary: "Set up your profile and find your way around your learner dashboard.", steps: [
    { title: "Complete your profile", body: "Add your name, a display name, email and a short bio so creators know who they're teaching.", to: "/learner/settings/profile" },
    { title: "Explore your overview", body: "Your overview gathers upcoming events, recent resources, saved items and achievements in one place.", to: "/learner/dashboard" },
    { title: "Turn on the notifications you want", body: "Choose which reminders and updates you'd like to receive.", to: "/learner/settings/notifications" },
  ] },
  { id: "discover-events", title: "How to discover events", category: "Learning", minutes: 2, summary: "Find live sessions and meetups, then save your seat.", steps: [
    { title: "Browse events", body: "Open Events to see featured, upcoming and past events. Filter by category, format and price.", to: "/learner/events" },
    { title: "Open an event", body: "Each event page shows the date, time, venue or online details, the host and the agenda." },
    { title: "Register", body: "Free events register instantly. Paid events add a ticket to your cart for checkout." },
    { title: "Find your registrations", body: "My registered events lists everything you've signed up for." },
  ] },
  { id: "access-resources", title: "How to access your resources", category: "Learning", minutes: 3, summary: "Open purchased courses and ebooks, track progress and download files.", steps: [
    { title: "Open My Resources", body: "Everything you've bought appears in your library automatically after payment.", to: "/learner/resources" },
    { title: "Learn at your pace", body: "Open a resource and mark lessons or chapters complete as you go. Your progress is saved." },
    { title: "Download where available", body: "Ebooks and downloadable files show a Download action on the resource page." },
  ] },
  { id: "wishlist-cart", title: "How to use Wishlist and Cart", category: "Shopping", minutes: 2, summary: "Save items for later and check out when you're ready.", steps: [
    { title: "Save to wishlist", body: "Use the bookmark on any resource or paid event to save it.", to: "/learner/wishlist" },
    { title: "Move to cart", body: "From your wishlist, move items to your cart in one tap." },
    { title: "Check out", body: "Review your order summary, choose a payment method and confirm.", to: "/learner/cart" },
  ] },
  { id: "view-purchases", title: "How to view your purchases", category: "Shopping", minutes: 2, summary: "Find order details, receipts and payment status.", steps: [
    { title: "Open Purchases", body: "See every order with its number, date, amount and status. Filter by status or date.", to: "/learner/purchases" },
    { title: "View a receipt", body: "Open an order to preview and print its receipt." },
    { title: "Pending bank transfers", body: "Bank transfer orders stay pending until the transfer is confirmed." },
  ] },
  { id: "certificates-badges", title: "How to access certificates and badges", category: "Learning", minutes: 3, summary: "Earn badges for learning and attending, and view certificates from creators.", steps: [
    { title: "Earn badges", body: "Badges unlock when you complete lessons and resources or attend eligible events.", to: "/learner/certificates" },
    { title: "Get certificates", body: "Completing every lesson in a certificate-eligible course issues a certificate of completion from its creator." },
    { title: "View and download", body: "Open any certificate to preview it and download a copy." },
  ] },
  { id: "manage-account", title: "Managing your account", category: "Account", minutes: 3, summary: "Update your details, integrations, notifications and security.", steps: [
    { title: "Edit your profile", body: "Change your photo, name, contact details and bio.", to: "/learner/settings/profile" },
    { title: "Connect integrations", body: "Connect a calendar or meeting app to keep event reminders in one place.", to: "/learner/settings/integrations" },
    { title: "Keep your account secure", body: "Update your password and review security preferences.", to: "/learner/settings/security" },
  ] },
];

export type HelpCategory = "account" | "purchases" | "resources" | "events";
export const helpCategories: { id: HelpCategory; label: string; description: string }[] = [
  { id: "account", label: "Account support", description: "Profile, sign-in and security" },
  { id: "purchases", label: "Purchase support", description: "Payments, receipts and orders" },
  { id: "resources", label: "Resource access", description: "Opening, progress and downloads" },
  { id: "events", label: "Event support", description: "Registration, tickets and joining" },
];
export type HelpArticle = { id: string; category: HelpCategory; title: string; body: string[]; faq?: boolean };
export const helpArticles: HelpArticle[] = [
  { id: "update-profile", category: "account", faq: true, title: "How do I update my profile?", body: ["Open Settings, then Manage Profile. Edit your details and select Save changes.", "Your display name is what creators and other learners see."] },
  { id: "switch-profile", category: "account", faq: true, title: "How do I switch between Learner, Creator and Affiliate?", body: ["Open the account menu from your avatar at the top right and choose a profile under Switch profile.", "Each profile keeps its own pages and saved information."] },
  { id: "change-password", category: "account", title: "How do I change my password?", body: ["Go to Settings, then Password & Security, and enter your current and new password."] },
  { id: "payment-methods", category: "purchases", faq: true, title: "Which payment methods can I use?", body: ["Checkout offers card and bank transfer.", "Payments are processed securely and you get a receipt for every order."] },
  { id: "pending-transfer", category: "purchases", title: "Why is my order pending?", body: ["Bank transfer orders stay pending until the transfer is confirmed.", "Once confirmed, your resources and tickets become available immediately."] },
  { id: "failed-payment", category: "purchases", title: "My payment failed. What now?", body: ["Your cart is kept so you can try again. Open the failed order in Purchases and select Try again."] },
  { id: "find-resource", category: "resources", faq: true, title: "Where do I find something I bought?", body: ["Everything you've paid for appears in My Resources / Products.", "Use search or filters to find it quickly."] },
  { id: "download-files", category: "resources", title: "How do I download a resource?", body: ["Open the resource. Ebooks and downloadable files show a Download action.", "Courses are viewed online and track your progress."] },
  { id: "register-event", category: "events", faq: true, title: "How do I register for an event?", body: ["Open the event and select Register. Free events confirm instantly; paid events add a ticket to your cart."] },
  { id: "join-online", category: "events", title: "How do I join an online event?", body: ["The joining link is shared with registered learners before the session starts."] },
];
