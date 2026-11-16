import { useCallback, useEffect, useState } from "react";

const KEY = "enski-hide-balances";
const EVT = "enski:balance-privacy";

/** Show/hide balances everywhere at once. Read after mount so server and first paint agree. */
export function useBalancePrivacy() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const read = () => { try { setHidden(localStorage.getItem(KEY) === "1"); } catch { /* storage blocked: stay visible */ } };
    read();
    window.addEventListener(EVT, read);
    window.addEventListener("storage", read);
    return () => { window.removeEventListener(EVT, read); window.removeEventListener("storage", read); };
  }, []);
  const toggle = useCallback(() => {
    const next = !hidden;
    setHidden(next);
    try { localStorage.setItem(KEY, next ? "1" : "0"); window.dispatchEvent(new Event(EVT)); } catch { /* storage blocked: hides for this view only */ }
  }, [hidden]);
  return { hidden, toggle };
}

export const MASK = "••••••";
