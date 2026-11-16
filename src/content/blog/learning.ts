import cohortImg from "@/assets/blog/cohort-learning.webp";
import firstCourseImg from "@/assets/blog/first-course.webp";
import habitImg from "@/assets/blog/learning-habit.webp";
import { editorial, type PostSource } from "./types";

export const cohortLearning: PostSource = {
  slug: "why-cohort-based-learning-works",
  title: "Why cohort-based learning works",
  excerpt:
    "Accountability, community and live feedback: why learning with a group helps people finish, and how to get the most from your next cohort.",
  category: "Learning",
  author: editorial,
  date: "2026-08-09",
  image: cohortImg,
  imageAlt: "A group of young learners laughing and working together around a table with laptops",
  takeaways: [
    "Cohorts work because of three forces: shared deadlines, peers and live feedback.",
    "Self-paced is flexible; cohorts are better when you need momentum and accountability.",
    "You get out what you put in: show up live, share work early, help others.",
  ],
  body: [
    {
      type: "p",
      text: "Most people underestimate how much a clear plan changes the outcome of learning online. Many of us have bought a self-paced course with good intentions and never finished it. It wasn't the content that failed. It was the lack of structure around it. Cohort-based learning fixes that by adding people, time and feedback.",
    },
    { type: "h2", text: "What is a cohort?" },
    {
      type: "p",
      text: "A cohort is a group of learners who start and finish a programme together, on a shared schedule. There are usually live sessions, assignments with deadlines, and a space to talk with classmates and the instructor.",
    },
    { type: "h2", text: "The three forces that make cohorts work" },
    { type: "h3", text: "1. Shared deadlines create momentum" },
    {
      type: "p",
      text: "“Someday” is the enemy of learning. When the next live session is on Thursday and everyone is presenting their work, you find the time. Deadlines turn intention into action.",
    },
    { type: "h3", text: "2. Peers create accountability and belonging" },
    {
      type: "p",
      text: "Learning alone is lonely, especially when you're stuck. In a cohort, you see others struggling with the same thing, you explain ideas to each other, and you don't want to be the one who disappears. Many learners leave with friends, collaborators and future colleagues.",
    },
    { type: "h3", text: "3. Live feedback speeds up learning" },
    {
      type: "p",
      text: "Watching someone else do a thing is not the same as doing it and being corrected. Cohorts give you real-time answers and feedback on your actual work, so you fix mistakes before they become habits.",
    },
    { type: "h2", text: "Cohort or self-paced?" },
    {
      type: "pairs",
      left: "Choose a cohort if…",
      right: "Choose self-paced if…",
      items: [
        ["You've started courses before and not finished", "You're highly self-motivated"],
        ["You want feedback on your work", "You need to learn at odd hours"],
        ["You want to build a network", "You only need one specific skill quickly"],
        ["You can commit to a schedule for a few weeks", "Your schedule changes week to week"],
      ],
    },
    { type: "h2", text: "How to get the most from your cohort" },
    {
      type: "ol",
      items: [
        "**Block the live sessions in your calendar** before the cohort starts.",
        "**Introduce yourself early** and say what you want to achieve.",
        "**Share unfinished work.** Feedback on a draft is worth more than praise on a final.",
        "**Help someone else.** Explaining is one of the fastest ways to learn.",
        "**Keep in touch afterwards.** Your cohort is the start of your network, not the end of the course.",
      ],
    },
    {
      type: "quote",
      text: "Content teaches you what to do. A cohort helps you actually do it.",
    },
  ],
};

