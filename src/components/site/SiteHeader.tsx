import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  CircleHelp,
  Info,
  LayoutGrid,
  Menu,
  Newspaper,
  Tag,
  Users,
  X,
} from "lucide-react";
import logoLime from "@/assets/enski-logo-lime.webp";
import logoWhite from "@/assets/enski-logo-white.webp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DuoIcon } from "./DuoIcon";
import { links, mainNav, type NavItem } from "./data";
import { ThemeToggle } from "./ThemeToggle";
import { useDemoProfile } from "@/lib/demo/profile";
import { DemoProfileMenu, DemoProfilePanel } from "./DemoProfileMenu";
import { ShopButtons } from "@/components/shop/ShopButtons";

const childIcons: Record<string, typeof LayoutGrid> = {
  Features: LayoutGrid,
  Pricing: Tag,
  Community: Users,
  Blog: Newspaper,
  "About Us": Info,
  FAQ: CircleHelp,
};

/** A local link is current on its own page and any page under it (e.g. /blog and /blog/an-article). */
const isOn = (href: string | undefined, pathname: string) =>
  !!href && href.startsWith("/") && !href.includes("#") &&
  (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

function Dropdown({
  item,
  open,
  onOpen,
  onClose,
}: {
  item: NavItem;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const timer = useRef<number | undefined>(undefined);
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const isCurrent = (c: { href: string }) => isOn(c.href, pathname);
  const active = item.children?.some(isCurrent);
  const id = `menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`;

  const enter = () => {
    window.clearTimeout(timer.current);
    onOpen();
  };
  const leave = () => {
    timer.current = window.setTimeout(onClose, 140);
  };

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? onClose() : onOpen())}
        className={cn(
          "inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-full px-3 text-[15px] font-semibold transition-colors",
          open || active
            ? "bg-primary-foreground/12 text-primary-foreground"
            : "text-on-blue hover:bg-primary-foreground/10 hover:text-primary-foreground",
        )}
      >
        {item.label}
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div
        id={id}
        className={cn(
          "absolute left-1/2 top-full z-(--z-overlay) w-[320px] -translate-x-1/2 pt-3 transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <ul className="rounded-3xl border border-line bg-popover p-2 shadow-float">
          {item.children?.map((c) => {
            const Icon = childIcons[c.label] ?? LayoutGrid;
            const current = isCurrent(c);
            return (
              <li key={c.label}>
                <a
                  href={c.href}
                  aria-current={current ? "page" : undefined}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-soft",
                    current && "bg-soft",
                  )}
                >
                  <DuoIcon icon={Icon} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-ink group-hover:text-brand">
                      {c.label}
                    </span>
                    <span className="block text-[13px] text-muted-foreground">{c.description}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** `solid` keeps the bar cobalt from the top, for pages that open on a light background. */
export function SiteHeader({ solid = false }: { solid?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>("Resources");
  const navRef = useRef<HTMLElement>(null);
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const profile = useDemoProfile();
  const isCurrent = (c: { href: string }) => isOn(c.href, pathname);

  useEffect(() => {
    // Clear only while resting at the very top; anywhere else (incl. scrolling back up) the bar is solid.
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on Escape or a click outside the nav
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

  // Mobile menu: lock page scroll, close on Escape or when the screen grows to desktop
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 1280px)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "inset-x-0 top-0 z-(--z-overlay) transition-[background-color,box-shadow] duration-200",
        solid ? "sticky" : "fixed",
        solid || scrolled || open ? "bg-cobalt shadow-float" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-4 px-5">
        <a href="/" aria-label="Enski home" className="shrink-0">
          <img src={logoWhite} alt="Enski" width={288} height={106} className="h-8 w-auto dark:hidden" />
            <img src={logoLime} alt="Enski" width={288} height={106} className="hidden h-8 w-auto dark:block" />
        </a>

        <nav ref={navRef} aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {mainNav.map((item) =>
            item.children ? (
              <Dropdown
                key={item.label}
                item={item}
                open={menu === item.label}
                onOpen={() => setMenu(item.label)}
                onClose={() => setMenu((m) => (m === item.label ? null : m))}
              />
            ) : (
              <a
                key={item.label}
                href={item.href}
                aria-current={isOn(item.path, pathname) ? "page" : undefined}
                className="inline-flex h-10 items-center whitespace-nowrap rounded-full px-3 text-[15px] font-semibold text-on-blue transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground aria-[current=page]:bg-primary-foreground/12 aria-[current=page]:text-lime"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-0.5">
          {/* One set of shop buttons for every screen size, so the cart panel only exists once. */}
          <ShopButtons wishlistClassName="xl:hidden min-[1400px]:grid" />
          <ThemeToggle />
          {profile ? (
            <DemoProfileMenu profile={profile} className="hidden xl:inline-flex" />
          ) : (
            <div className="hidden items-center gap-0.5 xl:flex">
              <Button asChild variant="ghost-light" size="sm" className="ml-1">
                <a href={links.login}>Log In</a>
              </Button>
              <Button asChild variant="lime" size="sm">
                <a href={links.register}>Register</a>
              </Button>
            </div>
          )}
          <Button
            variant="ghost-light"
            size="icon"
            className="xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t border-primary-foreground/10 px-5 pb-6 pt-2 xl:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {mainNav.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    type="button"
                    aria-expanded={mobileSection === item.label}
                    onClick={() =>
                      setMobileSection((s) => (s === item.label ? null : item.label))
                    }
                    className="flex w-full items-center justify-between rounded-2xl px-3 py-3.5 text-lg font-bold text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    {item.label}
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-5 transition-transform",
                        mobileSection === item.label && "rotate-180",
                      )}
                    />
                  </button>
                  {mobileSection === item.label && (
                    <ul className="mb-2 ml-3 border-l border-primary-foreground/15 pl-3">
                      {item.children.map((c) => (
                        <li key={c.label}>
                          <a
                            href={c.href}
                            onClick={() => setOpen(false)}
                            aria-current={isCurrent(c) ? "page" : undefined}
                            className={cn(
                              "flex min-h-11 items-center rounded-xl px-3 text-base font-semibold hover:bg-primary-foreground/10",
                              isCurrent(c) ? "text-lime" : "text-on-blue",
                            )}
                          >
                            {c.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isOn(item.path, pathname) ? "page" : undefined}
                  className="rounded-2xl px-3 py-3.5 text-lg font-bold text-primary-foreground hover:bg-primary-foreground/10 aria-[current=page]:text-lime"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          {profile ? (
            <DemoProfilePanel profile={profile} onDone={() => setOpen(false)} />
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button asChild variant="outline-light">
                <a href={links.login}>Log In</a>
              </Button>
              <Button asChild variant="lime">
                <a href={links.register}>Register</a>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
