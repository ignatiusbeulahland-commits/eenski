import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CharmStage } from "@/components/assistant/CharmStage";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { themeInitScript } from "../components/site/theme";
import { Toaster } from "@/components/ui/sonner";
import { DemoCheckout } from "@/components/shop/DemoCheckout";
import { CharmWidget } from "@/components/assistant/CharmWidget";
import { NetworkStatus } from "@/components/site/network/NetworkStatus";
import { NavigationProgress } from "@/components/site/network/NavigationProgress";
import { SplashScreen, splashInitScript } from "@/components/site/network/SplashScreen";
import { Button } from "@/components/ui/button";
import { MissingScreen } from "@/components/shared/StatusScreen";
import { isNetworkError } from "@/lib/network/timing";
import fontLatin from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url";

function NotFoundComponent() {
  return (
    <div data-skin="dashboard">
      <MissingScreen
        kind="page"
        fullPage
        actions={
          <>
            <Button asChild variant="outline"><Link to="/courses">Browse courses</Link></Button>
            <Button asChild><Link to="/">Go to the homepage</Link></Button>
          </>
        }
      />
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  const connection = isNetworkError(error);
  useEffect(() => {
    if (!connection) reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error, connection]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div role="alert" className="max-w-md text-center">
        <CharmStage pose="concerned" size="sm" className="mx-auto mb-5" />
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
          {connection ? "This page couldn't connect" : "This page didn't load"}
        </h1>
        <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
          {connection
            ? "We couldn't reach Enski to load this page. Check your connection and try again; we'll also retry when you're back online."
            : "Something went wrong on our end. You can try again or head back home."}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              reset();
              void router.invalidate();
            }}
          >
            Try again
          </Button>
          <Button asChild variant="outline">
            <a href="/">Go home</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Enski — Africa's platform for dreamers" },
      { name: "description", content: "Learn skills, sell your knowledge and grow with Enski." },
      { name: "author", content: "Enski" },
      { property: "og:title", content: "Enski — Africa's platform for dreamers" },
      { property: "og:description", content: "Learn skills, sell your knowledge and grow with Enski." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1A42A6" },
    ],
    links: [
      // Self-hosted font: preload the Latin file so text appears in the brand font straight away.
      { rel: "preload", as: "font", type: "font/woff2", href: fontLatin, crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript + splashInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      {/* Dreamverse save/follow confirmations */}
      <Toaster position="bottom-center" />
      <DemoCheckout />
      {/* Charm, the Enski Assistant, with simulated human support */}
      <CharmWidget />
      {/* Offline support, connection screen and automatic recovery */}
      <NetworkStatus />
      {/* Lime bar while a page loads */}
      <NavigationProgress />
      {/* Opening screen, once per visit */}
      <SplashScreen />
    </QueryClientProvider>
  );
}
