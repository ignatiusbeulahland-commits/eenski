import { ArrowUpRight } from "lucide-react";
import { SiFacebook, SiInstagram, SiX, SiYoutube } from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";
import type { IconType } from "react-icons";
import logoWhite from "@/assets/enski-logo-white.webp";
import { links, socials } from "./data";

const columns = [
  {
    title: "Learn",
    items: [
      { l: "Dreamverse", h: links.dreamverse },
      { l: "Explore courses", h: "/courses" },
      { l: "Dreamers Trybe", h: links.community },
      { l: "Dreamers Diary", h: "/#dreamers-diary" },
      { l: "Verify a certificate", h: "/verify" },
    ],
  },
  {
    title: "Create",
    items: [
      { l: "Become a creator", h: links.register },
      { l: "For creators", h: "/#creators" },
      { l: "Features", h: links.features },
      { l: "Pricing", h: links.pricing },
      { l: "Become an ambassador", h: links.ambassador },
      { l: "Campus ambassadors", h: links.campusAmbassador },
      { l: "NYSC initiative", h: links.nyscInitiative },
    ],
  },
  {
    title: "Company",
    items: [
      { l: "About us", h: links.about },
      { l: "Blog", h: links.blog },
      { l: "Community", h: links.communityInfo },
      { l: "Insights", h: "/#insights" },
      { l: "FAQ", h: links.faq },
      { l: "Log in", h: links.login },
    ],
  },
  {
    title: "Legal",
    items: [
      { l: "Privacy policy", h: links.privacy },
      { l: "Terms of service", h: links.terms },
      { l: "Cookies settings", h: links.cookies },
      { l: "Copyright", h: links.copyright },
      { l: "KYC", h: links.kyc },
    ],
  },
];

const brandIcons: Record<string, IconType> = {
  Facebook: SiFacebook,
  Instagram: SiInstagram,
  Twitter: SiX,
  LinkedIn: FaLinkedinIn,
  YouTube: SiYoutube,
};

// Matches the Tryenski launch footer: midnight ink, sky eyebrows, lime-outlined social tiles.
export function SiteFooter() {
  return (
    <footer className="bg-midnight pb-10 pt-14 text-on-blue/70 md:pt-16">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div className="flex min-w-0 flex-col items-start">
            <a href="/" aria-label="Enski home" className="inline-flex">
              <img src={logoWhite} alt="Enski" width={288} height={106} loading="lazy" decoding="async" className="block h-9 w-auto" />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              Africa's platform for dreamers. Learn the skills that shape your future, and teach the
              knowledge that shapes someone else's.
            </p>
            <ul className="mt-6 grid w-full max-w-sm grid-cols-2 gap-2.5 text-sm font-semibold">
              {socials.map((s) => {
                const Brand = brandIcons[s.label];
                return (
                  <li key={s.label} className="min-w-0">
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-[12px] border border-lime/70 bg-on-blue/[0.03] px-3 py-2.5 text-on-blue/85 transition-colors hover:border-lime hover:bg-lime/10 hover:text-lime"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {Brand && (
                          <Brand
                            aria-hidden
                            className="size-4 shrink-0 text-lime transition-transform duration-300 group-hover:scale-110"
                          />
                        )}
                        <span className="truncate">{s.label}</span>
                      </span>
                      <ArrowUpRight className="size-3.5 shrink-0 text-sky transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {columns.map((c) => (
              <div key={c.title} className="min-w-0">
                <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-sky">{c.title}</p>
                <ul className="mt-4 space-y-1">
                  {c.items.map((it) => (
                    <li key={it.l}>
                      <a
                        href={it.h}
                        className="inline-flex min-h-10 items-center text-sm font-semibold text-on-blue/75 transition-colors hover:text-lime"
                      >
                        {it.l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-on-blue/10 pt-5 text-[13px] leading-relaxed text-on-blue/65 sm:flex-row">
          <p>© {new Date().getFullYear()} Enski. All rights reserved.</p>
          <p>Made for African dreamers</p>
        </div>
      </div>
    </footer>
  );
}
