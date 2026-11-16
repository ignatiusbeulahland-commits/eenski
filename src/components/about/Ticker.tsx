const items = [
  "Courses",
  "Ebooks",
  "Digital products",
  "Live sessions",
  "Community",
  "Analytics",
  "Global checkout",
];

/** Lime band listing what Enski powers. Duplicated once so the loop is seamless. */
export function Ticker() {
  return (
    <div className="relative z-10 -mt-2 overflow-hidden bg-lime py-4 text-midnight" aria-label="What Enski powers">
      <ul className="flex w-max animate-marquee gap-10 pr-10">
        {[...items, ...items].map((label, i) => (
          <li
            key={`${label}-${i}`}
            aria-hidden={i >= items.length}
            className="flex items-center gap-10 whitespace-nowrap text-lg font-extrabold lg:text-xl"
          >
            {label}
            <span className="size-2 rounded-full bg-midnight" aria-hidden="true" />
          </li>
        ))}
      </ul>
    </div>
  );
}
