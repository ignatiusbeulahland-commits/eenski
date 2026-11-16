import ebooksImg from "@/assets/blog/ebooks-courses.webp";
import webinarImg from "@/assets/blog/webinar-landing.webp";
import expertiseImg from "@/assets/blog/expertise-course.webp";
import { editorial, type PostSource } from "./types";

export const ebooksVsCourses: PostSource = {
  slug: "ebooks-vs-courses-which-should-you-sell-first",
  title: "Ebooks vs courses: which should you sell first?",
  excerpt:
    "Weighing effort, price and audience expectations for your first digital product, plus a simple way to decide in an afternoon.",
  category: "Creators",
  author: editorial,
  date: "2026-08-21",
  image: ebooksImg,
  imageAlt: "A tablet showing an ebook cover next to a laptop playing a video lesson",
  takeaways: [
    "Ebooks are faster to make and easier to buy; courses take more work but carry more transformation and value.",
    "Choose based on how hard the problem is to solve, not on which format feels more impressive.",
    "Many creators start with an ebook to validate demand, then grow it into a course.",
    "Whatever you choose, sell before you over-build: a waitlist or pre-sale is your best test.",
  ],
  body: [
    {
      type: "p",
      text: "Most people underestimate how much a clear plan changes the outcome of a first product launch. Creators often spend months building the “perfect” course, launch it to silence, and decide selling online doesn't work. Usually the problem wasn't the idea. It was the format, the timing, or the lack of a test.",
    },
    { type: "h2", text: "What each format is really good at" },
    {
      type: "pairs",
      left: "Ebook",
      right: "Course",
      items: [
        ["Quick to create (days to weeks)", "Slower to create (weeks to months)"],
        ["Lower price, easier first purchase", "Higher price, bigger commitment"],
        ["Best for frameworks, checklists, guides", "Best for skills that need practice and feedback"],
        ["Read in one or two sittings", "Followed over days or weeks"],
        ["Minimal tools: writing and design", "Video, audio, slides, exercises, community"],
      ],
    },
    { type: "h2", text: "Ask: how hard is the problem?" },
    {
      type: "p",
      text: "If your audience can solve their problem by reading a clear explanation, sell an ebook. “How to price your first freelance project” or “A 30-day content calendar for small businesses” work well as ebooks.",
    },
    {
      type: "p",
      text: "If they need to watch, practise, get stuck and get unstuck, sell a course. “Learn Figma from scratch” or “Build your first data dashboard” need demonstrations, exercises and probably questions answered along the way.",
    },
    {
      type: "callout",
      title: "Rule of thumb",
      text: "Information can be an ebook. Transformation usually needs a course.",
    },
    { type: "h2", text: "The ebook-first path" },
    {
      type: "p",
      text: "Many successful creators start small. An ebook lets you test whether people will pay for your expertise, learn what questions they ask, and build an email list of buyers. Those buyers become your first course students, and their questions become your course outline.",
    },
    {
      type: "ol",
      items: [
        "Write a focused ebook that solves one specific problem.",
        "Price it so it's an easy yes for your audience.",
        "Collect every question buyers send you.",
        "Turn the most common questions into course modules.",
        "Offer the course to ebook buyers first, as a thank-you.",
      ],
    },
    { type: "h2", text: "When to go straight to a course" },
    {
      type: "ul",
      items: [
        "You already teach this skill one-to-one or in workshops and know where students struggle.",
        "Your audience has asked you directly for a course.",
        "The skill truly cannot be learned without demonstration.",
        "You can pre-sell enough seats to justify the build.",
      ],
    },
    { type: "h2", text: "Test before you build" },
    {
      type: "p",
      text: "Whichever format you choose, describe it on a simple sales page and invite people to join a waitlist or pre-order before you finish. If people sign up, build it. If they don't, you've saved months, and you can ask them why.",
    },
    {
      type: "quote",
      text: "The best first product isn't the most impressive one. It's the one you can actually finish and sell.",
    },
    { type: "h2", text: "Decide this afternoon" },
    {
      type: "p",
      text: "Write the one problem your audience asks you about most. Decide whether it needs information or transformation. Pick the format, write a one-page outline, and put a waitlist live on Enski. You'll learn more from the next two weeks of real responses than from another month of planning.",
    },
  ],
};

