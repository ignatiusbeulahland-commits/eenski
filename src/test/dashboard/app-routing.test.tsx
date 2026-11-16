import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each([
    "dashboard",
    "reviews",
    "storefront",
    "milestones",
    "milestones/collection",
    "milestones/history",
    "courses",
    "courses/create",
    "courses/sample-product",
    "courses/sample-product/edit",
    "ebooks",
    "ebooks/create",
    "ebooks/sample-product",
    "ebooks/sample-product/edit",
    "live-trainings",
    "live-trainings/create",
    "live-trainings/sample-product",
    "live-trainings/sample-product/edit",
    "services",
    "services/create",
    "services/sample-product",
    "services/sample-product/edit",
    "coaching",
    "coaching/create",
    "coaching/sample-product",
    "coaching/sample-product/edit",
    "media-library",
    "media-library/file-1",
    "wallet",
    "subscribers",
    "coupons",
    "affiliates",
    "affiliates/aff-1",
    "affiliations",
    "affiliations/sales",
    "affiliations/prog-1",
    "commission-rules",
    "performance",
    "landing-pages",
    "landing-pages/create",
    "landing-pages/page-1/edit",
    "landing-pages/page-1/leads",
    "settings/manage-profile",
    "settings/character",
    "settings/bank-accounts",
    "settings/verification",
    "settings/availability",
    "settings/integrations",
    "settings/notifications",
    "settings/password-security",
    "guides",
    "guides/getting-started",
    "help",
    "help/orders",
])("matches Creator route %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes(`/creator/${path}`);
    expect(matches.at(-1)?.pathname).toBe(`/creator/${path}`);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.at(-1)?.routeId).not.toBe("/creator");
  });
  it("opens Affiliate Sales rather than a promotion called 'sales'", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/creator/affiliations/sales").at(-1)?.routeId).toBe("/creator/affiliations_/sales");
  });
  it.each([
    "dashboard",
    "my-affiliations",
    "performance",
    "referrals",
    "market",
    "transactions",
    "wallet",
    "payouts",
    "settings/profile",
    "settings/bank-account",
    "settings/verification",
    "settings/notifications",
    "settings/security",
    "guides",
    "help",
    "market/vibe-coding",
    "guides/getting-started",
    "help/referral-links",
  ])("matches requested route %s", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes(`/affiliate/${path}`);
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.at(-1)?.routeId).not.toBe("/affiliate");
  });
  it.each([
    ["dashboard", "/learner/dashboard"],
    ["events", "/learner/events"],
    ["events/ai-app-workshop", "/learner/events_/$eventId"],
    ["resources", "/learner/resources"],
    ["resources/vibe-coding", "/learner/resources_/$resourceId"],
    ["wishlist", "/learner/wishlist"],
    ["cart", "/learner/cart"],
    ["certificates", "/learner/certificates"],
    ["certificates/cert-vibe-coding", "/learner/certificates_/$certificateId"],
    ["purchases", "/learner/purchases"],
    ["purchases/order-1", "/learner/purchases_/$purchaseId"],
    ["settings/profile", "/learner/settings/profile"],
    ["settings/integrations", "/learner/settings/integrations"],
    ["settings/notifications", "/learner/settings/notifications"],
    ["settings/security", "/learner/settings/security"],
    ["guides", "/learner/guides"],
    ["guides/getting-started", "/learner/guides_/$guideId"],
    ["help", "/learner/help"],
    ["help/update-profile", "/learner/help_/$articleId"],
  ])("opens Learner page /learner/%s", (path, routeId) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes(`/learner/${path}`).at(-1)?.routeId).toBe(routeId);
  });
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});
