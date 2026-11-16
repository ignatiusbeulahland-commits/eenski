import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Enski buttons: fully rounded pills, ExtraBold sentence-case labels, flat fills (no gradients).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-center font-extrabold cursor-pointer transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-cobalt text-primary-foreground hover:bg-cobalt-hover active:bg-cobalt-press",
        secondary:
          "border-[1.5px] border-brand bg-background text-brand hover:bg-ice active:bg-sky-200",
        tertiary: "bg-ice text-brand hover:bg-sky-200",
        lime: "bg-lime text-midnight hover:bg-lime-hover active:bg-lime-press",
        "outline-blue":
          "border-2 border-on-blue/90 bg-transparent text-on-blue hover:bg-on-blue/12 active:bg-on-blue/20",
        ghost: "text-brand hover:bg-ice",
        "ghost-blue": "text-on-blue hover:bg-on-blue/10",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-[1.5px] border-line bg-background text-ink hover:bg-soft",
        link: "text-brand underline-offset-4 hover:underline px-0",
      },
      size: {
        default: "min-h-12 px-6 py-2 text-base leading-tight",
        sm: "h-10 whitespace-nowrap px-[18px] text-sm",
        lg: "min-h-14 px-6 py-3 fs-17 leading-tight sm:px-8",
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
