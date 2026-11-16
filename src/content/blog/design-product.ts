import fittingImg from "@/assets/blog/fitting-user-research.webp";
import aiImg from "@/assets/blog/ai-prototyping.webp";
import portfolioImg from "@/assets/blog/creative-portfolio.webp";
import { beulahland, type PostSource } from "./types";

export const fittingUserResearch: PostSource = {
  slug: "user-research-is-a-fitting",
  title: "User research is a fitting: how to listen until the product fits",
  excerpt:
    "A good fitting is the best user research session you will ever see. Here is how to run interviews, observe real use and turn what you hear into decisions, the way a tailor does with pins and chalk.",
  category: "Design & Product",
  author: beulahland,
  date: "2026-08-19",
  image: fittingImg,
  imageAlt:
    "A studio table with an open fitting notebook full of interview notes, sticky notes grouped into insights, a tape measure, fabric swatches and a phone showing an app",
  takeaways: [
    "A fitting works because it watches a real person use the product in their real body. Research should do the same.",
    "Ask about the last time something happened, not what people would do in the future.",
    "Watch for the pinch: the moment someone hesitates, adjusts or works around your product is worth more than any compliment.",
    "Turn notes into decisions within 48 hours by grouping them into patterns, problems and next changes.",
  ],
  body: [
    {
      type: "p",
      text: "Every tailor knows that the measurements on paper are never the whole story. Two clients can have the same chest, waist and hip numbers and still need completely different garments. One stands with her shoulders forward after years at a desk. Another lifts her arms all day as a teacher. A third will dance all night in whatever you make. The tape measure gives you data. **The fitting gives you the truth.**",
    },
    {
      type: "p",
      text: "Product teams have a name for that truth-finding moment: user research. And many of them struggle with it. They send long surveys, run interviews that feel like job applications, and end up with a slide deck that changes nothing. Fashion designers, on the other hand, have been running effective research sessions for generations, one pin at a time.",
    },
    {
      type: "p",
      text: "This guide shows you how to borrow the habits of a good fitting and use them to understand the people you design for, whether you are making clothes, courses, apps or services.",
    },

    { type: "h2", text: "Why a fitting is the perfect research session" },
    {
      type: "p",
      text: "Look closely at what happens in a fitting and you will see every principle that good researchers try to teach:",
    },
    {
      type: "ul",
      items: [
        "**It happens in context.** The client wears the garment, moves in it, sits down in it. You are not asking her to imagine it.",
        "**It focuses on behaviour, not opinion.** You watch her tug the hem or lift her arms. What she does matters more than what she says.",
        "**It uses a prototype.** A toile or a tacked garment is cheap to change. Nobody is precious about it yet.",
        "**It ends with clear actions.** Every pin and chalk mark is a decision: take this in, let that out, move this seam.",
      ],
    },
    {
      type: "p",
      text: "If your research sessions do not have all four of these qualities, they are probably producing opinions instead of insight.",
    },

    { type: "h2", text: "Before the session: know what you need to learn" },
    {
      type: "p",
      text: "A tailor never starts a fitting without knowing which questions the garment must answer. Is the shoulder right? Is the length right for the shoes she will wear? Does the fabric move the way we hoped? Research needs the same focus.",
    },
    {
      type: "p",
      text: "Write down **no more than three learning goals** before you speak to anyone. Good goals are specific and connected to a decision you need to make:",
    },
    {
      type: "pairs",
      left: "Vague goal",
      right: "Useful learning goal",
      items: [
        ["Find out what users think of the app", "Learn why people start a course but stop before lesson two"],
        ["Understand our customers", "Learn how small business owners currently track orders each week"],
        ["Get feedback on the design", "See whether first-time visitors can find the price without help"],
      ],
    },
    {
      type: "callout",
      title: "Who to invite",
      text: "Choose five to eight people who have the problem you are solving right now. Not friends who will be kind, and not experts who will redesign it for you. Five honest sessions usually reveal most of the big problems.",
    },

    { type: "h2", text: "During the session: ask about the last time" },
    {
      type: "p",
      text: "The most common research mistake is asking people to predict the future. “Would you use this?” “Would you pay for that?” People are generous and hopeful when they answer hypothetical questions. Their real behaviour is far less generous.",
    },
    {
      type: "p",
      text: "A tailor doesn't ask “Will you wear this to work?” She asks “What did you wear to work on Monday, and what bothered you about it?” Do the same. Anchor every question in a real, recent moment:",
    },
    {
      type: "ul",
      items: [
        "“Tell me about the last time you tried to learn something new online. Where were you? What happened?”",
        "“Walk me through how you handled your last customer order, from the first message to delivery.”",
        "“When did you last give up on an app? What were you trying to do at that moment?”",
        "“What did you do instead?” (This one reveals your real competitors.)",
      ],
    },
    {
      type: "p",
      text: "Then be quiet. Silence is the researcher's best tool. A pause of three or four seconds after an answer often brings out the detail that matters most.",
    },

    { type: "h2", text: "Watch for the pinch" },
    {
      type: "p",
      text: "In a fitting, the most important signal is rarely spoken. It is the small adjustment: the client pulling the neckline up, smoothing the fabric over her stomach, rolling her shoulders because something feels tight. Experienced designers call it reading the body. In product work, we call it observing friction.",
    },
    {
      type: "p",
      text: "When you test a product with someone, look for these moments and write them down exactly as they happen:",
    },
    {
      type: "ol",
      items: [
        "**Hesitation.** The cursor hovers. The finger stops. They read the same line twice.",
        "**Workarounds.** They screenshot something to remember it, or switch to WhatsApp to ask a question your product should answer.",
        "**Apologies.** “Sorry, I'm not good with technology.” That is never their fault. It is a design problem.",
        "**Surprise.** “Oh, I didn't know it could do that.” Something valuable is hidden.",
      ],
    },
    {
      type: "quote",
      text: "A compliment tells you someone is polite. A pinch tells you where to put the next pin.",
    },

    { type: "h2", text: "Pin it, don't fix it in the room" },
    {
      type: "p",
      text: "Good tailors don't start cutting fabric in the middle of a fitting. They pin, chalk and note, then make changes later with a clear head. Researchers should resist the urge to explain, defend or redesign while the participant is still talking.",
    },
    {
      type: "p",
      text: "If someone struggles, don't rescue them straight away. Ask “What are you looking for right now?” or “What did you expect to happen?” Their answer is your chalk mark. Write it down with the exact words they used, because their words often become your best interface copy later.",
    },

    { type: "h2", text: "After the session: from chalk marks to decisions" },
    {
      type: "p",
      text: "Notes that sit in a notebook help nobody. Within 48 hours of your last session, while the memories are fresh, turn your observations into decisions using a simple three-step method:",
    },
    {
      type: "ol",
      items: [
        "**Write one observation per sticky note.** One behaviour, quote or problem each. Keep the participant's own words where you can.",
        "**Group them into patterns.** Move notes around until clusters appear: “confused by pricing”, “wants to learn on the bus”, “trusts recommendations from friends”.",
        "**Name the change each pattern demands.** Every cluster ends with an action, just like a pin. Show the price on the first screen. Make lessons downloadable. Add sharing.",
      ],
    },
    {
      type: "p",
      text: "Then rank those changes by how many people they affect and how painful the problem was. That ranked list is your next sprint, your next collection, or your next version of the course.",
    },

    { type: "h2", text: "A simple research script you can use this week" },
    {
      type: "callout",
      title: "The 30-minute fitting",
      text: "5 minutes: welcome them and explain there are no wrong answers. 10 minutes: ask about the last time they faced the problem. 10 minutes: let them try your prototype while you watch silently. 5 minutes: ask what surprised them and what they would change first. Thank them, and tell them what you will do with their help.",
    },
    {
      type: "p",
      text: "You do not need a lab, a big budget or a research team. You need a real person, a real prototype and the patience to watch more than you talk.",
    },

    { type: "h2", text: "Design until it fits" },
    {
      type: "p",
      text: "A garment that fits feels like it was made for you, because it was. The same is true for products. People can feel when a team has truly listened to them: the language is familiar, the steps make sense, and the thing they need is exactly where they reach for it.",
    },
    {
      type: "p",
      text: "So treat every research session like a fitting. Bring a prototype you are willing to change. Watch the body, not just the words. Pin what you learn, and come back with something that fits a little better each time. **That is how good products, and good clothes, are made.**",
    },
  ],
};

