import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const SIZES = {
  sm: "size-7 text-[11px]",
  md: "size-12 text-base",
  lg: "size-20 text-2xl",
} as const;

export function CreatorAvatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  // Fall back to initials when the photo can't be loaded (e.g. blocked by Enski's image host).
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  // An error can fire before hydration attaches onError, so check once mounted too.
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        ref={imgRef}
        onError={() => setFailed(true)}
        className={cn("shrink-0 rounded-full object-cover", SIZES[size], className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-ice font-extrabold text-brand ring-1 ring-cobalt-100",
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
