import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import { checkConnectionNow, startNetworkMonitor } from "@/lib/network/monitor";
import { setNetworkState, useNetworkState } from "@/lib/network/store";
import { registerOfflineSupport } from "@/lib/offline/register";
import { ConnectionNotice, ConnectionScreen } from "./ConnectionScreen";

const MISSING = "data-offline-missing";

/**
 * A picture that couldn't load (offline, or a slow or broken connection) is hidden instead of
 * showing a broken box or its description; it's tried again when the connection returns.
 */
function hideIfMissing(img: HTMLImageElement) {
  img.setAttribute(MISSING, "");
}

/** Pictures that failed before the page came to life; decode() tells a broken one from a sizeless icon. */
function hideAlreadyMissing() {
  for (const img of Array.from(document.images)) {
    if (!img.complete || img.naturalWidth > 0 || !(img.currentSrc || img.getAttribute("src"))) continue;
    img.decode().catch(() => hideIfMissing(img));
  }
}

function retryMissingImages() {
  for (const img of Array.from(document.querySelectorAll<HTMLImageElement>(`img[${MISSING}]`))) {
    img.removeAttribute(MISSING);
    const src = img.src;
    img.src = "";
    img.src = src;
  }
}

/**
 * Turns on offline support, watches the connection, shows the offline / can't-reach-Enski screen,
 * and quietly brings the page back (data, pictures) when the connection returns — no browser refresh.
 */
export function NetworkStatus() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const state = useNetworkState();

  useEffect(() => {
    registerOfflineSupport();

    const onImageError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) hideIfMissing(e.target);
    };
    // A hidden picture that later loads (a retry or a new address) shows again.
    const onImageLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement) e.target.removeAttribute(MISSING);
    };
    document.addEventListener("error", onImageError, true);
    document.addEventListener("load", onImageLoad, true);
    hideAlreadyMissing();

    const stop = startNetworkMonitor({
      onRecovered: () => {
        toast("You're back online", { id: "connection", description: "Everything's reconnected.", duration: 3000 });
        retryMissingImages();
        // Re-run page data that failed while the connection was down; the visitor stays where they are.
        void queryClient.refetchQueries({ predicate: (q) => q.state.status === "error" });
        void router.invalidate();
      },
    });

    return () => {
      document.removeEventListener("error", onImageError, true);
      document.removeEventListener("load", onImageLoad, true);
      stop();
    };
  }, [router, queryClient]);

  const retry = useCallback(() => void checkConnectionNow(), []);
  const dismiss = useCallback(() => setNetworkState({ dismissed: true }), []);
  const open = useCallback(() => setNetworkState({ dismissed: false }), []);
  const back = useCallback(() => {
    setNetworkState({ dismissed: true });
    router.history.back();
  }, [router]);

  if (state.status === "online") return null;
  if (state.dismissed) return <ConnectionNotice state={state} onRetry={retry} onOpen={open} />;
  return <ConnectionScreen state={state} onRetry={retry} onDismiss={dismiss} onBack={back} />;
}
