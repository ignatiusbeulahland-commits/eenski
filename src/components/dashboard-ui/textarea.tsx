import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-[14px] border-[1.5px] border-input bg-card px-4 py-3 text-base font-medium transition-[border-color,box-shadow] placeholder:text-muted-foreground hover:border-cobalt-100 focus-visible:border-cobalt focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ice aria-[invalid=true]:border-destructive disabled:cursor-not-allowed disabled:bg-soft disabled:text-muted-foreground md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
