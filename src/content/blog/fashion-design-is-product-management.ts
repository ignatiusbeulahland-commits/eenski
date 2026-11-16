import image from "@/assets/blog/fashion-product-management.webp";
import { beulahland, type PostSource } from "./types";

export const fashionDesignIsProductManagement: PostSource = {
  slug: "fashion-design-is-product-management",
  title: "Fashion design is product management: you've been building products all along",
  excerpt:
    "Every brief, toile and fitting is a product decision. Here is how the craft of making clothes maps, step by step, onto the craft of building products people love, and how to use that to grow.",
  category: "Design & Product",
  author: beulahland,
  date: "2026-08-23",
  image,
  imageAlt:
    "A designer's table with fashion sketches, cobalt and lime fabric swatches, sticky notes laid out like a roadmap and a laptop showing a task board",
  takeaways: [
    "A garment is a product: it is hired by a real person to do a real job, and it succeeds or fails on that job.",
    "The fashion workflow (brief, mood board, sketch, toile, fitting, tech pack, collection, launch) mirrors the product workflow almost one to one.",
    "Fashion designers already practise discovery, prototyping, user testing, prioritisation and cross-team delivery; they just call it something else.",
    "Translate your process into product language and you can tell a stronger story to clients, employers and your own team.",
  ],
  body: [
    {
      type: "p",
      text: "Walk into any fashion studio the week before a launch and you will see the same thing you see in a product team before a release: a wall of sticky notes, a pile of half-finished prototypes, a list of things that must ship and a longer list of things that will have to wait. Someone is arguing about cost. Someone is worried about the deadline. Someone is quietly fixing a problem nobody else has noticed yet.",
    },
    {
      type: "p",
      text: "That is not a coincidence. **Fashion design is product management with fabric.** The vocabulary is different, but the thinking underneath is the same: understand a person deeply, decide what to build for them, test it before you commit, work with a team to make it real, then learn from what happens after it leaves your hands.",
    },
    {
      type: "p",
      text: "If you design clothes, this article will show you that you already have skills the tech world pays for. If you build software, it will show you a craft that has been solving your problems for centuries, with scissors instead of code.",
    },

    { type: "h2", text: "A garment is a product, and someone hires it to do a job" },
    {
      type: "p",
      text: "Product managers talk about “jobs to be done”: people don't buy a drill, they hire it to make a hole. Clothes work the same way. Nobody buys a wrap dress because it is a wrap dress. She hires it to feel confident in a board meeting, to survive a ten-hour wedding, to move from the office to dinner without changing, to look like herself in photos she will keep for years.",
    },
    {
      type: "p",
      text: "When you start a design by asking **“what job is this piece being hired to do?”**, everything sharpens. Fabric choice becomes a decision about heat, movement and care. The neckline becomes a decision about who she is meeting and how she wants to be seen. Pockets stop being a detail and become a feature with a clear reason to exist.",
    },
    {
      type: "callout",
      title: "Try this",
      text: "Before your next sketch, write one sentence: “She is hiring this piece to ___ when ___.” If you can't fill the blanks, you're not ready to draw yet. Product managers call this a problem statement.",
    },

    { type: "h2", text: "The brief is your problem statement" },
    {
      type: "p",
      text: "Every good collection starts with a brief, whether it comes from a client, a buyer or your own notebook. A strong brief answers the same questions a product brief does:",
    },
    {
      type: "ul",
      items: [
        "**Who is it for?** Not “women 25–40”, but a person you can picture: her work, her weekends, her budget, the occasions on her calendar.",
        "**What problem are we solving?** Her current clothes are too hot, too fussy, too formal, too forgettable, too hard to find in her size.",
        "**What does success look like?** She wears it again. She tells a friend. She comes back for the next drop.",
        "**What are the constraints?** Budget per piece, fabric availability, production time, the skills of the tailors you work with.",
      ],
    },
    {
      type: "p",
      text: "In a product team, skipping this step is how you end up building features nobody asked for. In a studio, it is how you end up with a beautiful rail of clothes that doesn't sell. The brief protects you from your own excitement.",
    },

    { type: "h2", text: "Mood boards and market walks are discovery research" },
    {
      type: "p",
      text: "Before a product team writes a line of code, it does discovery: interviews, observation, looking at what competitors do and where people are frustrated. Fashion designers do this instinctively.",
    },
    {
      type: "p",
      text: "A walk through a busy fabric market is competitor and supply research. Scrolling the comments under a celebrity's outfit is sentiment analysis. Asking a client why she never wears the jumpsuit she loved in the shop is a user interview. The mood board that comes out of it is a research synthesis: patterns, references and emotions pulled into one place so the team can align on direction.",
    },
    {
      type: "quote",
      text: "Discovery isn't a phase you finish. It's the habit of staying curious about the person you're designing for.",
    },
    {
      type: "p",
      text: "The lesson both crafts share: **separate what people say from what they do.** A client might say she wants bold colour, then reach for navy every single time. Watch the behaviour, then ask about it. That gap is where the best ideas live.",
    },

    { type: "h2", text: "Sketches are wireframes, toiles are prototypes" },
    {
      type: "p",
      text: "Nobody cuts expensive aso-oke or silk on the first idea. You sketch. Then you make a toile, a test version in cheap calico or muslin, to check the shape on a real body. Only when the toile works do you cut the real fabric.",
    },
    {
      type: "p",
      text: "This is exactly how product teams de-risk ideas. A sketch is a low-fidelity wireframe: fast, cheap, easy to throw away. A toile is a clickable prototype: real enough to test, cheap enough to change. The final garment is the shipped product. Each step costs more than the last, so you want your mistakes to happen as early as possible.",
    },
    {
      type: "ol",
      items: [
        "**Sketch many, choose few.** Ten rough sketches beat one perfect one. You're exploring the problem, not decorating it.",
        "**Prototype the riskiest part first.** If the drape of a sleeve is the whole idea, toile the sleeve before anything else.",
        "**Make it easy to say no.** The cheaper the prototype, the more honest the feedback, and the less painful it is to start again.",
      ],
    },

    { type: "h2", text: "The fitting room is user testing" },
    {
      type: "p",
      text: "A fitting is a usability test with a human being in the lab. You don't just check whether the garment closes. You ask her to sit down, raise her arms, climb into a car, dance the way she'll dance at the owambe. You watch where the fabric pulls, where she tugs, where her face changes.",
    },
    {
      type: "p",
      text: "Great product people run user tests the same way: give someone a real task, stay quiet, and observe. The tug at a waistband is the same signal as a user hovering over a button they can't understand. **Friction is feedback.** Your job is to notice it, not to explain it away.",
    },
    {
      type: "callout",
      title: "A fitting checklist you can reuse for any product",
      text: "Give a real task. Watch before you ask. Note every hesitation. Ask “what did you expect to happen?” Fix the biggest friction first, then test again.",
    },

    { type: "h2", text: "The tech pack is your product requirements document" },
    {
      type: "p",
      text: "When a design goes to production, it travels with a tech pack: flat drawings, measurements for every size, fabric and trim specifications, stitch types, tolerances and care instructions. A pattern cutter or factory you have never met should be able to build the garment from it, exactly as you intended.",
    },
    {
      type: "p",
      text: "That is a product requirements document. It turns a vision into clear, testable instructions for the people who will build it. And just like a PRD, a vague tech pack produces expensive surprises: the wrong zip, a hem two centimetres short, a colour that is “close enough” but not right.",
    },
    {
      type: "ul",
      items: [
        "**Be specific about what “done” means.** Tolerances in a tech pack are acceptance criteria in a PRD.",
        "**Explain the why, not only the what.** A tailor who knows the dress must survive a long ceremony will make better decisions about reinforcement.",
        "**Keep one source of truth.** Changes that live only in a voice note get lost. Update the document.",
      ],
    },

    { type: "h2", text: "Collections are roadmaps, seasons are release cycles" },
    {
      type: "p",
      text: "You can't make everything at once. A collection forces choices: which pieces carry the story, which are commercial staples, which are statement experiments, and which ideas wait for next season. That is roadmap prioritisation.",
    },
    {
      type: "p",
      text: "Many designers start with a capsule, a small, tight set of pieces that work together. In product language, that is a minimum viable product: the smallest thing you can release that still delivers real value and teaches you what to build next. A capsule that sells out tells you more than a fifty-piece collection that sits on the rail.",
    },
    {
      type: "p",
      text: "Every collection also lives inside the same three-way tension every product does: **quality, cost and time.** Faster production usually means simpler construction or higher cost. Premium fabric means a higher price or a thinner margin. Product managers call this trade-off thinking. Designers call it Tuesday.",
    },

    { type: "h2", text: "Production is cross-functional delivery" },
    {
      type: "p",
      text: "No designer ships a collection alone. There are pattern cutters, tailors, embroiderers, fabric suppliers, photographers, stylists, models and the person who handles deliveries. Each has their own expertise, their own constraints and their own definition of “ready”.",
    },
    {
      type: "p",
      text: "Coordinating them is the heart of product management: making sure everyone understands the goal, unblocking the person who is stuck, deciding quickly when something has to give, and protecting the quality of the final experience. The designer who checks in with the workshop every morning is running a stand-up, whether or not she calls it that.",
    },

    { type: "h2", text: "Launch, listen, iterate" },
    {
      type: "p",
      text: "The product isn't finished when it ships. It's finished when you've learned from it. In fashion, the signals are everywhere: which sizes sell out, which pieces come back for alterations, which photos people save, which questions keep appearing in your DMs.",
    },
    {
      type: "p",
      text: "Treat those signals like product analytics. An alteration request that keeps repeating is a bug report. A piece customers buy in three colours is a sign of product–market fit. The next version of your bestselling silhouette is version two of a successful feature: same core job, better execution.",
    },

    { type: "h2", text: "The translation guide" },
    {
      type: "p",
      text: "Here is the same workflow in two languages. Keep it handy when you're writing a portfolio, pitching a client or explaining your process to a team that speaks “tech”.",
    },
    {
      type: "pairs",
      left: "In the studio",
      right: "In a product team",
      items: [
        ["Client or design brief", "Problem statement and goals"],
        ["Mood board and market walks", "Discovery research and synthesis"],
        ["Sketches and croquis", "Wireframes and low-fidelity concepts"],
        ["Toile or muslin", "Prototype"],
        ["Fittings", "Usability testing"],
        ["Tech pack", "Product requirements document"],
        ["Capsule collection", "Minimum viable product"],
        ["Collection plan across seasons", "Product roadmap and releases"],
        ["Workshop and supplier coordination", "Cross-functional delivery"],
        ["Alterations, returns and repeat buyers", "Feedback, bugs and retention"],
      ],
    },

    { type: "h2", text: "What product people can learn from designers" },
    {
      type: "p",
      text: "The bridge runs both ways. Fashion has a few habits that many product teams could use more of:",
    },
    {
      type: "ul",
      items: [
        "**Taste is a skill, not a luxury.** Designers train their eye for years. Products built with taste feel trustworthy before anyone reads a word.",
        "**The body is the ultimate constraint.** Clothes must work on real, different bodies. Products must work for real, different people: different devices, data budgets, abilities and contexts.",
        "**Craft shows in the details nobody asked for.** A finished inside seam is the same kind of care as a thoughtful empty state or a clear error message.",
        "**Emotion is a requirement.** People don't just need clothes to function; they need them to feel like themselves. The best products understand that too.",
      ],
    },

    { type: "h2", text: "How to use this, starting this week" },
    {
      type: "p",
      text: "Whether you want to grow your fashion brand, move into a product role, or simply explain your work with more confidence, you can start small:",
    },
    {
      type: "ol",
      items: [
        "**Rewrite one project as a case study.** Problem, research, options you explored, what you tested, what you shipped, what you learned. That structure works for a dress and for an app.",
        "**Name your process.** On your website or profile, describe your brief, toile and fitting steps in plain words. Clients trust a process they can see.",
        "**Keep a feedback log.** Every alteration, complaint and compliment goes into one list. Review it before you plan your next collection.",
        "**Start a capsule, not a collection.** Choose three to five pieces that solve one clear problem for one clear person. Ship them, then listen.",
        "**Learn the vocabulary, not a new identity.** You don't have to stop being a designer to think like a product manager. You only need to notice that you already do.",
      ],
    },

    { type: "h2", text: "You were never just making clothes" },
    {
      type: "p",
      text: "Every time you turned a client's half-described feeling into a garment she couldn't stop wearing, you were doing product work: listening, translating, prototyping, testing and delivering under pressure. That is the same muscle that builds great apps, services and businesses.",
    },
    {
      type: "p",
      text: "So the next time someone asks what you do, try saying it out loud: **“I build products people wear.”** Then go build the next one, and share what you learn with the dreamers coming after you.",
    },
  ],
};