export const aiPrototyping: PostSource = {
  slug: "ai-prototyping-for-designers",
  title: "From sketch to working prototype with AI: a practical guide for designers",
  excerpt:
    "AI tools now let designers turn a paper sketch into something people can click, test and even use. Here is a step-by-step workflow, the prompts that help, and the judgement AI can't replace.",
  category: "Design & Product",
  author: beulahland,
  date: "2026-08-15",
  image: aiImg,
  imageAlt:
    "A pencil sketch of a product page on paper in front of a laptop showing the same page as a finished prototype, with a tablet, fabric swatches and fashion sketches on a cork board",
  takeaways: [
    "AI is a fast pattern cutter, not the designer. Your taste, research and judgement decide what gets built.",
    "Start on paper: a clear sketch and a one-paragraph brief make AI output dramatically better.",
    "Prompt in small steps, one screen or change at a time, and review every result like a toile.",
    "Test the AI prototype with real people before you polish it. Speed only matters if you learn faster.",
  ],
  body: [
    {
      type: "p",
      text: "For a long time, the gap between a designer's idea and something people could actually use was enormous. You sketched, you made mock-ups, then you waited for developers to have time. Many good ideas died in that waiting room.",
    },
    {
      type: "p",
      text: "AI building tools have shrunk that gap from months to hours. Today a designer can describe a product in plain language, upload a sketch, and get a working prototype that runs in the browser: real buttons, real forms, real pages. **That changes who gets to build.** It also raises an important question: if a machine can produce the screens, what is the designer's job now?",
    },
    {
      type: "p",
      text: "The answer, as any fashion designer will tell you, is the same as it has always been. A pattern cutter can produce a pattern. Only the designer knows whether it is the right garment for the person who will wear it.",
    },

    { type: "h2", text: "What AI does well, and what it can't do for you" },
    {
      type: "pairs",
      left: "AI is great at",
      right: "You are still responsible for",
      items: [
        ["Turning a description into a first layout", "Knowing which problem is worth solving"],
        ["Generating many variations quickly", "Choosing the one that fits your user"],
        ["Writing placeholder copy and sample data", "Making the words sound like your brand and your audience"],
        ["Building forms, lists and navigation", "Deciding what to leave out"],
        ["Fixing small layout bugs on request", "Noticing when something feels wrong"],
      ],
    },
    {
      type: "p",
      text: "Think of AI as the fastest assistant in the studio. It cuts, tacks and sews whatever you describe, without tiring. But it will happily sew a sleeve on backwards if that is what you asked for. **Clarity in, quality out.**",
    },

    { type: "h2", text: "Step 1: Sketch first, on paper" },
    {
      type: "p",
      text: "It is tempting to open an AI tool and start typing. Resist. Ten minutes with a pencil will save you hours of prompting. Sketch the key screens as boxes and labels: what the person sees first, what they tap, where they end up.",
    },
    {
      type: "p",
      text: "Paper keeps you focused on the flow instead of colours and fonts. It is the croquis of product design: rough, fast and honest about the shape of the idea.",
    },

    { type: "h2", text: "Step 2: Write a one-paragraph brief" },
    {
      type: "p",
      text: "Every collection starts with a brief. So should every prototype. Before your first prompt, write a short paragraph that answers four questions:",
    },
    {
      type: "ol",
      items: [
        "**Who is it for?** “Independent fashion designers in Lagos who take custom orders on Instagram.”",
        "**What job does it do?** “Helps them collect client measurements and order details in one place.”",
        "**What does success look like?** “A client can submit measurements in under three minutes from their phone.”",
        "**What is the feeling?** “Calm, warm and professional, like a good boutique.”",
      ],
    },
    {
      type: "callout",
      title: "Why this matters",
      text: "AI tools fill every gap you leave with generic choices. A specific brief, with a real person, a real job and a real feeling, is the difference between a prototype that looks like every other app and one that looks like yours.",
    },

    { type: "h2", text: "Step 3: Build one screen at a time" },
    {
      type: "p",
      text: "Ask for the whole product in one prompt and you will get a rushed, average result. Instead, build in small, reviewable steps, exactly as you would fit a garment section by section:",
    },
    {
      type: "ul",
      items: [
        "Start with the most important screen, usually the one where the main job happens.",
        "Describe the layout from top to bottom, using your sketch: “At the top, the brand name. Below it, a short welcome line. Then a form with these fields…”",
        "Name your colours, fonts and tone if you have a brand guide. If not, describe the mood in plain words.",
        "Once one screen feels right, move to the next. Ask the tool to keep the same style.",
      ],
    },
    {
      type: "p",
      text: "When something is wrong, be specific about the fix. “Make it better” gives the tool nothing to work with. “The button is hard to see on mobile; make it full width and move it above the fold” gives it a clear chalk mark.",
    },

    { type: "h2", text: "Step 4: Review it like a toile" },
    {
      type: "p",
      text: "A toile is not the final garment, but you still inspect every seam. Review your AI prototype with the same care before you show it to anyone:",
    },
    {
      type: "ul",
      items: [
        "**Use it on your phone.** Most of your audience will. Check that text is readable and buttons are easy to tap.",
        "**Read every word aloud.** AI-written copy is often too long or too formal. Rewrite it in your audience's language.",
        "**Try to break it.** Leave fields empty, enter strange values, press back. Note what happens.",
        "**Check what's missing.** Error messages, empty states and confirmations are the finished inside seams of a product. AI often skips them unless you ask.",
      ],
    },

    { type: "h2", text: "Step 5: Put it in front of real people" },
    {
      type: "p",
      text: "The biggest gift AI gives designers is not speed for its own sake. It is the ability to **test real ideas with real people much earlier**. A clickable prototype on someone's own phone tells you more in ten minutes than a week of debating in a meeting.",
    },
    {
      type: "p",
      text: "Share the link with three to five people who have the problem. Ask them to complete the main task while you watch. Note every hesitation and workaround. Then go back to the tool and make the next round of changes. Each loop of build, test and adjust should take days, not months.",
    },

    { type: "h2", text: "Responsible building: a short checklist" },
    {
      type: "p",
      text: "Moving fast is exciting, but people will trust what you make with their time, money and personal information. Keep these habits from day one:",
    },
    {
      type: "ol",
      items: [
        "**Only collect what you need.** If you don't need someone's date of birth, don't ask for it.",
        "**Use sample data while testing.** Never paste real clients' details into a tool unless you know where it is stored.",
        "**Be honest about what's real.** If a feature is a mock-up, say so when you test it.",
        "**Get help before you launch payments or sensitive data.** A prototype is for learning; a launched product needs proper security checks.",
        "**Credit your own judgement.** AI made the screens. You made the decisions. Say that in your portfolio.",
      ],
    },

    { type: "h2", text: "The designer is more important, not less" },
    {
      type: "p",
      text: "When sewing machines arrived, people worried that tailoring would disappear. Instead, more people could make more clothes, and the designers with the clearest vision and best taste stood out even more. AI is doing the same thing to product design.",
    },
    {
      type: "p",
      text: "If you can listen to people, frame a clear problem, sketch a simple flow and judge quality with a trained eye, AI turns you into a builder. **Pick one idea you've been sitting on, sketch it tonight, and have a working prototype by the weekend.** Then show it to someone who needs it.",
    },
  ],
};

