import { useEffect, useRef, useState } from "react";

import type { ShopItem } from "@/lib/shop/types";
import { cn } from "@/lib/utils";

/**
 * Creator artwork is shown whole on a soft blurred copy of itself, so text on
 * covers is never cut off; our own photos simply fill the frame.
 */
export function ShopImage({
  image,
  sizes = "(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw",
  className,
  eager = false,
}: {
  image: ShopItem["image"];
  sizes?: string | undefined;
  className?: string | undefined;
  eager?: boolean | undefined;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An error can fire before hydration attaches onError.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [image.src]);

  const src = failed && image.fallback ? image.fallback : image.src;
  const contain = image.fit === "contain" && !failed;
  const common = { loading: eager ? ("eager" as const) : ("lazy" as const), decoding: "async" as const };

  return (
    <div className={cn("relative size-full overflow-hidden bg-ice", className)}>
      {contain && (
        <img src={src} alt="" aria-hidden {...common} className="absolute inset-0 size-full scale-125 object-cover opacity-60 blur-2xl" />
      )}
      <img
        ref={ref}
        src={src}
        srcSet={failed ? undefined : image.srcSet}
        sizes={image.srcSet && !failed ? sizes : undefined}
        alt=""
        {...common}
        onError={() => setFailed(true)}
        className={cn(
          "relative size-full transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          contain ? "object-contain" : "object-cover",
        )}
      />
    </div>
  );
}
