import { useState, type FormEvent } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { ArrowLeft, Award, Bell, BookOpen, FileBadge2, Flag, LayoutDashboard, LifeBuoy, LogOut, Menu, Receipt, Settings, ShieldCheck, Users, Wallet, X } from "lucide-react";
import logoWhite from "@/assets/enski-logo-white.webp";
import { Button } from "@/components/dashboard-ui/button";
import { Input } from "@/components/dashboard-ui/input";
import { Label } from "@/components/dashboard-ui/label";
import { adminStore } from "@/lib/admin/store";
import { adminSession, useAdminSession } from "@/lib/admin/session";
import { validEmail } from "@/lib/shared/credentials";
import { useDeviceData, useNotifications } from "./data";

/** Admin console frame: midnight sidebar on desktop, top bar + menu on phones; sign-in screen when signed out. */
export function AdminShell() {
  const me = useAdminSession();
  const [menu, setMenu] = useState(false);
  const data = useDeviceData();
  const notes = useNotifications(data);
  const reports = (adminStore.use().reports ?? []).filter((r) => r.status === "open").length;
  if (!me) return <AdminSignIn />;

  const links = [
    { label: "Overview", to: "/admin", Icon: LayoutDashboard, count: 0 },
    { label: "Accounts", to: "/admin/accounts", Icon: Users, count: 0 },
    { label: "Courses & products", to: "/admin/courses", Icon: BookOpen, count: 0 },
    { label: "Certificates", to: "/admin/certificates", Icon: FileBadge2, count: 0 },
    { label: "Badges", to: "/admin/badges", Icon: Award, count: 0 },
    { label: "Transactions", to: "/admin/transactions", Icon: Receipt, count: 0 },
    { label: "Payouts", to: "/admin/payouts", Icon: Wallet, count: data?.payouts.filter((p) => p.status === "processing").length ?? 0 },
    { label: "Notifications", to: "/admin/notifications", Icon: Bell, count: notes.unread },
    { label: "Support requests", to: "/admin/support", Icon: LifeBuoy, count: 0 },
    { label: "Page reports", to: "/admin/reports", Icon: Flag, count: reports },
    { label: "Settings", to: "/admin/settings", Icon: Settings, count: 0 },
  ] as const;

  const nav = (
    <nav aria-label="Admin" className="grid gap-1">
      {links.map(({ label, to, Icon, count }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setMenu(false)}
          activeOptions={{ exact: to === "/admin" }}
          activeProps={{ className: "bg-cobalt text-on-dark shadow-float" }}
          inactiveProps={{ className: "text-on-dark-muted hover:bg-on-dark/10 hover:text-on-dark" }}
          className="flex items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-sm font-bold transition-colors"
        >
          <Icon className="size-[18px]" aria-hidden="true" />
          {label}
          {count > 0 && <span className="ml-auto rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold text-midnight">{count}</span>}
        </Link>
      ))}
    </nav>
  );
  const footer = (
    <div className="space-y-2">
      <div className="rounded-[14px] bg-on-dark/10 px-3.5 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-dark-muted">Signed in as</p>
        <p className="truncate text-sm font-extrabold text-on-dark">{me.name}</p>
        <p className="truncate text-xs text-on-dark-muted">{me.email}</p>
      </div>
      <button type="button" onClick={() => adminSession.signOut()} className="flex w-full items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-sm font-bold text-on-dark-muted hover:bg-on-dark/10 hover:text-on-dark">
        <LogOut className="size-4" aria-hidden="true" /> Sign out
      </button>
      <Link to="/" className="flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-sm font-bold text-on-dark-muted hover:bg-on-dark/10 hover:text-on-dark">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to website
      </Link>
    </div>
  );
  const brand = (
    <div className="flex items-center gap-2.5">
      <img src={logoWhite} alt="Enski" width={288} height={106} className="h-7 w-auto" />
      <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-midnight">Admin</span>
    </div>
  );
  return (
    <div data-skin="dashboard" className="min-h-screen bg-soft text-ink lg:grid lg:grid-cols-[268px_minmax(0,1fr)]">
      <aside data-surface="dark" className="hidden flex-col justify-between gap-6 overflow-y-auto bg-midnight p-5 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="space-y-7">{brand}{nav}</div>
        {footer}
      </aside>
      <header data-surface="dark" className="sticky top-0 z-(--z-sticky) flex items-center justify-between gap-3 bg-midnight px-4 py-3 lg:hidden">
        {brand}
        <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={menu ? "Close menu" : "Open menu"} className="grid size-10 place-items-center rounded-full text-on-dark hover:bg-on-dark/10">
          {menu ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      {menu && (
        <div data-surface="dark" className="sticky top-16 z-(--z-sticky) max-h-[calc(100dvh-4rem)] space-y-6 overflow-y-auto border-t border-on-dark/10 bg-midnight px-4 pb-5 pt-3 lg:hidden">
          {nav}{footer}
        </div>
      )}
      <div className="min-w-0">
        <main id="main-content" tabIndex={-1} className="screen-in mx-auto max-w-[1280px] p-4 outline-none sm:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminSignIn() {
  const [error, setError] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") ?? "");
    const email = String(f.get("email") ?? "");
    const pw = String(f.get("password") ?? "");
    if (!name.trim()) return setError("Enter your name");
    if (!validEmail(email)) return setError("Enter your work email address");
    if (pw.length < 6) return setError("Enter your password (at least 6 characters)");
    adminSession.signIn(name, email);
  };
  return (
    <div data-skin="dashboard" className="grid min-h-screen place-items-center bg-midnight p-4">
      <div className="screen-in w-full max-w-md overflow-hidden rounded-[28px] bg-card shadow-card">
        <div data-surface="dark" className="bg-brand-panel px-7 pb-7 pt-8">
          <div className="flex items-center gap-2.5">
            <img src={logoWhite} alt="Enski" width={288} height={106} className="h-7 w-auto" />
            <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-midnight">Admin</span>
          </div>
          <h1 className="mt-6 text-2xl font-extrabold text-on-dark">Sign in to Enski admin</h1>
          <p className="mt-1 text-sm text-on-dark-muted">For the Enski team: accounts, courses, credentials, money and support in one place.</p>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4 p-7">
          <div className="grid gap-1.5"><Label htmlFor="ad-name">Your name</Label><Input id="ad-name" name="name" autoComplete="name" placeholder="e.g. Kemi Adeyemi" /></div>
          <div className="grid gap-1.5"><Label htmlFor="ad-email">Work email</Label><Input id="ad-email" name="email" type="email" autoComplete="email" placeholder="you@enski.com" /></div>
          <div className="grid gap-1.5"><Label htmlFor="ad-pw">Password</Label><Input id="ad-pw" name="password" type="password" autoComplete="current-password" /></div>
          {error && <p role="alert" className="text-sm font-semibold text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full"><ShieldCheck aria-hidden="true" />Sign in</Button>
          <Link to="/" className="block text-center text-sm font-bold text-brand underline-offset-4 hover:underline">Back to website</Link>
        </form>
      </div>
    </div>
  );
}
