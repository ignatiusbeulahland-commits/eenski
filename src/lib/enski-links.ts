import { ENSKI_ORIGIN } from "./dreamverse/normalize";

const u = (path: string) => `${ENSKI_ORIGIN}${path}`;

// Pages that now live on this site use local paths; the rest open the live Enski site.
export const ENSKI = {
  home: "/",
  dreamverse: "/dreamverse",
  login: "/auth",
  register: "/auth?s=register",
  features: "/features",
  pricing: "/pricing",
  ambassador: "/become-an-ambassador",
  dreamersTribe: "/dreamers-trybe",
  community: u("/community"),
  blog: "/blog",
  about: "/about",
  faq: "/faq",
  privacy: u("/privacy-policy"),
  terms: u("/terms-and-conditions"),
  cookies: u("/cookies-settings"),
  copyright: u("/copyright-policy"),
  kyc: u("/kyc-policy"),
  supportEmail: "support@enski.net",
  // Same order and labels as the footers on the other Enski sites. Twitter uses the
  // handle from Enski's own platform footer; twitter.com/enskiacademy and
  // youtube.com/@enskiacademy return 404, so they are left out until real ones exist.
  social: [
    { name: "Facebook", href: "https://facebook.com/enskiacademy" },
    { name: "Instagram", href: "https://instagram.com/enskiacademy" },
    { name: "Twitter", href: "https://x.com/tryenski" },
    { name: "LinkedIn", href: "https://linkedin.com/company/enskiacademy" },
    // TikTok is listed on Enski's live site (tryenski.com) footer.
    { name: "TikTok", href: "https://www.tiktok.com/@tryenski" },
  ],
} as const;
