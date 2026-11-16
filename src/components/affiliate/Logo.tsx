import lime from "@/assets/dashboard/brand/enski-logo-lime.webp";
import white from "@/assets/dashboard/brand/enski-logo-white.webp";
import color from "@/assets/dashboard/brand/enski-logo.webp";
import { cn } from "@/lib/utils";

/** White logo on blue; in dark mode it turns Lime, like the Enski website. */
export function Logo({ variant = "white", className }: { variant?: "white" | "color"; className?: string }) {
  const cls = className ?? "h-8 w-auto";
  if (variant === "color") return <img src={color} alt="Enski" width={288} height={106} className={cls} />;
  return (
    <>
      <img src={white} alt="Enski" width={288} height={106} className={cn(cls, "dark:hidden")} />
      <img src={lime} alt="Enski" width={288} height={106} className={cn(cls, "hidden dark:block")} />
    </>
  );
}
