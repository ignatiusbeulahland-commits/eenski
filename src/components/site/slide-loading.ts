export const PEOPLE_SLIDE_INTERVAL = 4500;

export type SlideSource = { src: string; srcSet?: string | undefined; sizes?: string | undefined };

/**
 * Pick what to download for a slide. Normally the browser chooses from the
 * size list; on low data, photos the visitor asks for later use the smallest copy.
 */
export function slideSource(
  slide: SlideSource & { small?: string | undefined },
  lowData: boolean,
): SlideSource {
  if (lowData && slide.small) return { src: slide.small };
  return { src: slide.src, srcSet: slide.srcSet, sizes: slide.sizes };
}

/** Keep the current photo visible until the next photo has loaded and decoded. */
export async function loadSlide(source: string | SlideSource): Promise<boolean> {
  const { src, srcSet, sizes } = typeof source === "string" ? { src: source } as SlideSource : source;
  const image = new Image();
  image.decoding = "async";
  // Set the size list before the address so the browser downloads the same copy the page shows.
  if (sizes) image.sizes = sizes;
  if (srcSet) image.srcset = srcSet;
  image.src = src;
  try {
    await image.decode();
    return image.naturalWidth > 0;
  } catch {
    return false;
  }
}

export function canAutoPlay(paused: boolean, reduced: boolean, lowData: boolean, visible: boolean) {
  return !paused && !reduced && !lowData && visible;
}
