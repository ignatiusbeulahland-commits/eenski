import {
  Activity, Award, BarChart3, Banknote, Bell, BookOpen, BookOpenText, Bookmark, CalendarCheck, CalendarDays, Coins, Download, Eye,
  FileText, GraduationCap, History, Landmark, LayoutGrid, LifeBuoy, LineChart, Library, Link2, Lock, Megaphone, MessageSquareText,
  MonitorPlay, MousePointerClick, Network, Percent, Plug, LockKeyhole, CalendarClock, Package, PackageSearch, Play, Receipt, ReceiptText, Settings, Share2, ShieldCheck, ShoppingBag,
  ShoppingCart, SquarePlay, Globe2, Store, Target, Trophy, UserCheck, UserPen, UserPlus, UserRound, Users, UsersRound, Wallet, Wrench,
  type LucideIcon,
} from "lucide-react";
import analytics from "@/assets/dashboard/icons/enski-analytics.webp.asset.json";
import wallet from "@/assets/dashboard/icons/enski-wallet.webp.asset.json";
import book from "@/assets/dashboard/icons/enski-ebook.webp.asset.json";
import trophy from "@/assets/dashboard/icons/enski-trophy.webp.asset.json";
import video from "@/assets/dashboard/icons/enski-video.webp.asset.json";
import market from "@/assets/dashboard/icons/enski-market.webp";
import affiliations from "@/assets/dashboard/icons/enski-affiliations.webp";
import people from "@/assets/dashboard/icons/enski-people.webp";
import receipt from "@/assets/dashboard/icons/enski-receipt.webp";
import cash from "@/assets/dashboard/icons/enski-cash.webp";
import calendar from "@/assets/dashboard/icons/enski-calendar.webp";
import pkg from "@/assets/dashboard/icons/enski-package.webp";
import target from "@/assets/dashboard/icons/enski-target.webp";
import click from "@/assets/dashboard/icons/enski-click.webp";
import overview from "@/assets/dashboard/icons/enski-overview.webp";
import settings from "@/assets/dashboard/icons/enski-settings.webp";
import profile from "@/assets/dashboard/icons/enski-profile.webp";
import bank from "@/assets/dashboard/icons/enski-bank.webp";
import shield from "@/assets/dashboard/icons/enski-shield.webp";
import bell from "@/assets/dashboard/icons/enski-bell.webp";
import lock from "@/assets/dashboard/icons/enski-lock.webp";
import help from "@/assets/dashboard/icons/enski-help.webp";
import megaphone from "@/assets/dashboard/icons/enski-megaphone.webp";
import bag from "@/assets/dashboard/icons/enski-bag.webp";
import chat from "@/assets/dashboard/icons/enski-chat.webp";
import wishlist from "@/assets/dashboard/icons/enski-wishlist.webp";
import views from "@/assets/dashboard/icons/enski-views.webp";
import graduate from "@/assets/dashboard/icons/enski-graduate.webp";
import rating from "@/assets/dashboard/icons/enski-rating.webp";
import payout from "@/assets/dashboard/icons/enski-payout.webp";
import conversion from "@/assets/dashboard/icons/enski-conversion.webp";
import sources from "@/assets/dashboard/icons/enski-sources.webp";
import pending from "@/assets/dashboard/icons/enski-pending.webp";
import success from "@/assets/dashboard/icons/enski-success.webp";
import plug from "@/assets/dashboard/icons/enski-plug.webp";
import globe from "@/assets/dashboard/icons/enski-global.webp";
import binArt from "@/assets/dashboard/icons/enski-bin.webp";
import archiveArt from "@/assets/dashboard/icons/enski-archive.webp";
import { cn } from "@/lib/utils";

export const brandArtwork = {
  analytics: analytics.url, wallet: wallet.url, book: book.url, trophy: trophy.url, video: video.url, market, affiliations,
  people, receipt, cash, calendar, package: pkg, target, click, overview, settings, profile, bank, shield, bell, lock, help,
  megaphone, bag, chat, wishlist, views, graduate, rating, payout, conversion, sources, pending, success, plug, globe,
  bin: binArt, archive: archiveArt,
};

/** Semantic line icon -> matching glossy 3D artwork. Icons without an entry stay as line icons. */
const pairs: [LucideIcon[], string][] = [
  [[Users, UsersRound, UserCheck, UserPlus, UserRound], people],
  [[Receipt, ReceiptText, History], receipt],
  [[Banknote, Coins], cash],
  [[CalendarDays, CalendarCheck, CalendarClock, MonitorPlay], calendar],
  [[Package, PackageSearch, Wrench], pkg],
  [[Target], target],
  [[Percent], conversion],
  [[Network], sources],
  [[MousePointerClick], click],
  [[LayoutGrid], overview],
  [[Settings], settings],
  [[UserPen], profile],
  [[Landmark], bank],
  [[ShieldCheck], shield],
  [[Bell], bell],
  [[Lock, LockKeyhole], lock],
  [[Plug], plug],
  [[Globe2], globe],
  [[LifeBuoy], help],
  [[Megaphone, Share2], megaphone],
  [[ShoppingBag, ShoppingCart], bag],
  [[MessageSquareText], chat],
  [[Bookmark], wishlist],
  [[Eye], views],
  [[GraduationCap, Award], graduate],
  [[Store], market],
  [[Link2], affiliations],
  [[BarChart3, LineChart, Activity], analytics.url],
  [[Wallet], wallet.url],
  [[BookOpen, BookOpenText, Download, Library, FileText], book.url],
  [[Trophy], trophy.url],
  [[Play, SquarePlay], video.url],
];
export const iconArtwork = new Map<LucideIcon, string>(pairs.flatMap(([icons, src]) => icons.map((i) => [i, src] as const)));

export function BrandIcon({ src, className }: { src: string; className?: string | undefined }) {
  return <img src={src} alt="" aria-hidden="true" width={56} height={56} loading="lazy" decoding="async" className={cn("h-14 w-14 shrink-0 object-contain", className)} />;
}

/** Renders the 3D artwork for a line icon when one exists, otherwise the line icon itself. */
export function SemanticIcon({ icon: Icon, className, fallbackClassName }: { icon: LucideIcon; className?: string | undefined; fallbackClassName?: string | undefined }) {
  const src = iconArtwork.get(Icon);
  return src ? <BrandIcon src={src} className={className} /> : <Icon className={fallbackClassName} aria-hidden="true" />;
}
