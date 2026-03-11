/**
 * DashboardLayout — Asosiy panel layout
 *
 * Yangiliklar:
 * - Ko'p tilli menyular (i18n)
 * - Til tanlash (uz/ru/en)
 * - Kataloglar bo'limiga navigatsiya
 * - Mobil responsive sidebar (hamburger menu)
 * - Aktiv link ko'rsatish
 * - Collapsible sidebar (desktop)
 */
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FilePlus2,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCog,
  Globe,
  BookOpen,
  University,
  MapPin,
  MapPinned,
  ChevronDown,
  ChevronRight,
  X,
  GraduationCap,
} from "lucide-react";
import { PropsWithChildren, ReactNode, useState } from "react";

import RightWidgets from "@/components/dashboard/RightWidgets";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { useI18n, type Lang } from "@/lib/i18n";

type DashboardLayoutProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  rightPanel?: ReactNode;
}>;

const LANG_LABELS: Record<Lang, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

export default function DashboardLayout({ title, subtitle, rightPanel, children }: DashboardLayoutProps) {
  const router = useRouter();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const logout = useAuthStore((state) => state.logout);
  const currentUser = useAuthStore((state) => state.user);
  const { t, lang, setLang } = useI18n();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [catalogsOpen, setCatalogsOpen] = useState(
    router.pathname.startsWith("/dashboard/catalogs")
  );

  const canCreateDissertation =
    currentUser?.role.name === "admin" || currentUser?.role.name === "doctorant";
  const isAdmin = currentUser?.role.name === "admin";

  const isActive = (path: string) =>
    router.pathname === path || router.pathname.startsWith(path + "/");

  const navLinkClass = (path: string) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out hover:bg-primary/10 ${
      isActive(path)
        ? "bg-primary/15 text-primary font-medium"
        : "text-foreground/80 hover:text-foreground"
    }`;

  const sidebarContent = (collapsed: boolean) => (
    <nav className="grid gap-0.5">
      {/* Dashboard */}
      <Link href="/dashboard" className={navLinkClass("/dashboard")}>
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{t("nav.dashboard")}</span>}
      </Link>

      {/* Dissertatsiyalar */}
      <Link href="/dashboard/dissertations" className={navLinkClass("/dashboard/dissertations")}>
        <ListFilter className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{t("nav.dissertations")}</span>}
      </Link>

      {/* Yangi dissertatsiya */}
      {canCreateDissertation && (
        <Link
          href="/dashboard/dissertations/new"
          className={navLinkClass("/dashboard/dissertations/new")}
        >
          <FilePlus2 className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t("dissertation.addNew")}</span>}
        </Link>
      )}

      {/* Foydalanuvchilar */}
      {isAdmin && (
        <Link href="/dashboard/users" className={navLinkClass("/dashboard/users")}>
          <UserCog className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t("nav.users")}</span>}
        </Link>
      )}

      {/* Kataloglar (admin) */}
      {isAdmin && (
        <>
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCatalogsOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-primary/10 hover:text-foreground"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>{t("nav.catalogs")}</span>
              </div>
              {catalogsOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          )}

          {(catalogsOpen || collapsed) && (
            <div className={!collapsed ? "ml-3 grid gap-0.5 border-l border-border/50 pl-3" : "grid gap-0.5"}>
              <Link
                href="/dashboard/catalogs/countries"
                className={navLinkClass("/dashboard/catalogs/countries")}
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.countries")}</span>}
              </Link>
              <Link
                href="/dashboard/catalogs/directions"
                className={navLinkClass("/dashboard/catalogs/directions")}
              >
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.directions")}</span>}
              </Link>
              <Link
                href="/dashboard/catalogs/universities"
                className={navLinkClass("/dashboard/catalogs/universities")}
              >
                <University className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.universities")}</span>}
              </Link>
              <Link
                href="/dashboard/catalogs/regions"
                className={navLinkClass("/dashboard/catalogs/regions")}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.regions")}</span>}
              </Link>
              <Link
                href="/dashboard/catalogs/districts"
                className={navLinkClass("/dashboard/catalogs/districts")}
              >
                <MapPinned className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.districts")}</span>}
              </Link>
            </div>
          )}
        </>
      )}

      {/* Foydalanuvchi nomi */}
      {!collapsed && currentUser && (
        <div className="mt-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs">
          <p className="font-medium truncate">{currentUser.username}</p>
          <p className="text-muted-foreground capitalize">
            {t(`role.${currentUser.role.name}` as Parameters<typeof t>[0]) || currentUser.role.name}
          </p>
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(74,144,226,0.22),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,144,226,0.25),transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.28),rgba(0,0,0,0))]">

      {/* Mobil sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobil sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-border/60 p-4 transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Registry</span>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {sidebarContent(false)}
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 glass">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mobil hamburger */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Desktop sidebar toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="hidden lg:flex"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {title && (
              <div>
                <h1 className="text-xl font-medium tracking-tight leading-none">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Til tanlash */}
            <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-white/50 p-0.5 dark:bg-slate-900/45">
              {(["uz", "ru", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    lang === l
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>

            {/* Dark mode toggle */}
            <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-white/50 px-2 py-1 dark:bg-slate-900/45">
              <Sun className="h-3.5 w-3.5" />
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} className="scale-90" />
              <Moon className="h-3.5 w-3.5" />
            </div>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                void router.push("/login");
              }}
              className="gap-1.5 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("auth.logout")}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main area */}
      <div className="mx-auto w-full max-w-[1680px] px-4 pb-4">
        <div className="mt-4 flex gap-4">
          {/* Desktop Sidebar */}
          <aside
            className="glass hidden h-[calc(100vh-8.5rem)] shrink-0 overflow-y-auto overflow-x-hidden rounded-xl p-3 transition-all duration-300 ease-out lg:block"
            style={{ width: sidebarCollapsed ? 56 : 240 }}
          >
            {sidebarContent(sidebarCollapsed)}
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1">{children}</main>

          {/* Right panel */}
          <aside className="hidden w-[300px] shrink-0 xl:block">
            {rightPanel || <RightWidgets />}
          </aside>
        </div>
      </div>

      <footer className="mx-auto mt-2 w-full max-w-[1680px] px-4 pb-4 text-xs text-muted-foreground">
        Dissertation Registry System v2.0 © 2026
      </footer>
    </div>
  );
}
