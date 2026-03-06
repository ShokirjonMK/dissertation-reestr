import Link from "next/link";
import { PropsWithChildren, useMemo, useState } from "react";

import { clearToken } from "@/store/auth";
import { useThemeMode } from "@/store/theme";

type DashboardLayoutProps = PropsWithChildren<{
  title: string;
}>;

export default function DashboardLayout({ title, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { mode, toggleMode } = useThemeMode();

  const sidebarClass = useMemo(
    () => (collapsed ? "sidebar sidebar-collapsed" : "sidebar"),
    [collapsed],
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="btn ghost" onClick={() => setCollapsed((v) => !v)}>
          {collapsed ? "Show Menu" : "Hide Menu"}
        </button>
        <h1>{title}</h1>
        <div className="topbar-actions">
          <button className="btn ghost" onClick={toggleMode}>
            {mode === "dark" ? "Light" : "Dark"} mode
          </button>
          <button
            className="btn danger"
            onClick={() => {
              clearToken();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="content-shell">
        <aside className={sidebarClass}>
          <nav>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/dissertations">Dissertations</Link>
          </nav>
        </aside>
        <main className="main-content">{children}</main>
      </div>

      <footer className="footer">Dissertation Registry System - Ministry Justice Workflow</footer>
    </div>
  );
}
