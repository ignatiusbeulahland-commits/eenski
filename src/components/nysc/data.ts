import boots from "@/assets/nysc/boots.webp";
import celebrate from "@/assets/nysc/celebrate.webp";
import circle from "@/assets/nysc/circle.webp";
import duo from "@/assets/nysc/corper-duo.webp";
import crowd from "@/assets/nysc/crowd.webp";
import inc1 from "@/assets/nysc/cut-inc-1.webp";
import inc2 from "@/assets/nysc/cut-inc-2.webp";
import job1 from "@/assets/nysc/cut-job-1.webp";
import job2 from "@/assets/nysc/cut-job-2.webp";
import lead from "@/assets/nysc/cut-lead.webp";
import sk1 from "@/assets/nysc/cut-sk-1.webp";
import sk2 from "@/assets/nysc/cut-sk-2.webp";
import sk3 from "@/assets/nysc/cut-sk-3.webp";
import sk4 from "@/assets/nysc/cut-sk-4.webp";
import sk5 from "@/assets/nysc/cut-sk-5.webp";
import hero1 from "@/assets/nysc/hero-1.webp";
import hero2 from "@/assets/nysc/hero-2.webp";
import netCorps from "@/assets/nysc/net-corps.webp";
import netFounder from "@/assets/nysc/net-founder.webp";
import v1 from "@/assets/nysc/vision-1.webp";
import v2 from "@/assets/nysc/vision-2.webp";
import v3 from "@/assets/nysc/vision-3.webp";
import v4 from "@/assets/nysc/vision-4.webp";
import v5 from "@/assets/nysc/vision-5.webp";
import v6 from "@/assets/nysc/vision-6.webp";
import type { Chip, FadeSlide } from "@/components/ambassador/kit";

/** Copy and photos for /become-an-ambassador/nysc, from the Enski NYSC Initiative project. */

export const nyscHeroSlides: FadeSlide[] = [
  { src: hero1, alt: "A female NYSC corps member in uniform" },
  { src: hero2, alt: "A male NYSC corps member smiling with his phone" },
];

export const nyscImages = { boots, celebrate, circle, crowd, duo, lead };

export const vision: (FadeSlide & { tag: string })[] = [
  { src: v1, tag: "Day one", alt: "Learning together at camp" },
  { src: v2, tag: "Service year", alt: "Building skills in your CDS group" },
  { src: v3, tag: "After hours", alt: "Shipping ideas with your crew" },
  { src: v4, tag: "Launch day", alt: "Showing the world what you built" },
  { src: v5, tag: "Where it leads", alt: "Running a team of your own" },
  { src: v6, tag: "Before and after", alt: "From corps member to founder" },
];

export const nyscBenefits: { title: string; body: string; slides: string[]; alt: string; chip: Chip }[] = [
  {
    title: "Skills, certifications and scholarships",
    body: "Go from \"just a graduate\" to a certified professional. Earn scholarships and recognised certificates in high-value skills that make recruiters stop at your CV.",
    slides: [sk1, sk2, sk3, sk4, sk5],
    alt: "Corps members practising skills: typing, design, drafting, video and craft",
    chip: { icon: "trophy", title: "Certified", subtitle: "CV that gets noticed" },
  },
  {
    title: "Internships and jobs",
    body: "Leave camp with real work experience, not just a certificate. Get matched to internships and roles that turn your service year into your first big career move.",
    slides: [job1, job2],
    alt: "Corps members with a laptop and a job offer letter",
    chip: { icon: "profile", title: "Hired", subtitle: "experience that counts" },
  },
  {
    title: "Income opportunities",
    body: "Stop waiting on allawee. Turn what you learn into paid gigs and side income, and pass out with money coming in and a plan that keeps it growing.",
    slides: [inc1, inc2],
    alt: "Corps members selling their own products and getting paid",
    chip: { icon: "wallet", title: "Earning", subtitle: "beyond allawee" },
  },
  {
    title: "Networking",
    body: "From unknown corper to someone people remember. Sit with founders, mentors and creators who can vouch for you and open doors you couldn't open alone.",
    slides: [netFounder, netCorps],
    alt: "A corps member shaking hands with a founder, and corps members meeting",
    chip: { icon: "globe", title: "Connected", subtitle: "doors that open" },
  },
];

export const nyscSteps = [
  { title: "Join", body: "Apply in two minutes." },
  { title: "Connect", body: "Meet your corps community." },
  { title: "Learn", body: "Unlock skills and resources." },
  { title: "Grow", body: "Build your career, network and income." },
  { title: "Lead", body: "Step up as an ambassador." },
];

export const nyscFaqs = [
  ["Who can join the Enski NYSC Initiative?", "Any serving corps member, from any state, discipline or skill level."],
  ["Do I need a skill to join?", "No. Bring the willingness and we'll help with the skills."],
  ["What is the NYSC ambassador role?", "Ambassadors connect corps members in their state or CDS group to Enski opportunities while building leadership along the way."],
  ["What is the executive team?", "The corps members who run the initiative: ambassadors, events and community."],
  ["What happens after I apply?", "We review your application and reach you by WhatsApp or email with your next step."],
  ["Do I have to be in a particular state?", "No. Every state and the FCT is welcome."],
] as const;

export const NYSC_EXEC_ROLES = [
  "Team lead",
  "Community manager",
  "Content lead / content creator",
  "Graphics designer",
  "Event and activation lead",
  "PR and partnerships lead",
  "Media / videography lead",
];
export const STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];
export const REASONS = ["Gain practical skills", "Access internship or career opportunities", "Earn additional income", "Build my network", "Develop leadership experience", "All of the above"];
export const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"];
