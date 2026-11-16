/** Dashboard images load lazily and fade in over a shimmer; cached images show at once. */
export function prepareImage(img: HTMLImageElement) {
  if (img.dataset["img"]) return;
  if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
  if (!img.hasAttribute("decoding")) img.setAttribute("decoding", "async");
  if (img.complete) {
    img.dataset["img"] = "done";
    return;
  }
  img.dataset["img"] = "wait";
  const done = () => {
    img.dataset["img"] = img.naturalWidth > 0 ? "in" : "off";
  };
  img.addEventListener("load", done, { once: true });
  img.addEventListener("error", done, { once: true });
}

/** Prepares every image under root now and as new ones appear. Returns a cleanup. */
export function watchDashboardImages(root: HTMLElement): () => void {
  root.querySelectorAll("img").forEach(prepareImage);
  const obs = new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === "attributes" && m.target instanceof HTMLImageElement) {
        delete m.target.dataset["img"];
        prepareImage(m.target);
        continue;
      }
      m.addedNodes.forEach((n) => {
        if (n instanceof HTMLImageElement) prepareImage(n);
        else if (n instanceof HTMLElement) n.querySelectorAll("img").forEach(prepareImage);
      });
    }
  });
  obs.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
  return () => obs.disconnect();
}
