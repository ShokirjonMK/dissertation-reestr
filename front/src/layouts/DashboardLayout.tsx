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
 * - Global qidiruv (real-time)
 * - Bildirishnomalar paneli
 * - Foydalanuvchi profil dropdown
 */
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Bell,
  BotMessageSquare,
  BookOpen,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FilePlus2,
  GraduationCap,
  Globe,
  LayoutDashboard,
  ListFilter,
  LogOut,
  MapPin,
  MapPinned,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  University,
  User2,
  UserCog,
  X,
} from "lucide-react";
import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import RightWidgets from "@/components/dashboard/RightWidgets";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";
import { useI18n, type Lang } from "@/lib/i18n";
import { fetchDissertations } from "@/services/api";
import type { Dissertation } from "@/types";

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "hozir";
  if (m < 60) return `${m} daq oldin`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

// ─── Global Search ─────────────────────────────────────────────────────────────
function GlobalSearch() {
  const router = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results } = useQuery({
    queryKey: ["global-search", debouncedQuery],
    queryFn: () => fetchDissertations({ query: debouncedQuery, limit: 5 } as never),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const statusColor: Record<string, string> = {
    pending: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
    approved: "text-green-600 bg-green-50 dark:bg-green-900/20",
    rejected: "text-red-600 bg-red-50 dark:bg-red-900/20",
    defended: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    draft: "text-gray-600 bg-gray-50 dark:bg-gray-900/20",
  };

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("common.search") + "..."}
          className="h-8 w-[200px] rounded-lg border border-border/50 bg-white/60 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 dark:bg-slate-900/40 transition-all focus:w-[260px]"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setOpen(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {open && debouncedQuery.trim().length >= 2 && (
        <div className="absolute left-0 top-10 z-50 w-[320px] rounded-xl border border-border/60 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-slate-900/95">
          {!results || results.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {t("common.noData")}
            </p>
          ) : (
            <ul className="py-1">
              {results.slice(0, 6).map((d: Dissertation) => (
                <li key={d.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      void router.push(`/dashboard/dissertations/${d.id}`);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">{d.author_name}</p>
                    </div>
                    <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${statusColor[d.status] ?? ""}`}>
                      {d.status}
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-t border-border/40 px-3 py-2">
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    void router.push(`/dashboard/dissertations?query=${encodeURIComponent(debouncedQuery)}`);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  Barcha natijalarni ko&apos;rish →
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Notifications ─────────────────────────────────────────────────────────────
function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  const { data: pending } = useQuery({
    queryKey: ["notifications-pending"],
    queryFn: () => fetchDissertations({ status: "pending" } as never),
    staleTime: 60000,
  });

  const notifications = (pending ?? []).slice(0, 6);
  const unreadCount = notifications.filter((d) => !readIds.has(d.id)).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((d) => d.id)));
  }, [notifications]);

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-white/60 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground dark:bg-slate-900/40"
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[320px] rounded-xl border border-border/60 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-slate-900/95">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-2.5">
            <span className="text-sm font-medium">Bildirishnomalar</span>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs text-primary hover:underline">
                Hammasini o&apos;qildi
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">Bildirishnoma yo&apos;q</p>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto py-1">
              {notifications.map((d) => (
                <li key={d.id} className={`${!readIds.has(d.id) ? "bg-primary/3" : ""}`}>
                  <Link
                    href={`/dashboard/dissertations/${d.id}`}
                    onClick={() => {
                      setReadIds((prev) => new Set([...prev, d.id]));
                      setOpen(false);
                    }}
                    className="flex items-start gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <Bell className="h-3.5 w-3.5 text-yellow-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.author_name} · {timeAgo(d.created_at)}
                      </p>
                    </div>
                    {!readIds.has(d.id) && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border/40 px-4 py-2">
            <Link
              href="/dashboard/dissertations?status=pending"
              onClick={() => setOpen(false)}
              className="text-xs text-primary hover:underline"
            >
              Barcha ko&apos;rib chiqilayotganlarni ko&apos;rish →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── User Profile ──────────────────────────────────────────────────────────────
function UserProfileButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { t } = useI18n();
  const currentUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = currentUser?.username?.[0]?.toUpperCase() ?? "U";

  return (
    <div ref={dropRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[220px] rounded-xl border border-border/60 bg-white/95 shadow-lg backdrop-blur-sm dark:bg-slate-900/95">
          <div className="border-b border-border/40 px-4 py-3">
            <p className="font-medium text-sm">{currentUser?.username}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {t(`role.${currentUser?.role.name}` as Parameters<typeof t>[0]) ?? currentUser?.role.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{currentUser?.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-primary/5 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              {t("nav.settings")}
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                void router.push("/login");
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("auth.logout")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Layout ───────────────────────────────────────────────────────────────
export default function DashboardLayout({ title, subtitle, rightPanel, children }: DashboardLayoutProps) {
  const router = useRouter();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const currentUser = useAuthStore((state) => state.user);
  const { t, lang, setLang } = useI18n();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [catalogsOpen, setCatalogsOpen] = useState(
    router.pathname.startsWith("/dashboard/catalogs")
  );

  const canCreateDissertation =
    currentUser?.role.name === "admin" || currentUser?.role.name === "doctorant";
  const isAdmin = currentUser?.role.name === "admin";
  const roleName = currentUser?.role.name;
  const canMyProposalsNav =
    roleName === "doctorant" ||
    roleName === "supervisor" ||
    roleName === "employee" ||
    roleName === "moderator" ||
    roleName === "admin";
  const canReviewerProposalsNav =
    roleName === "employee" || roleName === "moderator" || roleName === "admin";

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

      {/* AI Yordamchi */}
      <Link href="/dashboard/ai" className={navLinkClass("/dashboard/ai")}>
        <BotMessageSquare className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{t("nav.ai")}</span>}
      </Link>

      <Link href="/dashboard/search/problems" className={navLinkClass("/dashboard/search/problems")}>
        <Search className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Muammo/taklif qidiruvi</span>}
      </Link>

      {canMyProposalsNav && (
        <Link href="/dashboard/proposals" className={navLinkClass("/dashboard/proposals")}>
          <FileCheck className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Takliflar</span>}
        </Link>
      )}

      {canReviewerProposalsNav && (
        <Link href="/dashboard/admin/proposals" className={navLinkClass("/dashboard/admin/proposals")}>
          <ClipboardList className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Takliflar (ko&apos;rib chiqish)</span>}
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
              <Link href="/dashboard/catalogs/countries" className={navLinkClass("/dashboard/catalogs/countries")}>
                <Globe className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.countries")}</span>}
              </Link>
              <Link href="/dashboard/catalogs/directions" className={navLinkClass("/dashboard/catalogs/directions")}>
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.directions")}</span>}
              </Link>
              <Link href="/dashboard/catalogs/universities" className={navLinkClass("/dashboard/catalogs/universities")}>
                <University className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.universities")}</span>}
              </Link>
              <Link href="/dashboard/catalogs/regions" className={navLinkClass("/dashboard/catalogs/regions")}>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.regions")}</span>}
              </Link>
              <Link href="/dashboard/catalogs/districts" className={navLinkClass("/dashboard/catalogs/districts")}>
                <MapPinned className="h-3.5 w-3.5 shrink-0" />
                {!collapsed && <span className="text-xs">{t("nav.districts")}</span>}
              </Link>
            </div>
          )}
        </>
      )}

      {/* Sozlamalar */}
      <Link href="/dashboard/settings" className={navLinkClass("/dashboard/settings")}>
        <Settings className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{t("nav.settings")}</span>}
      </Link>

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
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex items-center gap-3">
            {/* Mobil hamburger */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-8 w-8 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Desktop sidebar toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSidebar}
              className="hidden h-8 w-8 lg:flex"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {title && (
              <div>
                <h1 className="text-lg font-medium tracking-tight leading-none">{title}</h1>
                {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Global qidiruv */}
            <GlobalSearch />

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

            {/* Bildirishnomalar */}
            <NotificationsPanel />

            {/* Foydalanuvchi profili */}
            <UserProfileButton />
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

      <footer className="mx-auto mt-2 w-full max-w-[1680px] px-4 pb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Dissertation Registry System v2.0 © 2026</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Tizim ishlayapti
        </span>
      </footer>
    </div>
  );
}
