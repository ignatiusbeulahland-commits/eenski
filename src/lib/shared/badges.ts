/**
 * Enski achievement badges: one catalogue for learners, creators and verification.
 * Every badge states its criteria and who can award it. "auto" badges are recorded only
 * when the learner's own activity meets the rule; "issuer" badges need a creator to confirm
 * the criteria with evidence; "enski" badges are reserved for the Enski team.
 */

export const BADGE_CATEGORIES = ["learning", "skills", "performance", "community", "special"] as const;
export type BadgeCategory = (typeof BADGE_CATEGORIES)[number];
export type BadgeShape = "medallion" | "shield" | "rosette" | "hexagon" | "seal";

export const categoryInfo: Record<BadgeCategory, { label: string; shape: BadgeShape; blurb: string }> = {
  learning: { label: "Learning & Completion", shape: "medallion", blurb: "Courses finished and learning milestones reached." },
  skills: { label: "Skills & Competency", shape: "shield", blurb: "Skills shown in real work, confirmed by a creator." },
  performance: { label: "Performance & Achievement", shape: "rosette", blurb: "Standout results within a course or programme." },
  community: { label: "Community & Participation", shape: "hexagon", blurb: "Showing up, taking part and helping others." },
  special: { label: "Special Recognition", shape: "seal", blurb: "Rare honours for firsts and exceptional contributions." },
};

export const BADGE_ICONS = [
  "book", "cap", "milestone", "flag", "stack", "spark", "target", "code", "cube", "brush", "growth", "trophy", "award", "project", "crown",
  "chat", "heart", "handshake", "people", "ticket", "compass", "user", "cohort", "bolt", "mic", "star", "rocket",
] as const;
export type BadgeIcon = (typeof BADGE_ICONS)[number];

export type AwardedBy = "auto" | "issuer" | "enski";
export type BadgeDefinition = {
  id: string;
  name: string;
  category: BadgeCategory;
  icon: BadgeIcon;
  description: string;
  criteria: string;
  awardedBy: AwardedBy;
  /** Custom badges only: the creator who made it and optional uploaded artwork (data URL). */
  owner?: string | undefined;
  artwork?: string | undefined;
};

