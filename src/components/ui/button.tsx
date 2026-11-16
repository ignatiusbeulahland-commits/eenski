import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-extrabold cursor-pointer transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-light disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-[1.1em] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-cobalt text-primary-foreground hover:bg-cobalt-hover active:bg-cobalt-press",
        lime: "bg-lime text-midnight hover:bg-lime-hover active:bg-lime-press",
        outline:
          "border-[1.5px] border-brand bg-background text-brand hover:bg-ice active:bg-sky-200",
        "outline-light":
          "border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/12 active:bg-primary-foreground/22",
        secondary: "bg-ice text-brand hover:bg-sky-200",
        ghost: "text-brand hover:bg-ice",
        "ghost-light": "text-primary-foreground hover:bg-primary-foreground/12",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "text-brand underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "h-12 px-6 text-base",
        sm: "h-10 px-[18px] text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "h-11 w-11 rounded-[14px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
