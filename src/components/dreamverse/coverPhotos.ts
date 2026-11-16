import type { CoverId } from "@/lib/dreamverse/covers";

import ai1 from "@/assets/dreamverse/covers/ai-1-800.webp";
import ai1s from "@/assets/dreamverse/covers/ai-1-480.webp";
import ai2 from "@/assets/dreamverse/covers/ai-2-800.webp";
import ai2s from "@/assets/dreamverse/covers/ai-2-480.webp";
import business from "@/assets/dreamverse/covers/business-800.webp";
import businessS from "@/assets/dreamverse/covers/business-480.webp";
import code1 from "@/assets/dreamverse/covers/code-1-800.webp";
import code1s from "@/assets/dreamverse/covers/code-1-480.webp";
import code2 from "@/assets/dreamverse/covers/code-2-800.webp";
import code2s from "@/assets/dreamverse/covers/code-2-480.webp";
import creative from "@/assets/dreamverse/covers/creative-800.webp";
import creativeS from "@/assets/dreamverse/covers/creative-480.webp";
import data from "@/assets/dreamverse/covers/data-800.webp";
import dataS from "@/assets/dreamverse/covers/data-480.webp";
import design from "@/assets/dreamverse/covers/design-800.webp";
import designS from "@/assets/dreamverse/covers/design-480.webp";
import devops from "@/assets/dreamverse/covers/devops-800.webp";
import devopsS from "@/assets/dreamverse/covers/devops-480.webp";
import education from "@/assets/dreamverse/covers/education-800.webp";
import educationS from "@/assets/dreamverse/covers/education-480.webp";
import finance from "@/assets/dreamverse/covers/finance-800.webp";
import financeS from "@/assets/dreamverse/covers/finance-480.webp";
import general from "@/assets/dreamverse/covers/general-800.webp";
import generalS from "@/assets/dreamverse/covers/general-480.webp";
import growth from "@/assets/dreamverse/covers/growth-800.webp";
import growthS from "@/assets/dreamverse/covers/growth-480.webp";
import lifestyle from "@/assets/dreamverse/covers/lifestyle-800.webp";
import lifestyleS from "@/assets/dreamverse/covers/lifestyle-480.webp";
import marketing from "@/assets/dreamverse/covers/marketing-800.webp";
import marketingS from "@/assets/dreamverse/covers/marketing-480.webp";
import mobile from "@/assets/dreamverse/covers/mobile-800.webp";
import mobileS from "@/assets/dreamverse/covers/mobile-480.webp";
import product from "@/assets/dreamverse/covers/product-800.webp";
import productS from "@/assets/dreamverse/covers/product-480.webp";

export interface CoverPhoto {
  src: string;
  small: string;
}

const p = (src: string, small: string): CoverPhoto => ({ src, small });

/** Brand-coloured, people-free desk photos (800w + 480w), one list per subject. */
export const COVER_PHOTOS: Record<CoverId, CoverPhoto[]> = {
  ai: [p(ai1, ai1s), p(ai2, ai2s)],
  code: [p(code1, code1s), p(code2, code2s)],
  data: [p(data, dataS)],
  mobile: [p(mobile, mobileS)],
  devops: [p(devops, devopsS)],
  product: [p(product, productS)],
  design: [p(design, designS)],
  marketing: [p(marketing, marketingS)],
  finance: [p(finance, financeS)],
  business: [p(business, businessS)],
  creative: [p(creative, creativeS)],
  growth: [p(growth, growthS)],
  lifestyle: [p(lifestyle, lifestyleS)],
  education: [p(education, educationS)],
  general: [p(general, generalS)],
};
