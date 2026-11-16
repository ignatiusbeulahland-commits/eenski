import jakarta from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url";
import signature from "@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff2?url";
import { downloadBlob } from "@/lib/download";
import { buildCertificatePdf, PRINT_SCALE, type CertificatePdfDetails } from "@/lib/shared/certificatePdf";

const toDataUrl = async (src: string) => {
  if (src.startsWith("data:")) return src;
  const blob = await (await fetch(src)).blob();
  return await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
};

/** Renders the on-screen certificate SVG to an image blob (fonts and images embedded). */
export async function renderCertificateImage(svg: SVGSVGElement, { scale = 2, type = "image/png", quality }: { scale?: number; type?: "image/png" | "image/jpeg"; quality?: number } = {}): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const vb = svg.viewBox.baseVal;
  const [w, h] = vb && vb.width ? [vb.width, vb.height] : [1414, 1000];
  clone.setAttribute("width", String(w * scale));
  clone.setAttribute("height", String(h * scale));
  clone.removeAttribute("class");
  await Promise.all(
    [...clone.querySelectorAll("image")].map(async (img) => {
      const href = img.getAttribute("href");
      if (href) img.setAttribute("href", await toDataUrl(href));
    }),
  );
  const [fontA, fontB] = await Promise.all([toDataUrl(jakarta), toDataUrl(signature)]);
  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");
  style.textContent = `@font-face{font-family:'Plus Jakarta Sans Variable';font-weight:200 800;src:url(${fontA}) format('woff2');}@font-face{font-family:'Mrs Saint Delafield';src:url(${fontB}) format('woff2');}`;
  clone.insertBefore(style, clone.firstChild);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Could not draw certificate"));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Image export unavailable");
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), type, quality));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const renderCertificatePng = (svg: SVGSVGElement, scale = 2) => renderCertificateImage(svg, { scale });

/** Print-ready A4 PDF (landscape, or portrait for the portrait template) of exactly what is on screen (style, learner, course, ID). */
export async function renderCertificatePdf(svg: SVGSVGElement, details: CertificatePdfDetails): Promise<{ pdf: Blob; preview: Blob }> {
  const jpg = await renderCertificateImage(svg, { scale: PRINT_SCALE, type: "image/jpeg", quality: 0.95 });
  const vb = svg.viewBox.baseVal;
  const portrait = !!vb && vb.height > vb.width;
  const bytes = await buildCertificatePdf(new Uint8Array(await jpg.arrayBuffer()), "jpg", { ...details, portrait });
  return { pdf: new Blob([bytes as BlobPart], { type: "application/pdf" }), preview: jpg };
}

/**
 * Opens the browser's print dialog with just the certificate on one A4 page (landscape or
 * portrait to match the artwork). Uses a hidden frame, so the page around it isn't printed.
 */
export async function printCertificate(svg: SVGSVGElement) {
  const jpg = await renderCertificateImage(svg, { scale: 2, type: "image/jpeg", quality: 0.95 });
  const vb = svg.viewBox.baseVal;
  const portrait = !!vb && vb.height > vb.width;
  const url = URL.createObjectURL(jpg);
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0";
  document.body.appendChild(frame);
  const cleanup = () => { frame.remove(); URL.revokeObjectURL(url); };
  try {
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win) throw new Error("print frame");
    doc.open();
    doc.write(`<!doctype html><html><head><title>Certificate</title><style>@page{size:A4 ${portrait ? "portrait" : "landscape"};margin:0}html,body{margin:0;height:100%}img{display:block;width:100%;height:100%;object-fit:contain}</style></head><body><img alt="" src="${url}"></body></html>`);
    doc.close();
    const img = doc.querySelector("img");
    if (img && !img.complete) await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("print image")); });
    win.focus();
    win.print();
    setTimeout(cleanup, 60_000);
  } catch (e) {
    cleanup();
    throw e;
  }
}

/** Renders the certificate and saves it straight away (desktop flow). */
export async function downloadCertificatePng(svg: SVGSVGElement, filename: string, scale = 2) {
  downloadBlob(await renderCertificatePng(svg, scale), filename);
}
