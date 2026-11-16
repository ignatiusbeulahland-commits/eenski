import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/dashboard-ui/tooltip";

/** Small info icon that reveals a short explanation on hover, focus or tap. */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" aria-label={label} className="relative inline-grid h-5 w-5 shrink-0 place-items-center rounded-full after:absolute after:-inset-1.5 after:content-[''] text-muted-foreground transition-colors hover:text-cobalt"><Info className="h-3.5 w-3.5" /></button>
      </TooltipTrigger>
      <TooltipContent className="max-w-64 text-[13px] font-medium">{children}</TooltipContent>
    </Tooltip>
  );
}
