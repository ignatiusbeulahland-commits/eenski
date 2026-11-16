import { useEffect, useRef, useState } from "react";

import { coverFor } from "@/lib/dreamverse/covers";
import type { Product } from "@/lib/dreamverse/types";
import { cn } from "@/lib/utils";

import { COVER_PHOTOS } from "./coverPhotos";

const SIZES = "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 85vw";

/**
 * Creator artwork when Enski has it (shown whole); otherwise a brand-coloured photo for the
 * listing's subject (people-free desk still life). Real artwork always wins.
 */
export function ProductCover({ product, className }: { product: Product; className?: string }) {
  // Some Enski uploads refuse to load; fall back to the subject photo.
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // An error can fire before hydration attaches onError, so check once mounted too.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [product.thumbnail]);

  if (product.thumbnail && !failed) {
    // Shown whole on a blurred copy of itself, so text on posters is never cut off.
    return (
      <div className={cn("relative size-full overflow-hidden bg-cobalt", className)}>
        <img src={product.thumbnail} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-2xl" />
        <img
          src={product.thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          ref={imgRef}
          onError={() => setFailed(true)}
          className="relative size-full object-contain"
        />
      </div>
    );
  }

  const { id, variant } = coverFor(product);
  const photo = COVER_PHOTOS[id][variant] ?? COVER_PHOTOS.general[0]!;

  return (
    <img
      src={photo.src}
      srcSet={`${photo.small} 480w, ${photo.src} 800w`}
      sizes={SIZES}
      alt=""
      width={800}
      height={500}
      loading="lazy"
      decoding="async"
      className={cn("size-full bg-cobalt object-cover object-bottom", className)}
    />
  );
}
