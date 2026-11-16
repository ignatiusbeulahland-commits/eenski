import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock3, Eye, PenLine } from "lucide-react";
import { WriteArticleForm } from "@/components/blog/WriteArticleForm";
import { RiseWords } from "@/components/site/motion";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

export const Route = createFileRoute("/blog/write")({
  head: () => ({
    meta: [
      { title: "Write for the Enski Blog | Become a blogger" },
      {
        name: "description",
        content:
          "Share your story, guide or lessons with African dreamers. Send your article to the Enski Blog and our editors will review it.",
      },
      { property: "og:title", content: "Become an Enski blogger" },
      {
        property: "og:description",
        content: "Send your article to the Enski Blog. Every submission is reviewed by our editors before it goes live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WritePage,
});

const perks = [
  { icon: PenLine, title: "Write what you know", text: "Careers, creating, learning, design or product: share what worked for you." },
  { icon: Eye, title: "Reach thousands of dreamers", text: "Published articles are credited to you, with links to your socials." },
  { icon: Clock3, title: "Hear back fast", text: "Our editors review every article and reply within 5 working days." },
];

function WritePage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-cobalt-light pb-28 pt-32 md:pb-36 md:pt-40">
          <div className="bg-dots absolute inset-0" aria-hidden />
          <div className="relative mx-auto max-w-[1000px] px-5">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-on-blue hover:text-primary-foreground">
              <ArrowLeft className="size-4" aria-hidden /> Back to articles
            </Link>
            <p className="eyebrow mt-6 text-lime">Become a blogger</p>
            <h1 className="text-display mt-4 max-w-3xl text-primary-foreground">
              <RiseWords text="Your story could" /> <span className="text-lime"><RiseWords text="move someone." start={3} popLast /></span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-on-blue">
              Write an article for the Enski Blog. Tell us about yourself, add a cover image and send your piece. Our
              editors review it before it goes live.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {perks.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-[22px] border border-primary-foreground/15 bg-primary-foreground/10 p-5 backdrop-blur-sm">
                  <Icon className="size-6 text-lime" aria-hidden />
                  <p className="mt-3 font-extrabold text-primary-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-on-blue">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative -mt-16 pb-24 md:-mt-20">
          <div className="relative mx-auto max-w-[1000px] px-5">
            <WriteArticleForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
