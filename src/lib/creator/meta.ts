export const creatorMeta = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Enski Creator` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Enski Creator` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
