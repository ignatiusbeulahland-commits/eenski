import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

// Enski pill buttons: fully rounded, ExtraBold, sentence case.
// One primary per section: Cobalt on light, Lime on blue.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-extrabold cursor-pointer select-none transition-[background-color,color,border-color,transform,box-shadow] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-sky-light focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-cobalt text-primary-foreground hover:bg-cobalt-hover active:bg-cobalt-press disabled:bg-cobalt-100 disabled:text-cobalt-300",
        lime: "bg-lime text-midnight hover:bg-lime-hover active:bg-lime-press disabled:bg-on-blue/15 disabled:text-on-blue/60",
        outline:
          "border-[1.5px] border-brand bg-background text-brand hover:bg-ice active:bg-sky-200 disabled:border-cobalt-100 disabled:text-cobalt-300",
        "outline-on-blue":
          "border-2 border-on-blue bg-transparent text-on-blue hover:bg-on-blue/12 active:bg-on-blue/22",
        tertiary:
          "bg-ice text-brand hover:bg-sky-200 active:bg-sky-hover disabled:text-cobalt-300",
        ghost: "text-ink hover:bg-ice",
        "ghost-on-blue": "text-on-blue hover:bg-on-blue/12",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "rounded-none px-0 text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 text-base",
        sm: "h-10 px-[18px] text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "size-11 rounded-[14px] [&_svg]:size-[22px]",
        "icon-sm": "size-10 rounded-full [&_svg]:size-5",
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
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    if (asChild) {
      return (
        <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
          {children}
        </Comp>
      );
    }
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        aria-busy={loading || undefined}
        disabled={loading || props.disabled}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
