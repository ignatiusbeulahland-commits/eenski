import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "./theme";

/** Sun in light mode, moon in dark mode. Icons swap with a quick spin. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost-light"
      size="icon"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      className={cn("relative overflow-hidden", className)}
    >
      <Sun
        aria-hidden
        className="absolute rotate-0 scale-100 opacity-100 transition-all duration-500 ease-out dark:-rotate-90 dark:scale-0 dark:opacity-0"
      />
      <Moon
        aria-hidden
        className="absolute rotate-90 scale-0 opacity-0 transition-all duration-500 ease-out dark:rotate-0 dark:scale-100 dark:opacity-100"
      />
    </Button>
  );
}
