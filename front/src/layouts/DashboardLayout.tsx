import Link from "next/link";
import { useRouter } from "next/router";
import { FilePlus2, LayoutDashboard, ListFilter, LogOut, Menu, Moon, Sun, UserCog } from "lucide-react";
import { PropsWithChildren, ReactNode } from "react";

import RightWidgets from "@/components/dashboard/RightWidgets";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth-store";
import { useUiStore } from "@/store/ui-store";

type DashboardLayoutProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightPanel?: ReactNode;
}>;

export default function DashboardLayout({ title, subtitle, rightPanel, children }: DashboardLayoutProps) {
  const router = useRouter();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const logout = useAuthStore((state) => state.logout);
  const currentUser = useAuthStore((state) => state.user);
  const canCreateDissertation = currentUser?.role.name === "admin" || currentUser?.role.name === "doctorant";
  const isAdmin = currentUser?.role.name === "admin";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(74,144,226,0.22),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_top_right,rgba(74,144,226,0.25),transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.28),rgba(0,0,0,0))]">
      <header className="sticky top-0 z-30 border-b border-border/60 glass">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={toggleSidebar}>
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
              {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-white/50 px-2 py-1 dark:bg-slate-900/45">
              <Sun className="h-4 w-4" />
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              <Moon className="h-4 w-4" />
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                void router.push("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1680px] px-4 pb-4 lg:min-w-[1280px]">
        <div className="mt-4 flex gap-4">
          <aside
            className="glass h-[calc(100vh-8.5rem)] shrink-0 overflow-hidden rounded-xl p-3 transition-all duration-300 ease-out"
            style={{ width: sidebarCollapsed ? 88 : 260 }}
          >
            <nav className="grid gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300 ease-out hover:bg-primary/10"
              >
                <LayoutDashboard className="h-4 w-4" />
                {!sidebarCollapsed ? "Dashboard" : null}
              </Link>
              <Link
                href="/dashboard/dissertations"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300 ease-out hover:bg-primary/10"
              >
                <ListFilter className="h-4 w-4" />
                {!sidebarCollapsed ? "Dissertations" : null}
              </Link>
              {canCreateDissertation ? (
                <Link
                  href="/dashboard/dissertations/new"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300 ease-out hover:bg-primary/10"
                >
                  <FilePlus2 className="h-4 w-4" />
                  {!sidebarCollapsed ? "Add Dissertation" : null}
                </Link>
              ) : null}
              {isAdmin ? (
                <Link
                  href="/dashboard/users"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-300 ease-out hover:bg-primary/10"
                >
                  <UserCog className="h-4 w-4" />
                  {!sidebarCollapsed ? "Users" : null}
                </Link>
              ) : null}
            </nav>
          </aside>

          <main className="grid flex-1 gap-4">{children}</main>

          <aside className="hidden w-[320px] xl:block">{rightPanel || <RightWidgets />}</aside>
        </div>
      </div>

      <footer className="mx-auto mt-4 w-full max-w-[1680px] px-4 pb-4 text-xs text-muted-foreground">
        Dissertation Registry System | Header / Sidebar / Main / Right Panel / Footer
      </footer>
    </div>
  );
}
