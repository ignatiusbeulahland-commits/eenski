import { cn } from "@/lib/utils";
import { initials } from "@/content/blog";

/** The author's own photo when they supplied one, otherwise initials. We never generate faces for real authors. */
export function AuthorAvatar({ name, photo, className }: { name: string; photo?: string | undefined; className?: string }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        width={320}
        height={320}
        className={cn("size-10 shrink-0 rounded-full object-cover ring-2 ring-lime", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full bg-lime text-sm font-extrabold text-midnight",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
