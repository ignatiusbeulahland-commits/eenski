/** Print-ready certificate PDF: one A4 landscape page, the certificate artwork edge to edge. */

/** A4 landscape in PDF points (297 × 210 mm). The certificate artwork is 1414 × 1000, the same √2 ratio. */
export const A4_LANDSCAPE = { width: 841.89, height: 595.28 } as const;

/** Artwork scale for print: 4242 × 3000 px ≈ 360 dpi on A4, and under phone canvas size limits. */
export const PRINT_SCALE = 3;

export type CertificatePdfDetails = {
  title: string;
  learnerName: string;
  courseTitle: string;
  issuer: string;
  code: string;
  issuedAt: string;
  style: string;
  /** A4 portrait page instead of landscape. */
  portrait?: boolean;
};

export const pdfFilename = (filename: string) => `${filename.replace(/\.(png|pdf)$/i, "")}.pdf`;

export async function buildCertificatePdf(image: Uint8Array, kind: "jpg" | "png", d: CertificatePdfDetails): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.setTitle(`${d.title}: ${d.courseTitle}`, { showInWindowTitleBar: true });
  doc.setAuthor(d.issuer);
  doc.setSubject(`Awarded to ${d.learnerName} for completing ${d.courseTitle}`);
  doc.setKeywords(["Enski certificate", d.code, d.style]);
  doc.setCreator("Enski");
  doc.setProducer("Enski");
  const issued = new Date(d.issuedAt);
  if (!Number.isNaN(issued.getTime())) doc.setCreationDate(issued);
  const [pw, ph] = d.portrait ? [A4_LANDSCAPE.height, A4_LANDSCAPE.width] : [A4_LANDSCAPE.width, A4_LANDSCAPE.height];
  const page = doc.addPage([pw, ph]);
  const img = kind === "jpg" ? await doc.embedJpg(image) : await doc.embedPng(image);
  page.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
  return await doc.save();
}