/** Platform badges. Ids of the original learner badges are kept so earned records stay valid. */
export const PLATFORM_BADGES: BadgeDefinition[] = [
  // Learning & Completion
  { id: "first-lesson", name: "First Lesson", category: "learning", icon: "spark", awardedBy: "auto", description: "You started learning on Enski.", criteria: "Complete one lesson or chapter in a resource you own." },
  { id: "finisher", name: "First Course Completed", category: "learning", icon: "flag", awardedBy: "auto", description: "You saw a resource through from start to finish.", criteria: "Complete every lesson in one certificate-eligible resource." },
  { id: "steady-learner", name: "Steady Learner", category: "learning", icon: "book", awardedBy: "auto", description: "Ten lessons in, learning is becoming a habit.", criteria: "Complete 10 lessons or chapters." },
  { id: "learning-milestone", name: "Learning Milestone", category: "learning", icon: "milestone", awardedBy: "auto", description: "Twenty-five lessons completed.", criteria: "Complete 25 lessons or chapters." },
  { id: "knowledge-builder", name: "Knowledge Builder", category: "learning", icon: "stack", awardedBy: "auto", description: "Three resources completed, your skills are stacking up.", criteria: "Complete 3 certificate-eligible resources." },
  { id: "well-rounded", name: "Well Rounded", category: "learning", icon: "star", awardedBy: "auto", description: "You learn on your own and with the community.", criteria: "Complete an eligible resource and attend an eligible event." },
  { id: "course-completed", name: "Course Completed", category: "learning", icon: "award", awardedBy: "issuer", description: "Awarded alongside a creator's certificate of completion.", criteria: "The learner completed every required lesson of the course and received its certificate." },
  { id: "programme-graduate", name: "Programme Graduate", category: "learning", icon: "cap", awardedBy: "issuer", description: "Graduated from a multi-part programme.", criteria: "Completed every course and assessment in the creator's programme." },
  // Skills & Competency
  { id: "skill-mastery", name: "Skill Mastery", category: "skills", icon: "target", awardedBy: "issuer", description: "Demonstrated a skill to a high standard.", criteria: "Passed the creator's skills assessment for the stated skill." },
  { id: "technical-excellence", name: "Technical Excellence", category: "skills", icon: "code", awardedBy: "issuer", description: "Technical work of exceptional quality.", criteria: "Submitted technical work the creator rated excellent against the course rubric." },
  { id: "product-builder", name: "Product Builder", category: "skills", icon: "cube", awardedBy: "issuer", description: "Built and shipped a working product.", criteria: "Shipped a working product or prototype as part of the course." },
  { id: "creative-excellence", name: "Creative Excellence", category: "skills", icon: "brush", awardedBy: "issuer", description: "Outstanding creative work.", criteria: "Produced creative work the creator judged outstanding against the brief." },
  { id: "professional-development", name: "Professional Development", category: "skills", icon: "growth", awardedBy: "issuer", description: "Committed to growing professionally.", criteria: "Completed the creator's professional development track and reflection." },
  // Performance & Achievement
  { id: "top-performer", name: "Top Performer", category: "performance", icon: "trophy", awardedBy: "issuer", description: "Among the very best in the cohort.", criteria: "Finished in the top 10% of the cohort's assessed results." },
  { id: "outstanding-achievement", name: "Outstanding Achievement", category: "performance", icon: "bolt", awardedBy: "issuer", description: "Results well beyond what was asked.", criteria: "Exceeded every course objective, as assessed by the creator." },
  { id: "excellence-award", name: "Excellence Award", category: "performance", icon: "award", awardedBy: "issuer", description: "Consistent excellence across the course.", criteria: "Scored distinction level in every graded part of the course." },
  { id: "best-project", name: "Best Project", category: "performance", icon: "project", awardedBy: "issuer", description: "The standout project of the cohort.", criteria: "Chosen by the creator as the best final project in the cohort." },
  { id: "leadership-excellence", name: "Leadership Excellence", category: "performance", icon: "crown", awardedBy: "issuer", description: "Led others to better results.", criteria: "Led a team or group project that met its goals, as observed by the creator." },
  // Community & Participation
  { id: "profile-ready", name: "Profile Ready", category: "community", icon: "user", awardedBy: "auto", description: "Set up your learner profile so creators know who they're teaching.", criteria: "Add your full name, display name, email and a short bio." },
  { id: "rsvp", name: "Saved a Seat", category: "community", icon: "ticket", awardedBy: "auto", description: "You committed to learning live with others.", criteria: "Register for an eligible event." },
  { id: "show-up", name: "Showed Up", category: "community", icon: "compass", awardedBy: "auto", description: "You attended your first Enski event.", criteria: "Attend one eligible event." },
  { id: "community-regular", name: "Community Regular", category: "community", icon: "people", awardedBy: "auto", description: "A familiar face at Enski events.", criteria: "Attend 3 eligible events." },
  { id: "active-contributor", name: "Active Contributor", category: "community", icon: "chat", awardedBy: "issuer", description: "Regularly adds to discussions.", criteria: "Contributed helpful posts or answers in at least 5 course discussions." },
  { id: "community-champion", name: "Community Champion", category: "community", icon: "heart", awardedBy: "issuer", description: "Lifts the whole community.", criteria: "Consistently welcomed, supported and encouraged other learners over the course." },
  { id: "collaboration-award", name: "Collaboration Award", category: "community", icon: "handshake", awardedBy: "issuer", description: "A great teammate.", criteria: "Made a strong contribution to a group project, confirmed by the team or creator." },
  { id: "peer-recognition", name: "Peer Recognition", category: "community", icon: "people", awardedBy: "issuer", description: "Recognised by fellow learners.", criteria: "Nominated by at least 3 fellow learners in the cohort." },
  // Special Recognition
  { id: "first-cohort", name: "First Cohort", category: "special", icon: "cohort", awardedBy: "issuer", description: "Part of a programme's very first cohort.", criteria: "Enrolled in and completed the first ever run of the programme." },
  { id: "early-achiever", name: "Early Achiever", category: "special", icon: "rocket", awardedBy: "auto", description: "Finished fast.", criteria: "Complete a certificate-eligible resource within 7 days of getting it." },
  { id: "outstanding-facilitator", name: "Outstanding Facilitator", category: "special", icon: "mic", awardedBy: "enski", description: "Recognises exceptional teaching on Enski.", criteria: "Awarded by the Enski team to creators with consistently excellent learner reviews and outcomes." },
  { id: "special-recognition", name: "Special Recognition", category: "special", icon: "star", awardedBy: "issuer", description: "An honour for a contribution that deserves its own mention.", criteria: "A specific, exceptional contribution described by the creator when awarding it." },
];

export const awardedByLabel: Record<AwardedBy, string> = {
  auto: "Earned automatically when the criteria are met",
  issuer: "Awarded by a creator who confirms the criteria",
  enski: "Awarded only by the Enski team",
};

export const findPlatformBadge = (id: string) => PLATFORM_BADGES.find((b) => b.id === id);

/** Stable badge credential ID, e.g. "ENB-7F3K-92QD". */
export function badgeCredentialId(seed: string) {
  const abc = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  let out = "";
  for (let i = 0; i < 8; i++) { h = Math.imul(h ^ (h >>> 13), 0x5bd1e995); out += abc[(h >>> 0) % abc.length]; }
  return `ENB-${out.slice(0, 4)}-${out.slice(4)}`;
}
