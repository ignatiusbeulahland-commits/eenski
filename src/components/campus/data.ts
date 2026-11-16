import ambassador from "@/assets/campus/ambassador.webp";
import community from "@/assets/campus/community.webp";
import director from "@/assets/campus/director.webp";
import dream1 from "@/assets/campus/dream-1.webp";
import dream2 from "@/assets/campus/dream-2.webp";
import dream3 from "@/assets/campus/dream-3.webp";
import dream4 from "@/assets/campus/dream-4.webp";
import dream5 from "@/assets/campus/dream-5.webp";
import grads from "@/assets/campus/grads.webp";
import hero1s from "@/assets/campus/hero-1-800.webp";
import hero1 from "@/assets/campus/hero-1.webp";
import hero2s from "@/assets/campus/hero-2-800.webp";
import hero2 from "@/assets/campus/hero-2.webp";
import hero3s from "@/assets/campus/hero-3-800.webp";
import hero3 from "@/assets/campus/hero-3.webp";
import hero4s from "@/assets/campus/hero-4-800.webp";
import hero4 from "@/assets/campus/hero-4.webp";
import introGroupSmall from "@/assets/campus/intro-group-800.webp";
import introGroup from "@/assets/campus/intro-group.webp";
import movement from "@/assets/campus/movement.webp";
import prestige from "@/assets/campus/prestige.webp";
import team from "@/assets/campus/team.webp";
import abu from "@/assets/campus/unis/abu.webp";
import cu from "@/assets/campus/unis/cu.webp";
import lasu from "@/assets/campus/unis/lasu.webp";
import oau from "@/assets/campus/unis/oau.webp";
import ui from "@/assets/campus/unis/ui.webp";
import uniben from "@/assets/campus/unis/uniben.webp";
import unilag from "@/assets/campus/unis/unilag.webp";
import unn from "@/assets/campus/unis/unn.webp";
import type { FadeSlide } from "@/components/ambassador/kit";
import type { Icon3DName } from "@/components/site/Icon3D";
import type { CampusRole } from "@/lib/ambassador/applications";

/** Copy and photos for /become-an-ambassador/campus, from the Enski Campus Ambassador project. */

const heroSet = (big: string, small: string) => ({ src: big, srcSet: `${small} 800w, ${big} 1600w`, sizes: "100vw" });

export const campusHeroSlides: FadeSlide[] = [
  { ...heroSet(hero1, hero1s), alt: "University students walking together on campus" },
  { ...heroSet(hero2, hero2s), alt: "Students laughing together on the steps of a campus building" },
  { ...heroSet(hero3, hero3s), alt: "A student presenting to classmates in a lecture theatre" },
  { ...heroSet(hero4, hero4s), alt: "Students walking across a university quad" },
];
export const campusHeroPreload = { href: hero1s, imageSrcSet: campusHeroSlides[0]!.srcSet!, imageSizes: "100vw" };

export const universities = [
  { logo: unilag, name: "University of Lagos" },
  { logo: ui, name: "University of Ibadan" },
  { logo: oau, name: "Obafemi Awolowo University" },
  { logo: unn, name: "University of Nigeria" },
  { logo: abu, name: "Ahmadu Bello University" },
  { logo: cu, name: "Covenant University" },
  { logo: uniben, name: "University of Benin" },
  { logo: lasu, name: "Lagos State University" },
];

export const campusImages = { introGroup, introGroupSmall, community, prestige, grads };

export const campusBenefits: { icon: Icon3DName; title: string; body: string }[] = [
  { icon: "wallet", title: "Get paid to lead", body: "Allowances, plus commission for every eligible student you bring in." },
  { icon: "ebook", title: "Learn for free", body: "Fully funded scholarships in skills companies are hiring for right now." },
  { icon: "trophy", title: "A CV that stands out", body: "Certificates and recommendation letters that answer \"so what have you done?\"" },
  { icon: "storefront", title: "Skip the queue", body: "Internships at Enski and first pick of openings with our partner brands." },
  { icon: "megaphone", title: "Lead for real", body: "Run teams, campaigns and events. Experience most people only get after graduation." },
  { icon: "globe", title: "Rooms you can't buy into", body: "Founders, recruiters and ambitious peers who open doors class never will." },
];

export const campusRoles: {
  value: CampusRole;
  tag: string;
  title: string;
  img: string;
  alt: string;
  desc: string;
  lines: string[];
  cta: string;
  chip: string;
}[] = [
  {
    value: "campus_director",
    tag: "Leadership role",
    title: "Campus director",
    img: director,
    alt: "A confident student leader with her arms crossed",
    desc: "The face of the movement on your campus. You pick the team, set the pace and own the results.",
    lines: ["Lead your campus team", "Build university relationships", "Drive student engagement", "Run campus activations"],
    cta: "Become a campus director",
    chip: "One per campus",
  },
  {
    value: "executive_team",
    tag: "Executive team",
    title: "Campus executive team",
    img: team,
    alt: "Four students working together as a campus executive team",
    desc: "The engine room. Turn plans into events, content and partnerships people actually talk about.",
    lines: ["Community manager", "Content and creative lead", "Event and activation lead", "PR and partnerships lead"],
    cta: "Join the executive team",
    chip: "Small team",
  },
  {
    value: "campus_ambassador",
    tag: "Community role",
    title: "Campus ambassador",
    img: ambassador,
    alt: "A smiling student ambassador in an Enski T-shirt, waving",
    desc: "The connector. Be the person everyone asks, \"How did you hear about that?\"",
    lines: ["Represent Enski on campus", "Share opportunities", "Support campaigns and events", "Grow your network"],
    cta: "Join as an ambassador",
    chip: "Open to all",
  },
];

export const campusDreams: (FadeSlide & { cap: string })[] = [
  { src: movement, alt: "A happy group of Nigerian students together on campus", cap: "One campus, one movement" },
  { src: dream1, alt: "A young Nigerian woman speaking on stage at a conference", cap: "From campus voice to keynote speaker" },
  { src: dream2, alt: "Students working together on laptops around campus", cap: "Build real projects with your team" },
  { src: dream3, alt: "Students having a picnic on a campus lawn at sunset", cap: "Friends who become family" },
  { src: dream4, alt: "Students playing tug of war at a campus games day", cap: "Games days the whole campus talks about" },
  { src: dream5, alt: "A young founder pitching his startup to investors", cap: "Graduate a founder, not just a job seeker" },
];

export const campusSteps = [
  { title: "Pick your seat", body: "Director, executive or ambassador. Go where you'll shine." },
  { title: "Apply in 2 minutes", body: "A few quick details. No essays, no fees." },
  { title: "Get the call", body: "Shortlisted applicants hear from our team directly." },
  { title: "Make your mark", body: "Get onboarded and start building the campus story you'll tell for years." },
];

export const EXEC_ROLES = [
  "Community manager",
  "Content lead / content creator",
  "Graphics designer",
  "Event and activation lead",
  "PR and partnerships lead",
  "Media / videography lead",
  "Faculty and department relations lead",
];
export const LEVEL_OPTIONS = ["100 level", "200 level", "300 level", "400 level", "500 level", "600 level", "Postgraduate", "Recently graduated"];
export const MOTIVATIONS = [
  "Earn additional income",
  "Get internship opportunities",
  "Build my leadership skills",
  "Network and meet people",
  "Learn new skills",
  "Access job opportunities",
  "Build my CV",
  "All of the above",
  "Other",
];
