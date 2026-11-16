/**
 * A creator's certificate brand kit: logos, seal, artwork and authorised signatories,
 * saved on this device for the signed-in creator only (per email). Courses copy what
 * they use into their own certificate design, so issued certificates keep their look.
 */
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { accountStorageKey } from "@/lib/dashboard/account";

export const signatorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  title: z.string().max(60),
  org: z.string().max(60).default(""),
  image: z.string().default(""),
  scale: z.number().min(0.6).max(1.5).default(1),
  /** The creator confirmed they're authorised to use this signature. Not legal proof. */
  confirmedAt: z.string(),
});
export type Signatory = z.infer<typeof signatorySchema>;

export const brandKitSchema = z.object({
  orgLogo: z.string().default(""),
  creatorLogo: z.string().default(""),
  secondaryLogo: z.string().default(""),
  seal: z.string().default(""),
  artwork: z.string().default(""),
  signatories: z.array(signatorySchema).max(6).default([]),
});
export type BrandKit = z.infer<typeof brandKitSchema>;
export type BrandAsset = "orgLogo" | "creatorLogo" | "secondaryLogo" | "seal" | "artwork";
export const emptyBrandKit: BrandKit = brandKitSchema.parse({});

const BASE = "enski-creator-brand-kit";
const listeners = new Set<() => void>();
let cache: { key: string; raw: string | null; value: BrandKit } = { key: "", raw: null, value: emptyBrandKit };

function read(): BrandKit {
  if (typeof window === "undefined") return emptyBrandKit;
  const key = accountStorageKey(BASE);
  let raw: string | null = null;
  try { raw = window.localStorage.getItem(key); } catch { return emptyBrandKit; }
  if (key === cache.key && raw === cache.raw) return cache.value;
  let value = emptyBrandKit;
  try {
    const parsed = brandKitSchema.safeParse(raw ? JSON.parse(raw) : {});
    if (parsed.success) value = parsed.data;
  } catch { /* unreadable: start empty */ }
  cache = { key, raw, value };
  return value;
}

/** Saves the kit. Returns false when the device has no room left (large images). */
export function saveBrandKit(next: BrandKit): boolean {
  try {
    window.localStorage.setItem(accountStorageKey(BASE), JSON.stringify(next));
  } catch {
    return false;
  }
  listeners.forEach((l) => l());
  return true;
}

export function updateBrandKit(patch: (k: BrandKit) => BrandKit): boolean {
  return saveBrandKit(patch(read()));
}

export function useBrandKit(): BrandKit {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    read,
    () => emptyBrandKit,
  );
}

export const brandAssetInfo: Record<BrandAsset, { label: string; hint: string; trim: boolean; max: number }> = {
  orgLogo: { label: "Organisation logo", hint: "Main logo beside Enski's on every certificate.", trim: true, max: 600 },
  creatorLogo: { label: "Personal or creator logo", hint: "Your own mark, shown in the logo strip.", trim: true, max: 600 },
  secondaryLogo: { label: "Secondary organisation logo", hint: "A partner, school or sponsor logo.", trim: true, max: 600 },
  seal: { label: "Official organisation seal", hint: "Replaces the Enski seal when you choose it.", trim: true, max: 600 },
  artwork: { label: "Supporting credential artwork", hint: "A faint background image behind the text.", trim: false, max: 1400 },
};

/** Design fields a course copies from the kit when the creator applies it. */
export function kitDesignPatch(kit: BrandKit, main?: Signatory, second?: Signatory) {
  return {
    ...(kit.orgLogo ? { issuerLogo: kit.orgLogo } : {}),
    creatorLogo: kit.creatorLogo,
    secondaryLogo: kit.secondaryLogo,
    ...(kit.seal ? { sealImage: kit.seal, emblem: "custom" as const, showSeal: true } : {}),
    ...(kit.artwork ? { artwork: kit.artwork, background: "artwork" as const } : {}),
    ...(main ? { signatureImage: main.image, signatureScale: main.scale, signerRole: main.title, showSignature: true } : {}),
    ...(second
      ? { cosignName: second.name, cosignTitle: second.title, cosignOrg: second.org, cosignImage: second.image, cosignScale: second.scale }
      : { cosignName: "", cosignTitle: "", cosignOrg: "", cosignImage: "" }),
  };
}