export const webinarLandingPages: PostSource = {
  slug: "landing-pages-that-convert-webinar-signups",
  title: "Landing pages that convert webinar signups",
  excerpt:
    "The anatomy of a high-converting registration page for events and webinars, section by section, with copy you can adapt today.",
  category: "Creators",
  author: editorial,
  date: "2026-08-17",
  image: webinarImg,
  imageAlt: "A creator in a cobalt hoodie hosting a live webinar from a home studio with a ring light and microphone",
  takeaways: [
    "One page, one goal: every section should push towards the signup button.",
    "Lead with the outcome attendees will get, not the topic of your talk.",
    "Make the logistics impossible to miss: date, time zone, length, cost.",
    "Follow-up emails turn signups into attendees, so plan them with the page.",
  ],
  body: [
    {
      type: "p",
      text: "Most people underestimate how much a clear plan changes the outcome of a webinar. You can be a brilliant speaker with a valuable topic and still get a handful of signups because the registration page made people work too hard to say yes.",
    },
    { type: "h2", text: "The anatomy of a page that converts" },
    { type: "h3", text: "1. A headline that promises an outcome" },
    {
      type: "p",
      text: "“Instagram Marketing Webinar” describes a topic. “Get your first 10 paying clients from Instagram in 30 days” describes a result. Write the result your ideal attendee wants, in their words.",
    },
    { type: "h3", text: "2. Logistics above the fold" },
    {
      type: "p",
      text: "Date, time with time zone, length, format (live or replay) and price should be visible without scrolling. Uncertainty kills signups. If your audience spans countries, show the time in their local zone or list the main ones.",
    },
    { type: "h3", text: "3. One clear button, repeated" },
    {
      type: "p",
      text: "Use the same action-focused label everywhere, such as “Save my seat”. Put it at the top, after the agenda and at the bottom. Keep the form short: name and email are usually enough.",
    },
    { type: "h3", text: "4. What they'll learn" },
    {
      type: "ul",
      items: [
        "Three to five specific takeaways, written as outcomes.",
        "Who it's for, and who it isn't for. Saying no builds trust.",
        "What they'll leave with: a template, checklist or recording.",
      ],
    },
    { type: "h3", text: "5. Why you" },
    {
      type: "p",
      text: "A short host bio with a friendly photo and one or two real credentials. Focus on the experience that's relevant to this topic, not your whole CV.",
    },
    { type: "h3", text: "6. Honest proof" },
    {
      type: "p",
      text: "If you have real feedback from past attendees or students, use it with their permission. If you're just starting, skip it rather than inventing it. A clear agenda and a genuine host story are more persuasive than vague praise.",
    },
    { type: "h3", text: "7. Answer the doubts" },
    {
      type: "p",
      text: "A short FAQ handles the questions that stop people: “Will there be a replay?”, “Do I need any tools?”, “Is it really free?”",
    },
    {
      type: "callout",
      title: "Mobile first",
      text: "Many of your visitors will arrive from a social app on their phone. Check the page on a small screen with slow data before you share the link.",
    },
    { type: "h2", text: "Turn signups into attendees" },
    {
      type: "p",
      text: "A signup is a promise, not an attendance. Plan your reminder sequence alongside the page:",
    },
    {
      type: "ol",
      items: [
        "**Instant confirmation** with the date, time and calendar link.",
        "**A value email** a few days before: a short tip or question to get them thinking.",
        "**A day-before reminder** with what to prepare.",
        "**An hour-before reminder** with the join link front and centre.",
        "**A replay email** for those who couldn't make it, with a clear next step.",
      ],
    },
    { type: "h2", text: "Measure and improve" },
    {
      type: "p",
      text: "Track how many visitors sign up and how many signups attend. If visitors aren't signing up, test the headline and logistics first. If signups aren't attending, improve your reminders. Change one thing at a time so you know what worked.",
    },
    {
      type: "quote",
      text: "People don't sign up for webinars. They sign up for the person they'll be after it.",
    },
  ],
};