export const creativePortfolio: PostSource = {
  slug: "creative-to-product-portfolio",
  title: "From atelier to app: building a product portfolio when you come from a creative field",
  excerpt:
    "Fashion designers, artists and makers already have the raw material for a strong product portfolio. Here is how to turn creative projects into case studies that hiring managers and clients understand.",
  category: "Careers",
  author: beulahland,
  date: "2026-08-11",
  image: portfolioImg,
  imageAlt:
    "An open portfolio book showing fashion illustrations on one page and app screen layouts on the other, with colour cards, scissors, lime ribbon and a dress form draped in cobalt fabric",
  takeaways: [
    "A product portfolio shows how you think, not just what you made. Process beats polish.",
    "Your creative projects already contain problems, users, constraints and results. Tell them in that order.",
    "Three strong case studies are better than twelve pretty pictures.",
    "Translate your craft vocabulary into product language without hiding where you came from.",
  ],
  body: [
    {
      type: "p",
      text: "If you come from fashion, art, photography, interior design or any other creative field, you probably already have a portfolio. It is likely beautiful: finished pieces, styled shoots, strong colour. And when you start applying for product design or product management roles, it may not get the response you hoped for.",
    },
    {
      type: "p",
      text: "That's not because your work isn't good. It's because a product portfolio answers a different question. A creative portfolio asks “Do you like what I made?” A product portfolio asks **“Can you trust how I think?”**",
    },
    {
      type: "p",
      text: "The good news: you already have everything you need to answer that question. You just have to show the work behind the work.",
    },

    { type: "h2", text: "What hiring managers actually look for" },
    {
      type: "p",
      text: "People hiring for product roles usually spend only a few minutes on a first look at each portfolio. In that time, they are trying to answer a handful of questions:",
    },
    {
      type: "ul",
      items: [
        "Do you understand who you were designing for and why?",
        "Can you explain a problem clearly before jumping to solutions?",
        "Do you test ideas and change your mind when the evidence says so?",
        "Can you work within constraints like budget, time and materials?",
        "Can you work with other people to get something finished?",
        "Do you know whether your work made a difference?",
      ],
    },
    {
      type: "p",
      text: "Notice that none of these questions are about software. Every one of them can be answered with a dress, a store display, a brand identity or an event you produced.",
    },

    { type: "h2", text: "Translate your craft without losing it" },
    {
      type: "p",
      text: "You don't need to pretend you were always in tech. Your background is a strength: it gives you taste, attention to detail and a deep understanding of people's emotions. What you need is a shared vocabulary so readers can see the connection quickly.",
    },
    {
      type: "pairs",
      left: "What you did",
      right: "How a product reader sees it",
      items: [
        ["Interviewed a bride about her wedding day", "User interviews and needs discovery"],
        ["Made three toiles before the final dress", "Iterative prototyping"],
        ["Changed the fabric after the first fitting", "Design decision driven by testing"],
        ["Worked with a pattern cutter, tailor and supplier", "Cross-functional collaboration"],
        ["Delivered a 12-piece collection for a fixed date", "Scope, prioritisation and delivery"],
        ["Tracked which pieces sold out and which didn't", "Measuring outcomes and learning"],
      ],
    },

    { type: "h2", text: "The case study structure that works for any project" },
    {
      type: "p",
      text: "Each project in your portfolio should read like a short story with a clear beginning, middle and end. Use this six-part structure, and keep each part short:",
    },
    {
      type: "ol",
      items: [
        "**The challenge.** One or two sentences: who had what problem, and why did it matter? “A growing boutique was losing custom orders because clients found the measurement process confusing.”",
        "**Your role.** What exactly did you do, and who did you work with? Be honest and specific.",
        "**What you learned.** The research: conversations, observations, what surprised you. Include one or two real quotes.",
        "**What you tried.** Show sketches, early versions and the options you rejected. Explain why. This is where your thinking becomes visible.",
        "**What you delivered.** The final piece, product or result, with a few strong images.",
        "**What changed.** The outcome and what you would do differently next time. If you have numbers, use them. If you don't, describe the before and after in plain words.",
      ],
    },
    {
      type: "callout",
      title: "Show the messy middle",
      text: "Creative people often hide early sketches and failed toiles because they look unfinished. In a product portfolio, those are the most valuable images you have. They prove you explore, test and improve.",
    },

    { type: "h2", text: "Choose three projects, not twelve" },
    {
      type: "p",
      text: "A long gallery makes readers work hard to find your thinking. Three well-told case studies are far more convincing. Choose projects that together show range:",
    },
    {
      type: "ul",
      items: [
        "**One deep project from your creative field,** retold in product language. This shows your strongest craft and your process.",
        "**One digital project,** even a small one: a redesigned booking flow for a salon, an order form for your own brand, or a prototype built with an AI tool.",
        "**One collaborative project** where you worked with others under real constraints, so readers can see how you handle feedback and trade-offs.",
      ],
    },
    {
      type: "p",
      text: "If you don't have a digital project yet, make one. Pick a real problem from your old industry (fittings, orders, sizing, client communication) and design a simple solution. You understand that problem better than most product teams ever will.",
    },

    { type: "h2", text: "Presentation: let it breathe" },
    {
      type: "p",
      text: "You already know how to style a lookbook. Apply the same care to your case studies, with a few product-specific habits:",
    },
    {
      type: "ul",
      items: [
        "Lead each case study with a single sentence summary and one strong image.",
        "Use short paragraphs and clear headings so people can skim on a phone.",
        "Add captions to every image explaining what it shows and why it matters.",
        "Keep a consistent layout across projects so readers learn where to look.",
        "End with a simple way to contact you, and make sure the link works.",
      ],
    },

    { type: "h2", text: "Telling your story in interviews" },
    {
      type: "p",
      text: "Sooner or later, someone will ask “Why are you moving from fashion into product?” Prepare a short, confident answer that connects your past to your future instead of apologising for it:",
    },
    {
      type: "quote",
      text: "I have always designed things people use every day. In fashion, I learned to listen closely, prototype quickly and deliver under pressure. Now I want to apply that to products that reach many more people at once.",
    },
    {
      type: "p",
      text: "Then walk them through one case study using the six-part structure. Practise it out loud until it takes under five minutes.",
    },

    { type: "h2", text: "Your next step" },
    {
      type: "p",
      text: "This week, pick one project you are proud of. Write two sentences for each of the six parts. Find your old sketches and early versions. That draft, however rough, is the first page of your product portfolio.",
    },
    {
      type: "p",
      text: "**Your atelier was always a product studio.** Let your portfolio show it.",
    },
  ],
};
