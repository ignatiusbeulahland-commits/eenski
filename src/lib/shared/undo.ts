import { toast } from "sonner";

/** How long the Undo button stays on screen. */
export const UNDO_MS = 7000;

/**
 * Shows "<message> · Undo". `undo` runs if the person taps Undo in time.
 * `onCommit` runs once when the toast goes away without Undo — use it to finish
 * work that can't be reversed (like deleting a stored file).
 */
export function undoToast(message: string, undo: () => void, opts: { description?: string; onCommit?: () => void } = {}) {
  let settled = false;
  const commit = () => {
    if (settled) return;
    settled = true;
    opts.onCommit?.();
  };
  toast(message, {
    ...(opts.description ? { description: opts.description } : {}),
    duration: UNDO_MS,
    action: {
      label: "Undo",
      onClick: () => {
        if (settled) return;
        settled = true;
        undo();
        toast.success("Restored");
      },
    },
    onAutoClose: commit,
    onDismiss: commit,
  });
}
