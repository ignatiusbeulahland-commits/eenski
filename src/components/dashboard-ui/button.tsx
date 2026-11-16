import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Brand guide v3.2: pill buttons, ExtraBold sentence-case labels, 98% press, white + Light Sky focus ring.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-extrabold cursor-pointer select-none transition-[background-color,border-color,box-shadow,color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)] active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-cobalt-hover active:bg-cobalt-press disabled:bg-cobalt-100 disabled:text-cobalt-300",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive-hover disabled:opacity-50",
        outline:
          "border-[1.5px] border-cobalt bg-card text-cobalt hover:bg-ice active:bg-sky-200 disabled:border-line disabled:text-muted-foreground",
        quiet: "border-[1.5px] border-line bg-card text-midnight hover:border-cobalt-100 hover:bg-ice hover:text-cobalt",
        secondary: "bg-secondary text-secondary-foreground hover:bg-sky-200 disabled:opacity-50",
        ghost: "hover:bg-accent hover:text-accent-foreground disabled:opacity-50",
        lime: "bg-lime text-midnight hover:bg-lime-hover active:bg-lime-press disabled:bg-on-dark/15 disabled:text-on-dark-muted",
        soft: "bg-ice text-cobalt hover:bg-sky-200 disabled:opacity-50",
        // For controls on Midnight/Cobalt surfaces (e.g. the Creator Universe showroom).
        glass: "border-[1.5px] border-on-dark/20 bg-on-dark/5 text-on-dark hover:border-lime/60 hover:bg-on-dark/10 hover:text-lime disabled:opacity-45",
        "glass-active": "border-[1.5px] border-lime/70 bg-lime/15 text-lime hover:bg-lime/25 disabled:opacity-45",
        link: "text-primary underline-offset-4 hover:underline disabled:opacity-50",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-[15px]",
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
