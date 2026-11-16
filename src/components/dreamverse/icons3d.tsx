import analytics from "@/assets/icons/analytics.webp";
import bell from "@/assets/icons/bell.webp";
import cart from "@/assets/icons/cart.webp";
import categories from "@/assets/icons/categories.webp";
import chat from "@/assets/icons/chat.webp";
import coupon from "@/assets/icons/coupon.webp";
import ebook from "@/assets/icons/ebook.webp";
import flame from "@/assets/icons/flame.webp";
import followup from "@/assets/icons/followup.webp";
import globe from "@/assets/icons/globe.webp";
import mail from "@/assets/icons/mail.webp";
import megaphone from "@/assets/icons/megaphone.webp";
import mic from "@/assets/icons/mic.webp";
import profile from "@/assets/icons/profile.webp";
import salespage from "@/assets/icons/salespage.webp";
import share from "@/assets/icons/share.webp";
import sliders from "@/assets/icons/sliders.webp";
import stars from "@/assets/icons/stars.webp";
import storefront from "@/assets/icons/storefront.webp";
import trophy from "@/assets/icons/trophy.webp";
import video from "@/assets/icons/video.webp";
import wallet from "@/assets/icons/wallet.webp";
import { cn } from "@/lib/utils";

// Glossy 3D brand icons (cobalt / sky with lime accents). Line icons are only for functional UI.
export const icons3d = {
  analytics,
  bell,
  cart,
  categories,
  chat,
  coupon,
  ebook,
  flame,
  followup,
  globe,
  mail,
  megaphone,
  mic,
  profile,
  salespage,
  share,
  sliders,
  stars,
  storefront,
  trophy,
  video,
  wallet,
} as const;

export type Icon3DName = keyof typeof icons3d;

export function Icon3D({
  name,
  className,
  eager = false,
}: {
  name: Icon3DName;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      src={icons3d[name]}
      alt=""
      aria-hidden
      width={256}
      height={256}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={cn("pointer-events-none select-none object-contain", className)}
    />
  );
}
