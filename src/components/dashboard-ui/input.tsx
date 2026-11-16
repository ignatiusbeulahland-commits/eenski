import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[14px] border-[1.5px] border-input bg-card px-4 py-1 text-base font-medium text-foreground transition-[border-color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:font-medium placeholder:text-muted-foreground hover:border-cobalt-100 focus-visible:border-cobalt focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ice aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive-soft disabled:cursor-not-allowed disabled:bg-soft disabled:text-muted-foreground md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
