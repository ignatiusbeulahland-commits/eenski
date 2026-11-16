import type { ReactNode } from "react";
import { Label } from "@/components/dashboard-ui/label";
export function Field({ label, error, hint, children, id }: { label: string; error?: string | undefined; hint?: string | undefined; children: ReactNode; id: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-bold">{label}</Label>
      {children}
      {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
export function FormActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse gap-2 border-t bg-soft/60 px-5 py-4 sm:flex-row sm:justify-end">{children}</div>;
}
