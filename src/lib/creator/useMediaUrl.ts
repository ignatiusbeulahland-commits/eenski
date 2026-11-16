import { useEffect, useState } from "react";
import { getMedia } from "./mediaVault";

/** Object URL for a file kept in the media vault; `missing` when this device doesn't have it. */
export function useMediaUrl(id: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    setUrl(null);
    setMissing(false);
    if (!id) return;
    let alive = true;
    let made = "";
    getMedia(id)
      .then((blob) => {
        if (!alive) return;
        if (blob) { made = URL.createObjectURL(blob); setUrl(made); } else setMissing(true);
      })
      .catch(() => alive && setMissing(true));
    return () => { alive = false; if (made) URL.revokeObjectURL(made); };
  }, [id]);
  return { url, missing };
}
