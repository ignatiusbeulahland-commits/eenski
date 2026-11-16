import avatar1 from "@/assets/photos/avatar-1.webp";
import avatar2 from "@/assets/photos/avatar-2.webp";
import avatar4 from "@/assets/photos/avatar-4.webp";
import type { Icon3DName } from "@/components/site/Icon3D";

// Shared links and the authentic member-strip photos come from the site-wide data file.
export { communityLearners, links } from "@/components/site/data";

/* ---------- Community page (/community) — copy from staging.tryenski.com/community ---------- */

export type Benefit = { title: string; body: string; icon: Icon3DName };

export const benefits: Benefit[] = [
  {
    title: "Peer learning",
    body: "Connect with fellow creators and learners. Share knowledge, get feedback and grow together in a supportive space.",
    icon: "chat",
  },
  {
    title: "Expert creators",
    body: "Learn from industry experts who host live sessions, workshops and Q&As to help you master your craft.",
    icon: "video",
  },
  {
    title: "Networking",
    body: "Build real relationships with like-minded people, collaborators and mentors from across Africa.",
    icon: "globe",
  },
  {
    title: "Exclusive resources",
    body: "Get curated learning materials, templates, tools and guides available only to community members.",
    icon: "ebook",
  },
];

export type Step = { title: string; body: string; icon: Icon3DName };

export const steps: Step[] = [
  { title: "Sign up", body: "Create your free Enski account in under 2 minutes.", icon: "profile" },
  {
    title: "Complete your profile",
    body: "Tell us about your interests, goals and what you want to learn or teach.",
    icon: "sliders",
  },
  {
    title: "Join sessions",
    body: "Browse and join live workshops, cohorts and discussion groups that match your interests.",
    icon: "video",
  },
  {
    title: "Connect and grow",
    body: "Engage with the community, share your work and watch your network expand.",
    icon: "share",
  },
];

export type MemberStory = { quote: string; name: string; role: string; avatar: string };

export const memberStories: MemberStory[] = [
  {
    quote:
      "Being part of this community transformed how I approach teaching. The feedback I got on my first course was invaluable.",
    name: "Amara O.",
    role: "Course creator",
    avatar: avatar1,
  },
  {
    quote:
      "I found collaborators, clients and lifelong mentors here. This is more than a platform. It's a family.",
    name: "Kofi M.",
    role: "Digital artist",
    avatar: avatar4,
  },
  {
    quote:
      "The live workshops alone are worth it. I've learned more in three months than I did in a year on my own.",
    name: "Zanele D.",
    role: "Tech educator",
    avatar: avatar2,
  },
];

/** Topics that scroll under the hero */
export const topics: { label: string; icon: Icon3DName }[] = [
  { label: "Product design", icon: "categories" },
  { label: "Vibe coding", icon: "salespage" },
  { label: "Content creation", icon: "video" },
  { label: "Podcasting", icon: "mic" },
  { label: "Digital marketing", icon: "megaphone" },
  { label: "Freelancing", icon: "wallet" },
  { label: "Data analysis", icon: "analytics" },
  { label: "Selling online", icon: "storefront" },
  { label: "Writing ebooks", icon: "ebook" },
];

/** "Inside the Trybe": the spaces members join. Copy mirrors the steps above. */
export const spaces = {
  live: {
    title: "Live workshops",
    body: "Creators teach live, take your questions and share replays.",
    session: "Pricing your first gig",
    time: "Friday · 7pm WAT",
  },
  cohorts: {
    title: "Cohorts",
    body: "Learn alongside a small group on the same timeline, with shared goals.",
  },
  discussions: {
    title: "Discussion groups",
    body: "Ask, answer and get honest feedback on your work.",
    messages: [
      { who: "Ada", text: "Can someone review my portfolio case study?" },
      { who: "Tunde", text: "Sent you notes. Your process section is strong 🔥" },
    ],
  },
  showcase: {
    title: "Share your work",
    body: "Post projects, celebrate wins and get discovered by collaborators.",
  },
};
