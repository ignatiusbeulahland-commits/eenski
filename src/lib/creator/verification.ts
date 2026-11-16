/** Certificates a Creator has issued to their students, for the public /verify page. Browser-only. */
import { certificateCode, issuerDisplay } from "@/lib/shared/certificate";
import type { VerifiableCertificate } from "@/lib/shared/certificateVerify";
import { certificateEarned, courseOf } from "./products";
import { STORAGE_KEY } from "./data";
import { savedAccountValues } from "@/lib/dashboard/account";
import { stateSchema, type CreatorState } from "./rules";

/** One stable ID per student per course. */
export const issuedCertificateCode = (itemId: string, orderId: string) => certificateCode(`cert-${itemId}-${orderId}`);

export function creatorCertificateRecords(s: Pick<CreatorState, "items" | "orders" | "customers" | "profile">): VerifiableCertificate[] {
  const creatorName = `${s.profile.firstName} ${s.profile.lastName}`.trim();
  return s.items.filter((i) => i.kind === "course").flatMap((item) => {
    const course = courseOf(item);
    return s.orders
      .filter((o) => o.itemId === item.id && certificateEarned(o, course))
      .map((o): VerifiableCertificate => ({
        code: issuedCertificateCode(item.id, o.id),
        holder: s.customers.find((c) => c.id === o.customerId)?.name ?? "",
        title: item.title,
        issuer: issuerDisplay(course.certificate.design, creatorName),
        issuedAt: o.date,
        kind: "issued",
        design: course.certificate.design,
      }));
  });
}

/** Every creator account saved on this device (one per email), so /verify can check any of them. */
export function readCreatorCertificateRecords(): VerifiableCertificate[] {
  try {
    return savedAccountValues(STORAGE_KEY).flatMap((raw) => {
      const parsed = stateSchema.safeParse(JSON.parse(raw));
      return parsed.success ? creatorCertificateRecords(parsed.data) : [];
    });
  } catch {
    return [];
  }
}
