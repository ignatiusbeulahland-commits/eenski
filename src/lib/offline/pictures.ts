/**
 * Pictures saved for offline use. Pages saved in the background (OFFLINE_PAGES) only
 * keep their text; this module finds the photos those pages show — including ones
 * that only appear later (slideshows, cards behind "Show more", catalogue photos) —
 * and loads each one once so the offline worker keeps a copy.
 *
 * Every photo is loaded through a detached <img> with the page's own size list,
 * so the browser saves exactly the copy it would show on this screen.
 */
export type PictureSource = { src: string; srcSet?: string | undefined; sizes?: string | undefined };

const IMAGE_URL = /\.(?:webp|png|jpe?g|gif|svg|avif)(?:[?#].*)?$/i;

function sameOriginPath(raw: string | null | undefined, base: string): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return null;
  try {
    const url = new URL(value, base);
    if (url.origin !== new URL(base).origin) return null;
    if (url.pathname.startsWith("/og/")) return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

/** Every srcset candidate address, so a photo already covered by a size list isn't saved twice. */
function srcSetUrls(srcSet: string): string[] {
  return srcSet
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0] ?? "")
    .filter(Boolean);
}

/**
 * The photos written into a saved page: <img>, <picture> sources, image preloads and
 * inline background images, plus any other picture address the page mentions (page data).
 * Only same-origin pictures are returned; share images (/og/) are skipped.
 */
export function picturesInPage(html: string, base: string): PictureSource[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const out: PictureSource[] = [];
  const covered = new Set<string>();
  const add = (src: string | null, srcSet?: string | null, sizes?: string | null) => {
    const path = sameOriginPath(src, base);
    const set = srcSet?.trim() || undefined;
    if (!path && !set) return;
    if (set) for (const u of srcSetUrls(set)) { const p = sameOriginPath(u, base); if (p) covered.add(p); }
    if (path) covered.add(path);
    out.push({ src: path ?? sameOriginPath(srcSetUrls(set ?? "")[0], base) ?? "", srcSet: set, sizes: sizes?.trim() || undefined });
  };

  for (const img of Array.from(doc.querySelectorAll("img"))) {
    add(img.getAttribute("src"), img.getAttribute("srcset"), img.getAttribute("sizes"));
  }
  for (const source of Array.from(doc.querySelectorAll("picture source[srcset]"))) {
    add(null, source.getAttribute("srcset"), source.getAttribute("sizes"));
  }
  for (const link of Array.from(doc.querySelectorAll('link[rel="preload"][as="image"]'))) {
    add(link.getAttribute("href"), link.getAttribute("imagesrcset"), link.getAttribute("imagesizes"));
  }
  for (const el of Array.from(doc.querySelectorAll("[style*='url(']"))) {
    for (const m of (el.getAttribute("style") ?? "").matchAll(/url\((['"]?)(.*?)\1\)/g)) add(m[2] ?? null);
  }
  // Picture addresses mentioned anywhere else in the page (for example the saved page data).
  for (const m of html.matchAll(/["'(\s](\/(?:assets|demo|brand|enski-photo)\/[^"'()\s\\]+)/g)) {
    const path = sameOriginPath(m[1], base);
    if (path && IMAGE_URL.test(path) && !covered.has(path)) {
      covered.add(path);
      out.push({ src: path });
    }
  }
  return dedupe(out.filter((p) => p.src || p.srcSet));
}

export function dedupe(list: PictureSource[]): PictureSource[] {
  const seen = new Set<string>();
  return list.filter((p) => {
    const key = `${p.srcSet ?? ""}|${p.src}|${p.sizes ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Photos the public pages show that aren't written into the page itself (slideshows, course covers, Charm). */
export async function picturesShownLater(): Promise<PictureSource[]> {
  const [home, creators, dreamverse, trybe, campus, nysc] = await Promise.all([
    import("@/components/site/hero-images"),
    import("@/components/site/ForCreators"),
    import("@/components/dreamverse/HeroSlides"),
    import("@/components/dreamers-trybe/data"),
    import("@/components/campus/data"),
    import("@/components/nysc/data"),
  ]);
  const covers = Object.values(
    import.meta.glob<string>("/src/assets/{courses,creators,charm}/**/*.{webp,png,jpg,jpeg}", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  );
  const catalogue = await Promise.all(
    Object.values(
      import.meta.glob<string>("/src/content/demo/*.json", { query: "?raw", import: "default" }),
    ).map((load) => load().catch(() => "")),
  );
  const cataloguePhotos = catalogue.flatMap((text) =>
    Array.from(text.matchAll(/\/demo\/[^"'\s\\]+\.(?:webp|png|jpe?g)/gi), (m) => m[0]),
  );

  const pick = ({ src, srcSet, sizes }: PictureSource) => ({ src, srcSet, sizes });
  return dedupe([
    ...home.heroSlides.map(pick),
    ...creators.creatorSlides.map(pick),
    ...dreamverse.dreamverseHeroPictures,
    ...trybe.TRYBE_HERO_SLIDES.map(pick),
    ...campus.campusHeroSlides.map(pick),
    ...campus.campusDreams.map(pick),
    ...nysc.nyscHeroSlides.map(pick),
    ...nysc.vision.map(pick),
    ...nysc.nyscBenefits.flatMap((b) => b.slides.map((src) => ({ src }))),
    ...covers.map((src) => ({ src })),
    ...cataloguePhotos.map((src) => ({ src })),
  ]);
}

/** Load one photo the way the page would, so the offline worker keeps that exact copy. */
export async function savePicture({ src, srcSet, sizes }: PictureSource): Promise<boolean> {
  const image = new Image();
  image.decoding = "async";
  // The size list goes first so the browser picks the same copy the page shows.
  if (sizes) image.sizes = sizes;
  if (srcSet) image.srcset = srcSet;
  if (src) image.src = src;
  try {
    await image.decode();
    return image.naturalWidth > 0;
  } catch {
    return false;
  }
}

/** Save photos a few at a time; stops early if the connection drops or turns slow. */
export async function savePictures(list: PictureSource[], keepGoing: () => boolean, parallel = 4): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < list.length && keepGoing()) {
      const item = list[next++]!;
      await savePicture(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(parallel, list.length) }, worker));
}
