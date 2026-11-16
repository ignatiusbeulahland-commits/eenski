import type { COURSE_LEVELS } from "./products";

/** Course categories offered in the create dropdown. Creators can also type their own. */
export const COURSE_CATEGORIES = [
  "Design", "Business", "Technology", "Marketing", "Finance", "Personal growth",
  "Photography & video", "Music", "Health & fitness", "Languages", "Writing",
] as const;

/** Skills suggested for each category. A custom category has no suggestions, so the creator types the skill. */
export const SKILLS_BY_CATEGORY: Record<(typeof COURSE_CATEGORIES)[number], string[]> = {
  Design: ["UI design", "UX research", "Graphic design", "Product design", "Brand identity", "Motion design"],
  Business: ["Entrepreneurship", "Sales", "Project management", "Leadership", "Business strategy", "Customer service"],
  Technology: ["Web development", "Mobile development", "Data analysis", "Python", "Cloud computing", "Cybersecurity", "AI and machine learning"],
  Marketing: ["Social media marketing", "Content marketing", "SEO", "Email marketing", "Copywriting", "Paid ads"],
  Finance: ["Personal finance", "Investing", "Accounting", "Bookkeeping", "Financial modelling"],
  "Personal growth": ["Productivity", "Public speaking", "Communication", "Confidence", "Time management"],
  "Photography & video": ["Photography", "Video editing", "Videography", "Lighting", "Photo editing"],
  Music: ["Music production", "Songwriting", "Singing", "Guitar", "Piano", "Audio mixing"],
  "Health & fitness": ["Fitness training", "Nutrition", "Yoga", "Mental wellbeing"],
  Languages: ["English", "French", "Spanish", "Yoruba", "Igbo", "Hausa"],
  Writing: ["Creative writing", "Blogging", "Technical writing", "Scriptwriting", "Copywriting"],
};

export function skillOptions(category: string): string[] {
  return (SKILLS_BY_CATEGORY as Record<string, string[]>)[category.trim()] ?? [];
}

export const LEVEL_LABEL: Record<(typeof COURSE_LEVELS)[number], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  all: "All levels",
};

// ---------- Presentation uploads ----------
export const VIDEO_EXTS = ["mp4", "mov", "webm", "m4v"] as const;
export const VIDEO_MAX_BYTES = 500 * 1024 * 1024;
export const SLIDE_EXTS = ["pdf", "ppt", "pptx", "key", "odp"] as const;
export const SLIDES_MAX_BYTES = 100 * 1024 * 1024;
export const PRESENTATION_MAX_IMAGES = 8;

const extOf = (name: string) => (name.split(".").pop() ?? "").toLowerCase();

export function validateVideoFile(file: { name: string; type: string; size: number }): string | null {
  const ok = file.type.startsWith("video/") || (VIDEO_EXTS as readonly string[]).includes(extOf(file.name));
  if (!ok) return "Choose an MP4, MOV or WebM video.";
  if (!file.size) return "That video is empty. Choose another file.";
  if (file.size > VIDEO_MAX_BYTES) return "Choose a video smaller than 500 MB.";
  return null;
}

export function validateSlidesFile(file: { name: string; type: string; size: number }): string | null {
  if (!(SLIDE_EXTS as readonly string[]).includes(extOf(file.name))) return "Choose a PDF, PowerPoint or Keynote file.";
  if (!file.size) return "That file is empty. Choose another file.";
  if (file.size > SLIDES_MAX_BYTES) return "Choose a file smaller than 100 MB.";
  return null;
}

// ---------- Categories and types for the other product kinds ----------
/** A second dropdown that narrows the category (format, session type, service, focus). */
export type SubField = { label: string; hint: string; placeholder: string; otherPlaceholder: string; options: (category: string) => string[] };
export type TopicConfig = { categories: readonly string[]; categoryHint: string; sub: SubField; level?: boolean };

const SERVICES_BY_CATEGORY: Record<string, string[]> = {
  Design: ["Logo design", "Brand identity", "UI design", "Social media graphics", "Packaging design", "Presentation design"],
  Writing: ["Copywriting", "Blog posts", "Ghostwriting", "CV writing", "Editing and proofreading", "Scriptwriting"],
  Development: ["Website development", "Mobile app", "WordPress site", "Online store", "Bug fixes", "API integration"],
  Marketing: ["Social media management", "SEO", "Email campaigns", "Paid ads", "Marketing strategy", "Influencer outreach"],
  Consulting: ["Business plan", "Strategy session", "Financial review", "HR advice", "Legal guidance"],
  "Video & animation": ["Video editing", "Motion graphics", "Explainer video", "Reels and shorts", "Subtitles"],
  Photography: ["Product photography", "Portraits", "Event photography", "Photo editing"],
  "Music & audio": ["Mixing and mastering", "Voice-over", "Jingles", "Podcast editing", "Beat production"],
  "Virtual assistance": ["Admin support", "Data entry", "Customer support", "Research", "Scheduling"],
  Business: ["Pitch deck", "Business registration", "Market research", "Bookkeeping"],
};

export const PRODUCT_TOPICS: Record<"ebook" | "live" | "service" | "coaching", TopicConfig> = {
  ebook: {
    categories: COURSE_CATEGORIES,
    categoryHint: "The subject your download covers.",
    sub: {
      label: "Format", hint: "What buyers receive.", placeholder: "Choose a format", otherPlaceholder: "Type the format",
      options: () => ["E-book", "Template", "Workbook", "Planner", "Checklist", "Guide", "Printable", "Presets", "Audio"],
    },
  },
  live: {
    categories: COURSE_CATEGORIES,
    categoryHint: "The subject of your session.",
    sub: {
      label: "Session type", hint: "How the session runs.", placeholder: "Choose a session type", otherPlaceholder: "Type the session type",
      options: () => ["Workshop", "Masterclass", "Webinar", "Q&A", "Bootcamp", "Conference", "Meetup", "Panel discussion", "Live coaching"],
    },
    level: true,
  },
  service: {
    categories: Object.keys(SERVICES_BY_CATEGORY),
    categoryHint: "Helps clients find your service.",
    sub: {
      label: "Service", hint: "The work you deliver.", placeholder: "Choose a service", otherPlaceholder: "Type the service",
      options: (c) => SERVICES_BY_CATEGORY[c.trim()] ?? [],
    },
  },
  coaching: {
    categories: ["Career", "Business", "Leadership", "Wellness", "Fitness", "Finance", "Relationships", "Creative", "Life coaching", "Academic"],
    categoryHint: "The area you coach in.",
    sub: {
      label: "Session focus", hint: "What a session helps with.", placeholder: "Choose a focus", otherPlaceholder: "Type the focus",
      options: () => ["Goal setting", "Accountability", "Mentorship", "Strategy session", "Review and feedback", "Interview prep", "Skill building", "Consultation"],
    },
  },
};

/** Dropdown categories for any product kind. */
export function categoriesFor(kind: "course" | "ebook" | "live" | "service" | "coaching"): readonly string[] {
  return kind === "course" ? COURSE_CATEGORIES : PRODUCT_TOPICS[kind].categories;
}
