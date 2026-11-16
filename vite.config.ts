// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

/** Pictures bigger than this are cached the first time they're seen, not up front, to save data. */
const PRECACHE_IMAGE_MAX_BYTES = 12 * 1024;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Changes on every release so pages saved for offline are refreshed after an update.
    define: { __ENSKI_BUILD__: JSON.stringify(Date.now().toString(36)) },
    plugins: [
      // Offline support. Registration lives only in src/lib/offline/register.ts (never in dev/preview).
      VitePWA({
        strategies: "generateSW",
        filename: "sw.js",
        registerType: "autoUpdate",
        injectRegister: null,
        manifest: false,
        devOptions: { enabled: false },
        // TanStack Start writes browser files to dist/client; the worker must live (and look) there.
        outDir: "dist/client",
        includeAssets: ["offline.html", "favicon.png", "brand/enski-logo-white.webp", "brand/enski-logo-lime.webp"],
        workbox: {
          globDirectory: "dist/client",
          globPatterns: ["**/*.{js,css,woff2,webp,svg,png,ico,html}"],
          globIgnores: ["**/og/**", "**/node_modules/**"],
          // Big photos are left to the runtime image cache below.
          manifestTransforms: [
            async (entries) => ({
              manifest: entries.filter(
                (e) => !/\.(webp|png|jpe?g)$/i.test(e.url) || e.size <= PRECACHE_IMAGE_MAX_BYTES,
              ),
              warnings: [],
            }),
          ],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          // Pages are server-rendered, so there is no app-shell index.html to fall back to.
          navigateFallback: null,
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              // Pages: always try the network first; use the saved copy when offline or very slow.
              // Also matches the background "save for offline" fetches (x-enski-offline header).
              urlPattern: ({ request, url, sameOrigin }) =>
                sameOrigin &&
                !url.pathname.startsWith("/~oauth") &&
                !url.pathname.startsWith("/api/") &&
                !url.pathname.startsWith("/_serverFn") &&
                (request.mode === "navigate" || request.headers.get("x-enski-offline") === "1"),
              handler: "NetworkFirst",
              options: {
                cacheName: "enski-pages",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [200] },
                precacheFallback: { fallbackURL: "/offline.html" },
              },
            },
            {
              // Bundled pictures have content hashes in their names, so a saved copy never goes stale.
              urlPattern: ({ request, sameOrigin, url }) =>
                sameOrigin && request.destination === "image" && url.pathname.startsWith("/assets/"),
              handler: "CacheFirst",
              options: {
                cacheName: "enski-images",
                expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 60 },
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              // Every other picture on the site (catalogue photos in /demo, logos, creator photos, uploads).
              // Share images (/og/) are only for link previews, so they're never saved.
              urlPattern: ({ sameOrigin, url, request }) =>
                sameOrigin &&
                !url.pathname.startsWith("/og/") &&
                (request.destination === "image" ||
                  url.pathname.startsWith("/enski-photo/") ||
                  url.pathname.startsWith("/__l5e/assets-v1/")),
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "enski-media",
                expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
                cacheableResponse: { statuses: [200] },
              },
            },
            {
              // Pictures served from other sites (course and blog sources).
              urlPattern: ({ sameOrigin, request }) => !sameOrigin && request.destination === "image",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "enski-remote-images",
                expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 14 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  },
});
