import { useEffect, useState } from "react";
import { currentWelcomeKind } from "./profile";
import type { WelcomeKind } from "@/lib/shared/greeting";

/** "new" on the tab where someone just registered, otherwise "returning". Read after mount (browser storage). */
export function useWelcomeKind(): WelcomeKind {
  const [kind, setKind] = useState<WelcomeKind>("returning");
  useEffect(() => setKind(currentWelcomeKind()), []);
  return kind;
}
