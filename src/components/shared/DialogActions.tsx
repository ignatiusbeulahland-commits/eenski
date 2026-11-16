import type { ReactNode } from "react";
import { Button } from "@/components/dashboard-ui/button";
import { DialogClose } from "@/components/dashboard-ui/dialog";

/** Standard pop-up footer: a clearly labelled Cancel (closes without saving) beside the main action. */
export function DialogActions({ children, cancelLabel = "Cancel" }: { children: ReactNode; cancelLabel?: string }) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
      <DialogClose asChild>
        <Button type="button" variant="outline">{cancelLabel}</Button>
      </DialogClose>
      {children}
    </div>
  );
}
