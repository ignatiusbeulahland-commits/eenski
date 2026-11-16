import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { RoutePending } from "./components/site/RoutePending";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Smooth cross-fade between pages where the browser supports it.
    defaultViewTransition: true,
    defaultPreloadStaleTime: 0,
    // Slow page changes show a light placeholder (quick ones only get the top loading bar).
    defaultPendingComponent: () => <RoutePending />,
    defaultPendingMs: 500,
    defaultPendingMinMs: 300,
  });

  return router;
};
