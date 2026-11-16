type NetworkInfo = { saveData?: boolean; effectiveType?: string };

function info(): NetworkInfo | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { connection?: NetworkInfo }).connection;
}

/**
 * True when the visitor has Data Saver on or is on a 2G-class connection.
 * Browsers without the Network Information API (Safari, Firefox) report false.
 */
export function prefersLowData(): boolean {
  const c = info();
  if (!c) return false;
  return c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g";
}

/** True only on a connection good enough to save extra pages in the background. */
export function canSaveInBackground(): boolean {
  const c = info();
  if (c?.saveData) return false;
  return !c?.effectiveType || c.effectiveType === "4g";
}
