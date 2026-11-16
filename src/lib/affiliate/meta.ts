export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Enski Affiliate` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Enski Affiliate` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