export const firstCourse: PostSource = {
  slug: "choosing-your-first-online-course",
  title: "Choosing your first online course",
  excerpt:
    "A practical checklist for picking a course that matches your goals, budget and schedule, and avoiding the ones that waste your time.",
  category: "Learning",
  author: editorial,
  date: "2026-08-05",
  image: firstCourseImg,
  imageAlt: "Hands holding a phone showing a grid of online courses next to a notebook with a checklist",
  takeaways: [
    "Start from your goal and your schedule, then look for a course.",
    "Check the outcome, the instructor's real experience and a sample lesson before you pay.",
    "Make sure the format fits your life: live, self-paced, length and data needs.",
  ],
  body: [
    {
      type: "p",
      text: "Most people underestimate how much a clear plan changes the outcome of their first course. With so many options, it's easy to buy the one with the loudest ads instead of the one that fits you. Use this checklist before you spend money or time.",
    },
    { type: "h2", text: "1. Be clear about your goal" },
    {
      type: "p",
      text: "Write down why you want to learn: get a new job, get a promotion, start freelancing, launch a business, or simply explore. A course that's perfect for exploring may be too shallow for a career switch, and a professional programme may be overwhelming if you're just curious.",
    },
    { type: "h2", text: "2. Check the promised outcome" },
    {
      type: "ul",
      items: [
        "Does the course say exactly what you'll be able to do at the end?",
        "Is there a final project you can show others?",
        "Is the level right for you: beginner, intermediate or advanced?",
      ],
    },
    { type: "h2", text: "3. Look at the instructor" },
    {
      type: "p",
      text: "Does the instructor actually do this work? Look for real projects, a public profile and a teaching style you enjoy. Watch a free lesson, a webinar or their posts. If you can't understand them in a free video, a paid one won't be different.",
    },
    { type: "h2", text: "4. Make sure it fits your life" },
    {
      type: "ul",
      items: [
        "**Time:** How many hours a week does it need? Be honest about what you have.",
        "**Format:** Live sessions, self-paced videos, or a mix?",
        "**Device and data:** Can you follow on your phone? Can you download lessons?",
        "**Support:** Is there somewhere to ask questions?",
      ],
    },
    { type: "h2", text: "5. Weigh the price against the outcome" },
    {
      type: "p",
      text: "The cheapest course isn't always the best value, and the most expensive isn't always the best. Ask: if this course delivers what it promises, what is that worth to me? Check the refund policy before you pay.",
    },
    {
      type: "callout",
      title: "Red flags",
      text: "Guaranteed income promises, countdown timers that reset, no named instructor, no sample content and no clear description of what you'll learn.",
    },
    { type: "h2", text: "6. Commit before you start" },
    {
      type: "p",
      text: "Once you buy, schedule your learning time for the first two weeks straight away. The first lessons decide whether you'll finish. Tell a friend or join the course community so someone notices if you go quiet.",
    },
  ],
};

export const learningHabit: PostSource = {
  slug: "how-to-build-a-learning-habit-that-sticks",
  title: "How to build a learning habit that sticks",
  excerpt:
    "Five small routines that turn good intentions into a daily study habit, even with a full-time job and a busy life.",
  category: "Learning",
  author: editorial,
  date: "2026-08-01",
  image: habitImg,
  imageAlt: "A desk at sunrise with tea, a notebook with a habit tracker, headphones and a phone timer",
  takeaways: [
    "Make the habit small enough that you can't say no to it.",
    "Attach learning to something you already do every day.",
    "Track streaks, but plan for missed days instead of quitting after one.",
  ],
  body: [
    {
      type: "p",
      text: "Most people underestimate how much a clear plan changes the outcome of learning. Motivation is great for starting, but habits are what get you to the finish line. Here are five routines that make learning part of your day instead of something you keep meaning to do.",
    },
    { type: "h2", text: "1. Start ridiculously small" },
    {
      type: "p",
      text: "Commit to 15 minutes, or even one lesson, a day. Small goals feel almost too easy, which is the point. On good days you'll do more. On bad days you'll still show up, and showing up is the habit.",
    },
    { type: "h2", text: "2. Stack it onto an existing routine" },
    {
      type: "p",
      text: "Attach learning to something you already do: after your morning tea, during your commute, right after dinner. The existing routine becomes the reminder. “After I make tea, I watch one lesson” is easier to keep than “I'll study sometime today”.",
    },
    { type: "h2", text: "3. Prepare your space the night before" },
    {
      type: "ul",
      items: [
        "Download tomorrow's lesson so data or Wi-Fi isn't an excuse.",
        "Leave your notebook open on the table.",
        "Put your phone on focus mode during study time.",
      ],
    },
    { type: "h2", text: "4. Use a timer and a tracker" },
    {
      type: "p",
      text: "Set a timer for 25 minutes of focus, then take a five-minute break. Tick a box in a simple tracker after each session. Watching the chain grow is surprisingly motivating.",
    },
    {
      type: "callout",
      title: "Never miss twice",
      text: "Missing one day is normal. Missing two starts a new habit: not learning. If you miss a day, make tomorrow's session non-negotiable, even if it's only five minutes.",
    },
    { type: "h2", text: "5. Learn with others and share progress" },
    {
      type: "p",
      text: "Join a study group, a cohort or the Dreamers Trybe. Share what you learned each week. When others expect to hear from you, you're more likely to keep going, and you'll pick up ideas from them too.",
    },
    { type: "h2", text: "Put it together" },
    {
      type: "ol",
      items: [
        "Pick your daily trigger (for example, morning tea).",
        "Choose your minimum (for example, one lesson or 15 minutes).",
        "Prepare tonight.",
        "Track every session.",
        "Tell one person what you're learning.",
      ],
    },
    {
      type: "quote",
      text: "Small sessions, repeated often, beat big plans you never start.",
    },
  ],
};
