import careerImg from "@/assets/blog/career-switch.webp";
import { editorial, type PostSource } from "./types";

export const careerSwitching: PostSource = {
  slug: "career-switching-into-tech-in-2026",
  title: "Career switching into tech in 2026",
  excerpt:
    "Realistic timelines, the skills that actually transfer, and how to build a portfolio that gets you hired when you're changing careers into technology.",
  category: "Careers",
  author: editorial,
  date: "2026-08-25",
  featured: true,
  image: careerImg,
  imageAlt: "A woman in a cobalt sweater working on code and an app design at a bright desk, writing a plan in her notebook",
  takeaways: [
    "Pick a role, not “tech”. A clear target makes every learning choice easier.",
    "Your previous career is an asset: lead with the problems you already understand.",
    "Plan in phases (foundations, projects, visibility, applications) rather than one long course.",
    "A small portfolio of real, explained projects beats a long list of certificates.",
  ],
  body: [
    {
      type: "p",
      text: "Most people underestimate how much a clear plan changes the outcome of a career switch. The ones who make it are rarely the most talented. They are the ones who chose a direction, learned in public, and kept going through the boring middle when the excitement wore off.",
    },
    {
      type: "p",
      text: "This guide is for teachers, nurses, accountants, bankers, sales people, designers and anyone else wondering whether it's too late to move into technology. It isn't. But it does need a plan.",
    },

    { type: "h2", text: "Step 1: Choose a role, not an industry" },
    {
      type: "p",
      text: "“I want to get into tech” is a wish, not a plan. Tech is an industry with dozens of roles that need very different skills. Start by shortlisting two or three roles and learning what a normal week looks like in each:",
    },
    {
      type: "ul",
      items: [
        "**Product management:** deciding what to build and why, working with designers and engineers.",
        "**UI/UX design:** researching users and designing how products look and work.",
        "**Data analysis:** turning messy data into clear answers for decision makers.",
        "**Software development:** building the product itself, front end, back end or mobile.",
        "**Digital marketing and growth:** getting products in front of the right people.",
        "**Customer success and operations:** keeping users happy and the business running smoothly.",
      ],
    },
    {
      type: "callout",
      title: "Quick test",
      text: "Find three people doing the role on LinkedIn and read what they post for a week. If their problems excite you, you're on the right track. If they bore you, try the next role.",
    },

    { type: "h2", text: "Step 2: Map the skills you already have" },
    {
      type: "p",
      text: "You are not starting from zero. A teacher already explains complex ideas and manages a room. A nurse triages under pressure and documents carefully. A banker understands risk and regulation. A sales person knows how customers really make decisions.",
    },
    {
      type: "p",
      text: "Write down the problems you solved in your current career, then match them to your target role. This becomes your story in interviews: **“I'm moving into product because I spent years seeing what patients needed and what our systems failed to give them.”** That is far stronger than “I took a course”.",
    },

    { type: "h2", text: "Step 3: Plan in phases, with honest timelines" },
    {
      type: "p",
      text: "Switching usually takes months, not weeks, especially if you're learning around a job and family. Breaking it into phases keeps you moving and shows you where you are:",
    },
    {
      type: "ol",
      items: [
        "**Foundations.** Learn the core vocabulary and tools of your role through one structured course or cohort. Don't collect five courses at once.",
        "**Guided projects.** Rebuild or extend projects from your course, then change them enough to make them yours.",
        "**Real projects.** Solve one real problem, ideally from your previous industry, for a real person or organisation.",
        "**Visibility.** Write about what you're learning, share your work and talk to people already in the role.",
        "**Applications.** Apply with a short, focused portfolio, and keep building while you apply.",
      ],
    },

    { type: "h2", text: "Step 4: Build a portfolio that tells a story" },
    {
      type: "p",
      text: "Hiring managers don't want to see that you finished a course. They want to see how you think. Two or three well-explained projects are enough if each one shows:",
    },
    {
      type: "ul",
      items: [
        "The problem and who had it.",
        "What you tried, including what didn't work.",
        "The decisions you made and why.",
        "The result, and what you'd do differently next time.",
      ],
    },
    {
      type: "quote",
      text: "Your portfolio isn't a gallery of finished work. It's evidence of how you solve problems.",
    },

    { type: "h2", text: "Step 5: Learn in public and build your network" },
    {
      type: "p",
      text: "Many roles are filled through referrals and conversations long before a job is posted. Share one thing you learned each week. Comment thoughtfully on posts from people in your target role. Ask for 15-minute chats, and come with specific questions. A community like the Dreamers Trybe can keep you accountable when motivation dips.",
    },

    { type: "h2", text: "Common mistakes to avoid" },
    {
      type: "ul",
      items: [
        "**Endless learning without building.** If you've finished a course and haven't made anything, stop and build.",
        "**Hiding your old career.** It's your differentiator. Use it.",
        "**Applying everywhere at once.** Fifty generic applications usually lose to ten tailored ones.",
        "**Waiting to feel ready.** Nobody does. Apply when you can explain your projects clearly.",
      ],
    },

    { type: "h2", text: "Your first week" },
    {
      type: "p",
      text: "Pick two roles to explore. Follow three people in each. Write a one-paragraph story connecting your current career to one of them. Then choose one foundation course and block learning time in your calendar like a meeting you can't miss. That's it. A career switch is just a lot of small weeks that point in the same direction.",
    },
  ],
};
