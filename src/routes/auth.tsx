import { createFileRoute } from "@tanstack/react-router";
import { AuthPanel, type AuthMode } from "@/components/site/auth/AuthPanel";
import { AuthShowcase } from "@/components/site/auth/AuthShowcase";
import { joinRoleFrom, type JoinRole } from "@/components/site/data";

const modes: AuthMode[] = ["login", "register", "forgot"];

export const Route = createFileRoute("/auth")({
  // Same URLs as the Enski app: /auth (log in) and /auth?s=register
  validateSearch: (search: Record<string, unknown>): { s?: AuthMode; as?: JoinRole } => {
    const s = search["s"];
    const as = search["as"];
    return {
      ...(typeof s === "string" && modes.includes(s as AuthMode) && s !== "login" ? { s: s as AuthMode } : {}),
      // Old ?as=facilitator links open the creator sign-up.
      ...((r) => (r && r !== "learner" ? { as: r } : {}))(joinRoleFrom(as)),
    };
  },
  head: () => ({
    meta: [
      { title: "Log in or join Enski — learners, creators and affiliates" },
      {
        name: "description",
        content:
          "Log in to Enski or create your free account as a learner, creator or affiliate. Learn, teach, sell and grow with Africa's creators.",
      },
      { property: "og:title", content: "Log in or join Enski" },
      {
        property: "og:description",
        content: "Create your free Enski account as a learner, creator or affiliate, or pick up where you left off.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { s, as } = Route.useSearch();
  const navigate = Route.useNavigate();
  const mode: AuthMode = s ?? "login";
  const type: JoinRole = as ?? "learner";

  const go = (next: { s?: AuthMode; as?: JoinRole }) =>
    navigate({
      search: (prev) => {
        const merged = { ...prev, ...next };
        return {
          ...(merged.s && merged.s !== "login" ? { s: merged.s } : {}),
          ...(merged.as && merged.as !== "learner" ? { as: merged.as } : {}),
        };
      },
      replace: true,
      resetScroll: false,
    });

  return (
    <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <AuthShowcase type={type} />
      <AuthPanel mode={mode} type={type} onMode={(m) => go({ s: m })} onType={(t) => go({ as: t })} />
    </div>
  );
}
