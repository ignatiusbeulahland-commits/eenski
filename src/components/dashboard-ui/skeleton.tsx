import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("dash-shimmer rounded-md", className)} {...props} />;
}

export { Skeleton };
