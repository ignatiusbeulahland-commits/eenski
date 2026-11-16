// FAQ content mirrored from the live Enski help page.
export type FaqCategoryId =
  | "getting-started"
  | "payments"
  | "courses"
  | "facilitators"
  | "affiliates"
  | "technical"
  | "account";

export interface Faq {
  id: number;
  category: FaqCategoryId;
  question: string;
  answer: string;
}

export const FAQ_CATEGORIES: { id: FaqCategoryId; label: string; blurb: string }[] = [
  { id: "getting-started", label: "Getting started", blurb: "New here? Start with the basics." },
  { id: "payments", label: "Payments and billing", blurb: "Paying, getting paid and payouts." },
  { id: "courses", label: "Courses and content", blurb: "Enrolling, learning and certificates." },
  { id: "facilitators", label: "Creators", blurb: "Selling your knowledge on Enski." },
  { id: "affiliates", label: "Affiliates", blurb: "Earn by sharing what you love." },
  { id: "technical", label: "Technical issues", blurb: "When something isn’t working." },
  { id: "account", label: "Account and security", blurb: "Your profile, data and safety." },
];

export const FAQS: Faq[] = [
  {
    "id": 1,
    "category": "getting-started",
    "question": "What is Enski?",
    "answer": "Enski is a platform that empowers African creators and builders to share knowledge, sell courses, and build communities. We provide tools for course creation, digital downloads, coaching, and community building — all in one place."
  },
  {
    "id": 2,
    "category": "getting-started",
    "question": "Who can use Enski?",
    "answer": "Anyone can learn on Enski. Creators, educators, and experts can sign up to sell courses, digital downloads, and services. Learners can browse and purchase content from anywhere in the world."
  },
  {
    "id": 3,
    "category": "getting-started",
    "question": "Is Enski available in my country?",
    "answer": "Enski is available across Africa and globally. We support multiple currencies including NGN, KES, GHS, UGX, ZAR, and major international currencies via card and mobile money."
  },
  {
    "id": 4,
    "category": "getting-started",
    "question": "How do I get started as a learner?",
    "answer": "Sign up for a free account, explore our course catalog, and enroll in any course that interests you. You can pay with various payment methods and start learning immediately."
  },
  {
    "id": 5,
    "category": "getting-started",
    "question": "How do I get started as a creator?",
    "answer": "Sign up and select 'Creator' during onboarding, or switch from learner to creator in your settings. Complete your creator profile, set up your payout method, and start uploading content."
  },
  {
    "id": 6,
    "category": "getting-started",
    "question": "Does Enski have a mobile app?",
    "answer": "Yes, Enski is available as a mobile app on both iOS and Android. You can download it from the App Store or Google Play Store and access all platform features on the go."
  },
  {
    "id": 7,
    "category": "getting-started",
    "question": "Are there any hidden fees?",
    "answer": "No, all fees are clearly displayed before you complete any transaction. Learners see the full price upfront, and creators can view their payout breakdown for each sale in the dashboard."
  },
  {
    "id": 8,
    "category": "getting-started",
    "question": "What types of content can I find on Enski?",
    "answer": "Enski offers courses, digital downloads (ebooks, templates, software), one-on-one coaching sessions, professional services (consulting, design), and live sessions and workshops across various topics."
  },
  {
    "id": 9,
    "category": "payments",
    "question": "What payment methods are accepted?",
    "answer": "We accept credit/debit cards (Visa, Mastercard), mobile money (M-Pesa, MTN MoMo, Airtel Money), bank transfers, and local payment methods depending on your region."
  },
  {
    "id": 10,
    "category": "payments",
    "question": "How do creators get paid?",
    "answer": "Creators receive payouts via bank transfer, mobile money, or other supported payout methods. Payouts are processed weekly after a 7-day holding period for quality assurance."
  },
  {
    "id": 69,
    "category": "payments",
    "question": "How does Enski process settlements?",
    "answer": "Whenever you receive a payment on Enski, the funds are processed in your Enski Wallet and made available on the Payout page."
  },
  {
    "id": 70,
    "category": "payments",
    "question": "How do payouts work?",
    "answer": "Your earnings are sent to your Payouts from your Enski Main Wallet, and you can withdraw anytime to your local bank account."
  },
  {
    "id": 11,
    "category": "payments",
    "question": "What are the platform fees?",
    "answer": "Enski charges a competitive commission on each transaction. The exact rate depends on your creator tier and sales volume. Fee details are available on our Pricing page and in your creator dashboard."
  },
  {
    "id": 12,
    "category": "payments",
    "question": "When will I receive my payout?",
    "answer": "Payouts are processed every Monday for earnings from the previous week. Processing takes 1–3 business days depending on your payout method and bank."
  },
  {
    "id": 13,
    "category": "payments",
    "question": "Is there a minimum payout threshold?",
    "answer": "Yes, the minimum payout amount is $10 or its equivalent in your local currency. Earnings below this threshold will roll over to the next payout cycle."
  },
  {
    "id": 14,
    "category": "payments",
    "question": "Can I change my payout method?",
    "answer": "Yes, you can update your payout method anytime from Settings > Payout Settings. Verify the new method before the next payout cycle to avoid delays."
  },
  {
    "id": 15,
    "category": "payments",
    "question": "Can I pay in my local currency?",
    "answer": "Yes, Enski supports multiple currencies. Your local currency is automatically detected at checkout, and you'll see prices in your preferred currency where available."
  },
  {
    "id": 16,
    "category": "payments",
    "question": "Do you offer installment or split-payment options?",
    "answer": "Yes, certain courses and products support split-payment options at checkout. Look for the 'Pay in Installments' option when available on the product page."
  },
  {
    "id": 17,
    "category": "payments",
    "question": "What happens if my payment fails?",
    "answer": "If your payment fails, check that your card details are correct and you have sufficient funds. Try a different payment method or contact your bank. Your cart items are saved so you can retry."
  },
  {
    "id": 18,
    "category": "payments",
    "question": "Can I get an invoice for my purchase?",
    "answer": "Yes, a receipt is automatically emailed to you after each purchase. You can also download invoices from your Purchase History in your account settings."
  },
  {
    "id": 19,
    "category": "courses",
    "question": "How do I enroll in a course?",
    "answer": "Browse our catalog, select a course, and click 'Enroll'. You can pay with various payment methods including mobile money and cards. Some courses are free to access."
  },
  {
    "id": 20,
    "category": "courses",
    "question": "How long do I have access to a course?",
    "answer": "Once enrolled, you have lifetime access to the course content, including any future updates and additional resources the creator adds."
  },
  {
    "id": 21,
    "category": "courses",
    "question": "Are certificates provided after completion?",
    "answer": "Yes, you receive a certificate of completion after finishing all course modules and assessments. Certificates can be downloaded and shared on LinkedIn."
  },
  {
    "id": 22,
    "category": "courses",
    "question": "Can I download course videos for offline viewing?",
    "answer": "Yes, the Enski mobile app supports offline downloads. You can download course videos when connected to Wi-Fi and watch them later without an internet connection."
  },
  {
    "id": 23,
    "category": "courses",
    "question": "How do I find courses in my language?",
    "answer": "Use the language filter on our course catalog page to browse courses by language. Many creators offer content in multiple languages or include subtitles."
  },
  {
    "id": 24,
    "category": "courses",
    "question": "Can I preview a course before buying?",
    "answer": "Yes, most courses offer free preview lessons. You can watch sample content to evaluate the teaching style and material before committing to a purchase."
  },
  {
    "id": 25,
    "category": "courses",
    "question": "How do I track my learning progress?",
    "answer": "Your 'My Learning' dashboard shows your enrolled courses, completion percentages, and recent activity. Each course page also has a progress bar tracking module completion."
  },
  {
    "id": 26,
    "category": "courses",
    "question": "Can I leave reviews on courses?",
    "answer": "Yes. Open any course, eBook or Dreamverse listing, go to the Reviews tab and leave a star rating and a written review. Reviews help other learners make informed decisions and give feedback to creators."
  },
  {
    "id": 27,
    "category": "courses",
    "question": "What file formats can creators upload?",
    "answer": "Creators can upload video (MP4, MOV), audio (MP3, WAV), documents (PDF, DOCX), images (PNG, JPG), and interactive content. The platform handles encoding and streaming automatically."
  },
  {
    "id": 28,
    "category": "courses",
    "question": "Are there free courses available?",
    "answer": "Yes, many creators offer free courses on Enski. Use the 'Free' filter on the catalog page to browse all free content available on the platform."
  },
  {
    "id": 29,
    "category": "facilitators",
    "question": "How do I become a creator on Enski?",
    "answer": "Sign up and select 'Creator' during onboarding, or switch from learner to creator in your account settings. Complete your profile, set up your payout method, and start uploading content."
  },
  {
    "id": 30,
    "category": "facilitators",
    "question": "What can I sell on Enski?",
    "answer": "You can sell courses, digital downloads (ebooks, templates, software), offer one-on-one coaching sessions, provide professional services (consulting, design), and host live sessions and workshops."
  },
  {
    "id": 31,
    "category": "facilitators",
    "question": "How do I upload a course?",
    "answer": "From your dashboard, click 'Create Course'. Fill in the details, upload your content (videos, PDFs, quizzes) section by section, set a price, and publish when ready."
  },
  {
    "id": 32,
    "category": "facilitators",
    "question": "How do I track my sales?",
    "answer": "Use your Creator Dashboard to view sales analytics, revenue reports, learner engagement metrics, and conversion rates. Data is updated in real-time."
  },
  {
    "id": 33,
    "category": "facilitators",
    "question": "Can I offer discounts or coupons?",
    "answer": "Yes, creators can create coupon codes and discount campaigns from the Coupons section in your dashboard. You can set percentage or fixed amount discounts with expiry dates."
  },
  {
    "id": 34,
    "category": "facilitators",
    "question": "Can I sell courses in multiple currencies?",
    "answer": "Yes, you can set prices in multiple currencies. Enski automatically handles currency conversion at checkout based on the learner's location."
  },
  {
    "id": 35,
    "category": "facilitators",
    "question": "How do I set up my storefront?",
    "answer": "Go to your Creator Dashboard > Storefront to customize your page. Upload a banner, add a bio, set your branding colors, and organize your products into categories."
  },
  {
    "id": 36,
    "category": "facilitators",
    "question": "Can I offer bundle deals on multiple courses?",
    "answer": "Yes, you can create course bundles and set a discounted price for the package. Bundles are a great way to increase average order value and provide more value to learners."
  },
  {
    "id": 37,
    "category": "facilitators",
    "question": "What analytics are available to creators?",
    "answer": "Creators can view total sales, revenue, enrollment trends, course completion rates, learner demographics, traffic sources, and conversion funnels from the Analytics tab in the dashboard."
  },
  {
    "id": 38,
    "category": "facilitators",
    "question": "Can I schedule course launches?",
    "answer": "Yes, you can set a future publish date when creating or editing a course. The course will automatically go live on the scheduled date and enrolled learners will be notified."
  },
  {
    "id": 39,
    "category": "affiliates",
    "question": "How does the affiliate program work?",
    "answer": "Share your unique affiliate link with your audience. When someone signs up or makes a purchase through your link, you earn a commission on qualifying transactions."
  },
  {
    "id": 40,
    "category": "affiliates",
    "question": "How much commission do affiliates earn?",
    "answer": "Affiliates earn up to 30% commission on referred sales. The exact rate depends on your affiliate tier and performance level. Top performers unlock higher commission rates."
  },
  {
    "id": 41,
    "category": "affiliates",
    "question": "When do affiliate commissions get paid?",
    "answer": "Affiliate commissions are paid out monthly once you reach the minimum payout threshold of $20. Payments are processed within the first week of each month."
  },
  {
    "id": 42,
    "category": "affiliates",
    "question": "How do I track my affiliate referrals?",
    "answer": "Your affiliate dashboard shows real-time analytics including clicks, signups, conversions, and earnings. Each affiliate link has a unique tracking code."
  },
  {
    "id": 43,
    "category": "affiliates",
    "question": "Can I promote Enski on social media?",
    "answer": "Yes, you can share your affiliate link on social media, blogs, YouTube, and other platforms. Review our affiliate guidelines for approved promotional methods."
  },
  {
    "id": 44,
    "category": "affiliates",
    "question": "How do I join the affiliate program?",
    "answer": "Visit the Affiliates section in your account settings or navigate to our Affiliate Program page. Sign up, get your unique referral link, and start sharing."
  },
  {
    "id": 45,
    "category": "affiliates",
    "question": "Can I become an affiliate for specific courses?",
    "answer": "Yes, you can choose to promote specific courses or the entire platform. Select courses that align with your audience for the best conversion rates."
  },
  {
    "id": 46,
    "category": "affiliates",
    "question": "What marketing materials are provided?",
    "answer": "Affiliates receive banners, social media templates, email copy, and landing page assets. These are available in your affiliate dashboard under 'Marketing Materials'."
  },
  {
    "id": 47,
    "category": "affiliates",
    "question": "How long does the affiliate cookie last?",
    "answer": "Affiliate referral cookies last 30 days. If a referred user makes a purchase within 30 days of clicking your link, you receive the commission."
  },
  {
    "id": 48,
    "category": "affiliates",
    "question": "Can I refer other creators to the platform?",
    "answer": "Yes, the affiliate program covers both learner sign-ups and creator referrals. You earn commissions when referred creators make their first sales on the platform."
  },
  {
    "id": 49,
    "category": "technical",
    "question": "The video player isn't working, what should I do?",
    "answer": "Try refreshing the page, clearing your browser cache, or switching to a different browser. If the issue persists, check your internet connection and disable any ad-blocking extensions."
  },
  {
    "id": 50,
    "category": "technical",
    "question": "What browsers does Enski support?",
    "answer": "Enski supports the latest versions of Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using Chrome or Firefox on desktop."
  },
  {
    "id": 51,
    "category": "technical",
    "question": "Why is the page loading slowly?",
    "answer": "Slow loading can be caused by a poor internet connection, heavy website traffic, or outdated browser cache. Try refreshing the page or accessing the site during off-peak hours."
  },
  {
    "id": 52,
    "category": "technical",
    "question": "I'm getting a payment error, what do I do?",
    "answer": "Check that your card details are correct and you have sufficient funds. Try a different payment method. If the error persists, contact your bank or our support team."
  },
  {
    "id": 53,
    "category": "technical",
    "question": "Can I use Enski on multiple devices?",
    "answer": "Yes, your Enski account works across all devices. Your progress, purchases, and settings sync automatically between web, mobile, and tablet."
  },
  {
    "id": 54,
    "category": "technical",
    "question": "How do I report a bug?",
    "answer": "Contact our support team through the Help Center or email support@enski.net. Include a description of the issue, your browser/device, and screenshots if possible."
  },
  {
    "id": 55,
    "category": "technical",
    "question": "Why am I being logged out unexpectedly?",
    "answer": "This can happen if your session expires, you clear browser cookies, or there's a security event. Make sure 'Remember Me' is checked when logging in and clear your cache if the issue persists."
  },
  {
    "id": 56,
    "category": "technical",
    "question": "How do I enable JavaScript if it's disabled?",
    "answer": "Enski requires JavaScript to function. Go to your browser settings, find the JavaScript option, and ensure it's enabled. Instructions vary by browser — search for 'enable JavaScript [browser name]' for step-by-step help."
  },
  {
    "id": 57,
    "category": "account",
    "question": "How do I create an account?",
    "answer": "Click 'Sign Up' on our homepage. You can register with your email or use social login options like Google, Facebook, or Apple."
  },
  {
    "id": 58,
    "category": "account",
    "question": "How do I reset my password?",
    "answer": "Click 'Forgot Password' on the login page, enter your email, and follow the reset link sent to your inbox. The link expires after 60 minutes."
  },
  {
    "id": 59,
    "category": "account",
    "question": "Can I change my email address?",
    "answer": "Yes, go to Settings > Manage Profile to update your email address. You'll need to verify the new email before the change takes effect."
  },
  {
    "id": 60,
    "category": "account",
    "question": "How do I delete my account?",
    "answer": "Go to Settings > Account and click 'Delete Account'. Please note this is irreversible and all your data will be permanently removed within 30 days."
  },
  {
    "id": 61,
    "category": "account",
    "question": "Can I have multiple accounts?",
    "answer": "No, we allow only one account per user. If you need to switch between learner and creator roles, you can do so from your account settings."
  },
  {
    "id": 62,
    "category": "account",
    "question": "How do I update my profile information?",
    "answer": "Go to Settings > Manage Profile to update your name, bio, profile picture, and other personal information."
  },
  {
    "id": 63,
    "category": "account",
    "question": "How does Enski protect my data?",
    "answer": "Enski uses industry-standard encryption (SSL/TLS) for all data transmission. Your personal and payment information is stored securely and never shared with third parties without your consent."
  },
  {
    "id": 64,
    "category": "account",
    "question": "Is my payment information safe?",
    "answer": "Yes, all payments are processed through PCI-compliant payment gateways. We never store your full card details on our servers. See our Privacy Policy for full details."
  },
  {
    "id": 65,
    "category": "account",
    "question": "How do I enable two-factor authentication (2FA)?",
    "answer": "Go to Settings > Security and enable 'Two-Factor Authentication'. You can use an authenticator app like Google Authenticator or receive codes via SMS."
  },
  {
    "id": 66,
    "category": "account",
    "question": "What should I do if my account is compromised?",
    "answer": "Immediately reset your password and enable 2FA. Contact our support team to review any suspicious activity on your account. We'll help secure your account."
  },
  {
    "id": 67,
    "category": "account",
    "question": "Does Enski sell my personal data?",
    "answer": "No, we never sell your personal data to third parties. We use your data only to improve your experience on our platform. See our Privacy Policy for full details."
  },
  {
    "id": 68,
    "category": "account",
    "question": "How do I manage notification preferences?",
    "answer": "Go to Settings > Notifications to customize which emails and push notifications you receive. You can toggle notifications for purchases, course updates, marketing, and community activity."
  }
];
