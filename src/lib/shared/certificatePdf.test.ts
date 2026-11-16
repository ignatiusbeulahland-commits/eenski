import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { A4_LANDSCAPE, buildCertificatePdf, pdfFilename } from "./certificatePdf";

// 1×1 transparent PNG.
const PNG = Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="), (c) => c.charCodeAt(0));
const details = { title: "Certificate of completion", learnerName: "Ada Obi", courseTitle: "Brand design sprint", issuer: "Blossom Affia", code: "ENS-ABCD-2345", issuedAt: "2026-11-12T10:00:00.000Z", style: "Midnight" };

describe("certificate PDF", () => {
  it("is a single A4 landscape page", async () => {
    const pdf = await PDFDocument.load(await buildCertificatePdf(PNG, "png", details));
    expect(pdf.getPageCount()).toBe(1);
    const { width, height } = pdf.getPage(0).getSize();
    expect(Math.round(width)).toBe(842);
    expect(Math.round(height)).toBe(595);
    expect(width / height).toBeCloseTo(1414 / 1000, 2);
    expect(A4_LANDSCAPE.width).toBeCloseTo(297 * 72 / 25.4, 1);
  });

  it("carries the learner, course, issuer and certificate ID", async () => {
    const pdf = await PDFDocument.load(await buildCertificatePdf(PNG, "png", details));
    expect(pdf.getTitle()).toBe("Certificate of completion: Brand design sprint");
    expect(pdf.getAuthor()).toBe("Blossom Affia");
    expect(pdf.getSubject()).toContain("Ada Obi");
    expect(pdf.getKeywords()).toContain("ENS-ABCD-2345");
  });

  it("names the file after the image", () => {
    expect(pdfFilename("enski-certificate-course-1.png")).toBe("enski-certificate-course-1.pdf");
  });
});