export const expertiseToCourse: PostSource = {
  slug: "turning-expertise-into-a-profitable-course",
  title: "Turning expertise into a profitable course",
  excerpt:
    "From idea validation to launch: a creator playbook for packaging what you know into a course people finish and recommend.",
  category: "Creators",
  author: editorial,
  date: "2026-08-13",
  image: expertiseImg,
  imageAlt: "A creator in a lime sweatshirt drawing a course outline on a whiteboard while a camera records",
  takeaways: [
    "Start with a specific transformation for a specific person, not a broad topic.",
    "Validate with real conversations and pre-sales before you record.",
    "Design backwards from the result: outcome, milestones, then lessons.",
    "Completion is your best marketing; build in support and quick wins.",
  ],
  body: [
    {
      type: "p",
      text: "Most people underestimate how much a clear plan changes the outcome of a course. You don't need to be the world's top expert to teach. You need to be a few steps ahead of your learner, clear about where you're taking them, and committed to getting them there.",
    },
    { type: "h2", text: "1. Define the transformation" },
    {
      type: "p",
      text: "Complete this sentence: **“After this course, [specific person] will be able to [specific result] without [common frustration].”** For example: “After this course, a new freelance designer will be able to price and pitch a project confidently without undercharging.”",
    },
    {
      type: "p",
      text: "If your sentence is vague, your course will be too. Narrow beats broad, especially for a first course.",
    },
    { type: "h2", text: "2. Validate before you build" },
    {
      type: "ul",
      items: [
        "Talk to five to ten people who match your learner. Ask what they've tried and where they got stuck.",
        "Notice the words they use, and use those words in your course and sales page.",
        "Offer a pre-sale or founding cohort at a special price. Real payments are real validation.",
      ],
    },
    {
      type: "callout",
      title: "Founding cohort tip",
      text: "Teach your first version live. You'll discover the confusing parts in real time, and your recordings will be better for it.",
    },
    { type: "h2", text: "3. Design backwards" },
    {
      type: "ol",
      items: [
        "**Outcome:** the transformation you defined.",
        "**Milestones:** the three to six things learners must be able to do to get there.",
        "**Lessons:** the smallest steps that build each milestone.",
        "**Practice:** an exercise or mini-project after every milestone.",
      ],
    },
    {
      type: "p",
      text: "Cut anything that doesn't serve a milestone. Extra content feels generous but often makes learners quit.",
    },
    { type: "h2", text: "4. Record simply" },
    {
      type: "p",
      text: "Good audio matters more than a fancy camera. Keep lessons short and focused on one idea. Show, don't just tell: screen recordings, demonstrations and worked examples. Add a short summary or worksheet so learners can review without rewatching.",
    },
    { type: "h2", text: "5. Price for value" },
    {
      type: "p",
      text: "Price based on the value of the result to your learner, not the number of hours of video. A short course that helps someone win their first client is worth more than a long one that only explains theory. Consider tiers: self-paced, and a higher tier with live support or feedback.",
    },
    { type: "h2", text: "6. Launch, then support completion" },
    {
      type: "p",
      text: "Launch to your warm audience first: past clients, your email list, your community. Then focus on getting students to the finish line with quick early wins, reminders, a place to ask questions and moments to celebrate progress. Students who finish become your best testimonials and your next referrals.",
    },
    {
      type: "quote",
      text: "Your course isn't a library of everything you know. It's a path from where they are to where they want to be.",
    },
  ],
};
